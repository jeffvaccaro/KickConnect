//event.cjs
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

router.post('/add-event/', authenticateToken, async (req, res) => {
  let connection;
  try {
    
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);

    const { accountId, eventName, eventDescription, isActive } = req.body;
    const [result] = await connection.query(
      'INSERT INTO event (accountId, eventName, eventDescription, isReservation, maxReservationCount, isCostToAttend, costToAttend, isActive, createdBy) VALUES (?, ?, ?, ?, ?)', 
      [accountId, eventName, eventDescription, isActive, 'API event Insert']
    );
    
    res.status(201).json({ eventId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error creating the event: ' + error.message });
  }finally{
    if (connection) {
      connection.release();
    } else {
      console.warn('add-event: Connection not established.');
    };
  }
});
  
router.get('/get-event-list/:accountId', authenticateToken, async (req, res) => {
  let connection;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);

    const { accountId } = req.params;
    const [results] = await connection.query('SELECT * FROM event WHERE accountId = ?', [accountId]);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching Events:', error);
    res.status(500).json({ error: 'Error fetching Events: ' + error.message });
  }finally{
    if (connection) {
      connection.release();
    } else {
      console.warn('get-event-list/:accountId: Connection not established.');
    };
  }
}); 

router.get('/get-active-event-list/:accountId', authenticateToken, async (req, res) => {
  let connection;
  try {

    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);

    const { accountId } = req.params;
    const [results] = await connection.query('SELECT eventId, eventName, eventDescription, isReservation, maxReservationCount, isCostToAttend, costToAttend, isActive FROM event WHERE accountId = ? AND isActive = true', [accountId]);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching Events:', error);
    res.status(500).json({ error: 'Error fetching Events: ' + error.message });
  }finally{
    if (connection) {
      connection.release();
    } else {
      console.warn('get-active-event-list/:accountId: Connection not established.');
    };
  }
});

  router.get('/get-event-by-id/:accountId/:eventId', authenticateToken, async (req, res) => {
    const { accountId, eventId } = req.params;
    let connection;
    try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
      connection = await Promise.race([connectToDatabase(), timeout]);

      const [results] = await connection.query('SELECT * FROM event WHERE accountId = ? AND eventId = ?', [accountId, eventId]);
      if (results.length === 0) {
        return res.status(404).json({ message: 'event not found' });
      }
      res.status(200).json(results[0]);
    } catch (error) {
      // console.error('Error fetching event:', error);
      res.status(500).json({ error: 'Error fetching event: ' + error.message });
    }finally{
      if (connection) {
      connection.release();
    } else {
      console.warn('get-event-by-id/:accountId/:eventId: Connection not established.');
    };
    }
  });
 
  router.put('/update-event/:eventId', authenticateToken, async (req, res) => {
    // const { eventId } = req.params;
    // const { eventName, eventDescription, isReservation, maxReservationCount, isCostToAttend, costToAttend, isActive } = req.body;
    console.log(req.body);

    const eventName = req.body.eventName == undefined ? req.body.existingEventName: req.body.eventName || 'defaultEventName';
    const eventDescription = req.body.existingEventDescription || 'defaultDescription';
    const isReservation = req.body.isReservation !== undefined ? req.body.isReservation : false;
    const maxReservationCount = req.body.maxReservationCount !== undefined ? req.body.maxReservationCount : 0;
    const isCostToAttend = req.body.isCostToAttend !== undefined ? req.body.isCostToAttend : false;
    const costToAttend = req.body.costToAttend !== undefined ? req.body.costToAttend : 0;
    const isActive = req.body.isActive !== undefined ? req.body.isActive : true;
    const eventId = req.params.eventId;
    
    // Debugging logs
    console.log('eventName:', eventName);
    console.log('eventDescription:', eventDescription);
    console.log('isReservation:', isReservation);
    console.log('maxReservationCount:', maxReservationCount);
    console.log('isCostToAttend:', isCostToAttend);
    console.log('costToAttend:', costToAttend);
    console.log('isActive:', isActive);
    console.log('eventId:');



    let connection;
    try {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
        connection = await Promise.race([connectToDatabase(), timeout]);


        // const [results] = await connection.query(
        //   "UPDATE event SET eventName = ?, eventDescription = ?, isReservation = ?, maxReservationCount = ?, isCostToAttend = ?, costToAttend = ?, isActive = ?, updatedBy = 'API Location Update', updatedOn = CURRENT_TIMESTAMP WHERE eventId = ?",
        //   [eventName, eventDescription, isReservation, maxReservationCount, isCostToAttend, costToAttend, isActive, eventId]
        // );


        const query = 
        `UPDATE event
         SET eventName = ?, eventDescription = ?, isReservation = ?, maxReservationCount = ?, 
             isCostToAttend = ?, costToAttend = ?, isActive = ?, updatedBy = 'API Location Update', updatedOn = CURRENT_TIMESTAMP
         WHERE eventId = ?`;
        const queryParams = [eventName, eventDescription, isReservation, maxReservationCount, isCostToAttend, costToAttend, isActive, eventId];

        // Log the query and its parameters
        console.log('Executing query:', query);
        console.log('With parameters:', queryParams);
        
        const [results] = await connection.query(query, queryParams); 

        if (results.affectedRows === 0) {
          return res.status(404).json({ message: 'event not found' });
        }
        res.status(200).json({ eventId, eventName, eventDescription });
      
        } catch (error) {
          console.error('Error updating event:', error);
          res.status(500).json({error:'Error updating event' + error.message});
        }finally{
          if (connection) {
            connection.release();
          } else {
            console.warn('update-event/:eventId: Connection not established.');
          };
        }
  });

  router.delete('/deactivate-event/:accountId/:eventId', authenticateToken, async (req, res) => {
    const { accountId, eventId } = req.params;
    let connection;
    try {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
        connection = await Promise.race([connectToDatabase(), timeout]);

        const eventQuery = `
          UPDATE event 
          SET isActive = false, updatedBy = "API event Delete", updatedOn = CURRENT_TIMESTAMP
          WHERE accountId = ? AND eventId = ?;
        `;
  
        const [eventResult] = await connection.query(eventQuery, [accountId, eventId]);
  
          if (eventResult.affectedRows === 0) {
            return res.status(404).json({message:'event not found'});
          }  
          res.status(204).json({message: 'event deactivated'});
        } catch (error) {
          //console.error('Error deactivating event:', error);
          res.status(500).json({error: 'Error deactivating event' + error.message});
        }finally{
          if (connection) {
            connection.release();
          } else {
            console.warn('deactivate-event/:accountId/:eventId: Connection not established.');
          };
        }
  });
  

module.exports = router;