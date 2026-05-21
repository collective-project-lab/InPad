import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotesAPI } from '../hooks/useNotesAPI'
import '../styles/Notes.css'

const Notes = () => {
  const { user } = useAuth()
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

  return (
    <div className="notes-container">
      {user?.isAnonymous && (
        <div className="guest-banner">
          <p>� <strong>You're browsing as a guest.</strong> Notes will be saved to your account.</p>
          <Link to="/signup" className="upgrade-link">Create an account to save notes permanently</Link>
        </div>
      )}

      <div className="notes-header">
        <h1>My Notes</h1>
        <Link to="/notes/new" className="btn btn-primary">
          + Create New Note
        </Link>
      </div>

      {loading && <p className="loading">Loading notes...</p>}
      {error && <p className="error">{error}</p>}
      
      {!loading && !error && (
        <>
          {notes.length > 0 ? (
            <ul className="notes-list">
              {notes.map((note) => (
                <li key={note.id} className="note-item">
                  <Link to={`/notes/${note.id}`} className="note-link">
                    <h3>{note.title}</h3>
                    <p>{note.content.substring(0, 100)}...</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <p>📭 No notes yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Notes