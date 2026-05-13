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
// app.get('/api/protected', verifyToken, (req, res) => {
//   res.json({ message: 'Token valid', uid: req.user.uid })
// })

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

//get all notes of specific user
app.get('/notes', (req, res)=>{
   res.status(200).json({ "userid": "user123", "title": "day 1", "content": "bla bla bla bla bla" })
})

//get all data of specific note
app.get('/notes/:id',(req, res)=>{
    const noteId = req.params.id
    //get
    res.status(200).json({ "userid": `user ${noteId}`, "title": `day ${noteId}`, "content": "bla bla bla bla bla bla bla" })
})
// http://localhost:3000