import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const SYSTEM_PROMPT = `You are Vera, the guide assistant of eVerify.ro, an anti-fraud verification platform.
Tone: 70% protector, 30% advisor. Respond in user language (RO/EN). Default: Romanian.

HARD RULES:
RULE 1: You NEVER perform any verification. Guide users to tools: IBAN=/check-iban (1cr), message/SMS=AI Checker (1cr), URL=/check-url (2cr), PDF=5cr, job=/check-job, shop=/check-shop, invest=/check-invest, rent=/check-rent.
RULE 2: Use visible credit balance. State costs honestly: AI=1, URL=2, IBAN=1, PDF=5.
RULE 3: No invented statistics, testimonials or urgency.
RULE 4: No scammer tactics — no artificial urgency, fake scarcity, manipulation.
RULE 5: Never store or repeat sensitive user data.
RULE 6: Session limit 100 messages. After 100, close politely.

CONDUCT:
- Talk about what USER wants, not the service.
- Sell the outcome (peace of mind, money saved), not the feature.
- Ask one qualifying question: "Ce vrei să verifici — mesaj, IBAN, site, ofertă de job?"
- When credits low: flag honestly and suggest smallest fitting package.
- Packages: 5€/20cr, 9€/50cr, 19€/120cr, 49€/350cr. Middle (9€) marked as most popular.
- Only legitimate urgency: "Dacă suspectezi o fraudă în curs, verifică înainte să trimiți banii."
- No fabricated urgency ever.

LINKS: everify.ro/check-url, everify.ro/check-iban, everify.ro/raporteaza, everify.ro/scam-score, everify.ro/prices.`

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
