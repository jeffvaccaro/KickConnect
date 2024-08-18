const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(process.cwd(), `.env.${env}`) });

// Enable CORS for all origins
app.use(cors());

app.get('/api', (req, res) => {
  res.json({ message: 'Hello from Express!'});
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
