//class.cjs
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
 * /class/add-class:
 *   post:
 *     summary: Create a new class
 *     tags: [Class]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Class'
 *     responses:
 *       201:
 *         description: The class was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
 *       500:
 *         description: Some server error
 */
router.post('/add-class/', authenticateToken, async (req, res) => {
    try {
    const { accountId, className, classDescription, isActive } = req.body;
    const [result] = await pool.query(
        'INSERT INTO Class (accountId, className, classDescription, isActive, createdBy) VALUES (?, ?, ?, ?, ?)', 
        [accountId, className, classDescription, isActive, 'API Class Insert']
    );
      res.status(201).json({ classId: result.insertId  });
    } catch (error) {
        //console.error('Error creating the Class:', error);
        res.status(500).json({error:'Error creating the Class' + error.message});
    }
  });
  
/**
 * @swagger
 * /class/get-class-list:
 *   get:
 *     summary: Returns the list of all the classes
 *     tags: [Class]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of the classes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Class'
 */
router.get('/get-class-list/:accountId', authenticateToken, async (req, res) => {
    try {
      const { accountId} = req.params;
      const [results] = await pool.query('SELECT * FROM Class WHERE accountId = ?', [accountId]);
      res.status(200).json(results);
    } catch (error) {
      console.error('Error fetching Classes:', error);
      res.status(500).json({ errror: 'Error fetching Classes' + error.message});
    }
  }); 

  /**
 * @swagger
 * /class/get-class/{id}:
 *   get:
 *     summary: Get the class by id
 *     tags: [Class]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The class id
 *     responses:
 *       200:
 *         description: The class description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
 *       404:
 *         description: The class was not found
 *       500:
 *         description: Some server error
 */
  router.get('/get-class-by-id/:accountId/:classId', authenticateToken, async (req, res) => {
    const { accountId, classId } = req.params;
    try {
      const [results] = await pool.query('SELECT * FROM Class WHERE accountId = ? AND classId = ?', [accountId, classId]);
      if (results.length === 0) {
        return res.status(404).json({ message: 'Class not found' });
      }
      res.status(200).json(results[0]);
    } catch (error) {
      // console.error('Error fetching Class:', error);
      res.status(500).json({ error: 'Error fetching Class: ' + error.message });
    }
  });
 
  /**
 * @swagger
 * /class/update-class/{id}:
 *   put:
 *     summary: Update the class by the id
 *     tags: [Class]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The class id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Class'
 *     responses:
 *       200:
 *         description: The class was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
 *       404:
 *         description: The class was not found
 *       500:
 *         description: Some server error
 */
  router.put('/update-class/:classId', authenticateToken, async (req, res) => {
    const { classId } = req.params;
    const { className, classDescription, isActive } = req.body;
    try {
      const [results] = await pool.query(
        "UPDATE Class SET className = ?, classDescription = ?, isActive = ?, updatedBy = 'API Location Update', updatedOn = CURRENT_TIMESTAMP WHERE classId = ?",
        [className, classDescription, isActive, classId]
      );
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Class not found' });
      }
      res.status(200).json({ classId, className, classDescription });
    } catch (error) {
      console.error('Error updating Class:', error);
      res.status(500).json({error:'Error updating Class' + error.message});
    }
  });
  
 
 /**
 * @swagger
 * /class/deactivate-class/{id}:
 *   delete:
 *     summary: Remove the class by id
 *     tags: [Class]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The class id
 *     responses:
 *       204:
 *         description: The class was deleted
 *       404:
 *         description: The class was not found
 *       500:
 *         description: Some server error
 */
 router.delete('/deactivate-class/:accountId/:classId', authenticateToken, async (req, res) => {
    const { accountId, classId } = req.params;
  
    try {
      const classQuery = `
        UPDATE Class 
        SET isActive = false, updatedBy = "API Class Delete", updatedOn = CURRENT_TIMESTAMP
        WHERE accountId = ? AND classId = ?;
      `;
  
      const [classResult] = await pool.query(classQuery, [accountId, classId]);
  
      if (classResult.affectedRows === 0) {
        return res.status(404).json({message:'Class not found'});
      }  
      res.status(204).json({message: 'Class deactivated'});
    } catch (error) {
      //console.error('Error deactivating Class:', error);
      res.status(500).json({error: 'Error deactivating Class' + error.message});
    }
  });
  


 /**
 * @swagger
 * components:
 *   schemas:
 *     Class:
 *       type: object
 *       required:
 *         - className
 *         - classDescription
 *       properties:
 *         accountId:
 *           type: integer
 *           description: "ID of the account"
 *         classId:
 *           type: integer
 *           description: The auto-generated id of the class
 *         className:
 *           type: string
 *           description: The name of the class
 *         classDescription:
 *           type: string
 *           description: The description of the class
 *       example:
 *         accountId: 1
 *         classId: 1
 *         className: Yoga
 *         classDescription: A relaxing yoga class
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Class
 *   description: Class API
 */




module.exports = router;