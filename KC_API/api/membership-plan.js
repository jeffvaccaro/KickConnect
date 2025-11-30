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

// Path-param alias for get-plan-by-id
router.get('/get-plan-by-id/:planId', authenticateToken, async (req, res) => {
    /* #swagger.tags = ['Membership Plan'] */
    let connection;
    try {
        const { planId } = req.params;
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
            console.warn('get-plan-by-id (path): Connection not established.');
        }
    }
});

// PUT Route (schema: planId, planName, planDescription, planCost)
router.put('/update-plan', authenticateToken, async (req, res) => {
    /* #swagger.tags = ['Membership Plan'] */
    const { planId } = req.query;
    const { planName, planDescription, planCost, isActive } = req.body; // isActive optional for update
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
        // isActive validation (optional). If provided must be boolean-ish 0/1
        let activeValue;
        if (isActive === undefined || isActive === null || isActive === '') {
            activeValue = undefined; // Do not change existing value
        } else {
            activeValue = (isActive === true || isActive === 1 || isActive === '1') ? 1 : 0;
        }
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000));
        connection = await Promise.race([connectToDatabase(), timeout]);
        let planUpdateQuery;
        let params;
        if (activeValue === undefined) {
            planUpdateQuery = `
                UPDATE admin.membershipplan
                SET planName = ?, planDescription = ?, planCost = ?
                WHERE planId = ?;
            `;
            params = [planName, planDescription, numericCost, planId];
        } else {
            planUpdateQuery = `
                UPDATE admin.membershipplan
                SET planName = ?, planDescription = ?, planCost = ?, isActive = ?
                WHERE planId = ?;
            `;
            params = [planName, planDescription, numericCost, activeValue, planId];
        }
        await connection.query(planUpdateQuery, params);
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

// Path-param alias for update-plan
router.put('/update-plan/:planId', authenticateToken, async (req, res) => {
    /* #swagger.tags = ['Membership Plan'] */
    const { planId } = req.params;
    const { planName, planDescription, planCost, isActive } = req.body;
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
        let activeValue;
        if (isActive === undefined || isActive === null || isActive === '') {
            activeValue = undefined;
        } else {
            activeValue = (isActive === true || isActive === 1 || isActive === '1') ? 1 : 0;
        }
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000));
        connection = await Promise.race([connectToDatabase(), timeout]);
        let planUpdateQuery;
        let params;
        if (activeValue === undefined) {
            planUpdateQuery = `
                UPDATE admin.membershipplan
                SET planName = ?, planDescription = ?, planCost = ?
                WHERE planId = ?;
            `;
            params = [planName, planDescription, numericCost, planId];
        } else {
            planUpdateQuery = `
                UPDATE admin.membershipplan
                SET planName = ?, planDescription = ?, planCost = ?, isActive = ?
                WHERE planId = ?;
            `;
            params = [planName, planDescription, numericCost, activeValue, planId];
        }
        await connection.query(planUpdateQuery, params);
        res.status(200).json({ message: 'Plan updated successfully' });
    } catch (err) {
        console.error('update-plan (path) error:', err);
        res.status(500).json({ error: 'Error executing plan query' });
    } finally {
        if (connection) {
            connection.release();
        } else {
            console.warn('update-plan (path): Connection not established.');
        }
    }
});

// POST Route (schema: planName, planDescription, planCost)
router.post('/add-plan', authenticateToken, async (req, res) => {
    /* #swagger.tags = ['Membership Plan'] */
    const { planName, planDescription, planCost, planPrice, isActive } = req.body; // planPrice legacy naming from UI, isActive new
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
    // isActive default to 1 if not provided
    const activeValue = (isActive === undefined || isActive === null || isActive === '')
        ? 1
        : (isActive === true || isActive === 1 || isActive === '1') ? 1 : 0;
    let connection;
    try {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000));
        connection = await Promise.race([connectToDatabase(), timeout]);
        let planInsertQuery, params;
        if (isActive === undefined || isActive === null || isActive === '') {
            // Rely on DB default for isActive
            planInsertQuery = `
                INSERT INTO admin.membershipplan (planName, planDescription, planCost)
                VALUES(?, ?, ?);
            `;
            params = [planName, planDescription, numericCost];
        } else {
            planInsertQuery = `
                INSERT INTO admin.membershipplan (planName, planDescription, planCost, isActive)
                VALUES(?, ?, ?, ?);
            `;
            params = [planName, planDescription, numericCost, activeValue];
        }
        const [result] = await connection.query(planInsertQuery, params);
        res.status(200).json({ message: 'Plan added successfully', planId: result.insertId });
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

// DELETE Route (query param alias)
router.delete('/delete-plan', authenticateToken, async (req, res) => {
    /* #swagger.tags = ['Membership Plan'] */
    const { planId } = req.query;
    if (!planId) {
        return res.status(400).json({ error: 'planId is required' });
    }
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
            console.warn('delete-skill (query): Connection not established.');
        }
    }
});

module.exports = router;
