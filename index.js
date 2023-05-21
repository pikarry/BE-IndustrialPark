const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./configs/database');
const router = require('./routers');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200, // For legacy browser support
  methods: 'GET, POST, PATCH, DELETE',
};

app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, 'uploads')));

connectDB();
router(app);

app.listen(process.env.PORT, () => {
  console.log('run ' + process.env.PORT);
});
