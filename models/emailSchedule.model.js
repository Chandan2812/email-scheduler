const mongoose = require('mongoose');

const emailScheduleSchema = new mongoose.Schema({
    email: String,
    time: String,
    subject: String,
    body: String,
    status: {
        type: String,
        enum: ['pending', 'sent', 'error'],
        default: 'pending'
    },
    errorMessage: String
});

module.exports = mongoose.model('EmailSchedule', emailScheduleSchema);
