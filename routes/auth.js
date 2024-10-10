const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('register', { error: 'Username already exists' });
        }
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Registration error:', error);
        res.render('register', { error: 'Error creating user' });
    }
});
router.post('/login', async (req, res) => {
    console.log('Login attempt:', req.body);
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found');
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Invalid password');
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        req.session.user = { _id: user._id, username: user.username };
        console.log('User authenticated successfully');
        console.log('Session before save:', req.session);

        req.session.save((err) => {
            if (err) {
                console.error('Error saving session:', err);
                return res.status(500).json({ error: 'Error saving session' });
            }
            console.log('Session saved successfully');
            console.log('Session after save:', req.session);
            console.log('Sending redirect response');
            res.json({ redirect: '/events' });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'An error occurred during login' });
    }
});
router.get('/logout', (req, res) => {
    console.log('GET /login - Session:', req.session);
    if (req.session.user) {
        console.log('User already logged in, redirecting to /events');
        return res.redirect('/events');
    }
    res.render('login');
});
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/events'); // Redirect if user is already logged in
    }
    res.render('login');
});
router.get('/register', (req, res) => {
    res.render('register');
});
module.exports = router;