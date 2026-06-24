'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

export default function Header() {
  const [userId, setUserId] = useState<string|null>(null)
  const [mounted, setMounted] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  const dark = pathname === '/scam-score'
  const headerBg = dark ? '#0F172A' : '#ffffff'
  const headerBorder = dark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(15,23,42,0.08)'
  const logoColor = dark ? '#ffffff' : '#1e293b'
  const navColor = dark ? 'rgba(255,255,255,0.85)' : 'rgba(30,41,59,0.85)'
  const btnBg = dark ? 'rgba(255,255,255,0.08)' : 'rgba(30,41,59,0.06)'
  const btnBorder = dark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(30,41,59,0.15)'
  const btnColor = dark ? '#ffffff' : '#1e293b'

  useEffect(() => {
    setMounted(true)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserId(session.user.id)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUserId(session.user.id)
      else setUserId(null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Toggle body class so ReportButton can hide itself when menu is open
  useEffect(() => {
    document.body.classList.toggle('menu-open', mobileOpen)
    return () => document.body.classList.remove('menu-open')
  }, [mobileOpen])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navLinkStyle = { color: navColor, fontSize: 14, textDecoration: 'none' } as const
  const primaryLinkStyle = { color: '#0ea5e9', fontSize: 14, textDecoration: 'none', fontWeight: 700 } as const

  const dropdownItems = [
    { href: '/de-ce-everify', label: 'De ce eVerify?' },
    { href: '/scam-types', label: 'Tipuri Scam' },
    { href: '/scam-score', label: 'Scam Score' },
    { href: '/raporteaza', label: 'Raportează' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <>
      <header style={{
        width: '100%',
        background: headerBg,
        borderBottom: headerBorder,
        padding: '0 24px',
        height: 60,
        minHeight: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: dark ? 'blur(24px) saturate(180%)' : 'none',
        WebkitBackdropFilter: dark ? 'blur(24px) saturate(180%)' : 'none',
        boxShadow: '0 8px 32px -16px rgba(15,23,42,0.18)',
        boxSizing: 'border-box',
      }}>
        <a href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: logoColor }}>
            <span style={{ color: '#0ea5e9' }}>e</span>Verify
          </span>
        </a>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }} className="header-desktop-nav">
          <a href="/" style={primaryLinkStyle}>Verificare AI</a>
          <a href="/check-url" style={primaryLinkStyle}>Verificare Site</a>
          <a href="/check-iban" style={primaryLinkStyle}>Verificare IBAN</a>
          <a href="/check-job" style={primaryLinkStyle}>Verificare Job</a>
          <a href="/prices" style={navLinkStyle}>Prețuri</a>

          {/* Mai mult dropdown */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: navColor,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: 0,
              }}
            >
              Mai mult
              <span style={{
                display: 'inline-block',
                transition: 'transform 0.2s',
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                fontSize: 10,
              }}>▾</span>
            </button>

            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 12px)',
                right: 0,
                background: dark ? '#1e293b' : '#ffffff',
                border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(15,23,42,0.10)',
                borderRadius: 10,
                boxShadow: '0 12px 40px -8px rgba(15,23,42,0.20)',
                minWidth: 170,
                overflow: 'hidden',
                zIndex: 200,
              }}>
                {dropdownItems.map(item => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'block',
                      padding: '10px 18px',
                      color: navColor,
                      fontSize: 14,
                      textDecoration: 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Desktop auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 180, justifyContent: 'flex-end' }} className="header-desktop-nav">
          {!mounted ? (
            <div style={{ minWidth: 180 }} />
          ) : userId ? (
            <>
              <a href="/dashboard" style={{ color: navColor, fontSize: 14, textDecoration: 'none' }}>
                Dashboard
              </a>
              <button
                onClick={logout}
                style={{ background: btnBg, border: btnBorder, color: btnColor, padding: '6px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}
              >
                Deconectare
              </button>
            </>
          ) : (
            <>
              <a href="/login" style={{ color: navColor, fontSize: 14, textDecoration: 'none' }}>
                Login
              </a>
              <a href="/register" style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: 'white', padding: '7px 16px', borderRadius: 8, fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
                Înregistrare
              </a>
            </>
          )}
        </div>

        {/* Hamburger button (mobile only) */}
        <button
          className="header-hamburger"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Meniu"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            flexDirection: 'column',
            gap: 5,
          }}
        >
          <span style={{ display: 'block', width: 22, height: 2, background: logoColor, borderRadius: 2, transition: 'all 0.2s', transform: mobileOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
          <span style={{ display: 'block', width: 22, height: 2, background: logoColor, borderRadius: 2, transition: 'all 0.2s', opacity: mobileOpen ? 0 : 1 }} />
          <span style={{ display: 'block', width: 22, height: 2, background: logoColor, borderRadius: 2, transition: 'all 0.2s', transform: mobileOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
        </button>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="header-mobile-menu"
          style={{
            position: 'fixed',
            top: 60,
            left: 0,
            right: 0,
            background: dark ? '#0F172A' : '#ffffff',
            borderBottom: headerBorder,
            boxShadow: '0 12px 40px -8px rgba(15,23,42,0.20)',
            zIndex: 99,
            padding: '16px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}
        >
          {[
            { href: '/', label: 'Verificare AI', primary: true },
            { href: '/check-url', label: 'Verificare Site', primary: true },
            { href: '/check-iban', label: 'Verificare IBAN', primary: true },
            { href: '/check-job', label: 'Verificare Job', primary: true },
            { href: '/prices', label: 'Prețuri', primary: false },
            ...dropdownItems.map(i => ({ ...i, primary: false })),
          ].map(item => (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: 'block',
                padding: '12px 0',
                color: item.primary ? '#0ea5e9' : navColor,
                fontSize: 15,
                fontWeight: item.primary ? 700 : 400,
                textDecoration: 'none',
                borderBottom: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(15,23,42,0.07)',
              }}
            >
              {item.label}
            </a>
          ))}

          {/* Auth section in mobile */}
          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            {mounted && userId ? (
              <>
                <a href="/dashboard" style={{ color: navColor, fontSize: 14, textDecoration: 'none' }}>Dashboard</a>
                <button onClick={logout} style={{ background: btnBg, border: btnBorder, color: btnColor, padding: '6px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                  Deconectare
                </button>
              </>
            ) : (
              <>
                <a href="/login" style={{ color: navColor, fontSize: 14, textDecoration: 'none' }}>Login</a>
                <a href="/register" style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: 'white', padding: '7px 16px', borderRadius: 8, fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
                  Înregistrare
                </a>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .header-desktop-nav { display: none !important; }
          .header-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  )
}
