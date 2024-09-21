const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userScehema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    pass: {
        type: String,
        required: true
    },
})

module.exports = mongoose.model('User', userScehema)
