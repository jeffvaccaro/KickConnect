// zipcode.cjs

const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const mysql = require('mysql2/promise');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('./db');
const authenticateToken = require('./middleware/authenticateToken.cjs');

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * @swagger
 * /common/get-address-info-by-zip/{zip}:
 *   get:
 *     summary: Get City/State Information by Zipcode
 *     tags: [Common]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: zip
 *         schema:
 *           type: integer
 *         required: true
 *         description: The City/State information is returned by Zipcode
 *     responses:
 *       200:
 *         description: The City/State information is returned by Zipcode
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Common'
 *       404:
 *         description: Error fetching City/State Info
 *       500:
 *         description: Error fetching City/State Info
 */
router.get('/get-address-info-by-zip/:zip', authenticateToken, async (req, res) => {
  const { zip } = req.params;
  let connection;
  try {
    const connection = await connectToDatabase();
    const [results] = await connection.query('SELECT * FROM common.cities_extended WHERE zip = ? LIMIT 1', [zip]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'City/State Info not found' });
    }
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Error fetching City/State Info:', error);
    res.status(500).send('Error fetching City/State Info');
  }finally{
    if (connection) {
      connection.release();
    } else {
      console.error('get-address-info-by-zip/:zip: Connection not established.');
    };
  }
});

module.exports = router;
