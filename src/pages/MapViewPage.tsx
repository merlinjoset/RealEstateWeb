import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Phone, Ruler, X, ExternalLink, Search, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, List as ListIcon, Crosshair, AlertCircle } from 'lucide-react'
import { propertiesApi } from '../services/api'
import type { Property } from '../types'

function formatLakhs(amount: number) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`
  return `₹${amount.toLocaleString('en-IN')}`
}

// Approximate coordinates for Kanyakumari district areas
const LOCATIONS: Record<string, { lat: number; lng: number }> = {
  Nagercoil:       { lat: 8.1833, lng: 77.4119 },
  Marthandam:      { lat: 8.3072, lng: 77.2204 },
  Thuckalay:       { lat: 8.2400, lng: 77.2700 },
  Kanyakumari:     { lat: 8.0883, lng: 77.5385 },
  Colachel:        { lat: 8.1747, lng: 77.2583 },
  Kaliyakkavilai:  { lat: 8.2167, lng: 77.2667 },
  Eraniel:         { lat: 8.2058, lng: 77.3208 },
}

// Slight jitter so multiple properties in the same city don't overlap exactly
function jitter(seed: number) {
  return ((seed * 9301 + 49297) % 233280) / 233280 * 0.02 - 0.01
}


const TYPE_LABELS: Record<Property['propertyType'], string> = {
  open_land: 'Open Land',
  land_with_building: 'Land + Building',
  agricultural: 'Agricultural',
  commercial: 'Commercial',
  residential_plot: 'Residential Plot',
}

// Deep, saturated colours that read clearly against the OSM map background
const TYPE_COLORS: Record<Property['propertyType'], string> = {
  open_land: '#B91C1C',          // deep crimson red
  land_with_building: '#1E40AF', // deep royal blue
  agricultural: '#15803D',       // forest green
  commercial: '#0F172A',         // near-black slate
  residential_plot: '#B45309',   // deep amber/bronze
}

// Brighter, high-contrast variants tuned for legibility on a dark pill background
const TYPE_PRICE_COLORS: Record<Property['propertyType'], string> = {
  open_land: '#FCA5A5',          // bright soft red
  land_with_building: '#93C5FD', // bright sky blue
  agricultural: '#86EFAC',       // bright mint
  commercial: '#E2E8F0',         // bright slate-grey
  residential_plot: '#FCD34D',   // bright gold
}

// Build a custom DivIcon — Property-Finder-style deep navy "From [price]" pill
function makePinIcon(
  dotColor: string,
  _priceTone: string, // kept for backwards compat
  label: string,
  isSelected: boolean,
) {
  void _priceTone
  const scale = isSelected ? 1.18 : 1
  const isSel = isSelected
  // Default: brand olive pill with bold white text. Selected: coral for emphasis.
  const bg = isSel ? '#FF5A5F' : '#6A9739'
  const tailColor = isSel ? '#FF5A5F' : '#6A9739'

  const html = `
    <div style="
      transform: translate(-50%, -100%) scale(${scale});
      transform-origin: center bottom;
      transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
      filter:
        drop-shadow(0 3px 5px rgba(0,0,0,0.20))
        drop-shadow(0 8px 16px rgba(0,0,0,0.25));
    ">
      <div style="
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: ${bg};
        color: #FFFFFF;
        font-weight: 700;
        font-size: 13px;
        padding: 7px 13px;
        border-radius: 22px;
        white-space: nowrap;
        position: relative;
        font-family: Inter, system-ui, sans-serif;
        letter-spacing: -0.01em;
        line-height: 1;
      ">
        <span style="
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${dotColor};
          flex-shrink: 0;
        "></span>
        <span style="opacity: 0.85; font-weight: 500;">From</span>
        <span>${label}</span>
        <div style="
          position: absolute;
          left: 50%;
          bottom: -5px;
          transform: translateX(-50%) rotate(45deg);
          width: 10px;
          height: 10px;
          background: ${tailColor};
        "></div>
      </div>
    </div>
  `
  return L.divIcon({
    html,
    className: 'jfl-price-pin',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

// Compact label format like "From 28L" / "From 1.5Cr" / "From 540K"
function formatPriceShort(amount: number) {
  if (amount >= 10000000) return `${(amount / 10000000).toFixed(amount % 10000000 === 0 ? 0 : 2)}Cr`
  if (amount >= 100000) return `${Math.round(amount / 100000)}L`
  if (amount >= 1000) return `${Math.round(amount / 1000)}K`
  return `${amount}`
}

// Helper component to recenter the map when a property is selected
function MapFlyTo({ position }: { position: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.flyTo(position, 13, { duration: 0.8 })
    }
  }, [position, map])
  return null
}

function getPropertyCoords(property: Property): [number, number] {
  const base = LOCATIONS[property.city] || { lat: 8.18, lng: 77.41 }
  return [base.lat + jitter(property.id), base.lng + jitter(property.id * 7)]
}

const PRICE_RANGES = [
  { value: '', label: 'Any price', min: 0, max: 0 },
  { value: '0-10', label: 'Under ₹10 L', min: 0, max: 1000000 },
  { value: '10-25', label: '₹10 L – ₹25 L', min: 1000000, max: 2500000 },
  { value: '25-50', label: '₹25 L – ₹50 L', min: 2500000, max: 5000000 },
  { value: '50-100', label: '₹50 L – ₹1 Cr', min: 5000000, max: 10000000 },
  { value: '100+', label: 'Above ₹1 Cr', min: 10000000, max: 0 },
]

const AREA_RANGES = [
  { value: '', label: 'Any size', min: 0, max: 0 },
  { value: '0-10', label: 'Up to 10 cents', min: 0, max: 10 },
  { value: '10-25', label: '10 – 25 cents', min: 10, max: 25 },
  { value: '25-50', label: '25 – 50 cents', min: 25, max: 50 },
  { value: '50+', label: 'Above 50 cents', min: 50, max: 0 },
]

const CITIES = ['Nagercoil', 'Marthandam', 'Thuckalay', 'Kanyakumari', 'Colachel', 'Kaliyakkavilai', 'Eraniel']

const PAGE_SIZE = 10

// "Near me" radius options shown as a chip row above the map. 500 m is
// the default per product spec; the others give the visitor a way to
// widen the search when they're in a rural area without many close
// listings. `null` means "no geo filter" (show everything from the API).
const RADIUS_OPTIONS: { label: string; metres: number | null }[] = [
  { label: '500 m', metres: 500 },
  { label: '1 km',  metres: 1000 },
  { label: '2 km',  metres: 2000 },
  { label: '5 km',  metres: 5000 },
  { label: 'All',   metres: null },
]

export default function MapViewPage() {
  const [selected, setSelected] = useState<Property | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [cityFilter, setCityFilter] = useState<string>('')
  const [priceFilter, setPriceFilter] = useState<string>('')
  const [areaFilter, setAreaFilter] = useState<string>('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [listOpen, setListOpen] = useState(false)
  const [page, setPage] = useState(1)
  // Geolocation — set once the browser grants permission. `geoError`
  // captures denied / unavailable so we can surface a friendly message
  // instead of silently falling back.
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)
  const [geoError, setGeoError] = useState<string | null>(null)
  // Default radius is 500 m as per product spec. Set to null to disable
  // the radius filter and fall back to the unscoped query.
  const [radiusM, setRadiusM] = useState<number | null>(500)

  // Ask once on mount. Don't auto-prompt repeatedly — the browser dialog
  // is sticky enough on its own. Falls back gracefully when denied so
  // the rest of the page still works.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoError('Your browser doesn’t support geolocation — showing all listings.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        setGeoError(err.code === err.PERMISSION_DENIED
          ? 'Location permission denied — showing all listings.'
          : 'Couldn’t read your location — showing all listings.')
      },
      { enableHighAccuracy: true, timeout: 8_000, maximumAge: 60_000 },
    )
  }, [])

  // Reset to page 1 whenever any filter (incl. geo) changes — otherwise
  // paging beyond the new (smaller) result count would land on a stale
  // empty page.
  useEffect(() => {
    setPage(1)
  }, [userPos, radiusM, search, typeFilter, cityFilter, priceFilter, areaFilter])

  const geoActive = userPos != null && radiusM != null

  // Resolve the dropdown values into the min/max bounds the API expects.
  const priceBounds = PRICE_RANGES.find(r => r.value === priceFilter)
  const areaBounds  = AREA_RANGES.find(r => r.value === areaFilter)

  // Map view paginates 10-at-a-time so the pin density stays readable
  // and the page stays light. Every filter is sent to the API so the
  // total + pagination reflect the filtered result set (was broken
  // earlier because filtering happened client-side on a single page).
  const query = useQuery({
    queryKey: ['map-properties', page, search, typeFilter, cityFilter,
               priceFilter, areaFilter, userPos?.lat, userPos?.lng, radiusM],
    queryFn: () => propertiesApi.getAll({
      page,
      pageSize: PAGE_SIZE,
      sortBy: 'newest',
      search: search.trim() || undefined,
      city: cityFilter || undefined,
      propertyType: (typeFilter as 'open_land' | undefined) || undefined,
      minPrice: priceBounds?.min || undefined,
      maxPrice: priceBounds?.max || undefined,
      minAreaCents: areaBounds?.min || undefined,
      maxAreaCents: areaBounds?.max || undefined,
      // Only attach the geo params when the user has shared their
      // location AND chosen a radius. Otherwise the API returns the
      // un-scoped default.
      ...(geoActive ? { nearLat: userPos!.lat, nearLng: userPos!.lng, radiusM: radiusM! } : {}),
    }),
    placeholderData: (prev) => prev,    // keep last page visible while next loads
    staleTime: 60_000,
  })
  const visible = query.data?.data ?? []
  // Total matching the active filters — drives the "Page N of M · T total"
  // header and the pagination bar.
  const totalInDb = query.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalInDb / PAGE_SIZE))
  // Windowed page-number bar — at most MAX_PAGE_BUTTONS visible at once,
  // centred on the current page. First/last are always anchored with
  // ellipses bridging the gap. Matches the PropertiesPage pattern.
  const MAX_PAGE_BUTTONS = 7
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

  const activeCount = [typeFilter, cityFilter, priceFilter, areaFilter].filter(Boolean).length
  const hasFilters = activeCount > 0 || search.trim().length > 0

  const clearAll = () => {
    setSearch('')
    setTypeFilter('')
    setCityFilter('')
    setPriceFilter('')
    setAreaFilter('')
  }

  const selectedPos: [number, number] | null = selected ? getPropertyCoords(selected) : null

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F6F3' }}>
      {/* === Global search & filter bar === */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg md:text-xl font-bold" style={{ color: '#111111' }}>Map View</h1>
              <p className="text-xs md:text-sm text-gray-500">Browse land across Kanyakumari district</p>
            </div>
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-sm hover:shadow-md"
              style={{ backgroundColor: '#6A9739' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#547a2d')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6A9739')}
              title="Switch to list view"
            >
              <ListIcon className="w-4 h-4" />
              <span>List View</span>
            </Link>
          </div>

          {/* Main search row */}
          <div className="flex flex-col lg:flex-row gap-2.5">
            {/* Search input */}
            <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 focus-within:border-[#FF5A5F] transition-colors">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by city, location, or landmark..."
                className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Compact dropdowns (desktop) */}
            <div className="hidden lg:flex items-center gap-2">
              <FilterSelect
                value={cityFilter}
                onChange={setCityFilter}
                placeholder="Any city"
                options={[{ value: '', label: 'Any city' }, ...CITIES.map(c => ({ value: c, label: c }))]}
              />
              <FilterSelect
                value={priceFilter}
                onChange={setPriceFilter}
                placeholder="Any price"
                options={PRICE_RANGES.map(p => ({ value: p.value, label: p.label }))}
              />
              <FilterSelect
                value={areaFilter}
                onChange={setAreaFilter}
                placeholder="Any size"
                options={AREA_RANGES.map(a => ({ value: a.value, label: a.label }))}
              />
            </div>

            {/* Advanced filter toggle (mobile) */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="lg:hidden inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors"
              style={showAdvanced || activeCount > 0
                ? { backgroundColor: '#FF5A5F', color: 'white', borderColor: '#FF5A5F' }
                : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeCount > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-white text-[10px] font-bold flex items-center justify-center" style={{ color: '#FF5A5F' }}>
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          {/* Advanced filters drawer (mobile) */}
          {showAdvanced && (
            <div className="lg:hidden mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <FilterSelect value={cityFilter} onChange={setCityFilter} placeholder="Any city"
                options={[{ value: '', label: 'Any city' }, ...CITIES.map(c => ({ value: c, label: c }))]} />
              <FilterSelect value={priceFilter} onChange={setPriceFilter} placeholder="Any price"
                options={PRICE_RANGES.map(p => ({ value: p.value, label: p.label }))} />
              <FilterSelect value={areaFilter} onChange={setAreaFilter} placeholder="Any size"
                options={AREA_RANGES.map(a => ({ value: a.value, label: a.label }))} />
            </div>
          )}

          {/* Type filter chips (always visible) */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {[
              { value: '', label: 'All Types' },
              { value: 'open_land', label: 'Open Land' },
              { value: 'land_with_building', label: 'Land + Building' },
              { value: 'agricultural', label: 'Agricultural' },
              { value: 'residential_plot', label: 'Residential Plot' },
              { value: 'commercial', label: 'Commercial' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTypeFilter(value)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors border"
                style={typeFilter === value
                  ? { backgroundColor: '#FF5A5F', color: 'white', borderColor: '#FF5A5F' }
                  : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }}
              >
                {label}
              </button>
            ))}

            {hasFilters && (
              <button
                onClick={clearAll}
                className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors"
                style={{ color: '#FF5A5F' }}
              >
                <X className="w-3 h-3" /> Clear all ({activeCount + (search ? 1 : 0)})
              </button>
            )}
          </div>

          {/* "Near me" radius selector — only shown once the browser has
              granted geolocation. Chip styling matches the type filter
              above so the controls feel related. */}
          {userPos && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500">
                <Crosshair className="w-3.5 h-3.5" style={{ color: '#4F46E5' }} />
                Near me
              </span>
              {RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setRadiusM(opt.metres)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors border"
                  style={radiusM === opt.metres
                    ? { backgroundColor: '#4F46E5', color: 'white', borderColor: '#4F46E5' }
                    : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
          {geoError && (
            <p className="mt-2 text-xs flex items-center gap-1" style={{ color: '#B45309' }}>
              <AlertCircle className="w-3.5 h-3.5" /> {geoError}
            </p>
          )}
        </div>
      </div>

      {/* Selected-property banner — flows above the map row when something
          is selected, so the details sit out of the map area entirely
          instead of overlaying pins. Horizontal layout on desktop, wraps
          gracefully on small screens. */}
      {selected && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">{selected.title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full text-white whitespace-nowrap"
                    style={{ backgroundColor: TYPE_COLORS[selected.propertyType] }}>
                    {TYPE_LABELS[selected.propertyType]}
                  </span>
                  {selected.isVerified && (
                    <span className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{ backgroundColor: 'rgba(106,151,57,0.1)', color: '#6A9739' }}>
                      ✓ Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                  <MapPin className="w-3 h-3" />
                  {selected.city}, Kanyakumari Dist.
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold leading-none" style={{ color: '#FF5A5F' }}>
                  {formatLakhs(selected.totalPrice)}
                </div>
                {selected.pricePerCent && (
                  <div className="text-[11px] text-gray-500 mt-0.5">{formatLakhs(selected.pricePerCent)}/cent</div>
                )}
              </div>

              <div className="text-right border-l border-gray-200 pl-4">
                <div className="text-sm font-semibold text-gray-900 leading-none">{selected.areaInCents} cents</div>
                <div className="text-[11px] text-gray-500 mt-0.5">Total area</div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="tel:+919994488490"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
                  style={{ backgroundColor: '#FF5A5F' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e04a4f')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FF5A5F')}
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call
                </a>
                <Link
                  to={`/properties/${selected.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors"
                  style={{ borderColor: '#6A9739', color: '#6A9739' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(106,151,57,0.08)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Details
                </Link>
                <button
                  onClick={() => setSelected(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  aria-label="Clear selection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row h-[70vh] md:h-[calc(100vh-180px)] min-h-[480px] relative">
        {/* Left sidebar — property list (drawer on mobile) */}
        <div
          className={`bg-white border-r border-gray-200 overflow-y-auto
            md:w-80 md:shrink-0 md:relative md:translate-x-0
            absolute inset-y-0 left-0 z-[1100] w-[85%] max-w-xs shadow-2xl md:shadow-none
            transition-transform duration-200
            ${listOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        >
          <div className="p-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500 font-medium">
              {totalInDb > 0
                ? `Page ${page} of ${totalPages} · ${totalInDb} total`
                : `${visible.length} properties`}
            </p>
            <button
              onClick={() => setListOpen(false)}
              className="md:hidden p-1 -m-1 text-gray-400 hover:text-gray-600"
              aria-label="Close list"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {visible.map((property) => (
              <button
                key={property.id}
                onClick={() => {
                  setSelected(selected?.id === property.id ? null : property)
                  setListOpen(false) // collapse drawer on mobile after picking
                }}
                className="w-full text-left p-3 hover:bg-gray-50 transition-colors"
                style={selected?.id === property.id ? { backgroundColor: 'rgba(255,90,95,0.06)' } : {}}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: TYPE_COLORS[property.propertyType] }}>
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm line-clamp-1 mb-0.5">
                      {property.title}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {property.city}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold" style={{ color: '#FF5A5F' }}>
                        {formatLakhs(property.totalPrice)}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'rgba(106,151,57,0.1)', color: '#6A9739' }}>
                        <Ruler className="w-2.5 h-2.5 inline mr-0.5" />
                        {property.areaInCents} cents
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Pagination — windowed at MAX_PAGE_BUTTONS, sits at the bottom
              of the sidebar list so it's always reachable. */}
          {totalPages > 1 && (
            <div className="p-3 border-t border-gray-100 flex items-center justify-center gap-1 sticky bottom-0 bg-white">
              <button
                disabled={page === 1}
                onClick={() => { setPage(p => p - 1); setSelected(null) }}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                aria-label="Previous page">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {pageWindow[0] > 1 && (
                <>
                  <button onClick={() => { setPage(1); setSelected(null) }}
                    className="w-7 h-7 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                    1
                  </button>
                  {pageWindow[0] > 2 && <span className="px-0.5 text-gray-400 text-xs">…</span>}
                </>
              )}

              {pageWindow.map((n) => (
                <button key={n}
                  onClick={() => { setPage(n); setSelected(null) }}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                    n === page ? 'text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                  style={n === page ? { backgroundColor: '#FF5A5F' } : {}}>
                  {n}
                </button>
              ))}

              {pageWindow[pageWindow.length - 1] < totalPages && (
                <>
                  {pageWindow[pageWindow.length - 1] < totalPages - 1 && (
                    <span className="px-0.5 text-gray-400 text-xs">…</span>
                  )}
                  <button onClick={() => { setPage(totalPages); setSelected(null) }}
                    className="w-7 h-7 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                    {totalPages}
                  </button>
                </>
              )}

              <button
                disabled={page === totalPages}
                onClick={() => { setPage(p => p + 1); setSelected(null) }}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                aria-label="Next page">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Drawer scrim (mobile only) */}
        {listOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-[1099]"
            onClick={() => setListOpen(false)}
          />
        )}

        {/* Map area */}
        <div className="flex-1 relative min-h-0">
          <MapContainer
            // Centre on the visitor's position when we have it, otherwise
            // fall back to the geographic centre of Kanyakumari district.
            center={userPos ? [userPos.lat, userPos.lng] : [8.18, 77.41]}
            zoom={userPos ? 14 : 11}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapFlyTo position={selectedPos ?? (userPos ? [userPos.lat, userPos.lng] : null)} />

            {/* Crosshair pin + radius ring at the visitor's position so
                they can see where the "near me" filter is anchored. The
                Circle radius is in metres which matches the API filter. */}
            {userPos && (
              <Marker
                position={[userPos.lat, userPos.lng]}
                icon={L.divIcon({
                  className: 'jfl-user-pin',
                  iconSize: [18, 18],
                  iconAnchor: [9, 9],
                  html: `<div style="width:18px;height:18px;border-radius:50%;background:#4F46E5;border:3px solid #fff;box-shadow:0 0 0 2px rgba(79,70,229,0.35);"></div>`,
                })}
              />
            )}
            {userPos && radiusM != null && (
              <Circle
                center={[userPos.lat, userPos.lng]}
                radius={radiusM}
                pathOptions={{ color: '#4F46E5', fillColor: '#4F46E5', fillOpacity: 0.08, weight: 1.5 }}
              />
            )}

            {visible.map((property) => {
              const pos = getPropertyCoords(property)
              const isSelected = selected?.id === property.id
              return (
                <Marker
                  key={property.id}
                  position={pos}
                  icon={makePinIcon(
                    TYPE_COLORS[property.propertyType],
                    TYPE_PRICE_COLORS[property.propertyType],
                    formatPriceShort(property.totalPrice),
                    isSelected,
                  )}
                  eventHandlers={{
                    click: () => setSelected(property),
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: '180px' }}>
                      <div style={{ fontWeight: 700, color: '#111', marginBottom: 4, fontSize: 13 }}>
                        {property.title}
                      </div>
                      <div style={{ fontSize: 11, color: '#666', marginBottom: 6 }}>
                        <MapPin style={{ width: 10, height: 10, display: 'inline', marginRight: 2 }} />
                        {property.city}, Kanyakumari
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ color: '#FF5A5F', fontWeight: 700, fontSize: 14 }}>
                          {formatLakhs(property.totalPrice)}
                        </span>
                        <span style={{ fontSize: 11, color: '#6A9739', backgroundColor: 'rgba(106,151,57,0.1)', padding: '2px 8px', borderRadius: 12 }}>
                          {property.areaInCents} cents
                        </span>
                      </div>
                      <Link
                        to={`/properties/${property.id}`}
                        style={{ display: 'block', textAlign: 'center', backgroundColor: '#FF5A5F', color: 'white', padding: '6px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                      >
                        View Details
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>

          {/* Floating "Show list" button (mobile only) */}
          <button
            onClick={() => setListOpen(true)}
            className="md:hidden absolute top-3 left-3 z-[1000] inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white shadow-md border border-gray-200 text-sm font-semibold"
            style={{ color: '#FF5A5F' }}
          >
            <ListIcon className="w-4 h-4" />
            {totalInDb > 0 ? `Page ${page}/${totalPages}` : `${visible.length} listings`}
          </button>

          {/* Legend (hidden on mobile to free up screen space) */}
          <div className="hidden md:block absolute bottom-4 left-4 bg-white rounded-xl shadow-md border border-gray-100 p-3 z-[1000]">
            <p className="text-xs font-semibold text-gray-700 mb-2">Property Types</p>
            <div className="space-y-1.5">
              {[
                { label: 'Open Land', color: '#B91C1C' },
                { label: 'Land + Building', color: '#1E40AF' },
                { label: 'Agricultural', color: '#15803D' },
                { label: 'Residential Plot', color: '#B45309' },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

/* ----------------------------- Filter dropdown ----------------------------- */

interface FilterOption {
  value: string
  label: string
}

function FilterSelect({
  value, onChange, options, placeholder,
}: {
  value: string
  onChange: (v: string) => void
  options: FilterOption[]
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)
  const hasValue = value !== ''

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium border min-w-[140px] transition-colors whitespace-nowrap"
        style={hasValue
          ? { backgroundColor: 'rgba(255,90,95,0.06)', borderColor: '#FF5A5F', color: '#FF5A5F' }
          : { backgroundColor: 'white', borderColor: '#e5e7eb', color: '#374151' }}
      >
        <span className="flex-1 text-left">{selected?.label || placeholder}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown sits above Leaflet's panes (up to z-1000) so it doesn't
          get clipped by the map below the filter strip. */}
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[200px] bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-[1100] max-h-72 overflow-y-auto">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                onChange(opt.value)
                setOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between"
              style={value === opt.value ? { backgroundColor: 'rgba(255,90,95,0.06)', color: '#FF5A5F', fontWeight: 600 } : { color: '#374151' }}
            >
              {opt.label}
              {value === opt.value && <span style={{ color: '#FF5A5F' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
