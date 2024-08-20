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
router.post('/add-account', async (req, res) => {
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
 * /auth/add-user:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountcode:
 *                 type: string
 *                 description: The account code to retrieve the account ID
 *               name:
 *                 type: string
 *                 description: The user's name
 *               email:
 *                 type: string
 *                 description: The user's email
 *               phone:
 *                 type: string
 *                 description: The user's primary phone
 *               phone2:
 *                 type: string
 *                 description: The user's secondary phone
 *               password:
 *                 type: string
 *                 description: The user's password
 *               roleId:
 *                 type: integer
 *                 description: Default to RoleId 4
  *     responses:
 *       200:
 *         description: User registered
 *       404:
 *         description: Account not found
 *       500:
 *         description: Error executing query
 *     servers:
 *       - url: http://localhost:3000
 */
router.post('/add-user', async (req, res) => {
  const { accountcode, name, email, phone, phone2, password, roleId } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Query to get the accountId from the accountcode
    const accountQuery = 'SELECT accountId FROM account WHERE accountcode = ?';
    connection.query(accountQuery, [accountcode], (err, accountResults) => {
      if (err) {
        console.error('Error executing account query:', err);
        return res.status(500).send('Error executing account query');
      }

      if (accountResults.length === 0) {
        return res.status(404).send('Account not found');
      }

      const accountId = accountResults[0].accountId;

      // Insert the new user with the retrieved accountId
      const userQuery = `
        INSERT INTO admin.user (accountId, name, email, phone, phone2, password, roleId, createdBy) 
        VALUES (?, ?, ?, ?, ?, ?, ?, "API User Insert")
      `;
      connection.query(userQuery, [accountId, name, email, phone, phone2, hashedPassword, roleId], (err, userResult) => {
        if (err) {
          console.error('Error executing user query:', err);
          return res.status(500).send('Error executing user query');
        }

        res.send('User registered');
      });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).send('Error hashing password');
  }
});



/**
 * @swagger
 * /auth/user-login:
 *   post:
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
router.post('/user-login', (req, res) => {
  const { email, password } = req.body;
  connection.query('SELECT * FROM admin.user WHERE email = ?', [email], async (err, results) => {
      if (err) throw err;
      if (results.length > 0) {
          const user = results[0];
          const match = await bcrypt.compare(password, user.password);
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

router.get('/get-accounts', (req, res) => {
  connection.query('SELECT * FROM account', (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Error executing query');
      return;
    }
    res.json(results);
  });
});

/**
 * @swagger
 * /auth/get-users:
 *   get:
 *     summary: Gets ALL Users
 *     responses:
 *       200:
 *         description: Accounts SUCCESSFULLY returned!
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *     servers:
 *       - url: http://localhost:3000
 */
router.get('/get-users', (req, res) => {
  connection.query('SELECT * FROM user', (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Error executing query');
      return;
    }
    res.json(results);
  });
});

/**
 * @swagger
 * /auth/get-users-by-account-code:
 *   get:
 *     summary: Gets users by account code
 *     parameters:
 *       - in: query
 *         name: accountcode
 *         schema:
 *           type: string
 *         required: true
 *         description: The account code to filter users by
 *     responses:
 *       200:
 *         description: Users successfully returned
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
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
  *     servers:
 *       - url: http://localhost:3000
 */
router.get('/get-users-by-account-code', (req, res) => {
  const accountCode = req.query.accountcode; // Get the account code from the query parameters

  // Use a parameterized query to prevent SQL injection
  const query = `
    SELECT  user.* 
    FROM    account 
    INNER JOIN user ON account.accountId = user.accountId
    WHERE   account.accountcode = ?
  `;

  connection.query(query, [accountCode], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Error executing query');
      return;
    }
    res.json(results);
  });
});

/**
 * @swagger
 * /auth/get-roles:
 *   get:
 *     summary: Gets ALL Roles
 *     responses:
 *       200:
 *         description: Roles SUCCESSFULLY returned!
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *     servers:
 *       - url: http://localhost:3000
 */
router.get('/get-roles', (req, res) => {
  connection.query('SELECT * FROM role', (err, results) => {
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
