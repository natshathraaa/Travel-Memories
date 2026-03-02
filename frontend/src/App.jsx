import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Gallery from './pages/Gallery.jsx'
import JournalForm from './pages/JournalForm.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import MapView from './pages/MapView.jsx'
import Profile from './pages/Profile.jsx'
import Register from './pages/Register.jsx'
import apiClient from './api/client.js'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [authStatus, setAuthStatus] = useState('checking')

  useEffect(() => {
    // Check if token exists and is valid
    const validateToken = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setAuthStatus('unauthenticated')
        return
      }

      try {
        // Verify token with backend
        const response = await apiClient.get('/auth/me')
        if (response.status === 200) {
          setAuthStatus('authenticated')
        } else {
          localStorage.removeItem('token')
          setAuthStatus('unauthenticated')
        }
      } catch (err) {
        // Token is invalid or expired
        console.error('Token verification failed:', err.message)
        localStorage.removeItem('token')
        setAuthStatus('unauthenticated')
      }
    }

    validateToken()
  }, [])

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('token')
      setAuthStatus('unauthenticated')
      navigate('/login', { replace: true })
    }
  }

  const isAuthenticated = authStatus === 'authenticated'
  const isPublicRoute = ['/', '/login', '/register'].includes(location.pathname)
  const isLandingPage = location.pathname === '/'
  const isDashboard = location.pathname === '/dashboard'
  const isGallery = location.pathname === '/gallery'
  const hideNav = isDashboard || isGallery

  return (
    <div className={`app ${isPublicRoute ? 'public-theme' : 'app-theme'} ${hideNav ? 'dashboard-layout' : ''}`}>
      {!isLandingPage && !hideNav && (
        <header className="app-header">
          <div className="brand">
            <p className="eyebrow">Travel Memories</p>
            <h1>{isAuthenticated ? 'Welcome back.' : 'Capture the journey.'}</h1>
          </div>
          <nav className="nav-links">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/gallery">Gallery</Link>
                <Link to="/map">Map</Link>
                <Link to="/profile">Profile</Link>
                <button type="button" className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </nav>
        </header>
      )}
      <main className={`app-main ${hideNav ? 'dashboard-main' : ''}`}>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />
            }
          />
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onAuthSuccess={() => setAuthStatus('authenticated')} />
              )
            }
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute authStatus={authStatus}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute authStatus={authStatus}>
                <MapView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gallery"
            element={
              <ProtectedRoute authStatus={authStatus}>
                <Gallery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute authStatus={authStatus}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journals/new"
            element={
              <ProtectedRoute authStatus={authStatus}>
                <JournalForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journals/:id/edit"
            element={
              <ProtectedRoute authStatus={authStatus}>
                <JournalForm />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
