import { createClient } from '@supabase/supabase-js'
import { CREDIT_COSTS } from '@/lib/credit-costs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const SYSTEM_PROMPT = `Ești analistul platformei eVerify.ro — platformă românească de protecție anti-fraudă. Analizezi mesaje, site-uri, oferte și situații suspecte și oferi un verdict clar utilizatorului.

REGULA 1 — ABSOLUTĂ: Nu incluzi niciodată linkuri sau referințe către site-uri externe cu excepția: (A) Paginilor eVerify.ro și (B) Autorităților publice oficiale: anpc.ro, politiaromana.ro, dnsc.ro, anaf.ro, onrc.ro, bnr.ro, asf.ro. INTERZIS explicit: openapi.ro, rotld.ro, whois.ro, trustpilot.com, google.com și orice alt site neoficial.

REGULA 2 — LINKURI INTERNE: Ori de câte ori recomanzi o verificare, folosești EXCLUSIV linkurile eVerify.ro: verificare site/domeniu/link → [Verificare Site](https://everify.ro/check-url), verificare IBAN → [Verificare IBAN](https://everify.ro/check-iban), raportare scam → [Raportează](https://everify.ro/raporteaza), test vulnerabilitate → [Scam Score](https://everify.ro/scam-score). Folosești ÎNTOTDEAUNA everify.ro, niciodată everify-phi.vercel.app.

REGULA 3 — FORMAT: Răspunsurile sunt text curgător, fără headere markdown, fără linii de separare. Maximum 200 de cuvinte. Niciodată trunchiat.

REGULA 4 — TON: Formal și instituțional, ca o autoritate publică română. Fără cacofonii, fără greșeli gramaticale.

REGULA 5 — STRUCTURĂ: (1) Verdict clar: FRAUDĂ CONFIRMATĂ / RISC RIDICAT / RISC MODERAT / PROBABIL SIGUR. (2) Maxim 3 semne de alarmă cu explicații concrete. (3) Maxim 3 pași de acțiune cu linkuri interne eVerify. (4) Instituții oficiale pentru plângeri: ANPC 021.9551, Poliția 021.208.25.25, DNSC 1911.

REGULA 6 — PRECIZIE: Nu marca telefoane ca suspecte fără dovezi. Nu generaliza fals.

BAZA DE DATE: Ai acces la peste 210 tipuri de scam-uri documentate pentru România. Identifică tipul exact.

NUMERE URGENȚĂ: 112, 1911 DNSC, 021.9551 ANPC, 021.208.25.25 Poliție.`

function looksLikeUrl(text) {
  const t = text.trim()
  if (/^https?:\/\//i.test(t)) return true
  return !/\s/.test(t) && /^[a-zA-Z0-9][a-zA-Z0-9\-\.]*\.[a-zA-Z]{2,}(\/\S*)?$/.test(t)
}

export async function POST(request) {
  try {
    const { message, userId } = await request.json()
    if (!message) {
      return Response.json({ error: 'Mesajul lipseste' }, { status: 400 })
    }

    if (looksLikeUrl(message)) {
      return Response.json({
        reply: 'Acesta pare a fi un link sau site web. Pentru verificarea unui site, folosește pagina dedicată: [Verificare Site](https://everify.ro/check-url). AI Checker-ul este pentru mesaje text, SMS-uri sau emailuri suspecte.'
      })
    }

    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()
      if (profile && profile.credits < CREDIT_COSTS.ai) {
        return Response.json({ error: 'Nu mai ai credite' }, { status: 403 })
      }
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: message }]
      })
    })
    const data = await response.json()

    if (!data.content || data.content.length === 0) {
      return Response.json({ reply: 'Eroare la procesarea cererii. Încearcă din nou.' })
    }

    const reply = data.content.map(b => b.text || '').join('\n')

    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()
      await supabase
        .from('profiles')
        .update({ credits: Math.max(0, (profile?.credits ?? 0) - CREDIT_COSTS.ai) })
        .eq('id', userId)
      await supabase
        .from('analyses')
        .insert({ user_id: userId, question: message, answer: reply })
    }
    return Response.json({ reply })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Eroare server' }, { status: 500 })
  }
}
