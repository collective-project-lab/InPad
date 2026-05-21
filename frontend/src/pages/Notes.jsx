import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { useNotesAPI } from '../hooks/useNotesAPI'

const Notes = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { fetchNotes } = useNotesAPI()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadNotes = async () => {
      if (!user) return

      try {
        const result = await fetchNotes()
        setNotes(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadNotes()
  }, [user, fetchNotes])

  
  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <div>
      <h1>My Notes</h1>
      <p>Logged in as: {user?.email}</p>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/notes/new">Create New Note</Link>
      </div>
      {loading && <p>Loading notes...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <>
          {notes.length > 0 ? (
            <ul>
              {notes.map((note) => (
                <li key={note.id}>
                  <Link to={`/notes/${note.id}`}>{note.title}: {note.content}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No notes yet. Create one to get started.</p>
          )}
        </>
      )}
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default Notes