const jwt = require('jsonwebtoken')
const User = require('../models/User')

const Doctor = require('../models/Doctor')
//const Role = require('../models/Role')

const auth = async(req, res, next) => {
    try {
        //const token = req.header('Authorization').replace('Bearer ', '')
        var token = req.cookies.token;
        if (!token) return res.status(401).send('Access Denied: No Token Provided!');

        const data = jwt.verify(token, process.env.JWT_KEY)

        const user = await User.findOne({ _id: data._id, 'tokens.token': token })
                    .select({"name": 1, "email": 1, "phone": 1});

        if (!user) {
            throw new Error()
        }        
            
        //var doctorCount = await Doctor.countDocuments({user:data._id});
        var doctor = await Doctor.findOne({user:data._id}).select({"name": 1});
        //user.is_doctor = doctorCount > 0;

        //console.log(doctorCount)
        
        //console.log(user)
        req.user = user
        req.doctor = doctor
        next()

        // const isRoleAccess = Role[data.role].find(function(url){ 
        //         return url== req.url
        //     });

        // if(isRoleAccess)
        // {
        //     const user = await User.findOne({ _id: data._id, 'tokens.token': token })
        //     if (!user) {
        //         throw new Error()
        //     }
        //     req.user = user
        //     req.token = token
        //     next()
        // }
        // else{
        //     return res.status(401).send(data.role + ' ' + req.url + ' ' + 'Access Denied: You dont have correct privilege to perform this operation');
        // }        
        
    } catch (error) {
        res.status(401).send({ error: 'Not authorized to access this resource' + error})
    }

}
module.exports = auth