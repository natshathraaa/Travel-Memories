import { useEffect, useState, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../api/client.js'
import './Gallery.css'

const ROTATIONS = [-7, 3, -4, 6, -2, 5, -6, 4, -3, 7, -5, 2, -8, 1, 8, -1]

function Gallery() {
  const navigate = useNavigate()
  const [journals, setJournals] = useState([])
  const [allPhotos, setAllPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lightbox, setLightbox] = useState(null)
  const [filter, setFilter] = useState('all')
  const [zoomed, setZoomed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarRef = useRef(null)

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const response = await apiClient.get('/journals')
        const journalsData = Array.isArray(response.data) ? response.data : []
        setJournals(journalsData)

        const photos = []
        journalsData.forEach((journal) => {
          if (journal.photos && journal.photos.length > 0) {
            journal.photos.forEach((photoUrl, index) => {
              photos.push({
                url: photoUrl,
                journalId: journal._id,
                placeName: journal.placeName,
                date: journal.date,
                location: journal.location,
                photoIndex: index,
                totalPhotos: journal.photos.length,
              })
            })
          }
        })
        setAllPhotos(photos)
      } catch (err) {
        const message = err?.response?.data?.message || 'Failed to load gallery.'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchJournals()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) &&
          !event.target.classList.contains('hamburger-icon')) {
        setSidebarOpen(false)
      }
    }
    if (sidebarOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [sidebarOpen])

  const filteredPhotos =
    filter === 'all'
      ? allPhotos
      : allPhotos.filter((photo) => photo.journalId === filter)

  const openLightbox = (index) => {
    setLightbox(index)
    setZoomed(false)
  }

  const closeLightbox = () => {
    setLightbox(null)
    setZoomed(false)
  }

  const goNext = useCallback(() => {
    if (lightbox === null) return
    setLightbox((prev) => (prev + 1) % filteredPhotos.length)
    setZoomed(false)
  }, [lightbox, filteredPhotos.length])

  const goPrev = useCallback(() => {
    if (lightbox === null) return
    setLightbox((prev) => (prev - 1 + filteredPhotos.length) % filteredPhotos.length)
    setZoomed(false)
  }, [lightbox, filteredPhotos.length])

  useEffect(() => {
    if (lightbox === null) return
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightbox, goNext, goPrev])

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const currentPhoto = lightbox !== null ? filteredPhotos[lightbox] : null

  return (
    <section className="gallery-page">
      {/* Hamburger */}
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
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu">×</button>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="sidebar-link" onClick={() => setSidebarOpen(false)}>Dashboard</Link>
          <Link to="/gallery" className="sidebar-link active" onClick={() => setSidebarOpen(false)}>Gallery</Link>
          <Link to="/map" className="sidebar-link" onClick={() => setSidebarOpen(false)}>Map</Link>
          <Link to="/profile" className="sidebar-link" onClick={() => setSidebarOpen(false)}>Profile</Link>
          <button className="sidebar-link sidebar-logout" onClick={handleLogout}>Logout</button>
        </nav>
      </aside>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Header */}
      <div className="gallery-hero">
        <h1>My Scrapbook</h1>
        <p className="gallery-subtitle">
          {allPhotos.length} photo{allPhotos.length !== 1 ? 's' : ''} from {journals.length}{' '}
          memory{journals.length !== 1 ? 'ies' : ''}
        </p>

        {journals.length > 0 && (
          <div className="gallery-filter">
            <select
              id="journal-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Places</option>
              {journals.map((journal) => (
                <option key={journal._id} value={journal._id}>
                  {journal.placeName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading && (
        <div className="gallery-loading">
          <div className="spinner"></div>
          <p>Loading your photos...</p>
        </div>
      )}

      {error && <p className="gallery-error">{error}</p>}

      {!loading && allPhotos.length === 0 && (
        <div className="gallery-empty">
          <h3>No photos yet</h3>
          <p>Start adding photos to your travel memories to see them here!</p>
        </div>
      )}

      {!loading && filteredPhotos.length > 0 && (
        <div className="scrapbook-collage">
          {filteredPhotos.map((photo, index) => (
            <div
              key={`${photo.journalId}-${photo.photoIndex}`}
              className="polaroid-card"
              style={{ '--rotation': `${ROTATIONS[index % ROTATIONS.length]}deg` }}
              onClick={() => openLightbox(index)}
            >
              <div className="polaroid-image">
                <img src={photo.url} alt={photo.placeName} loading="lazy" />
                {photo.totalPhotos > 1 && photo.photoIndex === 0 && (
                  <span className="photo-count-badge">{photo.totalPhotos} photos</span>
                )}
              </div>
              <div className="polaroid-caption">
                <span className="polaroid-place">{photo.placeName}</span>
                <span className="polaroid-date">{formatDate(photo.date)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {currentPhoto && (
        <div className="lightbox-backdrop" onClick={closeLightbox}>
          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>✕</button>

            <button className="lightbox-nav lightbox-prev" onClick={goPrev} aria-label="Previous photo">‹</button>

            <div className={`lightbox-image-wrap ${zoomed ? 'zoomed' : ''}`} onClick={() => setZoomed(!zoomed)}>
              <img src={currentPhoto.url} alt={currentPhoto.placeName} draggable={false} />
            </div>

            <button className="lightbox-nav lightbox-next" onClick={goNext} aria-label="Next photo">›</button>

            <div className="lightbox-info">
              <h3>{currentPhoto.placeName}</h3>
              <p>{formatDate(currentPhoto.date)}</p>
              {currentPhoto.location && (
                <p className="lightbox-location">
                  {[currentPhoto.location.city, currentPhoto.location.state, currentPhoto.location.country]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
              <span className="lightbox-counter">{lightbox + 1} / {filteredPhotos.length}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Gallery
