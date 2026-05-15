import { Helmet } from 'react-helmet-async'

interface Props {
  /** Page title — appended to the brand suffix. e.g. "About" → "About — Jose For Land". */
  title?: string
  /** Meta description (155 chars max ideally). Falls back to the site default in index.html. */
  description?: string
  /** Absolute or root-relative path for canonical URL. Defaults to current location. */
  path?: string
  /** Override the OG image (defaults to /og-cover.jpg). Pass a property hero image
   *  on detail pages for richer link previews on WhatsApp/Facebook. */
  image?: string
  /** "website" (default) or "article" — use "article" for property pages. */
  type?: 'website' | 'article'
  /** Pass false on internal pages we don't want crawled (e.g. /admin/*). */
  noindex?: boolean
  /** Optional JSON-LD structured data — gets serialised into a script tag. */
  jsonLd?: object
}

const SITE_NAME = 'Jose For Land'
const SITE_BASE = 'https://joseforland.com'
const DEFAULT_IMAGE = `${SITE_BASE}/og-cover.jpg`

/**
 * Per-page meta tags — overrides the base copy in index.html. Mount near the
 * top of each route component. Internal pages (admin, profile) should set
 * `noindex` so we don't leak anything sensitive into Google.
 */
export default function SEO({
  title, description, path, image, type = 'website', noindex = false, jsonLd,
}: Props) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Land for sale in Kanyakumari, Tamil Nadu`
  const url = path
    ? (path.startsWith('http') ? path : SITE_BASE + path)
    : (typeof window !== 'undefined' ? window.location.href : SITE_BASE)
  const og = image
    ? (image.startsWith('http') ? image : SITE_BASE + image)
    : DEFAULT_IMAGE

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      <meta property="og:image" content={og} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={og} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  )
}
