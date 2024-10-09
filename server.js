const express =require('express');
const mongoose= require('mongoose');
const session=require('express-session');
const bcrypt = require('bcryptjs');
const path =require('path');
const app= express();
mongoose
  .connect('mongodb+srv://ronit:N92cBmF6HKaUb39J@cluster0.x828y.mongodb.net/myAppDb')
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));
app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: true
}));
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.redirect('/auth/login');
});
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
