import { Navigate, useLocation } from 'react-router-dom'
import { getToken } from '../auth/storage'

type Props = { children: React.ReactNode }

export function ProtectedRoute({ children }: Props) {
  const location = useLocation()
  if (!getToken()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}
