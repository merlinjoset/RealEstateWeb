import { Link, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ClipboardList, MessageSquare, MapPin, Phone, Calendar, Inbox,
  Loader2, AlertCircle, Eye, Video, Ruler, ExternalLink,
} from 'lucide-react'
import { inquiriesApi, propertiesApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { VIDEO_PROMOTION_FEE_RATE } from '../../types'

function formatLakhs(amount: number) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`
  return `₹${amount.toLocaleString('en-IN')}`
}

function timeAgo(iso: string | null | undefined) {
  if (!iso) return '—'
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

export default function MyWorkPage() {
  const { user } = useAuth()

  // My Work is the Employee-only daily queue. If an Admin lands here via
  // a stale link or typed URL, bounce them to their dashboard instead of
  // showing them an empty page they shouldn't see.
  if (user?.role === 'Admin') return <Navigate to="/admin" replace />

  const propertiesQuery = useQuery({
    queryKey: ['my-work', 'properties'],
    queryFn: propertiesApi.getAssignedToVerify,
    refetchInterval: 60_000,
  })

  const inquiriesQuery = useQuery({
    queryKey: ['my-work', 'inquiries'],
    queryFn: inquiriesApi.getMine,
    refetchInterval: 60_000,
  })

  const properties = propertiesQuery.data ?? []
  const inquiries = inquiriesQuery.data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          My Work
          {(propertiesQuery.isFetching || inquiriesQuery.isFetching) &&
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Hi {user?.firstName} — here's what's on your plate today.
        </p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={ClipboardList}
          label="Properties to verify"
          value={properties.length}
          hint={properties.length === 0 ? 'Nothing assigned yet' : 'Site visits + document checks'}
          color="#EA2D34"
        />
        <StatCard
          icon={MessageSquare}
          label="Inquiries assigned to me"
          value={inquiries.length}
          hint={inquiries.length === 0 ? 'Inbox clear' : 'Buyers waiting on you'}
          color="#6A9739"
        />
      </div>

      {/* ── Properties to verify ── */}
      <Section
        title="Properties to verify"
        icon={ClipboardList}
        viewAllTo="/admin/pending"
        viewAllLabel="See full pending queue"
        isLoading={propertiesQuery.isLoading}
        isError={propertiesQuery.isError}
        onRetry={() => propertiesQuery.refetch()}
        empty={properties.length === 0 ? 'Nothing assigned to you yet. The admin will notify you via WhatsApp / SMS when a property lands on your queue.' : null}
      >
        <div className="divide-y divide-gray-50">
          {properties.map((p) => (
            <div key={p.id} className="px-5 py-3.5 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm flex items-center gap-2 flex-wrap">
                  {p.title}
                  {p.marketingPlan === 'VideoPromotion' && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold text-white"
                      style={{ backgroundColor: '#EA2D34' }}
                      title={`2% brokerage on sale: ${formatLakhs(p.totalPrice * VIDEO_PROMOTION_FEE_RATE)}`}>
                      <Video className="w-2.5 h-2.5" /> Video · 2%
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {p.city}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Ruler className="w-3 h-3" /> {p.areaInCents} cents
                  </span>
                  <span style={{ color: '#EA2D34' }} className="font-semibold">{formatLakhs(p.totalPrice)}</span>
                  <span>Seller: {p.submittedByName ?? 'Anon'}</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Assigned {timeAgo(p.assignedToVerifyAt)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                {p.submittedByPhone && (
                  <a
                    href={`tel:${p.submittedByPhone.replace(/\s/g, '')}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
                    style={{ backgroundColor: 'rgba(255,90,95,0.08)', color: '#EA2D34' }}>
                    <Phone className="w-3 h-3" /> Call seller
                  </a>
                )}
                <Link
                  to={`/admin/pending/${p.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors text-white"
                  style={{ backgroundColor: '#6A9739' }}>
                  <Eye className="w-3 h-3" /> Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Inquiries assigned to me ── */}
      <Section
        title="Inquiries assigned to me"
        icon={MessageSquare}
        viewAllTo="/admin/inquiries"
        viewAllLabel="See all inquiries"
        isLoading={inquiriesQuery.isLoading}
        isError={inquiriesQuery.isError}
        onRetry={() => inquiriesQuery.refetch()}
        empty={inquiries.length === 0 ? "No inquiries on your queue right now. New ones will appear here when an admin assigns them." : null}
      >
        <div className="divide-y divide-gray-50">
          {inquiries.map((inq) => (
            <div key={inq.id} className="px-5 py-3.5 flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700 shrink-0">
                {inq.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm flex items-center gap-2">
                  {inq.name}
                  {!inq.isRead && (
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#EA2D34' }} />
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-snug">
                  {inq.message}
                </div>
                <div className="text-[11px] text-gray-400 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                  <span className="inline-flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {inq.phone}
                  </span>
                  {inq.propertyTitle && (
                    <span className="inline-flex items-center gap-1" style={{ color: '#6A9739' }}>
                      <ExternalLink className="w-3 h-3" /> {inq.propertyTitle}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {timeAgo(inq.createdAt)}
                  </span>
                </div>
              </div>
              <a
                href={`tel:${inq.phone.replace(/\s/g, '')}`}
                className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                style={{ backgroundColor: 'rgba(255,90,95,0.08)', color: '#EA2D34' }}>
                <Phone className="w-3 h-3" /> Call
              </a>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

function StatCard({
  icon: Icon, label, value, hint, color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  hint: string
  color: string
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}15`, color }}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-bold tracking-tight" style={{ color: '#111111' }}>{value}</div>
          <div className="text-sm text-gray-500 mt-0.5">{label}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">{hint}</div>
        </div>
      </div>
    </div>
  )
}

function Section({
  title, icon: Icon, viewAllTo, viewAllLabel, isLoading, isError, onRetry, empty, children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  viewAllTo: string
  viewAllLabel: string
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  empty: string | null
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-400" />
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <Link to={viewAllTo} className="text-xs font-medium hover:underline" style={{ color: '#6A9739' }}>
          {viewAllLabel} →
        </Link>
      </div>

      {isLoading ? (
        <div className="px-5 py-10 text-center text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
          <p className="text-sm">Loading…</p>
        </div>
      ) : isError ? (
        <div className="px-5 py-10 text-center">
          <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-600 mb-2">Failed to load.</p>
          <button onClick={onRetry} className="text-xs font-semibold underline" style={{ color: '#EA2D34' }}>
            Try again
          </button>
        </div>
      ) : empty ? (
        <div className="px-5 py-10 text-center">
          <Inbox className="w-7 h-7 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 max-w-md mx-auto">{empty}</p>
        </div>
      ) : (
        children
      )}
    </div>
  )
}
