import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, ExternalLink, Navigation } from 'lucide-react'
import type { Property } from '../../types'

// Approximate centres for Kanyakumari district cities — used as a fallback
// when a property has no explicit lat/lng of its own.
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Nagercoil:        { lat: 8.1833, lng: 77.4119 },
  Marthandam:       { lat: 8.3072, lng: 77.2204 },
  Thuckalay:        { lat: 8.2400, lng: 77.2700 },
  Kanyakumari:      { lat: 8.0883, lng: 77.5385 },
  Colachel:         { lat: 8.1747, lng: 77.2583 },
  Kaliyakkavilai:   { lat: 8.2167, lng: 77.2667 },
  Boothapandi:      { lat: 8.2800, lng: 77.3600 },
  Eraniel:          { lat: 8.2058, lng: 77.3208 },
  Aralvaimozhy:     { lat: 8.2208, lng: 77.4583 },
  Kuzhithurai:      { lat: 8.3361, lng: 77.1972 },
}

const TYPE_COLORS: Record<Property['propertyType'], string> = {
  open_land:          '#FF5A5F',
  land_with_building: '#6A9739',
  agricultural:       '#8BC34A',
  residential_plot:   '#F59E0B',
  commercial:         '#293237',
}

function buildPinIcon(color: string) {
  return L.divIcon({
    html: `
      <div style="
        position: relative;
        transform: translate(-50%, -100%);
      ">
        <div style="
          background: ${color};
          width: 36px;
          height: 36px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 6px 14px rgba(0,0,0,0.3);
        ">
          <div style="
            transform: rotate(45deg);
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
          ">📍</div>
        </div>
      </div>
    `,
    className: 'jfl-property-pin',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

/**
 * Forces Leaflet to recalculate its container size after mount.
 * Without this, the map sometimes renders with the wrong dimensions when
 * its parent layout settles after first paint (very common in flex/grid).
 */
function FixLeafletSize() {
  const map = useMap()
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100)
  }, [map])
  return null
}

interface Props {
  property: Property
}

export default function PropertyLocationMap({ property }: Props) {
  const fallback = CITY_COORDS[property.city] ?? { lat: 8.18, lng: 77.41 }
  const center: [number, number] = [
    property.latitude ?? fallback.lat,
    property.longitude ?? fallback.lng,
  ]

  const isPrecise = property.latitude != null && property.longitude != null
  const color = TYPE_COLORS[property.propertyType] ?? '#FF5A5F'

  const fullAddress = [
    property.address,
    property.city,
    property.district,
    property.state,
    property.pinCode,
  ].filter(Boolean).join(', ')

  // Open in Google Maps with the address (works even with no lat/lng)
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`
  const viewUrl = `https://www.google.com/maps/search/?api=1&query=${center[0]},${center[1]}`

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between gap-3 border-b border-gray-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(106,151,57,0.10)', color: '#6A9739' }}>
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-gray-900 text-sm">Location</h2>
            <p className="text-xs text-gray-500 truncate">{fullAddress}</p>
          </div>
        </div>

        {!isPrecise && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shrink-0 hidden sm:inline-block"
            style={{ backgroundColor: 'rgba(245,158,11,0.10)', color: '#B45309' }}>
            Approx · {property.city}
          </span>
        )}
      </div>

      {/* Map */}
      <div className="h-[320px] sm:h-[380px] relative bg-gray-100">
        <MapContainer
          center={center}
          zoom={isPrecise ? 15 : 13}
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%' }}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={center} icon={buildPinIcon(color)} />
          <FixLeafletSize />
        </MapContainer>

        {/* OSM attribution (manual, smaller) */}
        <div className="absolute bottom-1 right-2 z-[1000] bg-white/80 backdrop-blur-sm rounded px-1.5 py-0.5 text-[9px] text-gray-500 pointer-events-none">
          © <a href="https://www.openstreetmap.org/copyright"
            target="_blank" rel="noopener noreferrer"
            className="underline pointer-events-auto">OpenStreetMap</a>
        </div>
      </div>

      {/* CTA strip */}
      <div className="px-6 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white">
        {!isPrecise && (
          <p className="text-xs text-gray-500 italic flex-1 hidden sm:block">
            Pin shows approximate {property.city} centre. We'll share the exact location after you contact us.
          </p>
        )}
        <a href={directionsUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors"
          style={{ backgroundColor: '#6A9739' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#547a2d')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#6A9739')}>
          <Navigation className="w-3.5 h-3.5" /> Get Directions
        </a>
        <a href={viewUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-colors"
          style={{ borderColor: '#CFD8DC', color: '#374151' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FAFAF8')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
          <ExternalLink className="w-3.5 h-3.5" /> Open in Google Maps
        </a>
      </div>
    </div>
  )
}
