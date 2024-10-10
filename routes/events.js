const express = require('express');
const Event = require('../models/Event');
const router = express.Router();
const authMiddleware = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
};
router.get('/', authMiddleware, async (req, res) => {
    const events = await Event.find({ user: req.session.user._id }).sort({ date: 1 });
    res.render('calendar', { user: req.session.user.username, events });
});
router.post('/create', authMiddleware, async (req, res) => {
    const { date, title, description } = req.body;
    const eventDate = new Date(date); 
    const newEvent = new Event({ date, title, description, user: req.session.user._id }); 
    try {
        await newEvent.save();
        res.redirect('/events');
    } catch (error) {
        res.status(400).send('Error creating event');
    }
});
router.post('/edit/:id', authMiddleware, async (req, res) => {
    const { title, description } = req.body;
    try {
        const event = await Event.findById(req.params.id);
        if (event && event.user.toString() === req.session.user._id) {
            event.title = title;
            event.description = description;
            await event.save();
            res.json({ success: true, message: 'Event updated successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Unauthorized or event not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.post('/delete/:id', authMiddleware, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (event && event.user.toString() === req.session.user._id) {
            await event.deleteOne();
            res.json({ success: true, message: 'Event deleted successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Unauthorized or event not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
module.exports = router;