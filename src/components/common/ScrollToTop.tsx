import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Resets scroll position to the top on every route change.
 *
 * Mount once, inside <BrowserRouter>. Scrolls the window AND any element
 * marked with `data-scroll-on-nav` — needed for nested layouts whose
 * <main> is the actual scroll container (e.g. AdminLayout).
 *
 * Anchor links (`#section`) are preserved — if the URL has a hash we skip
 * the reset so in-page anchors still work.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return // let the browser handle #anchor jumps

    // Window scroll (covers all public routes)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })

    // Nested scroll containers (admin layout etc.)
    document.querySelectorAll<HTMLElement>('[data-scroll-on-nav]').forEach((el) => {
      el.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
    })
  }, [pathname, hash])

  return null
}
