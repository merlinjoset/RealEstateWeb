import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Eye, Users, CalendarDays, TrendingUp, TrendingDown, Loader2, AlertCircle, BarChart3,
} from 'lucide-react'
import { analyticsApi, type AnalyticsSummary } from '../../services/api'

const RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
]

function trend(current: number, previous: number): { pct: number; up: boolean } | null {
  if (!previous) return null
  const pct = Math.round(((current - previous) / previous) * 100)
  return { pct: Math.abs(pct), up: pct >= 0 }
}

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(30)
  const q = useQuery({
    queryKey: ['analytics-summary', days],
    queryFn: () => analyticsApi.getSummary(days),
    staleTime: 60_000,
  })

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" style={{ color: '#FF5A5F' }} /> Traffic
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Page views across the site over the selected period. Updated live from visitor activity.
          </p>
        </div>
        <div className="inline-flex items-center gap-1 border border-gray-200 rounded-xl p-1 bg-white self-start">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={days === r.days ? { backgroundColor: '#FF5A5F', color: 'white' } : { color: '#4B5563' }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {q.isLoading ? (
        <div className="text-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading traffic…</p>
        </div>
      ) : q.isError ? (
        <div className="text-center py-20">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-red-600 mb-2">Couldn't load analytics.</p>
          <button onClick={() => q.refetch()} className="text-xs font-semibold underline" style={{ color: '#FF5A5F' }}>
            Try again
          </button>
        </div>
      ) : q.data ? (
        <Dashboard data={q.data} days={days} />
      ) : null}
    </div>
  )
}

function Dashboard({ data, days }: { data: AnalyticsSummary; days: number }) {
  const t = trend(data.totalViews, data.viewsPreviousPeriod)
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Eye} label={`Page views (${days}d)`} value={data.totalViews} accent="#FF5A5F"
          footer={t ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: t.up ? '#16a34a' : '#dc2626' }}>
              {t.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {t.pct}% vs previous {days}d
            </span>
          ) : <span className="text-xs text-gray-400">No prior data to compare</span>} />
        <StatCard icon={Users} label="Unique visitors" value={data.uniqueVisitors} accent="#6A9739"
          footer={<span className="text-xs text-gray-400">Distinct browsers in period</span>} />
        <StatCard icon={CalendarDays} label="Views today" value={data.viewsToday} accent="#293237"
          footer={<span className="text-xs text-gray-400">Since 00:00 UTC</span>} />
      </div>

      {/* Daily chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Page views per day</h2>
        <DailyChart daily={data.daily} />
      </div>

      {/* Top pages + referrers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BreakdownCard title="Top pages" rows={data.topPages} empty="No page views yet." mono />
        <BreakdownCard title="Top referrers" rows={data.topReferrers} empty="No referrers yet." />
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent, footer }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  accent: string
  footer?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</span>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}1A`, color: accent }}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString('en-IN')}</div>
      <div className="mt-1.5">{footer}</div>
    </div>
  )
}

function DailyChart({ daily }: { daily: AnalyticsSummary['daily'] }) {
  const max = Math.max(1, ...daily.map((d) => d.count))
  return (
    <div className="flex items-end gap-[3px] h-40">
      {daily.map((d) => {
        const h = Math.round((d.count / max) * 100)
        const label = new Date(d.date + 'T00:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        return (
          <div key={d.date} className="flex-1 h-full flex items-end group relative" title={`${label}: ${d.count} views`}>
            <div
              className="w-full rounded-t transition-all group-hover:opacity-80"
              style={{ height: `${Math.max(h, d.count > 0 ? 4 : 1)}%`, backgroundColor: d.count > 0 ? '#FF5A5F' : '#E5E7EB' }}
            />
          </div>
        )
      })}
    </div>
  )
}

function BreakdownCard({ title, rows, empty, mono }: {
  title: string
  rows: AnalyticsSummary['topPages']
  empty: string
  mono?: boolean
}) {
  const max = Math.max(1, ...rows.map((r) => r.count))
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-sm font-bold text-gray-900 mb-4">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">{empty}</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((r) => (
            <div key={r.label} className="relative">
              <div className="flex items-center justify-between text-sm relative z-10 px-2 py-1">
                <span className={`truncate pr-3 ${mono ? 'font-mono text-xs text-gray-700' : 'text-gray-700'}`}>{r.label}</span>
                <span className="font-semibold text-gray-900 shrink-0">{r.count.toLocaleString('en-IN')}</span>
              </div>
              <div className="absolute inset-0 rounded-lg" style={{ width: `${(r.count / max) * 100}%`, backgroundColor: 'rgba(255,90,95,0.10)' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
