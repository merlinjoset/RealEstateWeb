import { Navigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Heart, MapPin, Loader2, AlertCircle, Search, Trash2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { propertiesApi } from '../services/api'
import PageHeader from '../components/layout/PageHeader'
import PropertyCard from '../components/properties/PropertyCard'

export default function FavoritesPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['favorites'],
    queryFn: () => propertiesApi.getFavorites(),
    enabled: isAuthenticated,
  })

  const unfavorite = useMutation({
    mutationFn: (id: number) => propertiesApi.toggleFavorite(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  })

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#FF5A5F' }} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: '/favorites' }} replace />
  }

  const items = query.data ?? []

  return (
    <main className="min-h-screen pb-16" style={{ backgroundColor: '#F8F6F3' }}>
      <PageHeader
        eyebrow="Saved for later"
        title="Your Favorites"
        highlight="Favorites"
        description="Properties you've saved while browsing — keep tabs on the ones you love and jump back to them anytime."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2">
        {/* Stats strip */}
        {!query.isLoading && !query.isError && (
          <div className="flex items-center justify-between mb-6 px-1">
            <p className="text-sm font-medium" style={{ color: '#374151' }}>
              {items.length === 0
                ? 'No saved properties yet'
                : `${items.length} saved propert${items.length === 1 ? 'y' : 'ies'}`}
            </p>
            <Link to="/properties"
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
              style={{ color: '#FF5A5F' }}>
              <Search className="w-4 h-4" /> Browse more
            </Link>
          </div>
        )}

        {/* Loading */}
        {query.isLoading && (
          <div className="py-20 text-center text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" />
            <p className="text-sm">Loading your favorites…</p>
          </div>
        )}

        {/* Error */}
        {query.isError && (
          <div className="py-20 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
            <p className="text-sm text-red-600 font-medium">Failed to load your favorites.</p>
            <button onClick={() => query.refetch()}
              className="mt-3 text-xs font-semibold underline" style={{ color: '#FF5A5F' }}>
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!query.isLoading && !query.isError && items.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-5"
              style={{ backgroundColor: 'rgba(255,90,95,0.10)', color: '#FF5A5F' }}>
              <Heart className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2 tracking-tight" style={{ color: '#111111' }}>
              No favorites yet
            </h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
              Tap the heart icon on any listing to save it here. We'll keep your favorites private,
              ready for the next time you visit.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/properties"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-sm transition-colors"
                style={{ backgroundColor: '#FF5A5F' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e04a4f')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FF5A5F')}>
                <Search className="w-4 h-4" /> Browse Properties
              </Link>
              <Link to="/map"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border transition-colors"
                style={{ borderColor: '#6A9739', color: '#6A9739' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(106,151,57,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                <MapPin className="w-4 h-4" /> Open Map View
              </Link>
            </div>
          </div>
        )}

        {/* Grid of saved properties */}
        {!query.isLoading && !query.isError && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((p) => (
              <div key={p.id} className="relative group">
                {/* PropertyCard self-manages the heart (reads ['favorites']
                    cache, toggles via propertiesApi). The hover-only Trash
                    overlay below is the explicit "remove" affordance for
                    this page specifically. */}
                <PropertyCard property={p} />
                {/* Unfavorite quick-action overlay */}
                <button
                  onClick={() => unfavorite.mutate(p.id)}
                  disabled={unfavorite.isPending}
                  className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md transition-all opacity-0 group-hover:opacity-100 disabled:opacity-60"
                  style={{ backgroundColor: 'rgba(220,38,38,0.92)' }}
                  title="Remove from favorites">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
