const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');

const swaggerSetup = require('./swagger.cjs');
//const logger = require('./logger');

const authRouter = require('./account.js');
const staffRouter = require('./staff.js');
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

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const env = process.env.NODE_ENV || 'development';
const isLocal = env === 'development';
// Port selection: use 3000 for local dev (matching Angular env.apiUrl),
// fall back to 8080 for production unless PORT explicitly provided.
const port = isLocal ? (process.env.PORT || 3000) : (process.env.PORT || 8080);

const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:3000', // local API + Swagger origin
  'https://www.kickconnect.net',
  'https://kickconnect.net',
  'https://d1tt1lxr6c8xl3.cloudfront.net',
  // API hostnames (same-origin Swagger/UI calls and direct testing)
  'https://api.kickconnect.net',
  'https://kickconnect-api.us-west-2.elasticbeanstalk.com'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl or Postman) and known frontend domains
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(bodyParser.json());

// Serve uploaded assets (backgrounds, images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


if (typeof swaggerSetup === 'function') {
  swaggerSetup(app);
} else {
  console.error('swaggerSetup is not a function. Ensure it exports correctly.');
}

// Centralized error handling
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'An error occurred, please try again later.' });
});

// API routes
const routers = [
  { path: '/auth', router: authRouter },
  { path: '/staff', router: staffRouter },
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

// Serve Angular files in local development only
// Serve Angular build only if it exists locally (prevents ENOENT when not built)
if (isLocal) {
  const distPath = path.join(__dirname, 'dist', 'kickConnect', 'browser');
  if (fs.existsSync(path.join(distPath, 'index.html'))) {
    app.use(express.static(distPath));
    app.get(['/', '/index.html'], (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.warn(`Angular build not found at ${distPath}. Skipping static UI serve.`);
  }
}

// Redirect HTTP to HTTPS (Production Only)
if (!isLocal) {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    next();
  });
}

// Optional production static UI serving (only if SERVE_UI=true and build exists)
if (!isLocal && process.env.SERVE_UI === 'true') {
  const distPath = path.join(__dirname, 'browser');
  if (fs.existsSync(path.join(distPath, 'index.html'))) {
    app.use(express.static(distPath));
    app.get('/*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.warn(`Production UI build not found at ${distPath}. Set SERVE_UI=false or deploy build.`);
  }
}

app.get('/current-datetime', (req, res) => {
  res.send(`Current Date and Time: ${new Date()}`);
});

app.listen(port, () => {
  // Log a concise, environment-accurate startup message. EB sets PORT (typically 8080)
  const hostInfo = process.env.DB_HOST ? `${process.env.DB_HOST}` : '0.0.0.0';
  console.log(`Server listening on ${hostInfo}:${port} (env=${env})`);
});

// Global error handlers so startup/runtime crashes are clearly visible in EB logs.
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION - application will exit:', err && err.stack ? err.stack : err);
  // Give logs a moment to flush then exit with a non-zero code so EB/PM detects failure.
  setTimeout(() => process.exit(1), 100);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason && reason.stack ? reason.stack : reason);
  setTimeout(() => process.exit(1), 100);
});