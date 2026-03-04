import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../api/client'

function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value)

  const validateForm = () => {
    const nextErrors = {}

    if (!name.trim()) {
      nextErrors.name = 'Name is required.'
    }

    if (!isValidEmail(email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.'
    }

    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    console.log('Register submit')
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      await apiClient.post('/auth/register', {
        name,
        email,
        password,
      })
      setSuccess('Account created. You can sign in with these details now.')
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err) {
      const backendMessage = err?.response?.data?.message
      const message =
        err?.response?.status === 400 && backendMessage
          ? backendMessage
          : 'Registration failed.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-card">
      <div>
        <p className="auth-eyebrow">Start your story</p>
        <h2 className="auth-title">Register</h2>
        <p className="auth-summary">Create your profile with username, email, and password.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Username</span>
          <input
            className="input"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Choose a username"
            required
          />
          {fieldErrors.name ? (
            <p className="form-error">{fieldErrors.name}</p>
          ) : null}
        </label>
        <label className="field">
          <span>Email</span>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
          {fieldErrors.email ? (
            <p className="form-error">{fieldErrors.email}</p>
          ) : null}
        </label>
        <label className="field">
          <span>Password</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a password"
            required
          />
          {fieldErrors.password ? (
            <p className="form-error">{fieldErrors.password}</p>
          ) : null}
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        {success ? <p className="form-success">{success}</p> : null}
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="form-footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </section>
  )
}

export default Register
