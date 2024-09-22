require('dotenv').config();
const mongoose = require('mongoose')
const express = require('express') 
const app = express()
const authRoute = require('./routes/auth')
const intrusionRoute = require('./routes/intrusion')
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "*", // Adjust according to your needs
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true
    }
})

app.use(express.json())
app.use(authRoute)
app.use(intrusionRoute)
const PORT = 5000


// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log('A user connected.');

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected.');
    });
});

// connect to mongodb
mongoose.connect(process.env.MONGODB_URI)
    .then((result) => {
        console.log("Connected to DB")
        // Use server instead of app
        server.listen(PORT, () => {
            console.log('Server started on port ' + PORT);
        })
    })
    .catch((err) => console.log(`Error: ${err}`))