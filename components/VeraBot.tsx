'use client'
import { useState, useEffect, useRef } from 'react'

type Message = { role: 'user' | 'vera'; text: string }

const MAX_USER_MESSAGES = 10
const CLOSING_MESSAGE =
  'Am ajuns la limita conversației noastre 😊 Sper că te-am putut ajuta! Poți verifica orice conținut suspect direct pe eVerify.ro. Pentru alte întrebări: Contact.'

const BASE_URL = 'https://everify.ro'

const PAGE_BUTTONS: { pattern: RegExp; label: string; href: string }[] = [
  { pattern: /\bhomepage\b|\beVerify\.ro\b/i, label: 'Verificare AI', href: `${BASE_URL}/check-ai` },
  { pattern: /check-url/i, label: 'Verifică link', href: `${BASE_URL}/check-url` },
  { pattern: /check-iban/i, label: 'Verifică IBAN', href: `${BASE_URL}/check-iban` },
  { pattern: /raporteaz/i, label: 'Raportează scam', href: `${BASE_URL}/raporteaza` },
  { pattern: /scam.?score/i, label: '🧪 Scam Score →', href: `${BASE_URL}/scam-score` },
  { pattern: /\bContact\b/, label: 'Contact', href: `${BASE_URL}/contact` },
]

function renderMarkdownLinks(text: string) {
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

function extractButtons(text: string): { label: string; href: string }[] {
  const seen = new Set<string>()
  return PAGE_BUTTONS.filter(({ pattern, href }) => {
    if (!pattern.test(text) || seen.has(href)) return false
    seen.add(href)
    return true
  }).map(({ label, href }) => ({ label, href }))
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
    const tVisible = setTimeout(() => setVisible(true), 3000)
    const tAuto = setTimeout(() => {
      if (!sessionStorage.getItem('vera_auto_opened')) {
        sessionStorage.setItem('vera_auto_opened', 'true')
        setOpen(true)
      }
    }, 5000)
    return () => { clearTimeout(tVisible); clearTimeout(tAuto) }
  }, [])

  useEffect(() => {
    if (open && messages.length === 0) {
      const isEn = typeof navigator !== 'undefined' && navigator.language.startsWith('en')
      const greeting = isEn
        ? "👋 Hi! I'm Vera, the eVerify.ro assistant. I help you stay safe from scams — suspicious messages, SMS, IBANs, fake websites or job offers. What can I help you check today?"
        : "👋 Salut! Sunt Vera, asistenta eVerify.ro. Te ajut să te protejezi de înșelătorii — mesaje suspecte, SMS-uri, IBAN-uri, site-uri sau oferte de job false. Cu ce te pot ajuta azi?"
      setMessages([{ role: 'vera', text: greeting }])
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const userMsgCount = messages.filter(m => m.role === 'user').length
  const atLimit = userMsgCount >= MAX_USER_MESSAGES

  const send = async () => {
    if (!input.trim() || loading || atLimit) return
    const text = input.trim()
    setInput('')
    const updated: Message[] = [...messages, { role: 'user', text }]
    setMessages(updated)
    setLoading(true)

    const isLastMessage = userMsgCount + 1 >= MAX_USER_MESSAGES

    if (isLastMessage) {
      await new Promise(r => setTimeout(r, 700))
      setMessages(p => [...p, { role: 'vera', text: CLOSING_MESSAGE }])
      setLoading(false)
      return
    }

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
        .vera-page-btn {
          display: inline-block;
          margin: 4px 4px 0 0;
          padding: 5px 11px;
          border-radius: 20px;
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          color: white;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .vera-page-btn:hover { opacity: 0.85; }
        @media (max-width: 480px) {
          .vera-wrapper { right: 16px !important; max-width: calc(100vw - 32px) !important; }
          .vera-panel { width: calc(100vw - 32px) !important; max-width: calc(100vw - 32px) !important; }
        }
      `}</style>

      <div className="vera-wrapper" style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12
      }}>
        {open && (
          <div className="vera-panel" style={{
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
              {messages.map((m, i) => {
                const buttons = m.role === 'vera' ? extractButtons(m.text) : []
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '83%' }}>
                      <div style={{
                        padding: '9px 13px',
                        borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                        background: m.role === 'user'
                          ? 'linear-gradient(135deg, #0ea5e9, #6366f1)'
                          : '#f1f5f9',
                        color: m.role === 'user' ? 'white' : '#1e293b',
                        fontSize: 13.5, lineHeight: 1.6,
                        whiteSpace: 'pre-wrap'
                      }}>
                        {m.role === 'vera' ? renderMarkdownLinks(m.text) : m.text}
                      </div>
                      {buttons.length > 0 && (
                        <div style={{ marginTop: 6 }}>
                          {buttons.map(btn => (
                            <a key={btn.href} href={btn.href} className="vera-page-btn">
                              {btn.label} →
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
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
                placeholder={atLimit ? 'Conversație încheiată' : 'Scrie un mesaj...'}
                disabled={atLimit}
                style={{
                  flex: 1, background: atLimit ? '#f1f5f9' : '#f8fafc',
                  border: '1.5px solid rgba(99,102,241,0.22)', borderRadius: 10,
                  padding: '9px 12px', fontSize: 13, color: atLimit ? '#94a3b8' : '#1e293b', outline: 'none',
                  fontFamily: 'inherit',
                  cursor: atLimit ? 'not-allowed' : 'text'
                }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading || atLimit}
                style={{
                  background: input.trim() && !loading && !atLimit
                    ? 'linear-gradient(135deg, #0ea5e9, #6366f1)'
                    : 'rgba(30,41,59,0.1)',
                  border: 'none', color: 'white',
                  width: 38, height: 38, borderRadius: 10,
                  cursor: input.trim() && !loading && !atLimit ? 'pointer' : 'default',
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
