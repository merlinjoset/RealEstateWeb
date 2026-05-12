import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Share2, Video, Camera } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#111111' }} className="text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white p-0.5 shrink-0 shadow">
                <img src="/logo.png" alt="Jose For Land" className="w-full h-full object-contain rounded-full" />
              </div>
              <div>
                <div className="font-bold text-white text-base leading-none">Jose For Land</div>
                <div className="text-xs font-medium mt-0.5" style={{ color: '#8BC34A' }}>Live where you want</div>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Kanyakumari's most trusted land property platform. Free doorstep consultation on every listing.
            </p>
            <div className="flex items-center gap-3">
              {[{ Icon: Share2, label: 'Facebook' }, { Icon: Video, label: 'YouTube' }, { Icon: Camera, label: 'Instagram' }].map(({ Icon, label }) => (
                <button key={label} aria-label={label} className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:text-white" style={{ backgroundColor: '#293237' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FF5A5F')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#293237')}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: '/', label: 'Home' },
                { to: '/properties', label: 'Browse Land' },
                { to: '/properties?status=for_sale', label: 'Land for Sale' },
                { to: '/map', label: 'Map View' },
                { to: '/contact', label: 'Contact Us' },
                { to: '/about', label: 'About Us' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.66)' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Locations</h4>
            <ul className="space-y-2 text-sm">
              {['Nagercoil', 'Marthandam', 'Thuckalay', 'Kanyakumari', 'Colachel', 'Padmanabhapuram', 'Boothapandi'].map((city) => (
                <li key={city}>
                  <Link to={`/properties?city=${encodeURIComponent(city)}`} className="hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.66)' }}>
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#FF5A5F' }} />
                <span>Appattuvilai, Thuckalay,<br />Kanyakumari District, Tamil Nadu, India</span>
              </li>
              <li>
                <a href="tel:+919994488490" className="flex items-center gap-3 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 shrink-0" style={{ color: '#FF5A5F' }} />
                  +91 99944 88490
                </a>
              </li>
              <li>
                <a href="tel:+919944885542" className="flex items-center gap-3 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 shrink-0" style={{ color: '#FF5A5F' }} />
                  +91 99448 85542
                </a>
              </li>
              <li>
                <a href="mailto:josepowerj@gmail.com" className="flex items-center gap-3 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 shrink-0" style={{ color: '#FF5A5F' }} />
                  josepowerj@gmail.com
                </a>
              </li>
            </ul>
            <div className="rounded-lg p-3 text-center border" style={{ backgroundColor: 'rgba(106,151,57,0.15)', borderColor: 'rgba(106,151,57,0.3)' }}>
              <p className="font-semibold text-sm mb-0.5" style={{ color: '#8BC34A' }}>Free Consultation</p>
              <p className="text-xs text-gray-400">We visit your property doorstep — FREE!</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ borderTop: '1px solid #293237', color: '#666' }}>
          <p>&copy; {new Date().getFullYear()} Jose For Land. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
