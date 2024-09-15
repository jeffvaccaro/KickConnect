// account.cjs
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const mysql = require('mysql2/promise');
const router = express.Router();
const bcrypt = require('bcryptjs');
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
 * /location/add-location:
 *   post:
 *     summary: Create a new location
 *     security:
 *      - bearerAuth: []
 *     tags: [Location]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Location'
 *     responses:
 *       201:
 *         description: The location was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       500:
 *         description: Some server error
 */
router.post('/add-location', authenticateToken, async (req, res) => {
  
    let { accountId, locationName, locationAddress, locationCity, locationState, locationZip, locationPhone, locationEmail } = req.body;
    // Trim whitespace from each string
    locationName = locationName.trim();
    locationAddress = locationAddress.trim();
    locationCity = locationCity.trim();
    locationState = locationState.trim();
    locationZip = locationZip.trim();
    locationPhone = locationPhone.trim();
    locationEmail = locationEmail.trim();

    try {
      const [result] = await pool.query(
        'INSERT INTO location (accountId, locationName, locationAddress, locationCity, locationState, locationZip, locationPhone, locationEmail, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "API Location Insert")',
        [accountId, locationName, locationAddress, locationCity, locationState, locationZip, locationPhone, locationEmail]
      );
      res.status(201).json({ locationId: result.insertId });
    } catch (error) {
      console.error('Error creating location:', error);
      res.status(500).send('Error creating location');
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
 * /location/get-locations:
 *  get:
 *     summary: Returns the list of all the locations
 *     security:
 *      - bearerAuth: []
 *     tags: [Location]
 *     responses:
 *       200:
 *         description: The list of the locations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Location'
 */
router.get('/get-locations', authenticateToken, async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM location');
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).send('Error fetching locations');
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
 * /location/get-locations-by-id/{id}:
 *   get:
 *     summary: Get the location by id
 *     security:
 *      - bearerAuth: []
 *     tags: [Location]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The location id
 *     responses:
 *       200:
 *         description: The location description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       404:
 *         description: The location was not found
 */

router.get('/get-locations-by-id/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await pool.query('SELECT * FROM location WHERE locationId = ?', [id]);
    if (results.length > 0) {
      res.status(200).json(results[0]);
    } else {
      res.status(404).send('Location not found');
    }
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).send('Error fetching location');
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
 * /location/update-location/{id}:
 *   put:
 *     summary: Update the location by the id
 *     security:
 *      - bearerAuth: []
 *     tags: [Location]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The location id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Location'
 *     responses:
 *       200:
 *         description: The location was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       404:
 *         description: The location was not found
 *       500:
 *         description: Some error happened
 */
router.put('/update-location/:locationId', async (req, res) => {
  // console.log('update-location', req.body);
  const { locationId } = req.params;
  let { locationName, locationAddress, locationCity, locationState, locationZip, locationPhone, locationEmail } = req.body;

      // Trim whitespace from each string
      locationName = locationName.trim();
      locationAddress = locationAddress.trim();
      locationCity = locationCity.trim();
      locationState = locationState.trim();
      locationZip = locationZip.trim();
      locationPhone = locationPhone.trim();
      locationEmail = locationEmail.trim();

  try {
    const [result] = await pool.query(
        "UPDATE location SET locationName = ?, locationAddress = ?, locationCity = ?, locationState = ?, locationZip = ?, locationPhone = ?, locationEmail = ?, updatedBy = 'API Location Update', updatedOn = CURRENT_TIMESTAMP WHERE locationId = ?",
        [locationName, locationAddress, locationCity, locationState, locationZip, locationPhone, locationEmail, locationId]
    );    

    // console.log('Query result:', result);

    if (result.affectedRows > 0) {
      res.status(200).json({message: 'Location updated successfully'});
    } else {
      res.status(404).json({message:'Location not found'});
    }
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Error updating location' });
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
 * /location/deactivate-location/{id}:
 *   put:
 *     summary: Deactivate the location by id
 *     security:
 *       - bearerAuth: []
 *     tags: 
 *       - Location
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the location to deactivate
 *     responses:
 *       200:
 *         description: Location deactivated successfully
 *       500:
 *         description: Error deactivating location
 */
router.put('/deactivate-location/:id', authenticateToken, async (req, res) => {
    const { id } = req.params; // Use req.params to get the path parameter

    try {
        const locationQuery = `UPDATE location 
            SET isActive = -1, updatedBy = "API Location Delete", updatedOn = CURRENT_TIMESTAMP
            WHERE locationId = ?;`;

        const [locationResult] = await pool.query(locationQuery, [id]);

        if (locationResult.affectedRows === 0) {
            return res.status(404).send('Location not found');
        }

        res.send('Location deactivated');
    } catch (error) {
        console.error('Error deactivating location:', error);
        res.status(500).send('Error deactivating location');
    }
});


/**
 * @swagger
 * components:
 *   schemas:
 *     Location:
 *       type: object
 *       required:
 *         - accountId
 *         - locationName
 *         - locationAddress
 *         - locationCity
 *         - locationState
 *         - locationZip
 *         - locationPhone
 *         - locationEmail
 *       properties:
 *         accountId:
 *           type: integer
 *           description: The ID of the account
 *         locationName:
 *           type: string
 *           description: The name of the location
 *         locationAddress:
 *           type: string
 *           description: The address of the location
 *         locationCity:
 *           type: string
 *           description: The city of the location
 *         locationState:
 *           type: string
 *           description: The state of the location
 *         locationZip:
 *           type: string
 *           description: The ZIP code of the location
 *         locationPhone:
 *           type: string
 *           description: The phone number of the location
 *         locationEmail:
 *           type: string
 *           description: The email of the location
 */

/**
 * @swagger
 * tags:
 *   name: Location
 *   description: Location API
 */

module.exports = router;
