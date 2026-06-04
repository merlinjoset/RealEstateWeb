import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Home, ClipboardList, MessageSquare, Users, TrendingUp, Plus, Eye, Phone,
  Loader2, AlertCircle, UserPlus, UserCheck,
} from 'lucide-react'
import { propertiesApi, inquiriesApi, usersApi } from '../../services/api'

function formatLakhs(amount: number) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`
  return `₹${amount.toLocaleString('en-IN')}`
}

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

export default function DashboardPage() {
  // ── Live data — shares cache keys with NotificationsBell + AdminLayout
  //    badges, so most of these are warm by the time the dashboard mounts.
  const totalPropertiesQuery = useQuery({
    queryKey: ['admin-dashboard', 'total-properties'],
    // page=1, pageSize=1 is the cheapest way to read the .total from
    // a paginated endpoint without pulling all rows.
    queryFn: () => propertiesApi.getAll({ page: 1, pageSize: 1 }),
    staleTime: 60_000,
  })

  const pendingQuery = useQuery({
    queryKey: ['admin-notifications', 'pending'],
    queryFn: propertiesApi.getPending,
    refetchInterval: 60_000,
    staleTime: 30_000,
  })

  const inquiriesQuery = useQuery({
    queryKey: ['admin-dashboard', 'inquiries'],
    queryFn: inquiriesApi.getAll,
    refetchInterval: 60_000,
    staleTime: 30_000,
  })

  const unreadInquiriesQuery = useQuery({
    queryKey: ['admin-notifications', 'unread-inquiries'],
    queryFn: inquiriesApi.getUnread,
    refetchInterval: 60_000,
    staleTime: 30_000,
  })

  const usersQuery = useQuery({
    queryKey: ['admin-dashboard', 'users'],
    queryFn: () => usersApi.getAll(),
    staleTime: 60_000,
  })

  const totalProperties = totalPropertiesQuery.data?.total ?? 0
  const pendingList = Array.isArray(pendingQuery.data) ? pendingQuery.data : []
  const inquiries = Array.isArray(inquiriesQuery.data) ? inquiriesQuery.data : []
  const unreadCount = Array.isArray(unreadInquiriesQuery.data) ? unreadInquiriesQuery.data.length : 0
  const totalUsers = usersQuery.data?.total ?? usersQuery.data?.counts.all ?? 0
  const activeUsers = usersQuery.data?.counts.active ?? 0

  const anyLoading =
    totalPropertiesQuery.isLoading || pendingQuery.isLoading ||
    inquiriesQuery.isLoading || unreadInquiriesQuery.isLoading || usersQuery.isLoading
  const anyError =
    totalPropertiesQuery.isError || pendingQuery.isError ||
    inquiriesQuery.isError || unreadInquiriesQuery.isError || usersQuery.isError

  const stats = [
    {
      icon: Home, label: 'Total Properties',
      value: totalProperties,
      hint: totalProperties === 0 ? 'No listings yet' : 'Live count from API',
      color: 'bg-blue-50 text-blue-700', border: 'border-blue-100',
    },
    {
      icon: ClipboardList, label: 'Pending Approval',
      value: pendingList.length,
      hint: pendingList.length > 0 ? 'Needs review' : 'All caught up',
      color: 'bg-orange-50 text-orange-700', border: 'border-orange-100',
    },
    {
      icon: MessageSquare, label: 'Unread Inquiries',
      value: unreadCount,
      hint: unreadCount > 0 ? 'Open & respond' : 'Inbox clear',
      color: 'bg-green-50 text-green-700', border: 'border-green-100',
    },
    {
      icon: Users, label: 'Registered Users',
      value: totalUsers,
      hint: `${activeUsers} active`,
      color: 'bg-purple-50 text-purple-700', border: 'border-purple-100',
    },
  ]

  // Latest 5 pending (the API already sorts by CreatedAt desc)
  const recentPending = pendingList.slice(0, 5)
  // Latest 5 inquiries
  const recentInquiries = [...inquiries]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Dashboard Overview
            {anyLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {anyError ? 'Some panels failed to load — check the admin role / sign in again.' : 'Live data, refreshed every minute.'}
          </p>
        </div>
        <Link
          to="/admin/add-property"
          className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-colors"
          style={{ backgroundColor: '#6A9739' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#547a2d')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6A9739')}
        >
          <Plus className="w-4 h-4" /> Add Property
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, hint, color, border }) => (
          <div key={label} className={`bg-white rounded-xl p-5 border ${border} shadow-sm`}>
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${color} mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
            <div className="text-xs text-gray-400 mt-1">{hint}</div>
          </div>
        ))}
      </div>

      {/* === Pending approvals === */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-900">Pending Approvals</h3>
            <p className="text-xs text-gray-400 mt-0.5">Properties awaiting review (latest 5)</p>
          </div>
          <Link to="/admin/pending" className="text-sm font-medium hover:underline flex items-center gap-1" style={{ color: '#6A9739' }}>
            View all <TrendingUp className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingQuery.isLoading ? (
          <DashboardLoading />
        ) : pendingQuery.isError ? (
          <DashboardError onRetry={() => pendingQuery.refetch()} />
        ) : recentPending.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-400">
            Approval queue is empty. New seller submissions will appear here.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentPending.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">{item.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                    <span>{item.areaInCents} cents</span>
                    <span>·</span>
                    <span style={{ color: '#FF5A5F' }} className="font-semibold">{formatLakhs(item.totalPrice)}</span>
                    <span>·</span>
                    <span>{item.city}</span>
                    <span>·</span>
                    <span>by {item.submittedByName ?? 'Anon'}</span>
                    <span>·</span>
                    <span>{timeAgo(item.createdAt)}</span>
                    {item.assignedToVerifyUserId != null ? (
                      <span className="inline-flex items-center gap-1" style={{ color: '#4F46E5' }}>
                        · <UserCheck className="w-3 h-3" /> {item.assignedToVerifyName}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1" style={{ color: '#B45309' }}>
                        · <UserPlus className="w-3 h-3" /> Unassigned
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  to={`/admin/pending/${item.id}`}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shrink-0"
                  title="Review"
                >
                  <Eye className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* === Recent inquiries === */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-900">Recent Inquiries</h3>
            <p className="text-xs text-gray-400 mt-0.5">Latest 5 buyer messages</p>
          </div>
          <Link to="/admin/inquiries" className="text-sm font-medium hover:underline" style={{ color: '#6A9739' }}>
            View all
          </Link>
        </div>

        {inquiriesQuery.isLoading ? (
          <DashboardLoading />
        ) : inquiriesQuery.isError ? (
          <DashboardError onRetry={() => inquiriesQuery.refetch()} />
        ) : recentInquiries.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-400">
            No inquiries yet. They'll appear here when buyers reach out.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentInquiries.map((inq) => (
              <div key={inq.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700 shrink-0">
                  {inq.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm flex items-center gap-2">
                    {inq.name}
                    {!inq.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#FF5A5F' }} />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {inq.propertyTitle ?? inq.message.slice(0, 80)}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-medium text-gray-700">{inq.phone}</div>
                  <div className="text-xs text-gray-400">{timeAgo(inq.createdAt)}</div>
                </div>
                <a
                  href={`tel:${inq.phone.replace(/\s/g, '')}`}
                  className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                  style={{ backgroundColor: 'rgba(255,90,95,0.08)', color: '#FF5A5F' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,90,95,0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,90,95,0.08)')}
                >
                  <Phone className="w-3 h-3" /> Call
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DashboardLoading() {
  return (
    <div className="px-5 py-10 text-center text-gray-400">
      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
      <p className="text-sm">Loading…</p>
    </div>
  )
}

function DashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="px-5 py-10 text-center">
      <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
      <p className="text-sm text-red-600 mb-2">Failed to load.</p>
      <button onClick={onRetry} className="text-xs font-semibold underline" style={{ color: '#FF5A5F' }}>
        Try again
      </button>
    </div>
  )
}
