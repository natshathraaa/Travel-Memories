import { useState } from 'react'
import './JournalViewer.css'

function JournalViewer({ journal, onClose }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const photos = journal.photos && Array.isArray(journal.photos) ? journal.photos : []
  const currentPhoto = photos[currentPhotoIndex]

  const nextPhoto = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1)
    }
  }

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1)
    }
  }

  return (
    <div className="journal-viewer-overlay" onClick={onClose}>
      <div className="journal-viewer-modal" onClick={(e) => e.stopPropagation()}>
        <button className="viewer-close-btn" onClick={onClose}>
          ✕
        </button>

        {photos.length > 0 && (
          <div className="viewer-photo-section">
            <div className="viewer-photo-container">
              <img src={currentPhoto} alt={journal.placeName} />
            </div>

            {photos.length > 1 && (
              <div className="viewer-photo-nav">
                <button onClick={prevPhoto} disabled={currentPhotoIndex === 0}>
                  ←
                </button>
                <span className="photo-counter">
                  {currentPhotoIndex + 1} / {photos.length}
                </span>
                <button onClick={nextPhoto} disabled={currentPhotoIndex === photos.length - 1}>
                  →
                </button>
              </div>
            )}

            {photos.length > 1 && (
              <div className="viewer-thumbnails">
                {photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Thumbnail ${index + 1}`}
                    className={`thumbnail ${index === currentPhotoIndex ? 'active' : ''}`}
                    onClick={() => setCurrentPhotoIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="viewer-content-section">
          <div className="viewer-header">
            <div>
              <h2>{journal.placeName}</h2>
              <p className="viewer-date">📅 {formatDate(journal.date)}</p>
            </div>
            <div className="viewer-badges">
              {journal.isFavorite && <span className="badge favorite">⭐ Favorite</span>}
              <span className={`badge ${journal.isPublic ? 'public' : 'private'}`}>
                {journal.isPublic ? '🌐 Public' : '🔒 Private'}
              </span>
            </div>
          </div>

          {journal.location && (
            <div className="viewer-location">
              <p>
                <strong>📍 Location:</strong>{' '}
                {[journal.location.city, journal.location.state, journal.location.country]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </div>
          )}

          {journal.tags && journal.tags.length > 0 && (
            <div className="viewer-tags">
              {journal.tags.map((tag, index) => (
                <span key={index} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="viewer-story">
            <h3>Story</h3>
            <p>{journal.story}</p>
          </div>

          <div className="viewer-footer">
            <small>Created: {formatDate(journal.createdAt)}</small>
            {journal.updatedAt !== journal.createdAt && (
              <small>Last updated: {formatDate(journal.updatedAt)}</small>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default JournalViewer
