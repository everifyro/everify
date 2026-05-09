'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const login = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else window.location.href = '/'
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#050d1a', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif' }}>
      <div style={{ background:'rgba(15,23,42,0.9)', border:'1px solid rgba(14,165,233,0.2)', borderRadius:16, padding:'40px 36px', width:'100%', maxWidth:400 }}>
        <h1 style={{ color:'white', fontSize:24, fontWeight:800, marginBottom:8, textAlign:'center' }}>
          <span style={{ color:'#0ea5e9' }}>e</span>Verify
        </h1>
        <p style={{ color:'rgba(255,255,255,0.4)', textAlign:'center', marginBottom:32, fontSize:14 }}>Intră în contul tău</p>
        
        {error && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, padding:'10px 14px', color:'#ef4444', fontSize:13, marginBottom:16 }}>{error}</div>}
        
        <div style={{ marginBottom:16 }}>
          <label style={{ color:'rgba(255,255,255,0.5)', fontSize:12, display:'block', marginBottom:6 }}>EMAIL</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="adresa@email.ro"
            style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(14,165,233,0.2)', borderRadius:10, padding:'11px 14px', color:'white', fontSize:14, outline:'none', fontFamily:'sans-serif' }} />
        </div>
        
        <div style={{ marginBottom:24 }}>
          <label style={{ color:'rgba(255,255,255,0.5)', fontSize:12, display:'block', marginBottom:6 }}>PAROLĂ</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••••"
            style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(14,165,233,0.2)', borderRadius:10, padding:'11px 14px', color:'white', fontSize:14, outline:'none', fontFamily:'sans-serif' }} />
        </div>
        
        <button onClick={login} disabled={loading} style={{ width:'100%', padding:'13px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#0ea5e9,#6366f1)', color:'white', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'sans-serif', marginBottom:16 }}>
          {loading ? 'Se încarcă...' : 'Intră în cont →'}
        </button>
        
        <p style={{ textAlign:'center', color:'rgba(255,255,255,0.4)', fontSize:13 }}>
          Nu ai cont? <a href="/register" style={{ color:'#0ea5e9', textDecoration:'none' }}>Înregistrează-te</a>
        </p>
      </div>
    </div>
  )
}