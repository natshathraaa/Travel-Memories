import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../api/client.js'
import JournalCard from '../components/JournalCard.jsx'
import JournalViewer from '../components/JournalViewer.jsx'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const [journals, setJournals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [selectedJournal, setSelectedJournal] = useState(null)
  const [filterText, setFilterText] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    const fetchJournals = async () => {
      try {
        const response = await apiClient.get('/journals')
        if (isMounted) {
          setJournals(Array.isArray(response.data) ? response.data : [])
        }
      } catch (err) {
        if (isMounted) {
          const message = err?.response?.data?.message || 'Failed to load journals.'
          setError(message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchJournals()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && 
          !event.target.classList.contains('hamburger-icon')) {
        setSidebarOpen(false)
      }
    }

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [sidebarOpen])

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('token')
      navigate('/login', { replace: true })
    }
  }

  const handleDelete = async (journalId) => {
    try {
      await apiClient.delete(`/journals/${journalId}`)
      setJournals((prev) => prev.filter((j) => j._id !== journalId))
      setDeleteError('')
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to delete journal.'
      setDeleteError(message)
    }
  }

  const filteredJournals = journals.filter(
    (journal) =>
      journal.placeName.toLowerCase().includes(filterText.toLowerCase()) ||
      journal.story.toLowerCase().includes(filterText.toLowerCase())
  )

  return (
    <section className="dashboard-container">
      {/* Hamburger Menu Icon */}
      <button 
        className="hamburger-icon" 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside ref={sidebarRef} className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2>Travel Memories</h2>
          <button 
            className="sidebar-close" 
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="sidebar-link active" onClick={() => setSidebarOpen(false)}>
            <span>Dashboard</span>
          </Link>
          <Link to="/gallery" className="sidebar-link" onClick={() => setSidebarOpen(false)}>
            <span>Gallery</span>
          </Link>
          <Link to="/map" className="sidebar-link" onClick={() => setSidebarOpen(false)}>
            <span>Map</span>
          </Link>
          <Link to="/profile" className="sidebar-link" onClick={() => setSidebarOpen(false)}>
            <span>Profile</span>
          </Link>
          <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Welcome back</h1>
          <p className="hero-subtitle">Continue your journey through memories</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content-wrapper">
        <div className="dashboard-header">
          <h2>My Travel Memories</h2>
        </div>

        {/* Search Bar */}
        <div className="dashboard-search">
          <input
            type="text"
            placeholder="Search memories, places, or stories..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="search-input"
          />
        </div>

        {error ? <p className="form-error">{error}</p> : null}
        {deleteError ? <p className="form-error">{deleteError}</p> : null}

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your memories...</p>
          </div>
        ) : null}

        {!loading && journals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✈️</div>
            <h3>No travel memories yet</h3>
            <p>Start documenting your travels! Create your first journal entry.</p>
          </div>
        ) : null}

        {!loading && journals.length > 0 && filteredJournals.length === 0 ? (
          <div className="no-results">
            <p>No memories match "{filterText}"</p>
          </div>
        ) : null}

        {!loading && filteredJournals.length > 0 ? (
          <div className="journals-grid">
            {filteredJournals.map((journal) => (
              <JournalCard
                key={journal._id}
                journal={journal}
                onDelete={handleDelete}
                onView={setSelectedJournal}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Floating Create Memory Button */}
      <Link to="/journals/new" className="floating-create-btn" aria-label="Create new memory">
        + Create Memory
      </Link>

      {selectedJournal && (
        <JournalViewer journal={selectedJournal} onClose={() => setSelectedJournal(null)} />
      )}
    </section>
  )
}

export default Dashboard
