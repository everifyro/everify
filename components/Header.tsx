'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [userId, setUserId] = useState<string|null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

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

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header style={{
      width: '100%',
      background: 'rgba(5,13,26,0.98)',
      borderBottom: '1px solid rgba(14,165,233,0.15)',
      padding: '0 24px',
      height: 60,
      minHeight: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      boxSizing: 'border-box',
    }}>
      <a href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>
          <span style={{ color: '#0ea5e9' }}>e</span>Verify
        </span>
      </a>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <a href="/" style={{ color: '#0ea5e9', fontSize: 14, textDecoration: 'none', fontWeight: 700 }}>Verificare AI</a>
        <a href="/check-url" style={{ color: '#0ea5e9', fontSize: 14, textDecoration: 'none', fontWeight: 700 }}>Verificare Site</a>
        <a href="/de-ce-everify" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, textDecoration: 'none' }}>De ce eVerify?</a>
        <a href="/prices" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, textDecoration: 'none' }}>Prețuri</a>
        <a href="/scam-types" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, textDecoration: 'none' }}>Tipuri Scam</a>
        <a href="/contact" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, textDecoration: 'none' }}>Contact</a>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 180, justifyContent: 'flex-end' }}>
        {!mounted ? (
          <div style={{ minWidth: 180 }} />
        ) : userId ? (
          <>
            <a href="/dashboard" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, textDecoration: 'none' }}>
              Dashboard
            </a>
            <button
              onClick={logout}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '6px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}
            >
              Deconectare
            </button>
          </>
        ) : (
          <>
            <a href="/login" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, textDecoration: 'none' }}>
              Login
            </a>
            <a href="/register" style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: 'white', padding: '7px 16px', borderRadius: 8, fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
              Înregistrare
            </a>
          </>
        )}
      </div>

    </header>
  )
}