import { useEffect, useState } from 'react'
import './Profile.css'
import apiClient from '../api/client'

function Profile() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({ total: 0, public: 0, favorite: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get journals to calculate stats
        const response = await apiClient.get('/journals')
        const journals = response.data

        const publicCount = journals.filter((j) => j.isPublic).length
        const favoriteCount = journals.filter((j) => j.isFavorite).length

        setStats({
          total: journals.length,
          public: publicCount,
          favorite: favoriteCount,
        })

        // Get user info from localStorage or API
        const token = localStorage.getItem('token')
        if (token) {
          // Decode token to get user info (basic JWT parsing)
          try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            // For now, we'll display basic info
            setUser({
              id: payload.id,
              email: 'user@example.com',
              name: 'Travel Adventurer',
              joinDate: new Date().toLocaleDateString(),
            })
          } catch {
            setUser({ email: 'User', name: 'Travel Explorer' })
          }
        }
      } catch (err) {
        setError('Failed to load profile data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>
  }

  return (
    <section className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">👤</div>
        <div className="profile-info">
          <h2>Profile</h2>
          <p className="profile-subtitle">Manage your Travel Memories account</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="profile-content">
        {/* User Info Card */}
        <div className="profile-card">
          <h3>Account Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Email</label>
              <p>user@example.com</p>
            </div>
            <div className="info-item">
              <label>Member Since</label>
              <p>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="profile-card stats-card">
          <h3>Your Travel Memories</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Memories</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.public}</div>
              <div className="stat-label">Public Shares</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.favorite}</div>
              <div className="stat-label">Favorites</div>
            </div>
          </div>
        </div>

        {/* Preferences Card */}
        <div className="profile-card">
          <h3>Preferences</h3>
          <div className="preferences-list">
            <div className="preference-item">
              <div>
                <p className="pref-name">Dark Mode</p>
                <p className="pref-desc">Coming soon</p>
              </div>
              <input type="checkbox" disabled />
            </div>
            <div className="preference-item">
              <div>
                <p className="pref-name">Email Notifications</p>
                <p className="pref-desc">Coming soon</p>
              </div>
              <input type="checkbox" disabled />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Profile
