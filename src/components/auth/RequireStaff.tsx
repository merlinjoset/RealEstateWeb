import { Navigate, useLocation } from 'react-router-dom'
import { Loader2, ShieldAlert } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

/**
 * Allow Admins AND Employees through. Used for routes both roles need
 * access to — currently /admin/my-work, where an Employee can see the
 * inquiries and properties an Admin has assigned them.
 *
 * For Admin-only routes, keep using RequireAdmin.
 */
export default function RequireStaff({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F6F3' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#6A9739' }} />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (user.role !== 'Admin' && user.role !== 'Employee') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#F8F6F3' }}>
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-5"
            style={{ backgroundColor: 'rgba(255,90,95,0.10)', color: '#FF5A5F' }}>
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2 tracking-tight" style={{ color: '#111111' }}>
            Staff access required
          </h1>
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#4B5563' }}>
            You're signed in as <strong>{user.firstName} {user.lastName}</strong> ({user.role}). This page is
            limited to Admin and Employee accounts.
          </p>
          <a href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: '#FF5A5F' }}>
            Back to home
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
