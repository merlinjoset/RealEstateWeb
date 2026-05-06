import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Check, X, MapPin, Ruler, User, Calendar, Phone } from 'lucide-react'

type Status = 'pending' | 'approved' | 'rejected'

interface PendingProperty {
  id: number
  title: string
  city: string
  areaInCents: number
  totalPrice: number
  propertyType: string
  submittedBy: string
  submitterPhone: string
  submittedAt: string
  status: Status
  description: string
  address: string
  features: string[]
}

function formatLakhs(amount: number) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`
  return `₹${amount.toLocaleString('en-IN')}`
}

const INITIAL_PENDING: PendingProperty[] = [
  {
    id: 101, title: '10 Cents Open Land - Nagercoil', city: 'Nagercoil', areaInCents: 10,
    totalPrice: 1500000, propertyType: 'Open Land', submittedBy: 'Rajan K.',
    submitterPhone: '+91 98765 43210', submittedAt: '2024-01-20',
    status: 'pending', description: 'Good land near main road with clear documents.',
    address: 'Kottar, Nagercoil', features: ['Road Access', 'Clear Title'],
  },
  {
    id: 102, title: '5 Cents Residential Plot - Marthandam', city: 'Marthandam', areaInCents: 5,
    totalPrice: 750000, propertyType: 'Residential Plot', submittedBy: 'Priya S.',
    submitterPhone: '+91 87654 32109', submittedAt: '2024-01-19',
    status: 'pending', description: 'Corner plot with road frontage.',
    address: 'Town Center, Marthandam', features: ['Corner Plot', 'Road Access'],
  },
  {
    id: 103, title: '25 Cents Agricultural Land - Thuckalay', city: 'Thuckalay', areaInCents: 25,
    totalPrice: 1800000, propertyType: 'Agricultural', submittedBy: 'Xavier J.',
    submitterPhone: '+91 76543 21098', submittedAt: '2024-01-18',
    status: 'pending', description: 'Fertile land near river, water source available.',
    address: 'Pechipparai Road, Thuckalay', features: ['Water Source', 'Electricity'],
  },
  {
    id: 104, title: '8 Cents Plot Near Beach - Kanyakumari', city: 'Kanyakumari', areaInCents: 8,
    totalPrice: 1600000, propertyType: 'Residential Plot', submittedBy: 'Maria A.',
    submitterPhone: '+91 65432 10987', submittedAt: '2024-01-17',
    status: 'pending', description: 'Premium plot with sea view, close to tourist zone.',
    address: 'Beach Road, Kanyakumari', features: ['Road Access'],
  },
]

export default function PendingApprovalsPage() {
  const { id } = useParams<{ id?: string }>()
  const [items, setItems] = useState<PendingProperty[]>(INITIAL_PENDING)
  const [selected, setSelected] = useState<PendingProperty | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null)
  const [filter, setFilter] = useState<'all' | Status>('all')

  // Pre-select item when navigated with /admin/pending/:id
  useEffect(() => {
    if (id) {
      const numId = Number(id)
      const match = items.find(p => p.id === numId)
      if (match) setSelected(match)
    }
  }, [id, items])

  const approve = (id: number) => {
    setItems((prev) => prev.map((p) => p.id === id ? { ...p, status: 'approved' } : p))
    if (selected?.id === id) setSelected(null)
  }

  const reject = (id: number) => {
    setItems((prev) => prev.map((p) => p.id === id ? { ...p, status: 'rejected' } : p))
    setShowRejectModal(null)
    setRejectReason('')
    if (selected?.id === id) setSelected(null)
  }

  const displayed = items.filter((p) => filter === 'all' || p.status === filter)

  const counts = {
    all: items.length,
    pending: items.filter((p) => p.status === 'pending').length,
    approved: items.filter((p) => p.status === 'approved').length,
    rejected: items.filter((p) => p.status === 'rejected').length,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Pending Approvals</h2>
          <p className="text-sm text-gray-500 mt-0.5">Review and approve or reject client-submitted properties</p>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === s
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
              filter === s ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      <div className={`grid gap-5 ${selected ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
        <div className={selected ? 'lg:col-span-2' : ''}>
          <div className="space-y-3">
            {displayed.length === 0 && (
              <div className="bg-white rounded-xl p-10 text-center text-gray-400 shadow-sm border border-gray-100">
                No properties in this category.
              </div>
            )}

            {displayed.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-5 shadow-sm border transition-all cursor-pointer"
                style={selected?.id === item.id
                  ? { borderColor: '#FF5A5F', boxShadow: '0 0 0 2px rgba(255,90,95,0.15)' }
                  : { borderColor: '#f3f4f6' }}
                onClick={() => setSelected(selected?.id === item.id ? null : item)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        item.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        item.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {item.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Ruler className="w-3.5 h-3.5" /> {item.areaInCents} cents
                      </span>
                      <span className="font-semibold" style={{ color: '#FF5A5F' }}>{formatLakhs(item.totalPrice)}</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> {item.submittedBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {item.submittedAt}
                      </span>
                    </div>
                  </div>

                  {item.status === 'pending' && (
                    <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => approve(item.id)}
                        className="flex items-center gap-1.5 px-3 py-2 text-white text-sm font-semibold rounded-lg transition-colors"
                        style={{ backgroundColor: '#6A9739' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#547a2d')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#6A9739')}
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => setShowRejectModal(item.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selected && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Property Details</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Title</div>
                <div className="font-medium text-gray-900 mt-0.5">{selected.title}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Description</div>
                <div className="text-gray-600 mt-0.5 leading-relaxed">{selected.description}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Area</div>
                  <div className="font-medium text-gray-900 mt-0.5">{selected.areaInCents} cents</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Price</div>
                  <div className="font-semibold mt-0.5" style={{ color: '#FF5A5F' }}>{formatLakhs(selected.totalPrice)}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Address</div>
                <div className="text-gray-600 mt-0.5">{selected.address}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Submitted By</div>
                <div className="text-gray-900 mt-0.5">{selected.submittedBy}</div>
              </div>
              <a
                href={`tel:${selected.submitterPhone}`}
                className="flex items-center gap-2 w-full py-2 text-sm font-medium rounded-lg transition-colors justify-center"
                style={{ backgroundColor: 'rgba(255,90,95,0.08)', color: '#FF5A5F' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,90,95,0.15)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,90,95,0.08)')}
              >
                <Phone className="w-3.5 h-3.5" /> {selected.submitterPhone}
              </a>
              {selected.features.length > 0 && (
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Features</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.features.map((f) => (
                      <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{f}</span>
                    ))}
                  </div>
                </div>
              )}

              {selected.status === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => approve(selected.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-white text-sm font-semibold rounded-lg"
                    style={{ backgroundColor: '#6A9739' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#547a2d')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#6A9739')}
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => setShowRejectModal(selected.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border-2 border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showRejectModal !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-1">Reject Property</h3>
            <p className="text-gray-500 text-sm mb-4">Provide a reason for rejection (optional)</p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Insufficient documents, incorrect location details..."
              className="input-field resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(null)}
                className="flex-1 btn-ghost border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => reject(showRejectModal)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
              >
                <X className="w-4 h-4" /> Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
