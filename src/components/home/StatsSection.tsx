import { MapPin, Home, Users, Award } from 'lucide-react'

const STATS = [
  { icon: Home, value: '434+', label: 'Land Listings', iconColor: '#FF5A5F', iconBg: 'rgba(255,90,95,0.08)' },
  { icon: Users, value: '500+', label: 'Happy Clients', iconColor: '#6A9739', iconBg: 'rgba(106,151,57,0.08)' },
  { icon: MapPin, value: '15+', label: 'Locations Covered', iconColor: '#FF5A5F', iconBg: 'rgba(255,90,95,0.08)' },
  { icon: Award, value: '10+', label: 'Years of Trust', iconColor: '#6A9739', iconBg: 'rgba(106,151,57,0.08)' },
]

export default function StatsSection() {
  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ icon: Icon, value, label, iconColor, iconBg }) => (
            <div key={label} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3"
                style={{ backgroundColor: iconBg, color: iconColor }}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold" style={{ color: '#FF5A5F' }}>{value}</div>
              <div className="text-gray-500 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
