'use client'
import { useState } from 'react'

const numbers = [
  {
    category: '🚨 Urgențe generale',
    items: [
      { name: 'Urgente (Politie, Ambulanta, Pompieri)', number: '112', note: 'Gratuit, 24/7' },
      { name: 'Politie - Criminalitate informatica', number: '0212082525', note: 'Criminalitate informatica' },
    ]
  },
  {
    category: '💻 Fraude & Scam-uri Online',
    items: [
      { name: 'DNSC - Securitate Cibernetica', number: '1911', note: 'Gratuit, raportare fraude online' },
      { name: 'ANPC - Protectia Consumatorilor', number: '0219551', note: 'Magazine false, produse contrafacute' },
    ]
  },
  {
    category: '🏦 Banci (Blocare card urgenta)',
    items: [
      { name: 'BCR', number: '0800801227', note: 'Gratuit, 24/7' },
      { name: 'BRD', number: '0800802024', note: 'Gratuit, 24/7' },
      { name: 'ING', number: '0800800888', note: 'Gratuit, 24/7' },
      { name: 'Raiffeisen', number: '0800810025', note: 'Gratuit, 24/7' },
      { name: 'Banca Transilvania', number: '0800080000', note: 'Gratuit, 24/7' },
    ]
  },
  {
    category: '👶 Copii & Familie',
    items: [
      { name: 'Abuz asupra copilului', number: '119', note: 'Gratuit, 24/7' },
      { name: 'Telefonul Copilului', number: '116111', note: 'Gratuit, NON-STOP, confidential' },
      { name: 'Violenta domestica', number: '0800500333', note: 'Gratuit, 24/7' },
      { name: 'Persoane disparute', number: '116000', note: 'Gratuit' },
    ]
  },
  {
    category: '🧠 Sanatate mintala',
    items: [
      { name: 'Prevenire suicid', number: '0800801200', note: 'Gratuit, NON-STOP, anonim' },
    ]
  },
]

export default function EmergencyButton() {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)

  return (
    <>
      {!hidden && (
        <div className="sos-btn" style={{ position: 'fixed', top: 24, right: 24, zIndex: 98, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <button onClick={() => setHidden(true)} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: 'rgba(255,255,255,0.6)', width: 20, height: 20, borderRadius: '50%', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'manipulation' }}>X</button>
          <button onClick={() => { console.log('SOS clicked'); alert('SOS clicked'); setOpen(true) }} style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', color: 'white', border: 'none', borderRadius: 50, width: 64, height: 64, fontSize: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(220,38,38,0.4)', touchAction: 'manipulation' }} title="Numere de urgenta">🆘</button>
        </div>
      )}

      {open && (
        <div onClick={() => setOpen(false)} className="debug-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(255,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#ffffff', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 520, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 12px 40px rgba(15,23,42,0.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h2 style={{ color: '#1e293b', fontSize: 20, fontWeight: 800, margin: 0 }}>🆘 Numere de urgenta</h2>
              <button onClick={() => setOpen(false)} style={{ background: 'rgba(30,41,59,0.08)', border: 'none', color: '#1e293b', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>X</button>
            </div>
            <p style={{ color: 'rgba(30,41,59,0.6)', fontSize: 12, marginBottom: 20 }}>Apasa pe orice numar pentru a apela direct din telefon</p>
            {numbers.map((cat, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(30,41,59,0.55)', marginBottom: 8, letterSpacing: 1 }}>{cat.category}</p>
                {cat.items.map((item, j) => (
                  <a key={j} href={'tel:' + item.number} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.04)', border: '1px solid rgba(30,41,59,0.1)', borderRadius: 10, padding: '10px 14px', marginBottom: 6, textDecoration: 'none' }}>
                    <div>
                      <span style={{ color: 'rgba(30,41,59,0.9)', fontSize: 13, display: 'block' }}>{item.name}</span>
                      <span style={{ color: 'rgba(30,41,59,0.55)', fontSize: 11 }}>{item.note}</span>
                    </div>
                    <span style={{ color: '#ef4444', fontWeight: 800, fontSize: 14, fontFamily: 'monospace', marginLeft: 8 }}>📞 {item.number}</span>
                  </a>
                ))}
              </div>
            ))}
            <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: '10px 14px', marginTop: 8 }}>
              <p style={{ color: 'rgba(30,41,59,0.7)', fontSize: 12, margin: 0, textAlign: 'center' }}>In caz de pericol iminent, suna <strong style={{ color: '#ef4444' }}>112</strong> imediat</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(220,38,38,0.7); } 70% { box-shadow: 0 0 0 12px rgba(220,38,38,0); } 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); } }
        @media (max-width: 768px) {
          .sos-btn { top: calc(68px + env(safe-area-inset-top, 0px)) !important; right: 12px !important; }
        }
      `}</style>
    </>
  )
}
