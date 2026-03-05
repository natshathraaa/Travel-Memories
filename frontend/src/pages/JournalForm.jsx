import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import apiClient from '../api/client.js'
import './JournalForm.css'

function JournalForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [formData, setFormData] = useState({
    placeName: '',
    date: '',
    story: '',
    photos: [],
    location: {
      city: '',
      state: '',
      country: '',
      latitude: '',
      longitude: '',
    },
    tags: '',
    isPublic: false,
    isFavorite: false,
  })

  const [photoPreview, setPhotoPreview] = useState([])
  const [newPhotoFiles, setNewPhotoFiles] = useState([])
  const [loading, setLoading] = useState(isEditMode)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [geoResults, setGeoResults] = useState([])
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState('')

  const markerIcon = useMemo(
    () =>
      new L.Icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    []
  )

  // Fetch journal data if in edit mode
  useEffect(() => {
    if (!isEditMode) return

    const fetchJournal = async () => {
      try {
        const response = await apiClient.get(`/journals/${id}`)
        const journal = response.data

        const dateOnly = new Date(journal.date).toISOString().split('T')[0]

        setFormData({
          placeName: journal.placeName || '',
          date: dateOnly,
          story: journal.story || '',
          photos: journal.photos || [],
          location: journal.location || {
            city: '',
            state: '',
            country: '',
            latitude: '',
            longitude: '',
          },
          tags: (journal.tags && journal.tags.join(', ')) || '',
          isPublic: journal.isPublic || false,
          isFavorite: journal.isFavorite || false,
        })
        setPhotoPreview(journal.photos || [])
        setNewPhotoFiles([])
        setError('')
      } catch (err) {
        const message = err?.response?.data?.message || 'Failed to load journal.'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchJournal()
  }, [id, isEditMode])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name.startsWith('location.')) {
      const field = name.split('.')[1]
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }))
    }
  }

  const buildSearchQuery = () => {
    // If placeName is filled, use ONLY that (it's specific and complete)
    if (formData.placeName && formData.placeName.trim()) {
      return formData.placeName.trim()
    }

    // Otherwise, combine city, state, country
    const parts = [
      formData.location.city,
      formData.location.state,
      formData.location.country,
    ]
      .map((part) => (typeof part === 'string' ? part.trim() : ''))
      .filter(Boolean)

    const query = parts.join(', ')
    console.log('Building search query from location fields:', { 
      city: formData.location.city, 
      state: formData.location.state, 
      country: formData.location.country 
    })
    console.log('Final query:', query)
    return query
  }

  const handleGeoSearch = async () => {
    console.log('=== Find on map clicked ===')
    console.log('Current formData:', formData)
    
    const query = buildSearchQuery()
    console.log('Query to search:', query)

    if (!query) {
      console.log('Query is empty, showing error')
      setGeoError('Enter a place name or location to search.')
      setGeoResults([])
      return
    }

    console.log('Starting geocode search...')
    setGeoLoading(true)
    setGeoError('')
    setGeoResults([])

    try {
      const url = `/geocode?query=${encodeURIComponent(query)}`
      console.log('Calling API:', url)
      
      // Call our backend geocoding API instead of Nominatim directly
      const response = await apiClient.get(url)
      
      console.log('API response:', response.data)
      
      const results = response.data.results || []
      console.log('Number of results:', results.length)
      
      if (results.length === 0) {
        setGeoError('No results found. Try a more specific location.')
        return
      }

      setGeoResults(results)
      console.log('Results set successfully')
    } catch (err) {
      console.error('Geocoding error:', err)
      console.error('Error response:', err?.response?.data)
      const message = err?.response?.data?.message || 'Failed to search location. Please try again.'
      setGeoError(message)
    } finally {
      setGeoLoading(false)
      console.log('=== Geocode search complete ===')
    }
  }

  const applyGeoResult = (result) => {
    const latitude = result.lat ? Number(result.lat) : ''
    const longitude = result.lon ? Number(result.lon) : ''
    const address = result.address || {}

    setFormData((prev) => ({
      ...prev,
      placeName: prev.placeName || result.display_name,
      location: {
        ...prev.location,
        city: address.city || address.town || address.village || prev.location.city,
        state: address.state || prev.location.state,
        country: address.country || prev.location.country,
        latitude,
        longitude,
      },
    }))

    setGeoResults([])
  }

  const updateCoords = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        latitude: lat,
        longitude: lng,
      },
    }))
  }

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files)

    if (files.length === 0) {
      return
    }

    setNewPhotoFiles((prev) => [...prev, ...files])

    const previewUrls = files.map((file) => URL.createObjectURL(file))
    setPhotoPreview((prev) => [...prev, ...previewUrls])
  }

  const removePhoto = (index) => {
    setPhotoPreview((prev) => {
      const photoToRemove = prev[index]
      const next = prev.filter((_, i) => i !== index)
      if (photoToRemove && photoToRemove.startsWith('blob:')) {
        URL.revokeObjectURL(photoToRemove)
      }
      return next
    })

    setFormData((prev) => {
      const existingPhotos = Array.isArray(prev.photos) ? prev.photos : []

      if (index < existingPhotos.length) {
        return {
          ...prev,
          photos: existingPhotos.filter((_, i) => i !== index),
        }
      }

      return prev
    })

    setNewPhotoFiles((prev) => {
      const existingCount = Array.isArray(formData.photos) ? formData.photos.length : 0
      if (index < existingCount) {
        return prev
      }

      const newFileIndex = index - existingCount
      return prev.filter((_, i) => i !== newFileIndex)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Basic validation
    if (!formData.placeName.trim()) {
      setError('Place name is required.')
      return
    }
    if (!formData.date) {
      setError('Travel date is required.')
      return
    }
    if (!formData.story.trim()) {
      setError('Story is required.')
      return
    }

    setSubmitting(true)

    try {
      const latitudeValue = formData.location.latitude
      const longitudeValue = formData.location.longitude
      const normalizedLocation = {
        ...formData.location,
        latitude:
          latitudeValue === '' || latitudeValue === undefined
            ? undefined
            : Number(latitudeValue),
        longitude:
          longitudeValue === '' || longitudeValue === undefined
            ? undefined
            : Number(longitudeValue),
      }

      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag)

      const payload = new FormData()
      payload.append('placeName', formData.placeName)
      payload.append('date', new Date(formData.date).toISOString())
      payload.append('story', formData.story)
      payload.append('location', JSON.stringify(normalizedLocation))
      payload.append('tags', JSON.stringify(tags))
      payload.append('isPublic', String(formData.isPublic))
      payload.append('isFavorite', String(formData.isFavorite))
      payload.append('photos', JSON.stringify(Array.isArray(formData.photos) ? formData.photos : []))

      newPhotoFiles.forEach((file) => {
        payload.append('photosFiles', file)
      })

      if (isEditMode) {
        await apiClient.put(`/journals/${id}`, payload)
        setSuccess('Journal updated successfully. Redirecting...')
      } else {
        await apiClient.post('/journals', payload)
        setSuccess('Journal created successfully. Redirecting...')
      }

      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 500)
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to save journal.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <section className="journal-form-container">
        <p>Loading journal...</p>
      </section>
    )
  }

  const latitudeNumber = Number(formData.location.latitude)
  const longitudeNumber = Number(formData.location.longitude)
  const hasCoords = Number.isFinite(latitudeNumber) && Number.isFinite(longitudeNumber)

  const mapCenter = hasCoords ? [latitudeNumber, longitudeNumber] : [20, 0]

  const MapClickHandler = () => {
    useMapEvents({
      click(event) {
        updateCoords(event.latlng.lat, event.latlng.lng)
      },
    })
    return null
  }

  return (
    <section className="journal-form-container">
      <div className="form-header">
        <h2>{isEditMode ? 'Edit Travel Memory' : 'Create Travel Memory'}</h2>
        <p>
          {isEditMode ? 'Update your travel memory.' : 'Document your travel memory.'}
        </p>
      </div>

      <form className="journal-form" onSubmit={handleSubmit}>
        <div className="form-two-column">
          <label className="field">
            <span>Place Name *</span>
            <input
              className="input"
              type="text"
              name="placeName"
              value={formData.placeName}
              onChange={handleChange}
              placeholder="e.g., Paris, France"
              required
            />
          </label>

          <label className="field">
            <span>Travel Date *</span>
            <input
              className="input"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="form-section">
          <h3>Location Details</h3>
          <div className="location-search">
            <button
              type="button"
              className="secondary-button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleGeoSearch()
              }}
              disabled={geoLoading}
            >
              {geoLoading ? 'Searching...' : 'Find on map'}
            </button>
            <span className="location-hint">
              Type a place name or location, then click “Find on map”.
            </span>
          </div>

          {geoError ? <p className="form-error">{geoError}</p> : null}
          {geoResults.length > 0 ? (
            <div className="location-results">
              {geoResults.map((result) => (
                <button
                  key={result.place_id}
                  type="button"
                  className="location-result"
                  onClick={() => applyGeoResult(result)}
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          ) : null}

          <div className="form-three-column">
            <label className="field">
              <span>City</span>
              <input
                className="input"
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                placeholder="e.g., Paris"
              />
            </label>

            <label className="field">
              <span>State/Province</span>
              <input
                className="input"
                type="text"
                name="location.state"
                value={formData.location.state}
                onChange={handleChange}
                placeholder="e.g., Île-de-France"
              />
            </label>

            <label className="field">
              <span>Country</span>
              <input
                className="input"
                type="text"
                name="location.country"
                value={formData.location.country}
                onChange={handleChange}
                placeholder="e.g., France"
              />
            </label>
          </div>
          <div className="form-two-column">
            <label className="field">
              <span>Latitude</span>
              <input
                className="input"
                type="number"
                name="location.latitude"
                value={formData.location.latitude || ''}
                onChange={handleChange}
                placeholder="e.g., 48.8566"
                step="any"
              />
            </label>

            <label className="field">
              <span>Longitude</span>
              <input
                className="input"
                type="number"
                name="location.longitude"
                value={formData.location.longitude || ''}
                onChange={handleChange}
                placeholder="e.g., 2.3522"
                step="any"
              />
            </label>
          </div>

          <div className="map-preview">
            <MapContainer
              center={mapCenter}
              zoom={hasCoords ? 10 : 2}
              scrollWheelZoom={false}
              className="mini-map"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler />
              {hasCoords && (
                <Marker
                  position={[latitudeNumber, longitudeNumber]}
                  icon={markerIcon}
                  draggable
                  eventHandlers={{
                    dragend: (event) => {
                      const position = event.target.getLatLng()
                      updateCoords(position.lat, position.lng)
                    },
                  }}
                >
                  <Popup>
                    Drag the pin to adjust location.
                  </Popup>
                </Marker>
              )}
            </MapContainer>
            <p className="map-help">
              Click the map to drop a pin, or drag the pin to adjust coordinates.
            </p>
          </div>
        </div>

        <label className="field">
          <span>Story *</span>
          <textarea
            className="input textarea"
            name="story"
            value={formData.story}
            onChange={handleChange}
            placeholder="Share your travel story..."
            rows="6"
            required
          />
        </label>

        <div className="form-section">
          <h3>Photos</h3>
          <label className="file-input-label">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="file-input-hidden"
            />
            <span className="file-input-button">📸 Add Photos</span>
          </label>
          <p className="form-help">
            You can upload multiple photos. Click to add or drag & drop images.
          </p>

          {photoPreview.length > 0 && (
            <div className="photo-preview-container">
              <h4>Photos ({photoPreview.length})</h4>
              <div className="photo-preview-grid">
                {photoPreview.map((photo, index) => (
                  <div key={index} className="photo-preview-item">
                    <img src={photo} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="photo-remove-btn"
                      onClick={() => removePhoto(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <label className="field">
          <span>Tags (comma-separated)</span>
          <input
            className="input"
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., adventure, beach, mountains"
          />
        </label>

        <div className="form-checkboxes">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
            />
            <span>Make this public</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isFavorite"
              checked={formData.isFavorite}
              onChange={handleChange}
            />
            <span>Mark as favorite</span>
          </label>
        </div>

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting
            ? 'Saving...'
            : isEditMode
              ? 'Update Journal'
              : 'Create Journal'}
        </button>

        {success ? <p className="form-success">{success}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
      </form>
    </section>
  )
}

export default JournalForm
