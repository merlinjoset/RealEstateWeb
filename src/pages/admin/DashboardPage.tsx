import { Link } from 'react-router-dom'
import { Home, ClipboardList, MessageSquare, Users, TrendingUp, Plus, Eye, Check, X } from 'lucide-react'

const STATS = [
  { icon: Home, label: 'Total Properties', value: 434, change: '+12 this month', color: 'bg-blue-50 text-blue-700', border: 'border-blue-100' },
  { icon: ClipboardList, label: 'Pending Approval', value: 4, change: 'Needs action', color: 'bg-orange-50 text-orange-700', border: 'border-orange-100' },
  { icon: MessageSquare, label: 'New Inquiries', value: 7, change: '+3 today', color: 'bg-green-50 text-green-700', border: 'border-green-100' },
  { icon: Users, label: 'Registered Users', value: 89, change: '+5 this week', color: 'bg-purple-50 text-purple-700', border: 'border-purple-100' },
]

const PENDING = [
  { id: 101, title: '10 Cents Open Land - Nagercoil', submittedBy: 'Rajan K.', date: '2024-01-20', price: '₹15L', area: '10 cents', city: 'Nagercoil' },
  { id: 102, title: '5 Cents Residential Plot - Marthandam', submittedBy: 'Priya S.', date: '2024-01-19', price: '₹7.5L', area: '5 cents', city: 'Marthandam' },
  { id: 103, title: '25 Cents Agricultural Land - Thuckalay', submittedBy: 'Xavier J.', date: '2024-01-18', price: '₹18L', area: '25 cents', city: 'Thuckalay' },
  { id: 104, title: '8 Cents Plot Near Beach - Kanyakumari', submittedBy: 'Maria A.', date: '2024-01-17', price: '₹16L', area: '8 cents', city: 'Kanyakumari' },
]

const RECENT_INQUIRIES = [
  { id: 1, name: 'Kumar R.', phone: '+91 98765 43210', property: '15 Cents Land - Nagercoil', time: '2 hours ago' },
  { id: 2, name: 'Selvi M.', phone: '+91 87654 32109', property: '10 Cents Plot - Marthandam', time: '5 hours ago' },
  { id: 3, name: 'Thomas J.', phone: '+91 76543 21098', property: '50 Cents Farm - Thuckalay', time: 'Yesterday' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, Admin</p>
        </div>
        <Link
          to="/admin/add-property"
          className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-colors"
          style={{ backgroundColor: '#6A9739' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#547a2d')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#6A9739')}
        >
          <Plus className="w-4 h-4" /> Add Property
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ icon: Icon, label, value, change, color, border }) => (
          <div key={label} className={`bg-white rounded-xl p-5 border ${border} shadow-sm`}>
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${color} mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
            <div className="text-xs text-gray-400 mt-1">{change}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-900">Pending Approvals</h3>
            <p className="text-xs text-gray-400 mt-0.5">Client-submitted properties awaiting review</p>
          </div>
          <Link to="/admin/pending" className="text-sm font-medium hover:underline flex items-center gap-1" style={{ color: '#6A9739' }}>
            View all <TrendingUp className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {PENDING.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">{item.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {item.area} · {item.price} · {item.city} · by {item.submittedBy} on {item.date}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/admin/pending/${item.id}`}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Review"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <button
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
                  style={{ backgroundColor: 'rgba(106,151,57,0.1)', color: '#6A9739' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(106,151,57,0.2)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(106,151,57,0.1)')}
                  title="Approve"
                >
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors"
                  title="Reject"
                >
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Inquiries</h3>
          <Link to="/admin/inquiries" className="text-sm font-medium hover:underline" style={{ color: '#6A9739' }}>View all</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {RECENT_INQUIRIES.map((inq) => (
            <div key={inq.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700 shrink-0">
                {inq.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm">{inq.name}</div>
                <div className="text-xs text-gray-500">{inq.property}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-medium text-gray-700">{inq.phone}</div>
                <div className="text-xs text-gray-400">{inq.time}</div>
              </div>
              <a
                href={`tel:${inq.phone}`}
                className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                style={{ backgroundColor: 'rgba(255,90,95,0.08)', color: '#FF5A5F' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,90,95,0.15)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,90,95,0.08)')}
              >
                Call
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
