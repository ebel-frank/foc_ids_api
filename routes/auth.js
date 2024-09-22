const express = require('express')
const router = express.Router()
const User = require('../models/User')

router.post('/auth/register', async (req, res) => {
    try {
        const { email, pass } = req.body
        const user = new User({ email, pass })
        await user.save()
        res.status(201).send() 
    } catch (e) {
        if (e.code === 11000) {
            res.status(500).send({ error: "Email already exist" })
        } else {
            res.status(500).send({ error: `Error: ${e.code}` })
        }
    }
})

router.post('/auth/login', async (req, res) => {
    try {
        const { email, pass } = req.body
        const user = await User.findOne({ email, pass })
        console.log(user);
        console.log(email);
        console.log(pass);
        if (!user) {
            res.status(200).json({ message: "Invalid credentials", status: false })
        } else {
            res.status(200).json({ message: "Success", status: true })
        }
    } catch (e) {
        res.status(500).send({ error: 'Internal Server Error' })
    }
})

module.exports = router