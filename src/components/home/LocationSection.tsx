import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapPin } from 'lucide-react'
import { propertiesApi } from '../../services/api'

// Local photos served from /public/locations/. The previous Unsplash
// stock photos misrepresented the towns; drop a real photo in to
// replace the noimage.svg fallback per location. File names are
// lowercase + slug-safe.
// `name` drives the filter URL (and is the substring we match against the
// stored DB city) — keep aligned with the rest of the city lists.
// `label` is the display text on the tile, used when the local
// transliteration is preferred (e.g. signage spells the town "Kanniyakumari"
// while the rest of the site uses the standard "Kanyakumari"). Defaults to
// `name` when omitted.
const LOCATIONS: { name: string; label?: string; img: string }[] = [
  { name: 'Nagercoil',      img: '/locations/nagercoil.jpg' },
  { name: 'Marthandam',     img: '/locations/marthandam.jpg' },
  { name: 'Thuckalay',      img: '/locations/thuckalay.jpg' },
  { name: 'Kanyakumari',    label: 'Kanniyakumari', img: '/locations/kanyakumari.jpg' },
  { name: 'Colachel',       img: '/locations/colachel.jpg' },
  { name: 'Kaliyakkavilai', img: '/locations/kaliyakkavilai.jpg' },
]

export default function LocationSection() {
  const navigate = useNavigate()

  // Real counts from the API, grouped by the city values actually stored
  // in the DB (e.g. "Nagercoil Region", "Marthandam Region"). We sum
  // anything that contains the short name as a substring — matches the
  // backend's substring filter so the count on the tile and the count
  // of results after click stay in sync.
  const { data: rows = [] } = useQuery({
    queryKey: ['city-counts'],
    queryFn: propertiesApi.getCityCounts,
    staleTime: 5 * 60_000,
  })
  const countFor = (shortName: string) =>
    rows
      .filter((r) => r.city?.toLowerCase().includes(shortName.toLowerCase()))
      .reduce((sum, r) => sum + r.count, 0)

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Browse by Location</h2>
          <p className="text-gray-500 mt-2">Explore land properties across Kanyakumari district</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {LOCATIONS.map(({ name, label, img }) => {
            const count = countFor(name)
            const displayLabel = label ?? name
            return (
              <button
                key={name}
                onClick={() => navigate(`/properties?city=${encodeURIComponent(name)}`)}
                className="group relative overflow-hidden rounded-xl h-36 text-left"
              >
                <img
                  src={img}
                  alt={displayLabel}
                  // Until the location photo is added to /public/locations/,
                  // gracefully fall back to the shared no-image placeholder.
                  onError={(e) => { e.currentTarget.src = '/noimage.svg' }}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-center gap-1 text-white font-semibold text-sm">
                    <MapPin className="w-3 h-3" />
                    {displayLabel}
                  </div>
                  <div className="text-white/70 text-xs">
                    {count > 0 ? `${count} propert${count === 1 ? 'y' : 'ies'}` : 'No listings yet'}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
