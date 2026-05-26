import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotesAPI } from '../hooks/useNotesAPI'
import '../styles/NoteForm.css'

const EditNote = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { fetchNote, updateNote } = useNotesAPI()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    const loadNote = async () => {
      if (!user || hasLoadedRef.current) return

      try {
        const result = await fetchNote(id)
        setTitle(result.title)
        setContent(result.content)
        hasLoadedRef.current = true
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadNote()
  }, [id, user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.')
      return
    }

    try {
      setSaving(true)
      const response = await updateNote(id, title, content)
      console.log('Note updated successfully:', response)
      // Redirect after a brief delay to ensure data is saved
      setTimeout(() => {
        navigate(`/notes/${id}`)
      }, 300)
    } catch (err) {
      console.error('Save error:', err)
      setError(`Failed to save: ${err.message}`)
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="note-form-container">
      <div className="note-form-box">
        <p className="loading">Loading note...</p>
      </div>
    </div>
  )

  return (
    <div className="note-form-container">
      <div className="note-form-box">
        <Link to={`/notes/${id}`} className="back-link">← Back to Note</Link>
        <h1>Edit Note</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              className="form-input"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              className="form-textarea"
              placeholder="Write your note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={8}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link to={`/notes/${id}`} className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditNote
