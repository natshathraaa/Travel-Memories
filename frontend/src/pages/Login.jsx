import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../api/client'

function Login({ onAuthSuccess }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value)

  const validateForm = () => {
    const nextErrors = {}

    if (!isValidEmail(email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!password) {
      nextErrors.password = 'Password is required.'
    }

    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    console.log('Login submit')
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      })
      const { token } = response.data
      localStorage.setItem('token', token)
      if (onAuthSuccess) {
        onAuthSuccess()
      }
      setSuccess('Login successful. Redirecting...')
      setPassword('')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const backendMessage = err?.response?.data?.message
      const message =
        err?.response?.status === 400 && backendMessage
          ? backendMessage
          : 'Login failed. Try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-card">
      <div>
        <p className="auth-eyebrow">Welcome back</p>
        <h2 className="auth-title">Login</h2>
        <p className="auth-summary">Sign in to continue journaling your adventures.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
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
            placeholder="••••••••"
            required
          />
          {fieldErrors.password ? (
            <p className="form-error">{fieldErrors.password}</p>
          ) : null}
        </label>
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        {success ? <p className="form-success">{success}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
      </form>
      <p className="form-footer">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </section>
  )
}

export default Login
