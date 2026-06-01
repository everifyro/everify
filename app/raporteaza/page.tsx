'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const DEFAULT_TYPE = 'Nespecificat (se va determina din descriere)'

const SCAM_TYPES = [
  DEFAULT_TYPE,
  'Phishing / email fals',
  'SMS fals (smishing)',
  'Apel telefonic fals (vishing)',
  'Inspector bancar fals',
  'Arest digital fals',
  'Site fals / magazin online fals',
  'Ofertă de muncă falsă',
  'Investiții false / criptomonede',
  'Romantic scam / escrocheire sentimentală',
  'Loterie / câștig fals',
  'Fraudă marketplace (OLX, Facebook)',
  'Fraudă cu criptomonede',
  'SIM swap / preluare număr',
  'Malware / virus / ransomware',
  'Altul',
]

export default function RaporteazaPage() {
  const [mode, setMode] = useState<'anonim' | 'contact'>('anonim')
  const [scamType, setScamType] = useState(DEFAULT_TYPE)
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [email, setEmail] = useState('')
  const [originalMessage, setOriginalMessage] = useState('')
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const urls: string[] = []
    for (const file of files) {
      const path = `reports/${Date.now()}-${file.name.replace(/\s+/g, '_')}`
      const { error: upErr } = await supabase.storage
        .from('scam-attachments')
        .upload(path, file, { upsert: false })
      if (!upErr) {
        const { data } = supabase.storage.from('scam-attachments').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    return urls
  }

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Descrierea este obligatorie.')
      return
    }
    setError('')
    setLoading(true)
    try {
      let messageText = originalMessage.trim()
      if (attachmentFiles.length > 0) {
        const urls = await uploadFiles(attachmentFiles)
        if (urls.length > 0) {
          messageText += (messageText ? '\n\n' : '') + 'Atașamente:\n' + urls.join('\n')
        } else {
          messageText += (messageText ? '\n\n' : '') + 'Fișiere atașate (upload eșuat): ' + attachmentFiles.map(f => f.name).join(', ')
        }
      }

      const res = await fetch('/api/report-scam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: scamType,
          description,
          link: link.trim() || null,
          email: mode === 'contact' && email.trim() ? email.trim() : null,
          is_anonymous: mode === 'anonim',
          original_message: messageText || null,
        }),
      })
      if (res.ok) {
        setSent(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Eroare la trimitere. Încearcă din nou.')
      }
    } catch {
      setError('Eroare de rețea. Încearcă din nou.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setSent(false)
    setDescription('')
    setLink('')
    setEmail('')
    setOriginalMessage('')
    setAttachmentFiles([])
    setScamType(DEFAULT_TYPE)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', padding: '60px 20px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, lineHeight: 1.2 }}>
            Raportați un <span style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>scam sau o fraudă</span>
          </h1>
          <p style={{ color: 'rgba(30,41,59,0.65)', fontSize: 15, maxWidth: 480, margin: '0 auto' }}>
            Raportările dvs. ne ajută să protejăm și alți utilizatori. Fiecare sesizare este analizată de echipa noastră.
          </p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 20 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Raportare trimisă!</h2>
            <p style={{ color: 'rgba(30,41,59,0.7)', fontSize: 15, lineHeight: 1.7, maxWidth: 440, margin: '0 auto 28px' }}>
              Mulțumim pentru raportare! Echipa eVerify va analiza informațiile transmise în cel mai scurt timp. Contribuția ta protejează alți utilizatori.
            </p>
            <button
              onClick={reset}
              style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: 'white', border: 'none', borderRadius: 10, padding: '12px 28px', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}
            >Trimite o altă raportare</button>
          </div>
        ) : (
          <div style={{ background: '#ffffff', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: 36, boxShadow: '0 4px 32px rgba(15,23,42,0.07)' }}>

            {/* Selector Anonim / Cu date de contact */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ color: 'rgba(30,41,59,0.55)', fontSize: 12, fontWeight: 700, letterSpacing: 1, display: 'block', marginBottom: 10 }}>MOD DE RAPORTARE</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {(['anonim', 'contact'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: `2px solid ${mode === m ? '#6366f1' : 'rgba(30,41,59,0.12)'}`,
                      background: mode === m ? 'rgba(99,102,241,0.06)' : 'transparent',
                      color: mode === m ? '#6366f1' : 'rgba(30,41,59,0.55)',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {m === 'anonim' ? '🕵️ Anonim' : '📧 Cu date de contact'}
                  </button>
                ))}
              </div>
              <p style={{ color: 'rgba(30,41,59,0.45)', fontSize: 11, marginTop: 8 }}>
                {mode === 'anonim'
                  ? 'Nu colectăm nicio informație personală. Raportarea este complet anonimă.'
                  : 'Puteți lăsa un email pentru a primi confirmarea raportării.'}
              </p>
            </div>

            {/* Tip scam */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: 'rgba(30,41,59,0.55)', fontSize: 12, fontWeight: 700, letterSpacing: 1, display: 'block', marginBottom: 8 }}>TIP SCAM *</label>
              <select
                value={scamType}
                onChange={e => setScamType(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(30,41,59,0.15)', background: '#fff', fontSize: 14, color: '#1e293b', outline: 'none', cursor: 'pointer' }}
              >
                {SCAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Descriere */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: 'rgba(30,41,59,0.55)', fontSize: 12, fontWeight: 700, letterSpacing: 1, display: 'block', marginBottom: 8 }}>DESCRIERE *</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Descrieți pe scurt ce s-a întâmplat: cum ați fost contactat, ce vi s-a cerut, dacă ați pierdut bani etc."
                rows={4}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${!description.trim() && error ? '#ef4444' : 'rgba(30,41,59,0.15)'}`, background: '#fff', fontSize: 14, color: '#1e293b', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Email / telefon / site suspect */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: 'rgba(30,41,59,0.55)', fontSize: 12, fontWeight: 700, letterSpacing: 1, display: 'block', marginBottom: 8 }}>EMAIL / TELEFON / SITE SUSPECT <span style={{ color: 'rgba(30,41,59,0.35)', fontWeight: 400 }}>(opțional)</span></label>
              <textarea
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="Introduceți orice informație relevantă: link, număr de telefon, IBAN, email, etc."
                rows={3}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(30,41,59,0.15)', background: '#fff', fontSize: 14, color: '#1e293b', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Email utilizator — doar dacă nu e anonim */}
            {mode === 'contact' && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ color: 'rgba(30,41,59,0.55)', fontSize: 12, fontWeight: 700, letterSpacing: 1, display: 'block', marginBottom: 8 }}>EMAIL-UL TĂU <span style={{ color: 'rgba(30,41,59,0.35)', fontWeight: 400 }}>(opțional)</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="adresa@email.ro"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(30,41,59,0.15)', background: '#fff', fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box' }}
                />
                <p style={{ color: 'rgba(30,41,59,0.4)', fontSize: 11, marginTop: 6 }}>Dacă lăsați email, veți primi o confirmare a raportării.</p>
              </div>
            )}

            {/* Mesaj original + upload fișiere */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ color: 'rgba(30,41,59,0.55)', fontSize: 12, fontWeight: 700, letterSpacing: 1, display: 'block', marginBottom: 8 }}>MESAJ ORIGINAL <span style={{ color: 'rgba(30,41,59,0.35)', fontWeight: 400 }}>(opțional)</span></label>
              <textarea
                value={originalMessage}
                onChange={e => setOriginalMessage(e.target.value)}
                placeholder="Copiați aici textul exact al mesajului primit (SMS, email, WhatsApp etc.)"
                rows={3}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(30,41,59,0.15)', background: '#fff', fontSize: 14, color: '#1e293b', resize: 'vertical', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1px dashed rgba(99,102,241,0.35)', borderRadius: 10, cursor: 'pointer', background: 'rgba(99,102,241,0.03)' }}>
                <span style={{ fontSize: 18 }}>📎</span>
                <span style={{ fontSize: 13, color: 'rgba(30,41,59,0.6)' }}>
                  {attachmentFiles.length > 0
                    ? attachmentFiles.map(f => f.name).join(', ')
                    : 'Atașați capturi de ecran sau documente (PDF, imagini)'}
                </span>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={e => setAttachmentFiles(Array.from(e.target.files ?? []))}
                />
              </label>
              {attachmentFiles.length > 0 && (
                <button
                  onClick={() => setAttachmentFiles([])}
                  style={{ marginTop: 6, background: 'none', border: 'none', color: 'rgba(30,41,59,0.45)', fontSize: 11, cursor: 'pointer', padding: 0 }}
                >✕ Șterge fișierele selectate</button>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 20 }}>
                <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>⚠️ {error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ width: '100%', padding: '14px', background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg,#3b82f6,#6366f1)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', animation: loading ? 'none' : 'pulse-btn 2s infinite', transition: 'opacity 0.2s' }}
            >
              {loading ? 'Se trimite...' : 'Trimite raportarea ❯'}
            </button>

            {/* GDPR */}
            <div style={{ marginTop: 20, background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 10, padding: '12px 16px' }}>
              <p style={{ color: 'rgba(30,41,59,0.55)', fontSize: 11, margin: 0, lineHeight: 1.6 }}>
                <strong style={{ color: 'rgba(30,41,59,0.7)' }}>🔒 GDPR & Confidențialitate:</strong> Datele furnizate sunt utilizate exclusiv pentru investigarea și prevenirea fraudelor. Raportările anonime nu conțin date cu caracter personal. Dacă ați furnizat un email, acesta este stocat securizat și nu este partajat cu terți. Puteți solicita ștergerea datelor la <a href="mailto:contact@everify.ro" style={{ color: '#6366f1', textDecoration: 'none' }}>contact@everify.ro</a>. Conform <a href="/privacy" style={{ color: '#6366f1', textDecoration: 'none' }}>Politicii de Confidențialitate</a>.
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse-btn {
          0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.6); }
          70% { box-shadow: 0 0 0 10px rgba(99,102,241,0); }
          100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
        }
      `}</style>
    </div>
  )
}
