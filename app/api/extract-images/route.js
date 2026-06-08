const PROMPT = `Ești un OCR specializat. Extrage tot textul relevant din imaginile primite: text anunț, email, IBAN, link-uri/URL-uri, CUI/cod fiscal, conversații.

Returnează EXCLUSIV un JSON valid cu aceste chei (null dacă nu găsești):
{
  "text": "tot textul principal extras, concatenat",
  "email": "adresa de email găsită sau null",
  "iban": "IBAN-ul găsit (cu sau fără spații) sau null",
  "link": "URL-ul sau link-ul găsit sau null",
  "cui": "CUI-ul sau codul fiscal găsit sau null",
  "conversatie": "textul conversației dacă imaginea e un screenshot de chat sau null"
}

Reguli:
- Răspunde DOAR cu JSON, fără text adițional, fără markdown.
- Dacă nu găsești nimic relevant, returnează text gol și restul null.
- Extrage primul email, IBAN, link și CUI găsite.`

function parseBase64Image(dataUrl) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/)
  if (!match) return null
  return { media_type: match[1], data: match[2] }
}

export async function POST(req) {
  try {
    const { images, context } = await req.json()

    if (!images || !Array.isArray(images) || images.length === 0) {
      return Response.json({ error: 'Nicio imagine primită.' }, { status: 400 })
    }
    if (images.length > 4) {
      return Response.json({ error: 'Maxim 4 imagini.' }, { status: 400 })
    }

    const content = []

    for (const img of images) {
      const parsed = parseBase64Image(img)
      if (!parsed) continue
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: parsed.media_type, data: parsed.data },
      })
    }

    if (content.length === 0) {
      return Response.json({ error: 'Format imagine invalid.' }, { status: 400 })
    }

    content.push({ type: 'text', text: PROMPT })

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic error:', err)
      return Response.json({ error: 'Eroare la procesarea imaginilor.' }, { status: 500 })
    }

    const anthropicData = await response.json()
    const raw = anthropicData.content?.[0]?.text || ''

    let parsed
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw)
    } catch {
      parsed = { text: raw, email: null, iban: null, link: null, cui: null, conversatie: null }
    }

    return Response.json({
      text: parsed.text || '',
      email: parsed.email || null,
      iban: parsed.iban || null,
      link: parsed.link || null,
      cui: parsed.cui || null,
      conversatie: parsed.conversatie || null,
    })
  } catch (err) {
    console.error('extract-images error:', err)
    return Response.json({ error: 'Eroare internă.' }, { status: 500 })
  }
}
