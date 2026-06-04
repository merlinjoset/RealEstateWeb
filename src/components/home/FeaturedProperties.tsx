import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Loader2 } from 'lucide-react'
import PropertyCard from '../properties/PropertyCard'
import { propertiesApi } from '../../services/api'

export default function FeaturedProperties() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: propertiesApi.getFeatured,
    staleTime: 5 * 60_000,
  })

  // Show up to 4 cards. If the API returns fewer, the grid just collapses
  // — better than padding with synthetic placeholders that might look real.
  const featured = (data ?? []).slice(0, 4)

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
            <p className="text-gray-500 mt-1">Hand-picked land listings in Kanyakumari district</p>
          </div>
          <Link
            to="/properties"
            className="hidden sm:flex items-center gap-1 font-semibold hover:gap-2 transition-all"
            style={{ color: '#FF5A5F' }}
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-gray-400">
            <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2" />
            <p className="text-sm">Loading featured properties…</p>
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-red-500">
            Couldn't load featured properties right now. Please refresh.
          </div>
        ) : featured.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-500">
            No featured properties yet — <Link to="/properties" className="font-semibold underline" style={{ color: '#FF5A5F' }}>browse all listings</Link>.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}

        <div className="sm:hidden mt-6 text-center">
          <Link to="/properties" className="btn-primary inline-flex">
            View all properties <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
