const express = require('express')
const router = express.Router()
const User = require('../models/User')

router.post('/auth/register', async (req, res) => {
    try {
        const {email, pass} = req.body
        const user = new User({email, pass})
        await user.save()
        res.status(201).send()
    } catch (e) {
        res.status(500).send({ error: 'Internal Server Error' })
    }
})

router.post('/auth/login', async (req, res) => {
    try {
        const {email, pass} = req.body
        const user = await User.findOne({email, pass})
        if (!user) {
            res.status(200).json({message: "Invalid credentials", status: false})
        } else {
            res.status(200).json({message: "Success", status: true})
        }
    } catch (e) {
        res.status(500).send({ error: 'Internal Server Error' })
    }
})

module.exports = router