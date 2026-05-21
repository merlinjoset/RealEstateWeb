import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Heart, Ruler, Home, CheckCircle, Phone } from 'lucide-react'
import type { Property } from '../../types'
import { propertiesApi, resolveMediaUrl } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import ShareButton from './ShareButton'

interface Props {
  property: Property
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

// Static placeholder used whenever the seller hasn't uploaded any
// images yet. Lives in /public so it's served directly by the web
// server — no API round-trip, no flicker. Replace the file in public/
// to update the placeholder visual.
const NO_IMAGE = '/noimage.svg'

export default function PropertyCard({ property }: Props) {
  const imageSrc = property.images?.[0]
    ? resolveMediaUrl(property.images[0])
    : NO_IMAGE

  // Favourite handling — self-contained so the heart works on every page
  // (PropertiesPage, FeaturedProperties, MapView, etc.), not just the
  // dedicated FavoritesPage. Reads the shared ['favorites'] query cache
  // so all cards stay in sync. Anonymous users are redirected to /login
  // with `from` state so they land back on the same page after sign-in.
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const favoritesQuery = useQuery({
    queryKey: ['favorites'],
    queryFn: propertiesApi.getFavorites,
    enabled: isAuthenticated,
    staleTime: 60_000,
  })
  const isFavorited = Array.isArray(favoritesQuery.data)
    && favoritesQuery.data.some((p) => p.id === property.id)
  const toggleFavorite = useMutation({
    mutationFn: () => propertiesApi.toggleFavorite(property.id),
    // Optimistic flip — fill/empty the heart immediately, roll back on error.
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] })
      const prev = queryClient.getQueryData<Property[]>(['favorites']) ?? []
      const next = isFavorited
        ? prev.filter((p) => p.id !== property.id)
        : [property, ...prev]
      queryClient.setQueryData(['favorites'], next)
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['favorites'], ctx.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  })
  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    if (!toggleFavorite.isPending) toggleFavorite.mutate()
  }

  return (
    <div className="card group">
      <Link to={`/properties/${property.id}`} className="block">
        <div className="relative overflow-hidden h-48">
          <img
            src={imageSrc}
            alt={property.title}
            // If the real image fails to load (404, broken URL), swap to
            // the local placeholder so the card never shows a broken icon.
            onError={(e) => {
              const img = e.currentTarget
              if (img.src !== window.location.origin + NO_IMAGE) img.src = NO_IMAGE
            }}
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
            onClick={handleHeartClick}
            disabled={toggleFavorite.isPending}
            aria-label={isFavorited ? 'Remove from favourites' : 'Save to favourites'}
            title={isAuthenticated
              ? (isFavorited ? 'Remove from favourites' : 'Save to favourites')
              : 'Sign in to save properties'}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm disabled:opacity-60"
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
          {/* Admin-assigned serial / ref code, shown as a small monospace tag
              above the title. Hidden when no serial is set (most legacy
              imports). */}
          {property.serialNo && (
            <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-gray-400 mb-1">
              {property.serialNo}
            </div>
          )}
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
          <div className="ml-auto flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <ShareButton
              variant="icon"
              title={property.title}
              description={`${property.areaInCents} cents in ${property.city} – ${formatLakhs(property.totalPrice)}`}
              url={`${typeof window !== 'undefined' ? window.location.origin : ''}/properties/${property.id}`}
            />
            <a
              href="tel:+919994488490"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs font-medium hover:underline"
              style={{ color: '#FF5A5F' }}
            >
              <Phone className="w-3.5 h-3.5" />
              Call
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
