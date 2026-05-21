import { useAuth } from '../context/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useNavigate, Link } from 'react-router-dom'
import '../styles/Navbar.css'

const Navbar = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/notes" className="navbar-logo">
          📝 InPad
        </Link>

        <div className="navbar-right">
          {user ? (
            <>
              {!user.isAnonymous && (
                <>
                  <span className="user-info">{user.email}</span>
                  <button onClick={handleLogout} className="btn btn-logout">
                    Logout
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-login">
                Login
              </Link>
              <Link to="/signup" className="btn btn-signup">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
