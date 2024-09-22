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
 *         500:
 *           description: Error executing query
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: Error message
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
      res.status(500).json({error:'Error executing query'});
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
 *           schema:
 *             type: string
 *           required: false
 *           description: The account code to filter users by
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
 *                     roleName:
 *                       type: string
 *                       description: The user's role name
 *         404:
 *           description: Account not found
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: Error message
 *         500:
 *           description: Error executing query
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: Error message
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
      res.status(500).json({error:'Error executing query'});
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
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: integer
 *                     description: The user's ID
 *                   accountId:
 *                     type: integer
 *                     description: The account ID associated with the user
 *                   name:
 *                     type: string
 *                     description: The user's name
 *                   email:
 *                     type: string
 *                     description: The user's email
 *                   phone:
 *                     type: string
 *                     description: The user's primary phone
 *                   phone2:
 *                     type: string
 *                     description: The user's secondary phone
 *                   password:
 *                     type: string
 *                     description: The user's hashed password
 *                   roleId:
 *                     type: integer
 *                     description: The user's role ID
 *                   photoURL:
 *                     type: string
 *                     description: The URL of the user's photo
 *                   createdBy:
 *                     type: string
 *                     description: The creator of the user record
 *                   roleName:
 *                     type: string
 *                     description: The name of the user's role
 *         404:
 *           description: User not found
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: Error message
 *         500:
 *           description: Error executing query
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: Error message
 *       servers:
 *         - url: http://localhost:3000/
 */
router.get('/get-user-by-id', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.query;
    const connection = await pool.getConnection();
    // Query the user table using the retrieved accountId
    const [userResults] = await connection.query('SELECT user.* FROM user WHERE user.userId = ?', [userId]);
    
    res.json(userResults[0] || {}); // Return the first record or an empty object if no record is found
    connection.release();
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({error:'Error executing query'});
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
 *                     roleName:
 *                       type: string
 *                       description: The user's role name
 *         500:
 *           description: Error executing query
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: Error message
 *       servers:
 *         - url: http://localhost:3000
 */

router.get('/get-filtered-users', authenticateToken, async (req, res) => {
  let { accountId, status } = req.query;
  console.log(req.query);

  let isActive;
  if (status === 'InActive') {
      isActive = 0;
  } else if (status === 'Active') {
      isActive = 1;
  }

  try {
      const connection = await pool.getConnection();
      const query = 'SELECT user.*, role.roleName FROM user JOIN role ON user.roleId = role.roleId WHERE user.accountId = ? AND isActive = ?';
      const formattedQuery = mysql.format(query, [accountId, isActive]);
      
      // console.log('Executing query:', formattedQuery);

      const [results] = await connection.query(formattedQuery);
      // console.log('Query executed successfully:', results);

      res.json(results);
      connection.release();

  } catch (err) {
      console.error('Error executing query:', err);
      res.status(500).json({error:'Error executing query'});
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
 *         409:
 *           description: Duplicate user found
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: Error message
 *         500:
 *           description: Error during user registration
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: Error message
 *       servers:
 *         - url: http://localhost:3000/
 */
router.post('/add-user', authenticateToken, upload.single('photo'), async (req, res) => {
  const { accountcode, name, email, phone, phone2, address, city, state, zip, password: originalPassword, roleId } = req.body;
  // console.log(req.body);
  try {

    // Use a new variable for the password
    let password = originalPassword || accountcode; // Set default password to accountcode if not provided
    // console.log('password:', password); // Log the password

    const hashedPassword = await bcrypt.hash(password, 10);

    // Query to get the accountId from the accountcode
    const accountQuery = 'SELECT accountId FROM admin.account WHERE accountcode = ?';
    const connection = await pool.getConnection();
    const [accountResults] = await connection.query(accountQuery, [accountcode]);

    // console.log('accountQuery', accountQuery);
    if (accountResults.length === 0) {
      connection.release();
      return res.status(404).json({error:'Account not found'});
    }

    const accountId = accountResults[0].accountId;
    const photoURL = req.file ? `/uploads/${req.file.filename}` : null;

    // Check for duplicate user
    const duplicateQuery = `
      SELECT * FROM user 
      WHERE name = ? AND email = ? AND phone = ? AND address = ? AND city = ? AND state = ? AND zip = ?
    `;
    const [duplicateResults] = await connection.query(duplicateQuery, [name, email, phone, address, city, state, zip]);

    if (duplicateResults.length > 0) {
      connection.release();
      return res.status(409).json({error:'Duplicate user found'});
    }

    // Insert the new user with the retrieved accountId
    const userQuery = `
      INSERT INTO user (accountId, name, email, phone, phone2, address, city, state, zip, password, photoURL, roleId, createdBy) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "API User Insert")
    `;
    await connection.query(userQuery, [accountId, name, email, phone, phone2, address, city, state, zip, hashedPassword, photoURL, roleId]);

    connection.release();
    res.json({ message: 'User registered'});
  } catch (error) {
    //console.error('Error during user registration:', error);
    res.status(500).json( { error: 'Error during user registration' });
   
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
 *                 isActive:
 *                   type: boolean
 *                   description: The user's active status
 *                 resetPassword:
 *                   type: boolean
 *                   description: Whether the user's password needs to be reset
 *                 roleId:
 *                   type: integer
 *                   description: The user's role ID
 *       responses:
 *         200:
 *           description: User successfully updated
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: Success message
 *         400:
 *           description: roleId is required
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     description: Error message
 *         500:
 *           description: Error updating user
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     description: Error message
 *       servers:
 *         - url: http://localhost:3000
 */
router.put('/update-user/:userId', authenticateToken, upload.single('photo'), async (req, res) => {
  const { userId } = req.params; // Use req.params instead of req.query
  const { name, email, phone, phone2, address, city, state, zip, isActive, resetPassword, roleId, photoURL } = req.body;
  let connection;

  // console.log('req.body', req.body); 
  if (!roleId) {
    return res.status(400).json({ error: 'roleId is required' }); // Send a JSON error response
  }

  try {
    connection = await pool.getConnection();

    // Extract the file from the photoURL object
    // let finalPhotoURL = null;
    // if (req.file) {
    //   finalPhotoURL = `/uploads/${req.file.filename}`;
    // } else if (photoURL && photoURL.file) {
    //   finalPhotoURL = `/uploads/${photoURL.file.name}`;
    // } else {
    //   const [existingUser] = await connection.query('SELECT photoURL FROM user WHERE userId = ?', [userId]);
    //   finalPhotoURL = existingUser[0].photoURL;
    // }

    // Update user with userId
    const userQuery = `UPDATE user 
        SET name = ?, email = ?, phone = ?, phone2 = ?, 
        address = ?, city = ?, state = ?, zip = ?,
        isActive = ?, resetPassword = ?, photoURL = ?, 
        roleId = ?, updatedBy = "API User Update"
        WHERE userId = ?;`;

    const [userResult] = await connection.query(userQuery, [name, email, phone, phone2, address, city, state, zip, isActive, resetPassword, photoURL, roleId, userId]);

    //console.log('Query executed successfully:', userResult);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    //console.error('Error updating user:', error); // Log the error details
    res.status(500).json({ error: 'Error updating user' }); // Send a JSON error response
  } finally {
    if (connection) connection.release(); // Ensure connection is released in both success and error cases
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
 *                   message:
 *                     type: string
 *                     description: Success message
 *         500:
 *           description: Error deactivating user
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     description: Error message
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

      //console.log('Query executed successfully:', userResult);
      connection.release();
      res.json({ message: 'User deactivated' });
  } catch (error) {
      //console.error('Error deactivating user:', error);
      res.status(500).json({ error: 'Error deactivating user' }); // Send a JSON error response
  }
});


  
  module.exports = router;