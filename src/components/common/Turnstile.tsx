import { useEffect, useRef } from 'react'

/**
 * Cloudflare Turnstile widget (the CAPTCHA on the public register + inquiry
 * forms). Renders nothing when VITE_TURNSTILE_SITE_KEY is unset, so local dev
 * and un-provisioned builds keep working — pair with the server, which
 * fail-opens when its secret is unset. Once both keys are set, it's enforced.
 *
 * Set VITE_TURNSTILE_SITE_KEY (site key) at build time; the matching secret
 * goes on the API as Turnstile__Secret.
 */
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

/** True when a site key is configured — forms use this to require a token. */
export const turnstileEnabled = !!SITE_KEY

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      remove: (id: string) => void
      reset: (id?: string) => void
    }
  }
}

let scriptPromise: Promise<void> | null = null
function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Turnstile'))
    document.head.appendChild(s)
  })
  return scriptPromise
}

interface Props {
  /** Called with the token on success, or null when it expires / errors. */
  onToken: (token: string | null) => void
}

export default function Turnstile({ onToken }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)
  // Keep the latest callback without re-initialising the widget each render.
  const cb = useRef(onToken)
  cb.current = onToken

  useEffect(() => {
    if (!SITE_KEY) return
    let cancelled = false
    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return
        widgetId.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: (token: string) => cb.current(token),
          'expired-callback': () => cb.current(null),
          'error-callback': () => cb.current(null),
        })
      })
      .catch(() => cb.current(null))
    return () => {
      cancelled = true
      if (widgetId.current && window.turnstile) {
        try { window.turnstile.remove(widgetId.current) } catch { /* already gone */ }
      }
    }
  }, [])

  if (!SITE_KEY) return null
  return <div ref={containerRef} className="my-1" />
}
