import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search, Phone, Mail, MessageCircle, MapPin, X, Inbox, Calendar,
  Filter, ExternalLink, Loader2, AlertCircle, UserPlus, UserCheck, Check,
} from 'lucide-react'
import { inquiriesApi, usersApi, type AdminInquiry, type AdminUser } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

/**
 * Backend statuses are PascalCase ("New" | "Assigned" | "InProgress" |
 * "Resolved" | "Closed"). We treat them case-insensitively so a stale
 * value never crashes the badge lookup.
 */
type StatusKey = 'new' | 'assigned' | 'in_progress' | 'resolved' | 'closed'

const STATUS_BADGE: Record<StatusKey, { bg: string; color: string; label: string }> = {
  new:         { bg: 'rgba(255,90,95,0.10)',  color: '#FF5A5F', label: 'New' },
  assigned:    { bg: 'rgba(99,102,241,0.10)', color: '#4F46E5', label: 'Assigned' },
  in_progress: { bg: 'rgba(245,158,11,0.10)', color: '#B45309', label: 'In Progress' },
  resolved:    { bg: 'rgba(106,151,57,0.10)', color: '#6A9739', label: 'Resolved' },
  closed:      { bg: 'rgba(41,50,55,0.08)',   color: '#293237', label: 'Closed' },
}

function normalizeStatus(s: string): StatusKey {
  const k = s.toLowerCase().replace(/\s+/g, '_')
  if (k in STATUS_BADGE) return k as StatusKey
  return 'new'
}

const CONTACT_ICON = (p: string): React.ComponentType<{ className?: string }> =>
  ({ phone: Phone, whatsapp: MessageCircle, email: Mail } as const)[p.toLowerCase()] ?? Phone

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function AdminInquiriesPage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  // The same page serves two roles:
  //  - Admin    → fetches every inquiry, can assign / filter / etc.
  //  - Employee → fetches only inquiries assigned to them, admin-only
  //               controls are hidden so the page reads as a personal queue.
  const isEmployee = user?.role === 'Employee'

  // ── Filters ──────────────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusKey | 'all'>('all')
  const [readFilter, setReadFilter] = useState<'all' | 'unread'>('all')
  const [assignedFilter, setAssignedFilter] = useState<'all' | 'unassigned'>('all')
  const [selected, setSelected] = useState<AdminInquiry | null>(null)

  // ── Data ─────────────────────────────────────────────────────────────
  const inquiriesQuery = useQuery({
    queryKey: isEmployee ? ['my-work', 'inquiries'] : ['admin-inquiries'],
    queryFn: isEmployee ? inquiriesApi.getMine : inquiriesApi.getAll,
    refetchInterval: 60_000,
  })

  // Used to populate the admin-only "Assign to..." dropdown.
  const usersQuery = useQuery({
    queryKey: ['admin-users', 'assignees'],
    queryFn: () => usersApi.getAll(),
    enabled: !isEmployee,  // Employees can't reassign, so skip the request.
  })

  const items = inquiriesQuery.data ?? []
  // Assignment is intentionally restricted to Employees. Agents have their
  // own listings to focus on; Admins shouldn't be in the verification rota.
  const assignees = useMemo(
    () => (usersQuery.data?.items ?? [])
      .filter((u: AdminUser) => u.role === 'Employee' && u.isActive),
    [usersQuery.data],
  )

  // ── Mutations ────────────────────────────────────────────────────────
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-inquiries'] })

  const assignMutation = useMutation({
    mutationFn: ({ id, userId }: { id: number; userId: number }) => inquiriesApi.assign(id, userId),
    onSuccess: (updated) => {
      invalidate()
      // Keep the detail panel pinned to the freshly-updated record.
      if (selected?.id === updated.id) setSelected(updated)
    },
  })

  const readMutation = useMutation({
    mutationFn: (id: number) => inquiriesApi.markRead(id),
    onSuccess: invalidate,
  })

  // Local draft for the notes textarea — kept separate from `selected` so
  // we don't issue a PATCH on every keystroke. Submitted via the Save button.
  const [noteDraft, setNoteDraft] = useState('')
  const updateMutation = useMutation({
    mutationFn: ({ id, status, notes }: {
      id: number
      status: 'New' | 'Assigned' | 'InProgress' | 'Resolved' | 'Closed'
      notes?: string | null
    }) => inquiriesApi.update(id, status, notes),
    onSuccess: (updated) => {
      invalidate()
      if (selected?.id === updated.id) {
        setSelected(updated)
        setNoteDraft(updated.notes ?? '')
      }
    },
  })

  // ── Derived state ────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    all:        items.length,
    unread:     items.filter(i => !i.isRead).length,
    unassigned: items.filter(i => i.assignedToUserId == null).length,
    new:         items.filter(i => normalizeStatus(i.status) === 'new').length,
    assigned:    items.filter(i => normalizeStatus(i.status) === 'assigned').length,
    in_progress: items.filter(i => normalizeStatus(i.status) === 'in_progress').length,
    resolved:    items.filter(i => normalizeStatus(i.status) === 'resolved').length,
    closed:      items.filter(i => normalizeStatus(i.status) === 'closed').length,
  }), [items])

  const filtered = useMemo(() => {
    return items.filter(i => {
      if (statusFilter !== 'all' && normalizeStatus(i.status) !== statusFilter) return false
      if (readFilter === 'unread' && i.isRead) return false
      if (assignedFilter === 'unassigned' && i.assignedToUserId != null) return false
      const q = search.trim().toLowerCase()
      if (!q) return true
      return (
        i.name.toLowerCase().includes(q) ||
        i.phone.toLowerCase().includes(q) ||
        i.message.toLowerCase().includes(q) ||
        (i.propertyTitle?.toLowerCase().includes(q) ?? false) ||
        (i.assignedToName?.toLowerCase().includes(q) ?? false)
      )
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [items, search, statusFilter, readFilter, assignedFilter])

  const openInquiry = (i: AdminInquiry) => {
    setSelected(i)
    setNoteDraft(i.notes ?? '')
    if (!i.isRead) readMutation.mutate(i.id)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {isEmployee ? 'My Inquiries' : 'Inquiries'}
            {inquiriesQuery.isFetching && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEmployee ? (
              <>
                {counts.all} assigned to you ·{' '}
                <span style={{ color: '#FF5A5F' }} className="font-semibold">{counts.unread} unread</span>
              </>
            ) : (
              <>
                {counts.all} total ·{' '}
                <span style={{ color: '#FF5A5F' }} className="font-semibold">{counts.unread} unread</span> ·
                <span style={{ color: '#B45309' }} className="font-semibold"> {counts.unassigned} unassigned</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'New',         value: counts.new,        color: '#FF5A5F', bg: 'rgba(255,90,95,0.08)' },
          { label: 'Assigned',    value: counts.assigned,   color: '#4F46E5', bg: 'rgba(99,102,241,0.08)' },
          { label: 'In Progress', value: counts.in_progress, color: '#B45309', bg: 'rgba(245,158,11,0.08)' },
          { label: 'Closed',      value: counts.closed + counts.resolved, color: '#6A9739', bg: 'rgba(106,151,57,0.08)' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: bg, color }}>
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight" style={{ color: '#111111' }}>{value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* === Inquiry list === */}
        <div className={selected ? 'lg:col-span-7' : 'lg:col-span-12'}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Filter bar */}
            <div className="p-4 border-b border-gray-100 space-y-3">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5">
                <Search className="w-4 h-4 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, phone, property, assignee…"
                  className="bg-transparent outline-none text-sm w-full" />
                {search && (
                  <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {(['all', 'new', 'assigned', 'in_progress', 'closed'] as const).map(s => (
                  <button key={s}
                    onClick={() => setStatusFilter(s)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                    style={statusFilter === s
                      ? { backgroundColor: '#6A9739', color: 'white', borderColor: '#6A9739' }
                      : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }}>
                    {s === 'all' ? 'All' : STATUS_BADGE[s as StatusKey].label}
                    <span className="ml-1.5 opacity-75">({counts[s === 'all' ? 'all' : s]})</span>
                  </button>
                ))}
                {!isEmployee && (
                  <button
                    onClick={() => setAssignedFilter(assignedFilter === 'unassigned' ? 'all' : 'unassigned')}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors inline-flex items-center gap-1"
                    style={assignedFilter === 'unassigned'
                      ? { backgroundColor: '#B45309', color: 'white', borderColor: '#B45309' }
                      : { backgroundColor: 'white', color: '#B45309', borderColor: 'rgba(180,83,9,0.3)' }}
                    title="Show only inquiries not yet assigned to an employee">
                    <UserPlus className="w-3 h-3" /> Unassigned ({counts.unassigned})
                  </button>
                )}
                <button
                  onClick={() => setReadFilter(readFilter === 'unread' ? 'all' : 'unread')}
                  className="ml-auto px-3 py-1.5 rounded-full text-xs font-medium border transition-colors inline-flex items-center gap-1"
                  style={readFilter === 'unread'
                    ? { backgroundColor: '#FF5A5F', color: 'white', borderColor: '#FF5A5F' }
                    : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }}>
                  <Filter className="w-3 h-3" /> Unread only
                </button>
              </div>
            </div>

            {/* List body */}
            {inquiriesQuery.isLoading ? (
              <div className="py-16 text-center text-gray-400">
                <Loader2 className="w-7 h-7 animate-spin mx-auto mb-3" />
                <p className="text-sm">Loading inquiries…</p>
              </div>
            ) : inquiriesQuery.isError ? (
              <div className="py-16 text-center">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <p className="text-sm text-red-600">Failed to load inquiries.</p>
                <button onClick={() => inquiriesQuery.refetch()}
                  className="mt-3 text-xs font-semibold underline" style={{ color: '#FF5A5F' }}>
                  Try again
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No inquiries match your filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[70vh] overflow-y-auto">
                {filtered.map((i) => {
                  const badge = STATUS_BADGE[normalizeStatus(i.status)]
                  const ContactIcon = CONTACT_ICON(i.preferredContact)
                  const isActive = selected?.id === i.id
                  return (
                    // div rather than button — we now nest <Link>s for the
                    // property Edit/View shortcuts, and <a> inside <button>
                    // is invalid HTML (and triggers a React warning).
                    <div
                      key={i.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => openInquiry(i)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openInquiry(i) } }}
                      className="w-full text-left p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      style={isActive ? { backgroundColor: 'rgba(106,151,57,0.05)' } : {}}>
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-1.5">
                          {!i.isRead ? (
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FF5A5F' }} />
                          ) : (
                            <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`${i.isRead ? 'font-medium' : 'font-bold'} text-gray-900 truncate`}>
                                {i.name}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0"
                                style={{ backgroundColor: badge.bg, color: badge.color }}>
                                {badge.label}
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-400 shrink-0">{timeAgo(i.createdAt)}</span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-1.5">
                            <span className="flex items-center gap-1">
                              <ContactIcon className="w-3 h-3" /> {i.phone}
                            </span>
                          </div>

                          {i.propertyTitle && (
                            <div className="text-[11px] mb-1.5 flex items-center gap-1.5 flex-wrap"
                              style={{ color: '#6A9739' }}>
                              {i.propertyId != null && (
                                <span className="font-bold tabular-nums px-1.5 rounded"
                                  style={{ backgroundColor: 'rgba(106,151,57,0.12)' }}>
                                  #{i.propertyId}
                                </span>
                              )}
                              <span className="truncate">re: {i.propertyTitle}</span>
                              {i.propertyId != null && !isEmployee && (
                                <>
                                  {/* Inline shortcuts so admin can jump straight from
                                      the inquiry list to the linked property without
                                      opening the detail panel first. */}
                                  <Link
                                    to={`/admin/edit-property/${i.propertyId}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[10px] font-bold uppercase tracking-wider hover:underline"
                                    style={{ color: '#B45309' }}>
                                    Edit
                                  </Link>
                                  <Link
                                    to={`/properties/${i.propertyId}`}
                                    target="_blank"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[10px] font-bold uppercase tracking-wider hover:underline"
                                    style={{ color: '#4F46E5' }}>
                                    View
                                  </Link>
                                </>
                              )}
                            </div>
                          )}

                          {/* Assignment badge — most useful at-a-glance signal */}
                          <div className="text-[11px] mb-1.5 inline-flex items-center gap-1"
                            style={{ color: i.assignedToUserId == null ? '#B45309' : '#4F46E5' }}>
                            {i.assignedToUserId == null
                              ? <><UserPlus className="w-3 h-3" /> Unassigned</>
                              : <><UserCheck className="w-3 h-3" /> Assigned to {i.assignedToName ?? '#' + i.assignedToUserId}</>}
                          </div>

                          <p className="text-sm text-gray-600 line-clamp-2 leading-snug">
                            {i.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* === Detail panel === */}
        {selected && (
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-6">
              {/* Header */}
              <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 truncate">{selected.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0"
                      style={{
                        backgroundColor: STATUS_BADGE[normalizeStatus(selected.status)].bg,
                        color: STATUS_BADGE[normalizeStatus(selected.status)].color,
                      }}>
                      {STATUS_BADGE[normalizeStatus(selected.status)].label}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(selected.createdAt).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: 'numeric', minute: '2-digit',
                    })}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[55vh] overflow-y-auto">
                {/* === Assignment === */}
                {isEmployee ? (
                  /* Employee view — read-only banner that this is on their queue */
                  <div className="rounded-xl p-3 border-2 flex items-start gap-3"
                    style={{ backgroundColor: 'rgba(99,102,241,0.06)', borderColor: 'rgba(99,102,241,0.25)' }}>
                    <UserCheck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#4F46E5' }} />
                    <div className="min-w-0">
                      <div className="text-xs font-bold uppercase tracking-wider" style={{ color: '#4F46E5' }}>
                        Assigned to you
                      </div>
                      {selected.assignedAt && (
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Assigned {timeAgo(selected.assignedAt)} — call the buyer to follow up.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">
                      Assigned to
                    </div>
                    <AssignPicker
                      selected={selected}
                      assignees={assignees}
                      onAssign={(userId) => assignMutation.mutate({ id: selected.id, userId })}
                      isPending={assignMutation.isPending}
                    />
                    {selected.assignedAt && (
                      <p className="text-[11px] text-gray-400 mt-1.5">
                        Assigned {timeAgo(selected.assignedAt)} · the assignee was notified via SMS / WhatsApp.
                      </p>
                    )}
                  </div>
                )}

                {/* Contact info */}
                <div className="space-y-2">
                  <a href={`tel:${selected.phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'rgba(255,90,95,0.08)', color: '#FF5A5F' }}>
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Phone</div>
                      <div className="text-sm font-medium text-gray-900">{selected.phone}</div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  </a>
                  {selected.email && (
                    <a href={`mailto:${selected.email}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'rgba(106,151,57,0.08)', color: '#6A9739' }}>
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Email</div>
                        <div className="text-sm font-medium text-gray-900 truncate">{selected.email}</div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    </a>
                  )}
                  <div className="text-xs text-gray-500 px-2">
                    Preferred contact: <strong className="capitalize text-gray-900">{selected.preferredContact}</strong>
                  </div>
                </div>

                {/* Linked property — explicit Edit + View Details buttons so
                    admins can act on the property without leaving the inquiry. */}
                {selected.propertyId && (
                  <div className="flex items-center gap-3 p-3 rounded-xl border"
                    style={{ borderColor: 'rgba(106,151,57,0.3)', backgroundColor: 'rgba(106,151,57,0.05)' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#6A9739', color: 'white' }}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] uppercase tracking-wider font-semibold flex items-center gap-2"
                        style={{ color: '#6A9739' }}>
                        About Property
                        <span className="font-bold tabular-nums px-1.5 rounded text-gray-700"
                          style={{ backgroundColor: 'rgba(106,151,57,0.15)' }}>
                          #{selected.propertyId}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 truncate">{selected.propertyTitle}</div>
                    </div>
                    {!isEmployee && (
                      <Link
                        to={`/admin/edit-property/${selected.propertyId}`}
                        className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                        style={{ borderColor: '#B45309', color: '#B45309' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(245,158,11,0.08)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}>
                        Edit
                      </Link>
                    )}
                    <Link
                      to={`/properties/${selected.propertyId}`}
                      target="_blank"
                      className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
                      style={{ backgroundColor: '#6A9739' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#547a2d')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#6A9739')}>
                      <ExternalLink className="w-3 h-3" />
                      View Details
                    </Link>
                  </div>
                )}

                {/* Message */}
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1.5">Message</div>
                  <div className="rounded-xl p-4 text-sm text-gray-700 leading-relaxed border-l-4"
                    style={{ backgroundColor: '#FAFAF8', borderColor: '#FF5A5F' }}>
                    {selected.message}
                  </div>
                </div>

                {/* === Update status + notes === */}
                <StatusEditor
                  selected={selected}
                  noteDraft={noteDraft}
                  onNoteChange={setNoteDraft}
                  onSave={(nextStatus) => updateMutation.mutate({
                    id: selected.id,
                    status: nextStatus,
                    notes: noteDraft.trim() || null,
                  })}
                  isSaving={updateMutation.isPending}
                  saveError={updateMutation.isError
                    ? ((updateMutation.error as { response?: { data?: { message?: string } } })
                        ?.response?.data?.message ?? 'Failed to update.')
                    : null}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────── Assign-to picker ─────────────────── */

function AssignPicker({
  selected, assignees, onAssign, isPending,
}: {
  selected: AdminInquiry
  assignees: AdminUser[]
  onAssign: (userId: number) => void
  isPending: boolean
}) {
  const [open, setOpen] = useState(false)
  const currentName = selected.assignedToName

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={isPending}
        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border transition-colors disabled:opacity-60"
        style={currentName
          ? { backgroundColor: 'rgba(99,102,241,0.06)', borderColor: 'rgba(99,102,241,0.25)' }
          : { backgroundColor: 'rgba(180,83,9,0.06)', borderColor: 'rgba(180,83,9,0.25)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {currentName
            ? <UserCheck className="w-4 h-4 shrink-0" style={{ color: '#4F46E5' }} />
            : <UserPlus className="w-4 h-4 shrink-0" style={{ color: '#B45309' }} />}
          <span className="text-sm font-semibold truncate"
            style={{ color: currentName ? '#4F46E5' : '#B45309' }}>
            {isPending
              ? 'Updating…'
              : currentName ?? 'Assign to an employee →'}
          </span>
        </div>
        {isPending && <Loader2 className="w-4 h-4 animate-spin text-gray-400 shrink-0" />}
      </button>

      {open && !isPending && (
        <div
          className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-h-64 overflow-y-auto"
        >
          {assignees.length === 0 ? (
            <div className="px-4 py-4 text-xs text-gray-400 text-center">
              No active Employees to assign to. Add one in <strong>Users</strong>.
            </div>
          ) : (
            assignees.map((u) => {
              const isCurrent = u.id === selected.assignedToUserId
              return (
                <button
                  key={u.id}
                  onClick={() => { onAssign(u.id); setOpen(false) }}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: roleAccent(u.role) }}>
                      {(u.firstName[0] ?? '') + (u.lastName[0] ?? '')}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {u.firstName} {u.lastName}
                      </div>
                      <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                        {u.role}
                      </div>
                    </div>
                  </div>
                  {isCurrent && <Check className="w-4 h-4 shrink-0" style={{ color: '#4F46E5' }} />}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

function roleAccent(role: string) {
  switch (role) {
    case 'Admin':    return '#FF5A5F'
    case 'Employee': return '#6A9739'
    case 'Agent':    return '#293237'
    default:         return '#9CA3AF'
  }
}

/* ─────────────────── Status editor ─────────────────── */

const STATUS_OPTIONS: Array<{
  key: 'New' | 'InProgress' | 'Resolved' | 'Closed'
  label: string
  color: string
}> = [
  { key: 'New',        label: 'New',         color: '#FF5A5F' },
  { key: 'InProgress', label: 'In Progress', color: '#B45309' },
  { key: 'Resolved',   label: 'Resolved',    color: '#6A9739' },
  { key: 'Closed',     label: 'Closed',      color: '#293237' },
]

function StatusEditor({
  selected, noteDraft, onNoteChange, onSave, isSaving, saveError,
}: {
  selected: AdminInquiry
  noteDraft: string
  onNoteChange: (s: string) => void
  onSave: (nextStatus: 'New' | 'InProgress' | 'Resolved' | 'Closed') => void
  isSaving: boolean
  saveError: string | null
}) {
  const currentStatusKey = normalizeStatus(selected.status)
  // We map the page's case-insensitive key back to the backend's PascalCase
  // when we send the PATCH. "Assigned" is auto-set on assign and not picked
  // manually here, so the chooser only shows the four meaningful options.
  const [chosen, setChosen] = useState<'New' | 'InProgress' | 'Resolved' | 'Closed'>(
    currentStatusKey === 'in_progress' ? 'InProgress'
    : currentStatusKey === 'resolved'  ? 'Resolved'
    : currentStatusKey === 'closed'    ? 'Closed'
    : 'New',
  )

  // When the user switches between inquiries in the list, reset the chosen
  // status to match the new selection.
  useEffect(() => {
    setChosen(
      currentStatusKey === 'in_progress' ? 'InProgress'
      : currentStatusKey === 'resolved'  ? 'Resolved'
      : currentStatusKey === 'closed'    ? 'Closed'
      : 'New',
    )
  }, [selected.id, currentStatusKey])

  // Detect dirty state — only enable Save when something actually changed.
  const statusChanged = (() => {
    if (chosen === 'New' && currentStatusKey === 'new') return false
    if (chosen === 'InProgress' && currentStatusKey === 'in_progress') return false
    if (chosen === 'Resolved' && currentStatusKey === 'resolved') return false
    if (chosen === 'Closed' && currentStatusKey === 'closed') return false
    return true
  })()
  const notesChanged = (noteDraft.trim() || '') !== (selected.notes?.trim() ?? '')
  const dirty = statusChanged || notesChanged

  return (
    <div className="rounded-xl border border-gray-100 p-4 space-y-3 bg-gray-50/40">
      <div>
        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">
          Update status
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {STATUS_OPTIONS.map((s) => {
            const isActive = chosen === s.key
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setChosen(s.key)}
                disabled={isSaving}
                className="px-3 py-2 rounded-lg text-xs font-semibold border-2 transition-colors disabled:opacity-60"
                style={isActive
                  ? { backgroundColor: s.color, borderColor: s.color, color: 'white' }
                  : { backgroundColor: 'white', borderColor: '#e5e7eb', color: s.color }}>
                {s.label}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1.5">
          Internal notes (optional)
        </div>
        <textarea
          value={noteDraft}
          onChange={(e) => onNoteChange(e.target.value)}
          disabled={isSaving}
          rows={3}
          placeholder="What did you do? Site visit notes, the call's outcome, next steps…"
          className="input-field resize-none text-sm disabled:opacity-60"
        />
      </div>

      {saveError && (
        <div className="text-xs text-red-600 flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          {saveError}
        </div>
      )}

      <button
        type="button"
        onClick={() => onSave(chosen)}
        disabled={!dirty || isSaving}
        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#6A9739' }}>
        {isSaving
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
          : dirty ? 'Save update' : 'No changes to save'}
      </button>

      <p className="text-[10px] text-gray-400 leading-snug">
        Saving notifies the admin team via SMS so they can see your progress.
      </p>
    </div>
  )
}
