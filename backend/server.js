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

// protected note routes
app.get('/api/notes', (req, res) => {
  const userId = req.user?.uid || 'unknown'
  const notes = [
    { id: '1', userId, title: 'title', content: 'This is the first note.' },
    { id: '2', userId, title: 'Day 2', content: 'This is the second note.' },
  ]
  res.status(200).json(notes)
})

app.get('/api/notes/:id', (req, res) => {
  const { id } = req.params
  const note = {
    id,
    userId: req.user?.uid || 'unknown',
    title: `Day ${id}`,
    content: `This is note description ${id}.`,
  }
  res.status(200).json(note)
})

app.post('/api/notes', verifyToken, (req, res) => {
  const { title, content } = req.body
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' })
  }

  const note = {
    id: String(Math.floor(Math.random() * 10000) + 1),
    userId: req.user.uid,
    title,
    content,
  }

  res.status(201).json(note)
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})