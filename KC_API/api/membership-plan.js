const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const mysql = require('mysql2/promise');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('./db');
const authenticateToken = require('./middleware/authenticateToken.cjs');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// GET Routes
router.get('/get-all-plans', authenticateToken, async (req, res) => {
    /* #swagger.tags = ['Membership Plan'] */
    console.log('get-all-plans endpoint hit');
    let connection;
    try {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000));
        connection = await Promise.race([connectToDatabase(), timeout]);
        const [results] = await connection.query('SELECT * FROM admin.membershipplan ORDER BY planCost ASC');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'Error executing query' });
    } finally {
        if (connection) {
            connection.release();
        } else {
            console.warn('get-all-plans: Connection not established.');
        }
    }
});

router.get('/get-plan-by-id', authenticateToken, async (req, res) => {
    /* #swagger.tags = ['Membership Plan'] */
    let connection;
    try {
        const { planId } = req.query;
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000));
        connection = await Promise.race([connectToDatabase(), timeout]);
        const [planResults] = await connection.query('SELECT * FROM admin.membershipplan WHERE planId = ?', [planId]);
        res.json(planResults[0] || {});
    } catch (err) {
        res.status(500).json({ error: 'Error executing query' });
    } finally {
        if (connection) {
            connection.release();
        } else {
            console.warn('get-plan-by-id: Connection not established.');
        }
    }
});

// PUT Route (schema: planId, planName, planDescription, planCost)
router.put('/update-plan', authenticateToken, async (req, res) => {
    /* #swagger.tags = ['Membership Plan'] */
    const { planId } = req.query;
    const { planName, planDescription, planCost } = req.body;
    let connection;
    try {
        if (!planId) {
            return res.status(400).json({ error: 'planId is required' });
        }
        if (!planName || String(planName).trim() === '') {
            return res.status(400).json({ error: 'planName is required' });
        }
        if (!planDescription || String(planDescription).trim() === '') {
            return res.status(400).json({ error: 'planDescription is required' });
        }
        if (planCost === undefined || planCost === null || planCost === '') {
            return res.status(400).json({ error: 'planCost is required' });
        }
        const numericCost = Number(planCost);
        if (isNaN(numericCost) || numericCost < 0) {
            return res.status(400).json({ error: 'planCost must be a non-negative number' });
        }
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000));
        connection = await Promise.race([connectToDatabase(), timeout]);
        const planUpdateQuery = `
            UPDATE admin.membershipplan
            SET planName = ?, planDescription = ?, planCost = ?
            WHERE planId = ?;
        `;
        await connection.query(planUpdateQuery, [planName, planDescription, numericCost, planId]);
        res.status(200).json({ message: 'Plan updated successfully' });
    } catch (err) {
        console.error('update-plan error:', err);
        res.status(500).json({ error: 'Error executing plan query' });
    } finally {
        if (connection) {
            connection.release();
        } else {
            console.warn('update-plan: Connection not established.');
        }
    }
});

// POST Route (schema: planName, planDescription, planCost)
router.post('/add-plan', authenticateToken, async (req, res) => {
    /* #swagger.tags = ['Membership Plan'] */
    const { planName, planDescription, planCost, planPrice } = req.body; // planPrice legacy naming from UI
    console.log('add-plan endpoint hit with data:', req.body);
    // Early validation (avoid misleading connection log)
    if (!planName || String(planName).trim() === '') {
        return res.status(400).json({ error: 'planName is required' });
    }
    if (!planDescription || String(planDescription).trim() === '') {
        return res.status(400).json({ error: 'planDescription is required' });
    }
    const rawCost = planCost !== undefined ? planCost : planPrice;
    if (rawCost === undefined || rawCost === null || rawCost === '') {
        return res.status(400).json({ error: 'planCost is required' });
    }
    const numericCost = Number(rawCost);
    if (isNaN(numericCost) || numericCost < 0) {
        return res.status(400).json({ error: 'planCost must be a non-negative number' });
    }
    let connection;
    try {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000));
        connection = await Promise.race([connectToDatabase(), timeout]);
        const planInsertQuery = `
            INSERT INTO admin.membershipplan (planName, planDescription, planCost)
            VALUES(?, ?, ?);
        `;
        const [result] = await connection.query(planInsertQuery, [planName, planDescription, numericCost]);
        res.status(200).json({ message: 'Plan added successfully' });
    } catch (err) {
        console.error('add-plan error:', err);
        res.status(500).json({ error: 'Error executing plan query' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// DELETE Route
router.delete('/delete-plan/:planId', authenticateToken, async (req, res) => {
    /* #swagger.tags = ['Membership Plan'] */
    const { planId } = req.params;
    let connection;
    try {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000));
        connection = await Promise.race([connectToDatabase(), timeout]);
        const planDeleteQuery = `
            DELETE FROM admin.membershipplan
            WHERE planId = ?;
        `;
        await connection.query(planDeleteQuery, [planId]);
        res.status(200).json({ message: 'Plan deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error executing plan query' });
    } finally {
        if (connection) {
            connection.release();
        } else {
            console.warn('delete-skill: Connection not established.');
        }
    }
});

module.exports = router;
