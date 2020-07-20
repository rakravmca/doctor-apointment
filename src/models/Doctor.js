const mongoose = require('mongoose')

const doctorSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    appointment_slot_time: {
        type: Number,
        required: true,
        trim: true
    },
    day_start_time: {
        type: Number,
        required: true,
        trim: true
    },
    day_end_time: {
        type: Number,
        required: true,
        trim: true
    },
})

const Doctor = mongoose.model('Doctor', doctorSchema)

module.exports = Doctor