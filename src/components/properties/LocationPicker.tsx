import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Link as LinkIcon, X, AlertCircle, Crosshair, ExternalLink, Loader2 } from 'lucide-react'
import { mapsApi } from '../../services/api'

interface Props {
  latitude: string
  longitude: string
  onChange: (lat: string, lng: string) => void
  /** Defaults to Kanyakumari district centre */
  defaultCenter?: [number, number]
}

/* ── Google Maps URL parser ─────────────────────────────────────────── */
// Handles the most common share-URL shapes:
//   https://www.google.com/maps?q=8.1833,77.4119
//   https://www.google.com/maps/@8.1833,77.4119,15z
//   https://www.google.com/maps/place/Foo/@8.1833,77.4119,15z/...
//   https://www.google.com/maps/dir/.../@8.1833,77.4119,15z/...
// Short links (https://maps.app.goo.gl/...) can't be resolved without
// hitting the network — we show a hint instead.
export function parseGoogleMapsUrl(raw: string): { lat: number; lng: number } | null {
  if (!raw) return null
  const trimmed = raw.trim()

  // 1) ?q=lat,lng or ?query=lat,lng
  const qMatch = trimmed.match(/[?&](?:q|query|ll|destination)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/)
  if (qMatch) {
    return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) }
  }

  // 2) /@lat,lng,zoom
  const atMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (atMatch) {
    return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) }
  }

  // 3) Bare "lat,lng" — useful if user just copies coordinates
  const bareMatch = trimmed.match(/^\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*$/)
  if (bareMatch) {
    return { lat: parseFloat(bareMatch[1]), lng: parseFloat(bareMatch[2]) }
  }

  return null
}

/* ── Leaflet default-icon shim (Vite doesn't bundle the marker PNGs) ── */
// Use a small inline-styled divIcon instead so we don't depend on the
// default Leaflet marker assets being resolvable at runtime.
const pinIcon = L.divIcon({
  html: `<div style="
    transform: translate(-50%, -100%);
    width: 28px; height: 28px;
    background: #EA2D34;
    border: 3px solid white;
    box-shadow: 0 4px 8px rgba(0,0,0,0.25);
    border-radius: 50% 50% 50% 0;
    transform-origin: center;
    rotate: -45deg;
  "></div>`,
  className: 'jfl-loc-pin',
  iconSize: [0, 0],
  iconAnchor: [0, 0],
})

function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onPick(e.latlng.lat, e.latlng.lng),
  })
  return null
}

function MapRecenter({ position }: { position: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.flyTo(position, Math.max(map.getZoom(), 14), { duration: 0.6 })
  }, [position, map])
  return null
}

export default function LocationPicker({
  latitude, longitude, onChange, defaultCenter = [8.1833, 77.4119],
}: Props) {
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)
  const [resolving, setResolving] = useState(false)

  /**
   * Try to parse the URL locally first (instant, no network). If that fails
   * AND it looks like a Google Maps URL we can't parse offline (short links
   * are the obvious case), fall back to the backend resolver which follows
   * the redirect chain server-side.
   */
  const tryParseOrResolve = async (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return

    // 1) Local parse first
    const local = parseGoogleMapsUrl(trimmed)
    if (local) {
      onChange(local.lat.toFixed(6), local.lng.toFixed(6))
      setUrlError(null)
      return
    }

    // 2) If it's a known Google host, try the server-side resolver
    const looksLikeGoogleMaps = /(?:maps\.app\.goo\.gl|goo\.gl\/maps|g\.co|google\.com\/maps|maps\.google\.com)/i.test(trimmed)
    if (!looksLikeGoogleMaps) {
      setUrlError('Could not find coordinates in that URL. Paste the full Google Maps URL or the lat,lng directly.')
      return
    }

    setResolving(true)
    setUrlError(null)
    try {
      const res = await mapsApi.resolve(trimmed)
      onChange(res.latitude.toFixed(6), res.longitude.toFixed(6))
    } catch (err: unknown) {
      const apiMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setUrlError(apiMsg ?? 'Could not resolve that link. Please open it in Google Maps and copy the long URL.')
    } finally {
      setResolving(false)
    }
  }

  const lat = latitude ? parseFloat(latitude) : null
  const lng = longitude ? parseFloat(longitude) : null
  const hasCoords = lat != null && !isNaN(lat) && lng != null && !isNaN(lng)
  const markerPos: [number, number] | null = hasCoords ? [lat!, lng!] : null

  const handleUrlParse = () => tryParseOrResolve(url)

  const useMyLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setUrlError('Geolocation is not available in this browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUrlError(null)
        onChange(pos.coords.latitude.toFixed(6), pos.coords.longitude.toFixed(6))
      },
      (err) => setUrlError(`Couldn't get your location: ${err.message}`),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  const clearCoords = () => {
    onChange('', '')
    setUrl('')
    setUrlError(null)
  }

  return (
    <div className="space-y-3">
      {/* URL paste row */}
      <div>
        <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
          <LinkIcon className="w-3.5 h-3.5" style={{ color: '#EA2D34' }} />
          Paste Google Maps URL or coordinates
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setUrlError(null) }}
            onPaste={(e) => {
              // Auto-parse / auto-resolve on paste for convenience
              const pasted = e.clipboardData.getData('text')
              setTimeout(() => { tryParseOrResolve(pasted) }, 0)
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleUrlParse() } }}
            placeholder="e.g. https://www.google.com/maps/@8.1833,77.4119,15z or 8.1833, 77.4119"
            className="input-field flex-1"
          />
          <button type="button" onClick={handleUrlParse}
            disabled={resolving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#6A9739' }}
            onMouseEnter={(e) => { if (!resolving) e.currentTarget.style.backgroundColor = '#547a2d' }}
            onMouseLeave={(e) => { if (!resolving) e.currentTarget.style.backgroundColor = '#6A9739' }}>
            {resolving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Resolving…</> : 'Extract'}
          </button>
        </div>
        {urlError && (
          <p className="text-xs mt-1.5 flex items-start gap-1 font-medium" style={{ color: '#DC2626' }}>
            <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
            {urlError}
          </p>
        )}
        <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">
          Works with both long URLs and short links (maps.app.goo.gl/…). Tip: on Google Maps, right-click the spot → click the coordinates to copy them.
        </p>
      </div>

      {/* Manual lat/lng + actions */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
        <div className="sm:col-span-4">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Latitude</label>
          <input
            type="number" step="any" inputMode="decimal"
            value={latitude}
            onChange={(e) => onChange(e.target.value, longitude)}
            placeholder="8.1833"
            className="input-field"
          />
        </div>
        <div className="sm:col-span-4">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Longitude</label>
          <input
            type="number" step="any" inputMode="decimal"
            value={longitude}
            onChange={(e) => onChange(latitude, e.target.value)}
            placeholder="77.4119"
            className="input-field"
          />
        </div>
        <div className="sm:col-span-4 flex items-end gap-2">
          <button type="button" onClick={useMyLocation}
            title="Use my current location"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors"
            style={{ borderColor: '#CFD8DC', color: '#374151' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAFAF8')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
            <Crosshair className="w-3.5 h-3.5" />
            Use my location
          </button>
          {hasCoords && (
            <button type="button" onClick={clearCoords}
              title="Clear coordinates"
              className="px-3 py-2 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Map preview */}
      <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 280 }}>
        <MapContainer
          center={markerPos ?? defaultCenter}
          zoom={markerPos ? 14 : 11}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onPick={(la, ln) => onChange(la.toFixed(6), ln.toFixed(6))} />
          <MapRecenter position={markerPos} />
          {markerPos && (
            <Marker
              position={markerPos}
              icon={pinIcon}
              // Let the user fine-tune the pin by dragging it instead of
              // forcing a re-click. dragend writes the final position back
              // through onChange (intermediate drag positions are noisy).
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const ll = (e.target as L.Marker).getLatLng()
                  onChange(ll.lat.toFixed(6), ll.lng.toFixed(6))
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Status row */}
      <div className="flex items-center justify-between gap-2 text-xs">
        {hasCoords ? (
          <>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold"
              style={{ backgroundColor: 'rgba(106,151,57,0.10)', color: '#6A9739' }}>
              <MapPin className="w-3 h-3" />
              {lat!.toFixed(5)}, {lng!.toFixed(5)}
            </span>
            <a
              href={`https://www.google.com/maps?q=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold hover:underline"
              style={{ color: '#EA2D34' }}
            >
              Open in Google Maps <ExternalLink className="w-3 h-3" />
            </a>
          </>
        ) : (
          <span className="text-gray-400">
            <MapPin className="w-3 h-3 inline mr-1" />
            Click anywhere on the map to pin the location (then drag the pin to fine-tune), paste a URL, or type coordinates.
          </span>
        )}
      </div>
    </div>
  )
}
