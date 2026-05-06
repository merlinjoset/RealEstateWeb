import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff, UserPlus, Loader2, AlertCircle, Briefcase, User as UserIcon } from 'lucide-react'
import { authApi } from '../services/api'
import type { RegisterData } from '../types'

const ROLE_OPTIONS = [
  {
    value: 'Seller' as const,
    label: 'Seller',
    desc: 'I have land or property to sell',
    icon: UserIcon,
    color: '#FF5A5F',
  },
  {
    value: 'Agent' as const,
    label: 'Agent',
    desc: 'I help others buy and sell properties',
    icon: Briefcase,
    color: '#6A9739',
  },
] as const

interface FormState {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  role: 'Agent' | 'Seller'
}

const INITIAL: FormState = {
  firstName: '', lastName: '', email: '', phone: '',
  password: '', confirmPassword: '', role: 'Seller',
}

/**
 * Returns true if the phone number is reachable by our Indian SMS provider.
 * Anything other than +91 / 91-prefixed / bare 10-digit Indian mobile
 * requires an email fallback.
 */
function isIndianMobile(phone: string): boolean {
  const trimmed = phone.trim()
  if (!trimmed) return false
  if (trimmed.startsWith('+')) return trimmed.startsWith('+91')
  const digits = trimmed.replace(/\D/g, '')
  if (digits.startsWith('91') && digits.length === 12) return true
  return digits.length === 10
}

export default function RegisterPage() {
  const [form, setForm] = useState<FormState>(INITIAL)
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: ({ tokens, user }) => {
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
      localStorage.setItem('user', JSON.stringify(user))
      navigate('/')
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? 'Registration failed. Please try again.')
    },
  })

  const phoneIsIndian = isIndianMobile(form.phone)
  const emailRequired = !phoneIsIndian && form.phone.length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (emailRequired && !form.email.trim()) {
      setError('Email is required for non-Indian phone numbers — we can only send SMS to Indian mobiles.')
      return
    }

    registerMutation.mutate({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      password: form.password,
      role: form.role,
    })
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <img src="/logo.png" alt="Jose For Land" className="h-20 w-20 object-contain rounded-full shadow-md" />
            <div className="text-xs font-medium tracking-wide" style={{ color: '#6A9739' }}>Live where you want</div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
          <p className="text-gray-500 text-sm mb-6">List your land or join as an agent</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a *</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLE_OPTIONS.map(({ value, label, desc, icon: Icon, color }) => {
                  const isActive = form.role === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, role: value })}
                      className="text-left p-4 rounded-xl border-2 transition-all"
                      style={isActive
                        ? { borderColor: color, backgroundColor: `${color}10` }
                        : { borderColor: '#E5E7EB', backgroundColor: 'white' }}
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2"
                        style={{
                          backgroundColor: isActive ? color : '#F3F4F6',
                          color: isActive ? 'white' : '#9CA3AF',
                        }}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-sm font-bold" style={{ color: isActive ? color : '#111111' }}>
                        {label}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">{desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name *</label>
                <input required type="text" value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="First" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name *</label>
                <input required type="text" value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Last" className="input-field" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between">
                <span>Phone *</span>
                {form.phone && !phoneIsIndian && (
                  <span className="text-[11px] font-normal" style={{ color: '#B45309' }}>
                    ⚠ Non-Indian — email required
                  </span>
                )}
              </label>
              <input required type="tel" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 XXXXX XXXXX" className="input-field"
                style={form.phone && !phoneIsIndian ? { borderColor: '#F59E0B' } : undefined} />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between">
                <span>Email *</span>
                {emailRequired && !form.email && (
                  <span className="text-[11px] font-normal" style={{ color: '#B45309' }}>
                    Required (non-Indian phone)
                  </span>
                )}
              </label>
              <input required type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com" className="input-field"
                style={emailRequired && !form.email ? { borderColor: '#F59E0B' } : undefined} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
              <div className="relative">
                <input required type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 8 characters" className="input-field pr-11" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label>
              <input required type="password" value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Repeat password" className="input-field" />
            </div>

            <button type="submit"
              disabled={registerMutation.isPending}
              className="w-full btn-primary py-3 text-base mt-2 disabled:opacity-60">
              {registerMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
                : <><UserPlus className="w-4 h-4" /> Create Account</>
              }
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: '#FF5A5F' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
