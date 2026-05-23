import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, SlidersHorizontal, X, Grid3X3, List, ChevronLeft, ChevronRight, Map as MapIcon, Loader2, AlertCircle } from 'lucide-react'
import SEO from '../components/common/SEO'
import PropertyCard from '../components/properties/PropertyCard'
import { propertiesApi } from '../services/api'

const CITIES = ['Nagercoil', 'Marthandam', 'Thuckalay', 'Kanyakumari', 'Colachel', 'Kaliyakkavilai']
const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: 0 },
  { label: 'Below ₹15L', min: 0, max: 1500000 },
  { label: '₹15L – ₹25L', min: 1500000, max: 2500000 },
  { label: '₹25L – ₹50L', min: 2500000, max: 5000000 },
  { label: 'Above ₹50L', min: 5000000, max: 0 },
]

export default function PropertiesPage() {
  // Listing state lives in the URL so it survives navigation — the
  // "Back to listings" button on a detail page walks one step back in
  // browser history and lands on the same page+filters the user was
  // looking at. Local state mirrors the URL for write performance.
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '')
  const [priceRange, setPriceRange] = useState(() => Number(searchParams.get('price') || 0))
  const [propertyType, setPropertyType] = useState<string>(searchParams.get('type') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')
  const [showFilters, setShowFilters] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>(
    (searchParams.get('view') as 'grid' | 'list') || 'grid')
  const [page, setPage] = useState(() => Number(searchParams.get('page') || 1))
  const PAGE_SIZE = 9

  // Sync the URL whenever any listing-shaping state changes — that's
  // what makes browser back/forward restore the listing position.
  // We use replace: true so each filter tweak doesn't bloat history.
  useEffect(() => {
    const next = new URLSearchParams()
    if (search.trim()) next.set('search', search.trim())
    if (selectedCity) next.set('city', selectedCity)
    if (priceRange) next.set('price', String(priceRange))
    if (propertyType) next.set('type', propertyType)
    if (sortBy !== 'newest') next.set('sort', sortBy)
    if (view !== 'grid') next.set('view', view)
    if (page !== 1) next.set('page', String(page))
    setSearchParams(next, { replace: true })
  }, [search, selectedCity, priceRange, propertyType, sortBy, view, page, setSearchParams])

  // Scroll to top whenever the page number changes (skip the very first
  // mount so loading the route doesn't auto-scroll the user).
  const initialMount = useRef(true)
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  const pr = PRICE_RANGES[priceRange]
  const query = useQuery({
    queryKey: ['properties', { search, selectedCity, priceRange, propertyType, sortBy, page }],
    queryFn: () => propertiesApi.getAll({
      search: search.trim() || undefined,
      city: selectedCity || undefined,
      propertyType: (propertyType as 'open_land' | undefined) || undefined,
      minPrice: pr.min || undefined,
      maxPrice: pr.max || undefined,
      sortBy: sortBy as 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'area_asc' | 'area_desc',
      page,
      pageSize: PAGE_SIZE,
    }),
    placeholderData: (prev) => prev,    // keep old data visible while refetching → smoother filter UX
    staleTime: 30_000,
  })

  const paginated = query.data?.data ?? []
  const totalPages = query.data?.totalPages ?? 1
  const totalCount = query.data?.total ?? 0

  // Windowed pagination — show at most MAX_PAGE_BUTTONS numbered buttons so
  // the bar stays readable even with hundreds of pages. Center the window on
  // the current page and clamp to the start/end.
  const MAX_PAGE_BUTTONS = 10
  const pageWindow: number[] = (() => {
    if (totalPages <= MAX_PAGE_BUTTONS) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const half = Math.floor(MAX_PAGE_BUTTONS / 2)
    let start = Math.max(1, page - half)
    let end = start + MAX_PAGE_BUTTONS - 1
    if (end > totalPages) {
      end = totalPages
      start = end - MAX_PAGE_BUTTONS + 1
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  })()

  const clearFilters = () => {
    setSearch('')
    setSelectedCity('')
    setPriceRange(0)
    setPropertyType('')
    setPage(1)
  }

  const hasFilters = search || selectedCity || priceRange > 0 || propertyType

  return (
    <main className="min-h-screen bg-gray-50">
      <SEO
        path="/properties"
        title="Browse Land Listings"
        description="Browse verified plots and land for sale across Kanyakumari district — Nagercoil, Marthandam, Thuckalay, Colachel and more. Filter by price, area, and type."
      />
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search by city or location..."
                className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors"
              style={showFilters || hasFilters
                ? { backgroundColor: '#FF5A5F', color: 'white', borderColor: '#FF5A5F' }
                : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasFilters && (
                <span className="w-4 h-4 rounded-full bg-white text-xs flex items-center justify-center font-bold" style={{ color: '#FF5A5F' }}>
                  !
                </span>
              )}
            </button>

            <div className="hidden sm:flex items-center gap-1 border border-gray-200 rounded-xl p-1">
              <button
                onClick={() => setView('grid')}
                className={`p-1.5 rounded-lg transition-colors ${view === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-1.5 rounded-lg transition-colors ${view === 'list' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Map view toggle — olive pill (on-brand) */}
            <Link
              to="/map"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-sm hover:shadow-md"
              style={{ backgroundColor: '#6A9739' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#547a2d')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6A9739')}
              title="Switch to map view"
            >
              <span className="hidden sm:inline">Map</span>
              <MapIcon className="w-4 h-4" />
            </Link>
          </div>

          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1">Location</label>
                <select
                  value={selectedCity}
                  onChange={(e) => { setSelectedCity(e.target.value); setPage(1) }}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]"
                >
                  <option value="">All Locations</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1">Price Range</label>
                <select
                  value={priceRange}
                  onChange={(e) => { setPriceRange(Number(e.target.value)); setPage(1) }}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]"
                >
                  {PRICE_RANGES.map((r, i) => <option key={r.label} value={i}>{r.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1">Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => { setPropertyType(e.target.value); setPage(1) }}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]"
                >
                  <option value="">All Types</option>
                  <option value="open_land">Open Land</option>
                  <option value="land_with_building">Land + Building</option>
                  <option value="agricultural">Agricultural</option>
                  <option value="residential_plot">Residential Plot</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="area_asc">Area: Small to Large</option>
                  <option value="area_desc">Area: Large to Small</option>
                </select>
              </div>

              {hasFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700">
                  <X className="w-3.5 h-3.5" /> Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 inline-flex items-center gap-2">
            <span className="font-semibold text-gray-900">{totalCount.toLocaleString('en-IN')}</span> properties found
            {query.isFetching && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
          </p>
        </div>

        {query.isLoading ? (
          <div className="text-center py-20 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading properties…</p>
          </div>
        ) : query.isError ? (
          <div className="text-center py-20">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-sm text-red-600 mb-2">Couldn't load properties.</p>
            <button onClick={() => query.refetch()} className="text-xs font-semibold underline" style={{ color: '#FF5A5F' }}>
              Try again
            </button>
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No properties found for your search.</p>
            <button onClick={clearFilters} className="mt-4 btn-primary">
              Clear filters
            </button>
          </div>
        ) : (
          <div className={`grid gap-5 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {paginated.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {pageWindow[0] > 1 && (
              <>
                <button
                  onClick={() => setPage(1)}
                  className="w-9 h-9 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  1
                </button>
                {pageWindow[0] > 2 && <span className="px-1 text-gray-400 text-sm">…</span>}
              </>
            )}

            {pageWindow.map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  n === page
                    ? 'text-white'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                style={n === page ? { backgroundColor: '#FF5A5F' } : {}}
              >
                {n}
              </button>
            ))}

            {pageWindow[pageWindow.length - 1] < totalPages && (
              <>
                {pageWindow[pageWindow.length - 1] < totalPages - 1 && (
                  <span className="px-1 text-gray-400 text-sm">…</span>
                )}
                <button
                  onClick={() => setPage(totalPages)}
                  className="w-9 h-9 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
