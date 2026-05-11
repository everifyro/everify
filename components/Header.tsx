'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [userId, setUserId] = useState<string|null>(null)
  const [credits, setCredits] = useState<number|null>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id)
        fetchCredits(session.user.id)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id)
        fetchCredits(session.user.id)
      } else {
        setUserId(null)
        setCredits(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const fetchCredits = async (uid: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', uid)
      .single()
    if (data) setCredits(data.credits)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header style={{
      width: '100%',
      background: 'rgba(5,13,26,0.95)',
      borderBottom: '1px solid rgba(14,165,233,0.15)',
      padding: '0 24px',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)'
    }}>
      <a href="/" style={{ textDecoration: 'none' }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>
          <span style={{ color: '#0ea5e9' }}>e</span>Verify
        </span>
      </a>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <a href="/prices" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textDecoration: 'none' }}>
          Prețuri
        </a>

        {userId ? (
          <>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
              {credits ?? 0} credite
            </span>
            <a href="/dashboard" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textDecoration: 'none' }}>
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
            <a href="/login" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textDecoration: 'none' }}>
              Login
            </a>
            <a href="/register" style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: 'white', padding: '7px 16px', borderRadius: 8, fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
              Înregistrare
            </a>
          </>
        )}
      </nav>
    </header>
  )
}