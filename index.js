const express = require('express');
const connection = require('./db');
var session = require('express-session');

const port = 5000;
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5000',
];
const corsOptions = {
  origin: (origin, callback) => {
    if (origin === undefined || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);

app.get('/', (req, res) => {
  res.send('Welcome to ticketing backend!');
});

app.listen(port, (err) => {
  if (err) {
    throw new Error('Something went wrong');
  }
  console.log('ready to code');
});
