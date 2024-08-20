// auth.cjs
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const mysql = require('mysql');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


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
 * /auth/register:
 *   post:
 *     summary: Register User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The user's username
 *               email:
 *                 type: string
 *                 description: The user's email
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       200:
 *         description: User registered successfully
 *     servers:
 *      url: http://localhost:3000
 */
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword, 'hashedpWD');
  connection.query('INSERT INTO user (username, email, password_hash) VALUES (?, ?, ?)', [username, email, hashedPassword], (err, result) => {
      if (err) throw err;
      res.send('User registered');
  });
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The user's username
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
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  connection.query('SELECT * FROM user WHERE username = ?', [username], async (err, results) => {
      if (err) throw err;
      if (results.length > 0) {
          const user = results[0];
          const match = await bcrypt.compare(password, user.password_hash);
          if (match) {
            const token = jwt.sign({ id: user.username }, 'your-secret-key', { expiresIn: 86400 });
            res.status(200).send({ auth: true, token });
          } else {
              res.status(401).send('Invalid credentials');
          }
      } else {
          res.status(401).send('User not found');
      }
  });
});


router.get('/api', (req, res) => {
  connection.query('SELECT * FROM admin.location', (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Error executing query');
      return;
    }
    res.json(results);
  });
});


// Middleware to verify token
function verifyToken(req, res, next) {
  const token = req.headers['x-access-token'];
  if (!token) return res.status(403).send({ message: 'No token provided.' });

  jwt.verify(token, 'your-secret-key', (err, decoded) => {
    if (err) return res.status(500).send({ message: 'Failed to authenticate token.' });
    req.userId = decoded.id;
    next();
  });
}

// Protected route example
router.get('/me', verifyToken, (req, res) => {
  res.status(200).send({ message: `Hello ${req.userId}` });
});

module.exports = router;
