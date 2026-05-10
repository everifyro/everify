'use client'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [messages, setMessages] = useState<{role:string, text:string}[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [used, setUsed] = useState(0)
  const [userId, setUserId] = useState<string|null>(null)
  const [credits, setCredits] = useState<number|null>(null)
  const FREE_LIMIT = 5
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id)
        fetchCredits(session.user.id)
      }
    })
  }, [])

  const fetchCredits = async (uid: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', uid)
      .single()
    if (data) setCredits(data.credits)
  }

  const remaining = userId ? (credits ?? 0) : FREE_LIMIT - used

  const send = async () => {
    if (!input.trim() || loading || remaining <= 0) return
    const text = input.trim()
    setInput('')
    setMessages(p => [...p, { role: 'user', text }])
    setLoading(true)
    if (!userId) setUsed(u => u + 1)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, userId })
      })
      const data = await res.json()
      if (data.error === 'Nu mai ai credite') {
        setMessages(p => [...p, { role: 'ai', text: 'Nu mai ai credite. Te rugăm să achiziționezi un pachet.' }])
      } else {
        setMessages(p => [...p, { role: 'ai', text: data.reply || 'Eroare.' }])
        if (userId) fetchCredits(userId)
      }
    } catch {
      setMessages(p => [...p, { role: 'ai', text: 'Eroare de conexiune.' }])
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050d1a', color: 'white', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
        <span style={{ color: '#0ea5e9' }}>e</span>Verify
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>Verifică orice mesaj suspect cu AI</p>

      <div style={{ width: '100%', maxWidth: 680, background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(14,165,233,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'rgba(14,165,233,0.7)', fontFamily: 'monospace' }}>EVERIFY AI</span>
          <span style={{ fontSize: 12, color: remaining <= 1 ? '#ef4444' : 'rgba(255,255,255,0.4)' }}>
            {remaining}/{userId ? (credits ?? 0) : FREE_LIMIT} verificări rămase
          </span>
        </div>

        <div style={{ height: 360, overflowY: 'auto', padding: 16 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <p>Descrie mesajul suspect sau situația care te îngrijorează</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
              <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px', background: m.role === 'user' ? 'rgba(14,165,233,0.2)' : 'rgba(255,255,255,0.05)', border: '1px solid', borderColor: m.role === 'user' ? 'rgba(14,165,233,0.3)' : 'rgba(255,255,255,0.1)', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 6, padding: 8 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#0ea5e9', animation: 'pulse 1s infinite', animationDelay: `${i*0.2}s` }} />)}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div style={{ borderTop: '1px solid rgba(14,165,233,0.1)', padding: 12, display: 'flex', gap: 10 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Descrie situația suspectă..."
            rows={2}
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '8px 12px', color: 'white', fontSize: 14, resize: 'none', outline: 'none', fontFamily: 'sans-serif' }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading || remaining <= 0}
            style={{ width: 44, height: 44, borderRadius: 10, border: 'none', background: input.trim() && !loading ? 'linear-gradient(135deg,#0ea5e9,#6366f1)' : 'rgba(255,255,255,0.1)', color: 'white', fontSize: 20, cursor: 'pointer', alignSelf: 'flex-end' }}
          >→</button>
        </div>
      </div>

      {userId ? (
        <p style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
          <a href="/dashboard" style={{ color: '#0ea5e9' }}>Dashboard</a> · {credits} credite rămase
        </p>
      ) : (
        <p style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
          <a href="/login" style={{ color: '#0ea5e9' }}>Loghează-te</a> pentru a-ți salva creditele
        </p>
      )}
    </div>
  )
}