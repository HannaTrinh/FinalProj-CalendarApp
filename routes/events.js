const express = require('express');
const Event = require('../models/Event');
const router = express.Router();
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];


    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(400).json({ error: 'Invalid token' });
    }
};

router.get('/', authMiddleware, async (req, res) => {
    console.log('GET /events - User:', req.user);
    try {
        const events = await Event.find({ user: req.user._id }).sort({ date: 1 });
        console.log(`Found ${events.length} events for user`);
        res.render('calendar', {
            user: req.user.username,
            events: events
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).render('error', { error: 'Error loading events' });
    }
});

router.post('/create', authMiddleware, async (req, res) => {
    console.log('POST /events/create - User:', req.session.user.username);
    const { date, title, description } = req.body;
    const eventDate = new Date(date);
    const newEvent = new Event({ date, title, description, user: req.session.user._id });
    try {
        await newEvent.save();
        console.log('Event created:', newEvent);
        res.redirect('/events');
    } catch (error) {
        consol.error("Error creating event:", error);
        res.status(400).send('Error creating event');
    }
});
router.post('/edit/:id', authMiddleware, async (req, res) => {
    console.log('POST /events/edit/:id - User:', req.session.user.username);
    const { title, description } = req.body;
    try {
        const event = await Event.findById(req.params.id);
        if (event && event.user.toString() === req.session.user._id) {
            event.title = title;
            event.description = description;
            await event.save();
            console.log('Event updated:', event);
            res.json({ success: true, message: 'Event updated successfully' });
        } else {
            console.log('Unauthorized or event not found');
            res.status(400).json({ success: false, message: 'Unauthorized or event not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.post('/delete/:id', authMiddleware, async (req, res) => {
    console.log('POST /events/delete/:id - User:', req.session.user.username);
    try {
        const event = await Event.findById(req.params.id);
        if (event && event.user.toString() === req.session.user._id) {
            await event.deleteOne();
            console.log('Event deleted:', event);
            res.json({ success: true, message: 'Event deleted successfully' });
        } else {
            console.log('Unauthorized or event not found');
            res.status(400).json({ success: false, message: 'Unauthorized or event not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
module.exports = router;