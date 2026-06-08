'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { CREDIT_COSTS } from '@/lib/credit-costs'
import { useRouter } from 'next/navigation'
import { useScrollToResult } from '@/hooks/useScrollToResult'
import ImageUpload, { type ExtractedData } from '@/components/ImageUpload'

const ibanPlaceholders = [
  'ex: RO49 AAAA 1B31 0075 9384 0000',
  'Ai primit un IBAN de la un furnizor nou? Verifică-l înainte să plătești...',
  'IBAN dintr-un email neașteptat? Poate fi fraudă BEC (Business Email Compromise)...',
  'Verifică orice IBAN înainte de transfer — cu sau fără spații...',
  'ex: DE89 3704 0044 0532 0130 00',
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

export default function CheckIban() {
  const [iban, setIban] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [credits, setCredits] = useState<number | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [displayText, setDisplayText] = useState('')
  const resultRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  useScrollToResult(resultRef, !loading && !!result)

  useEffect(() => {
    const target = ibanPlaceholders[placeholderIndex]
    let timeout: NodeJS.Timeout
    if (!isDeleting && displayText.length < target.length) {
      timeout = setTimeout(() => setDisplayText(target.slice(0, displayText.length + 1)), 40)
    } else if (!isDeleting && displayText.length === target.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2200)
    } else if (isDeleting && displayText.length > 0) {
      timeout = setTimeout(() => setDisplayText(displayText.slice(0, -1)), 18)
    } else if (isDeleting && displayText.length === 0) {
      setIsDeleting(false)
      setPlaceholderIndex(i => (i + 1) % ibanPlaceholders.length)
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
    if (data.iban) setIban(data.iban)
  }

  const check = async () => {
    if (!iban.trim()) return
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

      if (!profile || profile.credits < CREDIT_COSTS.iban) {
        router.push('/prices')
        return
      }

      const res = await fetch('/api/check-iban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iban: iban.trim(), userId: session.user.id }),
      })

      const data = await res.json()

      if (data.error && res.status !== 200) {
        setError(data.error)
      } else if (data.error && !data.valid) {
        setResult(data)
      } else {
        setResult(data)
        if (typeof data.credits === 'number') setCredits(data.credits)
      }
    } catch {
      setError('Eroare de conexiune. Încercați din nou.')
    }

    setLoading(false)
  }


  const recoveryColor = (level: string) => {
    if (level === 'green') return '#22c55e'
    if (level === 'yellow') return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* HERO */}
      <section style={{
        width: '100%',
        minHeight: 520,
        backgroundImage: 'linear-gradient(rgba(15,23,42,0.55), rgba(15,23,42,0.55)), url(/buy_online.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 20px',
      }}>
        <h1 style={{ color: '#ffffff', fontSize: 42, fontWeight: 800, marginBottom: 12, textAlign: 'center', textShadow: '0 2px 12px rgba(15,23,42,0.5)' }}>
          Verificare <span style={{ color: '#0ea5e9' }}>IBAN</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, maxWidth: 700, textAlign: 'center', textShadow: '0 1px 8px rgba(15,23,42,0.4)', margin: 0 }}>
          Verificați autenticitatea unui IBAN înainte de orice transfer bancar. Serviciul validează cifra de control, identifică banca și evaluează riscul de recuperare a prejudiciului. Consumă {CREDIT_COSTS.iban} credit din contul dumneavoastră.
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
          boxShadow: '0 24px 64px -16px rgba(15,23,42,0.45), 0 8px 24px rgba(15,23,42,0.2)',
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
              <textarea
                value={iban}
                onChange={e => setIban(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); check() } }}
                placeholder={displayText + '|'}
                rows={2}
                style={{ flex: 1, background: 'rgba(255,255,255,0.95)', border: '2px solid rgba(14,165,233,0.4)', borderRadius: 10, padding: '12px 14px', color: '#1e293b', fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'none', fontFamily: 'monospace', letterSpacing: 1 }}
              />
              <button
                onClick={check}
                disabled={loading || !iban.trim()}
                className="btn-pulse"
                style={{ alignSelf: 'stretch', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', border: 'none', color: 'white', padding: '0 24px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading ? 'Se verifică...' : <>Verifică IBAN <span style={{ fontSize: '1.4em', lineHeight: 1 }}>❯</span></>}
              </button>
            </div>
            <ImageUpload onExtracted={handleExtracted} context="iban" />
          </div>

          {error && (
            <div style={{ margin: '0 12px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ef4444' }}>
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 40 }}>
          {[
            { icon: '✅', title: 'Validare matematică MOD97' },
            { icon: '🏦', title: 'Identificare bancă pentru IBANuri RO' },
            { icon: '🌍', title: 'Eligibilitate SEPA și recuperare prejudiciu' },
            { icon: '⚠️', title: 'Alertă BEC (Business Email Compromise)' },
            { icon: '📊', title: 'Raportări din comunitate' },
            { icon: '🔒', title: 'Verificare sigură și confidențială' },
          ].map((b, i) => (
            <div key={i} style={{ background: '#ffffff', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
              <span style={{ fontSize: 28 }}>{b.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{b.title}</span>
            </div>
          ))}
        </div>

        {/* Result */}
        <div ref={resultRef}>
        {result && !result.valid && (
          <div id="result-section" style={{ background: '#ffffff', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16, padding: 28, boxShadow: '0 4px 24px rgba(15,23,42,0.06)', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 28 }}>❌</span>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#ef4444', margin: 0 }}>IBAN invalid</p>
                <p style={{ fontSize: 13, color: 'rgba(30,41,59,0.7)', margin: '4px 0 0' }}>{renderMarkdown(result.error)}</p>
              </div>
            </div>
          </div>
        )}

        {result && result.valid && (
          <div id="result-section" style={{ background: '#ffffff', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 16, padding: 28, boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>

            {/* Header: IBAN + valid badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ fontSize: 11, color: 'rgba(30,41,59,0.6)', marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }}>IBAN verificat</p>
                <p style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', fontFamily: 'monospace', letterSpacing: 2, margin: 0 }}>{result.iban}</p>
              </div>
              <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: 10, padding: '8px 16px', textAlign: 'right' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#16a34a', margin: 0 }}>✅ IBAN valid</p>
                <p style={{ fontSize: 10, color: 'rgba(30,41,59,0.55)', margin: '3px 0 0', lineHeight: 1.4, maxWidth: 220 }}>Formatul și cifra de control matematică sunt corecte conform standardului internațional ISO 13616.</p>
              </div>
            </div>

            {/* Grid de info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>

              <div style={{ background: 'rgba(30,41,59,0.04)', border: '1px solid rgba(30,41,59,0.1)', borderRadius: 10, padding: '14px 16px' }}>
                <p style={{ fontSize: 11, color: 'rgba(30,41,59,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Țara emitentă</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>{result.countryName} ({result.countryCode})</p>
              </div>

              {result.bankName && (
                <div style={{ background: 'rgba(30,41,59,0.04)', border: '1px solid rgba(30,41,59,0.1)', borderRadius: 10, padding: '14px 16px' }}>
                  <p style={{ fontSize: 11, color: 'rgba(30,41,59,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Bancă emitentă</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0 }}>{result.bankName}</p>
                  {result.swiftCode && (
                    <p style={{ fontSize: 11, color: 'rgba(30,41,59,0.55)', margin: '5px 0 0', fontFamily: 'monospace', letterSpacing: 0.5 }}>
                      Cod SWIFT/BIC: <strong style={{ color: '#1e293b' }}>{result.swiftCode}</strong>
                    </p>
                  )}
                </div>
              )}

              <div style={{ background: 'rgba(30,41,59,0.04)', border: '1px solid rgba(30,41,59,0.1)', borderRadius: 10, padding: '14px 16px' }}>
                <p style={{ fontSize: 11, color: 'rgba(30,41,59,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Eligibilitate SEPA</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: result.isSepa ? '#22c55e' : '#ef4444', margin: 0 }}>
                  {result.isSepa ? '✅ Zonă SEPA' : '❌ Non-SEPA'}
                </p>
                <p style={{ fontSize: 10, color: 'rgba(30,41,59,0.5)', margin: '4px 0 0', lineHeight: 1.4 }}>
                  {result.isSepa
                    ? 'SEPA (Single Euro Payments Area) permite transferuri în euro rapide și ieftine între cele 36 de țări membre.'
                    : 'Costuri internaționale ridicate'}
                </p>
              </div>

              {/* Raportări comunitate — temporar ascuns
              <div style={{ background: 'rgba(30,41,59,0.04)', border: '1px solid rgba(30,41,59,0.1)', borderRadius: 10, padding: '14px 16px' }}>
                <p style={{ fontSize: 11, color: 'rgba(30,41,59,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Raportări comunitate</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: result.communityReports > 0 ? '#ef4444' : '#22c55e', margin: 0 }}>
                  {result.communityReports > 0 ? `🚨 ${result.communityReports} raportări` : '✅ Nicio raportare'}
                </p>
                <p style={{ fontSize: 10, color: 'rgba(30,41,59,0.5)', margin: '4px 0 0', lineHeight: 1.4 }}>Baza de date eVerify</p>
              </div>
              */}

            </div>

            {/* Recuperare prejudiciu */}
            <div style={{
              background: result.recoveryLevel === 'green' ? 'rgba(34,197,94,0.08)' : result.recoveryLevel === 'yellow' ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${recoveryColor(result.recoveryLevel)}44`,
              borderRadius: 12,
              padding: '16px 18px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
            }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{result.recoveryEmoji}</span>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: recoveryColor(result.recoveryLevel), margin: '0 0 4px' }}>
                  {result.recoveryLabel}
                </p>
                <p style={{ fontSize: 13, color: 'rgba(30,41,59,0.7)', margin: 0, lineHeight: 1.5 }}>
                  {result.recoveryLevel === 'green' && 'Contul se află în România sau spațiul UE. Autoritățile pot solicita înghețarea contului și recuperarea sumelor transferate fraudulos.'}
                  {result.recoveryLevel === 'yellow' && 'Recuperarea fondurilor în afara UE este posibilă prin cooperare internațională, dar durează și necesită avocați specializați.'}
                  {result.recoveryLevel === 'red' && 'Recuperarea fondurilor în această jurisdicție este extrem de dificilă. Contactați imediat banca și poliția pentru a limita prejudiciul.'}
                </p>
                <p style={{ fontSize: 12, color: recoveryColor(result.recoveryLevel), margin: '6px 0 0', fontWeight: 600, lineHeight: 1.4 }}>
                  {result.recoveryLevel === 'green' && 'Puteți solicita băncii un SEPA Recall în maxim 10 zile lucrătoare de la transfer.'}
                  {result.recoveryLevel === 'yellow' && 'Recuperarea necesită proceduri internaționale, poate dura luni și implică costuri suplimentare.'}
                  {result.recoveryLevel === 'red' && 'Recuperarea este practic imposibilă fără un proces juridic internațional costisitor.'}
                </p>
              </div>
            </div>

            {/* Atenție la numele beneficiarului */}
            <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e', margin: '0 0 4px' }}>Atenție la numele beneficiarului</p>
                <p style={{ fontSize: 13, color: 'rgba(30,41,59,0.75)', margin: 0, lineHeight: 1.6 }}>
                  La efectuarea oricărei plăți, verificați că numele beneficiarului afișat în aplicația băncii corespunde exact cu persoana sau firma căreia intenționați să îi trimiteți banii. O neconcordanță poate indica un IBAN fraudulos.
                </p>
              </div>
            </div>

            {/* Disclaimer */}
            <div style={{ background: 'rgba(30,41,59,0.04)', border: '1px solid rgba(30,41,59,0.1)', borderRadius: 10, padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: 'rgba(30,41,59,0.75)', margin: 0, lineHeight: 1.6 }}>
                <strong style={{ color: '#1e293b' }}>Disclaimer:</strong> Clasificarea este orientativă. Un IBAN valid matematic nu garantează că destinatarul este legitim. Contactați imediat banca și depuneți plângere la ANPC (021.9551) și Poliție (112) în cazul unui prejudiciu.
              </p>
            </div>

          </div>
        )}
        </div>

        {/* Fraudă prin înlocuire IBAN (BEC) — întotdeauna vizibil */}
        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '16px 20px', marginTop: 24, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>⚠️</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#b91c1c', margin: '0 0 4px' }}>Fraudă prin înlocuire IBAN</p>
            <p style={{ fontSize: 13, color: 'rgba(30,41,59,0.75)', margin: 0, lineHeight: 1.6 }}>
              Escrocii interceptează emailurile dintre firme și înlocuiesc IBAN-ul real al furnizorului cu unul fraudulos. Banii ajung la escroci, nu la furnizor. Este cea mai frecventă fraudă B2B din Europa.
            </p>
          </div>
        </div>

        {/* Sfaturi pentru a evita frauda cu IBAN — întotdeauna vizibil */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 12, padding: '20px 24px', marginTop: 16, boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>💡</span> Sfaturi pentru a evita frauda cu IBAN
          </p>
          <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Sunați furnizorul la un număr cunoscut pentru a confirma orice IBAN nou sau modificat — nu folosiți numărul din emailul suspect.',
              'Verificați IBAN-ul caracter cu caracter, în special cifrele din mijloc — escrocii păstrează începutul și sfârșitul identice cu IBAN-ul real pentru a nu fi observați.',
              'Fiți precaut la urgențe artificiale: presiunea de a plăti imediat este un semn clasic de fraudă.',
              'Verificați adresa de email a expeditorului caracter cu caracter — diferențele subtile sunt greu de observat.',
              'Pentru un IBAN nou, trimiteți o sumă mică de test și confirmați că a ajuns înainte de plata principală.',
              'Salvați IBAN-urile cunoscute în agenda băncii — orice diferență față de cel salvat trebuie verificată telefonic.',
            ].map((tip, i) => (
              <li key={i} style={{ fontSize: 13, color: 'rgba(30,41,59,0.8)', lineHeight: 1.6 }}>{tip}</li>
            ))}
          </ol>
        </div>

        {/* Edu cards afișate cât timp nu e rezultat */}
        {!result && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 8 }}>
            {[
              { icon: '🔢', title: 'Validare MOD97', desc: 'Algoritmul matematic standard ISO 13616 verifică integritatea cifrelor IBAN.' },
              { icon: '🏦', title: 'Identificare bancă', desc: 'Extrage codul BIC din IBAN și identifică banca emitentă pentru IBANuri românești.' },
              { icon: '🌍', title: 'Zona SEPA', desc: 'Verifică dacă IBAN-ul aparține zonei SEPA, unde transferurile sunt mai ușor de recuperat.' },
              { icon: '⚠️', title: 'Alertă BEC', desc: 'Business Email Compromise — cea mai frecventă fraudă B2B prin înlocuirea IBAN-urilor reale.' },
              { icon: '📊', title: 'Raportări comunitate', desc: 'Verifică dacă IBAN-ul a fost raportat anterior ca fraudulos de alți utilizatori eVerify.' },
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
