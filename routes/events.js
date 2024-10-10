const express = require('express');
const Event = require('../models/Event');
const router = express.Router();

const authMiddleware = (req, res, next) => {
    console.log('Auth middleware - Session user:', req.session.user);
    if (!req.session.user) {
        console.log('User not logged in, redirecting to login');
        return res.redirect('/auth/login');
    }
    console.log('User is logged in');
    next();
};
router.get('/', authMiddleware, async (req, res) => {
    console.log('GET /events - User:', req.session.user.username);
    try {
        const events = await Event.find({ user: req.session.user._id }).sort({ date: 1 });
        console.log(`Found ${events.length} events for user`);
        res.render('calendar', { user: req.session.user.username, events });
    } catch (error) {
        console.error(error);
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
            consol.log('Event deleted:', event);
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