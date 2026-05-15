import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Phone, Mail, MapPin } from 'lucide-react'
import { FacebookIcon, InstagramIcon, YoutubeIcon } from '../icons/Brands'
import { settingsApi } from '../../services/api'

// Static fallbacks — used when the /api/settings/site call is still in
// flight, errors out, or returns empty strings. Keep these in sync with the
// migration seed so first-page-load looks the same as the eventual fetched
// state.
const DEFAULT_SOCIAL = {
  facebookUrl:  'https://facebook.com/joseforland',
  instagramUrl: 'https://instagram.com/joseforland',
  youtubeUrl:   'https://youtube.com/@joseforland',
}

export default function Footer() {
  const siteQuery = useQuery({
    queryKey: ['site-settings'],
    queryFn: settingsApi.getSite,
    staleTime: 5 * 60_000,      // settings change rarely — keep them warm
  })
  const site = siteQuery.data
  const social = {
    facebookUrl:  (site?.facebookUrl?.trim()  || DEFAULT_SOCIAL.facebookUrl),
    instagramUrl: (site?.instagramUrl?.trim() || DEFAULT_SOCIAL.instagramUrl),
    youtubeUrl:   (site?.youtubeUrl?.trim()   || DEFAULT_SOCIAL.youtubeUrl),
  }

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
              {[
                { Icon: FacebookIcon,  label: 'Facebook',  href: social.facebookUrl,  hover: '#1877F2' },
                { Icon: InstagramIcon, label: 'Instagram', href: social.instagramUrl, hover: '#E1306C' },
                { Icon: YoutubeIcon,   label: 'YouTube',   href: social.youtubeUrl,   hover: '#FF0000' },
              ].map(({ Icon, label, href, hover }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors text-gray-400 hover:text-white"
                  style={{ backgroundColor: '#293237' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hover)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#293237')}
                >
                  <Icon className="w-4 h-4" />
                </a>
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

        {/* Subtle credit — muted, smaller than the copyright row */}
        <div className="mt-2 text-center text-[11px]" style={{ color: '#3a3a3a' }}>
          Powered by{' '}
          <a
            href="http://merlinjose.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 transition-colors underline-offset-2 hover:underline"
          >
            Merlin Jose
          </a>
        </div>
      </div>
    </footer>
  )
}
