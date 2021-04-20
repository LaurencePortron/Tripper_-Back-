const express = require('express');
const connection = require('./db');
var session = require('express-session');
const { createApi } = require('unsplash-js');
const nodeFetch = require('node-fetch');

const port = 5000;
const app = express();
const cors = require('cors');

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY,
  fetch: nodeFetch,
});

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const allowedOrigins = [
  'http://localhost:19002',
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
  res.send('Welcome to Tripper!');
});

// associates image to trip/activity when submitting new trip or activity

app.post('/images', (req, res) => {
  if (!req.body.title) {
    return res.status(400).send('No title');
  }

  getImage(req.body.title).then(
    (url) => {
      res.send({ url });
    },
    (error) => {
      console.log('error', error);
      res.status(500).send('Oops');
    }
  );
});

async function getImage(query) {
  const res = await unsplash.search.getPhotos({
    query,
  });
  return res.response.results[0].urls.regular;
}

//send email with sendgrid to invite friends

app.post('/invites/:id', (req, res) => {
  const tripId = req.params.id;
  const msg = {
    to: req.body.to,
    from: 'TripperAppLauren@gmail.com',
    subject: 'Join Tripper',
    text: 'Someone invited you to a trip',
    html: `<strong>Someone invited you to a trip</strong><p>Click here to join the trip <a href="http://localhost:19006/trip-overview/${tripId}">Join</a></p>`,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent');
      res.send({ ok: true });
    })
    .catch((error) => {
      console.error('sth went wrong', error.response.body.errors);
      res.status(500).send('bad gateway');
    });
});

app.listen(port, (err) => {
  if (err) {
    throw new Error('Something went wrong');
  }
  console.log('ready to code');
});
