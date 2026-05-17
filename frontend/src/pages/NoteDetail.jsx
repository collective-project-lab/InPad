import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotesAPI } from '../hooks/useNotesAPI'

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

  if (loading) return <p>Loading note...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div>
      <h1>{note.title}</h1>
      <p>{note.content}</p>
      <p>
        <strong>Note ID:</strong> {note?.id}
      </p>
      <div style={{ marginTop: '1rem' }}>
        <Link to={`/notes/${id}/edit`}>Edit</Link>
        {' | '}
        <button onClick={handleDelete} disabled={deleting} style={{ marginLeft: '1rem' }}>
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
        {' | '}
        <Link to="/notes" style={{ marginLeft: '1rem' }}>Back to notes</Link>
      </div>
    </div>
  )
}

export default NoteDetail
