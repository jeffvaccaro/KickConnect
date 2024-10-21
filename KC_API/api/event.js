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
  res.status(500).json({ error: message + error.message
  });
}

router.post('/add-event/', authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await connectWithTimeout();
    let {
      accountId,
      eventName,
      eventDescription,
      isReservation,
      maxReservationCount,
      isCostToAttend,
      costToAttend,
      isActive
    } = req.body;
    
    // Ensure default values
    isReservation = isReservation ?? false;
    maxReservationCount = maxReservationCount ?? 0;
    isCostToAttend = isCostToAttend ?? false;
    costToAttend = costToAttend === '' ? 0 : costToAttend; // Handle empty string case
    isActive = isActive ?? true;
    
    const query = 'INSERT INTO event (accountId, eventName, eventDescription, isReservation, maxReservationCount, isCostToAttend, costToAttend, isActive, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const params = [accountId, eventName, eventDescription, isReservation, maxReservationCount, isCostToAttend, costToAttend, isActive, 'API event Insert'];

    const result = await executeQuery(connection, query, params);
    res.status(201).json({ eventId: result.insertId });
  } catch (error) {
    handleError(res, error, 'Error creating the event: ');
  } finally {
    if (connection) connection.release();
  }
});

router.get('/get-event-list/:accountId', authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await connectWithTimeout();
    const { accountId } = req.params;
    const query = 'SELECT * FROM event WHERE accountId = ?';
    const results = await executeQuery(connection, query, [accountId]);
    res.status(200).json(results);
  } catch (error) {
    handleError(res, error, 'Error fetching Events: ');
  } finally {
    if (connection) connection.release();
  }
});



router.get('/get-active-event-list/:accountId', authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await connectWithTimeout();
    const { accountId } = req.params;
    const [results] = await connection.query('SELECT eventId, eventName, eventDescription, isReservation, maxReservationCount, isCostToAttend, costToAttend, isActive FROM event WHERE accountId = ? AND isActive = true', [accountId]);
    res.status(200).json(results);
  } catch (error) {
    handleError(res, error, 'Error fetching Events: ');
  }finally{
    if (connection) connection.release();
  }
});

  router.get('/get-event-by-id/:accountId/:eventId', authenticateToken, async (req, res) => {
    let connection;
    try {
      connection = await connectWithTimeout();
      const { accountId, eventId } = req.params;
      const [results] = await connection.query('SELECT * FROM event WHERE accountId = ? AND eventId = ?', [accountId, eventId]);
      if (results.length === 0) {
        return res.status(404).json({ message: 'event not found' });
      }
      res.status(200).json(results[0]);
    } catch (error) {
      handleError(res, error, 'Error fetching Events: ');
    }finally{
      if (connection) connection.release();
    }
  });
 
  router.put('/update-event/:eventId', authenticateToken, async (req, res) => {
    let connection;
    try{
      connection = await connectWithTimeout();

      const eventName = req.body.eventName == undefined ? req.body.existingEventName: req.body.eventName || 'defaultEventName';
      const eventDescription = req.body.existingEventDescription;
      const isReservation = req.body.isReservation !== undefined ? req.body.isReservation : false;
      const maxReservationCount = req.body.maxReservationCount !== undefined ? req.body.maxReservationCount : 0;
      const isCostToAttend = req.body.isCostToAttend !== undefined ? req.body.isCostToAttend : false;
      const costToAttend = req.body.costToAttend !== undefined ? req.body.costToAttend : 0;
      const isActive = req.body.isActive !== undefined ? req.body.isActive : true;
      const eventId = req.params.eventId;

      const query = 
      `UPDATE event
       SET eventName = ?, eventDescription = ?, isReservation = ?, maxReservationCount = ?, 
           isCostToAttend = ?, costToAttend = ?, isActive = ?, updatedBy = 'API Location Update', updatedOn = CURRENT_TIMESTAMP
       WHERE eventId = ?`;
      const queryParams = [eventName, eventDescription, isReservation, maxReservationCount, isCostToAttend, costToAttend, isActive, eventId];
      const [results] = await connection.query(query, queryParams); 
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'event not found' });
      }
      res.status(200).json({ eventId, eventName, eventDescription });
      } catch (error) {
        handleError(res, error, 'Error fetching Events: ');
      }finally{
        if (connection) connection.release();
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