'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const EXCLUDED_PATHS = ['/login', '/register', '/dashboard']

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const pathname = usePathname()

  useEffect(() => {
    if (EXCLUDED_PATHS.some(p => pathname.startsWith(p))) return
    if (sessionStorage.getItem('newsletter_shown')) return

    const timer = setTimeout(() => {
      setVisible(true)
      sessionStorage.setItem('newsletter_shown', '1')
    }, 60000)

    return () => clearTimeout(timer)
  }, [pathname])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) return
    setStatus('loading')

    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id ?? null

    try {
      const res = await fetch('/api/newsletter-popup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, userId })
      })
      const data = await res.json()
      if (data.success) {
        setStatus('success')
        setMessage(data.message || 'Verifică emailul pentru confirmare!')
      } else {
        setStatus('error')
        setMessage('Eroare la abonare. Încearcă din nou.')
      }
    } catch {
      setStatus('error')
      setMessage('Eroare de conexiune.')
    }
  }

  if (!visible) return null

  return (
    <div
      onClick={() => setVisible(false)}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, padding: '36px 32px', maxWidth: 420, width: '90%',
          position: 'relative', boxShadow: '0 24px 80px rgba(0,0,0,0.18)'
        }}
      >
        <button
          onClick={() => setVisible(false)}
          aria-label="Închide"
          style={{
            position: 'absolute', top: 14, right: 16, background: 'none', border: 'none',
            fontSize: 22, color: '#94a3b8', cursor: 'pointer', lineHeight: 1, padding: 4
          }}
        >×</button>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🛡️</div>
          <h2 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
            Protejează-te de fraude — gratuit
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
            Abonează-te la alertele eVerify și primești{' '}
            <strong style={{ color: '#0ea5e9' }}>3 credite bonus</strong> în cont după confirmare.
          </p>
        </div>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '16px 0', color: '#16a34a', fontWeight: 600, fontSize: 15 }}>
            ✅ {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="emailul@tău.ro"
              required
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
                border: '1.5px solid #e2e8f0', outline: 'none', marginBottom: 10,
                boxSizing: 'border-box', color: '#1e293b'
              }}
            />
            {status === 'error' && (
              <p style={{ margin: '0 0 8px', fontSize: 12, color: '#ef4444' }}>{message}</p>
            )}
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                color: '#fff', fontWeight: 700, fontSize: 15,
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                opacity: status === 'loading' ? 0.7 : 1
              }}
            >
              {status === 'loading' ? 'Se procesează...' : 'Mă abonez'}
            </button>
          </form>
        )}

        <p style={{ margin: '12px 0 0', fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
          Confirmă emailul pentru a primi creditele. Fără spam.
        </p>
      </div>
    </div>
  )
}
