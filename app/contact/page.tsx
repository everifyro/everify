'use client'
import { useState } from 'react'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [type, setType] = useState('persoana')
  const [company, setCompany] = useState('')
  const [employees, setEmployees] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    if (!name || !email || !message) return
    // Trimitem email mai târziu cu EmailJS sau Resend
    setSent(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'sans-serif', padding: '60px 20px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
            Contactează-<span style={{ color: '#0ea5e9' }}>ne</span>
          </h1>
          <p style={{ color: 'rgba(30,41,59,0.65)', fontSize: 15 }}>
            Suntem aici să te ajutăm. Răspundem în maxim 24 de ore.
          </p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Mesaj trimis!</h2>
            <p style={{ color: 'rgba(30,41,59,0.65)', fontSize: 14 }}>
              Îți vom răspunde la <strong style={{ color: '#1e293b' }}>{email}</strong> în maxim 24 de ore.
            </p>
          </div>
        ) : (
          <div style={{ background: '#ffffff', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 16, padding: 36, boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>

            {/* Tip solicitant */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ color: 'rgba(30,41,59,0.65)', fontSize: 12, display: 'block', marginBottom: 10 }}>TIPUL SOLICITĂRII</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setType('persoana')}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8, border: `1px solid ${type === 'persoana' ? '#0ea5e9' : 'rgba(30,41,59,0.12)'}`,
                    background: type === 'persoana' ? 'rgba(14,165,233,0.1)' : 'transparent',
                    color: type === 'persoana' ? '#0ea5e9' : 'rgba(30,41,59,0.65)',
                    cursor: 'pointer', fontSize: 13, fontWeight: 600
                  }}
                >
                  👤 Persoană fizică
                </button>
                <button
                  onClick={() => setType('companie')}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8, border: `1px solid ${type === 'companie' ? '#0ea5e9' : 'rgba(30,41,59,0.12)'}`,
                    background: type === 'companie' ? 'rgba(14,165,233,0.1)' : 'transparent',
                    color: type === 'companie' ? '#0ea5e9' : 'rgba(30,41,59,0.65)',
                    cursor: 'pointer', fontSize: 13, fontWeight: 600
                  }}
                >
                  🏢 Companie
                </button>
              </div>
            </div>

            {/* Nume */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: 'rgba(30,41,59,0.65)', fontSize: 12, display: 'block', marginBottom: 6 }}>
                {type === 'companie' ? 'NUME COMPANIE' : 'NUME COMPLET'}
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={type === 'companie' ? 'Security Portal SRL' : 'Ion Popescu'}
                style={{ width: '100%', background: 'rgba(30,41,59,0.04)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 8, padding: '10px 12px', color: '#1e293b', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: 'rgba(30,41,59,0.65)', fontSize: 12, display: 'block', marginBottom: 6 }}>EMAIL</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                placeholder="adresa@email.ro"
                style={{ width: '100%', background: 'rgba(30,41,59,0.04)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 8, padding: '10px 12px', color: '#1e293b', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Câmpuri extra pentru companii */}
            {type === 'companie' && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ color: 'rgba(30,41,59,0.65)', fontSize: 12, display: 'block', marginBottom: 6 }}>PERSOANĂ DE CONTACT</label>
                  <input
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="Numele persoanei de contact"
                    style={{ width: '100%', background: 'rgba(30,41,59,0.04)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 8, padding: '10px 12px', color: '#1e293b', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ color: 'rgba(30,41,59,0.65)', fontSize: 12, display: 'block', marginBottom: 6 }}>NUMĂR ANGAJAȚI</label>
                  <select
                    value={employees}
                    onChange={e => setEmployees(e.target.value)}
                    style={{ width: '100%', background: '#ffffff', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 8, padding: '10px 12px', color: '#1e293b', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  >
                    <option value="">Selectează...</option>
                    <option value="1-10">1-10 angajați</option>
                    <option value="11-50">11-50 angajați</option>
                    <option value="51-100">51-100 angajați</option>
                    <option value="101-500">101-500 angajați</option>
                    <option value="500+">500+ angajați</option>
                  </select>
                </div>

                {/* Banner info companii */}
                <div style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '14px 16px', marginBottom: 16, fontSize: 13, color: 'rgba(30,41,59,0.7)', lineHeight: 1.6 }}>
                  🏢 <strong style={{ color: '#1e293b' }}>Soluție dedicată pentru companii</strong><br />
                  Punem la dispoziție un sistem online configurat pentru nevoile echipei tale — dashboard centralizat, rapoarte de securitate lunare și suport dedicat. Prețul este negociat în funcție de dimensiunea companiei.
                </div>
              </>
            )}

            {/* Mesaj */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ color: 'rgba(30,41,59,0.65)', fontSize: 12, display: 'block', marginBottom: 6 }}>MESAJ</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                placeholder={type === 'companie' ? 'Descrie pe scurt nevoile companiei tale...' : 'Cu ce te putem ajuta?'}
                style={{ width: '100%', background: 'rgba(30,41,59,0.04)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 8, padding: '10px 12px', color: '#1e293b', fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'sans-serif', boxSizing: 'border-box' }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!name || !email || !message}
              style={{
                width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                background: name && email && message ? 'linear-gradient(135deg,#0ea5e9,#6366f1)' : 'rgba(30,41,59,0.1)',
                color: 'white', fontSize: 15, fontWeight: 600,
                cursor: name && email && message ? 'pointer' : 'not-allowed'
              }}
            >
              Trimite mesajul →
            </button>

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'rgba(30,41,59,0.5)' }}>
              Sau scrie-ne direct la <a href="mailto:contact@everify.ro" style={{ color: '#0ea5e9' }}>contact@everify.ro</a>
            </p>

          </div>
        )}

      </div>
    </div>
  )
}