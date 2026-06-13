import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { analyticsApi } from '../../services/api'

// Both are optional — set them as Render env vars on the web service to switch
// the respective integration on. With neither set, only the in-app beacon runs.
const GA_ID = import.meta.env.VITE_GA_ID as string | undefined
const GSC_VERIFICATION = import.meta.env.VITE_GSC_VERIFICATION as string | undefined

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

/** Anonymous per-browser id (random) used only to approximate unique visitors. */
function getVisitorId(): string {
  try {
    let id = localStorage.getItem('jfl_vid')
    if (!id) {
      id = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
      localStorage.setItem('jfl_vid', id)
    }
    return id
  } catch {
    return ''
  }
}

/**
 * Site-wide analytics. Mounted once inside the Router so it can observe route
 * changes. Three independent pieces:
 *   1. Google Analytics 4 (if VITE_GA_ID) — gtag.js with manual SPA page_view.
 *   2. Google Search Console verification meta tag (if VITE_GSC_VERIFICATION).
 *   3. In-app beacon → POST /api/analytics/pageview, powering the admin
 *      Traffic dashboard (always on, no external account needed).
 */
export default function Analytics() {
  const location = useLocation()
  const gaLoaded = useRef(false)

  // Load GA4 once.
  useEffect(() => {
    if (!GA_ID || gaLoaded.current) return
    gaLoaded.current = true
    const s = document.createElement('script')
    s.async = true
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    document.head.appendChild(s)
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments)
    }
    window.gtag('js', new Date())
    // We send page_view manually on each route change (SPA), so disable auto.
    window.gtag('config', GA_ID, { send_page_view: false })
  }, [])

  // Track on every pathname change (not query changes — filter tweaks on
  // /properties shouldn't each count as a new page view).
  useEffect(() => {
    const path = location.pathname
    if (GA_ID && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_location: window.location.href,
        page_title: document.title,
      })
    }
    let referrer = ''
    try {
      referrer = document.referrer ? new URL(document.referrer).hostname : ''
    } catch {
      referrer = ''
    }
    // Don't count our own site as a referrer (internal navigations).
    if (referrer === window.location.hostname) referrer = ''
    analyticsApi.track({ path, referrer, visitorId: getVisitorId() }).catch(() => {})
  }, [location.pathname])

  if (!GSC_VERIFICATION) return null
  return (
    <Helmet>
      <meta name="google-site-verification" content={GSC_VERIFICATION} />
    </Helmet>
  )
}
