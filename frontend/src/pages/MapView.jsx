import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import apiClient from '../api/client.js'
import './MapView.css'

const defaultCenter = [20, 0]
const defaultZoom = 2

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function MapView() {
  const [locations, setLocations] = useState([])
  const [missingLocations, setMissingLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const fetchMapData = async () => {
      try {
        const response = await apiClient.get('/journals/map')
        const data = Array.isArray(response.data) ? response.data : []

        const valid = []
        const missing = []

        data.forEach((entry) => {
          if (
            typeof entry.latitude === 'number' &&
            typeof entry.longitude === 'number'
          ) {
            valid.push(entry)
          } else {
            missing.push(entry)
          }
        })

        if (isMounted) {
          setLocations(valid)
          setMissingLocations(missing)
        }
      } catch (err) {
        if (isMounted) {
          const message = err?.response?.data?.message || 'Failed to load map data.'
          setError(message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchMapData()

    return () => {
      isMounted = false
    }
  }, [])

  const mapCenter = useMemo(() => {
    if (locations.length === 0) return defaultCenter

    const first = locations[0]
    return [first.latitude, first.longitude]
  }, [locations])

  return (
    <section className="map-container">
      <div className="map-header">
        <div>
          <h2>Travel Map</h2>
          <p>See where your travel memories were captured.</p>
        </div>
        <div className="map-stats">
          <span>{locations.length} pinned</span>
          <span>{missingLocations.length} missing coords</span>
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading map...</p>
        </div>
      ) : null}

      {!loading && locations.length === 0 ? (
        <div className="empty-map">
          <div className="empty-icon">🗺️</div>
          <h3>No mapped locations yet</h3>
          <p>
            Add latitude and longitude in your journal entries to see them on the map.
          </p>
        </div>
      ) : null}

      {!loading && locations.length > 0 ? (
        <div className="map-card">
          <MapContainer
            center={mapCenter}
            zoom={locations.length > 0 ? 4 : defaultZoom}
            scrollWheelZoom={false}
            className="leaflet-map"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map((location) => (
              <Marker
                key={location.journalId}
                position={[location.latitude, location.longitude]}
                icon={markerIcon}
              >
                <Popup>
                  <div className="map-popup">
                    <strong>{location.placeName}</strong>
                    <p>
                      Lat: {location.latitude.toFixed(4)}, Lng: {location.longitude.toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : null}

      {!loading && missingLocations.length > 0 ? (
        <div className="map-missing">
          <h3>Entries missing coordinates</h3>
          <p>Add latitude/longitude to show these on the map.</p>
          <div className="missing-list">
            {missingLocations.map((entry) => (
              <div key={entry.journalId} className="missing-item">
                <span>{entry.placeName}</span>
                <span className="missing-note">No coordinates</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default MapView
