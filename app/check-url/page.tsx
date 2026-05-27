'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CheckUrl() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [credits, setCredits] = useState<number|null>(null)
  const [userId, setUserId] = useState<string|null>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id)
        supabase.from('profiles').select('credits').eq('id', session.user.id).single()
          .then(({ data }) => { if (data) setCredits(data.credits) })
      }
    })
  }, [])

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

      if (!profile || profile.credits <= 0) {
        router.push('/prices')
        return
      }

      const res = await fetch('/api/check-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResult(data)
        const newCredits = (profile.credits || 1) - 1
        await supabase
          .from('profiles')
          .update({ credits: newCredits })
          .eq('id', session.user.id)
        setCredits(newCredits)
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
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'sans-serif', padding: '60px 20px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🌐</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
            Verificare <span style={{ color: '#0ea5e9' }}>Site Web</span>
          </h1>
          <p style={{ color: 'rgba(30,41,59,0.65)', fontSize: 15, maxWidth: 500, margin: '0 auto' }}>
            Verificați dacă un site web este sigur înainte de a introduce date personale sau de a efectua o plată. Serviciul consumă 1 verificare din contul dumneavoastră.
          </p>
          {userId && (
            <p style={{ marginTop: 12, fontSize: 13, color: 'rgba(30,41,59,0.55)' }}>
              <a href="/dashboard" style={{ color: '#0ea5e9' }}>Dashboard</a> · {credits ?? 0} credite rămase
            </p>
          )}
        </div>

        <div style={{ background: '#ffffff', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 16, padding: 28, marginBottom: 24, boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
          <label style={{ fontSize: 13, color: 'rgba(30,41,59,0.65)', display: 'block', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>
            Adresa site-ului de verificat
          </label>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') check() }}
              placeholder="ex: www.site-suspect.ro sau https://site-suspect.ro"
              style={{ flex: 1, background: 'rgba(30,41,59,0.04)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '12px 16px', color: '#1e293b', fontSize: 14, outline: 'none' }}
            />
            <button
              onClick={check}
              disabled={loading || !url.trim()}
              style={{ background: loading || !url.trim() ? 'rgba(30,41,59,0.1)' : 'linear-gradient(135deg,#0ea5e9,#6366f1)', border: 'none', color: 'white', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loading || !url.trim() ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
            >
              {loading ? 'Se verifică...' : 'Verifică →'}
            </button>
          </div>

          {error && (
            <div style={{ marginTop: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ef4444' }}>
              {error}
            </div>
          )}
        </div>

        {result && (
          <div style={{ background: '#ffffff', border: `1px solid ${getScoreColor(result.trustScore)}44`, borderRadius: 16, padding: 28, boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>

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
                VERDICT: {result.verdict}
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
                    • {w}
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