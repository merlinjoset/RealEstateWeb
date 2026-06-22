import { useState } from 'react'
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import type { PropertyFilters } from '../../types'

interface Props {
  filters: PropertyFilters
  onChange: (filters: PropertyFilters) => void
}

const PROPERTY_TYPES = ['open_land', 'land_with_building', 'agricultural', 'commercial', 'residential_plot']
const PRICE_RANGES = [
  { label: 'Any Price', min: undefined, max: undefined },
  { label: 'Below ₹15L', min: undefined, max: 1500000 },
  { label: '₹15L – ₹25L', min: 1500000, max: 2500000 },
  { label: '₹25L – ₹50L', min: 2500000, max: 5000000 },
  { label: 'Above ₹50L', min: 5000000, max: undefined },
]

const TYPE_LABELS: Record<string, string> = {
  open_land: 'Open Land',
  land_with_building: 'Land + Building',
  agricultural: 'Agricultural',
  commercial: 'Commercial',
  residential_plot: 'Residential Plot',
}

export default function PropertyFilters({ filters, onChange }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  const update = (partial: Partial<PropertyFilters>) => onChange({ ...filters, ...partial, page: 1 })

  const hasActiveFilters = filters.propertyType || filters.status || filters.minPrice || filters.maxPrice

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center" style={{ backgroundColor: '#EA2D34' }}>!</span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        {hasActiveFilters && (
          <button
            onClick={() => onChange({ search: filters.search, sortBy: filters.sortBy, page: 1, pageSize: filters.pageSize })}
            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
          >
            <X className="w-3.5 h-3.5" />
            Clear filters
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Property Type</label>
            <select
              value={filters.propertyType || ''}
              onChange={(e) => update({ propertyType: (e.target.value as any) || undefined })}
              className="input-field py-2 text-sm"
            >
              <option value="">All Types</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Price Range</label>
            <select
              value={`${filters.minPrice ?? ''}-${filters.maxPrice ?? ''}`}
              onChange={(e) => {
                const [min, max] = e.target.value.split('-')
                update({ minPrice: min ? Number(min) : undefined, maxPrice: max ? Number(max) : undefined })
              }}
              className="input-field py-2 text-sm"
            >
              {PRICE_RANGES.map((r) => (
                <option key={r.label} value={`${r.min ?? ''}-${r.max ?? ''}`}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Sort By</label>
            <select
              value={filters.sortBy || 'newest'}
              onChange={(e) => update({ sortBy: e.target.value as any })}
              className="input-field py-2 text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="area_asc">Area: Small to Large</option>
              <option value="area_desc">Area: Large to Small</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
