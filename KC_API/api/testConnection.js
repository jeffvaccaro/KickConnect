const mysql = require('mysql2/promise');
const testConnection = async () => {
    try {
      const connection = await mysql.createConnection({
        host: 'kickconnect.cxqgewwkqwa2.us-east-1.rds.amazonaws.com',
        user: 'RDS-User',
        password: 'CodeReview5!',
        database: 'admin',
        port: 3306
      });
      console.log('Connection successful!');
    } catch (error) {
      console.error('Error connecting:', error);
    }
  };
  testConnection();