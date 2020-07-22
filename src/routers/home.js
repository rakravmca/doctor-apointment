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

router.get('', auth, (req, res)=>{
    res.render('home',  
    { 
      layout: 'main', 
      title : 'Dashboard',
      user : req.user.toJSON()});
});


module.exports = router;