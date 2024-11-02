const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('./db');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

router.post('/user-login', async (req, res) => {
  const { email, password } = req.body;
  let connection;

  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);

    const [results] = await connection.query(`
      SELECT u.name, u.password, a.accountCode, a.accountId,
             GROUP_CONCAT(r.roleName SEPARATOR ', ') AS roleNames
      FROM user u
      INNER JOIN account a ON u.accountId = a.accountId
      INNER JOIN userroles ur ON u.userId = ur.userId
      INNER JOIN role r ON ur.roleId = r.roleId
      WHERE u.email = ?
      GROUP BY u.userId, a.accountCode, a.accountId
    `, [email]);

    if (results.length > 0) {
      const user = results[0];

      //console.log('User password (hashed):', user.password); // Debug log
      //console.log('Provided password:', password); // Debug log

      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = jwt.sign({ id: user.name }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.status(200).send({ name: user.name, auth: true, token, accountCode: user.accountCode, accountId: user.accountId, role: user.roleNames });
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

// New endpoint to get Bearer token for API
router.post('/get-token', async (req, res) => {
  const { email, password } = req.body;
  let connection;

  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);

    const [results] = await connection.query(`
      SELECT u.name, u.password
      FROM user u
      WHERE u.email = ?
    `, [email]);

    if (results.length > 0) {
      const user = results[0];

      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = jwt.sign({ id: user.name }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.status(200).json({ token }); // Use res.json to send only the token in the response
      } else {
        res.status(401).send('Invalid credentials');
      }
    } else {
      res.status(401).send('User not found');
    }
  } catch (error) {
    console.error('Error during token generation:', error);
    res.status(500).send('Error during token generation');
  } finally {
    if (connection) {
      connection.release();
    } else {
      console.warn('get-token: Connection not established.');
    }
  }
});

module.exports = router;
