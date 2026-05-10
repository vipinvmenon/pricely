'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from './Button'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Compare', href: '/compare' },
  { label: 'Watchlist', href: '/watchlist' },
  { label: 'Trips', href: '/cabs' },
]

function BarChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="10" width="3" height="8" rx="1" fill="var(--accent)" />
      <rect x="7" y="6" width="3" height="12" rx="1" fill="var(--accent)" />
      <rect x="12" y="2" width="3" height="16" rx="1" fill="var(--accent)" />
      <rect x="17" y="7" width="3" height="11" rx="1" fill="var(--accent)" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.5 9.5A6 6 0 1 1 6.5 2.5a4.5 4.5 0 0 0 7 7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="5" width="16" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="2" y="9.25" width="16" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="2" y="13.5" width="16" height="1.5" rx="0.75" fill="currentColor" />
    </svg>
  )
}

export function Nav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          zIndex: 100,
          background: 'rgba(10,10,11,0.85)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: 16,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <BarChartIcon />
          <span
            style={{
              fontSize: '1.0625rem',
              fontWeight: 600,
              color: 'var(--text)',
              letterSpacing: '-0.01em',
            }}
          >
            Pricely<span style={{ color: 'var(--accent)' }}>.</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
          }}
          className="nav-links-desktop"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 'var(--r-pill)',
              padding: '3px',
              gap: 2,
            }}
          >
            {NAV_LINKS.map(({ label, href }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 14px',
                    borderRadius: 'var(--r-pill)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: isActive ? 'var(--text)' : 'var(--text-dim)',
                    background: isActive ? 'var(--glass-strong-bg)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'background 0.15s, color 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Right actions */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}
          className="nav-actions-desktop"
        >
          <button
            style={{
              background: 'var(--glass-plate-bg)',
              border: '1px solid var(--glass-plate-border)',
              borderRadius: 'var(--r-md)',
              color: 'var(--text-dim)',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Toggle theme"
          >
            <MoonIcon />
          </button>
          <Link href="/signin" style={{ textDecoration: 'none' }}>
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/signup" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="sm">Create account</Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="nav-hamburger"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text)',
            padding: '8px',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 'auto',
          }}
          aria-label="Toggle menu"
        >
          <MenuIcon />
        </button>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="nav-mobile-menu"
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            zIndex: 99,
            background: 'var(--bg1)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--r-md)',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: isActive ? 'var(--accent)' : 'var(--text)',
                  background: isActive ? 'var(--accent-dim)' : 'transparent',
                  textDecoration: 'none',
                  display: 'block',
                }}
              >
                {label}
              </Link>
            )
          })}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
          <Link href="/signin" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
            <Button variant="ghost" size="md" fullWidth>Sign in</Button>
          </Link>
          <Link href="/signup" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="md" fullWidth>Create account</Button>
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-actions-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>

      {/* Spacer so content isn't behind fixed nav */}
      <div style={{ height: 64 }} />
    </>
  )
}
