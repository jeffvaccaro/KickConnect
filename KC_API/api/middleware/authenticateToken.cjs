const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];

  // console.log('Token:', token); // Add this line for logging

  if (token == null) return res.sendStatus(401); // If no token, return Unauthorized

  jwt.verify(token,  process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification failed:', err); // Add this line for logging
      return res.sendStatus(403); // If token is invalid, return Forbidden
    }
    req.user = user;
    next();
  });
}


module.exports = authenticateToken;
