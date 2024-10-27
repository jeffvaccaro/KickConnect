//user.js
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const upload = require('./upload.js');
const mysql = require('mysql2/promise');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('./db');
const authenticateToken = require('./middleware/authenticateToken.cjs');

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

router.get('/get-users-by-account-code', authenticateToken, async (req, res) => {
  const accountCode = req.query.accountcode; // Get the account code from the query parameters
  let connection;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);

    const query = `
      SELECT user.*, role.roleName
      FROM account
      INNER JOIN user ON account.accountId = user.accountId
      INNER JOIN userroles ON user.userId = userroles.userId
      INNER JOIN role ON userroles.roleId = role.roleId
      WHERE account.accountcode = ?
    `;
    const [results] = await connection.query(query, [accountCode]);
    res.json(results);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'Error executing query' });
  } finally {
    if (connection) {
      connection.release();
    } else {
      console.warn('get-users-by-account-code: Connection not established.');
    }
  }
});

router.get('/get-users', authenticateToken, async (req, res) => {
  let connection;
  try {
        let { accountCode } = req.query;

        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
        connection = await Promise.race([connectToDatabase(), timeout]);

        // Query the account table to get the accountId by accountCode
        const [accountResults] = await connection.query('SELECT accountId FROM account WHERE accountCode = ?', [accountCode]);
        if (accountResults.length === 0) {
            return res.status(404).send('Account not found');
        }
        const accountId = accountResults[0].accountId;

        const query = `
  	    SELECT 
          u.*, 
          GROUP_CONCAT(r.roleName SEPARATOR ', ') AS roleNames, 
          GROUP_CONCAT(r.roleId SEPARATOR ',') as roleId
        FROM admin.user u
        JOIN admin.userroles ur ON u.userId = ur.userId
        JOIN admin.role r ON ur.roleId = r.roleId
        WHERE u.accountId = ?
        GROUP BY u.userId
      `;

        // Query the user table using the retrieved accountId
        const [userResults] = await connection.query(query, [accountId]);

        res.json(userResults.length ? userResults : []); // Ensure an array is returned
      } catch (err) {
          console.error('Error executing query:', err);
          res.status(500).json({error:'Error executing query'});
      }finally{
        if (connection) {
          connection.release();
        } else {
          console.warn('get-users: Connection not established.');
        };
      }
});

router.get('/get-user-by-id', authenticateToken, async (req, res) => {
  let connection;
  try {
    const { userId } = req.query;

    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);

    // Query the user table using the retrieved accountId
    const query = `
    SELECT 
      u.*, 
      GROUP_CONCAT(r.roleName SEPARATOR ', ') AS roleNames, 
      GROUP_CONCAT(r.roleId SEPARATOR ',') as roleId
    FROM admin.user u
    JOIN admin.userroles ur ON u.userId = ur.userId
    JOIN admin.role r ON ur.roleId = r.roleId
    WHERE u.userId = ?
    GROUP BY u.userId
    `;    
    const [userResults] = await connection.query(query, [userId]);

    res.json(userResults[0] || {}); // Return the first record or an empty object if no record is found
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'Error executing query' });
  } finally {
    if (connection) {
      connection.release();
    } else {
      console.warn('get-user-by-id: Connection not established.');
    }
  }
});

router.get('/get-filtered-users', authenticateToken, async (req, res) => {
  let { accountId, status } = req.query;
  let isActive;
  if (status === 'InActive') {
    isActive = 0;
  } else if (status === 'Active') {
    isActive = 1;
  }
  let connection;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);

    const query = `
    SELECT 
      u.*, 
      GROUP_CONCAT(r.roleName SEPARATOR ', ') AS roleNames, 
      GROUP_CONCAT(r.roleId SEPARATOR ',') as roleId
    FROM admin.user u
    JOIN admin.userroles ur ON u.userId = ur.userId
    JOIN admin.role r ON ur.roleId = r.roleId
    WHERE u.accountId = ? AND u.isActive = ?
    GROUP BY u.userId
    `;  

    const formattedQuery = mysql.format(query, [accountId, isActive]);
    const [results] = await connection.query(formattedQuery);
    res.json(results);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'Error executing query' });
  } finally {
    if (connection) {
      connection.release();
    } else {
      console.warn('get-filtered-users: Connection not established.');
    }
  }
});

router.post('/add-user', authenticateToken, upload.single('photo'), async (req, res) => {
  let { accountcode, name, email, phone, phone2, address, city, state, zip, password: originalPassword, roleId } = JSON.parse(req.body.userData);
  
  console.log('Parsed userData:', { accountcode, name, email, phone, phone2, address, city, state, zip, originalPassword, roleId });
  
  let connection;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);

    console.log('Request body:', req.body); // Log the request body

    let password = originalPassword || accountcode; // Set default password to accountcode if not provided
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password:', hashedPassword); // Log the hashed password

    const accountQuery = 'SELECT accountId FROM admin.account WHERE accountcode = ?';
    const [accountResults] = await connection.query(accountQuery, [accountcode]);
    if (accountResults.length === 0) {
      console.error('Account not found');
      return res.status(404).json({ error: 'Account not found' });
    }

    const accountId = accountResults[0].accountId;
    console.log('Retrieved accountId:', accountId); // Log the retrieved accountId

    const photoURL = req.file ? `/uploads/${req.file.filename}` : null;
    console.log('Photo URL:', photoURL); // Log the photo URL

    // Check for duplicate user
    const duplicateQuery = `
      SELECT * FROM user
      WHERE name = ? AND email = ? AND phone = ? AND address = ? AND city = ? AND state = ? AND zip = ?
    `;
    const [duplicateResults] = await connection.query(duplicateQuery, [name, email, phone, address, city, state, zip]);
    if (duplicateResults.length > 0) {
      if (connection) {
        connection.release();
      } else {
        console.warn('add-user: Connection not established.');
      }
      console.warn('Duplicate user found:', duplicateResults);
      return res.status(409).json({ error: 'Duplicate user found' });
    }

    // Insert the new user with the retrieved accountId
    const userQuery = `
      INSERT INTO user (accountId, name, email, phone, phone2, address, city, state, zip, password, photoURL, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "API User Insert");
    `;
    await connection.query(userQuery, [accountId, name, email, phone, phone2, address, city, state, zip, hashedPassword, photoURL]);
    console.log('New user inserted:', { accountId, name, email, phone, phone2, address, city, state, zip, photoURL });

    // Retrieve the inserted userId (assuming userId is auto-incremented)
    const [result] = await connection.query('SELECT LAST_INSERT_ID() AS userId');
    const userId = result[0].userId;
    console.log('Inserted userId:', userId);

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

    // Insert into profile table if roleId is Instructor (4)
    if (roleId.includes(4)) {
      const profileQuery = `
        INSERT INTO profile (userId, description, skills, URL)
        VALUES (?, ?, ?, ?);
      `;
      await connection.query(profileQuery, [userId, '', '', '']);
      console.log('Profile created for Instructor user:', userId);
    }

    res.json({ message: 'User registered' });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ error: 'Error during user registration: ' + error.message });
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection released'); // Log the connection release
    } else {
      console.warn('add-user: Connection not established.');
    }
  }
});

router.put('/update-user/:userId', authenticateToken, upload.single('photo'), async (req, res) => {
  const { userId } = req.params; // Use req.params instead of req.query
  console.log('User ID:', userId); // Log the userId

  const userData = JSON.parse(req.body.userData);
  const { name, email, phone, phone2, address, city, state, zip, isActive, resetPassword } = userData;
  let { roleId } = userData; // Extract roleId separately to handle conversion
  console.log('Parsed user data:', { name, email, phone, phone2, address, city, state, zip, isActive, resetPassword, roleId }); // Log the parsed user data

  // Convert roleId from string to array if needed
  if (typeof roleId === 'string') {
    roleId = roleId.split(',').map(Number);
  }
  console.log('Converted roleId to array:', roleId); // Log the converted roleId

  const photoURL = req.file ? `/uploads/${req.file.filename}` : req.body.photoURL;
  console.log('Photo URL:', photoURL); // Log the photo URL

  if (!Array.isArray(roleId)) {
    console.error('roleId is not an array:', roleId); // Log the error
    return res.status(400).json({ error: 'roleId must be an array' }); // Send a JSON error response
  }

  let connection;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);
    console.log('Database connection established'); // Log the database connection status

    // Update user with userId
    const userQuery = `
      UPDATE user
      SET name = ?, email = ?, phone = ?, phone2 = ?, address = ?, city = ?, state = ?, zip = ?, isActive = ?, resetPassword = ?, photoURL = ?, updatedBy = "API User Update"
      WHERE userId = ?;
    `;
    await connection.query(userQuery, [name, email, phone, phone2, address, city, state, zip, isActive, resetPassword, photoURL, userId]);
    console.log('User updated:', { userId, name, email, phone, phone2, address, city, state, zip, isActive, resetPassword, photoURL });

    // Delete existing user roles
    const deleteUserRoleQuery = `
      DELETE FROM userroles WHERE userId = ?;
    `;
    await connection.query(deleteUserRoleQuery, [userId]);
    console.log('Existing user roles deleted for userId:', userId);

    // Insert new user roles
    const insertUserRoleQuery = `
      INSERT INTO userroles (userId, roleId)
      VALUES (?, ?);
    `;
    const userRolePromises = roleId.map((role) => {
      console.log('Inserting role:', role); // Log each role being inserted
      return connection.query(insertUserRoleQuery, [userId, role]);
    });
    await Promise.all(userRolePromises);
    console.log('New user roles inserted:', { userId, roleId });

    // Insert into profile table if roleId is Instructor (4)
    if (roleId.includes(4)) {
      const profileQuery = `
        INSERT INTO profile (userId, description, skills, URL)
        VALUES (?, ?, ?, ?);
      `;
      await connection.query(profileQuery, [userId, '', '', '']);
      console.log('Profile created for Instructor user:', userId);
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error); // Log the error
    res.status(500).json({ error: 'Error updating user: ' + error.message });
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection released'); // Log the connection release
    } else {
      console.warn('update-user/:userId: Connection not established.');
    }
  }
});
 
router.put('/deactivate-user', authenticateToken, async (req, res) => {
  const { userId } = req.query;
  let connection;
  try {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
        connection = await Promise.race([connectToDatabase(), timeout]);

        const userQuery = `UPDATE user 
            SET isActive = -1, updatedBy = "API User Delete"
            WHERE userId = ?;`;

          // console.log(userQuery);
        const [userResult] = await connection.query(userQuery, [userId]);
        res.json({ message: 'User deactivated' });
      } catch (error) {
          res.status(500).json({ error: 'Error deactivating user' }); // Send a JSON error response
      } finally {
        if (connection) {
          connection.release();
        } else {
          console.warn('deactivate-user: Connection not established.');
        };
      }
});
 
  module.exports = router;