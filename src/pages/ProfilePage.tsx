import { useState, useEffect } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import {
  User as UserIcon, Mail, Phone, MapPin, Calendar, Shield, LogOut,
  Edit2, Save, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2,
  Building2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../services/api'
import PageHeader from '../components/layout/PageHeader'
import ConfirmDialog from '../components/common/ConfirmDialog'

const ROLE_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  Admin:    { bg: 'rgba(255,90,95,0.10)',  color: '#FF5A5F', label: 'Admin' },
  Agent:    { bg: 'rgba(41,50,55,0.08)',   color: '#293237', label: 'Agent' },
  Seller:   { bg: 'rgba(245,158,11,0.10)', color: '#B45309', label: 'Seller' },
  Employee: { bg: 'rgba(106,151,57,0.10)', color: '#6A9739', label: 'Employee' },
  Buyer:    { bg: 'rgba(99,102,241,0.10)', color: '#4F46E5', label: 'Buyer' },
}

interface FormState {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<FormState>({ firstName: '', lastName: '', email: '', phone: '' })
  const [profileError, setProfileError] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  // Password change state
  const [showPwForm, setShowPwForm] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone ?? '',
      })
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#6A9739' }} />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: '/profile' }} replace />
  }

  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()
  const badge = ROLE_BADGE[user.role] ?? ROLE_BADGE.Employee
  const joinedAt = new Date(user.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSaving(true)
    try {
      const updated = await authApi.updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
      })
      // Refresh the cached user so the navbar/sidebar pick up new name
      localStorage.setItem('user', JSON.stringify(updated))
      // Force a soft refresh — easiest path to propagate the new user everywhere
      setEditing(false)
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 2200)
      setTimeout(() => window.location.reload(), 600)
    } catch (err: any) {
      setProfileError(err?.response?.data?.message ?? 'Failed to save profile.')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError('')
    if (pwForm.next !== pwForm.confirm) {
      setPwError('New passwords do not match')
      return
    }
    if (pwForm.next.length < 8) {
      setPwError('New password must be at least 8 characters')
      return
    }

    setPwSaving(true)
    try {
      await authApi.changePassword(pwForm.current, pwForm.next)
      setShowPwForm(false)
      setPwForm({ current: '', next: '', confirm: '' })
      setPwSaved(true)
      setTimeout(() => setPwSaved(false), 2200)
    } catch (err: any) {
      setPwError(err?.response?.data?.message ?? 'Failed to change password.')
    } finally {
      setPwSaving(false)
    }
  }

  const [confirmSignOut, setConfirmSignOut] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const handleLogout = () => setConfirmSignOut(true)
  const performLogout = async () => {
    setSigningOut(true)
    try {
      await logout()
      navigate('/')
    } finally {
      setSigningOut(false)
      setConfirmSignOut(false)
    }
  }

  const isAdmin = user.role === 'Admin'
  const canSell = user.role === 'Seller' || user.role === 'Agent' || user.role === 'Admin'

  return (
    <main className="min-h-screen pb-16" style={{ backgroundColor: '#F8F6F3' }}>
      <PageHeader
        eyebrow="Your account"
        title="Profile"
        description="Manage your account details, password, and quick access to your activity."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2">
        {/* Saved flash */}
        {(savedFlash || pwSaved) && (
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold animate-in fade-in slide-in-from-top-2"
            style={{ backgroundColor: 'rgba(106,151,57,0.10)', color: '#6A9739' }}>
            <CheckCircle2 className="w-4 h-4" />
            {pwSaved ? 'Password updated' : 'Profile updated'}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* === Profile card === */}
          <section className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header strip */}
            <div className="p-6 text-white relative" style={{ backgroundColor: badge.color }}>
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold border-2 border-white/40 shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-2xl leading-tight">{user.firstName} {user.lastName}</h2>
                  <p className="text-sm opacity-90 mt-1 truncate">{user.email}</p>
                  <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                    <Shield className="w-3 h-3" /> {badge.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Account Details</h3>
                {!editing && (
                  <button onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
                    style={{ backgroundColor: 'rgba(106,151,57,0.08)', color: '#6A9739' }}>
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {profileError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{profileError}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="First Name *">
                      <input required value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        className="input-field" />
                    </Field>
                    <Field label="Last Name *">
                      <input required value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        className="input-field" />
                    </Field>
                  </div>
                  <Field label="Email *">
                    <input required type="email" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input-field" />
                  </Field>
                  <Field label="Phone">
                    <input type="tel" value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="input-field" />
                  </Field>
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setEditing(false)}
                      disabled={profileSaving} className="btn-ghost text-sm">
                      Cancel
                    </button>
                    <button type="submit" disabled={profileSaving}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
                      style={{ backgroundColor: '#6A9739' }}
                      onMouseEnter={e => !profileSaving && (e.currentTarget.style.backgroundColor = '#547a2d')}
                      onMouseLeave={e => !profileSaving && (e.currentTarget.style.backgroundColor = '#6A9739')}>
                      {profileSaving
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                        : <><Save className="w-4 h-4" /> Save Changes</>}
                    </button>
                  </div>
                </form>
              ) : (
                <dl className="space-y-3">
                  <Detail icon={UserIcon} label="Full Name"
                    value={`${user.firstName} ${user.lastName}`} />
                  <Detail icon={Mail} label="Email" value={user.email} />
                  <Detail icon={Phone} label="Phone"
                    value={user.phone || <span className="italic text-gray-400">Not provided</span>} />
                  <Detail icon={Calendar} label="Member Since" value={joinedAt} />
                </dl>
              )}
            </div>

            {/* Password section */}
            <div className="px-6 py-5 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255,90,95,0.08)', color: '#FF5A5F' }}>
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Password</div>
                    <div className="text-xs text-gray-500">Last changed: never</div>
                  </div>
                </div>
                {!showPwForm && (
                  <button onClick={() => setShowPwForm(true)}
                    className="text-xs font-semibold transition-colors"
                    style={{ color: '#FF5A5F' }}>
                    Change password
                  </button>
                )}
              </div>

              {showPwForm && (
                <form onSubmit={handleChangePassword} className="space-y-3 mt-4">
                  {pwError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{pwError}</span>
                    </div>
                  )}

                  <div className="relative">
                    <input required type={showPw ? 'text' : 'password'}
                      value={pwForm.current}
                      onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                      placeholder="Current password" className="input-field pr-11" />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input required type={showPw ? 'text' : 'password'}
                      value={pwForm.next}
                      onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
                      placeholder="New password (min 8 chars)" className="input-field" />
                    <input required type={showPw ? 'text' : 'password'}
                      value={pwForm.confirm}
                      onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                      placeholder="Confirm new password" className="input-field" />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button type="button"
                      disabled={pwSaving}
                      onClick={() => { setShowPwForm(false); setPwError(''); setPwForm({ current: '', next: '', confirm: '' }) }}
                      className="btn-ghost text-xs">
                      Cancel
                    </button>
                    <button type="submit" disabled={pwSaving}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
                      style={{ backgroundColor: '#FF5A5F' }}>
                      {pwSaving
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                        : <><Save className="w-3.5 h-3.5" /> Update Password</>}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>

          {/* === Sidebar: Quick links + Logout === */}
          <aside className="lg:col-span-1 space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-4">Quick Links</h3>
              <nav className="space-y-1.5">
                {isAdmin && (
                  <QuickLink to="/admin" icon={Shield} label="Admin Dashboard"
                    desc="Manage properties, users, inquiries" color="#FF5A5F" />
                )}
                {canSell && (
                  <QuickLink to="/sell" icon={Building2} label="Sell a Property"
                    desc="List your land for sale" color="#6A9739" />
                )}
                <QuickLink to="/properties" icon={MapPin} label="Browse Properties"
                  desc="Explore listings across Kanyakumari" color="#293237" />
                <QuickLink to="/contact" icon={Mail} label="Contact Us"
                  desc="Get in touch with our team" color="#B45309" />
              </nav>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <button onClick={handleLogout}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold border-2 transition-colors"
                style={{ borderColor: 'rgba(220,38,38,0.2)', color: '#DC2626' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                <LogOut className="w-4 h-4" /> Sign out
              </button>
              <p className="text-[11px] text-gray-400 text-center mt-2">
                You'll be redirected to the home page.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <ConfirmDialog
        open={confirmSignOut}
        title="Sign out?"
        message="You'll need to sign in again to manage your profile or access saved listings."
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        tone="danger"
        icon={LogOut}
        loading={signingOut}
        onConfirm={performLogout}
        onCancel={() => setConfirmSignOut(false)}
      />
    </main>
  )
}

/* ─────────────────── Helpers ─────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function Detail({ icon: Icon, label, value }: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: '#FAFAF8', color: '#6A9739' }}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">{label}</div>
        <div className="text-sm text-gray-900 font-medium mt-0.5 break-words">{value}</div>
      </div>
    </div>
  )
}

function QuickLink({ to, icon: Icon, label, desc, color }: {
  to: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  label: string
  desc: string
  color: string
}) {
  return (
    <Link to={to}
      className="flex items-center gap-3 p-3 rounded-lg transition-colors group"
      style={{ backgroundColor: 'transparent' }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F8F6F3')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}10`, color }}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-900">{label}</div>
        <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
      </div>
    </Link>
  )
}
