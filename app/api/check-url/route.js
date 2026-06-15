import { createClient } from '@supabase/supabase-js'
import { CREDIT_COSTS } from '@/lib/credit-costs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

let openphishCache = { urls: null, fetchedAt: 0 }

const PROTECTED_BRANDS = [
  '2performant','7up','abbott','abbvie','absolut','accor','acer','actimel','action','activia',
  'activision','adeplast','adidas','adobe','adyen','aeg','aegean','aegon','afm','agoda',
  'agricola','aig','airbnb','albalact','aldi','alibaba','aliexpress','allianz','alpha','altex',
  'amazon','american','amgen','anaf','ancom','anpc','answear','antena','apple','auchan',
  'axa','bacardi','banca','bancatransilvania','barclays','bauhaus','bayer','bcr','beko',
  'bergenbier','bershka','bestjobs','betano','binance','bioclinica','bitdefender','bitstamp',
  'blablacar','bloomberg','bolt','booking','boromir','borsec','bosch','brd','brico','bringo',
  'burger','cadbury','carrefour','cargus','carlsberg','caroli','carturesti','catena',
  'cec','cel','cez','cfr','chanel','chase','chatgpt','citibank','cisco','cloudflare','cnas',
  'cnp','cocacola','coinbase','colgate','cora','coursera','crypto','dacia','danone','decathlon',
  'dedeman','dell','digi','digi24','disney','distrigaz','dhl','dnsc','domo','dona','dorna',
  'dpd','drmax','dropbox','drpciv','duolingo','dyson','easyjet','ebay','ejobs','electrica',
  'electrolux','elefant','emag','emirates','endava','enel','engie','eon','etoro','etsy',
  'euroins','facebook','fan','farmacia','farmec','fashiondays','fedex','ferrero','fifa',
  'figma','flanco','forbes','generali','george','ghiseul','github','gitlab','glovo','gls',
  'google','grab','grawe','groupama','gucci','hbo','heineken','help','hermes','hidroelectrica',
  'hilton','hipo','hornbach','hsbc','huawei','hyatt','ibm','ikea','ing','instagram','intel',
  'interpol','jbl','jira','johnson','jumbo','jysk','kaufland','kfc','kinder','klarna','klm',
  'knorr','lacoste','lavazza','lenovo','leroy','lidl','linkedin','logitech','lufthansa','lukoil',
  'mac','maersk','makita','mango','mapfre','marks','marriott','mars','mastercard','maybelline',
  'mcdonalds','medicover','medlife','meta','metro','microsoft','miele','milka','mobexpert',
  'mol','moneygram','monza','motorola','netflix','netopia','nike','nintendo','nivea','nokia',
  'noriel','notino','novartis','nvidia','obi','okazii','olx','omv','openai','orange','oracle',
  'pandora','paralela','payoneer','paypal','paysafe','penny','pepco','pepsi','petrom','pfizer',
  'philips','pinterest','politia','primark','profi','puma','raiffeisen','rakuten',
  'reddit','regina','revolut','riot','roblox','roche','rolex','romgaz','rossmann','rovinieta',
  'ryanair','salesforce','sameday','samsung','sanador','sanofi','santander','sap',
  'selgros','sensiblu','sephora','shell','siemens','signal','skrill','sky','slack','snapchat',
  'sony','spotify','starbucks','steam','stripe','subway','superbet','tarom','tazz','tefal',
  'telecom','telegram','telekom','temu','tesco','tesla','tiktok','tim','totalenergies',
  'tripadvisor','trivago','tui','uber','uipath','unicredit','ups','urgent','ursus','valentino',
  'visa','vodafone','vola','walmart','whatsapp','whirlpool','wise','wizz','wordpress','xbox',
  'xiaomi','zalando','zara','zoom','zurich'
]

const HIGH_RISK_PHISHING_COUNTRIES = new Set([
  'CN', 'RU', 'NG', 'KP', 'IR', 'PK', 'BD', 'VN', 'ID', 'UA'
])

// TLD-uri considerate oficiale pentru Pattern 2
const OFFICIAL_TLDS = new Set(['com', 'ro', 'eu', 'org', 'net'])

function levenshtein(a, b) {
  if (Math.abs(a.length - b.length) > 1) return 2
  const m = a.length, n = b.length
  let prev = Array.from({ length: n + 1 }, (_, i) => i)
  for (let i = 1; i <= m; i++) {
    const curr = new Array(n + 1)
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      curr[j] = a[i - 1] === b[j - 1]
        ? prev[j - 1]
        : 1 + Math.min(prev[j], curr[j - 1], prev[j - 1])
    }
    prev = curr
  }
  return prev[n]
}

function wrapResult(settled, fallback) {
  if (settled.status === 'fulfilled') return settled.value
  const reason = settled.reason
  const isTimeout = reason?.name === 'TimeoutError' || reason?.cause?.name === 'TimeoutError'
  return { ...fallback, error: true, timeout: isTimeout }
}

async function resolveIp(domain) {
  try {
    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`,
      { signal: AbortSignal.timeout(4000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    const answer = Array.isArray(data.Answer) ? data.Answer.find(r => r.type === 1) : null
    return answer?.data || null
  } catch {
    return null
  }
}

export async function POST(request) {
  try {
    const { url, userId } = await request.json()

    if (!url) {
      return Response.json({ error: 'URL lipsește' }, { status: 400 })
    }

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

    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl
    }

    let domain = ''
    try {
      domain = new URL(normalizedUrl).hostname
    } catch {
      return Response.json({ error: 'URL invalid' }, { status: 400 })
    }

    const bareDomain = domain.replace(/^www\./, '')

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

    // Resolve IP once — shared by IPInfo, AbuseIPDB, Shodan
    const ip = await resolveIp(domain)

    const settled = await Promise.allSettled([
      // 1. Google Safe Browsing
      (async () => {
        const t0 = performance.now()
        const res = await fetch(
          `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_SAFE_BROWSING_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(5000),
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
        const data = await res.json()
        return {
          safe: !data.matches?.length,
          threats: data.matches || [],
          source: 'Google Safe Browsing',
          duration_ms: Math.round(performance.now() - t0)
        }
      })(),

      // 2. URLhaus URL check
      (async () => {
        const t0 = performance.now()
        const res = await fetch('https://urlhaus-api.abuse.ch/v1/url/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          signal: AbortSignal.timeout(5000),
          body: `url=${encodeURIComponent(normalizedUrl)}`
        })
        const data = await res.json()
        if (data.error) {
          return { safe: true, source: 'URLhaus — abuse.ch', duration_ms: Math.round(performance.now() - t0) }
        }
        let safe = true
        if (data.query_status === 'is_url') safe = data.url_status !== 'online'
        return {
          safe,
          status: data.query_status,
          threat: data.threat || null,
          source: 'URLhaus — abuse.ch',
          duration_ms: Math.round(performance.now() - t0)
        }
      })(),

      // 3. URLhaus Domain check
      (async () => {
        const t0 = performance.now()
        const res = await fetch('https://urlhaus-api.abuse.ch/v1/host/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          signal: AbortSignal.timeout(5000),
          body: `host=${domain}`
        })
        const data = await res.json()
        if (data.error) {
          return { safe: true, urlsCount: 0, activeCount: 0, source: 'URLhaus Domain Check', duration_ms: Math.round(performance.now() - t0) }
        }
        let safe = true, activeCount = 0
        if (data.query_status === 'is_host') {
          const hostUrls = Array.isArray(data.urls) ? data.urls : []
          activeCount = hostUrls.filter(u => u.url_status === 'online').length
          safe = activeCount === 0
        }
        return {
          safe,
          urlsCount: data.urls_count || 0,
          activeCount,
          source: 'URLhaus Domain Check',
          duration_ms: Math.round(performance.now() - t0)
        }
      })(),

      // 4. VirusTotal
      (async () => {
        const t0 = performance.now()
        const vtKey = process.env.VIRUSTOTAL_API_KEY
        if (!vtKey) return { available: false, source: 'VirusTotal', duration_ms: 0 }
        const submitRes = await fetch('https://www.virustotal.com/api/v3/urls', {
          method: 'POST',
          headers: { 'x-apikey': vtKey, 'Content-Type': 'application/x-www-form-urlencoded' },
          signal: AbortSignal.timeout(10000),
          body: `url=${encodeURIComponent(normalizedUrl)}`
        })
        const submitData = await submitRes.json()
        const analysisId = submitData.data?.id
        if (!analysisId) return { available: false, source: 'VirusTotal', duration_ms: Math.round(performance.now() - t0) }
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
          source: 'VirusTotal',
          duration_ms: Math.round(performance.now() - t0)
        }
      })(),

      // 5. OpenPhish
      (async () => {
        const t0 = performance.now()
        const now = Date.now()
        if (!openphishCache.urls || (now - openphishCache.fetchedAt) > 12 * 60 * 60 * 1000) {
          const res = await fetch(
            'https://raw.githubusercontent.com/openphish/public_feed/refs/heads/main/feed.txt',
            { signal: AbortSignal.timeout(10000) }
          )
          const text = await res.text()
          openphishCache.urls = new Set(text.split('\n').map(l => l.trim()).filter(Boolean))
          openphishCache.fetchedAt = now
        }
        const norm = normalizedUrl.replace(/\/$/, '')
        const found = openphishCache.urls.has(norm) ||
          openphishCache.urls.has(norm + '/') ||
          openphishCache.urls.has(norm.replace(/^https?:\/\//, 'http://')) ||
          openphishCache.urls.has(norm.replace(/^https?:\/\//, 'https://'))
        return { found, safe: !found, source: 'OpenPhish Community Feed', duration_ms: Math.round(performance.now() - t0) }
      })(),

      // 6. crt.sh
      (async () => {
        const t0 = performance.now()
        const res = await fetch(`https://crt.sh/?q=${encodeURIComponent(domain)}&output=json`, {
          signal: AbortSignal.timeout(5000),
          headers: { 'User-Agent': 'eVerify/1.0' }
        })
        const certs = await res.json()
        if (!Array.isArray(certs) || certs.length === 0) {
          return { noCerts: true, totalCerts: 0, source: 'crt.sh', duration_ms: Math.round(performance.now() - t0) }
        }
        const sorted = [...certs].sort((a, b) => new Date(a.not_before) - new Date(b.not_before))
        const oldest = sorted[0]
        const ageDays = Math.floor((Date.now() - new Date(oldest.not_before).getTime()) / 86400000)
        return {
          firstIssuedDate: oldest.not_before,
          ageDays,
          isNewCert: ageDays < 7,
          totalCerts: certs.length,
          safe: ageDays >= 7,
          source: 'crt.sh',
          duration_ms: Math.round(performance.now() - t0)
        }
      })(),

      // 7. RDAP (înlocuiește WHOIS)
      (async () => {
        const t0 = performance.now()
        const isRo = bareDomain.endsWith('.ro')
        const rdapUrl = isRo
          ? `https://rdap.rotld.ro/domain/${encodeURIComponent(bareDomain)}`
          : `https://rdap.org/domain/${encodeURIComponent(bareDomain)}`
        const res = await fetch(rdapUrl, {
          signal: AbortSignal.timeout(8000),
          headers: { 'Accept': 'application/rdap+json, application/json' }
        })
        if (!res.ok) {
          return {
            name: domain, createdDate: null, registrar: null, nameservers: [],
            source: isRo ? 'RDAP — Registru oficial .ro' : 'RDAP — Registru oficial domenii',
            duration_ms: Math.round(performance.now() - t0)
          }
        }
        const data = await res.json()
        const events = Array.isArray(data.events) ? data.events : []
        const regEvent = events.find(e => e.eventAction === 'registration')
        const createdDate = regEvent?.eventDate || null
        const nameservers = (Array.isArray(data.nameservers) ? data.nameservers : [])
          .map(ns => ns.ldhName).filter(Boolean)
        const entities = Array.isArray(data.entities) ? data.entities : []
        const registrarEntity = entities.find(e => Array.isArray(e.roles) && e.roles.includes('registrar'))
        const registrar = registrarEntity?.vcardArray?.[1]?.find?.(v => v[0] === 'fn')?.[3] ||
          registrarEntity?.handle || null
        return {
          name: domain, createdDate, registrar, nameservers,
          source: isRo ? 'RDAP — Registru oficial .ro' : 'RDAP — Registru oficial domenii',
          duration_ms: Math.round(performance.now() - t0)
        }
      })(),

      // 8. IPInfo
      (async () => {
        const t0 = performance.now()
        if (!ip) return { available: false, source: 'IPInfo', duration_ms: 0 }
        const key = process.env.IPINFO_API_KEY
        if (!key) return { available: false, source: 'IPInfo', duration_ms: 0 }
        const res = await fetch(`https://ipinfo.io/${ip}?token=${key}`, {
          signal: AbortSignal.timeout(5000)
        })
        if (!res.ok) return { available: false, source: 'IPInfo', duration_ms: Math.round(performance.now() - t0) }
        const data = await res.json()
        return {
          ip,
          country: data.country,
          org: data.org,
          hostname: data.hostname,
          isHighRisk: HIGH_RISK_PHISHING_COUNTRIES.has(data.country || ''),
          source: 'IPInfo',
          duration_ms: Math.round(performance.now() - t0)
        }
      })(),

      // 9. AbuseIPDB
      (async () => {
        const t0 = performance.now()
        if (!ip) return { available: false, source: 'AbuseIPDB', duration_ms: 0 }
        const key = process.env.ABUSEIPDB_API_KEY
        if (!key) return { available: false, source: 'AbuseIPDB', duration_ms: 0 }
        const res = await fetch(
          `https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`,
          {
            signal: AbortSignal.timeout(5000),
            headers: { 'Key': key, 'Accept': 'application/json' }
          }
        )
        if (!res.ok) return { available: false, source: 'AbuseIPDB', duration_ms: Math.round(performance.now() - t0) }
        const data = await res.json()
        const d = data.data || {}
        return {
          ip,
          abuseConfidenceScore: d.abuseConfidenceScore ?? 0,
          totalReports: d.totalReports ?? 0,
          source: 'AbuseIPDB',
          duration_ms: Math.round(performance.now() - t0)
        }
      })(),

      // 10. Shodan
      (async () => {
        const t0 = performance.now()
        if (!ip) return { available: false, source: 'Shodan', duration_ms: 0 }
        const key = process.env.SHODAN_API_KEY
        if (!key) return { available: false, source: 'Shodan', duration_ms: 0 }
        const res = await fetch(`https://api.shodan.io/shodan/host/${ip}?key=${key}`, {
          signal: AbortSignal.timeout(8000)
        })
        if (!res.ok) return {
          available: false,
          notIndexed: res.status === 404 || res.status === 403,
          source: 'Shodan',
          duration_ms: Math.round(performance.now() - t0)
        }
        const data = await res.json()
        const hostnames = Array.isArray(data.hostnames) ? data.hostnames : []
        return {
          ip,
          org: data.org,
          country_name: data.country_name,
          ports: data.ports,
          hostnameCount: hostnames.length,
          source: 'Shodan',
          duration_ms: Math.round(performance.now() - t0)
        }
      })(),
    ])

    const [sb, uh, uhd, vt, op, crt, rdap, ipinfo, abuseipdb, shodan] = settled

    const checks = {
      https: { secure: normalizedUrl.startsWith('https://') },
      safeBrowsing: wrapResult(sb, { safe: null, source: 'Google Safe Browsing' }),
      urlhaus: wrapResult(uh, { safe: null, source: 'URLhaus — abuse.ch' }),
      urlhausDomain: wrapResult(uhd, { safe: null, urlsCount: 0, activeCount: 0, source: 'URLhaus Domain Check' }),
      virusTotal: wrapResult(vt, { source: 'VirusTotal' }),
      openPhish: wrapResult(op, { source: 'OpenPhish Community Feed' }),
      certTransparency: wrapResult(crt, { unknown: true, source: 'crt.sh' }),
      domain: wrapResult(rdap, { name: domain, createdDate: null, registrar: null, nameservers: [] }),
      ipInfo: wrapResult(ipinfo, { source: 'IPInfo' }),
      abuseIPDB: wrapResult(abuseipdb, { source: 'AbuseIPDB' }),
      shodan: wrapResult(shodan, { source: 'Shodan' }),
    }

    // Pattern analysis
    const knownSafeDomains = [
      'google.com', 'microsoft.com', 'apple.com', 'amazon.com', 'paypal.com', 'facebook.com',
      'instagram.com', 'tiktok.com', 'youtube.com', 'linkedin.com', 'netflix.com', 'spotify.com',
      'dnsc.ro', 'politiaromana.ro', 'anpc.ro', 'anaf.ro', 'bnr.ro', 'bcr.ro', 'brd.ro',
      'ingbank.ro', 'raiffeisen.ro', 'bancatransilvania.ro', 'revolut.com',
      'digi24.ro', 'protv.ro', 'antena3.ro', 'g4media.ro', 'hotnews.ro',
      'emag.ro', 'olx.ro', 'altex.ro'
    ]
    const isKnownSafe = knownSafeDomains.some(d => domain === d || domain.endsWith('.' + d))

    const suspiciousPatterns = [
      { pattern: /(\d{1,3}\.){3}\d{1,3}/, reason: 'Adresă IP în loc de domeniu' },
      { pattern: /[а-яА-ЯЀ-ӿ]/, reason: 'Caractere chirilice sau Unicode suspect în URL (posibil atac homograph)' },
      { pattern: /(secure|login|verify|update|confirm|account|banking|paypal|apple|google|microsoft|amazon|signin|webscr)/i, reason: 'Cuvânt cheie suspect în URL', skipIfKnownSafe: true },
      { pattern: /\.(tk|ml|ga|cf|gq|xyz|top|click|link|online|site|web|info|buzz|rest|zip|mov)$/i, reason: 'Extensie de domeniu frecvent asociată cu fraude online' },
      { pattern: /-{2,}/, reason: 'Multiple cratime în domeniu (pattern suspect)' },
      { pattern: /\d{5,}/, reason: 'Șir lung de cifre în domeniu (pattern suspect)' },
      { pattern: /(.)\1{4,}/, reason: 'Caractere repetate suspect în domeniu' },
    ]

    const typosquattingWarnings = []
    {
      const domainParts = bareDomain.split('.')
      const sld = domainParts[0]
      const tldLabel = domainParts[domainParts.length - 1]
      const sldSegments = sld.split('-')

      for (const brand of PROTECTED_BRANDS) {
        // Pattern 1: brand ca segment exact separat prin - (necesită 2+ segmente)
        if (sldSegments.length > 1 && sldSegments.includes(brand)) {
          typosquattingWarnings.push(`Posibil site fals care imită „${brand}" — brand ca segment separat`)
          continue
        }
        // Pattern 2: SLD e exact brandul + TLD neoficial
        if (sld === brand && !OFFICIAL_TLDS.has(tldLabel)) {
          typosquattingWarnings.push(`Posibil site fals care imită „${brand}" — brand cu TLD neoficial`)
          continue
        }
        // Pattern 3: distanță Levenshtein exact 1 față de brand (doar branduri ≥5 caractere)
        if (brand.length >= 5 && levenshtein(sld, brand) === 1) {
          typosquattingWarnings.push(`Posibil site fals care imită „${brand}" — typo în domeniu`)
          continue
        }
        // Pattern 4: brand ca prefix sau suffix fără separator (doar branduri ≥6 caractere)
        if (brand.length >= 6 && sld.length > brand.length) {
          if (sld.startsWith(brand) || sld.endsWith(brand)) {
            typosquattingWarnings.push(`Posibil site fals care imită „${brand}" — brand concatenat în domeniu`)
          }
        }
      }
    }

    const warnings = []
    suspiciousPatterns.forEach(({ pattern, reason, skipIfKnownSafe }) => {
      if (skipIfKnownSafe && isKnownSafe) return
      if (pattern.test(domain)) warnings.push(reason)
    })

    const allWarnings = [...warnings, ...typosquattingWarnings]
    checks.patterns = { warnings: allWarnings }

    // Trust Score
    let score = 100

    if (checks.safeBrowsing?.safe === false) score -= 60
    if (checks.urlhaus?.safe === false) score -= 50
    if (checks.urlhausDomain?.safe === false) score -= 30
    if (!checks.https.secure) score -= 30

    if (allWarnings.length >= 3) score -= allWarnings.length * 20
    else if (allWarnings.length === 2) score -= allWarnings.length * 15
    else if (allWarnings.length === 1) score -= 15

    if (isKnownSafe) score = Math.max(score, 90)

    if (checks.domain?.createdDate) {
      const created = new Date(checks.domain.createdDate)
      const ageMonths = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24 * 30)
      if (ageMonths < 3) score -= 25
      else if (ageMonths < 12) score -= 10
      checks.domain.ageMonths = Math.round(ageMonths)
    }

    if (checks.virusTotal?.malicious > 0) score -= 40
    if (checks.virusTotal?.suspicious > 0) score -= 20
    if (checks.openPhish?.found) { score -= 50; score = Math.min(score, 20) }
    if (checks.certTransparency?.isNewCert) score -= 30

    // New source penalties
    if (checks.ipInfo?.country && HIGH_RISK_PHISHING_COUNTRIES.has(checks.ipInfo.country)) score -= 15
    if (checks.abuseIPDB?.abuseConfidenceScore > 50) score -= 50
    else if (checks.abuseIPDB?.abuseConfidenceScore > 25) score -= 30
    if (checks.shodan?.hostnameCount >= 20) score -= 15

    const unknownSourcesCount = [
      checks.safeBrowsing?.safe === null,
      checks.urlhaus?.safe === null,
      checks.urlhausDomain?.safe === null,
      checks.virusTotal?.available === false || checks.virusTotal?.error === true,
      checks.openPhish?.error === true,
      checks.certTransparency?.unknown === true,
      !checks.domain?.createdDate,
      checks.ipInfo?.error === true || checks.ipInfo?.available === false,
      checks.abuseIPDB?.error === true || checks.abuseIPDB?.available === false,
      checks.shodan?.error === true || checks.shodan?.available === false,
    ].filter(Boolean).length
    if (unknownSourcesCount >= 5) {
      allWarnings.push('⚠️ Domeniu necunoscut — verificat în prea puține surse pentru un verdict sigur')
      score -= 10
    }

    if (!checks.domain?.createdDate && !isKnownSafe) {
      allWarnings.push('⚠️ Vârstă domeniu necunoscută — imposibil de verificat')
      score -= 5
    }

    if (typosquattingWarnings.length > 0) score = Math.min(score, 25)
    if (checks.safeBrowsing?.safe === false) score = Math.min(score, 15)

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
      checks,
      warnings: allWarnings,
      isKnownSafe
    })

  } catch (error) {
    console.error('Check URL error:', error)
    return Response.json({ error: 'Eroare server' }, { status: 500 })
  }
}
