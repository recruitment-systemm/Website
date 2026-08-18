import type { MouseEvent, ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

interface HomeLinkProps {
  className?: string
  children: ReactNode
}

export function HomeLink({ className, children }: HomeLinkProps) {
  const location = useLocation()
  const navigate = useNavigate()

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (location.pathname === '/') {
      event.preventDefault()
      if (location.hash) navigate('/', { replace: true })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <Link to="/" onClick={handleClick} className={className}>
      {children}
    </Link>
  )
}
