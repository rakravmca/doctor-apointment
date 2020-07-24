const express = require('express')
const router = express.Router();
//const axios = require('axios');
const User = require('../models/User')
const Doctor = require('../models/Doctor')
const Appointment = require('../models/Appointment')
const auth = require('../middleware/auth')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const moment = require('moment')

router.post('/book', auth, async(req, res) => {
    //console.log(req.body)
    try {
        const { appointment_date, doctor_id } = req.body

        //Get doctor details
        var doctor =  await Doctor.findById(doctor_id);

        //Get user details
        // var token = req.cookies.token;
        // const data = jwt.verify(token, process.env.JWT_KEY);
        const user = await User.findOne({ _id: req.user._id });

        let day_start_time = doctor.day_start_time;
        let appointment_slot_time = doctor.appointment_slot_time;
        let appointmentCount = await Appointment.countDocuments({
            doctor:doctor_id, 
            appointment_date : appointment_date,
            appointment_status : 'Open'
        });

        //console.log(appointmentCount)
        //console.log(doctor.patients_per_day)

        if(appointmentCount < doctor.patients_per_day){
            let appointmentTime = (day_start_time * 60) +  (appointmentCount * appointment_slot_time);
            appointmentTime = appointmentTime / 60;

            var appointment = new Appointment({
                doctor : doctor,
                appointment_date : appointment_date,
                appointment_time : appointmentTime,
                patient_name : user.name,
                patient_email : user.email,
                patient_phone : user.phone,
                appointment_status : 'Open',
                creater : user
            });

            var result = await appointment.save();

            res.json({appointment_detail : result })
        }
        else{
            res.json({appointment_detail : null })
        }
    } catch (error) {
        res.status(400).send('error')
    }
});

router.post('/cancel', auth, async(req, res) => {
    //console.log(req.body)
    try {
        const { appointment_id } = req.body;
        let appointment = await Appointment.findById(appointment_id);
        appointment.appointment_status = 'Cancelled'
        await appointment.save();

        let appointment_date = appointment.appointment_date;
        let doctor_id = appointment.doctor;
        console.log(appointment_date)

        let appointments = await Appointment.find({
            doctor:doctor_id, 
            appointment_date : appointment_date, 
            appointment_status : 'Open'
        });        

        //console.log(appointments)

        //Get doctor details
        var doctor =  await Doctor.findById(doctor_id);
        let day_start_time = doctor.day_start_time;
        let appointment_slot_time = doctor.appointment_slot_time;

        appointments.forEach(function(doc, index) {
            let appointment_time = ((day_start_time * 60) +  (index * appointment_slot_time)) / 60;
            //console.log(doc)
            doc.appointment_time = appointment_time;
            doc.save();
        });

        res.json({appointment_detail : appointment })
    } catch (error) {
        res.status(400).send(error)
    }
});

router.post('/close', auth, async(req, res) => {
    //console.log(req.body)
    try {
        const { appointment_id } = req.body;
        let appointment = await Appointment.findById(appointment_id);
        appointment.appointment_status = 'Closed'
        await appointment.save();
        res.json({appointment_detail : appointment })
    } catch (error) {
        res.status(400).send(error)
    }
});

router.get('/list', auth, async (req, res) => {
    var now = new Date();
    now.setHours(0,0,0,0);
    var todayAppointment =  await Appointment.find({creater : req.user._id, appointment_date : {
        $gte: now,
        $lte: now
    }}).sort({appointment_date: 1})
    .populate({ path: 'doctor', select: 'name specialist appointment_slot_time' });

    let todayAppt = [];
    for(let i=0;i<todayAppointment.length;i++){
        todayAppt.push(todayAppointment[i].toJSON())
    }

    let pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    pastDate.setHours(0,0,0,0);
    var pastAppointment =  await Appointment.find({creater : req.user._id, appointment_date : {
        $lte: pastDate
    }}).sort({appointment_date: 1})
    .populate({ path: 'doctor', select: 'name specialist appointment_slot_time' });  

    let pastAppt = [];
    for(let i=0;i<pastAppointment.length;i++){
        pastAppt.push(pastAppointment[i].toJSON())
    }
    
    let nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    nextDate.setHours(0,0,0,0);
    var futureAppointment =  await Appointment.find({creater : req.user._id, appointment_date : {
        $gte: nextDate,
    }}).sort({appointment_date: 1})
    .populate({ path: 'doctor', select: 'name specialist appointment_slot_time' });

    let futureAppt = [];
    for(let i=0;i<futureAppointment.length;i++){
        futureAppt.push(futureAppointment[i].toJSON())
    }

    //console.log(appointments)

    res.render('appointment-list', {
        title :'Appointments',
        user : req.user.toJSON(),
        is_doctor: req.doctor != null,
        past_appointment : pastAppt,
        today_appointment : todayAppt,
        future_appointment : futureAppt
    })
});

router.get('/patient/list', auth, async (req, res) => {
    var now = new Date();
    now.setHours(0,0,0,0);
    var todayAppointment =  await Appointment.find({doctor : req.doctor._id, appointment_date : {
        $gte: now,
        $lte: now
    }}).sort({appointment_date: 1});

    let todayAppt = [];
    for(let i=0;i<todayAppointment.length;i++){
        todayAppt.push(todayAppointment[i].toJSON())
    }

    let pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    pastDate.setHours(0,0,0,0);
    var pastAppointment =  await Appointment.find({doctor : req.doctor._id, appointment_date : {
        $lte: pastDate
    }}).sort({appointment_date: 1});  

    let pastAppt = [];
    for(let i=0;i<pastAppointment.length;i++){
        pastAppt.push(pastAppointment[i].toJSON())
    }
    
    let nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    nextDate.setHours(0,0,0,0);
    var futureAppointment =  await Appointment.find({doctor : req.doctor._id, appointment_date : {
        $gte: nextDate,
    }}).sort({appointment_date: 1});

    let futureAppt = [];
    for(let i=0;i<futureAppointment.length;i++){
        futureAppt.push(futureAppointment[i].toJSON())
    }

    //console.log(appointments)

    res.render('patient-appointment-list', {
        title :'Patient Appointments',
        user : req.user.toJSON(),
        is_doctor: req.doctor != null,
        past_appointment : pastAppt,
        today_appointment : todayAppt,
        future_appointment : futureAppt
    })
});


module.exports = router;