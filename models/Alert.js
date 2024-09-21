const mongoose = require('mongoose')
const Schema = mongoose.Schema

const alertScehema = new Schema({
    email: {
        type: String,
        required: true,
    },
    pass: {
        type: String,
        required: true
    },
})

module.exports = mongoose.model('Alert', alertScehema)
