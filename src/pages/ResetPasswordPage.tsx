import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, Loader2, CheckCircle2, KeyRound } from 'lucide-react'
import { authApi } from '../services/api'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const [form, setForm] = useState({
    email: params.get('email') ?? '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: () => authApi.resetPassword(form.email.trim(), form.otp.trim(), form.newPassword),
    onSuccess: () => setDone(true),
    onError: (err: { response?: { data?: { message?: string }; status?: number } }) => {
      setError(err?.response?.data?.message ?? 'Could not reset password. Please try again.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!/^\d{6}$/.test(form.otp.trim())) {
      setError('Reset code must be exactly 6 digits.')
      return
    }
    mutation.mutate()
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#F8F6F3' }}>
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="text-2xl font-extrabold tracking-tight" style={{ color: '#FF5A5F' }}>
            Jose For Land
          </Link>
          <Link to="/login" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#FF5A5F] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {done ? (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: 'rgba(106,151,57,0.10)', color: '#6A9739' }}>
                <CheckCircle2 className="w-7 h-7" strokeWidth={2} />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Password reset!</h1>
              <p className="text-sm text-gray-500 mb-6">
                You can now sign in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 text-white font-semibold rounded-xl transition-colors"
                style={{ backgroundColor: '#FF5A5F' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e04a4f')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF5A5F')}
              >
                Sign in →
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset password</h1>
              <p className="text-gray-500 text-sm mb-6">
                Enter the 6-digit code we sent you and choose a new password.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className="input-field pl-10"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">6-digit reset code</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      inputMode="numeric"
                      pattern="\d{6}"
                      maxLength={6}
                      value={form.otp}
                      onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, '') })}
                      placeholder="123456"
                      className="input-field pl-10 tracking-[0.5em] font-mono text-center"
                      autoComplete="one-time-code"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Check your SMS and email. Valid for 15 minutes from when it was sent.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      type={showPw ? 'text' : 'password'}
                      value={form.newPassword}
                      onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                      placeholder="At least 8 characters"
                      className="input-field pl-10 pr-11"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm new password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      type={showPw ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="Re-enter your new password"
                      className="input-field pl-10"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#FF5A5F' }}
                  onMouseEnter={(e) => { if (!mutation.isPending) e.currentTarget.style.backgroundColor = '#e04a4f' }}
                  onMouseLeave={(e) => { if (!mutation.isPending) e.currentTarget.style.backgroundColor = '#FF5A5F' }}
                >
                  {mutation.isPending
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting…</>
                    : 'Reset password'}
                </button>
              </form>

              <p className="text-center text-xs text-gray-500 mt-6">
                Didn't get a code?{' '}
                <Link to="/forgot-password" className="font-semibold hover:underline" style={{ color: '#FF5A5F' }}>
                  Request a new one →
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
