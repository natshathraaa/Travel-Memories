import { useState } from 'react'
import { Link } from 'react-router-dom'
import './JournalCard.css'

function JournalCard({ journal, onDelete, onView }) {
  const [imageError, setImageError] = useState(false)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const mainImage = journal.photos && journal.photos[0] ? journal.photos[0] : null

  const handleDelete = (e) => {
    e.preventDefault()
    if (window.confirm('Are you sure you want to delete this memory?')) {
      onDelete(journal._id)
    }
  }

  return (
    <article className="journal-card" onClick={() => onView(journal)}>
      <div className="journal-card-image">
        {mainImage && !imageError ? (
          <img
            src={mainImage}
            alt={journal.placeName}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="journal-card-placeholder">
            <span>Location</span>
          </div>
        )}
        {journal.photos && journal.photos.length > 1 && (
          <div className="photo-count">{journal.photos.length} photos</div>
        )}
      </div>

      <div className="journal-card-content">
        <div className="journal-card-header">
          <h3>{journal.placeName}</h3>
          {journal.isFavorite && <span className="favorite-badge">Favorite</span>}
        </div>

        <div className="journal-card-meta">
          <span className="date">Date: {formatDate(journal.date)}</span>
          <span className={`privacy-badge ${journal.isPublic ? 'public' : 'private'}`}>
            {journal.isPublic ? 'Public' : 'Private'}
          </span>
        </div>

        <p className="journal-card-story">{journal.story.substring(0, 120)}...</p>

        {journal.location && (
          <div className="journal-location">
            Location: {journal.location.city || journal.location.state || journal.location.country || 'Unknown'}
          </div>
        )}

        <div className="journal-card-actions">
          <button className="card-action-btn view-btn" onClick={() => onView(journal)}>
            View
          </button>
          <Link
            to={`/journals/${journal._id}/edit`}
            className="card-action-btn edit-btn"
            onClick={(e) => e.stopPropagation()}
          >
            Edit
          </Link>
          <button className="card-action-btn delete-btn" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}

export default JournalCard
