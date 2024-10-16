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
  
  router.post('/add-schedule', authenticateToken, async (req, res) => {
    let connection;
    try {
          const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
          connection = await Promise.race([connectToDatabase(), timeout]);
      
          // Log the entire req.body
          //console.log('Full req.body:', req.body);
          const { result } = req.body;
          const {
            accountId = null, existingClassValue = null, locationValues = null, profileId = null,
            dayNumber = null, selectedTime = null, duration = 60, isRepeat = false,
            isActive = true, createdBy = 'API add-schedule', createdOn = new Date().toISOString(),
            selectedDate = null // Ensure selectedDate is included
          } = result;
      
          // Format selectedDate to YYYY-MM-DD
          const formattedSelectedDate = new Date(selectedDate).toISOString().split('T')[0];
      
          const day = dayNumber;
          const startTime = formatTime(selectedTime); // Format startTime
          const endTime = calculateEndTime(selectedTime, duration); // Calculate and format endTime
      
          // Log the individual values
          //console.log('Extracted values - Account ID:', accountId, 'Class ID:', existingClassValue, 'Location Values:', locationValues, 'Profile ID:', profileId, 'Day:', day, 'Start Time:', startTime, 'End Time:', endTime, 'SelectedDate:', formattedSelectedDate, 'Is Repeat:', isRepeat, 'Is Active:', isActive, 'Created By:', createdBy, 'Created On:', createdOn, 'DayNumber:', dayNumber);
      
          let insertValues = [accountId, existingClassValue, null, profileId, day, startTime, endTime, formattedSelectedDate, isRepeat, isActive, createdBy]; // Adjusted values
      
          if (locationValues === -99) {
            const [locations] = await connection.query('SELECT locationId FROM location WHERE accountId = ?', [accountId]);
            for (const location of locations) {
              insertValues[2] = location.locationId; // Set the locationId for each location
              console.log('Insert values:', insertValues);
              await connection.query(
                'INSERT INTO schedule (accountId, classId, locationId, profileId, day, startTime, endTime, selectedDate, isRepeat, isActive, createdBy, createdOn) VALUES (?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)',
                insertValues
              );
            }
          } else {
            insertValues[2] = locationValues; // Set the locationValues
            console.log('Insert values:', insertValues);
            await connection.query(
              'INSERT INTO schedule (accountId, classId, locationId, profileId, day, startTime, endTime, selectedDate, isRepeat, isActive, createdBy, createdOn) VALUES (?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)',
              insertValues
            );
          }
          await connection.commit();
          res.status(201).json({ message: 'Schedule added successfully' });
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
    
  router.get('/get-schedule-by-location/:locationId', authenticateToken, async (req, res) => {
    let connection;
    try {
          const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
          connection = await Promise.race([connectToDatabase(), timeout]);

          const { locationId } = req.params;
          const query = `
              SELECT 
              c.classId, 
              c.className, 
              c.classDescription, 
              s.day, 
              s.startTime, 
              s.endTime, 
              s.selectedDate, 
              s.isRepeat, 
              s.isActive,
              s.locationId,
              s.accountId
            FROM 
              admin.schedule s 
            INNER JOIN 
              admin.class c 
            ON 
              s.classId = c.classId 
            AND 
              c.isActive = true
            AND 
              s.locationId = ?
            WHERE 
              (WEEK(s.selectedDate) = WEEK(CURDATE()) AND YEAR(s.selectedDate) = YEAR(CURDATE()) AND s.isRepeat = false) 
              OR 
              s.isRepeat = true`;
          const [results] = await connection.query(query, [locationId]);

          
          res.status(200).json(results);
        } catch (error) {
          console.error('Error fetching Duration Values:', error);
          res.status(500).json({ errror: 'Error fetching Duration Values' + error.message});
        }finally{
          if (connection) {
            connection.release();
          } else {
            console.warn('get-schedule-by-location: Connection not established.');
          };
        }
  });  

  
  module.exports = router; 