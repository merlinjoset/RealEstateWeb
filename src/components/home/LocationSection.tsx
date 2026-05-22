import { useNavigate } from 'react-router-dom'
import { MapPin } from 'lucide-react'

// Local photos served from /public/locations/. The previous Unsplash
// stock photos misrepresented the towns; replace each file with a real
// photo (or leave the missing-image fallback to /noimage.svg via
// onError below). File names are lowercase + slug-safe.
const LOCATIONS = [
  { name: 'Nagercoil',      count: 120, img: '/locations/nagercoil.jpg' },
  { name: 'Marthandam',     count: 65,  img: '/locations/marthandam.jpg' },
  { name: 'Thuckalay',      count: 48,  img: '/locations/thuckalay.jpg' },
  { name: 'Kanyakumari',    count: 38,  img: '/locations/kanyakumari.jpg' },
  { name: 'Colachel',       count: 29,  img: '/locations/colachel.jpg' },
  { name: 'Kaliyakkavilai', count: 22,  img: '/locations/kaliyakkavilai.jpg' },
]

export default function LocationSection() {
  const navigate = useNavigate()

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Browse by Location</h2>
          <p className="text-gray-500 mt-2">Explore land properties across Kanyakumari district</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {LOCATIONS.map(({ name, count, img }) => (
            <button
              key={name}
              onClick={() => navigate(`/properties?city=${encodeURIComponent(name)}`)}
              className="group relative overflow-hidden rounded-xl h-36 text-left"
            >
              <img
                src={img}
                alt={name}
                // Until the location photo is added to /public/locations/,
                // gracefully fall back to the shared no-image placeholder.
                onError={(e) => { e.currentTarget.src = '/noimage.svg' }}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="flex items-center gap-1 text-white font-semibold text-sm">
                  <MapPin className="w-3 h-3" />
                  {name}
                </div>
                <div className="text-white/70 text-xs">{count} properties</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
