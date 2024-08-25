// account.cjs
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
 * /auth/add-account:
 *   post:
 *     summary: Register Account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountName:
 *                 type: string
 *                 description: Name of Account Holder
 *               accountPhone:
 *                 type: string
 *                 description: Account Holder's phone
 *               accountEmail:
 *                 type: string
 *                 description: Account Holder's email
 *               accountAddress:
 *                 type: string
 *                 description: Account Holder's street address
 *               accountCity:
 *                 type: string
 *                 description: Account Holder's City  
 *               accountState:
 *                 type: string
 *                 description: Account Holder's State
 *               accountZip:
 *                 type: string
 *                 description: Account Holder's Zip Code
  *               password:
 *                 type: string
 *                 description: Account Holder's initial password
 *     responses:
 *       200:
 *         description: Account Created
 *     servers:
 *       - url: http://localhost:3000
 */
router.post('/add-account', authenticateToken, async (req, res) => {
  const { accountName, accountPhone, accountEmail, accountAddress, accountCity, accountState, accountZip, name, email, phone, phone2, password, roleId } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    connection.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting connection from pool:', err);
        res.status(500).send('Error getting connection from pool');
        return;
      }

      // Start a transaction
      connection.beginTransaction(err => {
        if (err) {
          console.error('Error starting transaction:', err);
          connection.release();
          res.status(500).send('Error starting transaction');
          return;
        }

        // Insert into account table
        connection.query('INSERT INTO admin.account (accountCode, accountName, accountPhone, accountEmail, accountAddress, accountCity, accountState, accountZip, CreatedBy) VALUES (UUID(),?,?,?,?,?,?,?,"API Account Register")', [accountName, accountPhone, accountEmail, accountAddress, accountCity, accountState, accountZip], (err, accountResult) => {
          if (err) {
            console.error('Error inserting into account:', err);
            return connection.rollback(() => {
              connection.release();
              res.status(500).send('Error inserting into account');
            });
          }

          // Get the inserted account ID
          const accountId = accountResult.insertId;

          // Insert into user table using the account ID
          connection.query('INSERT INTO admin.user (accountId, name, email, phone, phone2, password, roleId, createdBy) VALUES (?, ?, ?, ?, ?, ?, 1, "API Register Insert of OWNER")', [accountId, accountName, accountEmail, accountPhone, phone2, hashedPassword], (err, userResult) => {
            if (err) {
              console.error('Error inserting into user:', err);
              return connection.rollback(() => {
                connection.release();
                res.status(500).send('Error inserting into user');
              });
            }

            // Commit the transaction
            connection.commit(err => {
              if (err) {
                console.error('Error committing transaction:', err);
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).send('Error committing transaction');
                });
              }

              connection.release();
              res.status(201).send('Account and user created successfully');
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).send('Error processing request');
  }
});

/**
 * @swagger
 * /auth/get-accounts:
 *   get:
 *     summary: Gets ALL Accounts
 *     responses:
 *       200:
 *         description: Accounts SUCCESSFULLY returned!
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *     servers:
 *       - url: http://localhost:3000
 */

router.get('/get-accounts', authenticateToken, (req, res) => {
  connection.query('SELECT * FROM account', (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Error executing query');
      return;
    }
    res.json(results);
  });
});




// Protected route example
// router.get('/me', verifyToken, (req, res) => {
//   res.status(200).send({ message: `Hello ${req.userId}` });
// });

module.exports = router;
