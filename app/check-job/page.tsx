'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { CREDIT_COSTS } from '@/lib/credit-costs'
import { useRouter } from 'next/navigation'
import { useScrollToResult } from '@/hooks/useScrollToResult'
import ImageUpload, { type ExtractedData } from '@/components/ImageUpload'

const jobPlaceholders = [
  'Lipiți textul anunțului de job sau mesajul de recrutare primit...',
  '"Angajăm reprezentanți vânzări, salariu 3000-5000€, contactați-ne pe WhatsApp..."',
  '"Ofertă de muncă în Germania, câștiguri 4000€ net, fără experiență necesară..."',
  '"Ați primit un job fără interviu sau cu ofertă venită în câteva ore? Verificați..."',
  '"Vi s-a cerut un avans, o taxă sau IBAN-ul? Acesta poate fi un job fals."',
]

const MODULE_META: Record<string, { label: string; icon: string; weight: string }> = {
  frauda:    { label: 'Fraudă Financiară',  icon: '💰', weight: '24%' },
  companie:  { label: 'Verificare Companie', icon: '🏢', weight: '17%' },
  domeniu:   { label: 'Verificare Domeniu',  icon: '🌐', weight: '17%' },
  recruiter: { label: 'Email Recruiter',     icon: '📧', weight: '12%' },
  descriere: { label: 'Descriere Job',       icon: '📄', weight: '12%' },
  date:      { label: 'Colectare Date',      icon: '🔒', weight: '12%' },
  proces:    { label: 'Proces Recrutare',    icon: '🔄', weight: '6%'  },
}

const MODULE_UNVERIFIED_LABELS: Record<string, string> = {
  companie:  'Fără firmă/CUI',
  domeniu:   'Fără link anunț',
  recruiter: 'Fără email recruiter',
}

function renderMarkdown(text: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (linkMatch) return <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', textDecoration: 'underline', fontWeight: 600 }}>{linkMatch[1]}</a>
    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/)
    if (boldMatch) return <strong key={i}>{boldMatch[1]}</strong>
    const italicMatch = part.match(/^\*([^*]+)\*$/)
    if (italicMatch) return <em key={i}>{italicMatch[1]}</em>
    return part
  })
}

function getScoreColor(score: number) {
  if (score <= 30) return '#22c55e'
  if (score <= 60) return '#f59e0b'
  return '#ef4444'
}

export default function CheckJob() {
  const [text, setText] = useState('')
  const [company, setCompany] = useState('')
  const [link, setLink] = useState('')
  const [recruiterEmail, setRecruiterEmail] = useState('')
  const [iban, setIban] = useState('')
  const [canal, setCanal] = useState('')
  const [position, setPosition] = useState('')
  const [salary, setSalary] = useState('')

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [credits, setCredits] = useState<number | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [displayText, setDisplayText] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [coverageCount, setCoverageCount] = useState(4)
  const resultRef = useRef<HTMLDivElement>(null)

  const handleExtracted = (data: ExtractedData) => {
    if (data.text) setText(prev => prev ? prev + '\n\n' + data.text : data.text)
    if (data.email) setRecruiterEmail(data.email)
    if (data.iban) setIban(data.iban)
    if (data.link) setLink(data.link)
    if (data.cui) setCompany(data.cui)
    if (data.conversatie && !data.text) setText(data.conversatie)
  }

  const router = useRouter()
  useScrollToResult(resultRef, !loading && !!result)

  // Typing effect
  useEffect(() => {
    const target = jobPlaceholders[placeholderIndex]
    let timeout: NodeJS.Timeout
    if (!isDeleting && displayText.length < target.length) {
      timeout = setTimeout(() => setDisplayText(target.slice(0, displayText.length + 1)), 38)
    } else if (!isDeleting && displayText.length === target.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2200)
    } else if (isDeleting && displayText.length > 0) {
      timeout = setTimeout(() => setDisplayText(displayText.slice(0, -1)), 18)
    } else if (isDeleting && displayText.length === 0) {
      setIsDeleting(false)
      setPlaceholderIndex(i => (i + 1) % jobPlaceholders.length)
    }
    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, placeholderIndex])

  // Auth + credits
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id)
        supabase.from('profiles').select('credits').eq('id', session.user.id).single()
          .then(({ data }) => { if (data) setCredits(data.credits) })
      }
    })
  }, [])


  const calcCoverage = () => {
    let count = 4 // descriere + proces + frauda + date sunt mereu active
    if (company.trim()) count++
    if (link.trim()) count++
    if (recruiterEmail.trim()) count++
    return count
  }

  const runCheck = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/check-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), company: company.trim() || undefined, link: link.trim() || undefined, recruiterEmail: recruiterEmail.trim() || undefined, iban: iban.trim() || undefined, canal: canal || undefined, position: position.trim() || undefined, salary: salary.trim() || undefined, userId })
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResult(data)
        if (typeof data.credits === 'number') setCredits(data.credits)
      }
    } catch {
      setError('Eroare de conexiune. Încercați din nou.')
    }

    setLoading(false)
  }

  const handleVerify = async () => {
    if (!text.trim() || text.trim().length < 20) {
      setError('Introduceți textul anunțului (minim 20 caractere).')
      return
    }
    setLoading(true)
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: profile } = await supabase.from('profiles').select('credits').eq('id', session.user.id).single()
      if (!profile || profile.credits < CREDIT_COSTS.job) { router.push('/prices'); return }
    } catch {
      setError('Eroare de conexiune. Încercați din nou.')
      setLoading(false)
      return
    }

    setLoading(false)

    const coverage = calcCoverage()
    if (coverage < 7) {
      setCoverageCount(coverage)
      setShowModal(true)
      return
    }

    await runCheck()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* MODAL completitudine */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#ffffff', borderRadius: 20, padding: 36, maxWidth: 440, width: '100%', boxShadow: '0 24px 64px rgba(15,23,42,0.4)' }}>
            <div style={{ fontSize: 44, textAlign: 'center', marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', textAlign: 'center', marginBottom: 12, margin: '0 0 12px' }}>
              Acoperire limitată
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(30,41,59,0.7)', textAlign: 'center', lineHeight: 1.7, marginBottom: 24 }}>
              Cu datele introduse, analiza acoperă doar{' '}
              <strong style={{ color: '#1e293b' }}>{coverageCount} din 7 module</strong>.
              <br />
              Adăugați <strong>firma/CUI</strong>, <strong>link-ul anunțului</strong> și{' '}
              <strong>emailul recruiterului</strong> pentru o verificare completă.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: '13px 0', border: '2px solid rgba(30,41,59,0.2)', background: 'transparent', borderRadius: 10, fontSize: 14, cursor: 'pointer', fontWeight: 700, color: '#1e293b' }}
              >
                Completez acum
              </button>
              <button
                onClick={() => { setShowModal(false); runCheck() }}
                style={{ flex: 1, padding: '13px 0', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', border: 'none', color: 'white', borderRadius: 10, fontSize: 14, cursor: 'pointer', fontWeight: 700 }}
              >
                Continuă oricum
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <section style={{
        width: '100%',
        backgroundImage: 'linear-gradient(rgba(15,23,42,0.62), rgba(15,23,42,0.62)), url(/jobs.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '56px 20px 64px',
      }}>
        <h1 style={{ color: '#ffffff', fontSize: 42, fontWeight: 800, marginBottom: 12, textAlign: 'center', textShadow: '0 2px 12px rgba(15,23,42,0.5)' }}>
          Verificare <span style={{ color: '#0ea5e9' }}>Anunț Job</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 16, maxWidth: 680, textAlign: 'center', textShadow: '0 1px 8px rgba(15,23,42,0.4)', margin: '0 0 8px' }}>
          Detectăm joburi false, scheme MLM și fraude de recrutare înainte să vă pierdeți timpul sau banii. Serviciul consumă 2 credite.
        </p>
        {userId && (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 28px' }}>
            <a href="/dashboard" style={{ color: '#0ea5e9' }}>Dashboard</a> · {credits ?? 0} credite rămase
          </p>
        )}
        {!userId && <div style={{ marginBottom: 28 }} />}

        {/* FORM CARD */}
        <div style={{
          width: '100%',
          maxWidth: 680,
          background: 'rgba(255,255,255,0.97)',
          border: '2px solid rgba(14,165,233,0.5)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 24px 64px -16px rgba(15,23,42,0.45), 0 8px 24px rgba(15,23,42,0.2)'
        }}>

          {/* Card header */}
          <div style={{ padding: '12px 18px', background: 'rgba(14,165,233,0.12)', borderBottom: '1px solid rgba(14,165,233,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 0.3, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#1e293b' }}><span style={{ color: '#0ea5e9' }}>e</span>Verify</span>
              <span style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: 'white', borderRadius: 4, padding: '1px 5px', fontSize: 9, fontWeight: 800 }}>AI</span>
            </span>
            <span style={{ fontSize: 12, color: 'rgba(30,41,59,0.7)', fontWeight: 500 }}>
              {userId ? `${credits ?? 0} credite rămase` : '— credite rămase'}
            </span>
          </div>

          <div style={{ padding: '16px 16px 20px' }}>

            {/* Textarea principală */}
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={displayText + (text ? '' : '|')}
              rows={5}
              style={{ width: '100%', background: 'rgba(255,255,255,0.95)', border: '2px solid rgba(14,165,233,0.4)', borderRadius: 10, padding: '12px 14px', color: '#1e293b', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'sans-serif', lineHeight: 1.6 }}
            />
            <p style={{ fontSize: 12, color: 'rgba(30,41,59,0.55)', lineHeight: 1.6, margin: '8px 2px 0', fontStyle: 'italic' }}>
              Pentru un rezultat relevant, includeți: numele firmei sau CUI, site-ul/link-ul anunțului, emailul recruiterului, salariul și poziția, dacă vi s-a cerut o plată sau IBAN, și pe ce canal comunicați.
            </p>

            <ImageUpload onExtracted={handleExtracted} context="job" />

            {/* Divider opționale */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0 14px' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(30,41,59,0.1)' }} />
              <span style={{ fontSize: 11, color: 'rgba(30,41,59,0.45)', fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Câmpuri opționale — îmbunătățesc acoperirea</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(30,41,59,0.1)' }} />
            </div>

            {/* Grid câmpuri opționale */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(30,41,59,0.6)', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>🏢 Firmă / CUI</label>
                <input
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Ex: Acme SRL sau 12345678"
                  style={{ width: '100%', background: '#f8fafc', border: '1.5px solid rgba(30,41,59,0.15)', borderRadius: 8, padding: '9px 12px', color: '#1e293b', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(30,41,59,0.6)', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>🌐 Link anunț / site</label>
                <input
                  value={link}
                  onChange={e => setLink(e.target.value)}
                  placeholder="Ex: https://ejobs.ro/job/123"
                  style={{ width: '100%', background: '#f8fafc', border: '1.5px solid rgba(30,41,59,0.15)', borderRadius: 8, padding: '9px 12px', color: '#1e293b', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(30,41,59,0.6)', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>📧 Email recruiter</label>
                <input
                  value={recruiterEmail}
                  onChange={e => setRecruiterEmail(e.target.value)}
                  placeholder="Ex: hr@companie.ro"
                  style={{ width: '100%', background: '#f8fafc', border: '1.5px solid rgba(30,41,59,0.15)', borderRadius: 8, padding: '9px 12px', color: '#1e293b', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(30,41,59,0.6)', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>💳 IBAN (dacă vi s-a cerut)</label>
                <input
                  value={iban}
                  onChange={e => setIban(e.target.value)}
                  placeholder="Ex: RO49 AAAA 1B31 0075..."
                  style={{ width: '100%', background: '#f8fafc', border: '1.5px solid rgba(30,41,59,0.15)', borderRadius: 8, padding: '9px 12px', color: '#1e293b', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(30,41,59,0.6)', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>💬 Canal comunicare</label>
                <select
                  value={canal}
                  onChange={e => setCanal(e.target.value)}
                  style={{ width: '100%', background: '#f8fafc', border: '1.5px solid rgba(30,41,59,0.15)', borderRadius: 8, padding: '9px 12px', color: canal ? '#1e293b' : 'rgba(30,41,59,0.4)', fontSize: 13, outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}
                >
                  <option value="">Selectați canalul...</option>
                  <option value="email">Email corporativ</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="telegram">Telegram</option>
                  <option value="signal">Signal</option>
                  <option value="altul">Altul</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(30,41,59,0.6)', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>💼 Poziție + salariu</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    value={position}
                    onChange={e => setPosition(e.target.value)}
                    placeholder="Poziție"
                    style={{ flex: 1, background: '#f8fafc', border: '1.5px solid rgba(30,41,59,0.15)', borderRadius: 8, padding: '9px 10px', color: '#1e293b', fontSize: 13, outline: 'none', boxSizing: 'border-box', minWidth: 0 }}
                  />
                  <input
                    value={salary}
                    onChange={e => setSalary(e.target.value)}
                    placeholder="Salariu"
                    style={{ flex: 1, background: '#f8fafc', border: '1.5px solid rgba(30,41,59,0.15)', borderRadius: 8, padding: '9px 10px', color: '#1e293b', fontSize: 13, outline: 'none', boxSizing: 'border-box', minWidth: 0 }}
                  />
                </div>
              </div>

            </div>

            {/* Error */}
            {error && (
              <div style={{ marginTop: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ef4444' }}>
                {error}
              </div>
            )}

            {/* Buton verificare */}
            <button
              onClick={handleVerify}
              disabled={loading || !text.trim()}
              style={{ marginTop: 14, width: '100%', background: loading ? 'rgba(14,165,233,0.5)' : 'linear-gradient(135deg,#0ea5e9,#6366f1)', border: 'none', color: 'white', padding: '14px 0', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading || !text.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {loading ? (
                <>
                  <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Se analizează... (poate dura 10-20 sec)
                </>
              ) : (
                <>Verifică Anunțul <span style={{ fontSize: '1.3em' }}>❯</span></>
              )}
            </button>

          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>

        {/* REZULTATE */}
        {result && (
          <div id="result-section" ref={resultRef} style={{ background: '#ffffff', border: `1px solid ${getScoreColor(result.score)}44`, borderRadius: 16, padding: 28, boxShadow: '0 4px 24px rgba(15,23,42,0.06)', marginBottom: 40 }}>

            {/* Scor + verdict */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <p style={{ fontSize: 12, color: 'rgba(30,41,59,0.55)', marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }}>Scor de risc</p>
                <div style={{ fontSize: 52, fontWeight: 900, color: getScoreColor(result.score), lineHeight: 1 }}>{result.score}</div>
                <div style={{ fontSize: 11, color: 'rgba(30,41,59,0.5)', marginTop: 2 }}>din 100 (0 = sigur, 100 = fraudă)</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ background: `${getScoreColor(result.score)}18`, border: `1px solid ${getScoreColor(result.score)}44`, borderRadius: 10, padding: '8px 16px', display: 'inline-block' }}>
                  <span style={{ fontSize: 20 }}>{result.riskEmoji}</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: getScoreColor(result.score), marginLeft: 8 }}>{result.riskLevel}</span>
                </div>
                <p style={{ fontSize: 12, color: 'rgba(30,41,59,0.55)', marginTop: 8, textAlign: 'right' }}>
                  Analiză bazată pe <strong style={{ color: '#1e293b' }}>{result.activeModules} din 7 module</strong>
                </p>
              </div>
            </div>

            {/* Motive detectate */}
            {result.reasons && result.reasons.length > 0 && (
              <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '16px 18px', marginBottom: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 10 }}>⚠️ Motive de risc detectate:</p>
                {result.reasons.map((r: string, i: number) => (
                  <p key={i} style={{ fontSize: 13, color: 'rgba(30,41,59,0.75)', marginBottom: 5, paddingLeft: 12, lineHeight: 1.5 }}>
                    • {renderMarkdown(r)}
                  </p>
                ))}
              </div>
            )}

            {result.reasons?.length === 0 && result.score <= 30 && (
              <div style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 12, padding: '14px 18px', marginBottom: 24 }}>
                <p style={{ fontSize: 13, color: '#15803d', fontWeight: 600, margin: 0 }}>
                  ✅ Niciun indicator major de fraudă detectat în modulele analizate.
                </p>
              </div>
            )}

            {/* Module breakdown */}
            <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(30,41,59,0.55)', marginBottom: 12, letterSpacing: 0.8, textTransform: 'uppercase' }}>Analiza pe module</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 24 }}>
              {Object.entries(MODULE_META).map(([key, meta]) => {
                const mod = result.modules[key]
                if (!mod) return null
                const unverified = mod.status === 'unverified'
                const risky = !unverified && (mod.score || 0) > 30
                const bg = unverified ? 'rgba(100,116,139,0.07)' : risky ? 'rgba(239,68,68,0.07)' : 'rgba(34,197,94,0.07)'
                const border = unverified ? 'rgba(100,116,139,0.2)' : risky ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'
                const scoreColor = unverified ? '#64748b' : risky ? '#ef4444' : '#22c55e'
                const statusIcon = unverified ? '❓' : risky ? '⚠️' : '✅'

                return (
                  <div key={key} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{meta.icon} {meta.label}</span>
                      <span style={{ fontSize: 10, color: 'rgba(30,41,59,0.4)', flexShrink: 0, marginLeft: 4 }}>{meta.weight}</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: scoreColor }}>
                      {statusIcon} {unverified ? 'Neverificat' : `${mod.score ?? 0}/100`}
                    </div>
                    {unverified && (
                      <div style={{ fontSize: 11, color: 'rgba(30,41,59,0.5)', marginTop: 4 }}>
                        {mod.reason || MODULE_UNVERIFIED_LABELS[key] || 'date lipsă'}
                      </div>
                    )}
                    {!unverified && mod.reasons?.[0] && (
                      <div style={{ fontSize: 11, color: risky ? '#ef4444' : 'rgba(30,41,59,0.6)', marginTop: 4, lineHeight: 1.4 }}>
                        {mod.reasons[0]}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Module neverificate */}
            {result.unverifiedModules?.length > 0 && (
              <div style={{ background: 'rgba(100,116,139,0.06)', border: '1px solid rgba(100,116,139,0.15)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                <p style={{ fontSize: 12, color: 'rgba(30,41,59,0.6)', margin: 0 }}>
                  <strong>Module neverificate:</strong>{' '}
                  {result.unverifiedModules.map((k: string) => MODULE_META[k]?.label || k).join(', ')}.{' '}
                  Completați câmpurile corespunzătoare pentru o analiză completă.
                </p>
              </div>
            )}

            {/* Surse */}
            <div style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.1)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: 'rgba(30,41,59,0.55)', margin: 0, lineHeight: 1.8 }}>
                🔵 ANAF/ONRC &nbsp;|&nbsp; 🔵 URLhaus — abuse.ch &nbsp;|&nbsp; 🔵 Claude AI (analiză text) &nbsp;|&nbsp; 🔵 Baza de date eVerify (raportări comunitate)
              </p>
            </div>

            {/* Disclaimer */}
            <div style={{ background: 'rgba(30,41,59,0.04)', border: '1px solid rgba(30,41,59,0.1)', borderRadius: 10, padding: '12px 16px' }}>
              <p style={{ fontSize: 11, color: 'rgba(30,41,59,0.55)', margin: 0, lineHeight: 1.6 }}>
                <strong style={{ color: 'rgba(30,41,59,0.7)' }}>Notă importantă:</strong> Rezultatele au caracter exclusiv informativ și nu constituie o garanție absolută. Exercitați întotdeauna prudență și raportați joburile suspecte la <strong>ANPC 021.9551</strong>, <strong>Poliția 021.208.25.25</strong> sau <strong>DNSC 1911</strong>.
              </p>
            </div>

          </div>
        )}

        {/* BENEFICII (vizibile când nu există rezultat) */}
        {!result && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 40 }}>
              {[
                { icon: '🛡️', title: '7 module de verificare independente' },
                { icon: '🏢', title: 'Verificare ONRC/ANAF în timp real' },
                { icon: '📧', title: 'Detectare email gratuit vs. corporativ' },
                { icon: '💰', title: 'Identificare scheme financiare frauduloase' },
                { icon: '🤖', title: 'Analiză AI a textului anunțului' },
                { icon: '🏆', title: 'Bază de date cu joburi false raportate' },
              ].map((b, i) => (
                <div key={i} style={{ background: '#ffffff', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
                  <span style={{ fontSize: 28 }}>{b.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{b.title}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                { icon: '🏢', title: 'Verificare Companie', desc: 'CUI-ul firmei este verificat direct în baza de date ANAF/ONRC' },
                { icon: '🌐', title: 'Verificare Domeniu', desc: 'Site-ul anunțului este scanat cu URLhaus și analizat pentru pattern-uri suspecte' },
                { icon: '📧', title: 'Email Recruiter', desc: 'Gmail/Yahoo folosit de recruiter indică o firmă neoficială sau un scam' },
                { icon: '💰', title: 'Fraudă Financiară', desc: 'AI detectează cereri de plată, scheme MLM, money mule și alte fraude financiare' },
                { icon: '🔒', title: 'Colectare Date', desc: 'Detectăm cereri abuzive de CI, CNP sau date bancare înainte de contract' },
              ].map((item, i) => (
                <div key={i} style={{ background: '#ffffff', border: '1px solid rgba(14,165,233,0.1)', borderRadius: 12, padding: '16px 18px', boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{item.title}</p>
                  <p style={{ fontSize: 12, color: 'rgba(30,41,59,0.6)', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
