//class.cjs
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
  let connection;
  try {
    
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);

    const { accountId, className, classDescription, isActive } = req.body;
    const [result] = await connection.query(
      'INSERT INTO class (accountId, className, classDescription, isActive, createdBy) VALUES (?, ?, ?, ?, ?)', 
      [accountId, className, classDescription, isActive, 'API Class Insert']
    );
    
    res.status(201).json({ classId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error creating the Class: ' + error.message });
  }finally{
    if (connection) {
      connection.release();
    } else {
      console.warn('add-class: Connection not established.');
    };
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
  let connection;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);

    const { accountId } = req.params;
    const [results] = await connection.query('SELECT * FROM class WHERE accountId = ?', [accountId]);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching Classes:', error);
    res.status(500).json({ error: 'Error fetching Classes: ' + error.message });
  }finally{
    if (connection) {
      connection.release();
    } else {
      //console.warn('get-class-list/:accountId: Connection not established.');
    };
  }
}); 

/**
 * @swagger
 * /class/get-active-class-list:
 *   get:
 *     summary: Returns the list of all ACTIVE classes by accountId
 *     tags: [Class]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of the active classes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Class'
 */
router.get('/get-active-class-list/:accountId', authenticateToken, async (req, res) => {
  let connection;
  try {

    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);

    const { accountId } = req.params;
    const [results] = await connection.query('SELECT classId, className, classDescription, isActive FROM class WHERE accountId = ? AND isActive = true', [accountId]);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching Classes:', error);
    res.status(500).json({ error: 'Error fetching Classes: ' + error.message });
  }finally{
    if (connection) {
      connection.release();
    } else {
      //console.warn('get-active-class-list/:accountId: Connection not established.');
    };
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
    let connection;
    try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
      connection = await Promise.race([connectToDatabase(), timeout]);

      const [results] = await connection.query('SELECT * FROM class WHERE accountId = ? AND classId = ?', [accountId, classId]);
      if (results.length === 0) {
        return res.status(404).json({ message: 'Class not found' });
      }
      res.status(200).json(results[0]);
    } catch (error) {
      // console.error('Error fetching Class:', error);
      res.status(500).json({ error: 'Error fetching Class: ' + error.message });
    }finally{
      if (connection) {
      connection.release();
    } else {
      //console.warn('get-class-by-id/:accountId/:classId: Connection not established.');
    };
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
    let connection;
    try {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
        connection = await Promise.race([connectToDatabase(), timeout]);

        const [results] = await connection.query(
          "UPDATE class SET className = ?, classDescription = ?, isActive = ?, updatedBy = 'API Location Update', updatedOn = CURRENT_TIMESTAMP WHERE classId = ?",
          [className, classDescription, isActive, classId]
        );
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: 'Class not found' });
        }
        res.status(200).json({ classId, className, classDescription });
      
        } catch (error) {
          console.error('Error updating Class:', error);
          res.status(500).json({error:'Error updating Class' + error.message});
        }finally{
          if (connection) {
            connection.release();
          } else {
            console.warn('update-class/:classId: Connection not established.');
          };
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
    let connection;
    try {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
        connection = await Promise.race([connectToDatabase(), timeout]);

        const classQuery = `
          UPDATE class 
          SET isActive = false, updatedBy = "API Class Delete", updatedOn = CURRENT_TIMESTAMP
          WHERE accountId = ? AND classId = ?;
        `;
  
        const [classResult] = await connection.query(classQuery, [accountId, classId]);
  
          if (classResult.affectedRows === 0) {
            return res.status(404).json({message:'Class not found'});
          }  
          res.status(204).json({message: 'Class deactivated'});
        } catch (error) {
          //console.error('Error deactivating Class:', error);
          res.status(500).json({error: 'Error deactivating Class' + error.message});
        }finally{
          if (connection) {
            connection.release();
          } else {
            //console.warn('deactivate-class/:accountId/:classId: Connection not established.');
          };
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