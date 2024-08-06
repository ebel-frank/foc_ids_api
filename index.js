const mongoose = require('mongoose')
const express = require('express')
const app = express()

app.use(express.json())
const PORT = 5000

app.post('/api/intrusion', (req, res) => {
    console.log(req.body)

    res.status(201).send()
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