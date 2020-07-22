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

router.get('/login', async (req, res) => {
    res.render('login', {
        layout: 'login',
        title :'Login'
    })
});

router.post('/authenticate', async(req, res) => {
    //Login a registered user
    //console.log(req.body)
    try {
        const { email, password } = req.body
        //console.log(req.body)
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

router.post('/logout', auth, async(req, res) => {
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
          res.send({user : null})
        }
    } catch (error) {
        res.status(400).send('error')
    }
});

module.exports = router;