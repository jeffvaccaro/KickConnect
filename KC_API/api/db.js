const mysql = require('mysql2/promise');
// const { Signer } = require('@aws-sdk/rds-signer');

// const generateAuthToken = async (hostname, port, username, region) => {
//   console.log('Generating Auth Token with:', { hostname, port, username, region });

//   const signer = new Signer({
//     region,
//     hostname,
//     port,
//     username
//   });

//   const token = await signer.getAuthToken({
//     username,
//     hostname,
//     port
//   });

//   console.log(`Generated Auth Token: ${token}`);
  
//   return token;
// };

// const connectToDatabase = async () => {
//   let connection;
//   try {
//     if (process.env.IS_AWS === 'true') {
//       console.log('Environment is AWS, generating auth token...');
//       const token = await generateAuthToken(
//         process.env.DB_HOST,
//         process.env.DB_PORT,
//         process.env.DB_USER,
//         process.env.AWS_REGION
//       );

//       console.log(`Auth Token: ${token}`);

//       connection = await mysql.createConnection({
//         host: process.env.DB_HOST,
//         user: process.env.DB_USER,
//         password: token,
//         database: process.env.DB_NAME,
//         ssl : {
//           rejectUnauthorized: false
//         },
//         authPlugins: {
//           mysql_clear_password: () => () => token
//         }
//       });
//     } else {
//       connection = await mysql.createConnection({
//         host: process.env.DB_HOST,
//         user: process.env.DB_USER,
//         password: process.env.DB_PASSWORD,
//         database: process.env.DB_NAME,
//         port: process.env.DB_PORT
//       });
//     }

//     if (!connection) {
//       throw new Error('Failed to create a connection.');
//     }

//     console.log('Database connection established.');
//     return connection;
//   } catch (error) {
//     console.error('Error connecting to the database:', error);
//     throw error;
//   }
// };

const connectToDatabase = async () => {
  try {

    // console.log('Connecting to database with the following details:');
    // console.log('Host:', process.env.DB_HOST);
    // console.log('User:', process.env.DB_USER);
    // console.log('Password:', process.env.DB_PASSWORD);
    // console.log('Database:', process.env.DB_NAME);
    // console.log('Port:', process.env.DB_PORT);

    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    if (!connection) {
      throw new Error('Connection failed.');
    }
    console.log('Database connection established.');
    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

module.exports = { connectToDatabase };
