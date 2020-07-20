const express = require('express')
const router = express.Router();
//const axios = require('axios');
const User = require('../models/User')
const Doctor = require('../models/Doctor')

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
        console.log(user)
        if (user.error) {
            return res.status(400).send('Login failed! Check authentication credentials. ' + user.error)
        }
        const token = await user.generateAuthToken()
        res.cookie('token', token);
        res.send({token : token })
    } catch (error) {
        res.status(400).send('error')
    }

})

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

router.get('/appointment/:id', async (req, res) => {
    let id = req.params.id;
    var result =  await Doctor.findById(id);
    console.log(result)
    // let doctors = [];
    // for(let i=0;i<result.length;i++){
    //     doctors.push(result[i].toJSON())
    // }
    res.render('appointment', {
        title :'Book Appointment',
        doctor : result.toJSON()
    })
});

router.get('/logout', async (req, res) => {
    const result = await axios.get('http://localhost:3000/api/user/logoutall', {
        headers:{
            "Authorization" : "Bearer " + req.cookies.token
        }
    });
    
    res.clearCookie('token');
    
    res.render('login',{
        title:'Login'
    })
});

module.exports = router;