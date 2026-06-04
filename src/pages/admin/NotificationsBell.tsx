import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Bell, ClipboardList, MessageSquare, ArrowRight, Inbox, Loader2,
} from 'lucide-react'
import { propertiesApi, inquiriesApi } from '../../services/api'

/**
 * Admin notification bell. Two live feeds, no new backend:
 *  1. Pending approvals  → GET /api/properties/pending
 *  2. Unread inquiries   → GET /api/inquiries?unreadOnly=true
 *
 * Auto-refreshes every 60s. Red dot is shown only when there's something
 * to look at. Clicking an item routes to the matching admin page.
 */
export default function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const pendingQuery = useQuery({
    queryKey: ['admin-notifications', 'pending'],
    queryFn: propertiesApi.getPending,
    refetchInterval: 60_000,
    staleTime: 30_000,
  })

  const inquiriesQuery = useQuery({
    queryKey: ['admin-notifications', 'unread-inquiries'],
    queryFn: inquiriesApi.getUnread,
    refetchInterval: 60_000,
    staleTime: 30_000,
  })

  // Defensively coerce both queries to arrays — if either endpoint ever
  // returns a paginated envelope or null, we won't crash on `.slice()` / `.length`.
  const pendingItems = Array.isArray(pendingQuery.data) ? pendingQuery.data : []
  const inquiryItems = Array.isArray(inquiriesQuery.data) ? inquiriesQuery.data : []
  const pendingCount = pendingItems.length
  const inquiryCount = inquiryItems.length
  const totalCount = pendingCount + inquiryCount
  const isLoading = pendingQuery.isLoading || inquiriesQuery.isLoading

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label={`Notifications${totalCount > 0 ? ` (${totalCount} unread)` : ''}`}
      >
        <Bell className="w-4 h-4" />
        {totalCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" style={{ color: '#FF5A5F' }} />
              <span className="text-sm font-bold text-gray-900">Notifications</span>
            </div>
            <span className="text-xs text-gray-400">
              {isLoading
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : `${totalCount} new`}
            </span>
          </div>

          {/* Sections */}
          <div className="max-h-[60vh] overflow-y-auto">
            <Section
              title="Pending approvals"
              icon={ClipboardList}
              accent="#F59E0B"
              count={pendingCount}
              viewAllTo="/admin/pending"
              onItemClick={() => setOpen(false)}
              items={pendingItems.slice(0, 5).map((p) => ({
                key: p.id,
                to: `/admin/pending/${p.id}`,
                title: p.title,
                subtitle: `${p.city ?? ''} · ${p.areaInCents} cents`,
              }))}
            />

            <Section
              title="New inquiries"
              icon={MessageSquare}
              accent="#6A9739"
              count={inquiryCount}
              viewAllTo="/admin/inquiries"
              onItemClick={() => setOpen(false)}
              items={inquiryItems.slice(0, 5).map((i) => ({
                key: i.id,
                to: '/admin/inquiries',
                title: i.name,
                subtitle: i.propertyTitle
                  ? `→ ${i.propertyTitle}`
                  : (i.message?.slice(0, 60) ?? ''),
              }))}
            />

            {totalCount === 0 && !isLoading && (
              <div className="px-4 py-10 text-center text-gray-400">
                <Inbox className="w-7 h-7 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">You're all caught up.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Section({
  title, icon: Icon, accent, count, items, viewAllTo, onItemClick,
}: {
  title: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  accent: string
  count: number
  items: Array<{ key: number; to: string; title: string; subtitle: string }>
  viewAllTo: string
  onItemClick: () => void
}) {
  if (count === 0) return null
  return (
    <div className="border-b border-gray-50 last:border-b-0">
      <div className="px-4 py-2 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
          <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500">{title}</span>
        </div>
        <span className="text-[11px] font-bold px-1.5 rounded-full"
          style={{ backgroundColor: `${accent}1A`, color: accent }}>
          {count}
        </span>
      </div>

      <ul>
        {items.map((it) => (
          <li key={it.key}>
            <Link
              to={it.to}
              onClick={onItemClick}
              className="block px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <div className="text-sm font-medium text-gray-900 truncate">{it.title}</div>
              {it.subtitle && (
                <div className="text-xs text-gray-500 truncate mt-0.5">{it.subtitle}</div>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <Link
        to={viewAllTo}
        onClick={onItemClick}
        className="flex items-center justify-end gap-1 px-4 py-2 text-[11px] font-semibold hover:bg-gray-50 transition-colors"
        style={{ color: accent }}
      >
        View all <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  )
}
