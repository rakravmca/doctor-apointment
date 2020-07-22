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

router.get('/list', auth, async (req, res) => {
    var result =  await Doctor.find();
    //console.log(req.user)

    let doctors = [];
    for(let i=0;i<result.length;i++){
        doctors.push(result[i].toJSON())
    }

    res.render('doctors', {
        title :'Doctors',
        user : req.user.toJSON(),
        doctors : doctors
    })
});

router.get('/appointment/:id', auth, async (req, res) => {
    let id = req.params.id;
    var result =  await Doctor.findById(id);
    let today = new Date();
    //let today = moment(new Date()).startOf('day')
    //var now = new Date();
    //start.setHours(1,0,0,1);
    //var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());


    const user = req.user;

    var now = new Date();
    now.setHours(0,0,0,0);
    var todayAppointment =  await Appointment.find({creater : user._id, doctor : id, appointment_date : {
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
    var pastAppointment =  await Appointment.find({creater : user._id, doctor : id, appointment_date : {
        $lte: pastDate
    }}).sort({appointment_date: 1});    

    let pastAppt = [];
    for(let i=0;i<pastAppointment.length;i++){
        pastAppt.push(pastAppointment[i].toJSON())
    }
    
    let nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    nextDate.setHours(0,0,0,0);
    var futureAppointment =  await Appointment.find({creater : user._id, doctor : id, appointment_date : {
        $gte: nextDate,
    }}).sort({appointment_date: 1});

    let futureAppt = [];
    for(let i=0;i<futureAppointment.length;i++){
        futureAppt.push(futureAppointment[i].toJSON())
    }

    res.render('appointment', {
        title :'Book Appointment',
        user : req.user.toJSON(),
        doctor : result.toJSON(),
        past_appointment : pastAppt,
        today_appointment : todayAppt,
        future_appointment : futureAppt
    })
});


module.exports = router;