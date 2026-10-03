import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Premium from './pages/Premium'
import Pricing from './pages/Pricing'
import Checkout from './pages/Checkout'
import Dashboard from './pages/Dashboard'
import Creators from './pages/Creators'
import CreatorProfile from './pages/CreatorProfile'
import Marketplace from './pages/Marketplace'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/checkout/:planId" element={<Checkout />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/creators" element={<Creators />} />
        <Route path="/creators/:id" element={<CreatorProfile />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
