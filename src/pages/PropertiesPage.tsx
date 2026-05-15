import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, Grid3X3, List, ChevronLeft, ChevronRight, Map as MapIcon } from 'lucide-react'
import SEO from '../components/common/SEO'
import PropertyCard from '../components/properties/PropertyCard'
import type { Property } from '../types'

const MOCK_PROPERTIES: Property[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: [
    '15 Cents Prime Land - Nagercoil', '10 Cents Land with 3BHK - Marthandam',
    '50 Cents Agricultural Land - Thuckalay', '8 Cents Residential Plot - Kanyakumari',
    '20 Cents Open Plot - Colachel', '5 Cents Corner Plot - Padmanabhapuram',
    '30 Cents Farm Land - Boothapandi', '12 Cents Plot Near Highway - Nagercoil',
    '25 Cents Land with Well - Eraniel', '6 Cents Residential Land - Marthandam',
    '100 Cents Estate - Thuckalay', '7 Cents Plot Near Beach - Kanyakumari',
  ][i],
  description: 'Prime location property with clear legal documents',
  totalPrice: [2250000, 4500000, 3500000, 1600000, 2800000, 750000, 4200000, 1800000, 3750000, 900000, 8500000, 1400000][i],
  pricePerCent: [150000, 450000, 70000, 200000, 140000, 150000, 140000, 150000, 150000, 150000, 85000, 200000][i],
  address: 'Town Area',
  city: ['Nagercoil', 'Marthandam', 'Thuckalay', 'Kanyakumari', 'Colachel', 'Padmanabhapuram',
         'Boothapandi', 'Nagercoil', 'Eraniel', 'Marthandam', 'Thuckalay', 'Kanyakumari'][i],
  district: 'Kanyakumari',
  state: 'Tamil Nadu',
  pinCode: '629001',
  areaInCents: [15, 10, 50, 8, 20, 5, 30, 12, 25, 6, 100, 7][i],
  bedrooms: i % 3 === 1 ? 3 : undefined,
  bathrooms: i % 3 === 1 ? 2 : undefined,
  propertyType: (['open_land', 'land_with_building', 'agricultural', 'residential_plot', 'open_land', 'residential_plot',
    'agricultural', 'open_land', 'open_land', 'residential_plot', 'agricultural', 'residential_plot'] as Property['propertyType'][])[i],
  status: 'for_sale',
  images: [],
  features: [],
  agentId: 1,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  isFeatured: i < 3,
  isVerified: i % 2 === 0,
  roadAccess: i % 3 !== 2,
}))

const CITIES = ['Nagercoil', 'Marthandam', 'Thuckalay', 'Kanyakumari', 'Colachel', 'Padmanabhapuram', 'Boothapandi', 'Eraniel']
const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: 0 },
  { label: 'Below ₹15L', min: 0, max: 1500000 },
  { label: '₹15L – ₹25L', min: 1500000, max: 2500000 },
  { label: '₹25L – ₹50L', min: 2500000, max: 5000000 },
  { label: 'Above ₹50L', min: 5000000, max: 0 },
]

export default function PropertiesPage() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '')
  const [priceRange, setPriceRange] = useState(0)
  const [propertyType, setPropertyType] = useState<string>('')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 9

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

  const filtered = MOCK_PROPERTIES.filter((p) => {
    const q = search.toLowerCase()
    if (q && !p.title.toLowerCase().includes(q) && !p.city.toLowerCase().includes(q)) return false
    if (selectedCity && p.city !== selectedCity) return false
    if (propertyType && p.propertyType !== propertyType) return false
    const pr = PRICE_RANGES[priceRange]
    if (pr.min && p.totalPrice < pr.min) return false
    if (pr.max && p.totalPrice > pr.max) return false
    return true
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.totalPrice - b.totalPrice
    if (sortBy === 'price_desc') return b.totalPrice - a.totalPrice
    if (sortBy === 'area_asc') return a.areaInCents - b.areaInCents
    if (sortBy === 'area_desc') return b.areaInCents - a.areaInCents
    return b.id - a.id
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{filtered.length}</span> properties found
          </p>
        </div>

        {paginated.length === 0 ? (
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

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
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
