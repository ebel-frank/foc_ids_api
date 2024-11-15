const CsvParser = require('json2csv').Parser
const Node = require('../models/Node')
const Alert = require('../models/Alert')
const IntrusionData = require('../models/IntrusionData')


module.exports = (app, io) => {
    app.post('/api/intrusion', async (req, res) => {
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
            await intrusionData.save()
            res.status(201).send();
        } catch (e) {
            console.log(e);
            
            res.status(500).send({message: e.message}); // 'Internal Server Error'
        }
    })

    app.get('/api/intrusion', async (req, res)=>{
        try {
            const limit = parseInt(req.query.limit) || 20;

            const intrusions = await IntrusionData.find()
                .sort({ _id: -1 })
                .limit(limit);
            res.status(200).json(intrusions)
        } catch (e) {
            res.status(400).send({ success: false, message: e.message })
        }
    })

    app.get('/api/get_neighbor_status/:position', (req, res) => {
        console.log(req.params.position)
        res.status(200).json({ left: 1, right: 0 })
    })

    // Endpoint to receive ESP32 status
    app.get('/api/status/:id', async (req, res) => {
        console.log(`Received call from ${req.params.id}`);

        const node = await Node.findById(req.params.id)
        node.last_seen = Date.now()
        await node.save()

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
            const csvParser = new CsvParser({ csvFields })
            const csvData = csvParser.parse(intrusions)
            res.setHeader("Content-Type", "text/csv")
            res.setHeader("Content-Disposition", "attachment: filename=intrusionDatas.csv")
            res.status(200).end(csvData)
        } catch (e) {
            res.status(400).send({ success: false, message: e.message })
        }
    })

    app.post('/api/node', async (req, res) => {
        try {
            const { position, location, lat, long } = req.body;

            // Validate request
            if (!position || !location || !lat || !long) {
                return res.status(400).json({ message: `All fields are required. ${location} ${lat} ${long}` });
            }

            const node = new Node({
                position, location, lat, long, last_seen: Date.now()
            })
            const savedNode = await node.save()
            res.status(200).json(savedNode)
        } catch (e) {
            res.status(400).send({ success: false, message: e.message })
        }
    })

    app.get('/api/nodes', async (req, res) => {
        try {
            const nodes = await Node.find()
            res.status(200).json(nodes)
        } catch (e) {
            res.status(400).send({ success: false, message: e.message })
        }
    })

    app.post('/api/alerts', async (req, res) => {
        try {
            const { node_id, type } = req.body;
            if (!node_id) {
                res.send("All fields required")
            }

            const node = await Node.findById(node_id)
            let alert = 0
            if (type == 0) {
                alert = `Intrusion detected at ${node.location}, Node #${node.position}.`
            } else if (type == 1) {
                alert = `Attention: Node #${node.position} at ${node.location} is currently inactive. Please investigate the issue immediately.`
            }
            const alerts = new Alert({ alert, lat: node.lat, long: node.long })
            await alerts.save()
            io.emit('alert_updates', alerts)
            res.status(200).json({ succcess: true })
        } catch (e) {
            res.status(400).send({ success: false, message: e.message })
        }
    })

    app.get('/api/alerts', async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 20;

            const alerts = await Alert.find()
                .sort({ _id: -1 })
                .limit(limit);
            res.status(200).json(alerts)
        } catch (e) {
            res.status(400).send({ success: false, message: e.message })
        }
    })
}