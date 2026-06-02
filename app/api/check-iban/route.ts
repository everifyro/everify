import { createClient } from '@supabase/supabase-js'
import { CREDIT_COSTS } from '@/lib/credit-costs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const RO_BANKS: Record<string, string> = {
  RNCB: 'BCR (Banca Comercială Română)',
  BTRL: 'Banca Transilvania',
  INGB: 'ING Bank',
  BRDE: 'BRD – Groupe Société Générale',
  CECB: 'CEC Bank',
  TREZ: 'Trezoreria Statului',
  PIRB: 'First Bank',
  BREL: 'Libra Internet Bank',
  OTPV: 'OTP Bank România',
  BACX: 'UniCredit Bank',
  RZBR: 'Raiffeisen Bank',
  MIRO: 'Mihai Eminescu Banca',
  UGBI: 'Garanti BBVA',
  CARP: 'Patria Bank',
  EXIM: 'Eximbank',
  WBAN: 'WB Banca (fosta Idea Bank)',
}

const SEPA_COUNTRIES = new Set([
  'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU',
  'IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE',
  'IS','LI','NO','CH','GB','MC','SM','AD','VA','GI',
])

const DIFFICULT_COUNTRIES = new Set(['GB','CH','US','CA','AU','NZ'])

const COUNTRY_NAMES: Record<string, string> = {
  RO: 'România', DE: 'Germania', FR: 'Franța', IT: 'Italia', ES: 'Spania',
  NL: 'Olanda', BE: 'Belgia', AT: 'Austria', PL: 'Polonia', HU: 'Ungaria',
  CZ: 'Cehia', SK: 'Slovacia', BG: 'Bulgaria', HR: 'Croația', SI: 'Slovenia',
  PT: 'Portugalia', GR: 'Grecia', SE: 'Suedia', FI: 'Finlanda', DK: 'Danemarca',
  NO: 'Norvegia', CH: 'Elveția', GB: 'Marea Britanie', US: 'SUA', UA: 'Ucraina',
  TR: 'Turcia', RU: 'Rusia', CN: 'China', AE: 'Emiratele Arabe Unite',
  CY: 'Cipru', MT: 'Malta', LU: 'Luxemburg', IE: 'Irlanda', EE: 'Estonia',
  LV: 'Letonia', LT: 'Lituania', IS: 'Islanda', LI: 'Liechtenstein',
}

function validateMOD97(iban: string): boolean {
  const rearranged = iban.slice(4) + iban.slice(0, 4)
  const numeric = rearranged.split('').map(c => {
    const code = c.charCodeAt(0)
    if (code >= 65 && code <= 90) return (code - 65 + 10).toString()
    return c
  }).join('')
  let remainder = 0
  for (let i = 0; i < numeric.length; i++) {
    remainder = (remainder * 10 + parseInt(numeric[i])) % 97
  }
  return remainder === 1
}

function formatIBAN(iban: string): string {
  return iban.match(/.{1,4}/g)?.join(' ') ?? iban
}

export async function POST(request: Request) {
  try {
    const { iban: rawIban, userId } = await request.json()

    if (!rawIban) {
      return Response.json({ error: 'IBAN lipsește' }, { status: 400 })
    }

    const iban = rawIban.replace(/\s+/g, '').toUpperCase()

    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(iban)) {
      return Response.json({ error: 'Format IBAN invalid. Exemplu: RO49 AAAA 1B31 0075 9384 0000' }, { status: 400 })
    }

    const countryCode = iban.slice(0, 2)
    const isValidMOD97 = validateMOD97(iban)

    if (!isValidMOD97) {
      return Response.json({
        iban: formatIBAN(iban),
        raw: iban,
        valid: false,
        countryCode,
        countryName: COUNTRY_NAMES[countryCode] ?? countryCode,
        error: 'IBAN invalid — cifra de control (MOD97) nu este corectă. Verificați dacă ați copiat corect toate caracterele.',
      })
    }

    let userCredits: number | null = null
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()
      if (!profile || profile.credits < CREDIT_COSTS.iban) {
        return Response.json({ error: 'Nu mai ai credite' }, { status: 403 })
      }
      userCredits = profile.credits
    }

    const charge = async (payload: object) => {
      if (userId) {
        const newCredits = Math.max(0, (userCredits ?? 0) - CREDIT_COSTS.iban)
        await supabase
          .from('profiles')
          .update({ credits: newCredits })
          .eq('id', userId)
        return Response.json({ ...payload, credits: newCredits })
      }
      return Response.json(payload)
    }

    const bankCode = countryCode === 'RO' ? iban.slice(4, 8) : null
    const bankName = bankCode ? (RO_BANKS[bankCode] ?? `Bancă neidentificată (cod: ${bankCode})`) : null
    const isSepa = SEPA_COUNTRIES.has(countryCode)

    let recoveryLevel: 'green' | 'yellow' | 'red'
    let recoveryLabel: string
    let recoveryEmoji: string

    if (countryCode === 'RO' || (SEPA_COUNTRIES.has(countryCode) && countryCode !== 'CH' && countryCode !== 'GB')) {
      recoveryLevel = 'green'
      recoveryLabel = 'Recuperare posibilă'
      recoveryEmoji = '🟢'
    } else if (DIFFICULT_COUNTRIES.has(countryCode)) {
      recoveryLevel = 'yellow'
      recoveryLabel = 'Recuperare dificilă'
      recoveryEmoji = '🟡'
    } else {
      recoveryLevel = 'red'
      recoveryLabel = 'Recuperare foarte puțin probabilă'
      recoveryEmoji = '🔴'
    }

    const { count: reportCount } = await supabase
      .from('scam_reports')
      .select('*', { count: 'exact', head: true })
      .ilike('link', `%${iban}%`)

    return charge({
      iban: formatIBAN(iban),
      raw: iban,
      valid: true,
      countryCode,
      countryName: COUNTRY_NAMES[countryCode] ?? countryCode,
      bankCode,
      bankName,
      isSepa,
      recoveryLevel,
      recoveryLabel,
      recoveryEmoji,
      communityReports: reportCount ?? 0,
    })

  } catch (err) {
    console.error('Check IBAN error:', err)
    return Response.json({ error: 'Eroare server' }, { status: 500 })
  }
}
