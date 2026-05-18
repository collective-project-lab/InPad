import { useAuth } from '../context/AuthContext'

export const useNotesAPI = () => {
  const { user } = useAuth()
  const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "")

  const getToken = async () => {
    if (!user) {
      throw new Error('User is not authenticated')
    }
    const token = await user.getIdToken()
    if (!token) {
      throw new Error('Unable to get auth token')
    }
    return token
  }

  const fetchNotes = async () => {
    const token = await getToken()
    const response = await fetch(`${API_URL}/api/notes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) throw new Error('Unable to load notes.')
    return response.json()
  }

  const fetchNote = async (id) => {
    const token = await getToken()
    const response = await fetch(`${API_URL}/api/notes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) throw new Error('Unable to load note.')
    return response.json()
  }

  const createNote = async (title, content) => {
    const token = await getToken()
    const response = await fetch(`${API_URL}/api/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    })
    if (!response.ok) {
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const payload = await response.json()
        throw new Error(payload.error || 'Unable to create note.')
      }
      const text = await response.text()
      throw new Error(`Unable to create note. Server response: ${text.slice(0, 200)}`)
    }
    return response.json()
  }

  const updateNote = async (id, title, content) => {
    const token = await getToken()
    const response = await fetch(`${API_URL}/api/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    })
    if (!response.ok) {
      const payload = await response.json()
      throw new Error(payload.error || 'Unable to update note.')
    }
    return response.json()
  }

  const deleteNote = async (id) => {
    const token = await getToken()
    const response = await fetch(`${API_URL}/api/notes/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      const payload = await response.json()
      throw new Error(payload.error || 'Unable to delete note.')
    }
    return response.json()
  }

  return { fetchNotes, fetchNote, createNote, updateNote, deleteNote }
}
