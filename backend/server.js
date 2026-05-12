require('dotenv').config()
const express = require('express')
const cors = require('cors')
const verifyToken = require('./src/middleware/auth')

const app = express()

app.use(cors())
app.use(express.json())

// public route
app.get('/', (req, res) => {
  res.send('Inkpad API running...')
})

// protected test route
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: 'Token valid', uid: req.user.uid })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})