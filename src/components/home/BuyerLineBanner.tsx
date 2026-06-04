import { Link } from 'react-router-dom'
import { ArrowRight, Phone } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

/**
 * Inline homepage banner — a single attention-grabbing blinking line that
 * replaces the old multi-card BuyerCallout. Slim but bold: full-bleed coral
 * gradient with a pulsing dot, phone glyph, and a one-line CTA. Only shown
 * to anonymous visitors (signed-in users have nothing to gain from it).
 */
export default function BuyerLineBanner() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return null

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F8F6F3' }}>
      <div className="max-w-6xl mx-auto">
        <Link
          to="/register?intent=buyer&plan=free"
          className="jfl-blink-soft group flex items-center justify-center gap-3 sm:gap-4 w-full text-center py-4 px-5 rounded-2xl text-white font-bold shadow-lg hover:shadow-xl transition-all hover:brightness-110"
          style={{
            background:
              'linear-gradient(90deg, #FF5A5F 0%, #ff7a7e 50%, #FF5A5F 100%)',
          }}
        >
          <span className="relative inline-flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
          </span>

          <Phone className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />

          <span className="text-sm sm:text-lg uppercase tracking-wider leading-tight">
            Sign in to unlock{' '}
            <span className="font-extrabold underline underline-offset-2 decoration-white/80">
              ZERO SERVICE CHARGE LISTINGS
            </span>{' '}
            &amp; direct seller phone numbers
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 text-sm font-extrabold uppercase tracking-wider transition-transform group-hover:translate-x-1">
            Sign in now <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>
    </section>
  )
}
