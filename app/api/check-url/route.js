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

    // Extragere domeniu
    let domain = ''
    try {
      domain = new URL(normalizedUrl).hostname
    } catch (e) {
      return Response.json({ error: 'URL invalid' }, { status: 400 })
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
        threats: safeBrowsingData.matches || [],
        source: 'Google Safe Browsing'
      }
    } catch (e) {
      results.checks.safeBrowsing = { safe: null, error: true, source: 'Google Safe Browsing' }
    }

    // 2. URLhaus (abuse.ch) - partener Interpol/Europol
    try {
      const urlhausResponse = await fetch('https://urlhaus-api.abuse.ch/v1/url/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `url=${encodeURIComponent(normalizedUrl)}`
      })
      const urlhausData = await urlhausResponse.json()
      results.checks.urlhaus = {
        safe: urlhausData.query_status === 'no_results',
        status: urlhausData.query_status,
        threat: urlhausData.threat || null,
        source: 'URLhaus — abuse.ch (partener Interpol/Europol)'
      }
    } catch (e) {
      results.checks.urlhaus = { safe: null, error: true, source: 'URLhaus — abuse.ch' }
    }

    // 3. URLhaus Domain check
    try {
      const domainhausResponse = await fetch('https://urlhaus-api.abuse.ch/v1/host/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `host=${encodeURIComponent(domain)}`
      })
      const domainhausData = await domainhausResponse.json()
      results.checks.urlhausDomain = {
        safe: domainhausData.query_status === 'no_results',
        urlsCount: domainhausData.urls_count || 0,
        source: 'URLhaus Domain Check'
      }
    } catch (e) {
      results.checks.urlhausDomain = { safe: null, error: true }
    }

    // 4. HTTPS check
    results.checks.https = {
      secure: normalizedUrl.startsWith('https://')
    }

    // 5. Whois / Domain age
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

    // 6. Pattern analysis
    const knownSafeDomains = ['google.com', 'microsoft.com', 'apple.com', 'amazon.com', 'paypal.com', 'facebook.com', 'instagram.com', 'tiktok.com', 'youtube.com', 'linkedin.com', 'olx.ro', 'emag.ro', 'bcr.ro', 'brd.ro', 'ingbank.ro', 'raiffeisen.ro', 'bancatransilvania.ro', 'revolut.com', 'netflix.com', 'spotify.com']
    const isKnownSafe = knownSafeDomains.some(d => domain === d || domain.endsWith('.' + d))

    const suspiciousPatterns = [
      { pattern: /(\d{1,3}\.){3}\d{1,3}/, reason: 'Adresă IP în loc de domeniu' },
      { pattern: /[а-яА-Я\u0400-\u04FF]/, reason: 'Caractere chirilice sau Unicode suspect în URL (posibil atac homograph)' },
      { pattern: /(secure|login|verify|update|confirm|account|banking|paypal|apple|google|microsoft|amazon|signin|webscr)/i, reason: 'Cuvânt cheie suspect în URL', skipIfKnownSafe: true },
      { pattern: /\.(tk|ml|ga|cf|gq|xyz|top|click|link|online|site|web|info|buzz|rest|zip|mov)$/i, reason: 'Extensie de domeniu frecvent asociată cu fraude online' },
      { pattern: /-{2,}/, reason: 'Multiple cratime în domeniu (pattern suspect)' },
      { pattern: /\d{5,}/, reason: 'Șir lung de cifre în domeniu (pattern suspect)' },
      { pattern: /(.)\1{4,}/, reason: 'Caractere repetate suspect în domeniu' },
    ]

    // Typosquatting detection pentru branduri românești și internaționale
    const knownBrands = ['paypal', 'google', 'microsoft', 'apple', 'amazon', 'facebook', 'instagram', 'netflix', 'olx', 'emag', 'bcr', 'brd', 'raiffeisen', 'revolut']
    const typosquattingWarnings = []

    if (!isKnownSafe) {
      knownBrands.forEach(brand => {
        // Verifica daca domeniul contine brand-ul dar nu e domeniul oficial
        if (domain.includes(brand) && !knownSafeDomains.some(d => domain === d || domain.endsWith('.' + d))) {
          typosquattingWarnings.push(`Posibil site fals care imită "${brand}" (typosquatting)`)
        }
      })
    }

    const warnings = []
    suspiciousPatterns.forEach(({ pattern, reason, skipIfKnownSafe }) => {
      if (skipIfKnownSafe && isKnownSafe) return
      if (pattern.test(domain)) {
        warnings.push(reason)
      }
    })

    const allWarnings = [...warnings, ...typosquattingWarnings]
    results.checks.patterns = { warnings: allWarnings }

    // 7. Calculare Trust Score
    let score = 100

    // Penalizari blacklist-uri
    if (results.checks.safeBrowsing?.safe === false) score -= 60
    if (results.checks.urlhaus?.safe === false) score -= 50
    if (results.checks.urlhausDomain?.safe === false) score -= 30

    // Penalizare HTTPS
    if (!results.checks.https.secure) score -= 30

    // Penalizari pattern-uri suspecte
    if (allWarnings.length >= 3) score -= allWarnings.length * 20
    else if (allWarnings.length === 2) score -= allWarnings.length * 15
    else if (allWarnings.length === 1) score -= 15

    // Bonus domenii cunoscute sigure
    if (isKnownSafe) score = Math.max(score, 90)

    // Verificare varsta domeniu
    if (results.checks.domain?.createdDate) {
      const created = new Date(results.checks.domain.createdDate)
      const ageMonths = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24 * 30)
      if (ageMonths < 3) score -= 25
      else if (ageMonths < 12) score -= 10
      results.checks.domain.ageMonths = Math.round(ageMonths)
    }

    if (score < 0) score = 0

    let verdict = ''
    if (score >= 75) verdict = 'PROBABIL SIGUR'
    else if (score >= 50) verdict = 'RISC MODERAT'
    else if (score >= 25) verdict = 'RISC RIDICAT'
    else verdict = 'PERICULOS — NU ACCESAȚI'

    return Response.json({
      url: normalizedUrl,
      domain,
      trustScore: score,
      verdict,
      checks: results.checks,
      warnings: allWarnings,
      isKnownSafe
    })

  } catch (error) {
    console.error('Check URL error:', error)
    return Response.json({ error: 'Eroare server' }, { status: 500 })
  }
}