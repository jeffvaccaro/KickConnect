const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const swaggerSetup = require('./swagger.cjs');
const authRouter = require('./account.cjs');
const userRouter = require('./user.cjs');
const loginRouter = require('./login.cjs');
const locationRouter = require('./location.cjs');
const roleRouter = require('./role.cjs');
const classRouter = require('./class.cjs');
const zipcodeRouter = require('./zipcode.cjs');
const scheduleRouter = require('./schedule.cjs');

const app = express();
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(__dirname, `.env.${env}`) });

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
swaggerSetup(app);

app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/login', loginRouter);
app.use('/location', locationRouter);
app.use('/role', roleRouter);
app.use('/class', classRouter);
app.use('/uploads', express.static('uploads'));
app.use('/common', zipcodeRouter);
app.use('/schedule', scheduleRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/current-datetime', (req, res) => {
  const currentDateTime = new Date();
  res.send(`Current Date and Time: ${currentDateTime}`);
});

const serverHost = env === 'production' ? 'ElasticBeanStalk' : 'localhost';

app.listen(port, () => {
  console.log(`Server is running at http://${serverHost}:${port}`);
});
