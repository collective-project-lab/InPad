import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotesAPI } from '../hooks/useNotesAPI'
import '../styles/NoteDetail.css'

const NoteDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { fetchNote, deleteNote } = useNotesAPI()
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const loadNote = async () => {
      if (!user) return

      try {
        const result = await fetchNote(id)
        setNote(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadNote()
  }, [id, user, fetchNote])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      setDeleting(true)
      await deleteNote(id)
      navigate('/notes')
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return (
    <div className="note-detail-container">
      <p className="loading">Loading note...</p>
    </div>
  )
  
  if (error) return (
    <div className="note-detail-container">
      <p className="error">{error}</p>
    </div>
  )

  return (
    <div className="note-detail-container">
      <div className="note-detail-box">
        <Link to="/notes" className="back-link">← Back to Notes</Link>
        <h1>{note.title}</h1>
        <div className="note-content">
          {note.content}
        </div>
        <div className="note-meta">
          <span className="note-id">ID: {note?.id}</span>
        </div>
        <div className="note-actions">
          <Link to={`/notes/${id}/edit`} className="btn btn-primary">
            Edit
          </Link>
          <button 
            onClick={handleDelete} 
            disabled={deleting}
            className="btn btn-danger"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <Link to="/notes" className="btn btn-secondary">Back</Link>
        </div>
      </div>
    </div>
  )
}

export default NoteDetail
