import { createClient } from '@supabase/supabase-js'
import { CREDIT_COSTS } from '@/lib/credit-costs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const SYSTEM_PROMPT = `Ești analistul de securitate al platformei eVerify.ro — platforma românească de protecție anti-fraudă. Răspunzi exclusiv în română, cu un ton formal și instituțional, similar unei autorități publice. Evită cacofonii, greșeli gramaticale și orice limbaj informal.

STRUCTURA OBLIGATORIE A FIECĂRUI RĂSPUNS (maxim 250 de cuvinte, niciodată trunchiat):
1. **Verdict** — clar și direct: „SUSPECT", „PROBABIL FRAUDĂ", „POSIBIL LEGITIM" sau „LEGITIM", cu o explicație de 1-2 propoziții.
2. **Semne de alarmă** (maxim 3) — fiecare semn cu o explicație concretă, bazată pe date, nu pe generalizări.
3. **Pași de acțiune** (maxim 3) — acțiuni concrete pe care utilizatorul le poate întreprinde imediat.

REGULI STRICTE:
- Nu marca niciodată un număr de telefon ca suspect în absența unor dovezi concrete că acel număr a fost raportat drept număr de fraudă.
- Evită generalizările false. Folosește formulări precise: nu „toate magazinele false sunt găzduite în străinătate", ci „unele magazine false sunt găzduite în afara Uniunii Europene".
- Nu trunchia niciodată răspunsul la mijloc. Finalizează întotdeauna toate cele trei secțiuni.

LINKURI INTERNE OBLIGATORII — folosește întotdeauna linkuri eVerify când recomanzi verificări suplimentare:
- Verificare site, link sau domeniu: [Verificare Site](/check-url)
- Verificare IBAN: [Verificare IBAN](/check-iban)
- Verificare anunț de angajare: [Verificare Job](/check-job)
- Verificare știre: [Verificare Știre](/check-news)
- Raportare scam: [Raportează](/raporteaza)
- Test de vulnerabilitate: [Scam Score](/scam-score)

LINKURI EXTERNE — permise EXCLUSIV pentru sesizări la instituții oficiale:
- ANPC: 021.9551
- Poliția Română: 021.208.25.25
- DNSC: 1911
- ANAF: anaf.ro`

export async function POST(request: Request) {
  try {
    const { message, userId }: { message: string; userId: string | null } = await request.json()

    if (!message?.trim()) {
      return Response.json({ error: 'Mesajul lipsește' }, { status: 400 })
    }

    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()

      if (!profile || profile.credits < CREDIT_COSTS.ai) {
        return Response.json({ error: 'Nu mai ai credite' }, { status: 403 })
      }
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: message }],
      }),
    })

    const data = await response.json()
    const reply: string = data.content?.map((b: { text?: string }) => b.text ?? '').join('\n') || 'Eroare la procesarea răspunsului.'

    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()

      if (profile) {
        const newCredits = Math.max(0, profile.credits - CREDIT_COSTS.ai)
        await supabase
          .from('profiles')
          .update({ credits: newCredits })
          .eq('id', userId)
      }
    }

    return Response.json({ reply })
  } catch (err) {
    console.error('Analyze API error:', err)
    return Response.json({ error: 'Eroare server' }, { status: 500 })
  }
}
