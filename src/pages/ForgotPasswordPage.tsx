import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Mail, ArrowLeft, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { authApi } from '../services/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: (e: string) => authApi.forgotPassword(e),
    onSuccess: () => setSubmitted(true),
    onError: (err: { code?: string; response?: { status?: number } }) => {
      // The endpoint always returns 200 so we shouldn't normally land here.
      // Catch network-level issues so the user isn't left staring at nothing.
      setError(err?.code === 'ERR_NETWORK'
        ? 'Cannot reach the server. Please try again in a minute.'
        : 'Something went wrong. Please try again.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    mutation.mutate(email.trim())
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
          {submitted ? (
            // ── Success screen — points the user toward the reset page ────
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: 'rgba(106,151,57,0.10)', color: '#6A9739' }}>
                <CheckCircle2 className="w-7 h-7" strokeWidth={2} />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Check your messages</h1>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                If <strong className="text-gray-900">{email}</strong> is a registered account, we just
                sent a 6-digit reset code via SMS and email. The code is valid for
                <strong> 15 minutes</strong>.
              </p>
              <button
                onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
                className="w-full py-3 text-white font-semibold rounded-xl transition-colors"
                style={{ backgroundColor: '#FF5A5F' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e04a4f')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF5A5F')}
              >
                I have the code — continue →
              </button>
              <p className="text-[11px] text-gray-400 mt-4">
                Didn't get it?{' '}
                <button onClick={() => setSubmitted(false)} className="underline font-semibold" style={{ color: '#FF5A5F' }}>
                  Try a different email
                </button>
              </p>
            </div>
          ) : (
            // ── Email entry screen ─────────────────────────────────────────
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot password?</h1>
              <p className="text-gray-500 text-sm mb-6">
                Enter the email you signed up with. We'll send you a 6-digit code to reset it.
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-field pl-10"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={mutation.isPending || !email.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#FF5A5F' }}
                  onMouseEnter={(e) => { if (!mutation.isPending && email.trim()) e.currentTarget.style.backgroundColor = '#e04a4f' }}
                  onMouseLeave={(e) => { if (!mutation.isPending && email.trim()) e.currentTarget.style.backgroundColor = '#FF5A5F' }}
                >
                  {mutation.isPending
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending code…</>
                    : 'Send reset code'}
                </button>
              </form>

              <p className="text-center text-xs text-gray-500 mt-6">
                Remembered it?{' '}
                <Link to="/login" className="font-semibold hover:underline" style={{ color: '#FF5A5F' }}>
                  Sign in instead →
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
