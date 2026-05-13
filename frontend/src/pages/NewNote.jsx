import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NewNote = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.')
      return
    }

    try {
      setSaving(true)
      const token = await user?.getIdToken()
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      })

      if (!response.ok) {
        const payload = await response.json()
        throw new Error(payload.error || 'Unable to create note.')
      }

      navigate('/notes')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1>Create New Note</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Content
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={6}
            />
          </label>
        </div>
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Note'}
        </button>
      </form>
    </div>
  )
}

export default NewNote
