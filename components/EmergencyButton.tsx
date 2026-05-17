'use client'
import { useState } from 'react'

const numbers = [
  { category: '🚨 Urgențe generale', items: [
    { name: 'Urgențe (Poliție, Ambulanță, Pompieri)', number: '112' },
    { name: 'Poliție', number: '113' },
  ]},
  { category: '👶 Copii & Familie', items: [
    { name: 'Telefonul Copilului', number: '116111' },
    { name: 'Violență domestică', number: '0800500333' },
    { name: 'Persoane dispărute', number: '116000' },
  ]},
  { category: '🧠 Sănătate mintală', items: [
    { name: 'Prevenire suicid', number: '0800801200' },
  ]},
  { category: '💻 Fraude & Scam-uri', items: [
    { name: 'DNSC — Securitate Cibernetică', number: '1911' },
    { name: 'ANPC — Protecția Consumatorilor', number: '0219551' },
    { name: 'Poliție — Fraudă online', number: '113' },
  ]},
  { category: '🏦 Bănci (blocare card urgență)', items: [
    { name: 'BCR', number: '0800801227' },
    { name: 'BRD', number: '0800802024' },
    { name: 'ING', number: '0800800888' },
    { name: 'Raiffeisen', number: '0800810025' },
    { name: 'Banca Transilvania', number: '0800080000' },
  ]},
]

export default function EmergencyButton() {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)

  return (
    <>
      {!hidden && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <button
            onClick={() => setHidden(true)}
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              width: 20, height: 20,
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            ✕
          </button>
          <button
            onClick={() => setOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #dc2626, #ef4444)',
              color: 'white',
              border: 'none',
              borderRadius: 50,
              width: 64,
              height: 64,
              fontSize: 28,
              cursor: 'pointer',
              boxShadow: '0 0 0 0 rgba(220,38,38,0.7)',
              animation: 'pulse-red 2s infinite',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Numere de urgență"
          >
            🆘
          </button>
        </div>
      )}

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, backdropFilter: 'blur(4px)'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0a1628',
              border: '1px solid rgba(220,38,38,0.3)',
              borderRadius: 20,
              padding: 28,
              width: '100%',
              maxWidth: 480,
              maxHeight: '85vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: 0 }}>
                🆘 Numere de urgență
              </h2>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 16 }}
              >
                ✕
              </button>
            </div>

            {numbers.map((cat, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: 1 }}>
                  {cat.category}
                </p>
                {cat.items.map((item, j) => (
                    <a
                    key={j}
                    href={`tel:${item.number}`}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10, padding: '12px 16px',
                      marginBottom: 8, textDecoration: 'none'
                    }}
                  >
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{item.name}</span>
                    <span style={{ color: '#ef4444', fontWeight: 800, fontSize: 16, fontFamily: 'monospace' }}>
                      📞 {item.number}
                    </span>
                  </a>
                ))}
              </div>
            ))}

            <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 16 }}>
              Apasă pe orice număr pentru a apela direct
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(220,38,38,0.7); }
          70% { box-shadow: 0 0 0 12px rgba(220,38,38,0); }
          100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); }
        }
      `}</style>
    </>
  )
}