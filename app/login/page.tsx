'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [showReset, setShowReset] = useState(false)

  const login = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else window.location.href = '/'
    setLoading(false)
  }

  const sendReset = async () => {
    if (!email) {
      setError('Introdu emailul mai întâi.')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://everify-phi.vercel.app/reset-password'
    })
    if (error) setError(error.message)
    else setResetSent(true)
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', color:'#1e293b', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif' }}>
      <div style={{ background:'#ffffff', border:'1px solid rgba(14,165,233,0.2)', borderRadius:16, padding:'40px 36px', width:'100%', maxWidth:400, boxShadow:'0 4px 24px rgba(15,23,42,0.06)' }}>
        <h1 style={{ color:'#1e293b', fontSize:24, fontWeight:800, marginBottom:8, textAlign:'center' }}>
          <span style={{ color:'#0ea5e9' }}>e</span>Verify
        </h1>
        <p style={{ color:'rgba(30,41,59,0.6)', textAlign:'center', marginBottom:32, fontSize:14 }}>Intră în contul tău</p>

        {error && (
          <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, padding:'10px 14px', color:'#ef4444', fontSize:13, marginBottom:16 }}>
            {error}
          </div>
        )}

        {resetSent && (
          <div style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', borderRadius:8, padding:'10px 14px', color:'#22c55e', fontSize:13, marginBottom:16 }}>
            Email de resetare trimis! Verifică inbox-ul.
          </div>
        )}

        <div style={{ marginBottom:16 }}>
          <label style={{ color:'rgba(30,41,59,0.65)', fontSize:12, display:'block', marginBottom:6 }}>EMAIL</label>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
            placeholder="adresa@email.ro"
            style={{ width:'100%', background:'rgba(30,41,59,0.04)', border:'1px solid rgba(14,165,233,0.2)', borderRadius:10, padding:'11px 14px', color:'#1e293b', fontSize:14, outline:'none', fontFamily:'sans-serif', boxSizing:'border-box' }}
          />
        </div>

        {!showReset && (
          <div style={{ marginBottom:8 }}>
            <label style={{ color:'rgba(30,41,59,0.65)', fontSize:12, display:'block', marginBottom:6 }}>PAROLĂ</label>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              style={{ width:'100%', background:'rgba(30,41,59,0.04)', border:'1px solid rgba(14,165,233,0.2)', borderRadius:10, padding:'11px 14px', color:'#1e293b', fontSize:14, outline:'none', fontFamily:'sans-serif', boxSizing:'border-box' }}
            />
          </div>
        )}

        <div style={{ textAlign:'right', marginBottom:24 }}>
          <span
            onClick={() => { setShowReset(!showReset); setError(''); setResetSent(false) }}
            style={{ color:'#0ea5e9', fontSize:12, cursor:'pointer' }}
          >
            {showReset ? '← Înapoi la login' : 'Ai uitat parola?'}
          </span>
        </div>

        {!showReset ? (
          <button
            onClick={login}
            disabled={loading}
            className={loading ? '' : 'btn-pulse'}
            style={{ width:'100%', padding:'13px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#0ea5e9,#6366f1)', color:'white', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'sans-serif', marginBottom:16 }}
          >
            {loading ? 'Se încarcă...' : 'Intră în cont →'}
          </button>
        ) : (
          <button
            onClick={sendReset}
            disabled={loading}
            className={loading ? '' : 'btn-pulse'}
            style={{ width:'100%', padding:'13px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#0ea5e9,#6366f1)', color:'white', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'sans-serif', marginBottom:16 }}
          >
            {loading ? 'Se trimite...' : 'Trimite email de resetare →'}
          </button>
        )}

        <p style={{ textAlign:'center', color:'rgba(30,41,59,0.6)', fontSize:13 }}>
          Nu ai cont? <a href="/register" style={{ color:'#0ea5e9', textDecoration:'none' }}>Înregistrează-te</a>
        </p>
      </div>
    </div>
  )
}