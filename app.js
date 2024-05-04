require('dotenv').config();
const express = require('express');
const passport = require('./config/passport');

const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(express.json());
app.use(passport.initialize());

const userRoutes = require('./routes/users');

const mongoose = require('mongoose');
//const dbURL = 'mongodb://127.0.0.1:27017/FootBallApp';
const dbURL = `mongodb+srv://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASSWORD)}@cluster0.za1d0lw.mongodb.net/FootBallApp`;

app.use(express.json()); // Make sure it comes back as json
app.use('/api/users', userRoutes); // Prefix all routes defined in `userRoutes` with `/api/users`

// Connect to MongoDB
//mongoose.connect(dbURL);
mongoose.connect(dbURL)
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.log('Database connection error: ', err));

// Connection event listeners
const db = mongoose.connection;

db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});

db.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
});


module.exports = passport;