const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const { connectToDatabase } = require('./db');
const router = express.Router();

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(__dirname, `../.env.${env}`) });

router.post('/add-account', async (req, res) => {
  console.log('Endpoint hit: /add-account');
  const { accountName, accountPhone, accountEmail, accountAddress, accountCity, accountState, accountZip, isSuperAdmin, name, email, phone, phone2, password, roleId } = req.body;
  let connection;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);
    try {
      await connection.beginTransaction();
      // Insert into account table
      const [accountResult] = await connection.query(
        'INSERT INTO admin.account (accountCode, accountName, accountPhone, accountEmail, accountAddress, accountCity, accountState, accountZip, isSuperAdmin, CreatedBy) VALUES (UUID(),?,?,?,?,?,?,?,?,"API Account Register")',
        [accountName, accountPhone, accountEmail, accountAddress, accountCity, accountState, accountZip, isSuperAdmin]
      );
      // Get the inserted account ID
      const accountId = accountResult.insertId;
      // Insert into user table using the account ID
      await connection.query(
        'INSERT INTO admin.user (accountId, name, email, phone, phone2, address, city, state, zip, password, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "API Register Insert of OWNER")',
        [accountId, accountName, accountEmail, accountPhone, phone2, accountAddress, accountCity, accountState, accountZip, hashedPassword]
      );

      // Retrieve the inserted userId (assuming userId is auto-incremented)
      const [result] = await connection.query('SELECT LAST_INSERT_ID() AS userId');
      const userId = result[0].userId;
      // console.log('Inserted userId:', userId);

      // Insert the new user roles with the retrieved userId and roleId array
      if (!Array.isArray(roleId)) {
        console.error('roleId is not an array:', roleId);
        return res.status(400).json({ error: 'roleId must be an array' });
      }
      const userRoleQuery = `
        INSERT INTO userroles (userId, roleId)
        VALUES (?, ?);
      `;
      const userRolePromises = roleId.map((role) => {
        console.log('Inserting role:', role); // Log each role being inserted
        return connection.query(userRoleQuery, [userId, role]);
      });
      await Promise.all(userRolePromises);


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
