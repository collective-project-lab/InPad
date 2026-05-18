import { admin } from '../firebase/admin.js'

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1]
  if (!token) return res.status(401).json({ error: 'No token provided' })

  try {
    const decoded = await admin.auth().verifyIdToken(token)
    req.user = decoded
    next()
  } catch (err) {
    console.error('Token verification failed:', err.message)
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export default verifyToken