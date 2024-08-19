// auth.cjs
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const users = []; // This should be replaced with a database in a real app

// Register route
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  users.push({ username, password: hashedPassword });
  res.status(200).send({ message: 'User registered successfully!' });
});

// Login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).send({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.username }, 'your-secret-key', { expiresIn: 86400 });
  res.status(200).send({ auth: true, token });
});

// Middleware to verify token
function verifyToken(req, res, next) {
  const token = req.headers['x-access-token'];
  if (!token) return res.status(403).send({ message: 'No token provided.' });

  jwt.verify(token, 'your-secret-key', (err, decoded) => {
    if (err) return res.status(500).send({ message: 'Failed to authenticate token.' });
    req.userId = decoded.id;
    next();
  });
}

// Protected route example
router.get('/me', verifyToken, (req, res) => {
  res.status(200).send({ message: `Hello ${req.userId}` });
});

module.exports = router;
