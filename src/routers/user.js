const express = require('express')
const router = express.Router();
//const axios = require('axios');

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
    res.render('doctors', {
        title :'Doctors',
        data:{
        }
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