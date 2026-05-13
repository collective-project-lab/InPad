import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NoteDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchNote = async () => {
      if (!user) return

      try {
        const token = await user.getIdToken()
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Unable to load note.')
        }

        const result = await response.json()
        setNote(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchNote()
  }, [id, user])

  if (loading) return <p>Loading note...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div>
      <h1>{note.title}</h1>
      <p>{note.content}</p>
      <p>
        <strong>Note ID:</strong> {note?.id}
      </p>
      <Link to="/notes">Back to notes</Link>
    </div>
  )
}

export default NoteDetail
