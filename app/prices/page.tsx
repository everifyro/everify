'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Prices() {
  const [userId, setUserId] = useState<string|null>(null)
  const [userEmail, setUserEmail] = useState<string|null>(null)
  const [loadingPlan, setLoadingPlan] = useState<string|null>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id)
        setUserEmail(session.user.email ?? null)
      }
    })
  }, [])

  const plans = [
    {
      name: 'Starter',
      price: '5€',
      credits: 20,
      perVerification: '0.25€',
      color: '#0ea5e9',
      features: ['Verdict AI instant', 'Suport prin email']
    },
    {
      name: 'Basic',
      price: '9€',
      credits: 50,
      perVerification: '0.18€',
      color: '#6366f1',
      popular: true,
      features: ['Verdict AI instant', 'Suport prin email', 'Istoric verificări']
    },
    {
      name: 'Pro',
      price: '19€',
      credits: 120,
      perVerification: '0.16€',
      color: '#8b5cf6',
      features: ['Verdict AI instant', 'Suport prin email', 'Istoric verificări', 'Export PDF']
    },
    {
      name: 'Expert',
      price: '49€',
      credits: 350,
      perVerification: '0.14€',
      color: '#f59e0b',
      features: ['Verdict AI instant', 'Suport prin email', 'Istoric verificări', 'Export PDF', 'Suport WhatsApp\nL-V 9:00-18:00']
    }
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'sans-serif', padding: '60px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 12 }}>
            Alege planul <span style={{ color: '#0ea5e9' }}>potrivit</span>
          </h1>
          <p style={{ color: 'rgba(30,41,59,0.65)', fontSize: 16 }}>
            Protejează-te de SCAM-uri online! Fără abonament lunar, plătești doar ce folosești.
          </p>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 36 }}>
          {[
            '🔒 256-bit SSL Encrypted',
            '✅ GDPR Compliant',
            '🛡️ Powered by Google Safe Browsing',
            '🌐 Verificare Interpol/Europol URLhaus',
            '💳 Plăți securizate prin Stripe',
          ].map((b, i) => (
            <span key={i} style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: '#1e293b' }}>{b}</span>
          ))}
          <span style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: '#1e293b', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span><span style={{ color: '#0ea5e9' }}>e</span>Verify</span>
            <span style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: 'white', borderRadius: 4, padding: '1px 5px', fontSize: 9, fontWeight: 800 }}>AI</span>
          </span>
          {[
            '🇷🇴 Made in Romania',
            '🚫 Nu vindem date personale',
            '🌍 Date stocate în UE',
            '💯 200+ de tipuri diferite de fraude documentate',
            '⚡ Verdict în sub 5 secunde',
            '🏆 Cea mai completă bază de date anti-scam din România',
          ].map((b, i) => (
            <span key={i} style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: '#1e293b' }}>{b}</span>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 60 }}>
          {plans.map((plan) => (
            <div key={plan.name} style={{
              background: plan.popular ? `rgba(99,102,241,0.1)` : '#ffffff',
              border: `1px solid ${plan.popular ? plan.color : 'rgba(30,41,59,0.1)'}`,
              borderRadius: 16,
              padding: 28,
              position: 'relative',
              boxShadow: '0 4px 24px rgba(15,23,42,0.06)'
            }}>
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
                  color: 'white', fontSize: 11, fontWeight: 700,
                  padding: '4px 14px', borderRadius: 20
                }}>
                  CEL MAI POPULAR
                </div>
              )}

              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: plan.color }}>{plan.name}</h3>
              <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }}>{plan.price}</div>
              <div style={{ fontSize: 12, color: 'rgba(30,41,59,0.6)', marginBottom: 16 }}>{plan.perVerification}/credit</div>

              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: plan.color }}>{plan.credits} credite</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ fontSize: 14, color: 'rgba(30,41,59,0.75)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: plan.color }}>✓</span>
                    <span style={{ whiteSpace: 'pre-line' }}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={async () => {
                  if (!userId) { router.push('/login'); return }
                  setLoadingPlan(plan.name)
                  const res = await fetch('/api/stripe/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ plan: plan.name.toLowerCase(), userId, userEmail })
                  })
                  const data = await res.json()
                  if (data.url) window.location.href = data.url
                  setLoadingPlan(null)
                }}
                className={plan.popular ? 'btn-pulse' : ''}
                style={{
                  width: '100%', padding: '11px', borderRadius: 10, border: 'none',
                  background: `linear-gradient(135deg, ${plan.color}, #6366f1)`,
                  color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center'
                }}
              >
                {loadingPlan === plan.name ? 'Se încarcă...' : <>{userId ? 'Cumpără acum' : 'Înregistrează-te'} <span style={{ fontSize: '1.4em', lineHeight: 1 }}>❯</span></>}
              </button>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', padding: '36px 20px', background: 'rgba(14,165,233,0.04)', border: '1px solid rgba(14,165,233,0.12)', borderRadius: 16, marginBottom: 60 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>🏢 Pentru companii</h3>
          <p style={{ color: 'rgba(30,41,59,0.65)', fontSize: 14, maxWidth: 560, margin: '0 auto 16px' }}>
            Integrează eVerify în compania ta. Punem la dispoziție un sistem online dedicat, configurat pentru nevoile și dimensiunea echipei tale.
          </p>
          <a href="/contact" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: 'white', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Contactează-ne <span style={{ fontSize: '1.4em', lineHeight: 1 }}>❯</span>
          </a>
        </div>

        <div style={{ padding: '40px 20px', background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 16 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>Întrebări frecvente</h3>
          <p style={{ color: 'rgba(30,41,59,0.65)', fontSize: 14, maxWidth: 600, margin: '0 auto 12px' }}>
            <strong style={{ color: '#1e293b' }}>Creditele expiră?</strong> Nu, creditele nu expiră. Le folosești când ai nevoie.
          </p>
          <p style={{ color: 'rgba(30,41,59,0.65)', fontSize: 14, maxWidth: 600, margin: '0 auto 12px' }}>
            <strong style={{ color: '#1e293b' }}>Pot cumpăra mai multe pachete?</strong> Da, creditele se adună în contul tău.
          </p>
          <p style={{ color: 'rgba(30,41,59,0.65)', fontSize: 14, maxWidth: 600, margin: '0 auto 12px' }}>
            <strong style={{ color: '#1e293b' }}>Pot cumpăra pe factură fiscală?</strong> Da, contactează-ne la contact@everify.ro.
          </p>
          <p style={{ color: 'rgba(30,41,59,0.65)', fontSize: 14, maxWidth: 600, margin: '0 auto' }}>
            <strong style={{ color: '#1e293b' }}>Există rambursare?</strong> Da, în 30 de zile dacă nu ești mulțumit.
          </p>
        </div>

      </div>
    </div>
  )
}