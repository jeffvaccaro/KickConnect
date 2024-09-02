//user.cjs
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const upload = require('./upload.cjs');
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
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * paths:
 *   /user/get-users-by-account-code:
 *     get:
 *       tags:
 *         - User
 *       summary: Gets users by account code
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: accountcode
 *           schema:
 *             type: string
 *           required: true
 *           description: The account code to filter users by
 *       responses:
 *         200:
 *           description: Users successfully returned
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The user ID
 *                     name:
 *                       type: string
 *                       description: The user's name
 *                     email:
 *                       type: string
 *                       description: The user's email
 *       servers:
 *         - url: http://localhost:3000
 */

router.get('/get-users-by-account-code', authenticateToken, async (req, res) => {
  const accountCode = req.query.accountcode; // Get the account code from the query parameters

  // Use a parameterized query to prevent SQL injection
  const query = `
      SELECT user.* 
      FROM account 
      INNER JOIN user ON account.accountId = user.accountId
      WHERE account.accountcode = ?
  `;

  try {
      const connection = await pool.getConnection();
      const [results] = await connection.query(query, [accountCode]);

      res.json(results);
      connection.release();
  } catch (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Error executing query');
  }
});


/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * paths:
 *   /user/get-users:
 *     get:
 *       tags:
 *         - User
 *       summary: Gets ALL Users
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: accountCode
 *       responses:
 *         200:
 *           description: Accounts SUCCESSFULLY returned!
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *       servers:
 *         - url: http://localhost:3000
 */

router.get('/get-users', authenticateToken, async (req, res) => {
  try {
      let { accountCode } = req.query;
      const connection = await pool.getConnection();

      // Query the account table to get the accountId by accountCode
      const [accountResults] = await connection.query('SELECT accountId FROM account WHERE accountCode = ?', [accountCode]);
      if (accountResults.length === 0) {
          return res.status(404).send('Account not found');
      }
      const accountId = accountResults[0].accountId;

      // Query the user table using the retrieved accountId
      const [userResults] = await connection.query('SELECT user.*, role.roleName FROM user JOIN role ON user.roleId = role.roleId WHERE user.accountId = ?', [accountId]);

      res.json(userResults.length ? userResults : []); // Ensure an array is returned
      connection.release();
  } catch (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Error executing query');
  }
});

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * paths:
 *   /user/get-user-by-id:
 *     get:
 *       tags:
 *         - User
 *       summary: Get user details by user ID
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: userId
 *           schema:
 *             type: integer
 *           required: true
 *           description: The ID of the user to retrieve
 *       responses:
 *         200:
 *           description: User details retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       description: The user's ID
 *                     accountId:
 *                       type: integer
 *                       description: The account ID associated with the user
 *                     name:
 *                       type: string
 *                       description: The user's name
 *                     email:
 *                       type: string
 *                       description: The user's email
 *                     phone:
 *                       type: string
 *                       description: The user's primary phone
 *                     phone2:
 *                       type: string
 *                       description: The user's secondary phone
 *                     password:
 *                       type: string
 *                       description: The user's hashed password
 *                     roleId:
 *                       type: integer
 *                       description: The user's role ID
 *                     photoURL:
 *                       type: string
 *                       description: The URL of the user's photo
 *                     createdBy:
 *                       type: string
 *                       description: The creator of the user record
 *                     roleName:
 *                       type: string
 *                       description: The name of the user's role
 *         500:
 *           description: Error executing query
 *       servers:
 *         - url: http://localhost:3000/
 */

router.get('/get-user-by-id', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.query;
        const connection = await pool.getConnection();
        // Query the user table using the retrieved accountId
        const [userResults] = await connection.query('SELECT user.* FROM user WHERE user.userId = ?', [userId]);
  
        res.json(userResults.length ? userResults : []); // Ensure an array is returned
        connection.release();
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Error executing query');
    }
  });


/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * paths:
 *   /user/get-filtered-users:
 *     get:
 *       tags:
 *         - User
 *       summary: Gets Active or Inactive Users
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: isActive
 *           schema:
 *             type: integer
 *           required: true
 *           description: Filter users by active status (0 for active, -1 for inactive)
 *       responses:
 *         200:
 *           description: Accounts SUCCESSFULLY returned!
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The user ID
 *                     name:
 *                       type: string
 *                       description: The user's name
 *                     email:
 *                       type: string
 *                       description: The user's email
 *       servers:
 *         - url: http://localhost:3000
 */

router.get('/get-filtered-users', authenticateToken, async (req, res) => {
  let { isActive } = req.query;
  
  // Convert isActive to -1 if it's false, and to 0 if it's true
  if (isActive === 'false') {
      isActive = -1;
  } else if (isActive === 'true') {
      isActive = 0;
  }

  try {
      const connection = await pool.getConnection();
      const [results] = await connection.query('SELECT * FROM user WHERE isActive = ?', [isActive]);

      res.json(results);
      connection.release();
  } catch (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Error executing query');
  }
});


/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * paths:
 *   /user/add-user:
 *     post:
 *       tags:
 *         - User
 *       summary: Register a new user
 *       security:
 *         - bearerAuth: [] 
 *       requestBody:
 *         required: true
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               properties:
 *                 accountcode:
 *                   type: string
 *                   description: The account code to retrieve the account ID
 *                 name:
 *                   type: string
 *                   description: The user's name
 *                 email:
 *                   type: string
 *                   description: The user's email
 *                 phone:
 *                   type: string
 *                   description: The user's primary phone
 *                 phone2:
 *                   type: string
 *                   description: The user's secondary phone
 *                 password:
 *                   type: string
 *                   description: The user's password
 *                 roleId:
 *                   type: integer
 *                   description: Default to RoleId 4
 *                 photo:
 *                   type: string
 *                   format: binary
 *                   description: The user's photo
 *       responses:
 *         200:
 *           description: User registered
 *         404:
 *           description: Account not found
 *         500:
 *           description: Error during user registration
 *       servers:
 *         - url: http://localhost:3000/
 */

router.post('/add-user', authenticateToken, upload.single('photo'), async (req, res) => {
    const { accountcode, name, email, phone, phone2, password, roleId } = req.body;
  
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Query to get the accountId from the accountcode
      const accountQuery = 'SELECT accountId FROM account WHERE accountcode = ?';
      const connection = await pool.getConnection();
      const [accountResults] = await connection.query(accountQuery, [accountcode]);
  
      if (accountResults.length === 0) {
        connection.release();
        return res.status(404).send('Account not found');
      }
  
      const accountId = accountResults[0].accountId;
      const photoURL = req.file ? `/uploads/${req.file.filename}` : null;
  
      // Insert the new user with the retrieved accountId
      const userQuery = `
        INSERT INTO user (accountId, name, email, phone, phone2, password, photoURL, roleId, createdBy) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, "API User Insert")
      `;
      await connection.query(userQuery, [accountId, name, email, phone, phone2, hashedPassword, photoURL, roleId]);
  
      connection.release();
      res.send('User registered');
    } catch (error) {
      console.error('Error during user registration:', error);
      res.status(500).send('Error during user registration');
    }
  });
  
  
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * paths:
 *   /user/update-user:
 *     put:
 *       tags:
 *         - User
 *       summary: Update User record
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: userId
 *           schema:
 *             type: string
 *           required: true
 *           description: The user ID to update
 *       requestBody:
 *         description: The user details to update
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: The user's name
 *                 email:
 *                   type: string
 *                   description: The user's email
 *                 phone:
 *                   type: string
 *                   description: The user's primary phone
 *                 phone2:
 *                   type: string
 *                   description: The user's secondary phone
 *                 password:
 *                   type: string
 *                   description: The user's password
 *                 roleId:
 *                   type: integer
 *                   description: Default to RoleId 4
 *       responses:
 *         200:
 *           description: User successfully updated
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The user ID
 *                   name:
 *                     type: string
 *                     description: The user's name
 *                   email:
 *                     type: string
 *                     description: The user's email
 *       servers:
 *         - url: http://localhost:3000
 */

router.put('/update-user', authenticateToken, async (req, res) => {
  const { userId } = req.query;
  const { name, email, phone, phone2, password, roleId } = req.body;

  if (!password) {
      return res.status(400).send('Password is required');
  }

  try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log(hashedPassword);

      // Update user with userId
      const userQuery = `UPDATE user 
          SET name = ?, email = ?, phone = ?, phone2 = ?, password = ?, roleId = ?, updatedBy = "API User Update"
          WHERE userId = ?;`;

      const connection = await pool.getConnection();
      const [userResult] = await connection.query(userQuery, [name, email, phone, phone2, hashedPassword, roleId, userId]);

      console.log('Query executed successfully:', userResult);
      connection.release();
      res.send('User updated');
  } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).send('Error updating user');
  }
});

    
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * paths:
 *   /user/deactivate-user:
 *     put:
 *       tags:
 *         - User
 *       summary: Soft Delete User record
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: userId
 *           schema:
 *             type: string
 *           required: true
 *           description: The user ID to update
 *       requestBody:
 *         description: The user details to update
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       responses:
 *         200:
 *           description: User successfully updated
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The user ID
 *                   name:
 *                     type: string
 *                     description: The user's name
 *                   email:
 *                     type: string
 *                     description: The user's email
 *       servers:
 *         - url: http://localhost:3000
 */

router.put('/deactivate-user', authenticateToken, async (req, res) => {
  const { userId } = req.query;

  try {
      // Update user with userId
      const userQuery = `UPDATE user 
          SET isActive = -1, updatedBy = "API User Delete"
          WHERE userId = ?;`;

      // console.log(userQuery);
      const connection = await pool.getConnection();
      const [userResult] = await connection.query(userQuery, [userId]);

      console.log('Query executed successfully:', userResult);
      connection.release();
      res.send('User deactivated');
  } catch (error) {
      console.error('Error deactivating user:', error);
      res.status(500).send('Error deactivating user');
  }
});


  
  module.exports = router;