import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Video, MapPin, Ruler, Phone, User, Calendar, IndianRupee,
  Sparkles, ExternalLink, Search, ChevronRight,
} from 'lucide-react'
import { VIDEO_PROMOTION_FEE_RATE, type MarketingPlan } from '../../types'

/**
 * Dedicated tab for properties on the Video Promotion (paid) plan.
 * Highlights to the admin which listings generate brokerage so they can
 * prioritise the video shoot and follow-up calls.
 *
 * Mocked locally until the API call is wired (would be
 *   GET /api/properties?marketingPlan=VideoPromotion
 * once the backend filter is added).
 */

type VideoStage = 'awaiting_shoot' | 'shoot_scheduled' | 'editing' | 'published' | 'sold'

interface VideoListing {
  id: number
  title: string
  city: string
  areaInCents: number
  totalPrice: number
  propertyType: string
  submittedBy: string
  submitterPhone: string
  submittedAt: string
  stage: VideoStage
  marketingPlan: MarketingPlan   // always 'VideoPromotion' here, kept for clarity
}

function formatLakhs(amount: number) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`
  return `₹${amount.toLocaleString('en-IN')}`
}

const STAGE_META: Record<VideoStage, { label: string; color: string; bg: string }> = {
  awaiting_shoot:  { label: 'Awaiting shoot',  color: '#B45309', bg: 'rgba(245,158,11,0.10)' },
  shoot_scheduled: { label: 'Shoot scheduled', color: '#1E40AF', bg: 'rgba(30,64,175,0.10)' },
  editing:         { label: 'In editing',      color: '#7C3AED', bg: 'rgba(124,58,237,0.10)' },
  published:       { label: 'Published',       color: '#6A9739', bg: 'rgba(106,151,57,0.10)' },
  sold:            { label: 'Sold · 2% earned', color: '#FF5A5F', bg: 'rgba(255,90,95,0.10)' },
}

const MOCK_VIDEOS: VideoListing[] = [
  {
    id: 101, title: '10 Cents Open Land - Nagercoil', city: 'Nagercoil', areaInCents: 10,
    totalPrice: 1500000, propertyType: 'Open Land', submittedBy: 'Rajan K.',
    submitterPhone: '+91 98765 43210', submittedAt: '2024-01-20',
    stage: 'awaiting_shoot', marketingPlan: 'VideoPromotion',
  },
  {
    id: 103, title: '25 Cents Agricultural Land - Thuckalay', city: 'Thuckalay', areaInCents: 25,
    totalPrice: 1800000, propertyType: 'Agricultural', submittedBy: 'Xavier J.',
    submitterPhone: '+91 76543 21098', submittedAt: '2024-01-18',
    stage: 'shoot_scheduled', marketingPlan: 'VideoPromotion',
  },
  {
    id: 145, title: '18 Cents Highway-facing Plot - Colachel', city: 'Colachel', areaInCents: 18,
    totalPrice: 2700000, propertyType: 'Open Land', submittedBy: 'Karthik V.',
    submitterPhone: '+91 90876 54321', submittedAt: '2024-01-16',
    stage: 'editing', marketingPlan: 'VideoPromotion',
  },
  {
    id: 201, title: '12 Cents Plot with sea view - Kanyakumari', city: 'Kanyakumari', areaInCents: 12,
    totalPrice: 4200000, propertyType: 'Residential Plot', submittedBy: 'Priya S.',
    submitterPhone: '+91 87654 32109', submittedAt: '2024-01-15',
    stage: 'published', marketingPlan: 'VideoPromotion',
  },
  {
    id: 202, title: '40 Cents Coconut Estate - Marthandam', city: 'Marthandam', areaInCents: 40,
    totalPrice: 9500000, propertyType: 'Agricultural', submittedBy: 'Anand R.',
    submitterPhone: '+91 65432 10987', submittedAt: '2024-01-10',
    stage: 'sold', marketingPlan: 'VideoPromotion',
  },
]

const STAGE_FILTERS: Array<{ value: VideoStage | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'awaiting_shoot', label: 'Awaiting shoot' },
  { value: 'shoot_scheduled', label: 'Scheduled' },
  { value: 'editing', label: 'Editing' },
  { value: 'published', label: 'Published' },
  { value: 'sold', label: 'Sold' },
]

export default function AdminVideoListingsPage() {
  const [items, setItems] = useState<VideoListing[]>(MOCK_VIDEOS)
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState<VideoStage | 'all'>('all')

  /** Updates the production stage of a listing. When the API is wired,
   *  this should call PATCH /api/properties/:id with the new stage. */
  const updateStage = (id: number, next: VideoStage) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, stage: next } : p)))

  const filtered = useMemo(
    () => items.filter((p) => {
      if (stage !== 'all' && p.stage !== stage) return false
      const q = search.trim().toLowerCase()
      if (q && !p.title.toLowerCase().includes(q) && !p.city.toLowerCase().includes(q)) return false
      return true
    }),
    [items, search, stage],
  )

  // Headline metrics
  const pipelineValue = items.reduce((sum, p) => sum + p.totalPrice, 0)
  const earnedSoFar = items.filter((p) => p.stage === 'sold')
    .reduce((sum, p) => sum + p.totalPrice * VIDEO_PROMOTION_FEE_RATE, 0)
  const potentialFee = items.filter((p) => p.stage !== 'sold')
    .reduce((sum, p) => sum + p.totalPrice * VIDEO_PROMOTION_FEE_RATE, 0)

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-lg"
            style={{ backgroundColor: '#FF5A5F' }}>
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Video Listings
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: '#FF5A5F' }}>
                2% Brokerage
              </span>
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Premium properties on the Video Promotion plan — these generate brokerage revenue
            </p>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <StatCard
          icon={Sparkles}
          label="Active listings"
          value={items.filter((p) => p.stage !== 'sold').length.toString()}
          tone="#FF5A5F"
          hint={`${items.length} total in pipeline`}
        />
        <StatCard
          icon={IndianRupee}
          label="Brokerage earned"
          value={formatLakhs(earnedSoFar)}
          tone="#6A9739"
          hint="From sold properties"
        />
        <StatCard
          icon={IndianRupee}
          label="Potential brokerage"
          value={formatLakhs(potentialFee)}
          tone="#293237"
          hint={`Pipeline value ${formatLakhs(pipelineValue)}`}
        />
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 flex-1 min-w-[200px] border border-gray-200">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or city…"
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {STAGE_FILTERS.map((s) => (
              <button
                key={s.value}
                onClick={() => setStage(s.value)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                style={stage === s.value
                  ? { backgroundColor: '#293237', borderColor: '#293237', color: 'white' }
                  : { backgroundColor: 'white', borderColor: '#e5e7eb', color: '#374151' }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listings */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center shadow-sm border border-gray-100">
          <Video className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700">No video listings in this view</p>
          <p className="text-xs text-gray-500 mt-1">
            Properties tagged as Video Promotion at submission time will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((p) => {
            const fee = p.totalPrice * VIDEO_PROMOTION_FEE_RATE
            const stageMeta = STAGE_META[p.stage]
            return (
              <Link
                key={p.id}
                to={`/properties/${p.id}`}
                className="group relative bg-white rounded-xl border-2 p-4 transition-all hover:shadow-lg overflow-hidden"
                style={{ borderColor: 'rgba(255,90,95,0.20)' }}
              >
                {/* Red left ribbon */}
                <div className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ backgroundColor: '#FF5A5F' }} />

                <div className="pl-3">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 pr-2">{p.title}</h3>
                    {/* Editable stage — wrapped in a div that swallows the
                        Link's click so changing status doesn't navigate */}
                    <div
                      onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
                      className="relative shrink-0"
                    >
                      <select
                        value={p.stage}
                        onChange={(e) => updateStage(p.id, e.target.value as VideoStage)}
                        className="appearance-none cursor-pointer text-[10px] uppercase tracking-wider font-bold pl-2.5 pr-7 py-1 rounded-full border-0 outline-none focus:ring-2 transition-all"
                        style={{
                          backgroundColor: stageMeta.bg,
                          color: stageMeta.color,
                          // tailwind's --tw-ring-color so the focus ring matches
                          ['--tw-ring-color' as never]: stageMeta.color,
                        }}
                        title="Click to change stage"
                      >
                        {(Object.keys(STAGE_META) as VideoStage[]).map((s) => (
                          <option key={s} value={s}>{STAGE_META[s].label}</option>
                        ))}
                      </select>
                      {/* Custom caret since appearance-none hides the native one */}
                      <svg
                        className="w-2.5 h-2.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                        viewBox="0 0 12 12"
                        fill="none"
                        style={{ color: stageMeta.color }}
                      >
                        <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.city}</span>
                    <span className="flex items-center gap-1"><Ruler className="w-3 h-3" /> {p.areaInCents} cents</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {p.submittedBy}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {p.submittedAt}</span>
                  </div>

                  <div
                    className="rounded-lg p-2.5 flex items-center justify-between"
                    style={{ backgroundColor: 'rgba(255,90,95,0.06)' }}
                  >
                    <div>
                      <div className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">
                        Sale price
                      </div>
                      <div className="text-base font-bold" style={{ color: '#111111' }}>
                        {formatLakhs(p.totalPrice)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: '#FF5A5F' }}>
                        2% Brokerage
                      </div>
                      <div className="text-base font-bold" style={{ color: '#FF5A5F' }}>
                        {formatLakhs(fee)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <a
                      href={`tel:${p.submitterPhone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
                      style={{ color: '#6A9739' }}
                    >
                      <Phone className="w-3 h-3" /> {p.submitterPhone}
                    </a>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400 group-hover:text-[#FF5A5F]">
                      View <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <p className="text-[11px] text-gray-400 mt-6 inline-flex items-center gap-1.5">
        <ExternalLink className="w-3 h-3" />
        Tip: sellers opt-in to Video Promotion when submitting via /sell. 2% brokerage applies only when the property is sold through us.
      </p>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, hint, tone }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  hint?: string
  tone: string
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${tone}15`, color: tone }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{label}</div>
          <div className="text-xl font-bold tracking-tight" style={{ color: tone }}>{value}</div>
          {hint && <div className="text-[11px] text-gray-500 mt-0.5 truncate">{hint}</div>}
        </div>
      </div>
    </div>
  )
}
