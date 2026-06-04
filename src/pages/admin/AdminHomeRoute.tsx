import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DashboardPage from './DashboardPage'

/**
 * The index route at `/admin`. Picks the right landing page for the
 * signed-in role:
 *   - Admin    → DashboardPage
 *   - Employee → redirect to /admin/my-work
 *
 * The parent route is already gated by RequireStaff, so an unauthenticated
 * or non-staff visitor never reaches this component.
 */
export default function AdminHomeRoute() {
  const { user } = useAuth()

  if (user?.role === 'Employee') {
    return <Navigate to="/admin/my-work" replace />
  }
  return <DashboardPage />
}
