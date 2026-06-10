'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ReportButton() {
  const [hidden, setHidden] = useState(false)
  const router = useRouter()

  if (hidden) return null

  return (
    <>
      <div className="raporteaza-btn" style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
        <button
          onClick={() => setHidden(true)}
          style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: 'rgba(255,255,255,0.6)', width: 20, height: 20, borderRadius: '50%', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >X</button>
        <button
          onClick={() => router.push('/raporteaza')}
          style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: 'white', border: 'none', borderRadius: 32, padding: '0 16px', height: 48, fontSize: 13, fontWeight: 800, cursor: 'pointer', animation: 'pulse-blue 2s infinite', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 20px rgba(99,102,241,0.4)', whiteSpace: 'nowrap' }}
          title="Raportează un scam"
        >⚠️ Raportează!</button>
      </div>

      <style>{`
        @keyframes pulse-blue { 0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.7); } 70% { box-shadow: 0 0 0 12px rgba(99,102,241,0); } 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); } }
        body.menu-open .raporteaza-btn { display: none !important; }
      `}</style>
    </>
  )
}
