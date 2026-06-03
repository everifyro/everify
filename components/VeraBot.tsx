'use client'
import { useState, useEffect, useRef } from 'react'

type Message = { role: 'user' | 'vera'; text: string }

function VeraAvatar({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {/* ── Jacket & collar ── */}
      <path d="M5 60 L8 44 Q18 39 30 41 Q42 39 52 44 L55 60Z" fill="#3730a3"/>
      <path d="M30 41 L23 57 L30 61 L37 57Z" fill="#4f46e5"/>

      {/* ── Neck ── */}
      <rect x="26.5" y="38" width="7" height="6" rx="0.5" fill="#F2BC90"/>

      {/* ── Hair silhouette (medium brown, "șaten") ── */}
      <ellipse cx="30" cy="18" rx="15" ry="16" fill="#7B5035"/>

      {/* ── Face ── warm, realistic skin */}
      <ellipse cx="30" cy="27" rx="13" ry="13" fill="#F2BC90"/>

      {/* ── Eyebrows — thin, slightly arched ── */}
      <path d="M21.5 18.5 Q24.5 17.3 27 18.5"
        stroke="#4A2A12" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M33 18.5 Q35.5 17.3 38.5 18.5"
        stroke="#4A2A12" strokeWidth="1.3" strokeLinecap="round"/>

      {/* ── Eye whites ── */}
      <ellipse cx="24.5" cy="23" rx="2.8" ry="2.1" fill="white"/>
      <ellipse cx="35.5" cy="23" rx="2.8" ry="2.1" fill="white"/>

      {/* ── Irises + pupils ── */}
      <circle cx="24.5" cy="23" r="1.45" fill="#3D2410"/>
      <circle cx="35.5" cy="23" r="1.45" fill="#3D2410"/>

      {/* ── Eye-light specular ── */}
      <circle cx="25.2" cy="22.3" r="0.55" fill="white"/>
      <circle cx="36.2" cy="22.3" r="0.55" fill="white"/>

      {/* ── Glasses: thin rectangular black frames ──
           Left frame:  x 20.5–29  y 20.5–26
           Right frame: x 31–39.5  y 20.5–26
           Eyes (cy=23) sit neatly centred inside each frame        */}
      <rect x="20.5" y="20.5" width="8.5" height="5.5" rx="0.7"
        stroke="#111827" strokeWidth="1.2" fill="none"/>
      <rect x="31"   y="20.5" width="8.5" height="5.5" rx="0.7"
        stroke="#111827" strokeWidth="1.2" fill="none"/>
      {/* Bridge (gap between frames: 29 → 31) */}
      <line x1="29" y1="23.3" x2="31" y2="23.3"
        stroke="#111827" strokeWidth="1.2" strokeLinecap="round"/>
      {/* Temples */}
      <line x1="20.5" y1="23" x2="16.5" y2="22"
        stroke="#111827" strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="39.5" y1="23" x2="43.5" y2="22"
        stroke="#111827" strokeWidth="1.1" strokeLinecap="round"/>

      {/* ── Nose — very subtle ── */}
      <path d="M29 28.5 Q30 30.5 31 28.5"
        stroke="#CE9471" strokeWidth="1" strokeLinecap="round"/>

      {/* ── Mouth — natural closed smile ── */}
      <path d="M25.5 33 Q30 36.5 34.5 33"
        stroke="#B97050" strokeWidth="1.4" strokeLinecap="round"/>

      {/* ── eV badge on jacket ── */}
      <rect x="13.5" y="48" width="9.5" height="5.5" rx="1.5" fill="#0ea5e9"/>
      <text x="18.3" y="52.8" textAnchor="middle" fill="white" fontSize="3.5" fontWeight="bold">eV</text>
    </svg>
  )
}

export default function VeraBot() {
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'vera',
        text: 'Bună! Sunt Vera, asistenta eVerify 👋 Cu ce te pot ajuta azi? Ai primit un mesaj suspect, un link, un IBAN sau altceva?'
      }])
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async () => {
    if (!input.trim() || loading) return
    const text = input.trim()
    setInput('')
    const updated: Message[] = [...messages, { role: 'user', text }]
    setMessages(updated)
    setLoading(true)
    try {
      const res = await fetch('/api/vera', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({
            role: m.role === 'vera' ? 'assistant' : 'user',
            content: m.text
          }))
        })
      })
      const data = await res.json()
      setMessages(p => [...p, { role: 'vera', text: data.reply || 'Scuze, a apărut o eroare.' }])
    } catch {
      setMessages(p => [...p, { role: 'vera', text: 'Eroare de conexiune. Încearcă din nou.' }])
    }
    setLoading(false)
  }

  if (!visible) return null

  return (
    <>
      <style>{`
        @keyframes veraBounceIn {
          0%   { opacity: 0; transform: scale(0.4) translateY(24px); }
          65%  { transform: scale(1.12) translateY(-5px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes veraSlideIn {
          from { opacity: 0; transform: translateY(18px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        .vera-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #6366f1;
          animation: vera-pulse 1.2s infinite ease-in-out;
        }
        .vera-dot:nth-child(2) { animation-delay: 0.2s; }
        .vera-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes vera-pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50%       { opacity: 1;   transform: scale(1.15); }
        }
      `}</style>

      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12
      }}>
        {open && (
          <div style={{
            width: 350,
            background: '#ffffff',
            borderRadius: 18,
            boxShadow: '0 20px 60px -12px rgba(15,23,42,0.32), 0 4px 16px rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.18)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'veraSlideIn 0.22s ease-out',
            maxHeight: 500
          }}>
            {/* Header */}
            <div style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 56, height: 56,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid rgba(255,255,255,0.45)',
                  flexShrink: 0,
                  background: 'rgba(255,255,255,0.1)'
                }}>
                  <VeraAvatar size={56} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>Vera</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                    Asistenta eVerify
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.18)', border: 'none', color: 'white',
                  width: 28, height: 28, borderRadius: '50%', cursor: 'pointer',
                  fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 600, lineHeight: 1, flexShrink: 0
                }}
                aria-label="Închide chat"
              >×</button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '14px 14px 8px',
              display: 'flex', flexDirection: 'column', gap: 9,
              minHeight: 0
            }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '83%',
                    padding: '9px 13px',
                    borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                    background: m.role === 'user'
                      ? 'linear-gradient(135deg, #0ea5e9, #6366f1)'
                      : '#f1f5f9',
                    color: m.role === 'user' ? 'white' : '#1e293b',
                    fontSize: 13.5, lineHeight: 1.6,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: 5, padding: '8px 12px', background: '#f1f5f9', borderRadius: '4px 16px 16px 16px', width: 'fit-content' }}>
                  <div className="vera-dot" />
                  <div className="vera-dot" />
                  <div className="vera-dot" />
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(30,41,59,0.07)', display: 'flex', gap: 8, flexShrink: 0 }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') send() }}
                placeholder="Scrie un mesaj..."
                style={{
                  flex: 1, background: '#f8fafc',
                  border: '1.5px solid rgba(99,102,241,0.22)', borderRadius: 10,
                  padding: '9px 12px', fontSize: 13, color: '#1e293b', outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                style={{
                  background: input.trim() && !loading
                    ? 'linear-gradient(135deg, #0ea5e9, #6366f1)'
                    : 'rgba(30,41,59,0.1)',
                  border: 'none', color: 'white',
                  width: 38, height: 38, borderRadius: 10,
                  cursor: input.trim() && !loading ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, flexShrink: 0, transition: 'background 0.2s'
                }}
                aria-label="Trimite"
              >❯</button>
            </div>
          </div>
        )}

        {/* Avatar trigger button */}
        <button
          onClick={() => setOpen(o => !o)}
          title="Vera — Asistenta eVerify"
          style={{
            width: 60, height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
            border: '3px solid white',
            boxShadow: '0 8px 28px rgba(99,102,241,0.45)',
            cursor: 'pointer',
            padding: 0,
            overflow: 'hidden',
            animation: 'veraBounceIn 0.45s ease-out',
          }}
        >
          <VeraAvatar size={60} />
        </button>
      </div>
    </>
  )
}
