require('dotenv').config();
const mongoose = require('mongoose')
const express = require('express')
const CsvParser = require('json2csv').Parser
const IntrusionData = require('./models/IntrusionData')
const app = express()
const authRoute = require('./routes/auth')

app.use(express.json())
app.use(authRoute)
const PORT = 5000

app.post('/api/intrusion', (req, res) => {
    console.log(req.body)
    const { timestamp, temp, humidity, vib_amp, vib_freq, snd_amp, snd_freq, event_type } = req.body;
    try {
        const intrusionData = new IntrusionData({
            timestamp,
            temperature: temp,
            humidity,
            vibration_amplitude: vib_amp,
            vibration_frequency: vib_freq,
            sound_amplitude: snd_amp,
            sound_frequency: snd_freq,
            event_type
        })
        intrusionData.save()
        res.status(201).send();
    } catch (e) {
        res.status(500).send(); // 'Internal Server Error'
    }
})

app.get('/api/get_neighbor_status/:position', (req, res) => {
    console.log(req.params.position)
    res.status(200).json({ left: 1, right: 0 })
})

// Endpoint to receive ESP32 status
app.post('/api/status', (req, res) => {
    const { status, timestamp } = req.body;
    console.log(`Received status: ${status} at ${timestamp}`);

    // Respond to the ESP32 with a success code
    res.status(200).send();
});

app.get('/api/export_data', async (req, res) => {
    try {

        let intrusions = []
        var intrusionDatas = await IntrusionData.find({})
        intrusionDatas.forEach((intrusion) => {
            const { timestamp, vibration_amplitude, vibration_frequency, sound_amplitude, sound_frequency, temperature, humidity, event_type } = intrusion
            intrusions.push(
                { timestamp, temperature, humidity, vibration_amplitude, vibration_frequency, sound_amplitude, sound_frequency, event_type }
            )
        })

        const csvFields = ["Timestamp", "Temperature", "Humidity", "Vibration Amplitude", "Vibration Frequency", "Sound Amplitude", "Sound Frequency", "Event Type"]
        const csvParser = new CsvParser({csvFields})
        const csvData = csvParser.parse(intrusions)
        res.setHeader("Content-Type", "text/csv")
        res.setHeader("Content-Disposition", "attachment: filename=intrusionDatas.csv")
        res.status(200).end(csvData)
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

// connect to mongodb
mongoose.connect(process.env.MONGODB_URI)
    .then((result) => {
        console.log("Connected to DB")
        // Use server instead of app
        app.listen(PORT, () => {
            console.log('Server started on port ' + PORT);
        })
    })
    .catch((err) => console.log(`Error: ${err}`))