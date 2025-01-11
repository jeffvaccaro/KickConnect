const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
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

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const env = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:4200',
  'http://kickconnect-env-1.eba-bsj8msyj.us-east-1.elasticbeanstalk.com',
  'http://kickconnect.net'
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
  { path: '/login', router: loginRouter },
  { path: '/location', router: locationRouter },
  { path: '/role', router: roleRouter },
  { path: '/event', router: eventRouter },
  { path: '/common', router: zipcodeRouter },
  { path: '/schedule', router: scheduleRouter },
  { path: '/account', router: accountRouter },
  { path: '/skill', router: skillRouter },
  { path: '/htmlGen', router: htmlGenRouter }
];

routers.forEach(({ path, router }) => {
  if (typeof router === 'function') {
    app.use(path, router);
  } else {
    console.error(`Router at path ${path} is not a function. Ensure it exports correctly.`);
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

const distPath = path.join(__dirname, 'dist', 'kickConnect', 'browser');

// Serve static files from the dist/your-app-name/browser directory
app.use(express.static(distPath));

app.get('/*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.get('/current-datetime', (req, res) => {
  const currentDateTime = new Date();
  res.send(`Current Date and Time: ${currentDateTime}`);
});

app.post('/api/logger', (req, res) => {
  const { message, level, error } = req.body;
  if (!['info', 'warn', 'error', 'debug'].includes(level)) {
    return res.status(400).json({ error: 'Invalid log level' });
  }
  logger[level](`${message}: ${JSON.stringify(error)}`);
  res.status(200).json({ message: 'Log received' });
});

const serverHost = env === 'production' ? 'ElasticBeanStalk' : 'localhost';
app.listen(port, () => {
  console.log(`Server is running at http://${serverHost}:${port}`);
});
