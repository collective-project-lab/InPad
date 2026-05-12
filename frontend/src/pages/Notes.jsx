import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'

const Notes = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const token = await user?.getIdToken()
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/protected`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!response.ok) throw new Error('Failed to fetch')
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err.message)
      }
    }

    if (user) fetchProtectedData()
  }, [user])

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <div>
      <h1>My Notes</h1>
      <p>Logged in as: {user?.email}</p>
      {data && <p>Server message: {data.message}</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <button onClick={handleLogout}>Logout</button>
      {/* notes will go here */}
    </div>
  )
}

export default Notes