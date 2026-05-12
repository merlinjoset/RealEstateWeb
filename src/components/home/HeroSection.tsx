import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, MapPin, Star, Phone, Map as MapIcon } from 'lucide-react'

const CITIES = ['Nagercoil', 'Marthandam', 'Thuckalay', 'Kanyakumari', 'Colachel', 'Padmanabhapuram']

export default function HeroSection() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/properties?search=${encodeURIComponent(query)}`)
  }

  return (
    <section style={{ backgroundColor: '#F8F6F3' }} className="relative overflow-hidden">
      {/* Subtle leaf/nature pattern overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 20% 50%, #6A9739 0%, transparent 50%), radial-gradient(circle at 80% 20%, #FF5A5F 0%, transparent 40%)',
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left content */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-4 h-4" style={{ fill: '#FF5A5F', color: '#FF5A5F' }} />
              ))}
              <span className="text-sm ml-1" style={{ color: '#6A9739' }}>Trusted by 1000+ families</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4" style={{ color: '#111111' }}>
              Find Your Perfect{' '}
              <span style={{ color: '#FF5A5F' }}>Land</span>
              <br />in Kanyakumari
            </h1>

            <p className="text-lg mb-3" style={{ color: '#333333' }}>
              <strong style={{ color: '#111111' }}>Live where you want.</strong> Browse 400+ verified land
              listings across Kanyakumari district — open plots, agricultural land, and more.
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8 border"
              style={{ backgroundColor: 'rgba(106,151,57,0.1)', borderColor: 'rgba(106,151,57,0.3)', color: '#547a2d' }}>
              FREE doorstep consultation — we come to you!
            </div>

            {/* Search box */}
            <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 max-w-xl mb-6">
              <form onSubmit={handleSearch} className="flex gap-2 p-1">
                <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4">
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search city, location or landmark..."
                    className="flex-1 py-3 bg-transparent outline-none text-sm placeholder-gray-400"
                    style={{ color: '#263238' }}
                  />
                </div>
                <button type="submit" className="px-6 py-3 text-white font-semibold rounded-xl transition-colors text-sm"
                  style={{ backgroundColor: '#FF5A5F' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e04a4f')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FF5A5F')}
                >
                  Search
                </button>
              </form>

              <div className="px-3 pb-2 pt-1 flex flex-wrap gap-2">
                {CITIES.slice(0, 5).map((city) => (
                  <button key={city} onClick={() => navigate(`/properties?city=${encodeURIComponent(city)}`)}
                    className="flex items-center gap-1 text-xs transition-colors hover:underline"
                    style={{ color: '#6A9739' }}>
                    <MapPin className="w-3 h-3" />
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Action row — Map view CTA + phone numbers */}
            <div className="flex flex-wrap gap-3">
              {/* Browse on Map — solid olive, on-brand */}
              <Link
                to="/map"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors shadow-sm"
                style={{ backgroundColor: '#6A9739' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#547a2d')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6A9739')}
              >
                <MapIcon className="w-4 h-4" />
                Browse on Map
              </Link>

              {/* Phone numbers */}
              {['+91 99944 88490', '+91 99448 85542'].map(num => (
                <a key={num} href={`tel:${num.replace(/\s/g,'')}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors bg-white hover:bg-gray-50"
                  style={{ borderColor: '#CFD8DC', color: '#263238' }}>
                  <Phone className="w-4 h-4" style={{ color: '#FF5A5F' }} />
                  {num}
                </a>
              ))}
            </div>
          </div>

          {/* Right — logo showcase */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              <div className="w-64 h-64 rounded-full flex items-center justify-center shadow-2xl border-8 border-white"
                style={{ backgroundColor: '#F0F7E8' }}>
                <img src="/logo.png" alt="Jose For Land" className="w-52 h-52 object-contain rounded-full" />
              </div>
              {/* Floating stat badges */}
              {[
                { label: '434+ Listings', pos: '-top-4 -right-4', bg: '#FF5A5F' },
                { label: 'Free Consultation', pos: '-bottom-4 -left-4', bg: '#6A9739' },
                { label: '10+ Years Trust', pos: 'top-1/2 -right-16', bg: '#293237' },
              ].map(({ label, pos, bg }) => (
                <div key={label} className={`absolute ${pos} px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow-lg`} style={{ backgroundColor: bg }}>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm">
            {[
              { label: '434+', sub: 'Land Listings' },
              { label: '200+', sub: 'Happy Clients' },
              { label: '100%', sub: 'Free Consultation' },
              { label: '10+', sub: 'Years Experience' },
            ].map(({ label, sub }) => (
              <div key={sub} className="text-center">
                <div className="text-xl font-bold" style={{ color: '#FF5A5F' }}>{label}</div>
                <div className="text-xs text-gray-500">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
