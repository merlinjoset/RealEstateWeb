import { useState } from 'react'
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

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-96 rounded-xl overflow-hidden">
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
            className="max-w-5xl max-h-[85vh] object-contain mx-16"
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
