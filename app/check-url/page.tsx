'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { CREDIT_COSTS } from '@/lib/credit-costs'
import { useRouter } from 'next/navigation'
import { useScrollToResult } from '@/hooks/useScrollToResult'
import ImageUpload, { type ExtractedData } from '@/components/ImageUpload'

const urlPlaceholders = [
  'ex: www.site-suspect.ro sau https://site-suspect.ro',
  'Vrei să cumperi de pe un site nou? Introdu adresa lui...',
  'Ai primit un link suspect? Verifică-l înainte să dai click...',
  'Produsul pare prea ieftin? Verifică dacă e real site-ul de pe care cumperi...',
  'Site-ul cere date bancare? Verifică-l mai întâi aici...',
  'Ai găsit o ofertă prea bună? Verifică autenticitatea site-ului...',
]

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

export default function CheckUrl() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [credits, setCredits] = useState<number|null>(null)
  const [userId, setUserId] = useState<string|null>(null)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [displayText, setDisplayText] = useState('')
  const resultRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  useScrollToResult(resultRef, !loading && !!result)

  useEffect(() => {
    const target = urlPlaceholders[placeholderIndex]
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
      setPlaceholderIndex((i) => (i + 1) % urlPlaceholders.length)
    }

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, placeholderIndex])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id)
        supabase.from('profiles').select('credits').eq('id', session.user.id).single()
          .then(({ data }) => { if (data) setCredits(data.credits) })
      }
    })
  }, [])

  const handleExtracted = (data: ExtractedData) => {
    if (data.link) setUrl(data.link)
  }

  const check = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', session.user.id)
        .single()

      if (!profile || profile.credits < CREDIT_COSTS.url) {
        router.push('/prices')
        return
      }

      const res = await fetch('/api/check-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), userId: session.user.id })
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResult(data)
        // Soldul este scăzut server-side; folosim valoarea returnată de API
        if (typeof data.credits === 'number') setCredits(data.credits)
      }
    } catch {
      setError('Eroare de conexiune. Încercați din nou.')
    }

    setLoading(false)
  }


  const getScoreColor = (score: number) => {
    if (score >= 75) return '#22c55e'
    if (score >= 50) return '#f59e0b'
    if (score >= 25) return '#f97316'
    return '#ef4444'
  }

  const getScoreEmoji = (score: number) => {
    if (score >= 75) return '✅'
    if (score >= 50) return '⚠️'
    if (score >= 25) return '🔶'
    return '🔴'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* HERO full-width */}
      <section style={{
        width: '100%',
        minHeight: 520,
        backgroundImage: 'linear-gradient(rgba(15,23,42,0.50), rgba(15,23,42,0.50)), url(/buy_online.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 20px'
      }}>
        <h1 style={{ color: '#ffffff', fontSize: 42, fontWeight: 800, marginBottom: 12, textAlign: 'center', textShadow: '0 2px 12px rgba(15,23,42,0.5)' }}>
          Verificare <span style={{ color: '#0ea5e9' }}>Site Web</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, maxWidth: 700, textAlign: 'center', textShadow: '0 1px 8px rgba(15,23,42,0.4)', margin: 0 }}>
          Verificați dacă un site web este sigur înainte de a introduce date personale sau de a efectua o plată. Serviciul consumă 2 credite din contul dumneavoastră.
        </p>
        {userId && (
          <p style={{ marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
            <a href="/dashboard" style={{ color: '#0ea5e9' }}>Dashboard</a> · {credits ?? 0} credite rămase
          </p>
        )}

        <div style={{
          width: '100%',
          maxWidth: 600,
          marginTop: 36,
          background: 'rgba(255,255,255,0.97)',
          border: '2px solid rgba(14,165,233,0.5)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 24px 64px -16px rgba(15,23,42,0.45), 0 8px 24px rgba(15,23,42,0.2)'
        }}>
          <div style={{ padding: '12px 18px', background: 'rgba(14,165,233,0.15)', borderBottom: '1px solid rgba(14,165,233,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 0.3, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#1e293b' }}><span style={{ color: '#0ea5e9' }}>e</span>Verify</span>
              <span style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: 'white', borderRadius: 4, padding: '1px 5px', fontSize: 9, fontWeight: 800 }}>AI</span>
            </span>
            <span style={{ fontSize: 12, color: 'rgba(30,41,59,0.7)', fontWeight: 500 }}>
              {userId ? `${credits ?? 0} credite rămase` : '— credite rămase'}
            </span>
          </div>

          <div style={{ padding: '12px 12px 4px' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') check() }}
                placeholder={displayText + '|'}
                style={{ flex: 1, background: 'rgba(255,255,255,0.95)', border: '2px solid rgba(14,165,233,0.4)', borderRadius: 10, padding: '12px 14px', color: '#1e293b', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
              <button
                onClick={check}
                disabled={loading || !url.trim()}
                className="btn-pulse"
                style={{ alignSelf: 'stretch', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', border: 'none', color: 'white', padding: '0 24px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center' }}
              >
                {loading ? 'Se verifică...' : <>Verifică <span style={{ fontSize: '1.4em', lineHeight: 1 }}>❯</span></>}
              </button>
            </div>
            <ImageUpload onExtracted={handleExtracted} context="url" />
          </div>

          {error && (
            <div style={{ margin: '0 12px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ef4444' }}>
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Below-hero content */}
      <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>

        {/* Beneficii */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 40 }}>
          {[
            { icon: '🛡️', title: '3 surse independente de verificare' },
            { icon: '🔍', title: 'Detectare typosquatting' },
            { icon: '📅', title: 'Verificare vârstă domeniu' },
            { icon: '⚡', title: 'Rezultat în 3-5 secunde' },
            { icon: '🆓', title: 'Primul credit gratuit' },
            { icon: '🏆', title: 'Singurul serviciu specializat pentru România' },
          ].map((b, i) => (
            <div key={i} style={{ background: '#ffffff', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
              <span style={{ fontSize: 28 }}>{b.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{b.title}</span>
            </div>
          ))}
        </div>

        {result && (
          <div id="result-section" ref={resultRef} style={{ background: '#ffffff', border: `1px solid ${getScoreColor(result.trustScore)}44`, borderRadius: 16, padding: 28, boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <p style={{ fontSize: 12, color: 'rgba(30,41,59,0.6)', marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }}>Site analizat</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#0ea5e9', wordBreak: 'break-all' }}>{result.domain}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 52, fontWeight: 900, color: getScoreColor(result.trustScore), lineHeight: 1 }}>
                  {result.trustScore}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(30,41,59,0.6)', marginTop: 2 }}>TRUST SCORE / 100</div>
              </div>
            </div>

            <div style={{ background: `${getScoreColor(result.trustScore)}15`, border: `1px solid ${getScoreColor(result.trustScore)}44`, borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>{getScoreEmoji(result.trustScore)}</span>
              <p style={{ fontSize: 16, fontWeight: 700, color: getScoreColor(result.trustScore), margin: 0 }}>
                VERDICT: {renderMarkdown(result.verdict)}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>

              <div style={{ background: 'rgba(30,41,59,0.04)', border: '1px solid rgba(30,41,59,0.1)', borderRadius: 10, padding: '14px 16px' }}>
                <p style={{ fontSize: 11, color: 'rgba(30,41,59,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Conexiune securizată</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: result.checks.https.secure ? '#22c55e' : '#ef4444', margin: 0 }}>
                  {result.checks.https.secure ? '✅ HTTPS Activ' : '❌ HTTP Nesecurizat'}
                </p>
              </div>

              <div style={{ background: 'rgba(30,41,59,0.04)', border: '1px solid rgba(30,41,59,0.1)', borderRadius: 10, padding: '14px 16px' }}>
                <p style={{ fontSize: 11, color: 'rgba(30,41,59,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Google Safe Browsing</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: result.checks.safeBrowsing?.safe === false ? '#ef4444' : '#22c55e', margin: 0 }}>
                  {result.checks.safeBrowsing?.safe === null ? '⚠️ Indisponibil' : result.checks.safeBrowsing?.safe === false ? '🔴 Periculos' : '✅ Sigur'}
                </p>
                <p style={{ fontSize: 10, color: 'rgba(30,41,59,0.5)', margin: '4px 0 0', lineHeight: 1.4 }}>Baza de date Google</p>
              </div>

              <div style={{ background: 'rgba(30,41,59,0.04)', border: '1px solid rgba(30,41,59,0.1)', borderRadius: 10, padding: '14px 16px' }}>
                <p style={{ fontSize: 11, color: 'rgba(30,41,59,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>URLhaus — abuse.ch</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: result.checks.urlhaus?.safe === false ? '#ef4444' : result.checks.urlhaus?.safe === null ? '#f59e0b' : '#22c55e', margin: 0 }}>
                  {result.checks.urlhaus?.error ? '⚠️ Indisponibil' : result.checks.urlhaus?.safe === false ? '🔴 Periculos' : '✅ Sigur'}
                </p>
                <p style={{ fontSize: 10, color: 'rgba(30,41,59,0.5)', margin: '4px 0 0', lineHeight: 1.4 }}>Partener Interpol/Europol</p>
              </div>

              <div style={{ background: 'rgba(30,41,59,0.04)', border: '1px solid rgba(30,41,59,0.1)', borderRadius: 10, padding: '14px 16px' }}>
                <p style={{ fontSize: 11, color: 'rgba(30,41,59,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Reputație domeniu</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: result.checks.urlhausDomain?.safe === false ? '#ef4444' : '#22c55e', margin: 0 }}>
                  {result.checks.urlhausDomain?.error ? '⚠️ Indisponibil' : result.checks.urlhausDomain?.safe === false ? `🔴 ${result.checks.urlhausDomain?.urlsCount} URL-uri malițioase` : '✅ Fără istoric negativ'}
                </p>
                <p style={{ fontSize: 10, color: 'rgba(30,41,59,0.5)', margin: '4px 0 0', lineHeight: 1.4 }}>Istoric domeniu</p>
              </div>

              <div style={{ background: 'rgba(30,41,59,0.04)', border: '1px solid rgba(30,41,59,0.1)', borderRadius: 10, padding: '14px 16px' }}>
                <p style={{ fontSize: 11, color: 'rgba(30,41,59,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Vârstă domeniu</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: result.checks.domain?.ageMonths >= 12 ? '#22c55e' : result.checks.domain?.ageMonths >= 3 ? '#f59e0b' : '#ef4444', margin: 0 }}>
                  {result.checks.domain?.ageMonths ? `${result.checks.domain.ageMonths} luni` : '⚠️ Necunoscut'}
                </p>
                <p style={{ fontSize: 10, color: 'rgba(30,41,59,0.5)', margin: '4px 0 0', lineHeight: 1.4 }}>Sub 3 luni = risc ridicat</p>
              </div>

            </div>

            {result.warnings && result.warnings.length > 0 && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '16px 18px', marginBottom: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 10 }}>⚠️ Semne de alarmă identificate:</p>
                {result.warnings.map((w: string, i: number) => (
                  <p key={i} style={{ fontSize: 13, color: 'rgba(30,41,59,0.75)', marginBottom: 4, paddingLeft: 12 }}>
                    • {renderMarkdown(w)}
                  </p>
                ))}
              </div>
            )}

            <div style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.1)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: 'rgba(30,41,59,0.6)', margin: '0 0 6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Surse de verificare utilizate</p>
              <p style={{ fontSize: 11, color: 'rgba(30,41,59,0.55)', margin: 0, lineHeight: 1.8 }}>
                🔵 Google Safe Browsing &nbsp;|&nbsp; 🔵 URLhaus — abuse.ch (partener Interpol/Europol) &nbsp;|&nbsp; 🔵 Analiză pattern URL &nbsp;|&nbsp; 🔵 Detectare typosquatting
              </p>
            </div>

            <div style={{ background: 'rgba(30,41,59,0.04)', border: '1px solid rgba(30,41,59,0.1)', borderRadius: 10, padding: '12px 16px' }}>
              <p style={{ fontSize: 11, color: 'rgba(30,41,59,0.55)', margin: 0, lineHeight: 1.6 }}>
                <strong style={{ color: 'rgba(30,41,59,0.75)' }}>Notă importantă:</strong> Rezultatele acestei verificări sunt generate automat și au caracter exclusiv informativ. Acestea nu constituie o garanție absolută a siguranței sau nesiguranței site-ului verificat și nu pot fi utilizate ca probă în niciun proces juridic sau administrativ. Exercitați întotdeauna prudență.
              </p>
            </div>

          </div>
        )}

        {!result && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 8 }}>
            {[
              { icon: '🛡️', title: 'Google Safe Browsing', desc: 'Verificare în baza de date Google cu miliarde de site-uri analizate' },
              { icon: '🌐', title: 'URLhaus — abuse.ch', desc: 'Partener oficial Interpol/Europol — bază de date cu URL-uri malițioase active' },
              { icon: '🔒', title: 'Verificare HTTPS', desc: 'Confirmă dacă site-ul folosește o conexiune securizată și criptată' },
              { icon: '📅', title: 'Vârstă domeniu', desc: 'Site-urile noi (sub 3 luni) sunt frecvent asociate cu fraude online' },
              { icon: '🔍', title: 'Analiză URL', desc: 'Detectează pattern-uri suspecte și tentative de typosquatting' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#ffffff', border: '1px solid rgba(14,165,233,0.1)', borderRadius: 12, padding: '16px 18px', boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{item.title}</p>
                <p style={{ fontSize: 12, color: 'rgba(30,41,59,0.6)', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}