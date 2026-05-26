import { useState } from 'react'
import { createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { useNavigate, Link } from 'react-router-dom'
import '../styles/Auth.css'

const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "")

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const currentUser = auth.currentUser
      const isGuest = currentUser?.isAnonymous
      const guestUid = currentUser?.uid

      // Create new account with email/password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const namedUid = userCredential.user.uid

      // If this was a guest account, migrate their data
      if (isGuest && guestUid) {
        try {
          const token = await auth.currentUser.getIdToken()
          const response = await fetch(`${API_URL}/api/auth/migrate-notes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ guestUid, namedUid }),
          })

          if (!response.ok) {
            throw new Error('Failed to migrate notes')
          }

          const data = await response.json()
          console.log(`Successfully migrated ${data.migratedCount} notes`)
        } catch (migrateErr) {
          console.error('Migration error:', migrateErr)
          setError('Account created but failed to migrate notes. Your data may be recoverable.')
          setLoading(false)
          return
        }
      }

      navigate('/notes')
    } catch (err) {
      console.error('Signup error:', err)
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use. Please use a different email.')
      } else {
        setError('Could not create account. Try a stronger password.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Create Account</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p className="auth-link">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  )
}

export default Signup