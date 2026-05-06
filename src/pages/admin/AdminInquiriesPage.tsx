import { useState, useMemo } from 'react'
import {
  Search, Phone, Mail, MessageCircle, MapPin, X, CheckCircle2, Circle,
  Trash2, Inbox, Calendar, Filter, ExternalLink,
} from 'lucide-react'
import { Link } from 'react-router-dom'

type ContactPref = 'phone' | 'whatsapp' | 'email'
type InquiryStatus = 'new' | 'contacted' | 'closed'

interface AdminInquiry {
  id: number
  name: string
  phone: string
  email?: string
  message: string
  preferredContact: ContactPref
  propertyId?: number
  propertyTitle?: string
  city?: string
  status: InquiryStatus
  isRead: boolean
  createdAt: string
  notes?: string
}

const INITIAL: AdminInquiry[] = [
  {
    id: 1, name: 'Kumar R.', phone: '+91 98765 43210', email: 'kumar.r@gmail.com',
    message: 'Interested in the 15 cents land near NH 44. Can you arrange a site visit this weekend? My budget is around ₹25 L.',
    preferredContact: 'phone', propertyId: 1, propertyTitle: '15 Cents Prime Land - Nagercoil',
    city: 'Nagercoil', status: 'new', isRead: false, createdAt: '2024-04-22T09:32:00',
  },
  {
    id: 2, name: 'Selvi M.', phone: '+91 87654 32109', email: 'selvi.m@gmail.com',
    message: 'Looking for 5-10 cents residential plot in Marthandam area. Please share options under ₹10 L.',
    preferredContact: 'whatsapp', city: 'Marthandam', status: 'new', isRead: false,
    createdAt: '2024-04-22T07:15:00',
  },
  {
    id: 3, name: 'Thomas J.', phone: '+91 76543 21098',
    message: 'Need detailed EC and patta for the 50 cents agricultural land in Thuckalay. Also, is the road access confirmed year-round?',
    preferredContact: 'phone', propertyId: 3, propertyTitle: '50 Cents Agricultural - Thuckalay',
    city: 'Thuckalay', status: 'contacted', isRead: true,
    createdAt: '2024-04-21T16:48:00', notes: 'Sent EC document. Site visit scheduled for Saturday.',
  },
  {
    id: 4, name: 'Priya N.', phone: '+91 99887 65432', email: 'priya.n@yahoo.com',
    message: 'I want to sell my 8 cents plot near Kanyakumari beach. Can you help me list it on your platform?',
    preferredContact: 'email', city: 'Kanyakumari', status: 'contacted', isRead: true,
    createdAt: '2024-04-20T11:00:00', notes: 'Site visit done. Listing draft prepared.',
  },
  {
    id: 5, name: 'Antony X.', phone: '+91 88776 54321',
    message: 'Question about the layout plan for the Colachel property. Is the south-facing direction confirmed?',
    preferredContact: 'whatsapp', propertyId: 5, propertyTitle: '20 Cents Open Plot - Colachel',
    city: 'Colachel', status: 'closed', isRead: true,
    createdAt: '2024-04-15T14:22:00', notes: 'Sale completed. Client purchased the plot.',
  },
  {
    id: 6, name: 'Maria S.', phone: '+91 96543 87210',
    message: 'How much commission do you charge if I list my agricultural land through your platform?',
    preferredContact: 'phone', city: 'Boothapandi', status: 'new', isRead: false,
    createdAt: '2024-04-23T08:05:00',
  },
]

const STATUS_BADGE: Record<InquiryStatus, { bg: string; color: string; label: string }> = {
  new:       { bg: 'rgba(255,90,95,0.10)',  color: '#FF5A5F', label: 'New' },
  contacted: { bg: 'rgba(245,158,11,0.10)', color: '#B45309', label: 'In Progress' },
  closed:    { bg: 'rgba(106,151,57,0.10)', color: '#6A9739', label: 'Closed' },
}

const CONTACT_ICON: Record<ContactPref, React.ComponentType<{ className?: string }>> = {
  phone: Phone,
  whatsapp: MessageCircle,
  email: Mail,
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function AdminInquiriesPage() {
  const [items, setItems] = useState<AdminInquiry[]>(INITIAL)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | 'all'>('all')
  const [readFilter, setReadFilter] = useState<'all' | 'unread'>('all')
  const [selected, setSelected] = useState<AdminInquiry | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [noteDraft, setNoteDraft] = useState('')

  const counts = useMemo(() => ({
    all: items.length,
    new: items.filter(i => i.status === 'new').length,
    contacted: items.filter(i => i.status === 'contacted').length,
    closed: items.filter(i => i.status === 'closed').length,
    unread: items.filter(i => !i.isRead).length,
  }), [items])

  const filtered = useMemo(() => {
    return items.filter(i => {
      if (statusFilter !== 'all' && i.status !== statusFilter) return false
      if (readFilter === 'unread' && i.isRead) return false
      const q = search.trim().toLowerCase()
      if (!q) return true
      return (
        i.name.toLowerCase().includes(q) ||
        i.phone.toLowerCase().includes(q) ||
        i.message.toLowerCase().includes(q) ||
        (i.propertyTitle?.toLowerCase().includes(q) ?? false) ||
        (i.city?.toLowerCase().includes(q) ?? false)
      )
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [items, search, statusFilter, readFilter])

  const openInquiry = (i: AdminInquiry) => {
    setSelected(i)
    setNoteDraft(i.notes ?? '')
    if (!i.isRead) {
      setItems(prev => prev.map(x => x.id === i.id ? { ...x, isRead: true } : x))
    }
  }

  const updateStatus = (id: number, status: InquiryStatus) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i))
    if (selected?.id === id) setSelected(s => s ? { ...s, status } : s)
  }

  const saveNote = () => {
    if (!selected) return
    setItems(prev => prev.map(i => i.id === selected.id ? { ...i, notes: noteDraft } : i))
    setSelected(s => s ? { ...s, notes: noteDraft } : s)
  }

  const toggleRead = (id: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, isRead: !i.isRead } : i))
  }

  const confirmDelete = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id))
    if (selected?.id === id) setSelected(null)
    setDeleteId(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Inquiries</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {counts.all} total · <span style={{ color: '#FF5A5F' }} className="font-semibold">{counts.unread} unread</span>
          </p>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'New',        value: counts.new,       color: '#FF5A5F', bg: 'rgba(255,90,95,0.08)' },
          { label: 'In Progress', value: counts.contacted, color: '#B45309', bg: 'rgba(245,158,11,0.08)' },
          { label: 'Closed',     value: counts.closed,    color: '#6A9739', bg: 'rgba(106,151,57,0.08)' },
          { label: 'Unread',     value: counts.unread,    color: '#293237', bg: 'rgba(41,50,55,0.06)' },
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
                  placeholder="Search by name, phone, property…"
                  className="bg-transparent outline-none text-sm w-full" />
                {search && (
                  <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {(['all', 'new', 'contacted', 'closed'] as const).map(s => (
                  <button key={s}
                    onClick={() => setStatusFilter(s)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize"
                    style={statusFilter === s
                      ? { backgroundColor: '#6A9739', color: 'white', borderColor: '#6A9739' }
                      : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }}>
                    {s === 'all' ? 'All' : s === 'contacted' ? 'In Progress' : s}
                    <span className="ml-1.5 opacity-75">({counts[s === 'all' ? 'all' : s]})</span>
                  </button>
                ))}
                <button
                  onClick={() => setReadFilter(readFilter === 'unread' ? 'all' : 'unread')}
                  className="ml-auto px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1"
                  style={readFilter === 'unread'
                    ? { backgroundColor: '#FF5A5F', color: 'white', borderColor: '#FF5A5F' }
                    : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }}>
                  <Filter className="w-3 h-3" /> Unread only
                </button>
              </div>
            </div>

            {/* List */}
            {filtered.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No inquiries match your filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[70vh] overflow-y-auto">
                {filtered.map((i) => {
                  const badge = STATUS_BADGE[i.status]
                  const ContactIcon = CONTACT_ICON[i.preferredContact]
                  const isActive = selected?.id === i.id
                  return (
                    <button
                      key={i.id}
                      onClick={() => openInquiry(i)}
                      className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                      style={isActive ? { backgroundColor: 'rgba(106,151,57,0.05)' } : {}}>
                      <div className="flex items-start gap-3">
                        {/* Unread indicator */}
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
                              <span className={`font-${i.isRead ? 'medium' : 'bold'} text-gray-900 truncate`}>
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
                            {i.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {i.city}
                              </span>
                            )}
                          </div>

                          {i.propertyTitle && (
                            <div className="text-[11px] mb-1.5" style={{ color: '#6A9739' }}>
                              re: {i.propertyTitle}
                            </div>
                          )}

                          <p className="text-sm text-gray-600 line-clamp-2 leading-snug">
                            {i.message}
                          </p>
                        </div>
                      </div>
                    </button>
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
                      style={{ backgroundColor: STATUS_BADGE[selected.status].bg, color: STATUS_BADGE[selected.status].color }}>
                      {STATUS_BADGE[selected.status].label}
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

                {/* Linked property */}
                {selected.propertyId && (
                  <Link to={`/properties/${selected.propertyId}`} target="_blank"
                    className="flex items-center gap-3 p-3 rounded-xl border transition-all"
                    style={{ borderColor: 'rgba(106,151,57,0.3)', backgroundColor: 'rgba(106,151,57,0.05)' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#6A9739', color: 'white' }}>
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: '#6A9739' }}>About Property</div>
                      <div className="text-sm font-medium text-gray-900 truncate">{selected.propertyTitle}</div>
                    </div>
                  </Link>
                )}

                {/* Message */}
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1.5">Message</div>
                  <div className="rounded-xl p-4 text-sm text-gray-700 leading-relaxed border-l-4 border-gray-100"
                    style={{ backgroundColor: '#FAFAF8', borderColor: '#FF5A5F' }}>
                    {selected.message}
                  </div>
                </div>

                {/* Internal notes */}
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1.5">Internal Notes</div>
                  <textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    onBlur={saveNote}
                    rows={3}
                    placeholder="Add notes about this inquiry — calls, follow-ups, status…"
                    className="input-field resize-none text-sm" />
                </div>
              </div>

              {/* Action footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => updateStatus(selected.id, 'new')}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors"
                    style={selected.status === 'new'
                      ? { backgroundColor: '#FF5A5F', color: 'white', borderColor: '#FF5A5F' }
                      : { backgroundColor: 'white', color: '#FF5A5F', borderColor: 'rgba(255,90,95,0.3)' }}>
                    New
                  </button>
                  <button onClick={() => updateStatus(selected.id, 'contacted')}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors"
                    style={selected.status === 'contacted'
                      ? { backgroundColor: '#B45309', color: 'white', borderColor: '#B45309' }
                      : { backgroundColor: 'white', color: '#B45309', borderColor: 'rgba(180,83,9,0.3)' }}>
                    In Progress
                  </button>
                  <button onClick={() => updateStatus(selected.id, 'closed')}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors"
                    style={selected.status === 'closed'
                      ? { backgroundColor: '#6A9739', color: 'white', borderColor: '#6A9739' }
                      : { backgroundColor: 'white', color: '#6A9739', borderColor: 'rgba(106,151,57,0.3)' }}>
                    Closed
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleRead(selected.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border bg-white hover:bg-gray-50 text-gray-700">
                    {selected.isRead ? <Circle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    Mark as {selected.isRead ? 'unread' : 'read'}
                  </button>
                  <button onClick={() => setDeleteId(selected.id)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Delete Inquiry?</h3>
            <p className="text-gray-500 text-sm mb-5">
              This will permanently remove the inquiry from your records.
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
