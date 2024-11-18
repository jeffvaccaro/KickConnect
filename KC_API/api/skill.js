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

router.get('/get-all-skills', authenticateToken, async (req, res) => {
  let connection;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);
    const [results] = await connection.query('SELECT * FROM skill ORDER BY skillName ASC');

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Error executing query' });
  } finally {
    if (connection) {
      connection.release();
    } else {
      console.warn('get-all-skills: Connection not established.');
    }
  }
});

router.get('/get-skill-by-id', authenticateToken, async (req, res) => {
  let connection;
  try {
    const { skillId } = req.query;
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);
    const [roleResults] = await connection.query('SELECT * FROM skill WHERE skillId = ?', [skillId]);
    res.json(roleResults[0] || {}); // Return the first record or an empty object if no record is found
  } catch (err) {
    res.status(500).json({ error: 'Error executing query' });
  } finally {
    if (connection) {
      connection.release();
    } else {
      console.warn('get-skill-by-id: Connection not established.');
    }
  }
});

router.post('/add-skill', authenticateToken, async (req, res) => {
  const { skillName, skillDescription } = req.body;
  let connection;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);
    try {
      const skillInsertQuery = `
        INSERT INTO admin.skill (skillName, skillDescription)
        VALUES(?, ?);
      `;
      const [skillResults] = await connection.query(skillInsertQuery, [skillName, skillDescription]);
      console.log('add-skill', skillResults);

      res.status(200).json({ message: 'Skill Added Successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error executing skill query' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error adding Skill' });
  } finally {
    if (connection) {
      connection.release();
    } else {
      console.warn('add-skill: Connection not established.');
    }
  }
});


router.put('/update-skill', authenticateToken, async (req, res) => {
  const { skillId } = req.query;
  const { skillName, skillDescription } = req.body;
  let connection;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);
    try {
      const skillUpdateQuery = `
        UPDATE skill
        SET skillName = ?, skillDescription = ?
        WHERE skillId = ?;
      `;
      const [userResult] = await connection.query(skillUpdateQuery, [skillName, skillDescription, skillId]);
      res.status(200).json({ message: 'skill updated successfully' });
    } catch (err) {
      res.status(500).json({ error: 'error executing role query' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating skill' });
  } finally {
    if (connection) {
      connection.release();
    } else {
      console.error('add-skill: Connection not established.');
    }
  }
});

router.post('/delete-skill/:skillid'), authenticateToken, async(req, res)=>{
  const { skillId } = req.query;
  let connection;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);
    try {
      const skillDeleteQuery = `
        DELETE FROM skill
        WHERE skillId = ?;
      `;
      const [userResult] = await connection.query(skillDeleteQuery, [skillId]);
      res.status(200).json({ message: 'skill DELETED successfully' });
    } catch (err) {
      res.status(500).json({ error: 'error executing role query' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting skill' });
  } finally {
    if (connection) {
      connection.release();
    } else {
      console.error('delete-skill: Connection not established.');
    }
  }
}

module.exports = router;
