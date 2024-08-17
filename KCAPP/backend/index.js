// backend/index.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors'); // Import the cors package
const { exec } = require('child_process');
const Club = require('./schema/Club');


const app = express();
app.use(cors()); // Use the cors middleware

const connectionString = process.env.MONGODB_URI;
mongoose.connect(connectionString)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/run-python', (req, res) => {
  exec('python script.py', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).send(error);
    }
    res.send(stdout);
  });
});

// Add a new club
app.post('/clubs', async (req, res) => {
  try {
    const club = new Club(req.body);
    await club.save();
    res.status(201).send(club);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all clubs
app.get('/clubs', async (req, res) => {
  try {
    const clubs = await Club.find();
    res.status(200).send(clubs);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a specific club by name
app.get('/clubs/:name', async (req, res) => {
  try {
    const club = await Club.findOne({ clubName: req.params.name });
    if (!club) {
      return res.status(404).send('Club not found');
    }
    res.status(200).send(club);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
