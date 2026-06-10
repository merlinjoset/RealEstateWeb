import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { resolveMediaUrl } from '../../services/api'

// Single static placeholder shown when a property has no uploaded
// images. Lives in /public so it ships with the bundle.
const NO_IMAGE = '/noimage.svg'

interface Props {
  images: string[]
  title: string
}

export default function PropertyGallery({ images, title }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  // Resolve every DB-relative path against the API origin so the
  // browser can fetch directly from api.joseforland.com (or whatever
  // VITE_API_BASE_URL points at). When the seller hasn't uploaded any
  // images, fall through to a single placeholder rather than rotating
  // through stock photos that misrepresent the listing.
  const displayImages = images.length > 0
    ? images.map(resolveMediaUrl)
    : [NO_IMAGE]
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    if (img.src !== window.location.origin + NO_IMAGE) img.src = NO_IMAGE
  }

  const prev = () => setLightbox((i) => (i !== null ? (i - 1 + displayImages.length) % displayImages.length : 0))
  const next = () => setLightbox((i) => (i !== null ? (i + 1) % displayImages.length : 0))

  // Lock the page scroll while the lightbox is open so the photo
  // stays anchored and the map / page content below can't slip
  // behind the overlay. Also: Esc closes the lightbox, ← / → step
  // through images — keyboard parity with the on-screen buttons.
  useEffect(() => {
    if (lightbox === null) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      setLightbox(null)
      else if (e.key === 'ArrowLeft')  prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [lightbox])

  return (
    <>
      {/* Mobile: one large uncropped image + a horizontal thumbnail strip.
          object-contain (on a neutral backdrop) shows the whole photo so
          portrait phone shots aren't cropped to a sliver. The 4-up mosaic
          below is desktop-only — it was crushing on a phone. */}
      <div className="sm:hidden">
        <div
          className="rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
          onClick={() => setLightbox(0)}
        >
          <img
            src={displayImages[0]}
            alt={`${title} - photo 1`}
            onError={handleImgError}
            className="w-full h-72 object-contain"
          />
        </div>
        {displayImages.length > 1 && (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {displayImages.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${title} - thumbnail ${i + 1}`}
                onError={handleImgError}
                onClick={() => setLightbox(i)}
                className="h-16 w-20 shrink-0 object-cover rounded-lg cursor-pointer border border-gray-200"
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop / tablet: the 4-up mosaic. */}
      <div className="hidden sm:grid grid-cols-4 grid-rows-2 gap-2 h-96 rounded-xl overflow-hidden">
        <div
          className="col-span-2 row-span-2 cursor-pointer"
          onClick={() => setLightbox(0)}
        >
          <img
            src={displayImages[0]}
            alt={`${title} - photo 1`}
            onError={handleImgError}
            className="w-full h-full object-cover hover:opacity-95 transition-opacity"
          />
        </div>
        {displayImages.slice(1, 5).map((src, i) => (
          <div
            key={i}
            className="cursor-pointer relative"
            onClick={() => setLightbox(i + 1)}
          >
            <img
              src={src}
              alt={`${title} - photo ${i + 2}`}
              onError={handleImgError}
              className="w-full h-full object-cover hover:opacity-95 transition-opacity"
            />
            {i === 3 && displayImages.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold text-lg">
                +{displayImages.length - 5} more
              </div>
            )}
          </div>
        ))}
      </div>

      {lightbox !== null && (
        // z-index has to clear the Leaflet map's internal panes (up to
        // ~z-1000) plus our navbar at z-[1200], otherwise the property-
        // location map below the fold paints on top of the lightbox.
        <div className="fixed inset-0 bg-black/95 z-[1300] flex items-center justify-center">
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
          >
            <X className="w-7 h-7" />
          </button>

          <button onClick={prev} className="absolute left-4 text-white hover:text-gray-300 p-2">
            <ChevronLeft className="w-8 h-8" />
          </button>

          <img
            src={displayImages[lightbox]}
            alt={`${title} - photo ${lightbox + 1}`}
            onError={handleImgError}
            className="max-w-[88vw] sm:max-w-5xl max-h-[80vh] sm:max-h-[85vh] object-contain mx-4 sm:mx-16"
          />

          <button onClick={next} className="absolute right-4 text-white hover:text-gray-300 p-2">
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="absolute bottom-4 text-white text-sm">
            {lightbox + 1} / {displayImages.length}
          </div>
        </div>
      )}
    </>
  )
}
