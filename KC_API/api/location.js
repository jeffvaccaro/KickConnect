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

router.post('/add-location', authenticateToken, async (req, res) => {
  let { accountId, locationName, locationAddress, locationCity, locationState, locationZip, locationPhone, locationEmail } = req.body;
  locationName = locationName.trim();
  locationAddress = locationAddress.trim();
  locationCity = locationCity.trim();
  locationState = locationState.trim();
  locationZip = locationZip.trim();
  locationPhone = locationPhone.trim();
  locationEmail = locationEmail.trim();

  let connection;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);
    const [result] = await connection.query(
      'INSERT INTO location (accountId, locationName, locationAddress, locationCity, locationState, locationZip, locationPhone, locationEmail, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "API Location Insert")',
      [accountId, locationName, locationAddress, locationCity, locationState, locationZip, locationPhone, locationEmail]
    );
    res.status(201).json({ locationId: result.insertId });
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).send('Error creating location');
  } finally {
    if (connection) {
      connection.release();
    } else {
      console.warn('add-location: Connection not established.');
    }
  }
});

router.get('/get-locations', authenticateToken, async (req, res) => {
  let connection;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);
    const [results] = await connection.query('SELECT * FROM location');
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).send('Error fetching locations');
  } finally {
    if (connection) {
      connection.release();
    } else {
      console.warn('get-locations: Connection not established.');
    }
  }
});

router.get('/get-locations-by-acct-id/:acctId', authenticateToken, async (req, res) => {
  let connection;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);
    const { acctId } = req.params;
    const [results] = await connection.query('SELECT * FROM location WHERE accountId = ?', [acctId]);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).send('Error fetching locations');
  } finally {
    if (connection) {
      connection.release();
    } else {
      console.warn('get-locations-by-acct-id/:acctId: Connection not established.');
    }
  }
});

router.get('/get-active-locations', authenticateToken, async (req, res) => {
  let connection;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);
    const [results] = await connection.query('SELECT * FROM location WHERE isActive = TRUE');
    res.status(200).json(results);
  } catch (error) {
      next(error); 
  } finally {
    if (connection) {
      connection.release();
    } else {
      console.warn('get-active-locations: Connection not established.');
    }
  }
});

router.get('/get-inactive-locations', authenticateToken, async (req, res) => {
  let connection;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);
    const [results] = await connection.query('SELECT * FROM location WHERE isActive = FALSE');
    res.status(200).json(results);
  } catch (error) {
      next(error); 
  } finally {
    if (connection) {
      connection.release();
    } else {
      console.warn('get-active-locations: Connection not established.');
    }
  }
});

module.exports = router;