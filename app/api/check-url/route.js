export async function POST(request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return Response.json({ error: 'URL lipsește' }, { status: 400 })
    }

    // Normalizare URL
    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl
    }

    const results = {
      url: normalizedUrl,
      checks: {}
    }

    // 1. Google Safe Browsing
    try {
      const safeBrowsingResponse = await fetch(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_SAFE_BROWSING_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client: { clientId: 'everify', clientVersion: '1.0' },
            threatInfo: {
              threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
              platformTypes: ['ANY_PLATFORM'],
              threatEntryTypes: ['URL'],
              threatEntries: [{ url: normalizedUrl }]
            }
          })
        }
      )
      const safeBrowsingData = await safeBrowsingResponse.json()
      results.checks.safeBrowsing = {
        safe: !safeBrowsingData.matches || safeBrowsingData.matches.length === 0,
        threats: safeBrowsingData.matches || []
      }
    } catch (e) {
      results.checks.safeBrowsing = { safe: null, error: true }
    }

    // 2. HTTPS check
    results.checks.https = {
      secure: normalizedUrl.startsWith('https://'),
    }

    // 3. Domain extraction si analiza
    let domain = ''
    try {
      domain = new URL(normalizedUrl).hostname
    } catch (e) {
      return Response.json({ error: 'URL invalid' }, { status: 400 })
    }

    // 4. Whois / Domain age via API
    try {
      const whoisResponse = await fetch(`https://api.whoisfreaks.com/v1.0/whois?apiKey=free&whois=live&domainName=${domain}`)
      const whoisData = await whoisResponse.json()
      results.checks.domain = {
        name: domain,
        createdDate: whoisData.create_date || null,
        registrar: whoisData.domain_registrar?.registrar_name || null,
      }
    } catch (e) {
      results.checks.domain = { name: domain, createdDate: null, registrar: null }
    }

    // 5. Pattern analysis - semne de alarma
    // Excludem domeniile cunoscute din verificarea de cuvinte cheie
    const knownSafeDomains = ['google.com', 'microsoft.com', 'apple.com', 'amazon.com', 'paypal.com', 'facebook.com', 'instagram.com', 'tiktok.com', 'youtube.com', 'linkedin.com']
    const isKnownSafe = knownSafeDomains.some(d => domain === d || domain.endsWith('.' + d))

    const suspiciousPatterns = [
      { pattern: /(\d{1,3}\.){3}\d{1,3}/, reason: 'Adresă IP în loc de domeniu' },
      { pattern: /[а-яА-Я]/, reason: 'Caractere chirilice în URL' },
      { pattern: /(secure|login|verify|update|confirm|account|banking|paypal|apple|google|microsoft|amazon)/i, reason: 'Cuvânt cheie suspect în URL', skipIfKnownSafe: true },
      { pattern: /\.(tk|ml|ga|cf|gq|xyz|top|click|link|online|site|web|info)$/i, reason: 'Extensie de domeniu asociată cu scam-uri' },
      { pattern: /-{2,}/, reason: 'Multiple cratime în domeniu' },
      { pattern: /\d{4,}/, reason: 'Șir lung de cifre în domeniu' },
    ]

    const warnings = []
    suspiciousPatterns.forEach(({ pattern, reason, skipIfKnownSafe }) => {
      if (skipIfKnownSafe && isKnownSafe) return
      if (pattern.test(domain)) {
        warnings.push(reason)
      }
    })

    results.checks.patterns = { warnings }

    // 6. Calculare Trust Score
    let score = 100

    // Penalizari majore
    if (!results.checks.https.secure) score -= 30
    if (results.checks.safeBrowsing?.safe === false) score -= 50

    // Penalizari pentru avertismente
    if (warnings.length >= 3) score -= warnings.length * 20
    else if (warnings.length === 2) score -= warnings.length * 15
    else if (warnings.length === 1) score -= 10

    // Bonus pentru domenii cunoscute sigure
    if (isKnownSafe) score = Math.max(score, 90)

    if (score < 0) score = 0

    // Verificare varsta domeniu
    if (results.checks.domain.createdDate) {
      const created = new Date(results.checks.domain.createdDate)
      const ageMonths = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24 * 30)
      if (ageMonths < 3) score -= 25
      else if (ageMonths < 12) score -= 10
      results.checks.domain.ageMonths = Math.round(ageMonths)
    }

    if (score < 0) score = 0

    let verdict = ''
    let verdictColor = ''
    if (score >= 75) { verdict = 'PROBABIL SIGUR'; verdictColor = 'green' }
    else if (score >= 50) { verdict = 'RISC MODERAT'; verdictColor = 'yellow' }
    else if (score >= 25) { verdict = 'RISC RIDICAT'; verdictColor = 'orange' }
    else { verdict = 'PERICULOS'; verdictColor = 'red' }

    return Response.json({
      url: normalizedUrl,
      domain,
      trustScore: score,
      verdict,
      verdictColor,
      checks: results.checks,
      warnings,
      isKnownSafe
    })

  } catch (error) {
    console.error('Check URL error:', error)
    return Response.json({ error: 'Eroare server' }, { status: 500 })
  }
}