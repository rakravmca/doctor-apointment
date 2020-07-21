const mongoose = require('mongoose')

const apointmentSchema = mongoose.Schema({
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
        type: Number,
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
    creater: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
},
{
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true 
    },
    timestamps: true
});

apointmentSchema.virtual('user_appointment_time').get(function() {
    let ampm = 'am';
    let min = '00'
    let hour = '00'

    if(this.appointment_time >= 12)
    {
        let totmin = (this.appointment_time - 12) * 60;

        hour = parseInt(totmin / 60);
        min = totmin % 60;
        ampm = 'pm'
    }
    else{
        let totmin = this.appointment_time * 60;
        hour = parseInt(totmin / 60);
        min = totmin % 60;

        ampm = 'am'
    }

    //console.log(hour + ':' + min + ' ' + ampm)

    return hour + ':' + (min >= 10 ? min : '0' + min)  + ' ' + ampm
});

const Appointment = mongoose.model('Appointment', apointmentSchema)

module.exports = Appointment