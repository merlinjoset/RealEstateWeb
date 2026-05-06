import { ArrowUpRight, Phone } from 'lucide-react'

const POINTS = [
  {
    no: '01',
    title: 'Doorstep consultation, on us',
    desc: 'A specialist visits your location, walks the property with you, and explains every detail in plain language. No fees, no obligation.',
  },
  {
    no: '02',
    title: 'Listings we have personally inspected',
    desc: 'Each property is verified on the ground by our agents. We do not list what we have not seen — and what we would not buy ourselves.',
  },
  {
    no: '03',
    title: 'Documentation, handled end-to-end',
    desc: 'EC, Patta, Chitta, and registration paperwork — guided through to completion by people who do this every day.',
  },
  {
    no: '04',
    title: 'A decade of local depth',
    desc: 'We work in Kanyakumari district exclusively. From Nagercoil to Cape Comorin, the local knowledge is the product.',
  },
  {
    no: '05',
    title: 'Pricing without surprises',
    desc: 'Listed price is the price. No hidden brokerage, no inflated charges at closing. Transparency is non-negotiable.',
  },
]

export default function WhyChooseUs() {
  return (
    <section className="bg-white">
      {/* === Top: Editorial intro on warm cream canvas === */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#F8F6F3' }}>
        {/* Subtle decorative texture */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 15% 20%, #FF5A5F 0%, transparent 35%), radial-gradient(circle at 85% 80%, #6A9739 0%, transparent 40%)',
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px w-12" style={{ backgroundColor: '#FF5A5F' }} />
                <span className="text-[11px] font-semibold tracking-[0.25em] uppercase" style={{ color: '#FF5A5F' }}>
                  The Jose For Land Difference
                </span>
              </div>

              <h2 className="font-bold leading-[1.05] tracking-tight"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#111111' }}>
                Land is permanent.
                <br />
                <span style={{ color: '#9CA3AF' }}>So is the way </span>
                <em className="not-italic" style={{ color: '#FF5A5F', fontStyle: 'italic', fontWeight: 600 }}>
                  we work.
                </em>
              </h2>
            </div>

            <div className="lg:col-span-4">
              <p className="text-[17px] leading-relaxed" style={{ color: '#4B5563' }}>
                We are not a high-volume listings portal. We are a focused team of land
                specialists serving Kanyakumari district — one property, one family at a time.
              </p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-16 pt-10 border-t grid grid-cols-2 md:grid-cols-4 gap-8" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
            {[
              { v: '10+', l: 'Years in Kanyakumari' },
              { v: '434', l: 'Verified listings' },
              { v: '500+', l: 'Families served' },
              { v: '100%', l: 'Personally inspected' },
            ].map(({ v, l }) => (
              <div key={l}>
                <div className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#111111' }}>
                  {v.replace(/[+%]/, '')}
                  <span style={{ color: '#FF5A5F' }}>{v.match(/[+%]/)?.[0]}</span>
                </div>
                <div className="text-xs uppercase tracking-wider mt-2" style={{ color: '#6B7280' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* === Numbered principles list === */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Sticky left column — section label + CTA */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-4" style={{ color: '#6A9739' }}>
                Five Principles
              </p>
              <h3 className="text-3xl font-bold leading-tight tracking-tight mb-5" style={{ color: '#111111' }}>
                How we work, in five non-negotiables.
              </h3>
              <p className="text-gray-600 text-[15px] leading-relaxed mb-8">
                Every interaction with a Jose For Land specialist follows the same standard.
                Whether you are searching for ten cents or fifty, the discipline does not change.
              </p>

              <a href="tel:+919994488490"
                className="group inline-flex items-center gap-2 text-sm font-semibold border-b-2 pb-1 transition-colors"
                style={{ color: '#111111', borderColor: '#FF5A5F' }}
              >
                <Phone className="w-4 h-4" style={{ color: '#FF5A5F' }} />
                Speak to a specialist
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>

          {/* Right column — numbered list */}
          <div className="lg:col-span-8">
            <div className="border-t" style={{ borderColor: '#EAEAE5' }}>
              {POINTS.map(({ no, title, desc }) => (
                <article
                  key={no}
                  className="group grid grid-cols-12 gap-6 py-8 border-b transition-colors"
                  style={{ borderColor: '#EAEAE5' }}
                >
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-sm font-semibold tabular-nums" style={{ color: '#FF5A5F' }}>
                      {no}
                    </span>
                  </div>

                  <div className="col-span-10 sm:col-span-11">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-xl md:text-[22px] font-bold leading-snug tracking-tight transition-colors"
                        style={{ color: '#111111' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#FF5A5F')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#111111')}
                      >
                        {title}
                      </h4>
                      <ArrowUpRight
                        className="w-5 h-5 shrink-0 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        style={{ color: '#FF5A5F' }}
                      />
                    </div>
                    <p className="text-gray-600 text-[15.5px] leading-relaxed mt-3 max-w-2xl">
                      {desc}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
