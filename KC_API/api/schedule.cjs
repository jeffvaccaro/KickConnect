//schedule.cjs

const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const mysql = require('mysql2/promise');
const router = express.Router();
const bcrypt = require('bcryptjs');
const authenticateToken = require('./middleware/authenticateToken.cjs');

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

var pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  // Handling connection establishment
pool.getConnection((err, connection) => {
    if (err) {
      console.error('Database connection error:', err);
      return;
    }
    console.log('Database connection established');
    connection.release(); // Release the connection back to the pool
  });

  /**
 * @swagger
 * /schedule/get-durations:
 *   get:
 *     summary: Queries Duration table
 *     tags: [Common]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: zip
 *         schema:
 *           type: integer
 *         required: true
 *         description: Queries Duration table
 *     responses:
 *       200:
 *         description: Queries Duration table
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Common'
 *       404:
 *         description: Error fetching Duration Info
 *       500:
 *         description: Error fetching Duration Info
 */
  router.get('/get-durations', authenticateToken, async (req, res) => {
    try {
      const [results] = await pool.query('SELECT durationValue, durationText FROM common.duration');
      res.status(200).json(results);
    } catch (error) {
      console.error('Error fetching Duration Values:', error);
      res.status(500).json({ errror: 'Error fetching Duration Values' + error.message});
    }
  });   

  router.post('/add-schedule/', authenticateToken, async (req, res) => {
    try {
      console.log('api', req.body);
    // const { accountId, className, classDescription, isActive } = req.body;
    // const [result] = await pool.query(
    //     'INSERT INTO schedule (accountId, classId, locationId, profileId, day, startTime, endTime, isRepeat, isActive, createdBy, createdOn) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
    //     [accountI, classId, locationId, profileId, day, startTime, endTime, isRepeat, isActive, createdBy, createdOn]
    //     );
    //   res.status(201).json({ scheduleId: result.insertId  });
    } catch (error) {
         res.status(500).json({error:'Error creating the Schedule' + error.message});
    }
  });  

  module.exports = router; 