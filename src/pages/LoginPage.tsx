import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, LogIn, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  // After login, send admins to /admin and everyone else to where they came from (or /)
  const from = (location.state as { from?: string } | null)?.from ?? null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login({ email: form.email.trim(), password: form.password })

      // Read the freshly stored user to decide where to redirect
      const stored = localStorage.getItem('user')
      const role = stored ? (JSON.parse(stored)?.role as string) : null

      if (from) {
        navigate(from, { replace: true })
      } else if (role === 'Admin') {
        navigate('/admin', { replace: true })
      } else if (role === 'Employee') {
        // Employees land directly on their assigned work queue.
        navigate('/admin/my-work', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 401) {
        setError('Invalid email or password.')
      } else if (status === 0 || err?.code === 'ERR_NETWORK') {
        setError('Cannot reach the server. Make sure the API is running.')
      } else {
        setError(err?.response?.data?.message ?? 'Sign-in failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <img src="/logo.png" alt="Jose For Land" className="h-20 w-20 object-contain rounded-full shadow-md" />
            <div className="text-xs font-medium tracking-wide" style={{ color: '#6A9739' }}>Live where you want</div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="input-field"
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-xs hover:underline" style={{ color: '#6A9739' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  required
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  className="input-field pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base mt-2 disabled:opacity-60"
            >
              {loading
                ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</span>
                : <span className="flex items-center gap-2"><LogIn className="w-4 h-4" /> Sign in</span>
              }
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold hover:underline" style={{ color: '#FF5A5F' }}>
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
