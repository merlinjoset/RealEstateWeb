import { Navigate, useLocation, useParams } from 'react-router-dom'

/**
 * SEO migration shims for the old WordPress (Estatik) URL structure.
 *
 * Google still has the legacy URLs indexed from before the React rebuild:
 *   /property/{id}/            → property detail
 *   /location/{slug}/          → city / locality listing
 *   /property-city/{slug}/     → city listing
 *
 * Without these, those indexed URLs render the SPA "Not Found" page (a soft
 * 404), so visitors arriving from search land on a dead page and Google
 * eventually drops the listing. These components forward each legacy pattern
 * to its modern equivalent with `replace` so the dead URL doesn't pollute
 * browser history. The property IDs were preserved during the DB migration,
 * so /property/103 maps cleanly to /properties/103.
 *
 * Note: these are client-side (JS) redirects, not HTTP 301s. They fix the
 * visitor experience immediately and let Google consolidate the old URLs onto
 * the new ones over time; a server-side 301 would be stronger but needs a
 * real server in front of the static build.
 */

/** Legacy locality/city slugs → the city term the listings filter understands. */
const CITY_SLUG_MAP: Record<string, string> = {
  thuckalay: 'Thuckalay',
  marthandam: 'Marthandam',
  nagercoil: 'Nagercoil',
  colachel: 'Colachel',
  kanyakumari: 'Kanyakumari',
  kanniyakumari: 'Kanyakumari',
  kaliyakkavilai: 'Kaliyakkavilai',
  valliyur: 'Valliyur',
}

/** Resolve a legacy slug to a city filter, matching on known region keywords. */
function slugToCity(rawSlug: string | undefined): string | null {
  if (!rawSlug) return null
  const slug = decodeURIComponent(rawSlug).toLowerCase().replace(/\/+$/, '')
  if (CITY_SLUG_MAP[slug]) return CITY_SLUG_MAP[slug]
  // Substring match — handles slugs like "thuckalay-region" or "near-nagercoil".
  for (const key of Object.keys(CITY_SLUG_MAP)) {
    if (slug.includes(key)) return CITY_SLUG_MAP[key]
  }
  return null
}

/** /property/:id(/) → /properties/:id */
export function LegacyPropertyRedirect() {
  const { id } = useParams()
  // Strip any non-numeric remainder (old URLs sometimes had a trailing slug).
  const numeric = (id ?? '').match(/\d+/)?.[0]
  return <Navigate to={numeric ? `/properties/${numeric}` : '/properties'} replace />
}

/**
 * /location/:slug(/) and /property-city/:slug(/) → /properties?city=…
 * Unknown / junk slugs (plus-codes, "india") fall back to the full listing so
 * the visitor always lands on real content instead of an empty filtered view.
 */
export function LegacyLocationRedirect() {
  const { slug } = useParams()
  const location = useLocation()
  const city = slugToCity(slug)
  // Drop the legacy query string (?paged-=2&layout=list etc.) entirely.
  void location
  return (
    <Navigate
      to={city ? `/properties?city=${encodeURIComponent(city)}` : '/properties'}
      replace
    />
  )
}
