import { Navigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Plus, Edit2, Eye, MapPin, Ruler, Loader2, AlertCircle, Building2,
  CheckCircle2, Clock, XCircle, Star,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { propertiesApi, resolveMediaUrl } from '../services/api'
import PageHeader from '../components/layout/PageHeader'
import type { Property } from '../types'

function formatLakhs(amount: number) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`
  return `₹${amount.toLocaleString('en-IN')}`
}

const STATUS_CONFIG = {
  Pending:  { label: 'Pending review', icon: Clock,        bg: 'rgba(245,158,11,0.10)', color: '#B45309' },
  Approved: { label: 'Live',           icon: CheckCircle2, bg: 'rgba(106,151,57,0.10)', color: '#6A9739' },
  Rejected: { label: 'Rejected',       icon: XCircle,      bg: 'rgba(220,38,38,0.10)',  color: '#DC2626' },
}

export default function MyPropertiesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  const query = useQuery({
    queryKey: ['my-properties'],
    queryFn: () => propertiesApi.getMine(),
    enabled: isAuthenticated,
  })

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#6A9739' }} />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: '/my-properties' }} replace />
  }

  const items = query.data ?? []

  // Counts by approval status
  const counts = items.reduce(
    (acc, p) => {
      const key = (p as any).approvalStatus ?? 'Approved'
      if (key === 'Pending') acc.pending++
      else if (key === 'Approved') acc.approved++
      else if (key === 'Rejected') acc.rejected++
      return acc
    },
    { pending: 0, approved: 0, rejected: 0 },
  )

  return (
    <main className="min-h-screen pb-16" style={{ backgroundColor: '#F8F6F3' }}>
      <PageHeader
        eyebrow="Your listings"
        title="My Properties"
        highlight="My"
        description={`Welcome back, ${user.firstName}. Manage the listings you've submitted — track approvals, edit details, and respond when buyers reach out.`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2">
        {/* Action row + stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Live', value: counts.approved, color: '#6A9739', bg: 'rgba(106,151,57,0.10)' },
              { label: 'Pending', value: counts.pending, color: '#B45309', bg: 'rgba(245,158,11,0.10)' },
              { label: 'Rejected', value: counts.rejected, color: '#DC2626', bg: 'rgba(220,38,38,0.10)' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className="px-4 py-2 rounded-lg flex items-center gap-2"
                style={{ backgroundColor: bg }}>
                <span className="text-lg font-bold" style={{ color }}>{value}</span>
                <span className="text-xs font-medium" style={{ color }}>{label}</span>
              </div>
            ))}
          </div>

          <Link to="/sell"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm transition-colors"
            style={{ backgroundColor: '#EA2D34' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e04a4f')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#EA2D34')}>
            <Plus className="w-4 h-4" /> Add New Property
          </Link>
        </div>

        {/* Loading */}
        {query.isLoading && (
          <div className="py-20 text-center text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" />
            <p className="text-sm">Loading your properties…</p>
          </div>
        )}

        {/* Error */}
        {query.isError && (
          <div className="py-20 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
            <p className="text-sm text-red-600 font-medium">Failed to load your properties.</p>
            <button onClick={() => query.refetch()}
              className="mt-3 text-xs font-semibold underline" style={{ color: '#EA2D34' }}>
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!query.isLoading && !query.isError && items.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-5"
              style={{ backgroundColor: 'rgba(106,151,57,0.10)', color: '#6A9739' }}>
              <Building2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2 tracking-tight" style={{ color: '#111111' }}>
              No properties yet
            </h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
              Submit your first listing in 2 minutes. Our team will review it within 24 hours
              and you'll receive an SMS the moment it goes live.
            </p>
            <Link to="/sell"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-sm transition-colors"
              style={{ backgroundColor: '#EA2D34' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e04a4f')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#EA2D34')}>
              <Plus className="w-4 h-4" /> Submit Your First Property
            </Link>
          </div>
        )}

        {/* Property cards */}
        {!query.isLoading && !query.isError && items.length > 0 && (
          <div className="space-y-4">
            {items.map((p) => (
              <PropertyRow key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

/* --------------- Row card --------------- */

function PropertyRow({ property }: { property: Property }) {
  const status = ((property as any).approvalStatus ?? 'Approved') as keyof typeof STATUS_CONFIG
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.Approved
  const StatusIcon = statusCfg.icon
  const cover = property.images?.[0] ? resolveMediaUrl(property.images[0]) : null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
        {/* Cover */}
        <div className="md:col-span-3 relative">
          <div className="aspect-video md:aspect-square rounded-xl overflow-hidden bg-gray-100">
            <img
              src={cover || '/noimage.svg'}
              alt={property.title}
              onError={(e) => { e.currentTarget.src = '/noimage.svg' }}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
            style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>
            <StatusIcon className="w-2.5 h-2.5" />
            {statusCfg.label}
          </span>
          {property.isFeatured && (
            <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full text-white"
              style={{ backgroundColor: '#F59E0B' }}>
              <Star className="w-2.5 h-2.5" fill="currentColor" /> Featured
            </span>
          )}
        </div>

        {/* Body */}
        <div className="md:col-span-6 min-w-0">
          <h3 className="font-bold text-lg leading-tight mb-1" style={{ color: '#111111' }}>
            {property.title}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            {property.address}, {property.city}, {property.district}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xl font-bold" style={{ color: '#EA2D34' }}>
              {formatLakhs(property.totalPrice)}
            </span>
            <span className="text-sm text-gray-300">·</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(106,151,57,0.10)', color: '#6A9739' }}>
              <Ruler className="w-3 h-3" /> {property.areaInCents} cents
            </span>
            {property.pricePerCent && (
              <span className="text-xs text-gray-500">
                {formatLakhs(property.pricePerCent)}/cent
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mt-3 line-clamp-2">{property.description}</p>

          {status === 'Rejected' && (property as any).rejectionReason && (
            <div className="mt-3 p-2 rounded-lg text-xs"
              style={{ backgroundColor: 'rgba(220,38,38,0.06)', color: '#991B1B' }}>
              <strong>Reason:</strong> {(property as any).rejectionReason}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="md:col-span-3 flex md:flex-col items-stretch justify-end gap-2 md:border-l md:pl-4 border-gray-100">
          <Link to={`/properties/${property.id}`}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors"
            style={{ borderColor: '#CFD8DC', color: '#374151' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FAFAF8')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
            <Eye className="w-3.5 h-3.5" /> View
          </Link>
          <Link to={`/admin/edit-property/${property.id}`}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-white transition-colors"
            style={{ backgroundColor: '#6A9739' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#547a2d')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#6A9739')}>
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </Link>
        </div>
      </div>
    </div>
  )
}
