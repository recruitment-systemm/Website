import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scrolls to the element matching `location.hash` on navigation — including
 * cross-route navigation (e.g. clicking "Features" while on /jobs links to
 * "/#features", which changes both pathname and hash in one go). Plain
 * `<a href="#id">` anchors only scroll within the current page, so any nav
 * link that must work from every route uses a router `Link` to `/#id`
 * instead and relies on this component to perform the actual scroll.
 */
export function ScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    const id = hash.slice(1)

    // Wait a tick so the destination route has rendered before measuring
    // the target element's position.
    const timeout = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [pathname, hash])

  return null
}
