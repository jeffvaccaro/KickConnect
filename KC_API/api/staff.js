const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const upload = require('./upload.js');
const mysql = require('mysql2/promise');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { sendEmail } = require('./middleware/emailService.js');
const { connectToDatabase } = require('./db.js');
const authenticateToken = require('./middleware/authenticateToken.cjs');
const RoleEnum = require('./enum/roleEnum.js');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * @swagger
 * /staff/get-all-staff:
 *   get:
 *     tags:
 *       - Staff
 *     summary: Gets all staffs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of staffs
 */
/* #swagger.tags = ['Staff'] */
router.get('/get-all-staff', authenticateToken, async (req, res) => {
    /* #swagger.tags = ['Staff'] */
    let connection;
    try {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000));
        connection = await Promise.race([connectToDatabase(), timeout]);

        const query = `
            SELECT a.accountName, a.accountCode, u.*, GROUP_CONCAT(DISTINCT r.roleName SEPARATOR ', ') AS roleNames, p.description, p.skills, p.url
            FROM admin.account a
            INNER JOIN admin.staff u ON a.accountId = u.accountId
            INNER JOIN admin.staffroles ur ON u.staffId = ur.staffId
            INNER JOIN admin.role r ON ur.roleId = r.roleId
            LEFT JOIN admin.profile p ON u.staffId = p.staffId
            GROUP BY a.accountName, a.accountCode, u.staffId, p.description, p.skills, p.url`;
        
        const [results] = await connection.query(query);
        res.json(results);
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Error executing query' });
    } finally {
        if (connection) {
            connection.release();
        } else {
            console.warn('get-all-staff: Connection not established.');
        }
    }
});

/**
 * @swagger
 * /staff/get-staff-by-account-staff:
 *   get:
 *     tags:
 *       - Staff
 *     summary: Get staffs for a specific account code (excludes roleId 1)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: accountcode
 *         schema:
 *           type: string
 *         required: true
 *         description: Account code to filter staff by
 *     responses:
 *       200:
 *         description: List of staffs for the account
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */

router.get('/get-staff-by-account-staff', authenticateToken, async (req, res) => {
    /* #swagger.tags = ['Staff'] */
    const accountCode = req.query.accountcode;
    let connection;
    try {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000));
        connection = await Promise.race([connectToDatabase(), timeout]);

        const query = `
            SELECT a.accountName, u.*, r.roleName AS roleNames
            FROM admin.account a
            INNER JOIN admin.staff u ON a.accountId = u.accountId
            INNER JOIN admin.staffroles ur ON u.staffId = ur.staffId
            INNER JOIN admin.role r ON ur.roleId = r.roleId
            WHERE a.accountcode = ?
            AND ur.roleId != 1
        `;
        const [results] = await connection.query(query, [accountCode]);
        res.json(results);
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Error executing query' });
    } finally {
        if (connection) {
            connection.release();
        } else {
            console.warn('get-staff-by-account-staff: Connection not established.');
        }
    }
});

/**
 * @swagger
 * /staff/get-staff:
 *   get:
 *     tags:
 *       - Staff
 *     summary: Get staffs by accountCode (returns [] when none)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: accountCode
 *         schema:
 *           type: string
 *         required: true
 *         description: Account code to lookup
 *     responses:
 *       200:
 *         description: List of staffs (may be empty)
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */

router.get('/get-staff', authenticateToken, async (req, res) => {
    /* #swagger.tags = ['Staff'] */
    let connection;
    try {
        let { accountCode } = req.query;

        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000));
        connection = await Promise.race([connectToDatabase(), timeout]);

        const [accountResults] = await connection.query('SELECT accountId FROM account WHERE accountCode = ?', [accountCode]);
        if (accountResults.length === 0) {
            return res.status(404).send('Account not found');
        }
        const accountId = accountResults[0].accountId;

        const query = `
            SELECT a.accountName, a.accountCode, s.*, GROUP_CONCAT(DISTINCT r.roleName SEPARATOR ', ') AS roleNames, p.description, p.skills, p.url
            FROM admin.account a
            INNER JOIN admin.staff s ON a.accountId = s.accountId
            INNER JOIN admin.staffroles sr ON s.staffId = sr.staffId
            INNER JOIN admin.role r ON sr.roleId = r.roleId
            LEFT JOIN admin.profile p ON s.staffId = p.staffId
            WHERE s.accountId = ?
            AND sr.roleId != 1
            GROUP BY a.accountName, a.accountCode, s.staffId, p.description, p.skills, p.url
        `;

        const [staffResults] = await connection.query(query, [accountId]);
        console.log('staffResults', staffResults);
        res.json(staffResults.length ? staffResults : []);
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Error executing query' });
    } finally {
        if (connection) {
            connection.release();
        } else {
            console.warn('get-staff: Connection not established.');
        }
    }
});

/**
 * @swagger
 * /staff/get-staff-by-id:
 *   get:
 *     tags:
 *       - Staff
 *     summary: Get detailed staff info by staffId
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: staffId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the staff to retrieve
 *     responses:
 *       200:
 *         description: staff object
 *       500:
 *         description: Server error
 */

router.get('/get-staff-by-id', authenticateToken, async (req, res) => {
    /* #swagger.tags = ['Staff'] */
    let connection;
  try {
      const { staffId } = req.query;

      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000));
      connection = await Promise.race([connectToDatabase(), timeout]);

      const query = `
          SELECT 
              u.*, 
              GROUP_CONCAT(DISTINCT r.roleName SEPARATOR ', ') AS roleNames, 
              GROUP_CONCAT(DISTINCT r.roleId SEPARATOR ',') as roleId,
              MAX(p.profileId) AS profileId, 
              MAX(p.description) AS profileDescription, 
              MAX(p.skills) as profileSkills, 
              MAX(p.url) as profileURL,
              MAX(primaryLoc.locationId) as primaryLocation,
              GROUP_CONCAT(DISTINCT altLoc.locationId SEPARATOR ',') as altLocations
          FROM admin.staff u
          JOIN admin.staffroles ur ON u.staffId = ur.staffId
          JOIN admin.role r ON ur.roleId = r.roleId
          LEFT JOIN admin.profile p on u.staffId = p.staffId
          LEFT JOIN admin.profilelocation primaryLoc ON p.profileId = primaryLoc.profileId AND primaryLoc.isHome = 1
          LEFT JOIN admin.profilelocation altLoc ON p.profileId = altLoc.profileId AND altLoc.isHome = 0
          WHERE u.staffId = ?
          AND ur.roleId != 1 
          GROUP BY u.staffId
      `;    
      const [staffResults] = await connection.query(query, [staffId]);

      res.json(staffResults[0] || {});
  } catch (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Error executing query' });
  } finally {
      if (connection) {
          connection.release();
      } else {
          console.warn('get-staff-by-id: Connection not established.');
      }
  }
});

/**
 * @swagger
 * /staff/send-staff-reset-link:
 *   get:
 *     tags:
 *       - Staff
 *     summary: Send password reset link to a staff
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: staffId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the staff
 *       - in: query
 *         name: accountCode
 *         schema:
 *           type: string
 *         required: true
 *         description: Account code for the staff
 *     responses:
 *       200:
 *         description: Reset link sent
 *       400:
 *         description: Missing parameters
 *       404:
 *         description: staff not found
 *       500:
 *         description: Server error
 */

router.get('/send-staff-reset-link', authenticateToken, async (req, res) => {
    /* #swagger.tags = ['Staff'] */
    let connection;
  try {
      console.log('express method called');
      const { staffId, accountCode } = req.query;

      if (!staffId || !accountCode) {
          return res.status(400).json({ error: 'Missing required parameters' });
      }

      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000));
      
      console.log('Attempting to establish database connection...');
      connection = await Promise.race([connectToDatabase(), timeout]);
      console.log('Database connection established:', connection);
      
      if (!connection) {
          return res.status(500).json({ error: 'Failed to establish a connection' });
      }

      const query = `
          SELECT u.email, u.name, u.staffId, u.accountId
          FROM admin.staff u
          WHERE u.staffId = ?
      `;
      
      console.log('Executing query:', query, 'with parameters:', [staffId]);

      const [staffResults] = await connection.query(query, [staffId]);

      if (staffResults.length === 0) {
          return res.status(404).json({ error: 'staff not found' });
      }

      await sendEmail(staffResults[0].email, staffResults[0].name, staffResults[0].staffId, staffResults[0].accountId, accountCode);
      res.status(200).json({ message: 'Reset link sent successfully' });

  } catch (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Error executing query' });
  } finally {
      if (connection) {
          connection.release();
      } else {
          console.warn('send-staff-reset-link: Connection not established.');
      }
  }
});

/**
 * @swagger
 * /staff/get-filtered-staff:
 *   get:
 *     tags:
 *       - Staff
 *     summary: Get staffs filtered by accountId and status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Account ID to filter
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, InActive]
 *         required: true
 *         description: Filter by Active/InActive
 *     responses:
 *       200:
 *         description: Filtered staff list
 *       500:
 *         description: Server error
 */

router.get('/get-filtered-staff', authenticateToken, async (req, res) => {
    /* #swagger.tags = ['Staff'] */
    let { accountId, status } = req.query;
    let isActive;
  if (status === 'InActive') {
      isActive = 0;
  } else if (status === 'Active') {
      isActive = 1;
  }
  let connection;
  try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000));
      connection = await Promise.race([connectToDatabase(), timeout]);

      const query = `
          SELECT 
              s.*, 
              GROUP_CONCAT(DISTINCT r.roleName SEPARATOR ', ') AS roleNames, 
              GROUP_CONCAT(DISTINCT r.roleId SEPARATOR ',') as roleId
          FROM admin.staff s
          JOIN admin.staffroles sr ON s.staffId = sr.staffId
          JOIN admin.role r ON sr.roleId = r.roleId
          WHERE s.accountId = ? AND s.isActive = ?
          AND sr.roleId != -1
          GROUP BY s.staffId
      `;  

      const formattedQuery = mysql.format(query, [accountId, isActive]);
      const [results] = await connection.query(formattedQuery);
      //console.log('Filtered staff results:', results);
      res.json(results);
  } catch (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Error executing query' });
  } finally {
      if (connection) {
          connection.release();
      } else {
          console.warn('get-filtered-staff: Connection not established.');
      }
  }
});

/**
 * @swagger
 * /staff/get-staff-by-role/{roleId}:
 *   get:
 *     tags:
 *       - Staff
 *     summary: Get staffs by role ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Role ID to filter staffs by
 *     responses:
 *       200:
 *         description: List of staffs for the role
 *       500:
 *         description: Server error
 */

router.get('/get-staff-by-role/:roleId', authenticateToken, async (req, res) => {
     /* #swagger.tags = ['Staff'] */   
    let connection;
    try {
        const { roleId } = req.params;

        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000));
        connection = await Promise.race([connectToDatabase(), timeout]);

        const query = `
            SELECT 	s.staffId, s.name, s.email, s.phone, s.photoURL, s.isActive, 
                    p.skills, p.description, p.url
            FROM 	admin.staff s 
            INNER JOIN 
                    admin.staffroles sr 
                ON 	s.staffId = sr.staffId 
            LEFT JOIN 
                    admin.profile p
                ON	p.staffId = s.staffId
            LEFT JOIN
                    admin.profilelocation pl
                ON	p.profileId = pl.profileId
            WHERE 	ur.roleId = ?
        `;

        const [staffResults] = await connection.query(query, [roleId]);
        console.log('staffResults', staffResults);
        res.json(staffResults.length ? staffResults : []);
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Error executing query' });
    } finally {
        if (connection) {
            connection.release();
        } else {
            console.warn('get-staff-by-role: Connection not established.');
        }
    }
});

/**
 * @swagger
 * /staff/get-staff-by-location-role/{roleId}/{locationId}:
 *   get:
 *     tags:
 *       - Staff
 *     summary: Get staffs by role and location
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         schema:
 *           type: integer
 *         required: true
 *       - in: path
 *         name: locationId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: List of staffs matching role and location
 *       500:
 *         description: Server error
 */

router.get('/get-staff-by-location-role/:roleId/:locationId', authenticateToken, async (req, res) => {
    /* #swagger.tags = ['Staff'] */
    let connection;
    try {
        const { locationId, roleId } = req.params;

        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000));
        connection = await Promise.race([connectToDatabase(), timeout]);

        const query = `
            SELECT 	u.staffId, u.name, u.email, u.phone, u.photoURL, u.isActive, 
                    p.skills, p.description, p.url
            FROM 	admin.staff u 
            INNER JOIN 
                    admin.staffroles ur 
                ON 	u.staffId = ur.staffId 
            LEFT JOIN 
                    admin.profile p
                ON	p.staffId = u.staffId
            LEFT JOIN
                    admin.profilelocation pl
                ON	p.profileId = pl.profileId
            WHERE 	ur.roleId = ? 
            AND     pl.locationId = ?
        `;
        
        const formattedQuery = mysql.format(query,[roleId, locationId]);
        //console.log(formattedQuery);

        const [staffResults] = await connection.query(query, [roleId, locationId]);
        
        res.json(staffResults.length ? staffResults : []);
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Error executing query' });
    } finally {
        if (connection) {
            connection.release();
        } else {
            console.warn('get-staff-by-location-role: Connection not established.');
        }
    }
});

/**
 * @swagger
 * /staff/update-staff/{staffId}:
 *   put:
 *     tags:
 *       - Staff
 *     summary: Update a staff and their roles (multipart/form-data)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the staff to update
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *               staffData:
 *                 type: string
 *                 description: JSON string containing staff fields and roleId array
 *     responses:
 *       200:
 *         description: staff updated successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */

router.put('/update-staff/:staffId', authenticateToken, upload.single('photo'), async (req, res) => {
    /* #swagger.tags = ['Staff'] */
    const { staffId } = req.params;

    // Accept either application/json body (no file) or multipart with 'staffData' field
    let staffData;
    if (req.is('application/json')) {
        staffData = req.body;
    } else {
        const rawStaffData = req.body.staffData;
        if (rawStaffData === undefined) {
            return res.status(400).json({ error: 'Missing staffData field in form data' });
        }
        try {
            staffData = typeof rawStaffData === 'string' ? JSON.parse(rawStaffData) : rawStaffData;
        } catch (e) {
            console.error('Invalid JSON in staffData:', rawStaffData, e.message);
            return res.status(400).json({ error: 'Invalid JSON in staffData', details: e.message });
        }
    }

    const { name, email, phone, phone2, address, city, state, zip, isActive, resetPassword, roleId: incomingRoleId } = staffData;
    let roleId = incomingRoleId;

    if (typeof roleId === 'string') {
        roleId = roleId.split(',').map(Number);
    }

    const photoURL = req.file ? `/uploads/${req.file.filename}` : (req.body.photoURL || staffData.photoURL || null);
    console.log('Photo URL:', photoURL);

    if (!Array.isArray(roleId)) {
        console.error('roleId is not an array:', roleId);
        return res.status(400).json({ error: 'roleId must be an array' });
    }

    // Basic required field validation
    if (!name || !email) {
        return res.status(400).json({ error: 'Missing required fields: name and/or email' });
    }

  let connection;
  try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000));
      connection = await Promise.race([connectToDatabase(), timeout]);
      console.log('Database connection established');

      const staffQuery = `
          UPDATE admin.staff
          SET name = ?, email = ?, phone = ?, phone2 = ?, address = ?, city = ?, state = ?, zip = ?, isActive = ?, resetPassword = ?, photoURL = ?, updatedBy = "API staff Update"
          WHERE staffId = ?;
      `;
      await connection.query(staffQuery, [name, email, phone, phone2, address, city, state, zip, isActive, resetPassword, photoURL, staffId]);
      console.log('staff updated:', { staffId, name, email, phone, phone2, address, city, state, zip, isActive, resetPassword, photoURL });

      const deletestaffRoleQuery = `DELETE FROM admin.staffroles WHERE staffId = ?;`;
      await connection.query(deletestaffRoleQuery, [staffId]);
      console.log('Existing staff roles deleted for staffId:', staffId);

      const insertstaffRoleQuery = `INSERT INTO admin.staffroles (staffId, roleId) VALUES (?, ?);`;
      const staffRolePromises = roleId.map((role) => {
          console.log('Inserting role:', role);
          return connection.query(insertstaffRoleQuery, [staffId, role]);
      });
      await Promise.all(staffRolePromises);
      console.log('New staff roles inserted:', { staffId, roleId });

      if (roleId.includes(5)) {
          const profileQuery = `INSERT INTO admin.profile (staffId, description, skills, URL) VALUES (?, ?, ?, ?);`;
          await connection.query(profileQuery, [staffId, '', '', '']);
          console.log('Profile created for Instructor staff:', staffId);
      }

      res.json({ message: 'staff updated successfully' });
  } catch (error) {
      console.error('Error updating staff:', error);
      res.status(500).json({ error: 'Error updating staff: ' + error.message });
  } finally {
      if (connection) {
          connection.release();
          console.log('Database connection released');
      } else {
          console.warn('update-staff/:staffId: Connection not established.');
      }
  }
});

/**
 * @swagger
 * /staff/deactivate-staff:
 *   put:
 *     tags:
 *       - Staff
 *     summary: Deactivate (soft-delete) a staff by staffId query param
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: staffId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the staff to deactivate
 *     responses:
 *       200:
 *         description: staff deactivated
 *       500:
 *         description: Server error
 */

router.put('/deactivate-staff', authenticateToken, async (req, res) => {
    /* #swagger.tags = ['Staff'] */  
    const { staffId } = req.query;
    let connection;
    try {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000));
        connection = await Promise.race([connectToDatabase(), timeout]);

        const staffQuery = `UPDATE admin.staff 
            SET isActive = -1, updatedBy = "API staff Delete"
            WHERE staffId = ?;`;

        const [staffResult] = await connection.query(staffQuery, [staffId]);
        res.json({ message: 'staff deactivated' });
    } catch (error) {
        res.status(500).json({ error: 'Error deactivating staff' });
    } finally {
        if (connection) {
            connection.release();
        } else {
            console.warn('deactivate-staff: Connection not established.');
        }
    }
});

/**
 * @swagger
 * /staff/update-profile/{staffId}:
 *   put:
 *     tags:
 *       - Staff
 *     summary: Update a staff's profile (skills, description, locations)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               profileData:
 *                 type: string
 *                 description: JSON string with profile data
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       500:
 *         description: Server error
 */

router.put('/update-profile/:staffId', authenticateToken, upload.none(), async (req, res) => {
    /* #swagger.tags = ['Staff'] */    
    const { staffId } = req.params;
    let connection;
    try {
            const profileData = JSON.parse(req.body.profileData);
            //console.log("METHOD CALLED", profileData);
            console.log("profileData", profileData);

            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000));
            connection = await Promise.race([connectToDatabase(), timeout]);

            // Filter for new skills 
            const newSkillsToAdd = profileData.profileSkills.filter(skill => 
                typeof skill.skillId === 'string' && skill.skillId.startsWith('new-')
            );
        
            //console.log('newSkillsToAdd:', newSkillsToAdd);

            if (newSkillsToAdd.length > 0) {
                const newSkillInsertQuery = `
                    INSERT INTO admin.skill(skillName,skillDescription) 
                    VALUES (?,'')`;
                newSkillsToAdd.forEach(async (skill) => {
                try {
                    const skillInsertQuery = connection.format(newSkillInsertQuery, [skill.skillName]);
                    const [skillInsertResult] = await connection.query(skillInsertQuery);
                    console.log(`Successfully added new skill: ${skill.skillName}`);
                } catch (error) {
                    console.error('Error inserting new skill:', error);
                }
                });
            }      

            const profileQuery = `
                UPDATE admin.profile 
                SET description = ?, 
                    skills = ?, 
                    URL = ?
                WHERE staffId = ?`;

            const skillsString = profileData.profileSkills.map(skill => skill.skillName).join(', ');
            //console.log('skillString:', skillsString);

            const profileUpdateQuery = connection.format(profileQuery, [profileData.profileDescription, skillsString, profileData.profileURL, staffId]);
            const [profileResult] = await connection.query(profileQuery, [profileData.profileDescription, skillsString, profileData.profileURL, staffId]);

            if (profileData.primaryStudio !== null) {
            // Fetch profileId
            const getProfileId = `SELECT p.profileId FROM admin.staff u 
                                INNER JOIN admin.profile p 
                                ON u.staffId = p.staffId 
                                WHERE u.staffId = ?`;
            const [rows] = await connection.query(getProfileId, [staffId]);

            // Ensure profileId is correctly extracted from the result
            const profileId = rows[0]?.profileId;

            if (!profileId) {
            throw new Error('Profile ID not found for the provided staff ID');
            }

            // Clear existing profile locations
            const profileLocationClear = `DELETE FROM admin.profilelocation 
                                        WHERE profileId = ?`;

            await connection.query(profileLocationClear, [profileId]);

            // Insert new profile locations
            const profileLocationQuery = `INSERT INTO admin.profilelocation (profileId, locationId, isHome) VALUES (?, ?, 1)`;
            await connection.query(profileLocationQuery, [profileId, profileData.primaryStudio]);

            const altLocationQuery = `INSERT INTO admin.profilelocation (profileId, locationId, isHome) VALUES (?, ?, 0)`;
            const altLocPromises = profileData.altStudio.map((locationId) => {
                return connection.query(altLocationQuery, [profileId, locationId]);
            });
            //console.log('Profile created for Instructor staff:', staffId);
        }        
            res.json({ message: 'Profile updated successfully' });
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ error: 'Error updating profile' });
        } finally {
            if (connection) {
                connection.release();
            } else {
                console.warn('update-profile: Connection not established.');
            }
        }
});

/**
 * @swagger
 * /staff/update-staff-password/{accountCode}/{staffId}/{accountId}:
 *   put:
 *     tags:
 *       - Staff
 *     summary: Update a staff's password (no auth expected)
 *     parameters:
 *       - in: path
 *         name: accountCode
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: staffId
 *         schema:
 *           type: integer
 *         required: true
 *       - in: path
 *         name: accountId
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               staffData:
 *                 type: object
 *                 properties:
 *                   password:
 *                     type: string
 *     responses:
 *       200:
 *         description: Password updated
 *       400:
 *         description: Invalid request
 *       404:
 *         description: staff not found or credentials invalid
 *       500:
 *         description: Server error
 */

router.put('/update-staff-password/:accountCode/:staffId/:accountId', async (req, res) => {
    /* #swagger.tags = ['Staff'] */     
    const { staffId, accountCode, accountId } = req.params;
  const { staffData } = req.body;

  if (!staffData || !staffData.password) {
      return res.status(400).json({ error: 'Invalid JSON in staffData' });
  }

  const password = staffData.password;

  let connection;
  try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000));
      connection = await Promise.race([connectToDatabase(), timeout]);
      const hashedPassword = await bcrypt.hash(password, 10);

      const [staffValidation] = await connection.query(
          `SELECT * FROM admin.staff WHERE staffId = ? AND accountId = ? AND accountId = (SELECT accountId FROM admin.account WHERE accountCode = ?)`,
          [staffId, accountId, accountCode]
      );

      if (!staffValidation.length) {
          return res.status(404).json({ message: 'staff not found or credentials invalid' });
      }

      const staffQuery = `
          UPDATE admin.staff 
          SET password = ?, updatedBy = "API Password Update" 
          WHERE staffId = ? AND accountId = ? AND accountId = (SELECT accountId FROM admin.account WHERE accountCode = ?);
      `;

      const [staffResult] = await connection.query(staffQuery, [hashedPassword, staffId, accountId, accountCode]);
      res.json({ message: 'staff password updated' });

  } catch (error) {
      console.error('Error resetting staff password:', error);
      res.status(500).json({ error: 'Error resetting staff password' });
  } finally {
      if (connection) {
          connection.release();
      } else {
          console.warn('update-staff-password: Connection not established.');
      }
  }
});


/**
 * @swagger
 * /staff/add-staff:
 *   post:
 *     tags:
 *       - Staff
 *     summary: Add a new staff (creates profile for instructors)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *               staffData:
 *                 type: string
 *                 description: JSON string with staff fields
 *     responses:
 *       200:
 *         description: staff registered
 *       409:
 *         description: Duplicate staff
 *       500:
 *         description: Server error
 */

router.post('/add-staff', authenticateToken, upload.single('photo'), async (req, res) => {
    /* #swagger.tags = ['Staff'] */   
    let { accountcode, name, email, phone, phone2, address, city, state, zip, password: originalPassword, roleId } = JSON.parse(req.body.staffData);

  console.log('Parsed staffData:', { accountcode, name, email, phone, phone2, address, city, state, zip, originalPassword, roleId });
  console.log('RoleEnum:', RoleEnum);
  console.log('RoleEnum.Instructor:', RoleEnum.Instructor);

  let connection;
  try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000));
      connection = await Promise.race([connectToDatabase(), timeout]);
      // console.log('Request body:', req.body);

      let password = originalPassword || accountcode;
      const hashedPassword = await bcrypt.hash(password, 10);

      const accountQuery = 'SELECT accountId FROM admin.account WHERE accountcode = ?';
      const [accountResults] = await connection.query(accountQuery, [accountcode]);
      if (accountResults.length === 0) {
          console.error('Account not found');
          return res.status(404).json({ error: 'Account not found' });
      }

      const accountId = accountResults[0].accountId;
      const photoURL = req.file ? `/uploads/${req.file.filename}` : null;

      const duplicateQuery = `SELECT * FROM admin.staff WHERE name = ? AND email = ? AND phone = ? AND address = ? AND city = ? AND state = ? AND zip = ?`;
      const [duplicateResults] = await connection.query(duplicateQuery, [name, email, phone, address, city, state, zip]);
      if (duplicateResults.length > 0) {
          if (connection) {
              connection.release();
          } else {
              console.warn('add-staff: Connection not established.');
          }
          console.warn('Duplicate staff found:', duplicateResults);
          return res.status(409).json({ error: 'Duplicate staff found' });
      }

      const staffQuery = `INSERT INTO admin.staff (accountId, name, email, phone, phone2, address, city, state, zip, password, photoURL, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "API staff Insert")`;
      await connection.query(staffQuery, [accountId, name, email, phone, phone2, address, city, state, zip, hashedPassword, photoURL]);

      const [result] = await connection.query('SELECT LAST_INSERT_ID() AS staffId');
      const staffId = result[0].staffId;

      if (!Array.isArray(roleId)) {
          console.error('roleId is not an array:', roleId);
          return res.status(400).json({ error: 'roleId must be an array' });
      }

      // console.log('roleId includes:', roleId.includes(RoleEnum.Instructor));

      const staffRoleQuery = `INSERT INTO admin.staffroles (staffId, roleId) VALUES (?, ?)`;
      const staffRolePromises = roleId.map((role) => {
          console.log('Inserting role:', role);
          return connection.query(staffRoleQuery, [staffId, role]);
      });

      await Promise.all(staffRolePromises);
      
      await sendEmail(email, name, staffId, accountId, accountcode);

      if (roleId.includes(RoleEnum.Instructor)) {
          const profileQuery = `INSERT INTO admin.profile (staffId, description, skills, URL) VALUES (?, ?, ?, ?)`;
          await connection.query(profileQuery, [staffId, '', '', '']);
          console.log('Profile created for Instructor staff:', staffId);
      }

      res.json({ message: 'staff registered' });
  } catch (error) {
      console.error('Error during staff registration:', error);
      res.status(500).json({ error: 'Error during staff registration: ' + error.message });
  } finally {
      if (connection) {
          connection.release();
          console.log('Database connection released');
      } else {
          console.warn('add-staff: Connection not established.');
      }
  }
});

/**
 * @swagger
 * /staff/upsert-profile-assignment/{scheduleLocationId}/{primaryProfileId}/{altProfileId}:
 *   post:
 *     tags:
 *       - Staff
 *     summary: Insert or update profile assignment for a schedule location
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduleLocationId
 *         schema:
 *           type: integer
 *         required: true
 *       - in: path
 *         name: primaryProfileId
 *         schema:
 *           type: integer
 *         required: true
 *       - in: path
 *         name: altProfileId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Pass 'null' to indicate no alt profile
 *     responses:
 *       200:
 *         description: Profile assignment inserted or updated
 *       500:
 *         description: Server error
 */

router.post('/upsert-profile-assignment/:scheduleLocationId/:primaryProfileId/:altProfileId', authenticateToken, async (req, res) => {
    /* #swagger.tags = ['Staff'] */   
    const { scheduleLocationId, primaryProfileId, altProfileId } = req.params;
    console.log('scheduleLocationId', scheduleLocationId);
    
    // Convert 'NULL' string to actual null value
    const altProfileIdValue = altProfileId === 'null' || altProfileId === 'NULL' ? null : altProfileId;

    let connection;
    try {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000));
        connection = await Promise.race([connectToDatabase(), timeout]);

        // Check if a record with the given scheduleLocationId exists
        const selectQuery = `SELECT * FROM admin.scheduleprofile WHERE scheduleLocationId = ?`;
        const [existingRecords] = await connection.query(selectQuery, [scheduleLocationId]);

        if (existingRecords.length > 0) {
            // Record exists, perform an update
            const updateQuery = `UPDATE admin.scheduleprofile SET profileId = ?, altProfileId = ? WHERE scheduleLocationId = ?`;
            await connection.query(updateQuery, [primaryProfileId, altProfileIdValue, scheduleLocationId]);
            res.json({ message: 'Profile Assignment Updated' });
        } else {
            // Record does not exist, perform an insert
            const insertQuery = `INSERT INTO admin.scheduleprofile (scheduleLocationId, profileId, altProfileId) VALUES (?, ?, ?)`;
            await connection.query(insertQuery, [scheduleLocationId, primaryProfileId, altProfileIdValue]);
            res.json({ message: 'Profile Assignment Inserted' });
        }

    } catch (error) {
        console.error('Error assigning profile to event:', error);
        res.status(500).json({ error: 'Error assigning profile to event' });
    } finally {
        if (connection) {
            connection.release();
        } else {
            console.warn('upsert-profile-assignment: Connection not established.');
        }
    }
});

module.exports = router;
