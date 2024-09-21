const mongoose = require('mongoose')
const Schema = mongoose.Schema

const intrusiionDataScehema = new Schema({
    timestamp: {
        type: String,
        required: true
    },
    vibration_amplitude: {
        type: Number,
        required: true
    },
    vibration_frequency: {
        type: Number,
        required: true,
    },
    sound_amplitude: {
        type: Number,
        required: true,
    },
    sound_frequency: {
        type: Number,
        required: true,
    },
    temperature: {
        type: Number,
        required: true
    },
    humidity: {
        type: Number,
        required: true,
    },
    event_type: {
        type: String,
        required: true
    },
})

module.exports = mongoose.model('IntrusionData', intrusiionDataScehema)

