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

router.get('/get-all-roles', authenticateToken, async (req, res) => {
  let connection;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);
    const [results] = await connection.query('SELECT * FROM role ORDER BY roleOrderId ASC');
    // console.log('role results', results);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Error executing query' });
  } finally {
    if (connection) {
      connection.release();
    } else {
      console.warn('get-all-roles: Connection not established.');
    }
  }
});

router.get('/get-roles', authenticateToken, async (req, res) => {
  let connection;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);
    const [results] = await connection.query('SELECT * FROM role WHERE roleId != 1 ORDER BY roleOrderId ASC');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Error executing query' });
  } finally {
    if (connection) {
      connection.release();
    } else {
      console.warn('get-roles: Connection not established.');
    }
  }
});

router.get('/get-role-by-id', authenticateToken, async (req, res) => {
  let connection;
  try {
    const { roleId } = req.query;
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);
    const [roleResults] = await connection.query('SELECT * FROM role WHERE roleId = ?', [roleId]);
    res.json(roleResults[0] || {}); // Return the first record or an empty object if no record is found
  } catch (err) {
    res.status(500).json({ error: 'Error executing query' });
  } finally {
    if (connection) {
      connection.release();
    } else {
      console.warn('get-role-by-id: Connection not established.');
    }
  }
});

router.post('/add-role', authenticateToken, async (req, res) => {
  const { roleName, roleDescription } = req.body;
  let connection;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);
    try {
      const roleInsertQuery = `
        INSERT INTO admin.role (roleName, roleDescription, roleOrderId)
        SELECT ?, ?, IFNULL(MAX(roleOrderId) + 1, 1)
        FROM admin.role;
      `;
      const [roleResults] = await connection.query(roleInsertQuery, [roleName, roleDescription]);
      //console.log('add-role', roleResults);
      res.status(200).json({ message: 'Role Added Successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error executing role query' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error adding Role' });
  } finally {
    if (connection) {
      connection.release();
    } else {
      console.warn('add-role: Connection not established.');
    }
  }
});

router.put('/update-role', authenticateToken, async (req, res) => {
  const { roleId } = req.query;
  const { roleName, roleDescription } = req.body;
  let connection;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);
    try {
      const roleUpdateQuery = `
        UPDATE role
        SET roleName = ?, roleDescription = ?
        WHERE roleId = ?;
      `;
      const [userResult] = await connection.query(roleUpdateQuery, [roleName, roleDescription, roleId]);
      res.status(200).json({ message: 'Role updated successfully' });
    } catch (err) {
      res.status(500).json({ error: 'rror executing role query' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating Role' });
  } finally {
    if (connection) {
      connection.release();
    } else {
      console.error('add-role: Connection not established.');
    }
  }
});

router.put('/update-role-order', authenticateToken, async (req, res) => {
  const { roleId } = req.query;
  const { roleOrderId } = req.body;
  let connection;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);
    await connection.query('SET SQL_SAFE_UPDATES = 0;'); // Disable safe update mode
    await connection.beginTransaction();
    const [currentRole] = await connection.query('SELECT roleOrderId FROM role WHERE roleId = ?', [roleId]);
    const currentRoleOrderId = currentRole[0].roleOrderId;
    if (currentRoleOrderId < roleOrderId) {
      await connection.query('UPDATE role SET roleOrderId = roleOrderId - 1 WHERE roleOrderId > ? AND roleOrderId <= ?', [currentRoleOrderId, roleOrderId]);
    } else if (currentRoleOrderId > roleOrderId) {
      await connection.query('UPDATE role SET roleOrderId = roleOrderId + 1 WHERE roleOrderId >= ? AND roleOrderId < ?', [roleOrderId, currentRoleOrderId]);
    }
    await connection.query('UPDATE role SET roleOrderId = ? WHERE roleId = ?', [roleOrderId, roleId]);
    await connection.commit();
    res.status(200).json({ message: 'Role ORDER updated successfully' });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    res.status(500).json({ error: 'Error updating Role ORDER' });
  } finally {
    if (connection) {
      connection.release();
    } else {
      console.warn('update-role-order: Connection not established.');
    }
  }
});

router.post('/delete-role/:roleid'), authenticateToken, async(req, res)=>{
  const { roleId } = req.query;
  let connection;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000)); // 10 seconds timeout
    connection = await Promise.race([connectToDatabase(), timeout]);
    try {
      const roleDeleteQuery = `
        DELETE FROM role
        WHERE roleId = ?;
      `;
      const [userResult] = await connection.query(roleDeleteQuery, [roleName, roleDescription, roleId]);
      res.status(200).json({ message: 'Role DELETED successfully' });
    } catch (err) {
      res.status(500).json({ error: 'error executing role query' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting Role' });
  } finally {
    if (connection) {
      connection.release();
    } else {
      console.error('delete-role: Connection not established.');
    }
  }
}

module.exports = router;
