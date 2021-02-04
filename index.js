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
  res.send('Welcome to Tripper!');
});

app.listen(port, (err) => {
  if (err) {
    throw new Error('Something went wrong');
  }
  console.log('ready to code');
});

// get all users
app.get('/users', (req, res) => {
  const users = req.body;
  connection.query('SELECT * FROM users', [users], (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send('An error occurred to display all users');
    } else {
      console.log('results', results);
      res.status(200).json(results);
    }
  });
});

// get one user
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  connection.query(
    'SELECT * FROM users WHERE id = ?',
    [userId],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send('An error occurred to display the selected user');
      } else {
        console.log('results', results);
        res.status(200).json(results);
      }
    }
  );
});

// delete one user
app.delete('/users/:id', (req, res) => {
  const userId = req.params.id;
  connection.query(
    'DELETE FROM users WHERE id = ?',
    [userId],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send('An error occurred to delete this user');
      } else {
        console.log('results', results);
        res.status(200).json(results);
      }
    }
  );
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/LogIn.js'));
});

//add a user
app.post('/users', (req, res) => {
  const { username, password } = req.body;
  connection.query(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, password],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send('An error occurred to add a new user');
      } else {
        res.status(200).json(results);
      }
    }
  );
});

// check for existing user in DB
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    connection.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password],
      (err, results) => {
        if (results.length > 0) {
          req.session.loggedin = true;
          req.session.username = username;
        } else {
          res.status(401);
          res.send('Incorrect username or password');
        }
        res.end();
      }
    );
  } else {
    res.send('Please enter username and password');
    res.end();
  }
});

// if details are correct the user will be redirected to the dashboard
app.get('/dashboard', (req, res) => {
  if (req.session.loggedin) {
    res.send('Welcome back, ' + req.session.username + '!');
  } else {
    res.send('Please login to view this page!');
  }
  res.end();
});

// get all trips list

app.get('/trips', (req, res) => {
  const trips = req.body;
  connection.query('SELECT * FROM trips', [trips], (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send('An error occurred to display trips');
    } else {
      console.log('results', results);
      res.status(200).json(results);
    }
  });
});

//get one trip

app.get('/trips/:id', (req, res) => {
  const tripId = req.params.id;
  connection.query(
    'SELECT * FROM trips WHERE id = ?',
    [tripId],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send('An error occurred to display the selected trip');
      } else {
        console.log('results', results);
        res.status(200).json(results);
      }
    }
  );
});

// post a trip

app.post('/trips', (req, res) => {
  const { title, startDate, endDATE, description, cost } = req.body;
  connection.query(
    'INSERT INTO trips (title, startDate,endDATE, description, cost ) VALUES (?, ?, ?, ?,?)',
    [title, startDate, endDATE, description, cost],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send('An error occurred to add a new trip');
      } else {
        res.status(200).json(results);
      }
    }
  );
});

// get all activities

app.get('/activities', (req, res) => {
  const activities = req.body;
  connection.query('SELECT * FROM activities', [activities], (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send('An error occurred to display activities');
    } else {
      console.log('results', results);
      res.status(200).json(results);
    }
  });
});

//get one activity

app.get('/activities/:id', (req, res) => {
  const activityId = req.params.id;
  connection.query(
    'SELECT * FROM activities WHERE id = ?',
    [activityId],
    (err, results) => {
      if (err) {
        console.log(err);
        res
          .status(500)
          .send('An error occurred to display the selected activity');
      } else {
        console.log('results', results);
        res.status(200).json(results);
      }
    }
  );
});

// post an activity

app.post('/activities', (req, res) => {
  const { title, date, description, cost, trip_id } = req.body;
  connection.query(
    'INSERT INTO activities (title, date, description, cost, trip_id  ) VALUES (?, ?, ?, ?, ?)',
    [title, date, description, cost, trip_id],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send('An error occurred to add a new activitiy');
      } else {
        res.status(200).json(results);
      }
    }
  );
});

//get activities per trip

app.get('/trip/:id/activities', (req, res) => {
  const activityId = req.params.id;
  connection.query(
    'SELECT * FROM activities WHERE trip_id=?',
    [activityId],
    (err, results) => {
      if (err) {
        console.log(err);
        res
          .status(500)
          .send('An error occurred to display this event/s activities');
      } else {
        console.log('results', results);
        res.status(200).json(results);
      }
    }
  );
});

// get all messages in DB

app.get('/messages', (req, res) => {
  const messages = req.body;
  connection.query('SELECT * FROM messages', [messages], (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send('An error occurred to display this messages');
    } else {
      console.log('results', results);
      res.status(200).json(results);
    }
  });
});

// get all messages associated to a trip

app.get('/trip/:id/messages', (req, res) => {
  const messageId = req.params.id;
  connection.query(
    'SELECT * FROM messages WHERE trip_id=?',
    [messageId],
    (err, results) => {
      if (err) {
        console.log(err);
        res
          .status(500)
          .send('An error occurred to display this event/s messages');
      } else {
        console.log('results', results);
        res.status(200).json(results);
      }
    }
  );
});

// post a message associated to trip

app.post('/messages', (req, res) => {
  const { message, date } = req.body;
  connection.query(
    'INSERT INTO messages (message, date) VALUES (?, ?)',
    [message, date],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send('An error occurred to add a new message');
      } else {
        res.status(200).json(results);
      }
    }
  );
});
