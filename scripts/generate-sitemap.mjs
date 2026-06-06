// Build-time sitemap generator.
//
// The site is served as a static `vite preview` bundle with no server in front,
// so it can't proxy a dynamic /sitemap.xml to the API (that returns 500 in prod).
// Instead we bake a complete, self-contained sitemap into the build: static
// pages + city landing pages + every approved property URL pulled from the API
// at build time. Re-runs on every deploy, so new listings get picked up.
//
// Resilient by design: if the API can't be reached during the build, we still
// write a valid sitemap with the static + city URLs so the build never fails
// and Google always has something to read.

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../public/sitemap.xml')

const SITE = 'https://joseforland.com'

// API origin — derive from VITE_API_BASE_URL (which ends in /api) by stripping
// the trailing /api, falling back to the known production host.
const apiBase = process.env.VITE_API_BASE_URL || 'https://api.joseforland.com/api'
const API_ORIGIN = apiBase.replace(/\/api\/?$/, '').replace(/\/+$/, '')

const STATIC_PAGES = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/properties', changefreq: 'weekly', priority: '0.8' },
  { loc: '/map', changefreq: 'weekly', priority: '0.7' },
  { loc: '/about', changefreq: 'weekly', priority: '0.6' },
  { loc: '/contact', changefreq: 'weekly', priority: '0.6' },
  { loc: '/sell', changefreq: 'weekly', priority: '0.6' },
]

// City landing pages — each is a canonical, indexable filtered view.
const CITIES = ['Nagercoil', 'Marthandam', 'Thuckalay', 'Kanyakumari', 'Colachel', 'Kaliyakkavilai']

function xmlEscape(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function urlEntry({ loc, changefreq, priority, lastmod }) {
  const parts = [`    <loc>${xmlEscape(loc)}</loc>`]
  if (lastmod) parts.push(`    <lastmod>${lastmod}</lastmod>`)
  if (changefreq) parts.push(`    <changefreq>${changefreq}</changefreq>`)
  if (priority) parts.push(`    <priority>${priority}</priority>`)
  return `  <url>\n${parts.join('\n')}\n  </url>`
}

/** Pull every approved property URL from the API's property sitemap. */
async function fetchPropertyEntries() {
  const url = `${API_ORIGIN}/sitemap-properties.xml`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const xml = await res.text()
    const entries = []
    // The API already emits absolute https://joseforland.com/properties/{id}
    // URLs plus a <lastmod>; reuse them verbatim.
    const blocks = xml.match(/<url>[\s\S]*?<\/url>/g) || []
    for (const block of blocks) {
      const loc = block.match(/<loc>([\s\S]*?)<\/loc>/)?.[1]?.trim()
      if (!loc) continue
      const lastmod = block.match(/<lastmod>([\s\S]*?)<\/lastmod>/)?.[1]?.trim()
      entries.push({ loc, lastmod, changefreq: 'weekly', priority: '0.8' })
    }
    return entries
  } finally {
    clearTimeout(timer)
  }
}

async function main() {
  const entries = [
    ...STATIC_PAGES.map((p) => ({ ...p, loc: SITE + p.loc })),
    ...CITIES.map((c) => ({
      loc: `${SITE}/properties?city=${encodeURIComponent(c)}`,
      changefreq: 'weekly',
      priority: '0.6',
    })),
  ]

  let propertyCount = 0
  try {
    const props = await fetchPropertyEntries()
    entries.push(...props)
    propertyCount = props.length
  } catch (err) {
    console.warn(`[sitemap] could not fetch properties from ${API_ORIGIN}: ${err.message}`)
    console.warn('[sitemap] writing static + city pages only.')
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries.map(urlEntry).join('\n') +
    `\n</urlset>\n`

  writeFileSync(OUT, xml, 'utf8')
  console.log(`[sitemap] wrote ${entries.length} URLs (${propertyCount} properties) → public/sitemap.xml`)
}

main().catch((err) => {
  // Never fail the build over the sitemap.
  console.error('[sitemap] generation error:', err)
  process.exit(0)
})
