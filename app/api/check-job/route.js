import { createClient } from '@supabase/supabase-js'
import { CREDIT_COSTS } from '@/lib/credit-costs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const MODULE_WEIGHTS = {
  frauda: 24,
  companie: 17,
  domeniu: 17,
  recruiter: 12,
  descriere: 12,
  date: 12,
  proces: 6,
}

function validateIBAN(iban) {
  const rearranged = iban.slice(4) + iban.slice(0, 4)
  const numeric = rearranged.split('').map(c => {
    const code = c.charCodeAt(0)
    return (code >= 65 && code <= 90) ? (code - 65 + 10).toString() : c
  }).join('')
  let remainder = 0
  for (const digit of numeric) {
    remainder = (remainder * 10 + parseInt(digit)) % 97
  }
  return remainder === 1
}

async function callAI(system, userMsg) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system,
      messages: [{ role: 'user', content: userMsg }]
    })
  })
  const data = await res.json()
  const text = data.content?.[0]?.text || '{}'
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return {}
  try { return JSON.parse(match[0]) } catch { return {} }
}

async function checkCompanie(company) {
  if (!company || !company.trim()) return { status: 'unverified', reason: 'CUI sau nume firmă lipsă — adăugați pentru verificare ONRC' }

  const clean = company.trim()
  const cuiMatch = clean.replace(/^RO\s*/i, '').match(/^\d{2,10}$/)

  if (cuiMatch) {
    const cui = parseInt(cuiMatch[0])
    try {
      const today = new Date().toISOString().split('T')[0]
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 6000)

      const res = await fetch('https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ cui, data: today }]),
        signal: ctrl.signal
      })
      clearTimeout(timer)

      if (res.ok) {
        const data = await res.json()
        const notFound = data.notFound?.some(nf => nf.cui === cui)

        if (notFound) {
          return {
            status: 'risky',
            score: 65,
            reasons: [`CUI ${cui} nu există în baza de date ANAF/ONRC — firma nu a putut fi verificată oficial`]
          }
        }

        const found = data.found?.[0]
        if (found) {
          const name = found.date_generale?.denumire || clean
          return { status: 'ok', score: 0, details: `${name} — verificată în ONRC/ANAF` }
        }
      }
    } catch {
      return { status: 'unverified', reason: 'API ANAF indisponibil temporar' }
    }
  }

  // Nume firmă fără CUI — verificare parțială
  return {
    status: 'ok',
    score: 10,
    reasons: ['Fără CUI — verificarea ONRC nu a putut fi efectuată. Adăugați CUI-ul pentru analiză completă.']
  }
}

async function checkDomeniu(link) {
  if (!link || !link.trim()) return { status: 'unverified', reason: 'date lipsă' }

  let url = link.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url

  let domain = ''
  try {
    domain = new URL(url).hostname
  } catch {
    return { status: 'risky', score: 50, reasons: ['Link-ul furnizat nu este valid'] }
  }

  const reasons = []
  let score = 0

  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 5000)
    const res = await fetch('https://urlhaus-api.abuse.ch/v1/url/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `url=${encodeURIComponent(url)}`,
      signal: ctrl.signal
    })
    clearTimeout(timer)
    const data = await res.json()
    if (data.query_status !== 'no_results') {
      score += 60
      reasons.push('Domeniu găsit în baza de date URLhaus — asociat cu malware sau phishing')
    }
  } catch {}

  if (/(\d{1,3}\.){3}\d{1,3}/.test(domain)) { score += 40; reasons.push('Adresă IP în loc de domeniu') }
  if (/\.(tk|ml|ga|cf|gq|xyz|top|click|link|online|site|buzz)$/i.test(domain)) { score += 25; reasons.push('Extensie de domeniu frecvent asociată cu fraude') }
  if (/-{2,}/.test(domain)) { score += 15; reasons.push('Multiple cratime în domeniu (pattern suspect)') }

  score = Math.min(score, 100)

  if (score > 0) return { status: 'risky', score, reasons }
  return { status: 'ok', score: 0, details: `${domain} — fără indicatori de risc` }
}

function checkRecruiter(email) {
  if (!email || !email.trim()) return { status: 'unverified', reason: 'date lipsă' }

  const clean = email.trim().toLowerCase()
  if (!clean.includes('@') || !clean.includes('.')) {
    return { status: 'risky', score: 50, reasons: ['Email invalid'] }
  }

  const domain = clean.split('@')[1]
  const freeProviders = ['gmail.com', 'yahoo.com', 'yahoo.ro', 'outlook.com', 'hotmail.com', 'live.com', 'protonmail.com', 'icloud.com', 'mail.ru', 'yandex.com']

  if (freeProviders.includes(domain)) {
    return {
      status: 'risky',
      score: 60,
      reasons: [`Recruiterul folosește email gratuit (${domain}) — firmele legitime folosesc adrese corporative (@companie.ro)`]
    }
  }

  return { status: 'ok', score: 0, details: `Email corporativ (${domain})` }
}

async function checkDescriere(text, company, salary, position) {
  try {
    const parsed = await callAI(
      'Ești expert în detectarea anunțurilor de job false în România. Răspunzi EXCLUSIV în JSON valid, fără text adițional.',
      `Analizezi un anunț de job pentru semne de fraudă.

Text: "${text.substring(0, 1500)}"
${company ? `Firmă: ${company}` : ''}
${position ? `Poziție: ${position}` : ''}
${salary ? `Salariu: ${salary}` : ''}

Evaluează:
1. Salariu nerealist față de piața românească pentru rolul respectiv
2. Promisiuni vagi ("câștiguri garantate", "succes asigurat", "independență financiară")
3. Cerințe absurde sau contradictorii (fără experiență dar salariu de senior)
4. Limbaj de urgență falsă sau presiune
5. Gramatică extrem de proastă sugerând traducere automată

Răspunde JSON: {"riskScore": 0-100, "reasons": ["motiv concret 1"], "summary": "1 propoziție"}`
    )

    const score = Math.min(Math.max(parsed.riskScore || 0, 0), 100)
    if (score > 25 || parsed.reasons?.length > 0) {
      return { status: 'risky', score, reasons: parsed.reasons || [], summary: parsed.summary }
    }
    return { status: 'ok', score: score || 0, details: parsed.summary || 'Descriere fără indicatori de fraudă' }
  } catch {
    return { status: 'unverified', reason: 'Eroare analiză AI' }
  }
}

async function checkProces(text, canal) {
  let canalScore = 0
  const canalReasons = []
  if (canal === 'telegram') { canalScore = 55; canalReasons.push('Recrutare exclusiv pe Telegram — indicator major de fraudă în joburi false') }
  else if (canal === 'signal') { canalScore = 50; canalReasons.push('Recrutare pe Signal — canal neobișnuit pentru recrutare legitimă') }
  else if (canal === 'whatsapp') { canalScore = 25; canalReasons.push('Recrutare exclusiv pe WhatsApp — companiile serioase folosesc email corporativ') }

  try {
    const parsed = await callAI(
      'Ești expert în detectarea proceselor de recrutare frauduloase din România. Răspunzi EXCLUSIV în JSON valid.',
      `Analizezi procesul de recrutare pentru semne de fraudă.

Text: "${text.substring(0, 1000)}"
${canal ? `Canal comunicare: ${canal}` : ''}

Evaluează:
1. Angajare fără interviu tehnic sau HR real
2. Ofertă de angajare trimisă în ore fără verificare CV
3. Presiune să accepte imediat ("oferta expiră azi", "ultimele locuri")
4. Interviu informal pe video fără etape structurate de evaluare
5. Cerere de a începe imediat fără onboarding sau contract formal

Răspunde JSON: {"riskScore": 0-100, "reasons": ["motiv concret 1"], "summary": "1 propoziție"}`
    )

    const aiScore = Math.min(Math.max(parsed.riskScore || 0, 0), 100)
    const combined = Math.min(aiScore + canalScore, 100)
    const allReasons = [...canalReasons, ...(parsed.reasons || [])]

    if (combined > 15 || allReasons.length > 0) {
      return { status: 'risky', score: combined, reasons: allReasons }
    }
    return { status: 'ok', score: 0, details: parsed.summary || 'Proces de recrutare fără anomalii detectate' }
  } catch {
    if (canalScore > 0) return { status: 'risky', score: canalScore, reasons: canalReasons }
    return { status: 'unverified', reason: 'Eroare analiză AI' }
  }
}

async function checkFrauda(text, iban) {
  const reasons = []
  let score = 0

  if (iban) {
    const cleanIban = iban.replace(/\s+/g, '').toUpperCase()

    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(cleanIban) || !validateIBAN(cleanIban)) {
      score += 30
      reasons.push('IBAN furnizat este invalid (cifra de control eronată)')
    } else {
      const { count } = await supabase
        .from('scam_reports')
        .select('*', { count: 'exact', head: true })
        .ilike('link', `%${cleanIban}%`)

      if (count > 0) {
        score += 75
        reasons.push(`IBAN raportat de ${count} utilizator(i) ca fraudulos în baza de date eVerify`)
      }
    }

    score += 40
    reasons.push('Vi s-a cerut IBAN-ul sau o plată — nicio firmă legitimă nu solicită date bancare sau bani înainte de angajare')
  }

  try {
    const parsed = await callAI(
      'Ești expert anti-fraudă financiară pentru joburi false din România. Răspunzi EXCLUSIV în JSON valid.',
      `Analizezi un anunț de job pentru indicatori de fraudă financiară.

Text: "${text.substring(0, 1500)}"
${iban ? `IBAN furnizat de recruiter: ${iban}` : ''}

Verifică:
1. Cerere de plată pentru curs, echipament, licență sau "procesare dosar"
2. Cerere de transfer "test" sau "ca garanție" pentru a primi jobul
3. Schemă piramidală sau MLM deghizat în job legitim
4. Promisiuni de comisioane sau câștiguri nerealiste (>5000€/lună fără experiență)
5. Job care implică primirea și retransferul de bani (money mule)

Răspunde JSON: {"riskScore": 0-100, "reasons": ["motiv concret"], "summary": "1 propoziție"}`
    )

    const aiScore = Math.min(Math.max(parsed.riskScore || 0, 0), 100)
    score = Math.min(score + aiScore, 100)
    if (parsed.reasons) reasons.push(...parsed.reasons)
  } catch {}

  if (score > 0 || reasons.length > 0) {
    return { status: 'risky', score: Math.min(score, 100), reasons }
  }
  return { status: 'ok', score: 0, details: 'Fără indicatori de fraudă financiară' }
}

async function checkDate(text) {
  try {
    const parsed = await callAI(
      'Ești expert GDPR și protecția datelor personale în România. Răspunzi EXCLUSIV în JSON valid.',
      `Analizezi un anunț de job pentru colectare abuzivă de date personale.

Text: "${text.substring(0, 1500)}"

Verifică:
1. Cerere de CI sau pașaport înainte de a semna contractul
2. Cerere de cod CVV, PIN bancar sau date card
3. Cerere de CNP în primele etape ale recrutării (înainte de ofertă)
4. Cerere de parole sau acces la conturi online personale
5. Formulare excesive cu date sensibile la prima aplicare

Răspunde JSON: {"riskScore": 0-100, "reasons": ["motiv concret"], "summary": "1 propoziție"}`
    )

    const score = Math.min(Math.max(parsed.riskScore || 0, 0), 100)
    if (score > 20 || parsed.reasons?.length > 0) {
      return { status: 'risky', score, reasons: parsed.reasons || [] }
    }
    return { status: 'ok', score: 0, details: parsed.summary || 'Fără cerere abuzivă de date personale' }
  } catch {
    return { status: 'unverified', reason: 'Eroare analiză AI' }
  }
}

export async function POST(request) {
  try {
    const { text, company, link, recruiterEmail, iban, canal, position, salary, userId } = await request.json()

    if (!text || text.trim().length < 20) {
      return Response.json({ error: 'Textul anunțului este prea scurt (minim 20 caractere)' }, { status: 400 })
    }

    let userCredits = null
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()
      if (!profile || profile.credits < CREDIT_COSTS.job) {
        return Response.json({ error: 'Nu mai ai credite' }, { status: 403 })
      }
      userCredits = profile.credits
    }

    const charge = async (payload) => {
      if (userId) {
        const newCredits = Math.max(0, (userCredits ?? 0) - CREDIT_COSTS.job)
        await supabase
          .from('profiles')
          .update({ credits: newCredits })
          .eq('id', userId)
        return Response.json({ ...payload, credits: newCredits })
      }
      return Response.json(payload)
    }

    // Fix 3: ignoră IBAN gol sau text care nu arată ca un IBAN real (ex: "fara", "nu", "n/a")
    const cleanedIban = iban && iban.trim()
    const validIban = cleanedIban && /^[A-Za-z]{2}\d/i.test(cleanedIban.replace(/\s+/g, '')) ? cleanedIban : undefined

    const [companie, domeniu, recruiter, descriere, proces, frauda, date] = await Promise.all([
      checkCompanie(company),
      checkDomeniu(link),
      checkRecruiter(recruiterEmail),
      checkDescriere(text, company, salary, position),
      checkProces(text, canal),
      checkFrauda(text, validIban),
      checkDate(text),
    ])

    const modules = { companie, domeniu, recruiter, descriere, proces, frauda, date }

    let totalWeight = 0
    let weightedSum = 0
    const unverifiedModules = []
    const rawReasons = []
    let activeCount = 0

    for (const [key, mod] of Object.entries(modules)) {
      if (mod.status === 'unverified') {
        unverifiedModules.push(key)
      } else {
        totalWeight += MODULE_WEIGHTS[key]
        weightedSum += (mod.score || 0) * MODULE_WEIGHTS[key]
        activeCount++
        // Fix 1: colectăm max 2 motive doar din module 'risky', nu din cele 'ok'
        if (mod.status === 'risky' && mod.reasons) {
          rawReasons.push(...mod.reasons.slice(0, 2))
        }
      }
    }

    // Fix 1: deduplicare motive (case-insensitive, pe text exact)
    const seen = new Set()
    const reasons = rawReasons.filter(r => {
      const key = r.toLowerCase().trim()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    const score = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0

    let riskLevel, riskEmoji
    if (score <= 30) { riskLevel = 'PROBABIL SIGUR'; riskEmoji = '🟢' }
    else if (score <= 60) { riskLevel = 'RISC MODERAT'; riskEmoji = '🟡' }
    else { riskLevel = 'RISC RIDICAT'; riskEmoji = '🔴' }

    return charge({ score, riskLevel, riskEmoji, reasons, modules, unverifiedModules, activeModules: activeCount, totalModules: 7 })

  } catch (error) {
    console.error('check-job error:', error)
    return Response.json({ error: 'Eroare server' }, { status: 500 })
  }
}
