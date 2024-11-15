const mongoose = require('mongoose')
const Schema = mongoose.Schema

const alertScehema = new Schema({
    alert: {
        type: String,
        required: true,
    },
    lat: {
        type: Number,
        required: true
    },
    long: {
        type: Number,
        required: true
    },
}, {timestamps: true})

module.exports = mongoose.model('Alert', alertScehema)
