const express = require('express')
const router = express.Router()
const Node = require('../models/Node')
const Alert = require('../models/Alert')

router.post('/api/intrusion', (req, res) => {
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

router.get('/api/get_neighbor_status/:position', (req, res) => {
    console.log(req.params.position)
    res.status(200).json({ left: 1, right: 0 })
})

// Endpoint to receive ESP32 status
router.get('/api/status/:id', async (req, res) => {
    console.log(`Received call from ${req.params.id}`);

    const node = await Node.findById(req.params.id)
    node.last_seen = Date.now()
    await node.save()

    // Respond to the ESP32 with a success code
    res.status(200).send();
});

router.get('/api/export_data', async (req, res) => {
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

router.post('/api/node', async (req,res) => {
    try {
        const { location, lat, long } = req.body;

        // Validate request
        if (!location || !lat || !long) {
            return res.status(400).json({ message: `All fields are required. ${location} ${lat} ${long}` });
        }

        const node = new Node({
            location, lat, long, last_seen: Date.now()
        })
        const savedNode = await node.save()
        res.status(200).json(savedNode)
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

router.get('/api/nodes', async (req, res) => {
    try {
        const nodes = await Node.find()
        res.status(200).json(nodes)
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

router.post('/api/alerts', async (req, res) => {
    try {
        const {alert, lat, long} = req.body;

        if (!alert || !lat || !long) {
            res.send("All fields required")
        }

        const alerts = new Alert({alert, lat, long})
        await alerts.save()
        io.
        res.status(200).json({succcess: true})
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

router.get('/api/alerts', async (req, res) => {
    try {
        const alerts = await Alert.find()
        res.status(200).json(alerts)
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

module.exports = router