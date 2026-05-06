import { useState } from 'react'
import { Play, Pause, Quote, Star, MapPin, X } from 'lucide-react'

interface Testimonial {
  id: number
  name: string
  location: string
  area: string           // e.g. "10 cents"
  rating: number
  excerpt: string        // pull-quote shown on card
  thumbnail: string      // poster image
  videoUrl: string       // mp4 / external embed url
  duration: string       // e.g. "1:24"
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Rajan Kumar',
    location: 'Nagercoil',
    area: '15 cents · Open Land',
    rating: 5,
    excerpt: 'They visited the site with us, explained every document, and stayed honest throughout. Bought my first land through Jose For Land — no regrets.',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: '1:24',
  },
  {
    id: 2,
    name: 'Priya Selvam',
    location: 'Marthandam',
    area: '10 cents · Residential Plot',
    rating: 5,
    excerpt: 'The free doorstep consultation is real — they came to our village, walked the plot with us, and answered every question. Genuine team.',
    thumbnail: 'https://images.unsplash.com/photo-1464082354059-27db6ce50048?w=900&q=80&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: '0:58',
  },
  {
    id: 3,
    name: 'Xavier Joseph',
    location: 'Colachel',
    area: '50 cents · Agricultural',
    rating: 5,
    excerpt: 'Compared with three other agents — Jose For Land had the cleanest documentation and the most transparent pricing. Highly recommend.',
    thumbnail: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=900&q=80&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '1:42',
  },
]

export default function VideoTestimonials() {
  const [active, setActive] = useState<Testimonial | null>(null)

  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-12">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-10" style={{ backgroundColor: '#FF5A5F' }} />
              <span className="text-[11px] font-semibold tracking-[0.25em] uppercase" style={{ color: '#FF5A5F' }}>
                In their own words
              </span>
            </div>
            <h2 className="text-4xl md:text-[44px] font-bold leading-[1.15] tracking-tight" style={{ color: '#111111' }}>
              Stories from families who found their land with us.
            </h2>
          </div>
          <div className="lg:col-span-4">
            <p className="text-gray-600 leading-relaxed">
              Watch how our clients describe their experience — from the first call to the final
              registration. Real people, real plots, real Kanyakumari.
            </p>
          </div>
        </div>

        {/* Video grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <article
              key={t.id}
              className="group cursor-pointer"
              onClick={() => setActive(t)}
            >
              {/* Thumbnail with play button */}
              <div className="relative overflow-hidden rounded-2xl aspect-[4/5] mb-5">
                <img
                  src={t.thumbnail}
                  alt={t.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0" style={{
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)',
                }} />

                {/* Play button (centred) */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 backdrop-blur-sm border-2 border-white/40"
                    style={{ backgroundColor: 'rgba(255,90,95,0.92)' }}>
                    <Play className="w-7 h-7 md:w-8 md:h-8 text-white ml-1" fill="currentColor" />
                  </div>
                </div>

                {/* Duration badge (top-right) */}
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-md text-[11px] font-semibold text-white"
                  style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
                  {t.duration}
                </div>

                {/* Quote on bottom of thumbnail */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <Quote className="w-5 h-5 mb-2 opacity-80" style={{ color: '#FF5A5F' }} fill="currentColor" />
                  <p className="text-[15px] leading-snug font-medium line-clamp-3">
                    "{t.excerpt}"
                  </p>
                </div>
              </div>

              {/* Author */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold text-[15px]" style={{ color: '#111111' }}>{t.name}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {t.location}
                    <span className="text-gray-300">·</span>
                    <span>{t.area}</span>
                  </div>
                </div>
                <div className="flex gap-0.5 shrink-0">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5" style={{ fill: '#FF5A5F', color: '#FF5A5F' }} />
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Trust strip below grid */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 py-6 px-6 rounded-2xl border" style={{ backgroundColor: '#F8F6F3', borderColor: '#EAEAE5' }}>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4" style={{ fill: '#FF5A5F', color: '#FF5A5F' }} />
              ))}
            </div>
            <span className="text-sm font-semibold" style={{ color: '#111111' }}>4.9 / 5</span>
            <span className="text-sm text-gray-500">average client rating</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-gray-200" />
          <div className="text-sm text-gray-600">
            <span className="font-semibold" style={{ color: '#111111' }}>500+</span> families have found their land with us
          </div>
        </div>
      </div>

      {/* === Video modal === */}
      {active && (
        <VideoModal testimonial={active} onClose={() => setActive(null)} />
      )}
    </section>
  )
}

/* ----------------------------- Video Modal ----------------------------- */

function VideoModal({ testimonial, onClose }: { testimonial: Testimonial; onClose: () => void }) {
  const [playing, setPlaying] = useState(true)

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      <div
        className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video */}
        <div className="relative aspect-video">
          <video
            key={testimonial.id}
            src={testimonial.videoUrl}
            poster={testimonial.thumbnail}
            controls
            autoPlay
            playsInline
            className="w-full h-full"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center">
                <Pause className="w-8 h-8 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Info bar */}
        <div className="p-5 md:p-6 text-white border-t border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg">{testimonial.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {testimonial.location}
                <span className="text-gray-600">·</span>
                <span>{testimonial.area}</span>
              </div>
            </div>
            <div className="flex gap-0.5 shrink-0">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4" style={{ fill: '#FF5A5F', color: '#FF5A5F' }} />
              ))}
            </div>
          </div>
          <blockquote className="mt-4 pl-4 border-l-2 text-sm md:text-base leading-relaxed text-gray-200 italic"
            style={{ borderColor: '#FF5A5F' }}>
            "{testimonial.excerpt}"
          </blockquote>
        </div>
      </div>
    </div>
  )
}
