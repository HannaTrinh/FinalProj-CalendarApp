const mongoose= require('mongoose');
const EventSchema = new mongoose.Schema({
    date: {type: Date,required: true},
    title: {type: String,required: true},
    description: {type: String, required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});
module.exports = mongoose.model('Event',EventSchema);