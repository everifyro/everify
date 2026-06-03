'use client'
import { useState, useEffect, useRef } from 'react'

type Message = { role: 'user' | 'vera'; text: string }

function VeraAvatar({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hair base behind face */}
      <ellipse cx="30" cy="21" rx="18" ry="17" fill="#1c1040" />

      {/* Face */}
      <circle cx="30" cy="28" r="16" fill="#FDDBB4" />

      {/* Hair top — short, dark */}
      <path
        d="M12 25 Q12 5 30 5 Q48 5 48 25 Q45 15 30 15 Q15 15 12 25Z"
        fill="#1c1040"
      />

      {/* Hair side tufts */}
      <path d="M12 24 Q11 32 13 40 L12 24Z" fill="#1c1040" />
      <path d="M48 24 Q49 32 47 40 L48 24Z" fill="#1c1040" />

      {/* Left lens — big round glasses */}
      <circle
        cx="22"
        cy="28"
        r="7.5"
        fill="rgba(200,214,255,0.18)"
        stroke="#6366f1"
        strokeWidth="1.8"
      />
      {/* Right lens */}
      <circle
        cx="38"
        cy="28"
        r="7.5"
        fill="rgba(200,214,255,0.18)"
        stroke="#6366f1"
        strokeWidth="1.8"
      />
      {/* Bridge (gap between lenses: left edge 22+7.5=29.5, right edge 38-7.5=30.5) */}
      <line
        x1="29.5"
        y1="28"
        x2="30.5"
        y2="28"
        stroke="#6366f1"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Temples */}
      <line x1="14.5" y1="27" x2="12" y2="25.5" stroke="#6366f1" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="45.5" y1="27" x2="48" y2="25.5" stroke="#6366f1" strokeWidth="1.4" strokeLinecap="round" />

      {/* Eyes */}
      <circle cx="22" cy="28" r="3" fill="#1e293b" />
      <circle cx="23.2" cy="26.9" r="0.95" fill="white" />
      <circle cx="38" cy="28" r="3" fill="#1e293b" />
      <circle cx="39.2" cy="26.9" r="0.95" fill="white" />

      {/* Nose */}
      <path d="M28.5 33 Q30 35 31.5 33" stroke="#c09070" strokeWidth="1.2" strokeLinecap="round" />

      {/* Smile */}
      <path d="M24.5 37.5 Q30 42 35.5 37.5" stroke="#c09070" strokeWidth="1.5" strokeLinecap="round" />

      {/* Jacket / body */}
      <path d="M4 60 L7 46 Q17 41 30 43 Q43 41 53 46 L56 60Z" fill="#3730a3" />

      {/* Collar / lapels */}
      <path d="M30 43 L22.5 57 L30 61 L37.5 57Z" fill="#6366f1" />

      {/* eV badge on jacket */}
      <rect x="14" y="49" width="10" height="6" rx="1.5" fill="#0ea5e9" />
      <text x="19" y="53.8" textAnchor="middle" fill="white" fontSize="3.5" fontWeight="bold">eV</text>
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
