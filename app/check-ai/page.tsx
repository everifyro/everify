'use client'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import VeraBot from '@/components/VeraBot'
import { useScrollToResult } from '@/hooks/useScrollToResult'
import ImageUpload, { type ExtractedData } from '@/components/ImageUpload'
const SHOW_VACATION_BANNER = true

const TICKER_ITEMS = [
  '1 din 4 români a primit un mesaj de phishing în 2024',
  '23.000+ anunțuri false de angajare detectate',
  '47% din fraude încep cu un link nesolicitat',
  'Verifică gratuit orice anunț, link sau IBAN pe eVerify.ro',
]

const placeholders = [
  'Descrie situația suspectă sau introdu adresa site-ului pe care vrei să îl verificăm...',
  'Ai primit un mesaj ciudat pe WhatsApp? Descrie-l aici...',
  'Cineva îți cere date bancare? Verifică acum...',
  'Vrei să cumperi de pe un site nou? Introdu adresa lui...',
  'Ai primit un email de la ANAF? Verifică dacă e real...',
  'Produsul pare prea ieftin? Verifică dacă e real site-ul de pe care cumperi...',
]

const RESOURCES = [
  {
    id: 'check-url',
    label: 'Verificare Site Web',
    href: '/check-url',
    image: '/buy_online.jpg',
    title: 'Verificare Site Web',
    desc: 'Verificați dacă un site web este sigur înainte de a introduce date personale sau de a efectua o plată. Serviciul consumă 2 credite din contul dumneavoastră.',
    cta: 'Verifică un site',
  },
  {
    id: 'check-iban',
    label: 'Verificare IBAN',
    href: '/check-iban',
    image: '/buy_online.jpg',
    title: 'Verificare IBAN',
    desc: 'Verificați autenticitatea unui IBAN înainte de orice transfer bancar. Serviciul validează cifra de control, identifică banca și evaluează riscul de recuperare a prejudiciului.',
    cta: 'Verifică IBAN',
  },
  {
    id: 'check-job',
    label: 'Verificare Anunț Job',
    href: '/check-job',
    image: '/hero-bg.jpg',
    title: 'Verificare Anunț Job',
    desc: 'Detectăm joburi false, scheme MLM și fraude de recrutare înainte să vă pierdeți timpul sau banii. Serviciul consumă 2 credite.',
    cta: 'Verifică un job',
  },
  {
    id: 'scam-types',
    label: 'Tipuri de Fraude',
    href: '/scam-types',
    image: '/hero-bg.jpg',
    title: 'Tipuri de Fraude Documentate',
    desc: 'Baza de date eVerify conține peste 210 tipuri de fraude și escrocherii documentate. Prezentăm cele mai frecvente 10 tipuri identificate în România.',
    cta: 'Ghid fraude',
  },
  {
    id: 'raporteaza',
    label: 'Raportează o Fraudă',
    href: '/raporteaza',
    image: '/hero-bg.jpg',
    title: 'Raportați un Scam sau o Fraudă',
    desc: 'Raportările dumneavoastră ne ajută să protejăm și alți utilizatori. Fiecare sesizare este analizată de echipa noastră.',
    cta: 'Raportați acum',
  },
  {
    id: 'prices',
    label: 'Prețuri',
    href: '/prices',
    image: '/hero-bg.jpg',
    title: 'Alege planul potrivit',
    desc: 'Protejează-te de scam-uri online! Fără abonament lunar, plătești doar ce folosești. Credite valabile permanent, fără expirare.',
    cta: 'Achiziționați credite',
  },
]

export default function CheckAI() {
  const [messages, setMessages] = useState<{role:string, text:string}[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [used, setUsed] = useState(0)
  const [userId, setUserId] = useState<string|null>(null)
  const [credits, setCredits] = useState<number|null>(null)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<'idle'|'loading'|'success'|'error'>('idle')
  const [newsletterMessage, setNewsletterMessage] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [displayText, setDisplayText] = useState('')
  const [activeResource, setActiveResource] = useState('check-url')
  const FREE_LIMIT = 5
  const month = new Date().getMonth()
  const showVacation = SHOW_VACATION_BANNER || (month >= 4 && month <= 8)

  function renderMarkdown(text: string) {
    const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g)
    return parts.map((part, i) => {
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (linkMatch) {
        return (
          <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer"
             style={{ color: '#6366f1', textDecoration: 'underline', fontWeight: 600 }}>
            {linkMatch[1]}
          </a>
        )
      }
      const boldMatch = part.match(/^\*\*([^*]+)\*\*$/)
      if (boldMatch) return <strong key={i}>{boldMatch[1]}</strong>
      const italicMatch = part.match(/^\*([^*]+)\*$/)
      if (italicMatch) return <em key={i}>{italicMatch[1]}</em>
      return part
    })
  }

  const messagesBoxRef = useRef<HTMLDivElement>(null)
  const chatCardRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  useScrollToResult(chatCardRef, !loading && messages.length > 0)

  const activeRes = RESOURCES.find(r => r.id === activeResource) || RESOURCES[0]

  useEffect(() => {
    const target = placeholders[placeholderIndex]
    let timeout: NodeJS.Timeout
    if (!isDeleting && displayText.length < target.length) {
      timeout = setTimeout(() => setDisplayText(target.slice(0, displayText.length + 1)), 40)
    } else if (!isDeleting && displayText.length === target.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000)
    } else if (isDeleting && displayText.length > 0) {
      timeout = setTimeout(() => setDisplayText(displayText.slice(0, -1)), 20)
    } else if (isDeleting && displayText.length === 0) {
      setIsDeleting(false)
      setPlaceholderIndex((i) => (i + 1) % placeholders.length)
    }
    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, placeholderIndex])

  useEffect(() => {
    const box = messagesBoxRef.current
    if (box) box.scrollTop = box.scrollHeight
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
    const { data } = await supabase.from('profiles').select('credits').eq('id', uid).single()
    if (data) setCredits(data.credits)
  }

  const remaining = userId ? (credits ?? 0) : FREE_LIMIT - used

  const handleExtracted = (data: ExtractedData) => {
    const parts = [data.text, data.conversatie].filter(Boolean).join('\n\n')
    if (parts) setInput(prev => prev ? prev + '\n\n' + parts : parts)
  }

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

      {/* TICKER */}
      <div style={{ width: '100%', background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(4px)', overflow: 'hidden', padding: '10px 0', borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
        <div
          style={{ display: 'inline-flex', whiteSpace: 'nowrap', animation: 'marquee 28s linear infinite', animationPlayState: 'running' }}
          onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
          onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="ticker-item" style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500, paddingRight: 32, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              {i % TICKER_ITEMS.length === 3
                ? <strong style={{ color: '#0ea5e9' }}>{item}</strong>
                : item}
              <span style={{ background: 'rgba(255,255,255,0.5)', fontSize: 8, lineHeight: 1 }}>●</span>
            </span>
          ))}
        </div>
      </div>

      {/* HERO */}
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
        padding: '64px 20px',
      }}>
        <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 12, color: '#ffffff', textAlign: 'center', textShadow: '0 2px 12px rgba(15,23,42,0.5)', letterSpacing: -1 }}>
          <span style={{ color: '#0ea5e9' }}>e</span>Verify
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, maxWidth: 700, marginBottom: 36, textAlign: 'center', textShadow: '0 1px 8px rgba(15,23,42,0.4)' }}>
          Verifică orice mesaj suspect cu AI
        </p>

        <div id="result-section" ref={chatCardRef} style={{
          width: '100%',
          maxWidth: 700,
          background: 'rgba(255,255,255,0.97)',
          border: '2px solid rgba(14,165,233,0.5)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 24px 64px -16px rgba(15,23,42,0.45), 0 8px 24px rgba(15,23,42,0.2)',
        }}>
          <div style={{ padding: '12px 18px', background: 'rgba(14,165,233,0.15)', borderBottom: '1px solid rgba(14,165,233,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 0.3, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#1e293b' }}><span style={{ color: '#0ea5e9' }}>e</span>Verify</span>
              <span style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: 'white', borderRadius: 4, padding: '1px 5px', fontSize: 9, fontWeight: 800 }}>AI</span>
            </span>
            <span style={{ fontSize: 12, color: 'rgba(30,41,59,0.7)', fontWeight: 500 }}>
              {userId ? `${credits ?? 0} credite rămase` : `${remaining}/${FREE_LIMIT} credite rămase`}
            </span>
          </div>

          {(messages.length > 0 || loading) && (
            <div ref={messagesBoxRef} style={{ maxHeight: 320, overflowY: 'auto', padding: 16, borderBottom: '1px solid rgba(14,165,233,0.1)' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                  <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px', background: m.role === 'user' ? 'rgba(14,165,233,0.15)' : 'rgba(30,41,59,0.05)', border: '1px solid', borderColor: m.role === 'user' ? 'rgba(14,165,233,0.3)' : 'rgba(30,41,59,0.1)', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {m.role === 'ai' ? renderMarkdown(m.text) : m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px' }}>
                  <div style={{ width: 18, height: 18, border: '3px solid rgba(14,165,233,0.2)', borderTopColor: '#0ea5e9', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'rgba(30,41,59,0.6)', fontStyle: 'italic' }}>Se analizează... Vă rugăm așteptați</span>
                </div>
              )}
            </div>
          )}

          <div style={{ padding: '12px 12px 4px' }}>
            <div className="input-row" style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder={displayText + '|'}
                rows={2}
                style={{ flex: 1, background: 'rgba(255,255,255,0.95)', border: '2px solid rgba(14,165,233,0.4)', borderRadius: 10, padding: '12px 14px', color: '#1e293b', fontSize: 14, resize: 'none', outline: 'none', fontFamily: 'sans-serif', boxSizing: 'border-box' }}
              />
              <button
                onClick={send}
                disabled={loading}
                className="btn-pulse"
                style={{ alignSelf: 'stretch', padding: '0 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: 'white', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center', opacity: loading ? 0.7 : 1 }}
              >{loading ? 'Se procesează...' : <>Verifică <span style={{ fontSize: '1.4em', lineHeight: 1 }}>❯</span></>}</button>
            </div>
            <ImageUpload onExtracted={handleExtracted} context="ai" />
          </div>
        </div>
      </section>

      {/* STATISTICI — cifre existente, format stat mare + etichetă */}
      <section style={{ background: '#1e3a5f', padding: '36px 20px' }}>
        <div className="stats-big-grid" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, textAlign: 'center' }}>
          {[
            { num: '10', label: 'surse threat intelligence', sub: 'Google Safe Browsing, URLhaus, VirusTotal și altele' },
            { num: '1.143', label: 'branduri monitorizate', sub: 'Baza de typosquatting actualizată permanent' },
            { num: '200+', label: 'tipuri de fraude documentate', sub: 'Baza de date eVerify' },
            { num: '5 sec', label: 'timp mediu de răspuns', sub: 'Verdict AI instant' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '8px 0', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
              <div style={{ fontSize: 44, fontWeight: 800, color: '#0ea5e9', lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 8, fontWeight: 600, lineHeight: 1.3 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4, lineHeight: 1.4 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BANNER SEZONIER vacanță */}
      {showVacation && (
        <div style={{ width: '100%', background: 'linear-gradient(135deg, #f59e0b, #f97316)', padding: '20px 20px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <p style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>✈️</span> Planifici o vacanță? Verifică înainte să plătești!
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.88)', margin: 0, lineHeight: 1.5 }}>
                Evită escrocheriile turistice — cazare falsă, agenții fantomă, IBAN-uri frauduloase
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flexShrink: 0 }}>
              {[
                { label: 'Verifică link cazare', href: '/check-url' },
                { label: 'Verifică IBAN', href: '/check-iban' },
                { label: 'Verifică agenție', href: '/check-url' },
                { label: 'Ghid complet', href: '/scam-types' },
              ].map((btn, i) => (
                <a key={i} href={btn.href} style={{ background: i === 3 ? 'rgba(255,255,255,0.15)' : '#ffffff', color: i === 3 ? '#ffffff' : '#92400e', border: i === 3 ? '1px solid rgba(255,255,255,0.4)' : 'none', padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', display: 'inline-block' }}>
                  {btn.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RESURSE — sidebar vertical + panou mare dreapta */}
      <section style={{ background: '#f8fafc', borderBottom: '1px solid rgba(14,165,233,0.1)', padding: '56px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8, color: '#1e293b' }}>Resurse</h2>
          <p style={{ fontSize: 15, color: 'rgba(30,41,59,0.6)', marginBottom: 36 }}>
            Toate instrumentele eVerify într-o singură privire
          </p>
          <div className="resources-layout" style={{ display: 'flex', gap: 28, alignItems: 'stretch' }}>
            {/* Sidebar */}
            <aside className="resources-sidebar" style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2, background: '#ffffff', borderRadius: 14, border: '1px solid rgba(14,165,233,0.12)', padding: '8px 0', boxShadow: '0 2px 12px rgba(15,23,42,0.05)', alignSelf: 'flex-start' }}>
              {RESOURCES.map(r => (
                <button
                  key={r.id}
                  onClick={() => setActiveResource(r.id)}
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    textAlign: 'left',
                    background: activeResource === r.id ? 'rgba(14,165,233,0.08)' : 'transparent',
                    border: 'none',
                    borderLeft: `3px solid ${activeResource === r.id ? '#0ea5e9' : 'transparent'}`,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: activeResource === r.id ? 700 : 500,
                    color: activeResource === r.id ? '#0ea5e9' : 'rgba(30,41,59,0.7)',
                    transition: 'all 0.15s',
                    fontFamily: 'inherit',
                    lineHeight: 1.4,
                    touchAction: 'manipulation',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </aside>
            {/* Panou principal */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                width: '100%',
                minHeight: 360,
                backgroundImage: `linear-gradient(rgba(15,23,42,0.62), rgba(15,23,42,0.62)), url(${activeRes.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 16,
                padding: '48px 40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                boxShadow: '0 8px 32px rgba(15,23,42,0.15)',
              }}>
                <h3 style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', margin: '0 0 12px', textShadow: '0 2px 8px rgba(15,23,42,0.4)', lineHeight: 1.2 }}>
                  {activeRes.title}
                </h3>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', margin: '0 0 28px', lineHeight: 1.6, maxWidth: 520, textShadow: '0 1px 4px rgba(15,23,42,0.3)' }}>
                  {activeRes.desc}
                </p>
                <a
                  href={activeRes.href}
                  className="btn-pulse"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center', textAlign: 'center', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: 'white', padding: '13px 28px', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none', alignSelf: 'flex-start' }}
                >
                  {activeRes.cta} <span style={{ fontSize: '1.3em', lineHeight: 1 }}>❯</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Below-hero content */}
      <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Cards statistici 2×2 */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxWidth: '860px', width: '100%', marginBottom: 40, padding: '0 1.5rem' }}>
          {[
            { icon: '⚠️', color: '#dc2626', number: '1 din 4',        desc: 'români a primit phishing în 2024' },
            { icon: '💼', color: '#d97706', number: '23.000+',        desc: 'anunțuri false de angajare detectate' },
            { icon: '🔗', color: '#2563eb', number: '47%',            desc: 'din fraude încep cu un link nesolicitat' },
            { icon: '🛡️', color: '#16a34a', number: 'Verifică gratuit', desc: 'orice anunț, link sau IBAN pe eVerify' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', border: `2px solid ${s.color}30`, borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
              <span style={{ fontSize: '28px' }}>{s.icon}</span>
              <span className="stats-number" style={{ fontSize: '28px', fontWeight: 700, color: s.color, lineHeight: 1.1 }}>{s.number}</span>
              <span style={{ fontSize: '14px', color: '#64748b' }}>{s.desc}</span>
            </div>
          ))}
        </div>

        {/* Beneficii */}
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 40 }}>
          {[
            { icon: '⚡', title: 'Verdict în sub 5 secunde' },
            { icon: '🛡️', title: '200+ de tipuri diferite de fraude documentate' },
            { icon: '🇷🇴', title: 'Specializat pentru România' },
            { icon: '🔒', title: '100% confidențial' },
            { icon: '🆓', title: '5 credite gratuite' },
            { icon: '🤖', title: 'AI de ultimă generație' },
          ].map((b, i) => (
            <div key={i} style={{ background: '#ffffff', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 12, padding: '18px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10, boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
              <span style={{ fontSize: 28 }}>{b.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{b.title}</span>
            </div>
          ))}
        </div>

        {userId ? (
          <p style={{ fontSize: 13, color: 'rgba(30,41,59,0.55)' }}>
            <a href="/dashboard" style={{ color: '#0ea5e9' }}>Dashboard</a> · {credits} credite rămase
          </p>
        ) : (
          <p style={{ fontSize: 13, color: 'rgba(30,41,59,0.55)' }}>
            <a href="/login" style={{ color: '#0ea5e9' }}>Loghează-te</a> pentru a-ți salva creditele
          </p>
        )}

        {/* Scam Score preview */}
        <section style={{ width: '100%', marginTop: 24, background: '#1e3a5f', borderRadius: 14, padding: '1rem 16px', boxShadow: '0 6px 24px -10px rgba(15,23,42,0.45)' }}>
          <div style={{ maxWidth: 440, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>🛡️</div>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginBottom: 6, lineHeight: 1.2 }}>
              Cât de expus ești la <span style={{ color: '#60A5FA' }}>scam-uri</span>?
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: 14, lineHeight: 1.45 }}>
              Răspunde la câteva întrebări și află scorul tău de vulnerabilitate. Durează sub 2 minute.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 12px', marginBottom: 14, textAlign: 'left' }}>
              <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginBottom: 6 }}>Întrebarea 1 din 10 · exemplu</p>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.4, marginBottom: 10 }}>
                Primești un SMS: „Coletul tău e blocat, plătește 2 lei taxa" cu un link. Ce faci?
              </p>
              <div className="ss-grid-2" aria-hidden="true" style={{ gap: 8 }}>
                {[
                  'Îl șterg — curierii nu cer plăți prin SMS',
                  'Intru separat pe app-ul curierului ca să verific',
                  'Apăs linkul să văd despre ce e',
                  'Plătesc, să nu pierd coletul',
                ].map((t, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 10px', color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem', lineHeight: 1.35 }}>
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <a href="/scam-score" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: 'white', padding: '8px 18px', borderRadius: 10, fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}>
              Începe testul gratuit <span style={{ fontSize: '1.2em', lineHeight: 1 }}>❯</span>
            </a>
          </div>
        </section>

        {/* Tabel comparativ */}
        <div style={{ width: '100%', marginTop: 48 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 8, color: '#1e293b' }}>
            De ce <span style={{ color: '#0ea5e9' }}>eVerify</span>?
          </h2>
          <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(30,41,59,0.6)', marginBottom: 28 }}>
            Compară eVerify cu celelalte alternative
          </p>
          <div style={{ overflowX: 'auto', background: '#ffffff', border: '1px solid rgba(30,41,59,0.1)', borderRadius: 12, boxShadow: '0 4px 24px rgba(15,23,42,0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
              <thead>
                <tr style={{ background: '#0ea5e9' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: 0.5 }}></th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: 0.5, background: 'rgba(255,255,255,0.12)' }}>eVerify</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: 0.5 }}>Google Search</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: 0.5 }}>Avocat</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: 0.5 }}>Poliție/DNSC</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Cost', everify: 'de la 0.14€/verificare', google: 'Gratuit', avocat: '150-300€/oră', politie: 'Gratuit' },
                  { label: 'Timp răspuns', everify: '5 secunde', google: '15-30 minute', avocat: '1-3 zile', politie: '3-30 zile' },
                  { label: 'Acuratețe', everify: '95%+', google: '40%', avocat: '90%+', politie: '98%' },
                  { label: 'Disponibilitate', everify: '24/7', google: '24/7', avocat: 'Program limitat', politie: 'Program limitat' },
                  { label: 'Specializat România', everify: '✅ Da', google: '❌ Nu', avocat: '⚠️ Depinde', politie: '✅ Da' },
                  { label: 'Bază de date fraude', everify: '200+ tipuri', google: '❌ Nu', avocat: '❌ Nu', politie: '✅ Da' },
                  { label: 'Verdict instant', everify: '✅ Da', google: '❌ Nu', avocat: '❌ Nu', politie: '❌ Nu' },
                  { label: 'Acțiune preventivă', everify: '✅ Da', google: '⚠️ Parțial', avocat: '❌ Nu', politie: '❌ Nu' },
                  { label: 'Raportare inclusă', everify: '✅ Da', google: '❌ Nu', avocat: '⚠️ Contra cost', politie: '✅ Da' },
                  { label: 'Istoric verificări', everify: '✅ Da', google: '❌ Nu', avocat: '✅ Da', politie: '✅ Da' },
                ].map((row, i, arr) => (
                  <tr key={i} style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(30,41,59,0.08)' : 'none' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{row.label}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#1e293b', textAlign: 'center', background: 'rgba(14,165,233,0.08)', fontWeight: 700 }}>{row.everify}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'rgba(30,41,59,0.7)', textAlign: 'center' }}>{row.google}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'rgba(30,41,59,0.7)', textAlign: 'center' }}>{row.avocat}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'rgba(30,41,59,0.7)', textAlign: 'center' }}>{row.politie}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(30,41,59,0.55)', marginTop: 14, lineHeight: 1.6, fontStyle: 'italic' }}>
            * Avocatul este recomandat după producerea fraudei pentru recuperarea prejudiciilor. eVerify acționează preventiv.
          </p>
        </div>

        {/* De ce să alegi eVerify */}
        <div style={{ width: '100%', marginTop: 48, background: '#f8fafc', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 16, padding: '40px 32px' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 36, color: '#1e293b' }}>
            De ce să alegi <span style={{ color: '#0ea5e9' }}>eVerify</span>?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40, alignItems: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
              {[
                { num: '200+', label: 'Tipuri de fraude documentate' },
                { num: '24/7', label: 'Disponibilitate' },
                { num: '5 sec', label: 'Timp răspuns' },
                { num: '3', label: 'Surse independente' },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: 44, fontWeight: 800, color: '#0ea5e9', lineHeight: 1 }}>{s.num}</div>
                  <div style={{ fontSize: 14, color: '#1e293b', marginTop: 8, fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <p style={{ fontSize: 16, color: '#1e293b', lineHeight: 1.7, margin: 0 }}>
                eVerify este singura platformă românească specializată în detectarea fraudelor online, cu o bază de date actualizată permanent și analiză prin inteligență artificială.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {['Google Safe Browsing', 'URLhaus abuse.ch (Interpol/Europol)', 'Stripe'].map((logo, i) => (
                  <span key={i} style={{ border: '1px solid rgba(30,41,59,0.15)', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, color: '#1e293b', background: '#ffffff' }}>
                    {logo}
                  </span>
                ))}
              </div>
              <div style={{ width: 300, height: 400, maxWidth: '100%', background: '#e2e8f0', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(30,41,59,0.4)', fontSize: 13 }}>
                Poză
              </div>
            </div>
          </div>
        </div>

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
                style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', border: 'none', color: 'white', padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center' }}
              >
                {newsletterStatus === 'loading' ? 'Se procesează...' : <>Abonați-vă <span style={{ fontSize: '1.4em', lineHeight: 1 }}>❯</span></>}
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

      <VeraBot />

      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 1024px) {
          .stats-big-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .resources-layout { flex-direction: column !important; }
          .resources-sidebar { width: 100% !important; flex-direction: row !important; flex-wrap: wrap !important; gap: 6px !important; padding: 8px !important; }
          .resources-sidebar button { border-left: none !important; border-bottom: 3px solid transparent !important; border-radius: 8px !important; padding: 8px 12px !important; font-size: 13px !important; }
        }
        @media (max-width: 640px) {
          .ticker-item { font-size: 11px !important; }
          .input-row { flex-direction: column !important; }
          .input-row textarea { width: 100%; box-sizing: border-box; }
          .input-row button { width: 100%; align-self: auto !important; padding: 12px 24px !important; }
          .stats-grid { padding: 0 0.75rem !important; }
          .stats-number { font-size: 20px !important; white-space: nowrap; }
          .stats-big-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}
