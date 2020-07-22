const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({error: 'Invalid Email address'})
            }
        }
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minLength: 7
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
},
{
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true 
    },
    timestamps: true
})

userSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({_id: user._id}, process.env.JWT_KEY)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    // Search for a user by email and password.
    //console.log(email)
    if (!email) {
        //throw new Error({ error: 'Invalid login credentials' })
        return {error:'Email is required.'}
    }

    const user = await User.findOne({ email} )
    if (!user) {
        //throw new Error({ error: 'Invalid login credentials' })
        return {error:'Invalid email.'}
    }
    
    if (!password) {
        //throw new Error({ error: 'Invalid login credentials' })
        return {error:'Password is required.'}
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) {
        //throw new Error({ error: 'Invalid login credentials' })
        return {error:'Password mismatch.'}
    }
    return user
}

const User = mongoose.model('User', userSchema)

module.exports = User