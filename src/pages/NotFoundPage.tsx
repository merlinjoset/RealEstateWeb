import { Link, useLocation } from 'react-router-dom'
import { Home, ArrowLeft, MapPin, Search } from 'lucide-react'

export default function NotFoundPage() {
  const location = useLocation()

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-6 py-16"
      style={{ backgroundColor: '#F8F6F3' }}>
      <div className="max-w-lg w-full text-center">
        {/* Big 404 */}
        <div className="relative inline-block mb-6">
          <div className="text-[140px] sm:text-[180px] font-black leading-none tracking-tight"
            style={{ color: '#EA2D34' }}>
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="w-16 h-16 sm:w-20 sm:h-20 text-white drop-shadow-lg"
              fill="rgba(255,255,255,0.4)" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          style={{ color: '#111111' }}>
          Page not found
        </h1>
        <p className="text-base leading-relaxed mb-2" style={{ color: '#4B5563' }}>
          We couldn't find the page you're looking for.
        </p>
        {location.pathname && (
          <p className="text-xs font-mono mb-8 px-3 py-1.5 inline-block rounded-md"
            style={{ backgroundColor: 'white', color: '#6B7280', border: '1px solid #EAEAE5' }}>
            {location.pathname}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-sm transition-colors"
            style={{ backgroundColor: '#EA2D34' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e04a4f')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#EA2D34')}>
            <Home className="w-4 h-4" /> Back to Home
          </Link>
          <Link to="/properties"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border transition-colors"
            style={{ borderColor: '#6A9739', color: '#6A9739' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(106,151,57,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
            <Search className="w-4 h-4" /> Browse Properties
          </Link>
          <button onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Go back
          </button>
        </div>

        {/* Helpful links */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: '#EAEAE5' }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Or try one of these
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <Link to="/map" className="hover:underline" style={{ color: '#6A9739' }}>Map View</Link>
            <span className="text-gray-300">·</span>
            <Link to="/sell" className="hover:underline" style={{ color: '#6A9739' }}>Sell Your Property</Link>
            <span className="text-gray-300">·</span>
            <Link to="/about" className="hover:underline" style={{ color: '#6A9739' }}>About Us</Link>
            <span className="text-gray-300">·</span>
            <Link to="/contact" className="hover:underline" style={{ color: '#6A9739' }}>Contact</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
