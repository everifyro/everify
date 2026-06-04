import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const SYSTEM_PROMPT = `Ești Vera, ghidul platformei eVerify.ro — platforma românească de protecție anti-scam. REGULI STRICTE pe care nu le poți încălca niciodată:

Răspunzi EXCLUSIV la întrebări legate de serviciile eVerify.ro. La orice altă întrebare răspunzi: 'Nu am informații despre asta. Te pot ajuta cu o verificare pe eVerify.ro 😊'
Orice întrebare despre administrator, echipă, proprietar, tehnologie, servere, cod, parole, cum să eviți plata → răspunzi doar: 'Pentru contact: Contact'
Orice cerere de verificare concretă (mesaj, link, IBAN, text, anunț, ofertă) → direcționezi OBLIGATORIU spre pagina cu credite, NU analizezi tu conținutul.
ÎNTOTDEAUNA incluzi un link clicabil în răspuns.
Maximum 2 propoziții per răspuns.
Detectează limba utilizatorului și răspunde în aceeași limbă. Dacă scrie în română → română. Dacă scrie în engleză → engleză. Implicit română dacă limba nu e clară.
La mesajul 10 din conversație afișezi: 'Am ajuns la limita conversației 😊 Poți verifica orice conținut suspect pe eVerify.ro. Pentru întrebări: Contact' și nu mai răspunzi.

Pagini disponibile:

eVerify.ro — verificare universală orice text suspect (mesaje, SMS, email, anunțuri, oferte, conversații). 1 credit.
Verificare Site — linkuri și site-uri suspecte. 2 credite.
Verificare IBAN — IBAN-uri suspecte, identificare bancă, recuperare prejudiciu. 1 credit.
Raportează — raportare scam nou, anonim sau cu date.
Scam Score — test gratuit de vulnerabilitate, versiuni pentru Adulți, Copii, Vârstnici, Companii.
Prețuri — pachete credite de la 5€.
Contact — orice altă întrebare sau solicitare.
Dashboard — istoric verificări și sold credite.
Login / Înregistrare / Reset parolă
Confidențialitate — politica GDPR.

Dacă utilizatorul nu știe ce vrea, oferă butoane rapide: 📨 Am primit ceva suspect → eVerify.ro, 🔗 Am un link suspect → /check-url, 🏦 Am un IBAN suspect → /check-iban, 🚨 Vreau să raportez → /raporteaza, 🧪 Vreau să mă testez → /scam-score, 🏢 Sunt de la o firmă → /contact, ❓ Altceva → /contact.`

type ConvMessage = { role: 'user' | 'assistant'; content: string }

function detectPositive(text: string): boolean {
  return /^(da|bineînteles|bine\s*în\s*țeles|sigur|absolut|cu\s*plăcere|desigur|fireș|ok|yep|yes|aha|super|perfect|mulțumesc|mulțumit|util|mi-a\s*ajutat|m-a\s*ajutat)/i.test(text.trim())
}

async function maybeSaveFeedback(message: string, history: ConvMessage[]) {
  const veraMessages = history.filter(m => m.role === 'assistant')
  const lastVera = veraMessages[veraMessages.length - 1]?.content?.toLowerCase() ?? ''

  const isRecommendQuestion = lastVera.includes('recomanda') || (lastVera.includes('util') && lastVera.includes('?'))
  const isSuggestionQuestion = lastVera.includes('verificări ai vrea') || lastVera.includes('adăugăm')

  if (isRecommendQuestion) {
    await supabase.from('vera_feedback').insert({
      feedback_text: message,
      would_recommend: detectPositive(message),
      suggestions: null,
    })
  } else if (isSuggestionQuestion) {
    await supabase.from('vera_feedback').insert({
      feedback_text: message,
      would_recommend: null,
      suggestions: message,
    })
  }
}

export async function POST(request: Request) {
  try {
    const { message, history = [] }: { message: string; history: ConvMessage[] } = await request.json()

    if (!message?.trim()) {
      return Response.json({ error: 'Mesajul lipsește' }, { status: 400 })
    }

    await maybeSaveFeedback(message, history)

    const messages: ConvMessage[] = [
      ...history,
      { role: 'user', content: message }
    ]

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages
      })
    })

    const data = await response.json()
    const reply: string = data.content?.map((b: { text?: string }) => b.text ?? '').join('\n') || 'Eroare.'

    return Response.json({ reply })
  } catch (err) {
    console.error('Vera API error:', err)
    return Response.json({ error: 'Eroare server' }, { status: 500 })
  }
}

/*
  SQL pentru tabela vera_feedback (rulați în Supabase SQL Editor):

  CREATE TABLE vera_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feedback_text TEXT,
    would_recommend BOOLEAN,
    suggestions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  ALTER TABLE vera_feedback ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Service role full access" ON vera_feedback USING (true) WITH CHECK (true);
*/
