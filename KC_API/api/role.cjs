//role.cjs

const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
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
 *  /role/get-roles:
 *      get:
 *          tags:
 *              - Role
 *          summary: Gets ALL Roles
 *          security:
 *              - bearerAuth: []
 *          responses:
 *              200:
 *                  description: Roles SUCCESSFULLY returned!
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *          servers:
 *              - url: http://localhost:3000
 */

router.get('/get-roles', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [results] = await connection.query('SELECT * FROM role ORDER BY roleOrderId ASC');
        connection.release();
        res.json(results);
      } catch (err) {
        // console.error('Error executing query:', err);
        res.status(500).json({ error: 'Error executing query' }); // Send a JSON error response
      }
  });
  
  /**
 * @swagger
 * /get-role-by-id:
 *   get:
 *     summary: Retrieve a role by ID
 *     description: This endpoint retrieves a role from the database based on the provided roleId.
 *     tags:
 *       - Role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the role to retrieve
 *     responses:
 *       '200':
 *         description: A role object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 roleId:
 *                   type: integer
 *                   description: The role ID
 *                   example: 1
 *                 roleName:
 *                   type: string
 *                   description: The name of the role
 *                   example: Admin
 *                 roleOrderId:
 *                   type: integer
 *                   description: The order ID of the role
 *                   example: 1
 *       '500':
 *         description: Error executing query
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error executing query
 */
router.get('/get-role-by-id', authenticateToken, async (req, res) => {
  try {
    const { roleId } = req.query;
    const connection = await pool.getConnection();
    const [roleResults] = await connection.query('SELECT * FROM role WHERE roleId = ?', [roleId]);
    
    res.json(roleResults[0] || {}); // Return the first record or an empty object if no record is found
    connection.release();
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'Error executing query' });
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
 *   /role/add-role:
 *     post:
 *       tags:
 *         - Role
 *       summary: Add new Role
 *       security:
 *         - bearerAuth: [] 
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 roleName:
 *                   type: string
 *                   description: Name of the Role
 *                 roleDescription:
 *                   type: string
 *                   description: Description of the Role
 *       responses:
 *         200:
 *           description: Role Added
 *         500:
 *           description: Error executing query
 *       servers:
 *         - url: http://localhost:3000/
 */
router.post('/add-role', authenticateToken, async (req, res) => {
    const { roleName, roleDescription } = req.body;
  
    try {
      const connection = await pool.getConnection();
      try {
        const roleInsertQuery = `
          INSERT INTO admin.role (roleName, roleDescription, roleOrderId)
          SELECT ?, ?, IFNULL(MAX(roleOrderId) + 1, 1)
          FROM admin.role;
        `;
  
        const [roleResults] = await connection.query(roleInsertQuery, [roleName, roleDescription]);
        res.status(200).json({message: 'Role Added Sucessfully'});
        
      } catch (err) {
        // console.error('Error executing role query:', err);
        res.status(500).json({ message: 'Error executing role query'});
      } finally {
        connection.release(); // Ensure the connection is released back to the pool
      }
    } catch (error) {
      // console.error('Error getting connection from pool:', error);
      res.status(500).json({ error: 'Error adding Role' }); // Send a JSON error response
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
 *   /role/update-role:
 *     put:
 *       tags:
 *         - Role
 *       summary: Update Role record
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: roleId
 *           schema:
 *             type: string
 *           required: true
 *           description: The role ID to update
 *       requestBody:
 *         description: The Role details to update
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 roleName:
 *                   type: string
 *                   description: Role Name
 *                 roleDescription:
 *                   type: string
 *                   description: Description of what the Role is
 *       responses:
 *         200:
 *           description: Role successfully updated
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The Role ID
 *                   roleName:
 *                     type: string
 *                     description: The Role name
 *                   roleDescription:
 *                     type: string
 *                     description: The Role description
 *       servers:
 *         - url: http://localhost:3000
 */
router.put('/update-role', authenticateToken, async (req, res) => {
    const { roleId } = req.query;
    const { roleName, roleDescription } = req.body;
  
    try {
      const connection = await pool.getConnection();
      try {
        // Update role with roleId
        const roleUpdateQuery = `
          UPDATE role 
          SET roleName = ?, roleDescription = ?
          WHERE roleId = ?;
        `;
  
        const [userResult] = await connection.query(roleUpdateQuery, [roleName, roleDescription, roleId]);
        // console.log('Query executed successfully:', userResult);
        res.status(200).json({message: 'Role updated successfully'});
      } catch (err) {
        // console.error('Error executing role query:', err);
        res.status(500).json({ error: 'rror executing role query' }); // Send a JSON error response
      } finally {
        connection.release(); // Ensure the connection is released back to the pool
      }
    } catch (error) {
      // console.error('Error getting connection from pool:', error);
      res.status(500).json({ error: 'Error updating Role' }); // Send a JSON error response
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
 *   /role/update-role-order:
 *     put:
 *       tags:
 *         - Role
 *       summary: Update Role Order
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: roleId
 *           schema:
 *             type: string
 *           required: true
 *           description: The role ID to update
 *       requestBody:
 *         description: The Role details to update
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 roleOrderId:
 *                   type: integer
 *                   description: New roleOrderId
 *       responses:
 *         200:
 *           description: Role successfully updated
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   roleOrderId:
 *                     type: integer
 *                     description: New roleOrderId
 *       servers:
 *         - url: http://localhost:3000
 */
router.put('/update-role-order', async (req, res) => {
    const { roleId } = req.query;
    const { roleOrderId } = req.body;

    try {
        const connection = await pool.getConnection();
        await connection.query('SET SQL_SAFE_UPDATES = 0;'); // Disable safe update mode

        await connection.beginTransaction();

        // Get the current roleOrderId of the roleId
        const [currentRole] = await connection.query(
            'SELECT roleOrderId FROM role WHERE roleId = ?',
            [roleId]
        );

        const currentRoleOrderId = currentRole[0].roleOrderId;

        if (currentRoleOrderId < roleOrderId) {
            // Increment roleOrderId values that need to be shifted down
            // console.log(`Incrementing roleOrderId values >= ${currentRoleOrderId} and < ${roleOrderId}`);
            await connection.query(
                'UPDATE role SET roleOrderId = roleOrderId - 1 WHERE roleOrderId > ? AND roleOrderId <= ?',
                [currentRoleOrderId, roleOrderId]
            );
        } else if (currentRoleOrderId > roleOrderId) {
            // Decrement roleOrderId values that need to be shifted up
            // console.log(`Decrementing roleOrderId values > ${roleOrderId} and <= ${currentRoleOrderId}`);
            await connection.query(
                'UPDATE role SET roleOrderId = roleOrderId + 1 WHERE roleOrderId >= ? AND roleOrderId < ?',
                [roleOrderId, currentRoleOrderId]
            );
        }

        // Update the specific roleOrderId for the given roleId
        // console.log(`Updating roleOrderId to ${roleOrderId} for roleId ${roleId}`);
        await connection.query(
            'UPDATE role SET roleOrderId = ? WHERE roleId = ?',
            [roleOrderId, roleId]
        );

        await connection.commit();
        connection.release();

        res.status(200).json({message: 'Role ORDER updated successfully'});
    } catch (error) {
        //console.log('Error:', error);
        if (connection) {
            res.status(500).json({error: error});
            await connection.rollback();
            connection.release();
        }
        //console.error('Error updating role order:', error);
        res.status(500).json({error: 'Error updating Role ORDER'});
    }
});



module.exports = router;