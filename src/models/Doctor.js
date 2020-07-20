const mongoose = require('mongoose')

const doctorSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    specialist: {
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
}, 
{
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true 
    }
});

doctorSchema.virtual('start_time').get(function() {
    if(this.day_start_time >= 12)
    {
        return (this.day_start_time - 12) + ':00 pm'
    }
    else{
        return this.day_start_time + ':00 am'
    }
});

doctorSchema.virtual('end_time').get(function() {
    if(this.day_end_time >= 12)
    {
        return (this.day_end_time - 12) + ':00 pm'
    }
    else{
        return this.day_end_time + ':00 am'
    }
});

doctorSchema.virtual('patients_per_day').get(function() {
    return parseInt(((this.day_end_time - this.day_start_time) * 60) / this.appointment_slot_time)
});

const Doctor = mongoose.model('Doctor', doctorSchema)

module.exports = Doctor