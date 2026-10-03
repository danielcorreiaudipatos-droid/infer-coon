#!/bin/bash

echo "🚀 Building OnCreators Frontend..."

# Create component directory structure
mkdir -p src/components src/pages src/services src/hooks

# Create Navbar component
cat > src/components/Navbar.jsx << 'EOF'
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
EOF

# Create Footer component
cat > src/components/Footer.jsx << 'EOF'
export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 mt-12 py-8">
      <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-300">
        <p>&copy; 2026 OnCreators. All rights reserved.</p>
        <p className="text-sm mt-2">Part of the COON Ecosystem</p>
      </div>
    </footer>
  )
}
EOF

# Create basic pages
cat > src/pages/Home.jsx << 'EOF'
export default function Home() {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold mb-4">Welcome to OnCreators</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
        The premium creator marketplace for financial education
      </p>
      <div className="grid grid-cols-3 gap-6 mt-12">
        <div className="card">
          <h3 className="font-bold text-lg mb-2">📺 Live Streams</h3>
          <p>Watch experts analyze markets in real-time</p>
        </div>
        <div className="card">
          <h3 className="font-bold text-lg mb-2">📚 Courses</h3>
          <p>Learn trading from professional creators</p>
        </div>
        <div className="card">
          <h3 className="font-bold text-lg mb-2">📊 Signals</h3>
          <p>Get trading signals and market analysis</p>
        </div>
      </div>
    </div>
  )
}
EOF

cat > src/pages/Login.jsx << 'EOF'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUser } from '../store'
import api from '../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post('/auth/login', { email, password })
      dispatch(setUser(response.data))
      navigate('/dashboard')
    } catch (error) {
      alert('Login failed: ' + error.message)
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />
        <button type="submit" className="btn-primary w-full">Login</button>
      </form>
      <p className="mt-4 text-center">
        Don't have an account? <Link to="/register" className="text-primary hover:underline">Register</Link>
      </p>
    </div>
  )
}
EOF

cat > src/pages/Register.jsx << 'EOF'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUser } from '../store'
import api from '../services/api'

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
  })
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post('/auth/register', formData)
      dispatch(setUser(response.data))
      navigate('/dashboard')
    } catch (error) {
      alert('Registration failed: ' + error.message)
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="input-field"
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="input-field"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="input-field"
        />
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          className="input-field"
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          className="input-field"
        />
        <button type="submit" className="btn-primary w-full">Register</button>
      </form>
      <p className="mt-4 text-center">
        Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
      </p>
    </div>
  )
}
EOF

cat > src/pages/Premium.jsx << 'EOF'
export default function Premium() {
  return (
    <div className="py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Go Premium</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="card">
          <h3 className="text-2xl font-bold mb-4">Premium</h3>
          <p className="text-3xl font-bold text-primary mb-6">R$ 29.90/mês</p>
          <ul className="space-y-2 mb-6">
            <li>✓ Premium content</li>
            <li>✓ Trading signals</li>
            <li>✓ Private community</li>
            <li>✓ No ads</li>
          </ul>
          <button className="btn-primary w-full">Subscribe</button>
        </div>
        <div className="card border-2 border-primary">
          <h3 className="text-2xl font-bold mb-4">VIP Pro</h3>
          <p className="text-3xl font-bold text-primary mb-6">R$ 99.90/mês</p>
          <ul className="space-y-2 mb-6">
            <li>✓ Everything in Premium</li>
            <li>✓ API access</li>
            <li>✓ Custom reports</li>
            <li>✓ 24/7 support</li>
          </ul>
          <button className="btn-primary w-full">Subscribe</button>
        </div>
      </div>
    </div>
  )
}
EOF

# Create placeholder pages
for page in Pricing Checkout Dashboard Creators CreatorProfile Marketplace Settings; do
  cat > "src/pages/${page}.jsx" << EOF
export default function ${page}() {
  return <div className="py-12"><h1 className="text-3xl font-bold">${page}</h1><p className="text-gray-600 dark:text-gray-400 mt-4">Page coming soon...</p></div>
}
EOF
done

# Create API service
cat > src/services/api.js << 'EOF'
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3333',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
EOF

# Create PostCSS config
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

echo "✅ Frontend structure created!"
echo "📦 Run: cd oncreators-web && npm install && npm run dev"
