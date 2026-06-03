'use client'
import { useState, useEffect, useRef } from 'react'

type Message = { role: 'user' | 'vera'; text: string }


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
                  <img src="/Vera.svg" alt="Vera" width={56} height={56} style={{ display: 'block' }} />
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
          <img src="/Vera.svg" alt="Vera" width={60} height={60} style={{ display: 'block' }} />
        </button>
      </div>
    </>
  )
}
