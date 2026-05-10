import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function POST(request) {
  try {
    const { message, userId } = await request.json()
    if (!message) {
      return Response.json({ error: 'Mesajul lipseste' }, { status: 400 })
    }
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()
      if (profile && profile.credits <= 0) {
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
        max_tokens: 1000,
        system: 'Esti un expert in securitate cibernetica pentru utilizatori din Romania. Analizezi mesaje si spui daca e scam. Raspunde in romana cu: VERDICT, EXPLICATIE, CE SA FACI, RAPORTEAZA.',
        messages: [{ role: 'user', content: message }]
      })
    })
    const data = await response.json()
    console.log('Anthropic response:', JSON.stringify(data))
    const reply = data.content?.map(b => b.text || '').join('\n') || 'Eroare.'
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()
      await supabase
        .from('profiles')
        .update({ credits: (profile?.credits || 1) - 1 })
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