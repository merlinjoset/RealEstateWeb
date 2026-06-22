import { useQuery } from '@tanstack/react-query'
import { MapPin, Home, Users, Award } from 'lucide-react'
import { propertiesApi } from '../../services/api'

/**
 * Top of homepage — four counter blocks. "Land Listings" is sourced from
 * the live property catalogue; the other three are marketing claims that
 * stay constant. Reuses query key with WhyChooseUs so the call is deduped.
 */
export default function StatsSection() {
  const { data } = useQuery({
    queryKey: ['properties-total'],
    queryFn: () => propertiesApi.getAll({ page: 1, pageSize: 1, sortBy: 'newest' }),
    staleTime: 5 * 60_000,
  })
  // Anonymous visitors get the VideoPromotion-only count, which is misleading
  // for a homepage stat block. Fall back to a round-down marketing number
  // when the API returns < 100 (e.g. logged-out flow today). Once the buyer
  // signs up, the real total shows through.
  const total = data?.total ?? 0
  const landListings = total >= 100 ? `${total}+` : '400+'

  const stats = [
    { icon: Home,   value: landListings, label: 'Land Listings',     iconColor: '#EA2D34', iconBg: 'rgba(255,90,95,0.08)' },
    { icon: Users,  value: '500+',       label: 'Happy Clients',     iconColor: '#6A9739', iconBg: 'rgba(106,151,57,0.08)' },
    { icon: MapPin, value: '15+',        label: 'Locations Covered', iconColor: '#EA2D34', iconBg: 'rgba(255,90,95,0.08)' },
    { icon: Award,  value: '10+',        label: 'Years of Trust',    iconColor: '#6A9739', iconBg: 'rgba(106,151,57,0.08)' },
  ]

  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ icon: Icon, value, label, iconColor, iconBg }) => (
            <div key={label} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3"
                style={{ backgroundColor: iconBg, color: iconColor }}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold" style={{ color: '#EA2D34' }}>{value}</div>
              <div className="text-gray-500 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
