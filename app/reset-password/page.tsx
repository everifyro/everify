'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // sesiunea e activă, userul poate reseta parola
      }
    })
  }, [])

  const handleReset = async () => {
    setError('')
    setMessage('')
    if (!password || !confirm) {
      setError('Completează ambele câmpuri.')
      return
    }
    if (password !== confirm) {
      setError('Parolele nu coincid.')
      return
    }
    if (password.length < 6) {
      setError('Parola trebuie să aibă minim 6 caractere.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError('Eroare: ' + error.message)
    } else {
      setMessage('Parola a fost schimbată cu succes!')
      setTimeout(() => router.push('/login'), 2000)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050d1a', color: 'white', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
        <span style={{ color: '#0ea5e9' }}>e</span>Verify
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>Resetează parola</p>

      <div style={{ width: '100%', maxWidth: 400, background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 16, padding: 32 }}>
        
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14, color: '#ef4444' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14, color: '#22c55e' }}>
            {message}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Parolă nouă</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Minim 6 caractere"
            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 8, padding: '10px 12px', color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Confirmă parola</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Repetă parola nouă"
            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 8, padding: '10px 12px', color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <button
          onClick={handleReset}
          disabled={loading}
          style={{ width: '100%', background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#0ea5e9,#6366f1)', border: 'none', color: 'white', padding: '12px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Se procesează...' : 'Schimbă parola'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
          <a href="/login" style={{ color: '#0ea5e9' }}>Înapoi la login</a>
        </p>
      </div>
    </div>
  )
}