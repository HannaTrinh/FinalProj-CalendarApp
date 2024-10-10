const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const mongoStore = require('connect-mongo');
const path = require('path');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log("MONGODB_URI:", process.env.MONGODB_URI);
console.log("SESSION_SECRET:", process.env.SESSION_SECRET);

if (!process.env.MONGODB_URI || !process.env.SESSION_SECRET) {
  console.error("Environment variables are missing.");
  process.exit(1); // Exiting if environment variables are missing
}

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const sessionStore = mongoStore.create({
  mongoUrl: MONGODB_URI,
  collectionName: 'sessions'
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  }
}));

app.use((req, res, next) => {
  console.log('Session ID:', req.session.id);
  console.log('Session:', req.session);
  next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');

app.use('/auth', authRoutes);
app.use('/events', eventRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app;