const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const mysql = require('mysql2/promise');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('./db');
const authenticateToken = require('./middleware/authenticateToken.cjs');
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

router.post('/user-login', async (req, res) => {
  const { email, password } = req.body;
  let connection;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);

    const [results] = await connection.query(`
      SELECT user.name, user.password, account.accountCode, account.accountId, role.roleName
      FROM user 
      INNER JOIN account ON user.accountId = account.accountId
      INNER JOIN role on user.roleId = role.roleId
      WHERE user.email = ?
    `, [email]);

    if (results.length > 0) {
      const user = results[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = jwt.sign({ id: user.name }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.status(200).send({ name: user.name, auth: true, token, accountCode: user.accountCode, accountId: user.accountId, role: user.roleName });
      } else {
        res.status(401).send('Invalid credentials');
      }
    } else {
      res.status(401).send('User not found');
    }
  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).send('Error during user login');
  } finally {
    if (connection) {
      connection.release();
    } else {
      console.warn('user-login: Connection not established.');
    }
  }
});

module.exports = router;
