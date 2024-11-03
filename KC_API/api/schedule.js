//schedule.cjs

const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const mysql = require('mysql2/promise');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { connectToDatabase } = require('./db');
const authenticateToken = require('./middleware/authenticateToken.cjs');

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function connectWithTimeout() {
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000));
  return await Promise.race([connectToDatabase(), timeout]);
}

async function executeQuery(connection, query, params) {
  const [results] = await connection.query(query, params);
  return results;
}

function handleError(res, error, message) {
  console.error(message, error);
  res.status(500).json({ error: message + error.message });
}

const formatTime = (time) => {
  const [hoursMinutes, modifier] = time.split(' ');
  let [hours, minutes] = hoursMinutes.split(':').map(Number);

  if (modifier === 'PM' && hours < 12) {
    hours += 12;
  }
  if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
};

const calculateEndTime = (startTime, duration) => {
  const [hoursMinutes, modifier] = startTime.split(' ');
  let [hours, minutes] = hoursMinutes.split(':').map(Number);

  if (modifier === 'PM' && hours < 12) {
    hours += 12;
  }
  if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  const endTime = new Date();
  endTime.setHours(hours, minutes);
  endTime.setMinutes(endTime.getMinutes() + duration);

  const endHours = String(endTime.getHours()).padStart(2, '0');
  const endMinutes = String(endTime.getMinutes()).padStart(2, '0');

  return `${endHours}:${endMinutes}:00`;
};

const formatQuery = (query, values) => {
  return query.replace(/\?/g, () => {
      return `'${values.shift()}'`;
  });
};

const insertScheduleMain = async (connection, insertValues) => {
  const query = 'INSERT INTO schedulemain (accountId, eventId, day, startTime, endTime, selectedDate, isRepeat, isActive, createdBy, createdOn) VALUES (?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)';
  const formattedQuery = formatQuery(query, [...insertValues]); // Use a copy of insertValues to preserve the original array

  //console.log('Formatted Query:', formattedQuery);

  const [insertResult] = await connection.query(query, insertValues);

  //console.log('insertScheduleMainQuery', insertResult);
  return insertResult.insertId;
};

const insertScheduleAllLocations = async (connection, accountId, scheduleMainId) => {
  console.log(accountId);
  const [locations] = await connection.query('SELECT locationId FROM location WHERE accountId = ?', [accountId]);

  for (const location of locations) {
    const [scheduleLocationResult] = await connection.query(
      'INSERT INTO schedulelocation (scheduleMainId, locationId, isActive) VALUES (?,?,?)', [scheduleMainId, location.locationId, true]
    );
  }  
};

const insertScheduleLocation = async (connection, scheduleMainId, locationId) => {
  const [scheduleLocationResult] = await connection.query(
    'INSERT INTO schedulelocation (scheduleMainId, locationId, isActive) VALUES (?,?,?)', [scheduleMainId, locationId, true]
  );
};

const updateScheduleLocation = async (connection, scheduleMainId, locationId) => {
  const [scheduleLocationResult] = await connection.query(
    'UPDATE schedulelocation SET locationId = ? WHERE scheduleMainId = ?', [locationId, scheduleMainId]
  );
};

const deleteScheduleAllLocations = async (connection, scheduleMainId) => {
  const [scheduleLocationDeleteResult] = await connection.query(
    'DELETE FROM schedulelocation WHERE scheduleMainId = ?', [scheduleMainId]
  );
};

  router.get('/get-durations', authenticateToken, async (req, res) => {
    let connection;
    try {
      connection = await connectWithTimeout();
      const results = await executeQuery(connection, 'SELECT durationValue, durationText FROM common.duration', []);
      res.status(200).json(results);
    } catch (error) {
      handleError(res, error, 'Error fetching Duration Values: ');
    } finally {
      if (connection) connection.release();
    }
  });

  router.get('/get-reservationCounts', authenticateToken, async (req, res) => {
    let connection;
    try {
      connection = await connectWithTimeout();
      const results = await executeQuery(connection, 'SELECT reservationCountId, reservationCountValue FROM common.reservationcounts', []);
      res.status(200).json(results);
    } catch (error) {
      handleError(res, error, 'Error fetching Reservation Values: ');
    } finally {
      if (connection) connection.release();
    }
  });

  router.post('/add-schedule', authenticateToken, async (req, res) => {
    let connection;
    try {
      connection = await connectWithTimeout();
      const result = req.body;
  
      if (!result) {
        return res.status(400).json({ error: 'Invalid request payload' });
      }
  
      const {
        accountId = null,
        eventId: originalClassId = null,
        existingClassValue = null,
        locationValues = null,
        day = null,
        selectedTime = null,
        duration = 60,
        isRepeat = false,
        isActive = true,
        createdBy = 'API add-schedule',
        selectedDate = null
      } = result;
      // console.log('result:',result);
      const eventId = originalClassId || existingClassValue;
      if (eventId === null) {
        return res.status(400).json({ error: 'Missing event ID' });
      }
  
      const formattedSelectedDate = new Date(selectedDate).toISOString().split('T')[0];
      const startTime = formatTime(selectedTime);
      const endTime = calculateEndTime(selectedTime, duration);
      const insertValues = [accountId, eventId, day, startTime, endTime, formattedSelectedDate, isRepeat, isActive, createdBy];
      
      let scheduleMainId;
      if (locationValues === -99) {
        try {
          scheduleMainId = await insertScheduleMain(connection, insertValues);
          if (!scheduleMainId) {
            return res.status(500).json({ error: 'Failed to insert into schedulemain' });
          }
          await insertScheduleAllLocations(connection, accountId, scheduleMainId);
        } catch (error) {
          return handleError(res, error, 'Error inserting into schedulemain: ');
        }
      } else {
        scheduleMainId = await insertScheduleMain(connection, insertValues);
        if (!scheduleMainId) {
          return res.status(500).json({ error: 'Failed to insert into schedulemain' });
        }
        await insertScheduleLocation(connection, scheduleMainId, locationValues);
      }
  
      await connection.commit();
      res.status(201).json({ message: 'Schedule added successfully', scheduleMainId });
    } catch (error) {
      handleError(res, error, 'Error creating the Schedule: ');
    } finally {
      if (connection) {
        try {
          connection.release();
        } catch (releaseError) {
          console.warn('Error releasing connection:', releaseError);
        }
      }
    }
  });
  
  router.put('/update-schedule/:scheduleMainId', authenticateToken, async (req, res) => {
    let connection;
    try {
      connection = await connectWithTimeout();
      const { scheduleMainId } = req.params;
      const result = req.body;
  
      const formattedSelectedDate = new Date(result.selectedDate).toISOString().split('T')[0];
  
      console.log('Parameters - startTime:', result.startTime);
      console.log('Parameters - endTime:', result.endTime);
      console.log('Parameters - day:', result.day); // Use `day` here
      console.log('Parameters - selectedDate:', formattedSelectedDate);
      console.log('LocationValues', result.locationValues);
      console.log('LocationId', result.locationId);
  
      const scheduleMainUpdateQuery = `
        UPDATE admin.schedulemain
        SET startTime = ?, endTime = ?, day = ?, selectedDate = ?, updatedBy = "API Update-Schedule"
        WHERE scheduleMainId = ?;
      `;
      const scheduleMainUpdateParams = [result.startTime, result.endTime, result.day, formattedSelectedDate, scheduleMainId];
  
      // console.log('Executing query:', scheduleMainUpdateQuery);
      // console.log('With parameters:', scheduleMainUpdateParams);
  
      const [updateResult] = await connection.query(scheduleMainUpdateQuery, scheduleMainUpdateParams);
      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ message: 'Schedule not updated' });
      }else{
        if(result.locationValues !== -99){
          //Remove and Insert (1)
          console.log('Removing Existing and Insert 1 location');
          await deleteScheduleAllLocations(connection,scheduleMainId);
          await insertScheduleLocation(connection, scheduleMainId, result.locationValues);
          //await updateScheduleLocation(connection,scheduleMainId, result.locationValues);
        }else{
          console.log('Removing Existing and Inserting ALL locations');
          //Remove and Insert (ALL)
          await deleteScheduleAllLocations(connection, scheduleMainId);
          await insertScheduleAllLocations(connection, result.accountId, scheduleMainId);
        }
      }
      res.status(200).json({ message: 'Schedule updated successfully' });
    } catch (error) {
      handleError(res, error, 'Error Updating Schedule: ');
    } finally {
      if (connection) connection.release();
    }
  });
  

  router.get('/get-main-schedule', authenticateToken, async (req, res) => {
    let connection;
    try {
      connection = await connectWithTimeout();
  
      const query = `
        SELECT 
            e.eventId, 
            e.eventName, 
            e.eventDescription, 
            e.isReservation,
            e.reservationCount,
            e.isCostToAttend,
            e.costToAttend,
            s.day, 
            s.startTime, 
            s.endTime, 
            s.selectedDate, 
            s.isRepeat, 
            s.isActive, 
            s.accountId, 
            s.scheduleMainId, 
            CASE 
                WHEN COUNT(sl.locationId) > 1 THEN -99 
                ELSE MAX(sl.locationId) 
            END AS locationValues
        FROM 
            admin.schedulemain s
        INNER JOIN  
            admin.event e 
            ON s.eventId = e.eventId 
            AND e.isActive = true
        LEFT JOIN 
            admin.scheduleLocation sl 
            ON s.scheduleMainId = sl.scheduleMainId
        WHERE 
            (WEEK(s.selectedDate) = WEEK(CURDATE()) AND YEAR(s.selectedDate) = YEAR(CURDATE()) AND s.isRepeat = false)
        OR 
            s.isRepeat = true
        GROUP BY 
            e.eventId, e.eventName, e.eventDescription, 
            s.day, s.startTime, s.endTime, s.selectedDate, 
            s.isRepeat, s.isActive, s.accountId, s.scheduleMainId;
      `;
  
      const results = await executeQuery(connection, query, []);
      res.status(200).json(results);
    } catch (error) {
      handleError(res, error, 'Error fetching Schedule Values: ');
    } finally {
      if (connection) connection.release();
    }
  });
   
  router.delete('/delete-schedule-event/:scheduleMainId', authenticateToken, async (req, res) => {
    let connection;
    try {
      connection = await connectWithTimeout();
      const { scheduleMainId } = req.params;
  
      // Delete from schedulelocation
      const deleteLocationQuery = `DELETE FROM admin.schedulelocation WHERE scheduleMainId = ?;`;
      const deleteLocationResult = await executeQuery(connection, deleteLocationQuery, [scheduleMainId]);
  
      if (deleteLocationResult.affectedRows === 0) {
        return res.status(404).json({ message: 'Event not found' });
      }
  
      // Delete from scheduleMain
      const deleteMainQuery = `DELETE FROM admin.scheduleMain WHERE scheduleMainId = ?;`;
      const deleteMainResult = await executeQuery(connection, deleteMainQuery, [scheduleMainId]);
  
      if (deleteMainResult.affectedRows === 0) {
        return res.status(404).json({ message: 'Schedule not found' });
      }
  
      res.status(204).json({ message: 'Event and Schedule deactivated' });
    } catch (error) {
      handleError(res, error, 'Error deactivating event: ');
    } finally {
      if (connection) connection.release();
    }
  });
  
  
  
  module.exports = router; 