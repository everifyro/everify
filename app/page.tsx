'use client'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const placeholders = [
  'Descrie situația suspectă sau introdu adresa site-ului pe care vrei să îl verificăm...',
  'Ai primit un mesaj ciudat pe WhatsApp? Descrie-l aici...',
  'Cineva îți cere date bancare? Verifică acum...',
  'Vrei să cumperi de pe un site nou? Introdu adresa lui...',
  'Ai primit un email de la ANAF? Verifică dacă e real...',
  'Produsul pare prea ieftin? Verifică dacă e real site-ul de pe care cumperi...',
]

export default function Home() {
  const [messages, setMessages] = useState<{role:string, text:string}[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [used, setUsed] = useState(0)
  const [userId, setUserId] = useState<string|null>(null)
  const [credits, setCredits] = useState<number|null>(null)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<'idle'|'loading'|'success'|'error'>('idle')
  const [newsletterMessage, setNewsletterMessage] = useState('')
  const [placeholder, setPlaceholder] = useState(placeholders[0])
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [displayText, setDisplayText] = useState('')
  const FREE_LIMIT = 5
  const endRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Typewriter effect
  useEffect(() => {
    const target = placeholders[placeholderIndex]
    let timeout: NodeJS.Timeout

    if (!isDeleting && displayText.length < target.length) {
      timeout = setTimeout(() => {
        setDisplayText(target.slice(0, displayText.length + 1))
      }, 40)
    } else if (!isDeleting && displayText.length === target.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000)
    } else if (isDeleting && displayText.length > 0) {
      timeout = setTimeout(() => {
        setDisplayText(displayText.slice(0, -1))
      }, 20)
    } else if (isDeleting && displayText.length === 0) {
      setIsDeleting(false)
      setPlaceholderIndex((i) => (i + 1) % placeholders.length)
    }

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, placeholderIndex])

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
        setMessages(p => [...p, { role: 'ai', text: 'Nu mai ai credite. Vei fi redirecționat către pagina de prețuri...' }])
        setTimeout(() => router.push('/prices'), 2000)
      } else {
        setMessages(p => [...p, { role: 'ai', text: data.reply || 'Eroare.' }])
        if (userId) fetchCredits(userId)
      }
    } catch {
      setMessages(p => [...p, { role: 'ai', text: 'Eroare de conexiune.' }])
    }
    setLoading(false)
  }

  const subscribeNewsletter = async () => {
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return
    setNewsletterStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      })
      const data = await res.json()
      if (data.success) {
        setNewsletterStatus('success')
        setNewsletterMessage(data.message || 'Abonare reușită!')
        setNewsletterEmail('')
      } else {
        setNewsletterStatus('error')
        setNewsletterMessage('Eroare la abonare. Încercați din nou.')
      }
    } catch {
      setNewsletterStatus('error')
      setNewsletterMessage('Eroare de conexiune.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* HERO full-width */}
      <section style={{
        width: '100%',
        minHeight: 520,
        backgroundImage: 'linear-gradient(rgba(15,23,42,0.50), rgba(15,23,42,0.50)), url(/hero-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 20px'
      }}>
        <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 12, color: '#ffffff', textAlign: 'center', textShadow: '0 2px 12px rgba(15,23,42,0.5)' }}>
          <span style={{ color: '#0ea5e9' }}>e</span>Verify
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, marginBottom: 36, textAlign: 'center', textShadow: '0 1px 8px rgba(15,23,42,0.4)' }}>
          Verifică orice mesaj suspect cu AI
        </p>

        <div style={{
        width: '100%',
        maxWidth: 600,
        background: 'rgba(255,255,255,0.97)',
        border: '2px solid rgba(14,165,233,0.5)',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 24px 64px -16px rgba(15,23,42,0.45), 0 8px 24px rgba(15,23,42,0.2)'
      }}>
        <div style={{ padding: '12px 18px', background: 'rgba(14,165,233,0.15)', borderBottom: '1px solid rgba(14,165,233,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: '#0ea5e9', fontWeight: 700, letterSpacing: 0.3 }}>eVerify AI</span>
          <span style={{ fontSize: 12, color: remaining <= 1 ? '#ef4444' : 'rgba(30,41,59,0.7)', fontWeight: 500 }}>
            {remaining}/{userId ? (credits ?? 0) : FREE_LIMIT} verificări rămase
          </span>
        </div>

        {(messages.length > 0 || loading) && (
          <div style={{ maxHeight: 320, overflowY: 'auto', padding: 16, borderBottom: '1px solid rgba(14,165,233,0.1)' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px', background: m.role === 'user' ? 'rgba(14,165,233,0.15)' : 'rgba(30,41,59,0.05)', border: '1px solid', borderColor: m.role === 'user' ? 'rgba(14,165,233,0.3)' : 'rgba(30,41,59,0.1)', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
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
        )}

        <div style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'stretch' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder={displayText + '|'}
            rows={2}
            style={{ flex: 1, background: 'rgba(255,255,255,0.95)', border: '2px solid rgba(14,165,233,0.4)', borderRadius: 10, padding: '10px 14px', color: '#1e293b', fontSize: 14, resize: 'none', outline: 'none', fontFamily: 'sans-serif', boxSizing: 'border-box' }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading || remaining <= 0}
            className="btn-pulse"
            style={{ alignSelf: 'stretch', padding: '0 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >Verifică →</button>
        </div>
      </div>
      </section>

      {/* Below-hero content */}
      <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {userId ? (
        <p style={{ fontSize: 13, color: 'rgba(30,41,59,0.55)' }}>
          <a href="/dashboard" style={{ color: '#0ea5e9' }}>Dashboard</a> · {credits} credite rămase
        </p>
      ) : (
        <p style={{ fontSize: 13, color: 'rgba(30,41,59,0.55)' }}>
          <a href="/login" style={{ color: '#0ea5e9' }}>Loghează-te</a> pentru a-ți salva creditele
        </p>
      )}

      {/* Newsletter */}
      <div style={{ width: '100%', maxWidth: 1100, marginTop: 32, background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 16, padding: '24px 28px' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          🔔 Fiți informați despre cele mai noi fraude
        </h3>
        <p style={{ fontSize: 13, color: 'rgba(30,41,59,0.65)', marginBottom: 16, lineHeight: 1.6 }}>
          Abonați-vă la newsletterul săptămânal eVerify și primiți alerte despre cele mai recente tipuri de fraude identificate în România. Gratuit, fără spam.
        </p>

        {newsletterStatus === 'success' ? (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '12px 16px', color: '#22c55e', fontSize: 14 }}>
            ✅ {newsletterMessage}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              type="email"
              value={newsletterEmail}
              onChange={e => setNewsletterEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') subscribeNewsletter() }}
              placeholder="adresa@email.ro"
              style={{ flex: 1, minWidth: 200, background: '#ffffff', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '10px 14px', color: '#1e293b', fontSize: 14, outline: 'none' }}
            />
            <button
              onClick={subscribeNewsletter}
              disabled={newsletterStatus === 'loading' || !newsletterEmail.trim()}
              className="btn-pulse"
              style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', border: 'none', color: 'white', padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              {newsletterStatus === 'loading' ? 'Se procesează...' : 'Abonați-vă →'}
            </button>
          </div>
        )}

        {newsletterStatus === 'error' && (
          <p style={{ fontSize: 12, color: '#ef4444', marginTop: 8 }}>{newsletterMessage}</p>
        )}

        <p style={{ fontSize: 11, color: 'rgba(30,41,59,0.45)', marginTop: 12, margin: '12px 0 0' }}>
          Prin abonare, acceptați <a href="/privacy" style={{ color: '#0ea5e9' }}>Politica de Confidențialitate</a>. Vă puteți dezabona oricând.
        </p>
      </div>

      </div>
    </div>
  )
}