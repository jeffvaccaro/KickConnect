//role.cjs

const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const mysql = require('mysql');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middleware/authenticateToken.cjs');

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

var connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

connection.on('connection', (connection) => {
  console.log('Database connection established');
});

connection.on('error', (err) => {
  console.error('Database connection error:', err);
});

/**
 * @swagger
 * /auth/get-roles:
 *   get:
 *     summary: Gets ALL Roles
 *     responses:
 *       200:
 *         description: Roles SUCCESSFULLY returned!
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *     servers:
 *       - url: http://localhost:3000
 */
router.get('/get-roles', authenticateToken, (req, res) => {
    connection.query('SELECT * FROM role', (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Error executing query');
        return;
      }
      res.json(results);
    });
  });

  
module.exports = router;