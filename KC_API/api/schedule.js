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

  router.get('/get-durations', authenticateToken, async (req, res) => {
    let connection;
    try {
          const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
          connection = await Promise.race([connectToDatabase(), timeout]);

          const [results] = await connection.query('SELECT durationValue, durationText FROM common.duration');
          res.status(200).json(results);
        } catch (error) {
          console.error('Error fetching Duration Values:', error);
          res.status(500).json({ errror: 'Error fetching Duration Values' + error.message});
        }finally{
          if (connection) {
            connection.release();
          } else {
            console.warn('get-durations: Connection not established.');
          };
        }
  });   

  router.get('/get-reservationCounts', authenticateToken, async (req, res) => {
    let connection;
    try {
          const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
          connection = await Promise.race([connectToDatabase(), timeout]);

          const [results] = await connection.query('SELECT reservationCountId, reservationCountValue FROM common.reservationcounts');
          res.status(200).json(results);
        } catch (error) {
          console.error('Error fetching Reservation Values:', error);
          res.status(500).json({ errror: 'Error fetching Reservation Values' + error.message});
        }finally{
          if (connection) {
            connection.release();
          } else {
            console.warn('get-reservationCounts: Connection not established.');
          };
        }
  });   

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

  const insertScheduleMain = async (connection, insertValues) => {
    const [insertResult] = await connection.query(
      'INSERT INTO schedulemain (accountId, eventId, day, startTime, endTime, selectedDate, isRepeat, isActive, createdBy, createdOn) VALUES (?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)',
      insertValues
    );
    return insertResult.insertId;
  };

  const insertScheduleLocation = async (connection, accountId, scheduleMainId) => {
    console.log(accountId);
    const [locations] = await connection.query('SELECT locationId FROM location WHERE accountId = ?', [accountId]);
  
    for (const location of locations) {
      console.log('Location Values:', location);
      const [scheduleLocationResult] = await connection.query(
        'INSERT INTO schedulelocation (scheduleMainId, locationId, isActive) VALUES (?,?,?)', [scheduleMainId, location.locationId, true]
      );
    }
  
  };

  router.post('/add-schedule', authenticateToken, async (req, res) => {
    let connection;
    try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
      connection = await Promise.race([connectToDatabase(), timeout]);
  
      // console.log('Received body:', req.body); // Log the full request body
      const result = req.body; // Directly use req.body
  
      // console.log('Received result:', result); // Log result for debugging
  
      if (!result) {
        res.status(400).json({ error: 'Invalid request payload' });
        return;
      }
  
      // Destructure both eventId and existingClassValue
      const {
        accountId = null,
        eventId: originalClassId = null,
        existingClassValue = null,
        locationValues = null,
        dayNumber = null,
        selectedTime = null,
        duration = 60,
        isRepeat = false,
        isActive = true,
        createdBy = 'API add-schedule',
        createdOn = new Date().toISOString(),
        selectedDate = null
      } = result;
  
      // Assign eventId based on whichever value is provided
      const eventId = originalClassId || existingClassValue;
  
      if (eventId === null) {
        res.status(400).json({ error: 'Missing event ID' });
        return;
      }
  
      const formattedSelectedDate = new Date(selectedDate).toISOString().split('T')[0];
      const day = dayNumber;
      const startTime = formatTime(selectedTime); // Format startTime
      const endTime = calculateEndTime(selectedTime, duration); // Calculate and format endTime
  
      let insertValues = [accountId, eventId, day, startTime, endTime, formattedSelectedDate, isRepeat, isActive, createdBy];
      let scheduleMainId;
  
      if (locationValues === -99) {
        try {
          // Insert into schedulemain once and get scheduleId
          scheduleMainId = await insertScheduleMain(connection, insertValues);
  
          if (!scheduleMainId) {
            res.status(500).json({ error: 'Failed to insert into schedulemain' });
            return;
          }
  
          // Insert into schedulelocation for each location
          await insertScheduleLocation(connection, accountId, scheduleMainId);
        } catch (error) {
          console.error('Error inserting into schedulemain:', error);
          res.status(500).json({ error: 'Error inserting into schedulemain: ' + error.message });
          return;
        }
      } else {
        // console.log('Insert values before query:', insertValues);
        scheduleMainId = await insertScheduleMain(connection, insertValues);
      }
  
      await connection.commit();
      res.status(201).json({ message: 'Schedule added successfully', scheduleMainId }); // Return the scheduleMainId
    } catch (error) {
      console.error('Error in API endpoint:', error);
      res.status(500).json({ error: 'Error creating the Schedule: ' + error.message });
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
      const { scheduleMainId } = req.params; // Extract scheduleMainId from URL params
      const result = req.body; // Extract data from req.body
  
      const {
        day = null,
        selectedTime = null,
        duration = 60,
        selectedDate = null
      } = result;
  
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
      connection = await Promise.race([connectToDatabase(), timeout]);
  
      // console.log('Full req.body:', req.body);
  
      const formattedSelectedDate = new Date(selectedDate).toISOString().split('T')[0];
      const startTime = formatTime(selectedTime); // Format startTime
      const endTime = calculateEndTime(selectedTime, duration); // Calculate and format endTime
  
      const scheduleMainUpdateQuery = `UPDATE admin.schedulemain 
                                       SET startTime = ?, endTime = ?, day = ?, selectedDate = ?, updatedBy = "API Update-Schedule" 
                                       WHERE scheduleMainId = ?;`;
      const scheduleMainUpdateParams = [startTime, endTime, day, formattedSelectedDate, scheduleMainId];

      console.log('Executing query:', scheduleMainUpdateQuery);
      console.log('With parameters:', scheduleMainUpdateParams);
      
  
      const [updateResult] = await connection.query(scheduleMainUpdateQuery, scheduleMainUpdateParams);

      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ message: 'scheduleMain not updated' });
      }
      res.status(200).json({ message: 'Schedule updated successfully' });
    } catch (error) {
      console.error('Error Updating Schedule:', error);
      res.status(500).json({ error: 'Error Updating Schedule: ' + error.message });
    } finally {
      if (connection) {
        connection.release();
      } else {
        console.warn('update-schedule: Connection not established.');
      }
    }
  });
  
  

  router.get('/get-main-schedule', authenticateToken, async (req, res) => {
    let connection;
    try {
          const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
          connection = await Promise.race([connectToDatabase(), timeout]);

          const { locationId } = req.params;
          const query = `
              SELECT 
              e.eventId, 
              e.eventName, 
              e.eventDescription, 
              s.day, 
              s.startTime, 
              s.endTime, 
              s.selectedDate, 
              s.isRepeat, 
              s.isActive,
              s.accountId,
              s.scheduleMainId
            FROM 
              admin.schedulemain s 
            INNER JOIN 
              admin.event e 
            ON 
              s.eventId = e.eventId 
            AND 
              e.isActive = true
            WHERE 
              (WEEK(s.selectedDate) = WEEK(CURDATE()) AND YEAR(s.selectedDate) = YEAR(CURDATE()) AND s.isRepeat = false) 
              OR 
              s.isRepeat = true`;
          const [results] = await connection.query(query, [locationId]);

          
          res.status(200).json(results);
        } catch (error) {
          console.error('Error fetching Schedule Values:', error);
          res.status(500).json({ errror: 'Error fetching Schedule Values' + error.message});
        }finally{
          if (connection) {
            connection.release();
          } else {
            console.warn('get-main-schedule: Connection not established.');
          };
        }
  });  

  router.delete('/delete-schedule-event/:scheduleMainId', authenticateToken, async (req, res) => {
    console.log('got to the delete');
    const { scheduleMainId } = req.params;
    let connection;
  
    try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
      connection = await Promise.race([connectToDatabase(), timeout]);
  
      // Delete from schedulelocation
      const eventQuery = `DELETE FROM admin.schedulelocation WHERE scheduleMainId = ?;`;
      const [eventResult] = await connection.query(eventQuery, [scheduleMainId]);
  
      if (eventResult.affectedRows === 0) {
        return res.status(404).json({message: 'Event not found'});
      }
  
      // Delete from scheduleMain
      const scheduleMainQuery = `DELETE FROM admin.scheduleMain WHERE scheduleMainId = ?;`;
      const [scheduleMainResult] = await connection.query(scheduleMainQuery, [scheduleMainId]);
  
      if (scheduleMainResult.affectedRows === 0) {
        return res.status(404).json({message: 'Schedule not found'});
      }
  
      res.status(204).json({message: 'Event and Schedule deactivated'});
    } catch (error) {
      console.error('Error deactivating event:', error);
      res.status(500).json({error: 'Error deactivating event: ' + error.message});
    } finally {
      if (connection) {
        connection.release();
      } else {
        console.warn('Connection not established.');
      }
    }
  });
  
  
  module.exports = router; 