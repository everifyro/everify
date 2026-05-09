'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const register = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else setSuccess(true)
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#050d1a', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif' }}>
      <div style={{ background:'rgba(15,23,42,0.9)', border:'1px solid rgba(14,165,233,0.2)', borderRadius:16, padding:'40px 36px', width:'100%', maxWidth:400 }}>
        <h1 style={{ color:'white', fontSize:24, fontWeight:800, marginBottom:8, textAlign:'center' }}>eVerify</h1>
        <p style={{ color:'rgba(255,255,255,0.4)', textAlign:'center', marginBottom:32, fontSize:14 }}>Creeaza un cont gratuit</p>
        {success && <p style={{ color:'#22c55e', textAlign:'center', marginBottom:16 }}>Cont creat! Verifica emailul. <a href='/login' style={{ color:'#0ea5e9' }}>Login</a></p>}
        {error && <p style={{ color:'#ef4444', fontSize:13, marginBottom:16 }}>{error}</p>}
        <div style={{ marginBottom:16 }}>
          <label style={{ color:'rgba(255,255,255,0.5)', fontSize:12, display:'block', marginBottom:6 }}>EMAIL</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type='email' placeholder='adresa@email.ro' style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(14,165,233,0.2)', borderRadius:10, padding:'11px 14px', color:'white', fontSize:14, outline:'none', fontFamily:'sans-serif' }} />
        </div>
        <div style={{ marginBottom:24 }}>
          <label style={{ color:'rgba(255,255,255,0.5)', fontSize:12, display:'block', marginBottom:6 }}>PAROLA</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} type='password' placeholder='minim 6 caractere' style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(14,165,233,0.2)', borderRadius:10, padding:'11px 14px', color:'white', fontSize:14, outline:'none', fontFamily:'sans-serif' }} />
        </div>
        <button onClick={register} disabled={loading} style={{ width:'100%', padding:'13px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#0ea5e9,#6366f1)', color:'white', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'sans-serif', marginBottom:16 }}>
          {loading ? 'Se incarca...' : 'Creeaza cont gratuit'}
        </button>
        <p style={{ textAlign:'center', color:'rgba(255,255,255,0.4)', fontSize:13 }}>Ai deja cont? <a href='/login' style={{ color:'#0ea5e9', textDecoration:'none' }}>Logheaza-te</a></p>
      </div>
    </div>
  )
}