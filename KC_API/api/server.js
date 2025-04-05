const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');

const swaggerSetup = require('./swagger.cjs');
const logger = require('./logger');

const authRouter = require('./account.js');
const userRouter = require('./user.js');
const loginRouter = require('./login.js');
const locationRouter = require('./location.js');
const roleRouter = require('./role.cjs');
const eventRouter = require('./event.js');
const zipcodeRouter = require('./zipcode.js');
const scheduleRouter = require('./schedule.js');
const accountRouter = require('./account.js');
const skillRouter = require('./skill.js');
const htmlGenRouter = require('./html-generator.js');
const memPlanRouter = require('./membership-plan.js');
const membRouter = require('./membership.js');
const memAttRouter = require('./membership-attendance.js');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const env = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 3000;
const isLocal = env === 'development';

const allowedOrigins = [
  'http://localhost:4200',
  'http://env-KickConnect.eba-v2e258g4.us-east-1.elasticbeanstalk.com',
  'https://env-KickConnect.eba-v2e258g4.us-east-1.elasticbeanstalk.com',
  'https://kickconnect.net',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin || (origin && origin.startsWith('http://localhost'))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

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

const routers = [
  { path: '/auth', router: authRouter },
  { path: '/user', router: userRouter },
  { path: '/membership', router: membRouter },
  { path: '/membershipAttendance', router: memAttRouter },
  { path: '/membershipPlan', router: memPlanRouter },
  { path: '/login', router: loginRouter },
  { path: '/location', router: locationRouter },
  { path: '/role', router: roleRouter },
  { path: '/event', router: eventRouter },
  { path: '/common', router: zipcodeRouter },
  { path: '/schedule', router: scheduleRouter },
  { path: '/account', router: accountRouter },
  { path: '/skill', router: skillRouter },
  { path: '/htmlGen', router: htmlGenRouter },
];

routers.forEach(({ path, router }) => {
  if (typeof router === 'function') {
    app.use(path, router);
  } else {
    console.error(`Router at path ${path} is not a function. Ensure it exports correctly.`);
  }
});

app.options('*', cors(corsOptions));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Determine the path based on the environment
const distPath = isLocal
  ? path.join(__dirname, 'dist', 'kickConnect', 'browser') // Local path
  : path.join(__dirname, 'browser'); // Production path

app.use(express.static(distPath)); // Serve static files

app.get('/*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.get('/current-datetime', (req, res) => {
  res.send(`Current Date and Time: ${new Date()}`);
});

app.post('/api/logger', (req, res) => {
  const { message, level, error } = req.body;
  if (!['info', 'warn', 'error', 'debug'].includes(level)) {
    return res.status(400).json({ error: 'Invalid log level' });
  }
  logger[level](`${message}: ${JSON.stringify(error)}`);
  res.status(200).json({ message: 'Log received' });
});

app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  }
  next();
});

const serverHost = isLocal ? 'localhost' : 'ElasticBeanStalk'; // Simplified host determination.

app.listen(port, () => {
  console.log(`Server is running at http://${serverHost}:${port}`);
});