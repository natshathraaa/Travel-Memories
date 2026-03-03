import { Link } from 'react-router-dom'
import './Landing.css'

function Landing() {
  return (
    <section className="landing-hero" aria-label="Travel Memories">
      {/* World map background */}
      <div className="landing-map-bg"></div>

      {/* Light transparent overlay */}
      <div className="landing-overlay"></div>

      {/* Content container */}
      <div className="landing-content">
        <div className="landing-main">
          {/* Animated title */}
          <h1 className="landing-title">Travel Memories</h1>

          {/* Animated subtitle */}
          <p className="landing-subtitle">
            Capture the essence of your journeys. Every destination holds<br />
            a story worth preserving.
          </p>

          {/* Animated buttons */}
          <div className="landing-buttons">
            <Link to="/register" className="btn-primary landing-btn">
              Get Started
            </Link>
            <Link to="/login" className="btn-secondary landing-btn">
              Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Landing
