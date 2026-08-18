import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    // A hash means the navigation intends to land on a specific section
    // (see ScrollToHash) — don't fight it by jumping to the top first.
    if (hash) return
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
