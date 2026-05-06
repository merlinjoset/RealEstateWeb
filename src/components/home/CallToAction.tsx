import { Phone, MessageCircle } from 'lucide-react'

export default function CallToAction() {
  return (
    <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#F8F6F3' }}>
      {/* Decorative brand blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-[0.10] -translate-y-1/3 translate-x-1/4 pointer-events-none"
        style={{ backgroundColor: '#FF5A5F' }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-[0.10] translate-y-1/3 -translate-x-1/4 pointer-events-none"
        style={{ backgroundColor: '#6A9739' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-5 border"
          style={{ backgroundColor: 'rgba(106,151,57,0.10)', borderColor: 'rgba(106,151,57,0.25)', color: '#547a2d' }}>
          FREE DOORSTEP CONSULTATION
        </div>

        {/* Headline + description */}
        <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-4" style={{ color: '#111111' }}>
          Ready to find your <span style={{ color: '#FF5A5F' }}>perfect land?</span>
        </h2>
        <p className="text-lg max-w-2xl mx-auto leading-relaxed mb-10" style={{ color: '#4B5563' }}>
          Call us now for a <strong style={{ color: '#111111' }}>FREE doorstep consultation</strong>. We'll visit
          your location, explain the property details, and assist you throughout the process.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="tel:+919994488490"
            className="inline-flex items-center gap-3 font-bold px-7 py-4 rounded-xl transition-colors text-base shadow-lg text-white"
            style={{ backgroundColor: '#FF5A5F' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e04a4f')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FF5A5F')}
          >
            <Phone className="w-5 h-5" />
            +91 99944 88490
          </a>
          <a
            href="https://wa.me/919994488490"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-white font-bold px-7 py-4 rounded-xl transition-colors text-base shadow-lg"
            style={{ backgroundColor: '#25D366' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1da851')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#25D366')}
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp Us
          </a>
        </div>

        <p className="mt-7 text-sm" style={{ color: '#6B7280' }}>
          Available Mon–Sat, 9 AM – 7 PM IST &nbsp;·&nbsp; Also reachable at <strong style={{ color: '#111111' }}>+91 96987 12904</strong>
        </p>
      </div>
    </section>
  )
}
