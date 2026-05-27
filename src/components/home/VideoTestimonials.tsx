import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Play, Pause, Quote, Star, MapPin, X, Loader2 } from 'lucide-react'
import { testimonialsApi, type Testimonial } from '../../services/api'

/**
 * Classify a video URL so the modal can pick the right player.
 *
 *  - youtube/youtu.be/shorts → iframe embed (HTML <video> can't decode them)
 *  - everything else → native <video src=...> (MP4 / WebM / etc.)
 *
 * Returns the embeddable URL alongside the kind so callers don't need
 * to re-parse. Shorts get a portrait flag so the modal can swap to a
 * 9:16 aspect ratio.
 */
type VideoSource =
  | { kind: 'youtube'; src: string; portrait: boolean }
  | { kind: 'native';  src: string }

function classifyVideoUrl(raw: string | null | undefined): VideoSource {
  const url = (raw ?? '').trim()
  if (!url) return { kind: 'native', src: '' }

  // Shorts:  https://youtube.com/shorts/{id}[?...]
  const shorts = url.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/)
  if (shorts) return { kind: 'youtube', src: `https://www.youtube.com/embed/${shorts[1]}?autoplay=1&playsinline=1`, portrait: true }

  // Short-link:  https://youtu.be/{id}[?...]
  const short = url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/)
  if (short) return { kind: 'youtube', src: `https://www.youtube.com/embed/${short[1]}?autoplay=1`, portrait: false }

  // Watch / embed:  ?v={id} OR /embed/{id}
  const watch = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/)
  if (watch) return { kind: 'youtube', src: `https://www.youtube.com/embed/${watch[1]}?autoplay=1`, portrait: false }
  const embed = url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/)
  if (embed) return { kind: 'youtube', src: `https://www.youtube.com/embed/${embed[1]}?autoplay=1`, portrait: false }

  return { kind: 'native', src: url }
}

export default function VideoTestimonials() {
  const [active, setActive] = useState<Testimonial | null>(null)

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['testimonials', 'published'],
    queryFn: () => testimonialsApi.getPublished(),
    staleTime: 1000 * 60 * 5,
  })

  // Hide entire section when there are no published testimonials
  if (!isLoading && testimonials.length === 0) return null

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

        {/* Loading state */}
        {isLoading && (
          <div className="py-12 text-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading testimonials…</p>
          </div>
        )}

        {/* Video grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <article
              key={t.id}
              className="group cursor-pointer"
              onClick={() => setActive(t)}
            >
              {/* Thumbnail with play button */}
              <div className="relative overflow-hidden rounded-2xl aspect-[4/5] mb-5">
                <img
                  src={t.thumbnail ?? ''}
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
                {t.duration && (
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-md text-[11px] font-semibold text-white"
                    style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
                    {t.duration}
                  </div>
                )}

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
                    {t.propertyDetail && <>
                      <span className="text-gray-300">·</span>
                      <span>{t.propertyDetail}</span>
                    </>}
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
  const source = classifyVideoUrl(testimonial.videoUrl)

  // YouTube Shorts are filmed portrait (9:16); regular YouTube videos
  // and native MP4s default to landscape (16:9). Pick the right modal
  // width too — portrait shorts shouldn't stretch to 4xl.
  const isPortrait = source.kind === 'youtube' && source.portrait
  const modalWidth = isPortrait ? 'max-w-md' : 'max-w-4xl'
  const aspectClass = isPortrait ? 'aspect-[9/16]' : 'aspect-video'

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
        className={`relative w-full ${modalWidth} bg-black rounded-2xl overflow-hidden shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video — YouTube/Shorts iframe vs native MP4/WebM player */}
        <div className={`relative ${aspectClass}`}>
          {source.kind === 'youtube' ? (
            <iframe
              key={testimonial.id}
              src={source.src}
              title={testimonial.name}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <>
              <video
                key={testimonial.id}
                src={source.src}
                poster={testimonial.thumbnail ?? ''}
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
            </>
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
                {testimonial.propertyDetail && <>
                  <span className="text-gray-600">·</span>
                  <span>{testimonial.propertyDetail}</span>
                </>}
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
