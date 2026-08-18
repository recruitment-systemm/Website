import { Link } from 'react-router-dom'
import { HomeLink } from '@/shared/components/HomeLink'
import { BrandMark } from '@/shared/components/BrandMark'
import { siteConfig } from '@/shared/config/site'

const links = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Sign in', href: '/login' },
  { label: 'Register your company', href: '/register' },
]

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <HomeLink>
            <BrandMark />
          </HomeLink>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.href.startsWith('/') ? link.href : `/${link.href}`}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col-reverse items-start justify-between gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.name}. Built for
            organizations that hire with intention.
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Multi-tenant · Role-based · Secure by design
          </p>
        </div>
      </div>
    </footer>
  )
}
