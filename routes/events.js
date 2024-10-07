const express = require('express');
const Event = require('../models/Event');
const router = express.Router();

// Middleware to check if user is logged in
const authMiddleware = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
};

// Get Events page
router.get('/', authMiddleware, async (req, res) => {
    const events = await Event.find({ user: req.session.user._id }).sort({ date: 1 });
    res.render('calendar', { user: req.session.user.username, events });
});

// Create Event
router.post('/create', authMiddleware, async (req, res) => {
    const { date, title, description } = req.body;
    const newEvent = new Event({ date, title, description, user: req.session.user._id });

    try {
        await newEvent.save();
        res.redirect('/events');
    } catch (error) {
        res.status(400).send('Error creating event');
    }
});

// Delete Event
router.post('/delete/:id', authMiddleware, async (req, res) => {
    console.log(`Delete request for event ID: ${req.params.id}`);  // Add this line
    const event = await Event.findById(req.params.id);
    if (event && event.user.toString() === req.session.user._id) {
        await event.deleteOne();
        res.redirect('/events');
    } else {
        res.status(400).send('Error deleting event');
    }
});


// Get Edit Event page
router.get('/edit/:id', authMiddleware, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (event && event.user.toString() === req.session.user._id) {
            res.render('edit', { event });
        } else {
            res.status(400).send('Unauthorized or event not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Update Event
router.post('/edit/:id', authMiddleware, async (req, res) => {
    const { title, description } = req.body;
    try {
        const event = await Event.findById(req.params.id);
        if (event && event.user.toString() === req.session.user._id) {
            event.title = title;
            event.description = description;
            await event.save();
            res.redirect('/events');
        } else {
            res.status(400).send('Unauthorized or event not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


module.exports = router;
