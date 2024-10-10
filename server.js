const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

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
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Cookies:', req.cookies);
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


module.exports = app;