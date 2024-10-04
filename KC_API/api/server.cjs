const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');

const swaggerSetup = require('./swagger.cjs');
const authRouter = require('./account.cjs');
const userRouter = require('./user.cjs');
const loginRouter = require('./login.cjs');
const locationRouter = require('./location.cjs');
const roleRouter = require('./role.cjs');
const classRouter = require('./class.cjs');
const zipcodeRouter = require('./zipcode.cjs');
const scheduleRouter = require ('./schedule.cjs');

const cors = require('cors');

const app = express();
const port = 3000;

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Enable CORS for all origins
app.use(cors());
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

app.get('/current-datetime', (req, res) => {
  const currentDateTime = new Date();
  res.send(`Current Date and Time: ${currentDateTime}`);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
