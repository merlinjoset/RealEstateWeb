import { Link } from 'react-router-dom'
import { Gift, Video, Phone, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'

/**
 * Homepage attention-grabber for buyers. Two paths:
 *  - Free: anyone can sign up and see the seller's direct contact
 *  - Premium (Video Promotion): hand-picked listings with a walkthrough video
 *
 * Both CTAs route to /register?intent=buyer so we can prefill the buyer copy
 * on the registration screen.
 */
export default function BuyerCallout() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F8F6F3' }}>
      <div className="max-w-7xl mx-auto">
        {/* Eyebrow — pulsing */}
        <div className="flex justify-center mb-4">
          <span
            className="jfl-blink inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: '#FF5A5F' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            For Buyers
          </span>
        </div>

        <h2 className="text-center text-3xl sm:text-4xl font-bold tracking-tight mb-2" style={{ color: '#111111' }}>
          Looking to buy land?
        </h2>
        <p className="text-center text-base text-gray-500 mb-8 max-w-2xl mx-auto">
          Two ways to start — both free for buyers. Sign up to unlock seller contacts on free
          listings, or browse our premium video tours.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* === Free path === */}
          <Link
            to="/register?intent=buyer&plan=free"
            className="jfl-buyer-card group relative overflow-hidden rounded-2xl border-2 p-6 transition-all hover:shadow-xl"
            style={{ borderColor: '#6A9739', backgroundColor: 'white' }}
          >
            <div
              className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-10 transition-transform group-hover:scale-110"
              style={{ backgroundColor: '#6A9739' }}
            />

            <div className="relative flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
                style={{ backgroundColor: '#6A9739', color: 'white' }}
              >
                <Gift className="w-7 h-7" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-xl font-bold" style={{ color: '#111111' }}>Free Listings</h3>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(106,151,57,0.10)', color: '#6A9739' }}>
                    No fee for buyers
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  Sign up to instantly unlock the <strong>seller's direct phone</strong> on every
                  free listing. Talk to the owner, schedule a visit, no middleman.
                </p>

                <ul className="space-y-1.5 mb-4">
                  <li className="flex items-center gap-2 text-xs text-gray-700">
                    <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: '#6A9739' }} />
                    Direct seller phone number
                  </li>
                  <li className="flex items-center gap-2 text-xs text-gray-700">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" style={{ color: '#6A9739' }} />
                    Document-verified plots
                  </li>
                  <li className="flex items-center gap-2 text-xs text-gray-700">
                    <Gift className="w-3.5 h-3.5 shrink-0" style={{ color: '#6A9739' }} />
                    Zero brokerage on the buyer side
                  </li>
                </ul>

                <span className="inline-flex items-center gap-1.5 text-sm font-bold transition-transform group-hover:translate-x-1"
                  style={{ color: '#6A9739' }}>
                  Sign up to see contacts <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>

          {/* === Premium / Video path === */}
          <Link
            to="/register?intent=buyer&plan=premium"
            className="jfl-buyer-card group relative overflow-hidden rounded-2xl border-2 p-6 transition-all hover:shadow-xl"
            style={{ borderColor: '#FF5A5F', backgroundColor: 'white' }}
          >
            {/* Pulsing "Premium" ribbon */}
            <span
              className="absolute top-4 right-4 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full text-white jfl-blink-soft"
              style={{ backgroundColor: '#FF5A5F' }}
            >
              <Sparkles className="w-2.5 h-2.5" /> Premium
            </span>
            <div
              className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-10 transition-transform group-hover:scale-110"
              style={{ backgroundColor: '#FF5A5F' }}
            />

            <div className="relative flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
                style={{ backgroundColor: '#FF5A5F', color: 'white' }}
              >
                <Video className="w-7 h-7" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold mb-1" style={{ color: '#111111' }}>Premium Video Tours</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  Hand-curated plots with a full <strong>walkthrough video</strong> by our team.
                  Our agent personally arranges the visit and handles paperwork end-to-end.
                </p>

                <ul className="space-y-1.5 mb-4">
                  <li className="flex items-center gap-2 text-xs text-gray-700">
                    <Video className="w-3.5 h-3.5 shrink-0" style={{ color: '#FF5A5F' }} />
                    Professional drone & walkthrough footage
                  </li>
                  <li className="flex items-center gap-2 text-xs text-gray-700">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" style={{ color: '#FF5A5F' }} />
                    Agent-assisted, end-to-end support
                  </li>
                  <li className="flex items-center gap-2 text-xs text-gray-700">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: '#FF5A5F' }} />
                    Featured at the top of search results
                  </li>
                </ul>

                <span className="inline-flex items-center gap-1.5 text-sm font-bold transition-transform group-hover:translate-x-1"
                  style={{ color: '#FF5A5F' }}>
                  Sign up & explore premium <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold hover:underline" style={{ color: '#FF5A5F' }}>
            Sign in instead →
          </Link>
        </p>
      </div>
    </section>
  )
}
