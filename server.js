const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const app = express();

mongoose
  .connect('mongodb+srv://ronit:N92cBmF6HKaUb39J@cluster0.x828y.mongodb.net/myAppDb')
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.get('/', (req, res) => {
  res.redirect('/auth/login');
});
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
