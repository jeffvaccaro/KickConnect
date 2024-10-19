require('dotenv').config(); // Ensure environment variables are loaded

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerSetup = require('./swagger.cjs');
const authRouter = require('./account.cjs');
const userRouter = require('./user.cjs');
const loginRouter = require('./login.cjs');
const locationRouter = require('./location.cjs');
const roleRouter = require('./role.cjs');
const eventRouter = require('./event.js');
const zipcodeRouter = require('./zipcode.cjs');
const scheduleRouter = require('./schedule.js');
const logger = require('./logger');
const app = express();

const env = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:4200',
  'http://kickconnect-env-1.eba-bsj8msyj.us-east-1.elasticbeanstalk.com'
];
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Make sure swaggerSetup is a function before using it
if (typeof swaggerSetup === 'function') {
  swaggerSetup(app);
} else {
  console.error('swaggerSetup is not a function. Ensure it exports correctly.');
}

app.use((err, req, res, next) => {
  logger.error(`Error occurred: ${err.message}`);
  console.error(`Error occurred: ${err.message}`);
  res.status(500).json({ error: 'An error occurred, please try again later.' });
});


// Ensure all routers are middleware functions
const routers = [
  { path: '/auth', router: authRouter },
  { path: '/user', router: userRouter },
  { path: '/login', router: loginRouter },
  { path: '/location', router: locationRouter },
  { path: '/role', router: roleRouter },
  { path: '/event', router: eventRouter },
  { path: '/common', router: zipcodeRouter },
  { path: '/schedule', router: scheduleRouter },
];

routers.forEach(({ path, router }) => {
  if (typeof router === 'function') {
    app.use(path, router);
  } else {
    console.error(`Router at path ${path} is not a function. Ensure it exports correctly.`);
  }
});

app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/current-datetime', (req, res) => {
  const currentDateTime = new Date();
  res.send(`Current Date and Time: ${currentDateTime}`);
});

app.post('/api/logger', (req, res) => {
  const { message, level, ...rest } = req.body;
  logger[level](`${message}: ${JSON.stringify(rest)}`);
  res.status(200).send('Log received');
});

const serverHost = env === 'production' ? 'ElasticBeanStalk' : 'localhost';
app.listen(port, () => {
  console.log(`Server is running at http://${serverHost}:${port}`);
});
