const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.redirect('/auth/login');
    } catch (error) {
        res.status(400).send('Error creating user');
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.status(400).send('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send('Invalid credentials');

    // Set session variable
    req.session.user = user;
    res.redirect('/events');
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

// Serve the login page
router.get('/login', (req, res) => {
    res.render('login'); // This will render the login.ejs view
});

// Serve the registration page (optional, if you want a separate page for registration)
router.get('/register', (req, res) => {
    res.render('register'); // Make sure you have a register.ejs page if you want this
});

module.exports = router;
