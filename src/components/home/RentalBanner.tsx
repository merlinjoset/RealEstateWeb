import { Link } from 'react-router-dom'
import { ArrowRight, KeyRound } from 'lucide-react'

/**
 * Homepage band promoting the Rental Properties section. Green/olive gradient
 * (matching the /rentals hero) so it reads as distinct from the coral buyer
 * banner. Shown to everyone — rentals are free and public, so there's no
 * sign-in gate to mention.
 */
export default function RentalBanner() {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F8F6F3' }}>
      <div className="max-w-6xl mx-auto">
        <Link
          to="/rentals"
          className="group flex items-center justify-center gap-3 sm:gap-4 w-full text-center py-4 px-5 rounded-2xl text-white font-bold shadow-lg hover:shadow-xl transition-all hover:brightness-110"
          style={{
            background: 'linear-gradient(90deg, #6A9739 0%, #8BC34A 50%, #6A9739 100%)',
          }}
        >
          <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />

          <span className="text-sm sm:text-lg uppercase tracking-wider leading-tight">
            Looking to rent?{' '}
            <span className="font-extrabold underline underline-offset-2 decoration-white/80">
              Browse Rental Properties
            </span>{' '}
            — free &amp; no sign-in needed
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 text-sm font-extrabold uppercase tracking-wider transition-transform group-hover:translate-x-1">
            View rentals <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>
    </section>
  )
}
