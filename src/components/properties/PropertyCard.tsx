import { Link } from 'react-router-dom'
import { MapPin, Heart, Ruler, Home, CheckCircle, Phone } from 'lucide-react'
import type { Property } from '../../types'

interface Props {
  property: Property
  onFavorite?: (id: number) => void
  isFavorited?: boolean
}

function formatLakhs(amount: number) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`
  return `₹${amount.toLocaleString('en-IN')}`
}

const TYPE_LABELS: Record<Property['propertyType'], string> = {
  open_land: 'Open Land',
  land_with_building: 'Land + Building',
  agricultural: 'Agricultural',
  commercial: 'Commercial',
  residential_plot: 'Residential Plot',
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1464082354059-27db6ce50048?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=600&q=80&auto=format&fit=crop',
]

export default function PropertyCard({ property, onFavorite, isFavorited }: Props) {
  const imageSrc = property.images?.[0] || FALLBACK_IMAGES[property.id % 3]

  return (
    <div className="card group">
      <Link to={`/properties/${property.id}`} className="block">
        <div className="relative overflow-hidden h-48">
          <img
            src={imageSrc}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          <div className="absolute top-3 left-3 flex gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: '#293237' }}>
              {TYPE_LABELS[property.propertyType]}
            </span>
            {property.isFeatured && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-500 text-white">
                Featured
              </span>
            )}
          </div>

          {property.isVerified && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2 py-1 rounded-full" style={{ color: '#6A9739' }}>
              <CheckCircle className="w-3 h-3" />
              Verified
            </div>
          )}

          <button
            onClick={(e) => {
              e.preventDefault()
              onFavorite?.(property.id)
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'
              }`}
            />
          </button>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/properties/${property.id}`}>
          <h3 className="font-semibold text-gray-900 transition-colors line-clamp-1 mb-1 hover:text-[#FF5A5F]">
            {property.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="line-clamp-1">
            {property.city}, Kanyakumari Dist.
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xl font-bold" style={{ color: '#FF5A5F' }}>
              {formatLakhs(property.totalPrice)}
            </div>
            {property.pricePerCent && (
              <div className="text-xs text-gray-500">
                {formatLakhs(property.pricePerCent)}/cent
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{ backgroundColor: 'rgba(106,151,57,0.1)', color: '#6A9739' }}>
            <Ruler className="w-3.5 h-3.5" />
            {property.areaInCents} cents
          </div>
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
          {property.bedrooms != null && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Home className="w-3.5 h-3.5" />
              {property.bedrooms} BHK
            </div>
          )}
          {property.roadAccess && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Road Access</span>
          )}
          <a
            href="tel:+919994488490"
            onClick={(e) => e.stopPropagation()}
            className="ml-auto flex items-center gap-1 text-xs font-medium hover:underline"
            style={{ color: '#FF5A5F' }}
          >
            <Phone className="w-3.5 h-3.5" />
            Call
          </a>
        </div>
      </div>
    </div>
  )
}
