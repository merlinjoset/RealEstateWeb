import { useNavigate } from 'react-router-dom'
import { MapPin } from 'lucide-react'

const LOCATIONS = [
  { name: 'Nagercoil', count: 120, img: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80&auto=format&fit=crop' },
  { name: 'Marthandam', count: 65, img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80&auto=format&fit=crop' },
  { name: 'Thuckalay', count: 48, img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80&auto=format&fit=crop' },
  { name: 'Kanyakumari', count: 38, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&auto=format&fit=crop' },
  { name: 'Colachel', count: 29, img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&q=80&auto=format&fit=crop' },
  { name: 'Padmanabhapuram', count: 22, img: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80&auto=format&fit=crop' },
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
