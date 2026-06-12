import { createClient } from '@supabase/supabase-js'
import { CREDIT_COSTS } from '@/lib/credit-costs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

let openphishCache = { urls: null, fetchedAt: 0 }

export async function POST(request) {
  try {
    const { url, userId } = await request.json()

    if (!url) {
      return Response.json({ error: 'URL lipsește' }, { status: 400 })
    }

    // Verificare sold ÎNAINTE de a rula serviciul
    let userCredits = null
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()
      if (!profile || profile.credits < CREDIT_COSTS.url) {
        return Response.json({ error: 'Nu mai ai credite' }, { status: 403 })
      }
      userCredits = profile.credits
    }

    // Scade costul și atașează soldul rămas la răspuns (doar pe succes)
    const charge = async (payload) => {
      if (userId) {
        const newCredits = Math.max(0, (userCredits ?? 0) - CREDIT_COSTS.url)
        await supabase
          .from('profiles')
          .update({ credits: newCredits })
          .eq('id', userId)
        return Response.json({ ...payload, credits: newCredits })
      }
      return Response.json(payload)
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

    // 0. WHITELIST domenii sigure verificate manual
    const bareDomain = domain.replace(/^www\./, '')

    // eVerify — site oficial, verdict special
    if (bareDomain === 'everify.ro') {
      return charge({
        url: normalizedUrl,
        domain,
        trustScore: 100,
        verdict: '✅ Acesta este site-ul oficial eVerify — platforma românească anti-scam. SITE VERIFICAT 100/100',
        checks: {
          https: { secure: normalizedUrl.startsWith('https://') },
          whitelist: { trusted: true, source: 'eVerify Whitelist' },
          patterns: { warnings: [] },
        },
        warnings: [],
        isKnownSafe: true,
        isWhitelisted: true,
      })
    }

    const trustedDomains = [
      // Instituții publice
      'dnsc.ro', 'politiaromana.ro', 'anpc.ro', 'anaf.ro', 'bnr.ro',
      // Bănci
      'bcr.ro', 'brd.ro', 'ingbank.ro', 'raiffeisen.ro', 'bancatransilvania.ro', 'revolut.com',
      // Presă
      'digi24.ro', 'protv.ro', 'antena3.ro', 'g4media.ro', 'hotnews.ro',
      // Comerț
      'emag.ro', 'olx.ro', 'altex.ro', 'mediasmart.ro',
    ]
    const isWhitelisted = trustedDomains.some(d => bareDomain === d || bareDomain.endsWith('.' + d))

    if (isWhitelisted) {
      return charge({
        url: normalizedUrl,
        domain,
        trustScore: 100,
        verdict: 'PROBABIL SIGUR',
        checks: {
          https: { secure: normalizedUrl.startsWith('https://') },
          whitelist: { trusted: true, source: 'eVerify Whitelist — domeniu oficial verificat' },
          patterns: { warnings: [] },
        },
        warnings: [],
        isKnownSafe: true,
        isWhitelisted: true,
      })
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
      let domainSafe = true
      let activeCount = 0
      if (domainhausData.query_status === 'is_host') {
        const hostUrls = Array.isArray(domainhausData.urls) ? domainhausData.urls : []
        activeCount = hostUrls.filter(u => u.url_status === 'online').length
        domainSafe = activeCount === 0
      }
      results.checks.urlhausDomain = {
        safe: domainSafe,
        urlsCount: domainhausData.urls_count || 0,
        activeCount,
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

    // 8. VirusTotal + OpenPhish + crt.sh (paralel)
    const [vtCheck, openphishCheck, crtCheck] = await Promise.allSettled([
      (async () => {
        const vtKey = process.env.VIRUSTOTAL_API_KEY
        if (!vtKey) return { available: false, source: 'VirusTotal' }
        const submitRes = await fetch('https://www.virustotal.com/api/v3/urls', {
          method: 'POST',
          headers: { 'x-apikey': vtKey, 'Content-Type': 'application/x-www-form-urlencoded' },
          signal: AbortSignal.timeout(10000),
          body: `url=${encodeURIComponent(normalizedUrl)}`
        })
        const submitData = await submitRes.json()
        const analysisId = submitData.data?.id
        if (!analysisId) return { available: false, source: 'VirusTotal' }
        await new Promise(r => setTimeout(r, 3000))
        const resultRes = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
          headers: { 'x-apikey': vtKey },
          signal: AbortSignal.timeout(8000)
        })
        const resultData = await resultRes.json()
        const stats = resultData.data?.attributes?.stats || {}
        return {
          malicious: stats.malicious || 0,
          suspicious: stats.suspicious || 0,
          harmless: stats.harmless || 0,
          safe: (stats.malicious || 0) === 0,
          source: 'VirusTotal'
        }
      })(),
      (async () => {
        const now = Date.now()
        const TWELVE_HOURS = 12 * 60 * 60 * 1000
        if (!openphishCache.urls || (now - openphishCache.fetchedAt) > TWELVE_HOURS) {
          const res = await fetch('https://raw.githubusercontent.com/openphish/public_feed/refs/heads/main/feed.txt', { signal: AbortSignal.timeout(10000) })
          const text = await res.text()
          openphishCache.urls = new Set(text.split('\n').map(l => l.trim()).filter(Boolean))
          openphishCache.fetchedAt = now
        }
        const normalized = normalizedUrl.replace(/\/$/, '')
        const found = openphishCache.urls.has(normalized) ||
          openphishCache.urls.has(normalized + '/') ||
          openphishCache.urls.has(normalized.replace(/^https?:\/\//, 'http://')) ||
          openphishCache.urls.has(normalized.replace(/^https?:\/\//, 'https://'))
        return { found, safe: !found, source: 'OpenPhish Community Feed' }
      })(),
      (async () => {
        const res = await fetch(`https://crt.sh/?q=${encodeURIComponent(domain)}&output=json`, {
          signal: AbortSignal.timeout(5000),
          headers: { 'User-Agent': 'eVerify/1.0' }
        })
        const certs = await res.json()
        if (!Array.isArray(certs) || certs.length === 0) return { noCerts: true, totalCerts: 0, source: 'crt.sh' }
        const sorted = [...certs].sort((a, b) => new Date(a.not_before) - new Date(b.not_before))
        const oldest = sorted[0]
        const ageDays = Math.floor((Date.now() - new Date(oldest.not_before).getTime()) / 86400000)
        return { firstIssuedDate: oldest.not_before, ageDays, isNewCert: ageDays < 7, totalCerts: certs.length, safe: ageDays >= 7, source: 'crt.sh' }
      })()
    ])
    results.checks.virusTotal = vtCheck.status === 'fulfilled' ? vtCheck.value : { error: true, source: 'VirusTotal' }
    results.checks.openPhish = openphishCheck.status === 'fulfilled' ? openphishCheck.value : { error: true, source: 'OpenPhish Community Feed' }
    results.checks.certTransparency = crtCheck.status === 'fulfilled' ? crtCheck.value : { unknown: true, source: 'crt.sh' }

    // 6. Pattern analysis
    const knownSafeDomains = ['google.com', 'microsoft.com', 'apple.com', 'amazon.com', 'paypal.com', 'facebook.com', 'instagram.com', 'tiktok.com', 'youtube.com', 'linkedin.com', 'netflix.com', 'spotify.com', 'dnsc.ro', 'politiaromana.ro', 'anpc.ro', 'anaf.ro', 'bnr.ro', 'bcr.ro', 'brd.ro', 'ingbank.ro', 'raiffeisen.ro', 'bancatransilvania.ro', 'revolut.com', 'digi24.ro', 'protv.ro', 'antena3.ro', 'g4media.ro', 'hotnews.ro', 'emag.ro', 'olx.ro', 'altex.ro']
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

    // Penalizări surse noi de threat intelligence
    if (results.checks.virusTotal?.malicious > 0) score -= 40
    if (results.checks.virusTotal?.suspicious > 0) score -= 20
    if (results.checks.openPhish?.found) { score -= 50; score = Math.min(score, 20) }
    if (results.checks.certTransparency?.isNewCert) score -= 30

    if (score < 0) score = 0

    let verdict = ''
    if (score >= 75) verdict = 'PROBABIL SIGUR'
    else if (score >= 50) verdict = 'RISC MODERAT'
    else if (score >= 25) verdict = 'RISC RIDICAT'
    else verdict = 'PERICULOS — NU ACCESAȚI'

    return charge({
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