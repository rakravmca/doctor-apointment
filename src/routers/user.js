const express = require('express')
const router = express.Router();
//const axios = require('axios');
const User = require('../models/User')
const Doctor = require('../models/Doctor')
const Appointment = require('../models/Appointment')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

router.get('/login', async (req, res) => {
    res.render('login', {
        layout: 'login',
        title :'Login',
        data:{
        }
    })
});

router.post('/authenticate', async(req, res) => {
    //Login a registered user
    //console.log(req.body)
    try {
        const { email, password } = req.body
        console.log(req.body)
        const user = await User.findByCredentials(email, password)
        //console.log(user)
        if (user.error) {
            return res.status(400).send('Login failed! Check authentication credentials. ' + user.error)
        }
        const token = await user.generateAuthToken()
        res.cookie('token', token);
        res.send({token : token })
    } catch (error) {
        res.status(400).send('error')
    }

});

router.post('/logout', async(req, res) => {
    try {
        //const token = req.header('Authorization').replace('Bearer ', '')
       
        var token = req.cookies.token;
        //console.log(token);
        if (!token) {
          return res.status(200).send('Access Denied: No Token Provided!')
        }
        else{
          const data = jwt.verify(token, process.env.JWT_KEY)
          //console.log(data)
          const user = await User.findOne({ _id: data._id, 'tokens.token': token })
          user.tokens.splice(0, user.tokens.length)
          await user.save()
          res.clearCookie('token');
          res.send({user : user})
        }
    } catch (error) {
        res.status(400).send('error')
    }
});


//***************************************//
//**********DOCTOR****************//
//***************************************//

router.get('/doctors', async (req, res) => {
    var result =  await Doctor.find();
    //console.log(result)
    let doctors = [];
    for(let i=0;i<result.length;i++){
        doctors.push(result[i].toJSON())
    }
    // var data = [];
    // doctors.map(function(index, doct){
    //     data.push(doct);
    // })
    
    //console.log(doctors)
    res.render('doctors', {
        title :'Doctors',
        doctors : doctors
    })
});

//***************************************//
//**********APPOINTMENT****************//
//***************************************//

router.get('/doctors/book/:id', async (req, res) => {
    let id = req.params.id;
    var result =  await Doctor.findById(id);
    //console.log(result)
    // let doctors = [];
    // for(let i=0;i<result.length;i++){
    //     doctors.push(result[i].toJSON())
    // }
    res.render('appointment', {
        title :'Book Appointment',
        doctor : result.toJSON()
    })
});

router.post('/appointment/book', async(req, res) => {
    console.log(req.body)
    try {
        const { appointment_date, doctor_id } = req.body

        //Get doctor details
        var doctor =  await Doctor.findById(doctor_id);

        //Get user details
        var token = req.cookies.token;
        const data = jwt.verify(token, process.env.JWT_KEY);
        const user = await User.findOne({ _id: data._id, 'tokens.token': token });

        let day_start_time = doctor.day_start_time;
        let appointment_slot_time = doctor.appointment_slot_time;
        let appointmentCount = await Appointment.countDocuments({doctor:doctor_id, appointment_date : appointment_date});

        console.log(appointmentCount)
        console.log(doctor.patients_per_day)

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
    } catch (error) {
        res.status(400).send('error')
    }
});

router.get('/appointment/list', async (req, res) => {
    //Get user details
    var token = req.cookies.token;
    const data = jwt.verify(token, process.env.JWT_KEY);
    const user = await User.findOne({ _id: data._id, 'tokens.token': token })
    var result =  await Appointment.find({creater : user._id})
                .populate({ path: 'doctor', select: 'name specialist appointment_slot_time' });

    let appointments = [];
    for(let i=0;i<result.length;i++){
        appointments.push(result[i].toJSON())
    }

    //console.log(appointments)

    res.render('appointment-list', {
        title :'Appointment List',
        appointments : appointments
    })
});

module.exports = router;