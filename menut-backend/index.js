require('dotenv').config()

const cors = require('cors')
const express = require('express')
const app = express()

const authMiddleware = require('./middleware/auth')

app.use(cors())
app.use(express.json())

const authRoutes = require('./routes/auth')
app.use('/auth', authRoutes)

const groupRoutes = require('./routes/group')
app.use('/groups', authMiddleware, groupRoutes)

const availabilityRoutes = require('./routes/availability')
app.use('/availability', authMiddleware, availabilityRoutes)

app.listen(3000, () => {
    console.log('Server running on port 3000')
})