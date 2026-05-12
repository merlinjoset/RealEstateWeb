import { Check, Sparkles, Video, Gift, IndianRupee } from 'lucide-react'
import { VIDEO_PROMOTION_FEE_RATE, type MarketingPlan } from '../../types'

interface Props {
  /** Currently-selected plan. Defaults to 'Free' if undefined. */
  value: MarketingPlan
  onChange: (plan: MarketingPlan) => void
  /** Used to live-preview the 2% brokerage on the Video Promotion card. */
  totalPriceStr: string
}

function formatLakhs(n: number) {
  if (!n || isNaN(n)) return '—'
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

export default function MarketingPlanPicker({ value, onChange, totalPriceStr }: Props) {
  const price = Number(totalPriceStr)
  const fee = price > 0 ? price * VIDEO_PROMOTION_FEE_RATE : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* === Free === */}
      <PlanCard
        active={value === 'Free'}
        onClick={() => onChange('Free')}
        icon={Gift}
        accent="#6A9739"
        label="Free Listing"
        priceLine="₹0 brokerage"
        bullets={[
          'Basic listing with photos',
          'Shown in standard search results',
          'No promotional video',
          'Zero brokerage when sold',
        ]}
      />

      {/* === Video Promotion === */}
      <PlanCard
        active={value === 'VideoPromotion'}
        onClick={() => onChange('VideoPromotion')}
        icon={Video}
        accent="#FF5A5F"
        label="Video Promotion"
        priceLine={
          <span className="inline-flex items-center gap-1.5">
            <span className="text-base font-bold">2% brokerage</span>
            <span className="text-xs font-medium text-gray-500">on sale</span>
          </span>
        }
        badge="Sells Faster"
        bullets={[
          // Lead with the headline benefit so it's the first thing the seller reads
          <span key="fast" className="inline-flex items-start gap-1">
            <span className="font-bold" style={{ color: '#FF5A5F' }}>Often sold sooner than expected</span>
            {' '}— premium reach &amp; agent follow-up
          </span>,
          'Professional walkthrough video',
          'Featured at the top of listings',
          'Shared on Instagram &amp; WhatsApp',
          price > 0
            ? `Approx. fee on this property: ${formatLakhs(fee)}`
            : 'Add the price to preview your 2% fee',
        ]}
      />
    </div>
  )
}

function PlanCard({
  active, onClick, icon: Icon, accent, label, priceLine, bullets, badge,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  accent: string
  label: string
  priceLine: React.ReactNode
  bullets: React.ReactNode[]
  badge?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-2xl border-2 p-4 transition-all relative overflow-hidden"
      style={active
        ? { borderColor: accent, backgroundColor: `${accent}0D` }
        : { borderColor: '#e5e7eb', backgroundColor: 'white' }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = '#FAFAF8' }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'white' }}
    >
      {badge && (
        <span
          className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: accent }}
        >
          <Sparkles className="w-2.5 h-2.5" /> {badge}
        </span>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{
            backgroundColor: active ? accent : `${accent}1A`,
            color: active ? 'white' : accent,
          }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-gray-900 leading-tight">{label}</div>
          <div className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
            <IndianRupee className="w-3 h-3" />
            <span>{priceLine}</span>
          </div>
        </div>
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all"
          style={{
            backgroundColor: active ? accent : '#E5E7EB',
            color: 'white',
          }}
        >
          {active && <Check className="w-3 h-3" strokeWidth={3} />}
        </div>
      </div>

      <ul className="space-y-1.5">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
            <Check className="w-3 h-3 mt-0.5 shrink-0" style={{ color: accent }} strokeWidth={3} />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </button>
  )
}
