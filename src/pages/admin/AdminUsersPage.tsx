import { useState, useMemo } from 'react'
import {
  Search, Plus, Edit2, Trash2, Mail, Phone, Shield, UserPlus,
  X, Save, Eye, Users as UsersIcon, UserCheck, UserX, Calendar,
  CheckCircle2, MapPin,
} from 'lucide-react'

type Role = 'buyer' | 'seller' | 'agent' | 'admin'
type Status = 'active' | 'inactive'

interface AdminUser {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  city?: string
  role: Role
  status: Status
  joinedAt: string
  lastActive?: string
  propertiesCount?: number   // for sellers/agents
  inquiriesCount?: number    // for buyers
}

const INITIAL_USERS: AdminUser[] = [
  {
    id: 1, firstName: 'Admin', lastName: 'Jose', email: 'admin@joseforland.com',
    phone: '+91 99944 88490', city: 'Nagercoil', role: 'admin', status: 'active',
    joinedAt: '2023-06-12', lastActive: 'Just now',
  },
  {
    id: 2, firstName: 'Rajan', lastName: 'Kumar', email: 'rajan.k@gmail.com',
    phone: '+91 98765 43210', city: 'Nagercoil', role: 'buyer', status: 'active',
    joinedAt: '2024-01-12', lastActive: '2 hours ago', inquiriesCount: 3,
  },
  {
    id: 3, firstName: 'Priya', lastName: 'Selvam', email: 'priya.s@gmail.com',
    phone: '+91 87654 32109', city: 'Marthandam', role: 'buyer', status: 'active',
    joinedAt: '2024-01-15', lastActive: 'Yesterday', inquiriesCount: 5,
  },
  {
    id: 4, firstName: 'Xavier', lastName: 'Joseph', email: 'xavier@yahoo.com',
    phone: '+91 76543 21098', city: 'Colachel', role: 'seller', status: 'active',
    joinedAt: '2023-11-22', lastActive: '5 days ago', propertiesCount: 4,
  },
  {
    id: 5, firstName: 'Maria', lastName: 'Antony', email: 'maria.a@gmail.com',
    phone: '+91 65432 10987', city: 'Kanyakumari', role: 'buyer', status: 'active',
    joinedAt: '2024-02-02', lastActive: 'Today', inquiriesCount: 2,
  },
  {
    id: 6, firstName: 'Sundaram', lastName: 'Pillai', email: 'sundaram@joseforland.com',
    phone: '+91 99445 23210', city: 'Thuckalay', role: 'agent', status: 'active',
    joinedAt: '2023-08-15', lastActive: '30 mins ago', propertiesCount: 12,
  },
  {
    id: 7, firstName: 'Thomas', lastName: 'John', email: 'thomas.j@hotmail.com',
    phone: '+91 90876 54321', city: 'Nagercoil', role: 'seller', status: 'inactive',
    joinedAt: '2023-10-04', lastActive: '2 months ago', propertiesCount: 1,
  },
  {
    id: 8, firstName: 'Selvi', lastName: 'Murugan', email: 'selvi.m@gmail.com',
    phone: '+91 99776 12349', city: 'Padmanabhapuram', role: 'buyer', status: 'active',
    joinedAt: '2024-03-01', lastActive: 'Today', inquiriesCount: 1,
  },
]

const ROLE_BADGE: Record<Role, { bg: string; color: string; label: string }> = {
  admin:  { bg: 'rgba(255,90,95,0.10)',  color: '#FF5A5F', label: 'Admin' },
  agent:  { bg: 'rgba(41,50,55,0.08)',   color: '#293237', label: 'Agent' },
  seller: { bg: 'rgba(245,158,11,0.10)', color: '#B45309', label: 'Seller' },
  buyer:  { bg: 'rgba(106,151,57,0.10)', color: '#6A9739', label: 'Buyer' },
}

type FormState = Omit<AdminUser, 'id' | 'joinedAt' | 'lastActive' | 'propertiesCount' | 'inquiriesCount'>

const EMPTY_FORM: FormState = {
  firstName: '', lastName: '', email: '', phone: '', city: '',
  role: 'buyer', status: 'active',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  const [viewing, setViewing] = useState<AdminUser | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const counts = useMemo(() => ({
    all: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    agent: users.filter(u => u.role === 'agent').length,
    seller: users.filter(u => u.role === 'seller').length,
    buyer: users.filter(u => u.role === 'buyer').length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
  }), [users])

  const filtered = useMemo(() => {
    return users.filter(u => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (statusFilter !== 'all' && u.status !== statusFilter) return false
      const q = search.trim().toLowerCase()
      if (!q) return true
      return (
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q) ||
        (u.city?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [users, search, roleFilter, statusFilter])

  /* ---------- handlers ---------- */
  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (u: AdminUser) => {
    setEditingId(u.id)
    setForm({
      firstName: u.firstName, lastName: u.lastName, email: u.email,
      phone: u.phone, city: u.city ?? '', role: u.role, status: u.status,
    })
    setShowForm(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId !== null) {
      setUsers(prev => prev.map(u => u.id === editingId ? { ...u, ...form } : u))
    } else {
      const newUser: AdminUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        ...form,
        joinedAt: new Date().toISOString().slice(0, 10),
        lastActive: 'Just now',
      }
      setUsers(prev => [newUser, ...prev])
    }
    setShowForm(false)
    setForm(EMPTY_FORM)
    setEditingId(null)
  }

  const toggleStatus = (id: number) =>
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u,
    ))

  const confirmDelete = (id: number) => {
    setUsers(prev => prev.filter(u => u.id !== id))
    setDeleteId(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Users</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {counts.all} total · {counts.active} active · {counts.inactive} inactive
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Buyers',  value: counts.buyer,  color: '#6A9739', bg: 'rgba(106,151,57,0.08)', icon: UsersIcon },
          { label: 'Sellers', value: counts.seller, color: '#B45309', bg: 'rgba(245,158,11,0.08)', icon: UserCheck },
          { label: 'Agents',  value: counts.agent,  color: '#293237', bg: 'rgba(41,50,55,0.06)',   icon: Shield },
          { label: 'Admins',  value: counts.admin,  color: '#FF5A5F', bg: 'rgba(255,90,95,0.08)',  icon: UserX },
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
            {(['all', 'buyer', 'seller', 'agent', 'admin'] as const).map(r => (
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
            onChange={(e) => setStatusFilter(e.target.value as Status | 'all')}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Users table */}
        {filtered.length === 0 ? (
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
                {filtered.map((u) => {
                  const roleBadge = ROLE_BADGE[u.role]
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
                          {u.role === 'buyer' && u.inquiriesCount !== undefined && (
                            <span>{u.inquiriesCount} inquir{u.inquiriesCount === 1 ? 'y' : 'ies'}</span>
                          )}
                          {(u.role === 'seller' || u.role === 'agent') && u.propertiesCount !== undefined && (
                            <span>{u.propertiesCount} listings</span>
                          )}
                          {u.role === 'admin' && <span className="text-gray-400">—</span>}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {u.lastActive}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <button
                          onClick={() => toggleStatus(u.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full transition-colors"
                          style={u.status === 'active'
                            ? { backgroundColor: 'rgba(106,151,57,0.10)', color: '#6A9739' }
                            : { backgroundColor: 'rgba(245,158,11,0.10)', color: '#B45309' }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: u.status === 'active' ? '#6A9739' : '#B45309' }} />
                          {u.status === 'active' ? 'Active' : 'Inactive'}
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
                            disabled={u.role === 'admin'}
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
          onClick={() => setShowForm(false)}>
          <form onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-xl w-full shadow-xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {editingId ? 'Edit User' : 'Add New User'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editingId ? 'Update the user details below' : 'Create a new account in the system'}
                </p>
              </div>
              <button type="button" onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
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
                  {(['buyer', 'seller', 'agent', 'admin'] as const).map(r => {
                    const isActive = form.role === r
                    const badge = ROLE_BADGE[r]
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setForm({ ...form, role: r })}
                        className="px-3 py-2 rounded-lg text-xs font-semibold border transition-colors capitalize"
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

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50">
                <div onClick={() => setForm({ ...form, status: form.status === 'active' ? 'inactive' : 'active' })}
                  className="w-11 h-6 rounded-full transition-colors relative shrink-0"
                  style={{ backgroundColor: form.status === 'active' ? '#6A9739' : '#E5E7EB' }}>
                  <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                    style={{ transform: form.status === 'active' ? 'translateX(22px)' : 'translateX(2px)' }} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">
                    {form.status === 'active' ? 'Active account' : 'Inactive account'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {form.status === 'active'
                      ? 'User can log in and use the platform'
                      : 'User is suspended — cannot log in until reactivated'}
                  </div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm">
                Cancel
              </button>
              <button type="submit"
                className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors"
                style={{ backgroundColor: '#6A9739' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#547a2d')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#6A9739')}>
                <Save className="w-4 h-4" />
                {editingId ? 'Update User' : 'Create User'}
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
            {/* Header gradient */}
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
                value={new Date(viewing.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
              {viewing.lastActive && (
                <DetailRow icon={CheckCircle2} label="Last Active" value={viewing.lastActive} />
              )}
              {viewing.role === 'buyer' && viewing.inquiriesCount !== undefined && (
                <DetailRow icon={UsersIcon} label="Total Inquiries" value={`${viewing.inquiriesCount}`} />
              )}
              {(viewing.role === 'seller' || viewing.role === 'agent') && viewing.propertiesCount !== undefined && (
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
                  onClick={() => toggleStatus(viewing.id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold border transition-colors"
                  style={{ borderColor: '#CFD8DC', color: '#374151' }}>
                  {viewing.status === 'active' ? 'Deactivate' : 'Activate'}
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
              <button onClick={() => setDeleteId(null)} className="flex-1 btn-ghost border border-gray-200">
                Cancel
              </button>
              <button onClick={() => confirmDelete(deleteId)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">
                <Trash2 className="w-4 h-4" /> Delete
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
