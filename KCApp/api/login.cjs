//login.cjs
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const mysql = require('mysql2/promise');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
 * /login/user-login:
 *   post:
 *     tags:
 *       - Login
 *     summary: Login User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 auth:
 *                   type: boolean
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
router.post('/user-login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const connection = await pool.getConnection();
        const [results] = await connection.query('SELECT * FROM user WHERE email = ?', [email]);

        if (results.length > 0) {
            const user = results[0];
            const match = await bcrypt.compare(password, user.password);

            if (match) {
                const token = jwt.sign({ id: user.username }, process.env.JWT_SECRET, { expiresIn: '2h' });
                res.status(200).send({ auth: true, token });
            } else {
                res.status(401).send('Invalid credentials');
            }
        } else {
            res.status(401).send('User not found');
        }

        connection.release();
    } catch (error) {
        console.error('Error during user login:', error);
        res.status(500).send('Error during user login');
    }
});

  module.exports = router;