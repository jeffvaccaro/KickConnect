const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const mysql = require('mysql2/promise');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { connectToDatabase } = require('./db');
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(__dirname, `../.env.${env}`) });

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * /account/add-account:
 *   post:
 *     tags:
 *       - Account
 *     summary: Register Account
 *     security:
 *      - bearerAuth: []
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
router.post('/add-account', async (req, res) => {
  const { accountName, accountPhone, accountEmail, accountAddress, accountCity, accountState, accountZip, name, email, phone, phone2, password, roleId } = req.body;
  let connection;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);
    try {
      await connection.beginTransaction();
      // Insert into account table
      const [accountResult] = await connection.query(
        'INSERT INTO admin.account (accountCode, accountName, accountPhone, accountEmail, accountAddress, accountCity, accountState, accountZip, CreatedBy) VALUES (UUID(),?,?,?,?,?,?,?,"API Account Register")',
        [accountName, accountPhone, accountEmail, accountAddress, accountCity, accountState, accountZip]
      );
      // Get the inserted account ID
      const accountId = accountResult.insertId;
      // Insert into user table using the account ID
      await connection.query(
        'INSERT INTO admin.user (accountId, name, email, phone, phone2, password, roleId, createdBy) VALUES (?, ?, ?, ?, ?, ?, 1, "API Register Insert of OWNER")',
        [accountId, accountName, accountEmail, accountPhone, phone2, hashedPassword]
      );
      // Commit the transaction
      await connection.commit();
      res.status(201).send('Account and user created successfully');
    } catch (err) {
      await connection.rollback();
      console.error('Transaction error:', err);
      res.status(500).send('Error processing request');
    }
  } catch (error) {
    console.error('Error hashing password or connecting to database:', error);
    res.status(500).send('Error processing request');
  } finally {
    if (connection) {
      connection.release();
    } else {
      console.warn('add-account: Connection not established.');
    }
  }
});

module.exports = router;
