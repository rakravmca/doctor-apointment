const mongoose = require('mongoose')

const apointmentSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    doctor: {
        type: mongoose.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    appointment_date: {
        type: Date,
        required: true,
        trim: true
    },
    appointment_time: {
        type: String,
        required: true,
        trim: true
    },
    patient_name: {
        type: String,
        required: true,
        trim: true
    },
    patient_email: {
        type: String,
        required: true,
        trim: true
    },
    patient_phone: {
        type: String,
        required: true,
        trim: true
    },
    appointment_status: {
        type: String,
        required: true,
        trim: true
    },
})

const Apointment = mongoose.model('Apointment', apointmentSchema)

module.exports = Apointment