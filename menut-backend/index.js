require('dotenv').config()

const cors = require('cors')
const express = require('express')
const app = express()

const authMiddleware = require('./middleware/auth')

app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://menut.vercel.app'
    ]
}))
app.use(express.json())

app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok' })
})

const authRoutes = require('./routes/auth')
app.use('/auth', authRoutes)

const groupRoutes = require('./routes/group')
app.use('/groups', authMiddleware, groupRoutes)

const availabilityRoutes = require('./routes/availability')
app.use('/availability', authMiddleware, availabilityRoutes)

app.listen(4000, () => {
    console.log('Server running on port 4000')
})

module.exports = app