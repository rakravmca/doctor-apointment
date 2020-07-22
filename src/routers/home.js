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

router.get('', auth, async (req, res)=>{

  if(req.doctor){
    var totalAppointmentCount =  await Appointment.countDocuments(
      {
        doctor : req.doctor._id
      });

    var now = new Date();
    now.setHours(0,0,0,0);
    var openAppointmentCount =  await Appointment.countDocuments(
      {
        doctor : req.doctor._id, 
        appointment_status : 'Open',
        appointment_date : {
          $gte: now
        }
      });
    
    var now = new Date();
    now.setHours(0,0,0,0);
    var cancelledAppointmentCount =  await Appointment.countDocuments(
      {
        doctor : req.doctor._id, 
        appointment_status : 'Cancelled'
      });
    
    let pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    pastDate.setHours(0,0,0,0);
    var closedAppointmentCount =  await Appointment.countDocuments(
      {
        doctor : req.doctor._id, 
        appointment_status : 'Closed',
        appointment_date : {
          $lte: pastDate
        }
      });

    res.render('doctor-home',  
    { 
      layout: 'main', 
      title : 'Dashboard',
      user : req.user.toJSON(),
      is_doctor: req.doctor != null,
      total : totalAppointmentCount,
      open : openAppointmentCount,
      closed:closedAppointmentCount,
      cancelled:cancelledAppointmentCount
    });
  }
  else{
    var totalAppointmentCount =  await Appointment.countDocuments(
      {
        creater : req.user._id
      });

    var now = new Date();
    now.setHours(0,0,0,0);
    var openAppointmentCount =  await Appointment.countDocuments(
      {
        creater : req.user._id, 
        appointment_status : 'Open',
        appointment_date : {
          $gte: now
        }
      });
    
    var now = new Date();
    now.setHours(0,0,0,0);
    var cancelledAppointmentCount =  await Appointment.countDocuments(
      {
        creater : req.user._id, 
        appointment_status : 'Cancelled'
      });
    
    let pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    pastDate.setHours(0,0,0,0);
    var closedAppointmentCount =  await Appointment.countDocuments(
      {
        creater : req.user._id, 
        appointment_status : 'Closed',
        appointment_date : {
          $lte: pastDate
        }
      });
      
    var notAttendedAppointmentCount =  await Appointment.countDocuments(
      {
        creater : req.user._id, 
        appointment_status : 'Open',
        appointment_date : {
          $lte: pastDate
        }
      });

    res.render('home',  
    { 
      layout: 'main', 
      title : 'Dashboard',
      user : req.user.toJSON(),
      total : totalAppointmentCount,
      open : openAppointmentCount,
      closed:closedAppointmentCount,
      cancelled:cancelledAppointmentCount,
      notAttended : notAttendedAppointmentCount
    });
  }
    
});


module.exports = router;