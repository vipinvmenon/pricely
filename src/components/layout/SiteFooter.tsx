import Link from 'next/link'

const FOOTER_LINKS = [
  { label: 'Methodology', href: '/methodology' },
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Support', href: 'mailto:support@pricely.in' },
] as const

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p className="site-footer-copy">
          Pricely compares listed prices across supported Indian retailers. Shipping,
          bank offers, and coupons can change what you actually pay.
        </p>
        <nav aria-label="Footer" className="site-footer-nav">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="site-footer-link">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="site-footer-meta">
          Affiliate links may earn Pricely a commission at no extra cost to you.
        </p>
      </div>
    </footer>
  )
}
