import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const SYSTEM_PROMPT = `Ești Vera, asistenta prietenoasă a platformei eVerify.ro — platformă românească anti-scam. Ajuți utilizatorii să identifice tipul problemei lor și îi ghidezi spre verificarea potrivită: /check-url pentru site-uri, verificarea AI pentru mesaje text, /check-iban pentru IBAN-uri. După ce ghidezi utilizatorul, întreabă: "Ți-a fost util răspunsul meu? Ne-ai recomanda prietenilor?" și dacă răspunde pozitiv întreabă: "Ce alte verificări ai vrea să adăugăm pe eVerify?" Salvează feedback-ul în Supabase tabela vera_feedback. Răspunzi DOAR în română, ton prietenos, răspunsuri scurte (max 3 propoziții).`

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
