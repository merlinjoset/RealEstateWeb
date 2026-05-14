import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, Phone, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

/**
 * Slim single-line banner pinned to the very top of every public page
 * (above the Navbar). Two flavours:
 *
 *  - Anonymous → blinking coral CTA: "Sign in to unlock ZERO SERVICE CHARGE
 *    LISTINGS & direct seller phone numbers — Sign in now →"
 *  - Authenticated → calmer green info strip confirming the same benefit
 *    they now have access to ("Zero service charge listings & direct seller
 *    phone numbers"). Reassures the user post-login that they're in the
 *    right place, without the ad-shouting tone of the anonymous variant.
 *
 * Hidden on the auth pages themselves so we don't double up.
 */
export default function FreeListingsBanner() {
  const { isAuthenticated } = useAuth()
  const { pathname } = useLocation()

  if (pathname.startsWith('/login') || pathname.startsWith('/register')
      || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password')) {
    return null
  }

  // ── Signed-in confirmation strip ─────────────────────────────────────
  if (isAuthenticated) {
    return (
      <div
        className="block w-full text-center text-xs sm:text-sm font-semibold text-white py-2 px-3"
        style={{
          background: 'linear-gradient(90deg, #6A9739 0%, #8BC34A 50%, #6A9739 100%)',
        }}
      >
        <span className="inline-flex items-center gap-2 flex-wrap justify-center">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span className="uppercase tracking-wider">
            <strong className="font-extrabold">Zero service charge listings</strong> &amp; direct seller phone numbers
          </span>
        </span>
      </div>
    )
  }

  // ── Anonymous attention-grabber ──────────────────────────────────────
  return (
    <Link
      to="/register?intent=buyer&plan=free"
      className="jfl-blink-soft block w-full text-center text-xs sm:text-sm font-semibold text-white py-2 px-3 hover:brightness-110 transition-all"
      style={{
        background:
          'linear-gradient(90deg, #FF5A5F 0%, #ff7a7e 35%, #FF5A5F 65%, #e04a4f 100%)',
      }}
    >
      <span className="inline-flex items-center gap-2 flex-wrap justify-center">
        <span className="relative inline-flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
        <Phone className="w-3.5 h-3.5 shrink-0" />
        <span className="uppercase tracking-wider">
          Sign in to unlock <strong className="font-extrabold">ZERO SERVICE CHARGE LISTINGS</strong> &amp; direct seller phone numbers
        </span>
        <span className="inline-flex items-center gap-1 underline underline-offset-2 decoration-white/70 group-hover:decoration-white">
          Sign in now <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </span>
    </Link>
  )
}
