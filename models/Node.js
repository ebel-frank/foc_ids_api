const mongoose = require('mongoose')
const Schema = mongoose.Schema

const nodeScehema = new Schema({
    location: {
        type: String,
        required: true,
    },
    position: {
        type: Number,
        required: true,
        unique: true
    },
    lat: {
        type: Number,
        required: true
    },
    long: {
        type: Number,
        required: true
    },
    last_seen: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Node', nodeScehema)
