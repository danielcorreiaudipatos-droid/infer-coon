import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store'

export default function Navbar() {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">OnCreators</Link>

        <div className="flex gap-4">
          <Link to="/creators" className="hover:text-primary">Creators</Link>
          <Link to="/marketplace" className="hover:text-primary">Marketplace</Link>
          <Link to="/pricing" className="hover:text-primary">Premium</Link>

          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-primary">Dashboard</Link>
              <button onClick={handleLogout} className="btn-primary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-primary">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
