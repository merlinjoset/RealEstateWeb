import { Phone, Mail, MapPin, Star, Users, Home, Award } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <PageHeader
        eyebrow="About Us"
        title="About Jose For Land"
        highlight="Jose For Land"
        description="Kanyakumari's most trusted land property consultancy. We've been helping families find their perfect land for over a decade — one free site visit at a time."
      />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="font-semibold text-sm uppercase tracking-widest" style={{ color: '#6A9739' }}>Our Story</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-5">
                Born in Kanyakumari, <br /> Built for Kanyakumari
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-900">Jose For Land</strong> was founded with a simple
                  mission: make land buying transparent, trustworthy, and stress-free for families in
                  Kanyakumari district.
                </p>
                <p>
                  Based in the heart of South Tamil Nadu, we specialize exclusively in land properties
                  across Kanyakumari — from Nagercoil and Marthandam to the historic tip of India.
                  Our deep-rooted knowledge of this region means you get accurate guidance, not just
                  listings.
                </p>
                <p>
                  Our signature service: <strong style={{ color: '#6A9739' }}>free doorstep consultation</strong>.
                  We believe buying land should not be a remote exercise. Our team personally visits
                  every property we list, and we accompany you on site visits — explaining the EC,
                  Patta, and Chitta documents in plain language.
                </p>
                <p>
                  With 500+ satisfied clients and 10+ years of experience, Jose For Land stands as
                  Kanyakumari's go-to name when it comes to finding the right plot of land.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Home, value: '434+', label: 'Active Listings', bg: 'rgba(255,90,95,0.08)', color: '#FF5A5F' },
                { icon: Users, value: '500+', label: 'Happy Clients', bg: 'rgba(106,151,57,0.08)', color: '#6A9739' },
                { icon: MapPin, value: '15+', label: 'Locations Covered', bg: 'rgba(255,90,95,0.08)', color: '#FF5A5F' },
                { icon: Award, value: '10+', label: 'Years of Trust', bg: 'rgba(106,151,57,0.08)', color: '#6A9739' },
              ].map(({ icon: Icon, value, label, bg, color }) => (
                <div key={label} className="rounded-2xl p-6 text-center" style={{ backgroundColor: bg, color }}>
                  <Icon className="w-7 h-7 mx-auto mb-3" />
                  <div className="text-3xl font-bold mb-1">{value}</div>
                  <div className="text-sm font-medium opacity-80">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">What Our Clients Say</h2>
            <p className="text-gray-500 mt-2">Real experiences from real families across Kanyakumari</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Rajan K.',
                location: 'Nagercoil',
                text: 'I had been searching for a good plot near town for years. Jose For Land showed me exactly what I wanted in one visit. The agent explained all documents clearly. Very honest service!',
                rating: 5,
              },
              {
                name: 'Priya S.',
                location: 'Marthandam',
                text: 'The free doorstep consultation is genuine — they actually came to the site and spent time with us. We bought our first land through them and couldn\'t be happier.',
                rating: 5,
              },
              {
                name: 'Xavier J.',
                location: 'Colachel',
                text: 'Transparent pricing and no hidden brokerage. I compared with other agents and Jose For Land had the best listings in our budget. Highly recommend for anyone buying land in Kanyakumari.',
                rating: 5,
              },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{t.name}</div>
                  <div className="text-gray-500 text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {t.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 text-white" style={{ backgroundColor: '#6A9739' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-3">Get in Touch</h2>
          <p className="text-red-100 mb-8">
            Have questions? Want a free site visit? We're here for you.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { icon: Phone, label: 'Call Us', value: '+91 99944 88490', href: 'tel:+919994488490' },
              { icon: Phone, label: 'Alternate', value: '+91 96987 12904', href: 'tel:+919698712904' },
              { icon: Mail, label: 'Email', value: 'josepowerj@gmail.com', href: 'mailto:josepowerj@gmail.com' },
            ].map(({ icon: Icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                className="flex flex-col items-center gap-2 bg-white/15 hover:bg-white/25 transition-colors rounded-xl p-5"
              >
                <Icon className="w-5 h-5 text-white" />
                <div className="text-xs text-red-100">{label}</div>
                <div className="font-semibold text-sm">{value}</div>
              </a>
            ))}
          </div>

          <div className="flex items-center justify-center gap-1 text-red-100 text-sm">
            <MapPin className="w-4 h-4" />
            Appattuvilai, Thuckalay, Kanyakumari District, Tamil Nadu, India
          </div>
        </div>
      </section>
    </main>
  )
}
