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
      console.warn('get-class-list/:accountId: Connection not established.');
    };
  }
}); 

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
      console.warn('get-active-class-list/:accountId: Connection not established.');
    };
  }
});

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
      console.warn('get-class-by-id/:accountId/:classId: Connection not established.');
    };
    }
  });
 
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
            console.warn('deactivate-class/:accountId/:classId: Connection not established.');
          };
        }
  });
  

module.exports = router;