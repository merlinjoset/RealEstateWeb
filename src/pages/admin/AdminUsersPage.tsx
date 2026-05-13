import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search, Edit2, Trash2, Mail, Phone, Shield, UserPlus,
  X, Save, Eye, EyeOff, Users as UsersIcon, UserCheck, UserX, Calendar,
  CheckCircle2, MapPin, Loader2, AlertCircle, ShoppingBag, Lock,
} from 'lucide-react'
import {
  usersApi,
  type AdminUser,
  type AdminUserRole,
  type UserCounts,
  type UserQuery,
  type CreateUserPayload,
  type UpdateUserPayload,
} from '../../services/api'

const ROLE_BADGE: Record<AdminUserRole, { bg: string; color: string; label: string }> = {
  Admin:    { bg: 'rgba(255,90,95,0.10)',  color: '#FF5A5F', label: 'Admin' },
  Agent:    { bg: 'rgba(41,50,55,0.08)',   color: '#293237', label: 'Agent' },
  Seller:   { bg: 'rgba(245,158,11,0.10)', color: '#B45309', label: 'Seller' },
  Employee: { bg: 'rgba(106,151,57,0.10)', color: '#6A9739', label: 'Employee' },
  Buyer:    { bg: 'rgba(99,102,241,0.10)', color: '#4F46E5', label: 'Buyer' },
}

/** Fallback used if the API returns an unknown role — prevents the whole
 *  page from crashing on a stale role value. */
const UNKNOWN_BADGE = { bg: '#F3F4F6', color: '#6B7280', label: 'Unknown' }

interface FormState {
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  role: AdminUserRole
  isActive: boolean
  /** Plaintext password — only used on create. Ignored when editing. */
  password: string
}

const EMPTY_FORM: FormState = {
  firstName: '', lastName: '', email: '', phone: '', city: '',
  role: 'Employee', isActive: true, password: '',
}

const ZERO_COUNTS: UserCounts = {
  all: 0, employee: 0, seller: 0, agent: 0, admin: 0, buyer: 0, active: 0, inactive: 0,
}

function relativeTime(iso: string | null) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<NonNullable<UserQuery['role']>>('all')
  const [statusFilter, setStatusFilter] = useState<NonNullable<UserQuery['status']>>('all')

  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [showPw, setShowPw] = useState(false)

  const [viewing, setViewing] = useState<AdminUser | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  // ── Live query ───────────────────────────────────────────────────────
  const query = useQuery({
    queryKey: ['admin-users', { search, role: roleFilter, status: statusFilter }],
    queryFn: () => usersApi.getAll({
      search: search.trim() || undefined,
      role: roleFilter,
      status: statusFilter,
    }),
    placeholderData: (prev) => prev,
  })

  const items = query.data?.items ?? []
  const counts = query.data?.counts ?? ZERO_COUNTS

  // ── Mutations ────────────────────────────────────────────────────────
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-users'] })

  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.create(payload),
    onSuccess: () => { invalidate(); closeForm() },
    onError: (err: any) => setFormError(err?.response?.data?.message ?? 'Failed to create user'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) =>
      usersApi.update(id, payload),
    onSuccess: () => { invalidate(); closeForm() },
    onError: (err: any) => setFormError(err?.response?.data?.message ?? 'Failed to update user'),
  })

  const toggleMutation = useMutation({
    mutationFn: (id: number) => usersApi.toggleStatus(id),
    onSuccess: (updated) => {
      invalidate()
      if (viewing?.id === updated.id) setViewing(updated)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => { invalidate(); setDeleteId(null) },
    onError: (err: any) => alert(err?.response?.data?.message ?? 'Failed to delete user'),
  })

  // ── Handlers ─────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingUser(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setShowPw(false)
    setShowForm(true)
  }

  const openEdit = (u: AdminUser) => {
    setEditingUser(u)
    setForm({
      firstName: u.firstName, lastName: u.lastName, email: u.email,
      phone: u.phone, city: u.city ?? '', role: u.role, isActive: u.isActive,
      password: '',  // Password isn't editable here — admin uses the
                    // forgot-password flow or the user changes it themselves.
    })
    setFormError(null)
    setShowPw(false)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingUser(null)
    setForm(EMPTY_FORM)
    setFormError(null)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (editingUser) {
      // password isn't part of the update payload — strip it before sending
      const { password: _ignored, ...rest } = form
      const payload: UpdateUserPayload = { ...rest, city: rest.city.trim() || null }
      updateMutation.mutate({ id: editingUser.id, payload })
    } else {
      // For create, password is optional but recommended; backend falls back
      // to a default placeholder if we omit it, but the admin really should
      // set one explicitly so the new user can sign in right away.
      const pw = form.password.trim()
      if (pw && pw.length < 8) {
        setFormError('Password must be at least 8 characters.')
        return
      }
      const payload: CreateUserPayload = {
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        phone:     form.phone,
        city:      form.city.trim() || null,
        role:      form.role,
        password:  pw || undefined,
      }
      createMutation.mutate(payload)
    }
  }

  const isMutating =
    createMutation.isPending || updateMutation.isPending ||
    toggleMutation.isPending || deleteMutation.isPending

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Users</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {counts.all} total · {counts.active} active · {counts.inactive} inactive
            {query.isFetching && <span className="ml-2 inline-flex items-center gap-1" style={{ color: '#6A9739' }}>
              <Loader2 className="w-3 h-3 animate-spin" /> updating
            </span>}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-colors"
          style={{ backgroundColor: '#6A9739' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#547a2d')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#6A9739')}
        >
          <UserPlus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Employees', value: counts.employee, color: '#6A9739', bg: 'rgba(106,151,57,0.08)', icon: UsersIcon },
          { label: 'Sellers',   value: counts.seller,   color: '#B45309', bg: 'rgba(245,158,11,0.08)', icon: UserCheck },
          { label: 'Buyers',    value: counts.buyer,    color: '#4F46E5', bg: 'rgba(99,102,241,0.08)', icon: ShoppingBag },
          { label: 'Agents',    value: counts.agent,    color: '#293237', bg: 'rgba(41,50,55,0.06)',   icon: Shield },
          { label: 'Admins',    value: counts.admin,    color: '#FF5A5F', bg: 'rgba(255,90,95,0.08)',  icon: UserX },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: bg, color }}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight" style={{ color: '#111111' }}>{value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter row */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, or city..."
              className="bg-transparent outline-none text-sm w-full"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {(['all', 'employee', 'seller', 'buyer', 'agent', 'admin'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize"
                style={roleFilter === r
                  ? { backgroundColor: '#6A9739', color: 'white', borderColor: '#6A9739' }
                  : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }}
              >
                {r === 'all' ? 'All Roles' : r + 's'}
                <span className="ml-1.5 opacity-75">({counts[r === 'all' ? 'all' : r]})</span>
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Loading / error / empty / table */}
        {query.isLoading ? (
          <div className="py-16 text-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading users…</p>
          </div>
        ) : query.isError ? (
          <div className="py-16 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-sm text-red-600">Failed to load users.</p>
            <button onClick={() => query.refetch()}
              className="mt-3 text-xs font-semibold underline" style={{ color: '#FF5A5F' }}>
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 px-4">
            <UsersIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No users match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase hidden md:table-cell">Contact</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase hidden lg:table-cell">Activity</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase hidden sm:table-cell">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((u) => {
                  const roleBadge = ROLE_BADGE[u.role] ?? UNKNOWN_BADGE
                  const initials = (u.firstName[0] ?? '') + (u.lastName[0] ?? '')
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: roleBadge.color }}>
                            {initials.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate">{u.firstName} {u.lastName}</div>
                            {u.city && (
                              <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" /> {u.city}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="text-xs text-gray-700">{u.email}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{u.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide"
                          style={{ backgroundColor: roleBadge.bg, color: roleBadge.color }}>
                          {roleBadge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="text-xs text-gray-700">
                          {u.role === 'Employee' && (
                            <span>{u.inquiriesCount} assigned</span>
                          )}
                          {(u.role === 'Seller' || u.role === 'Agent') && (
                            <span>{u.propertiesCount} listings</span>
                          )}
                          {u.role === 'Admin' && <span className="text-gray-400">—</span>}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {relativeTime(u.lastActiveAt ?? u.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <button
                          onClick={() => toggleMutation.mutate(u.id)}
                          disabled={isMutating}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full transition-colors"
                          style={u.isActive
                            ? { backgroundColor: 'rgba(106,151,57,0.10)', color: '#6A9739' }
                            : { backgroundColor: 'rgba(245,158,11,0.10)', color: '#B45309' }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: u.isActive ? '#6A9739' : '#B45309' }} />
                          {u.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setViewing(u)}
                            title="View details"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => openEdit(u)}
                            title="Edit"
                            className="p-1.5 text-gray-400 hover:text-[#6A9739] hover:bg-[rgba(106,151,57,0.08)] rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(u.id)}
                            title="Delete"
                            disabled={u.role === 'Admin'}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* === Create/Edit modal === */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={closeForm}>
          <form onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-xl w-full shadow-xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editingUser ? 'Update the user details below' : 'Create a new account in the system'}
                </p>
              </div>
              <button type="button" onClick={closeForm}
                className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name *</label>
                  <input required value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name *</label>
                  <input required value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                <input required type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field" placeholder="user@example.com" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
                  <input required type="tel" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input-field" placeholder="+91 XXXXX XXXXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                  <input value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="input-field" placeholder="e.g. Nagercoil" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Employee', 'Seller', 'Buyer', 'Agent', 'Admin'] as const).map(r => {
                    const isActive = form.role === r
                    const badge = ROLE_BADGE[r]
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setForm({ ...form, role: r })}
                        className="px-3 py-2 rounded-lg text-xs font-semibold border transition-colors"
                        style={isActive
                          ? { backgroundColor: badge.color, color: 'white', borderColor: badge.color }
                          : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }}
                      >
                        {r}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Password — create flow only. On edit the admin sends the
                  user through forgot-password instead of overwriting silently. */}
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Initial password{' '}
                    <span className="text-xs font-normal text-gray-400">
                      (at least 8 characters — leave blank to use a default)
                    </span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Set a password the new user will sign in with"
                      className="input-field pl-10 pr-11"
                      autoComplete="new-password"
                      minLength={form.password ? 8 : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Share this password with the user — they can change it later from their profile.
                  </p>
                </div>
              )}

              {editingUser && (
                <div className="text-xs text-gray-500 rounded-lg p-3 border border-gray-100 bg-gray-50 flex items-start gap-2">
                  <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" />
                  <span>
                    Passwords aren't editable here. Send the user to{' '}
                    <strong>/forgot-password</strong> to reset, or have them update it from
                    their own profile.
                  </span>
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50">
                <div onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className="w-11 h-6 rounded-full transition-colors relative shrink-0"
                  style={{ backgroundColor: form.isActive ? '#6A9739' : '#E5E7EB' }}>
                  <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                    style={{ transform: form.isActive ? 'translateX(22px)' : 'translateX(2px)' }} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">
                    {form.isActive ? 'Active account' : 'Inactive account'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {form.isActive
                      ? 'User can log in and use the platform'
                      : 'User is suspended — cannot log in until reactivated'}
                  </div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
              <button type="button" onClick={closeForm}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="btn-ghost text-sm">
                Cancel
              </button>
              <button type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
                style={{ backgroundColor: '#6A9739' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#547a2d')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#6A9739')}>
                {(createMutation.isPending || updateMutation.isPending)
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  : <><Save className="w-4 h-4" /> {editingUser ? 'Update User' : 'Create User'}</>
                }
              </button>
            </div>
          </form>
        </div>
      )}

      {/* === View details modal === */}
      {viewing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setViewing(null)}>
          <div onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden">
            <div className="p-6 text-white relative" style={{ backgroundColor: ROLE_BADGE[viewing.role].color }}>
              <button onClick={() => setViewing(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold border-2 border-white/40">
                  {((viewing.firstName[0] ?? '') + (viewing.lastName[0] ?? '')).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-xl leading-tight">{viewing.firstName} {viewing.lastName}</h3>
                  <p className="text-sm opacity-90 mt-0.5 capitalize">{viewing.role}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <DetailRow icon={Mail} label="Email" value={viewing.email} />
              <DetailRow icon={Phone} label="Phone" value={viewing.phone} />
              {viewing.city && <DetailRow icon={MapPin} label="Location" value={viewing.city} />}
              <DetailRow icon={Calendar} label="Joined"
                value={new Date(viewing.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
              {viewing.lastActiveAt && (
                <DetailRow icon={CheckCircle2} label="Last Active" value={relativeTime(viewing.lastActiveAt)} />
              )}
              {viewing.role === 'Employee' && (
                <DetailRow icon={UsersIcon} label="Inquiries Assigned" value={`${viewing.inquiriesCount}`} />
              )}
              {(viewing.role === 'Seller' || viewing.role === 'Agent') && (
                <DetailRow icon={UsersIcon} label="Properties Listed" value={`${viewing.propertiesCount}`} />
              )}

              <div className="pt-4 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => { setViewing(null); openEdit(viewing) }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold border transition-colors"
                  style={{ borderColor: '#6A9739', color: '#6A9739' }}>
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => toggleMutation.mutate(viewing.id)}
                  disabled={toggleMutation.isPending}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold border transition-colors disabled:opacity-60"
                  style={{ borderColor: '#CFD8DC', color: '#374151' }}>
                  {viewing.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === Delete confirm === */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Delete User?</h3>
            <p className="text-gray-500 text-sm mb-5">
              This will permanently remove the account from the system. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                disabled={deleteMutation.isPending}
                className="flex-1 btn-ghost border border-gray-200">
                Cancel
              </button>
              <button onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-60">
                {deleteMutation.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</>
                  : <><Trash2 className="w-4 h-4" /> Delete</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ----------------------------- Helper ----------------------------- */

function DetailRow({ icon: Icon, label, value }: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: '#FAFAF8', color: '#6A9739' }}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">{label}</div>
        <div className="text-sm text-gray-900 font-medium mt-0.5 break-words">{value}</div>
      </div>
    </div>
  )
}
