// account.cjs
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const mysql = require('mysql2/promise');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { connectToDatabase } = require('./db');
const authenticateToken = require('./middleware/authenticateToken.cjs');

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

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
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Some server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
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
    let connection;
    try {
      const connection = await connectToDatabase();
      const [result] = await connection.query(
        'INSERT INTO location (accountId, locationName, locationAddress, locationCity, locationState, locationZip, locationPhone, locationEmail, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "API Location Insert")',
        [accountId, locationName, locationAddress, locationCity, locationState, locationZip, locationPhone, locationEmail]
      );
      res.status(201).json({ locationId: result.insertId });
    } catch (error) {
      console.error('Error creating location:', error);
      res.status(500).send('Error creating location');
    }finally{
      if (connection) {
        connection.release();
      } else {
        //console.warn('add-location: Connection not established.');
      };
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
 *     summary: Returns the list of ALL the locations
 *     security:
 *      - bearerAuth: []
 *     tags: [Location]
 *     responses:
 *       200:
 *         description: The list of ALL the locations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Location'
 *       500:
 *         description: Error fetching locations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
router.get('/get-locations', authenticateToken, async (req, res) => {
  let connection;
  try {
    const connection = await connectToDatabase();
    const [results] = await connection.query('SELECT * FROM location');
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).send('Error fetching locations');
  }finally{
    if (connection) {
      connection.release();
    } else {
      //console.warn('get-locations: Connection not established.');
    };
  }
});

router.get('/get-locations-by-acct-id/:acctId', authenticateToken, async (req, res) => {
  let connection;
  try {
    const connection = await connectToDatabase();
    const [results] = await connection.query('SELECT * FROM location WHERE accountId = ?', [acctId]);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).send('Error fetching locations');
  }finally{
    if (connection) {
      connection.release();
    } else {
      //console.warn('get-locations: Connection not established.');
    };
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
 * /location/get-active-locations:
 *  get:
 *     summary: Returns the list of ACTIVE locations
 *     security:
 *      - bearerAuth: []
 *     tags: [Location]
 *     responses:
 *       200:
 *         description: The list of ACTIVE locations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Location'
 *       500:
 *         description: Error fetching locations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
router.get('/get-active-locations', authenticateToken, async (req, res) => {
  let connection;
  try {
    const connection = await connectToDatabase();
    const [results] = await connection.query('SELECT * FROM location WHERE isActive = TRUE');
    res.status(200).json(results);
    
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).send('Error fetching locations');
  }finally{
    if (connection) {
      connection.release();
    } else {
      //console.warn('get-active-locations: Connection not established.');
    };
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
 * /location/get-inactive-locations:
 *  get:
 *     summary: Returns the list of INACTIVE locations
 *     security:
 *      - bearerAuth: []
 *     tags: [Location]
 *     responses:
 *       200:
 *         description: The list of INACTIVE locations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Location'
 *       500:
 *         description: Error fetching locations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
router.get('/get-inactive-locations', authenticateToken, async (req, res) => {
  let connection;
  try {
    const connection = await connectToDatabase();
    const [results] = await connection.query('SELECT * FROM location WHERE isActive = FALSE');
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).send('Error fetching locations');
  }finally{
    if (connection) {
      connection.release();
    } else {
      //console.warn('get-inactive-locations: Connection not established.');
    };
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
 *       500:
 *         description: Error fetching location
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
router.get('/get-locations-by-id/:id', async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    const connection = await connectToDatabase();
    const [results] = await connection.query('SELECT * FROM location WHERE locationId = ?', [id]);
    if (results.length > 0) {
      res.status(200).json(results[0]);
    } else {
      res.status(404).json({error:'Location not found'});
    }
  } catch (error) {
    //console.error('Error fetching location:', error);
    res.status(500).json({error:'Error fetching location'});
  }finally{
    if (connection) {
      connection.release();
    } else {
      //console.warn('get-locations-by-id/:id: Connection not established.');
    };
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
router.put('/update-location/:locationId', async (req, res) => {
  
  const { locationId } = req.params;
  let { locationName, locationAddress, locationCity, locationState, locationZip, locationPhone, locationEmail, isActive } = req.body;
  let connection;
      // Trim whitespace from each string
      locationName = locationName.trim();
      locationAddress = locationAddress.trim();
      locationCity = locationCity.trim();
      locationState = locationState.trim();
      locationZip = locationZip.trim();
      locationPhone = locationPhone.trim();
      locationEmail = locationEmail.trim();
      isActive = isActive;
  
  try {
    const connection = await connectToDatabase();
    const [result] = await connection.query(
        "UPDATE location SET locationName = ?, locationAddress = ?, locationCity = ?, locationState = ?, locationZip = ?, locationPhone = ?, locationEmail = ?, isActive = ?, updatedBy = 'API Location Update', updatedOn = CURRENT_TIMESTAMP WHERE locationId = ?",
        [locationName, locationAddress, locationCity, locationState, locationZip, locationPhone, locationEmail, isActive ,locationId]
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
  } finally {
    if (connection) {
      connection.release();
    } else {
      //console.warn('update-location/:locationId: Connection not established.');
    };
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
 *       404:
 *         description: Location not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Error deactivating location
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
router.put('/deactivate-location/:id', authenticateToken, async (req, res) => {
    const { id } = req.params; // Use req.params to get the path parameter
    let connection;
    try {
      const connection = await connectToDatabase();
      const locationQuery = `UPDATE location 
            SET isActive = -1, updatedBy = "API Location Delete", updatedOn = CURRENT_TIMESTAMP
            WHERE locationId = ?;`;

      const [locationResult] = await connection.query(locationQuery, [id]);
      if (locationResult.affectedRows === 0) {
          return res.status(404).json({error:'Location not found'});
      }

      res.json({message:'Location deactivated'});
    } catch (error) {
        // console.error('Error deactivating location:', error);
      res.status(500).json({error:'Error deactivating location'});
    }finally{
      if (connection) {
        connection.release();
      } else {
        //console.warn('deactivate-location/:id: Connection not established.');
      };
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
 *         - isActive
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
 *         isActive:
 *           type: integer
 *           description: Indicates if the location is active
 */


/**
 * @swagger
 * tags:
 *   name: Location
 *   description: Location API
 */

module.exports = router;
