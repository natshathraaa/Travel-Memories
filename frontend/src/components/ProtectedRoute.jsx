import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children, authStatus }) {
  if (authStatus === 'checking') {
    return <p>Authenticating...</p>
  }

  if (authStatus !== 'authenticated') {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
