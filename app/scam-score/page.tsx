'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import { supabase } from '@/lib/supabase'

type Ans = { t: string; p: number }
type Q = { q: string; a: Ans[]; rec: string }
type Audience = 'child' | 'adult' | 'elderly' | 'company'
type Dept = 'general' | 'finance' | 'hr' | 'it' | 'sales' | 'management'
type Screen = 'audience' | 'department' | 'quiz' | 'result'

const NAVY = '#0F172A'
const ACCENT = '#60A5FA'

// ---------- Recomandări generice (umplutură când sunt <3 puncte slabe) ----------
const GENERIC_RECS = [
  'Activează autentificarea în doi pași (2FA) pe email și pe contul bancar.',
  'Verifică gratuit orice site, număr sau IBAN suspect pe eVerify înainte să acționezi.',
  'Nu te grăbi niciodată: presiunea și urgența sunt semnul clasic al fraudei.',
  'Folosește parole unice cu un manager de parole gratuit (ex. Bitwarden).',
]

// ---------- ADULȚI (10 întrebări, max 10) ----------
const REC_BANK = 'Regula de aur: nicio bancă sau instituție nu cere coduri/parole prin telefon sau SMS. Orice grabă = oprește-te.'
const REC_PASS = 'Folosește parole unice + un manager gratuit (ex. Bitwarden) și activează 2FA peste tot.'

const ADULT_Q: Q[] = [
  { q: 'Primești un SMS: „Coletul tău e blocat, plătește 2 lei taxa" cu un link. Ce faci?',
    a: [{ t: 'Îl șterg — curierii nu cer plăți prin SMS cu link', p: 0 }, { t: 'Intru separat pe site-ul/app-ul curierului ca să verific', p: 2 }, { t: 'Apăs linkul să văd despre ce e', p: 9 }, { t: 'Plătesc, să nu pierd coletul', p: 10 }],
    rec: REC_BANK },
  { q: 'Te sună cineva „de la bancă" și cere codul primit prin SMS ca să „oprească o fraudă". Ce faci?',
    a: [{ t: 'Închid — banca nu cere niciodată coduri', p: 0 }, { t: 'Ezit, dar nu dau codul', p: 4 }, { t: 'Întreb detalii, apoi poate dau', p: 8 }, { t: 'Dau codul, vor să mă ajute', p: 10 }],
    rec: REC_BANK },
  { q: 'Înainte să introduci parola pe un site, te uiți la adresa exactă din bara browserului?',
    a: [{ t: 'Mereu, verific fiecare literă', p: 0 }, { t: 'Doar dacă ceva mi se pare ciudat', p: 4 }, { t: 'Rar', p: 8 }, { t: 'Nu știu la ce să mă uit', p: 10 }],
    rec: 'Verifică adresa exactă a site-ului pe eVerify înainte să introduci date.' },
  { q: 'Folosești aceeași parolă (sau variații) pe mai multe conturi?',
    a: [{ t: 'Nu, fiecare cont are parolă unică (am manager de parole)', p: 0 }, { t: 'Câteva variații ale aceleiași parole', p: 5 }, { t: 'Da, cam aceeași peste tot', p: 10 }],
    rec: REC_PASS },
  { q: 'Ai autentificare în doi pași (2FA / cod la logare) pe email și pe bancă?',
    a: [{ t: 'Da, pe ambele', p: 0 }, { t: 'Doar pe unul', p: 5 }, { t: 'Nu / nu știu ce e', p: 10 }],
    rec: REC_PASS },
  { q: 'Vezi un produs scump redus 90% pe un magazin de care n-ai auzit. Reacția?',
    a: [{ t: 'Verific magazinul: recenzii, date firmă, vechimea site-ului', p: 0 }, { t: 'Sunt sceptic, probabil renunț', p: 3 }, { t: 'Mă tentează, e ofertă bună', p: 8 }, { t: 'Cumpăr repede, până nu se termină', p: 10 }],
    rec: 'Ofertele imposibile sunt momeală. Verifică magazinul pe eVerify înainte de plată.' },
  { q: 'Un mesaj spune că ai câștigat un telefon/voucher și trebuie doar să dai click. Ce faci?',
    a: [{ t: 'Îl ignor / îl raportez ca spam', p: 0 }, { t: 'Mă uit din curiozitate', p: 6 }, { t: 'Dau click să văd ce am câștigat', p: 9 }, { t: 'Completez datele ca să primesc premiul', p: 10 }],
    rec: REC_BANK },
  { q: 'Cumperi de pe OLX/Marketplace de la un necunoscut. Cum plătești?',
    a: [{ t: 'Plată la livrare sau verific întâi vânzătorul (IBAN/telefon)', p: 0 }, { t: 'De obicei la livrare, dar nu mereu', p: 4 }, { t: 'Plătesc în avans dacă prețul e bun', p: 9 }, { t: 'Trimit banii repede ca să nu-mi scape', p: 10 }],
    rec: 'Verifică IBAN-ul sau telefonul vânzătorului pe eVerify și preferă plata la livrare.' },
  { q: 'Cât din viața ta (locație, planuri, achiziții) e public pe rețele?',
    a: [{ t: 'Foarte puțin / cont privat', p: 0 }, { t: 'Lucruri generale', p: 4 }, { t: 'Destul de mult', p: 8 }, { t: 'Aproape tot, în timp real', p: 10 }],
    rec: 'Restrânge ce postezi public — escrocii își construiesc atacul din ce afli despre tine.' },
  { q: 'Cât de des actualizezi telefonul/calculatorul (sistem + aplicații)?',
    a: [{ t: 'Automat, mereu la zi', p: 0 }, { t: 'Când îmi aduc aminte', p: 5 }, { t: 'Rar, amân mereu', p: 9 }, { t: 'Niciodată', p: 10 }],
    rec: 'Pune actualizările pe automat; multe atacuri folosesc găuri deja reparate.' },
]

// ---------- COPII (8 întrebări) ----------
const CHILD_Q: Q[] = [
  { q: 'Un jucător necunoscut din joc îți zice că-ți dă skin-uri/V-bucks gratis dacă-i dai parola contului. Ce faci?',
    a: [{ t: 'Nu dau parola nimănui, niciodată', p: 0 }, { t: 'Întreb un părinte', p: 3 }, { t: 'Poate, dacă pare de treabă', p: 10 }, { t: 'Da, vreau skin-urile', p: 12 }],
    rec: 'Nu da niciodată parola nimănui, nici pentru skin-uri sau V-bucks gratis. Parola e doar a ta.' },
  { q: 'Cineva pe care nu-l cunoști îți scrie și vrea să fiți „prieteni secreți", să nu spui părinților. Ce faci?',
    a: [{ t: 'Spun imediat unui părinte/adult', p: 0 }, { t: 'Blochez persoana', p: 1 }, { t: 'Răspund, dar nu spun nimic', p: 11 }, { t: 'Vorbesc cu el, pare prietenos', p: 12 }],
    rec: 'Dacă un necunoscut vrea „prietenie secretă", spune imediat unui părinte. Secretele cu adulți necunoscuți nu sunt ok.' },
  { q: 'Un link spune „Ai câștigat un telefon! Apasă aici!". Ce faci?',
    a: [{ t: 'Nu apăs, sigur e o păcăleală', p: 0 }, { t: 'Întreb un adult', p: 3 }, { t: 'Apăs să văd', p: 11 }, { t: 'Apăs și scriu datele', p: 12 }],
    rec: '„Ai câștigat!" este aproape mereu o păcăleală. Nu apăsa pe link — întreabă un adult.' },
  { q: 'Un „prieten" îți cere pe chat o poză cu tine sau adresa de acasă. Ce faci?',
    a: [{ t: 'Nu trimit așa ceva', p: 0 }, { t: 'Întreb mama/tata', p: 2 }, { t: 'Trimit dacă e prieten', p: 11 }, { t: 'Trimit, nu e mare lucru', p: 12 }],
    rec: 'Nu trimite poze cu tine sau adresa de acasă pe chat. Întreabă mereu mama sau tata.' },
  { q: 'Vrei să descarci un joc gratis de pe un site ciudat. Ce faci?',
    a: [{ t: 'Întreb un adult întâi', p: 0 }, { t: 'Doar din magazinul oficial (App Store/Google Play)', p: 1 }, { t: 'Descarc, vreau jocul', p: 11 }, { t: 'Apăs pe tot ca să meargă', p: 12 }],
    rec: 'Descarcă jocuri doar din magazinul oficial (App Store / Google Play) și întreabă un adult.' },
  { q: 'Cineva îți spune lucruri urâte sau te sperie online. Ce faci?',
    a: [{ t: 'Spun unui adult de încredere', p: 0 }, { t: 'Blochez și nu răspund', p: 2 }, { t: 'Mă cert cu el', p: 9 }, { t: 'Nu spun nimănui, mi-e rușine', p: 12 }],
    rec: 'Dacă cineva te jignește sau te sperie online, spune unui adult de încredere — nu e vina ta.' },
  { q: 'Un mesaj zice „contul tău se închide, scrie parola aici acum!". Ce faci?',
    a: [{ t: 'Nu scriu parola, e o capcană', p: 0 }, { t: 'Întreb un adult', p: 3 }, { t: 'Scriu, să nu pierd contul', p: 12 }],
    rec: 'Niciun site adevărat nu-ți cere parola printr-un mesaj grăbit. Nu o scrie — întreabă un adult.' },
  { q: 'Cât de des vorbești cu părinții despre ce faci pe internet?',
    a: [{ t: 'Des, le spun ce văd', p: 0 }, { t: 'Câteodată', p: 5 }, { t: 'Aproape niciodată', p: 10 }, { t: 'Nu vor să știe ce fac', p: 12 }],
    rec: 'Vorbește des cu părinții despre ce faci pe internet — ei te pot ajuta când ceva pare ciudat.' },
]

// ---------- VÂRSTNICI (8 întrebări) ----------
const ELDERLY_Q: Q[] = [
  { q: 'Te sună cineva și spune că e nepotul/ruda ta, are o urgență și are nevoie urgent de bani. Ce faci?',
    a: [{ t: 'Închid și sun eu direct ruda la numărul ei știut', p: 0 }, { t: 'Întreb detalii pe care doar ruda le-ar ști', p: 2 }, { t: 'Mă panichez, dar verific întâi', p: 6 }, { t: 'Trimit banii imediat, e o urgență', p: 12 }],
    rec: 'Dacă vă sună „o rudă la nevoie", închideți și sunați dvs. ruda la numărul ei cunoscut. Escrocii pot imita vocea.' },
  { q: 'Un mesaj sau apel spune că ai câștigat o sumă de bani / un premiu, dar trebuie să plătești o taxă întâi. Ce faci?',
    a: [{ t: 'Ignor — premiile reale nu cer bani înainte', p: 0 }, { t: 'Întreb un membru al familiei', p: 2 }, { t: 'Sunt curios, întreb cât e taxa', p: 9 }, { t: 'Plătesc taxa ca să primesc premiul', p: 12 }],
    rec: 'Premiile reale nu cer bani în avans. Dacă vi se cere o taxă pentru un câștig, este înșelătorie.' },
  { q: 'Te sună „de la bancă" și cer parola sau codul primit pe telefon. Ce faci?',
    a: [{ t: 'Închid — banca nu cere niciodată asta', p: 0 }, { t: 'Spun că merg personal la bancă să verific', p: 2 }, { t: 'Ezit, dar nu spun codul', p: 7 }, { t: 'Le dau codul, par de la bancă', p: 12 }],
    rec: 'Banca NU cere niciodată parola sau codul prin telefon. Închideți și mergeți personal la bancă.' },
  { q: 'Primești un mesaj că ai o factură neplătită sau un colet, cu un link. Ce faci?',
    a: [{ t: 'Nu apăs linkul, sun la firmă la numărul oficial', p: 0 }, { t: 'Întreb pe cineva din familie', p: 3 }, { t: 'Apăs linkul să văd', p: 11 }, { t: 'Plătesc prin link, să nu am probleme', p: 12 }],
    rec: 'Nu apăsați linkurile din SMS-uri. Sunați firma la numărul oficial de pe documentele dvs.' },
  { q: 'Cineva la ușă sau la telefon îți oferă o investiție sigură cu câștig mare și rapid. Ce faci?',
    a: [{ t: 'Refuz — câștig „sigur și mare" = înșelătorie', p: 0 }, { t: 'Cer timp și mă sfătuiesc cu familia', p: 3 }, { t: 'Mă interesează, ascult mai departe', p: 9 }, { t: 'Investesc, e o ocazie bună', p: 12 }],
    rec: '„Câștig sigur și mare" = înșelătorie. Cereți timp și discutați cu familia înainte de orice investiție.' },
  { q: 'Ai pe cineva de încredere (familie) cu care vorbești înainte de decizii cu bani pe telefon/internet?',
    a: [{ t: 'Da, întreb mereu înainte', p: 0 }, { t: 'Uneori', p: 5 }, { t: 'Rar', p: 9 }, { t: 'Mă descurc singur(ă)', p: 11 }],
    rec: 'Stabiliți o persoană de încredere (din familie) pe care o sunați înainte de orice decizie cu bani.' },
  { q: 'Știi că banca, poliția sau o instituție NU îți va cere niciodată parole sau coduri prin telefon?',
    a: [{ t: 'Da, știu sigur', p: 0 }, { t: 'Cam știu, dar nu sunt sigur(ă)', p: 6 }, { t: 'Nu știam asta', p: 12 }],
    rec: 'Rețineți: nicio bancă, poliție sau instituție nu vă cere parole sau coduri prin telefon.' },
  { q: 'Dacă te grăbește cineva („acum, imediat, altfel pierzi totul"), ce faci?',
    a: [{ t: 'Mă opresc — graba e semn de înșelătorie', p: 0 }, { t: 'Cer timp de gândire', p: 3 }, { t: 'Mă stresez și acționez repede', p: 11 }, { t: 'Fac ce zice, ca să nu pierd', p: 12 }],
    rec: 'Când cineva vă grăbește („acum, imediat"), opriți-vă. Graba este semnul clasic al fraudei.' },
]

// ---------- COMPANII — bloc general (7 întrebări, max 10) ----------
const COMPANY_GENERAL_Q: Q[] = [
  { q: 'Primești un email de la „CEO/șef" care cere urgent o plată sau date confidențiale, „strict secret, nu spune nimănui". Ce faci?',
    a: [{ t: 'Verific pe alt canal (sun/Teams) înainte de orice', p: 0 }, { t: 'Răspund cerând confirmare', p: 3 }, { t: 'Mă conformez, e de la șef', p: 9 }, { t: 'Execut imediat, e urgent', p: 10 }],
    rec: 'Confirmă pe alt canal (telefon/Teams) orice cerere urgentă de plată sau date „de la șef", oricât de presantă.' },
  { q: 'Un email cere să dai click pe un link și să te „reautentifici" la un cont de muncă. Ce faci?',
    a: [{ t: 'Nu dau click; merg manual la site-ul oficial', p: 0 }, { t: 'Verific adresa expeditorului întâi', p: 3 }, { t: 'Dau click dacă pare de la firmă', p: 9 }, { t: 'Mă loghez direct prin link', p: 10 }],
    rec: 'Nu te reautentifica prin linkuri din email. Mergi manual la site-ul oficial al serviciului.' },
  { q: 'Folosești parole diferite pentru conturile de muncă și ai 2FA activat?',
    a: [{ t: 'Da, parole unice + 2FA peste tot', p: 0 }, { t: 'Parțial', p: 5 }, { t: 'Aceeași parolă, fără 2FA', p: 10 }],
    rec: 'Folosește parole unice pentru conturile de muncă și activează 2FA peste tot.' },
  { q: 'Găsești un stick USB necunoscut în birou/parcare. Ce faci?',
    a: [{ t: 'Îl predau la IT, nu îl bag în calculator', p: 0 }, { t: 'Îl las acolo', p: 2 }, { t: 'Îl bag să văd al cui e', p: 10 }],
    rec: 'Nu conecta stickuri USB găsite. Predă-le la IT — pot conține malware.' },
  { q: 'Un „furnizor" trimite o factură cu IBAN schimbat față de cel obișnuit. Ce faci?',
    a: [{ t: 'Sun furnizorul la numărul cunoscut ca să confirm', p: 0 }, { t: 'Întreb colegii/contabilitatea', p: 3 }, { t: 'Plătesc, e de la furnizorul nostru', p: 10 }],
    rec: 'La orice schimbare de IBAN al unui furnizor, sună-l la numărul cunoscut ca să confirmi.' },
  { q: 'Lucrezi de pe laptopul de muncă pe Wi-Fi public (cafenea, aeroport). Ce faci?',
    a: [{ t: 'Folosesc VPN-ul firmei mereu', p: 0 }, { t: 'Doar pentru lucruri sensibile', p: 5 }, { t: 'Mă conectez normal, fără VPN', p: 10 }],
    rec: 'Pe Wi-Fi public folosește mereu VPN-ul firmei pentru orice activitate de muncă.' },
  { q: 'Dacă observi ceva suspect (email ciudat, cont compromis), știi cui raportezi și o faci?',
    a: [{ t: 'Da, raportez imediat la IT/securitate', p: 0 }, { t: 'Aș întreba un coleg', p: 5 }, { t: 'Nu știu cui / probabil ignor', p: 10 }],
    rec: 'Învață cui raportezi incidentele (IT/securitate) și fă-o imediat ce observi ceva suspect.' },
]

const MODULE_REC: Record<Exclude<Dept, 'general'>, string> = {
  finance: 'Implementează dublă-aprobare pentru plăți și confirmă orice schimbare de IBAN pe canal separat.',
  hr: 'Scanează atașamentele din aplicații și confirmă direct cu angajatul orice schimbare de cont salarial.',
  it: 'Separă conturile admin, activează 2FA pe ele și testează regulat backup-urile izolate.',
  sales: 'Verifică identitatea clienților pe canal oficial înainte de date/modificări sensibile.',
  management: 'Ești țintă de whaling: confirmă pe canal secundar orice cerere financiară făcută în numele tău.',
}

const MODULE_Q: Record<Exclude<Dept, 'general'>, { q: string; a: Ans[] }[]> = {
  finance: [
    { q: 'Ai un proces de dublă-aprobare pentru plăți sau modificări de IBAN?', a: [{ t: 'Da, mereu, două persoane', p: 0 }, { t: 'Uneori', p: 5 }, { t: 'Nu, decid singur', p: 10 }] },
    { q: 'O cerere de plată urgentă „în afara procedurii" de la conducere — ce faci?', a: [{ t: 'Refuz până trece prin proces', p: 0 }, { t: 'Verific telefonic', p: 3 }, { t: 'Execut, e urgent', p: 10 }] },
    { q: 'Verifici schimbările de cont bancar ale furnizorilor pe canal separat?', a: [{ t: 'Mereu', p: 0 }, { t: 'Uneori', p: 5 }, { t: 'Plătesc pe ce scrie în email', p: 10 }] },
  ],
  hr: [
    { q: 'Deschizi atașamente din CV-uri/aplicații de la candidați necunoscuți?', a: [{ t: 'Doar în mediu sigur / le scanez', p: 0 }, { t: 'De obicei direct', p: 6 }, { t: 'Mereu direct', p: 10 }] },
    { q: 'Cereri de schimbare a contului unde se virează salariul unui angajat — verifici?', a: [{ t: 'Confirm direct cu angajatul', p: 0 }, { t: 'Întreb pe email', p: 5 }, { t: 'Modific la cerere', p: 10 }] },
    { q: 'Datele personale ale angajaților sunt accesate/trimise doar pe canale securizate?', a: [{ t: 'Mereu', p: 0 }, { t: 'De obicei', p: 5 }, { t: 'Le trimit pe email normal', p: 10 }] },
  ],
  it: [
    { q: 'Conturile cu privilegii (admin) au 2FA și sunt separate de cele zilnice?', a: [{ t: 'Da, complet separat', p: 0 }, { t: 'Parțial', p: 5 }, { t: 'Folosesc admin pentru tot', p: 10 }] },
    { q: 'Aplici la timp patch-urile de securitate critice?', a: [{ t: 'Imediat / automat', p: 0 }, { t: 'Cu întârziere', p: 6 }, { t: 'Rar', p: 10 }] },
    { q: 'Ai backup-uri testate și izolate (împotriva ransomware)?', a: [{ t: 'Da, testate regulat', p: 0 }, { t: 'Există dar netestate', p: 6 }, { t: 'Nu', p: 10 }] },
  ],
  sales: [
    { q: 'Verifici identitatea unui „client" care cere date sau modificări sensibile?', a: [{ t: 'Mereu, pe canal oficial', p: 0 }, { t: 'Uneori', p: 5 }, { t: 'Am încredere', p: 10 }] },
    { q: 'Dai click pe linkuri/atașamente din emailuri de la „clienți" noi?', a: [{ t: 'Verific întâi', p: 0 }, { t: 'De obicei deschid', p: 6 }, { t: 'Mereu', p: 10 }] },
    { q: 'Datele clienților le partajezi doar prin sistemele aprobate?', a: [{ t: 'Da', p: 0 }, { t: 'Uneori pe email', p: 5 }, { t: 'Cum e mai rapid', p: 10 }] },
  ],
  management: [
    { q: 'Știi că ești o țintă preferată pentru fraude personalizate (whaling)?', a: [{ t: 'Da, sunt foarte atent', p: 0 }, { t: 'Oarecum', p: 5 }, { t: 'Nu mă gândisem', p: 10 }] },
    { q: 'Confirmi pe canal secundar cererile financiare făcute în numele tău?', a: [{ t: 'Am procedură clară', p: 0 }, { t: 'Uneori', p: 5 }, { t: 'Mă bazez pe email', p: 10 }] },
    { q: 'Separi dispozitivele/conturile personale de cele de muncă?', a: [{ t: 'Da', p: 0 }, { t: 'Parțial', p: 5 }, { t: 'Le amestec', p: 10 }] },
  ],
}

function buildQuestions(aud: Audience | null, dept: Dept): Q[] {
  if (!aud) return []
  if (aud === 'adult') return ADULT_Q
  if (aud === 'child') return CHILD_Q
  if (aud === 'elderly') return ELDERLY_Q
  // company
  if (dept === 'general') return COMPANY_GENERAL_Q
  const mod = MODULE_Q[dept].map((m) => ({ ...m, rec: MODULE_REC[dept] }))
  return [...COMPANY_GENERAL_Q, ...mod]
}

type Cat = { emoji: string; color: string; title: string; desc: string }
function getCategory(aud: Audience, score: number): Cat {
  if (aud === 'child') {
    if (score <= 25) return { emoji: '🟢', color: '#22c55e', title: 'Ești super atent!', desc: 'Știi să te ferești de capcane.' }
    if (score <= 55) return { emoji: '🟡', color: '#eab308', title: 'E bine, dar mai ai de învățat', desc: 'Mai sunt câteva trucuri de știut. Întreabă mereu un adult.' }
    return { emoji: '🔴', color: '#ef4444', title: 'Atenție!', desc: 'Unele răspunsuri te pot pune în pericol. Vorbește cu un părinte despre asta.' }
  }
  if (aud === 'elderly') {
    if (score <= 25) return { emoji: '🟢', color: '#22c55e', title: 'Foarte bine', desc: 'Aveți reflexe corecte și e greu să fiți păcălit(ă).' }
    if (score <= 55) return { emoji: '🟡', color: '#eab308', title: 'Bine, dar atenție', desc: 'Regula de aur: la orice grabă sau cerere de bani — opriți-vă și sunați un apropiat.' }
    return { emoji: '🔴', color: '#ef4444', title: 'Atenție mărită', desc: 'Vă recomandăm să discutați cu un membru al familiei înainte de orice decizie cu bani la telefon sau pe internet.' }
  }
  if (aud === 'company') {
    if (score <= 20) return { emoji: '🟢', color: '#22c55e', title: 'Igienă de securitate solidă', desc: 'Mențineți training-ul periodic.' }
    if (score <= 45) return { emoji: '🟡', color: '#eab308', title: 'Există vectori de atac deschiși', desc: 'Recomandăm training pe punctele slabe.' }
    if (score <= 70) return { emoji: '🟠', color: '#f97316', title: 'Risc ridicat', desc: 'Mai multe practici expun firma la fraude costisitoare — prioritizați remedierea.' }
    return { emoji: '🔴', color: '#ef4444', title: 'Risc critic', desc: 'Firma e foarte expusă la fraude cu pierderi greu de recuperat. Acțiune urgentă recomandată.' }
  }
  // adult
  if (score <= 20) return { emoji: '🟢', color: '#22c55e', title: 'Excelent', desc: 'Ai reflexe bune și ești greu de păcălit.' }
  if (score <= 45) return { emoji: '🟡', color: '#eab308', title: 'Bine, dar ai câteva puncte slabe', desc: 'Atenție la recomandările de mai jos.' }
  if (score <= 70) return { emoji: '🟠', color: '#f97316', title: 'Risc ridicat', desc: 'Mai multe obiceiuri te expun la fraude — schimbă-le.' }
  return { emoji: '🔴', color: '#ef4444', title: 'Risc critic', desc: 'Ești foarte expus la scam-uri. Acționează pe recomandările de mai jos.' }
}

const AUDIENCES: { key: Audience; emoji: string; title: string; sub: string }[] = [
  { key: 'child', emoji: '👦', title: 'Copil', sub: '8–14 ani' },
  { key: 'adult', emoji: '🧑', title: 'Adult', sub: 'Publicul general' },
  { key: 'elderly', emoji: '👵', title: 'Vârstnic', sub: '65+' },
  { key: 'company', emoji: '🏢', title: 'Companie', sub: 'Angajați' },
]

const DEPTS: { key: Dept; emoji: string; title: string }[] = [
  { key: 'general', emoji: '👤', title: 'Orice angajat' },
  { key: 'finance', emoji: '💰', title: 'Finanțe / Contabilitate' },
  { key: 'hr', emoji: '🧑‍💼', title: 'HR / Resurse Umane' },
  { key: 'it', emoji: '💻', title: 'IT / Administrare' },
  { key: 'sales', emoji: '📞', title: 'Vânzări / Relații Clienți' },
  { key: 'management', emoji: '🏛️', title: 'Conducere / Management' },
]

export default function ScamScore() {
  const [screen, setScreen] = useState<Screen>('audience')
  const [audience, setAudience] = useState<Audience | null>(null)
  const [dept, setDept] = useState<Dept>('general')
  const [step, setStep] = useState(0)
  const [choices, setChoices] = useState<(number | null)[]>([])
  const [barWidth, setBarWidth] = useState(0)
  const sentRef = useRef(false)

  const questions = useMemo(() => buildQuestions(audience, dept), [audience, dept])

  const { score } = useMemo(() => {
    const maxRaw = questions.reduce((s, q) => s + Math.max(...q.a.map((x) => x.p)), 0)
    const raw = questions.reduce((s, q, i) => {
      const ci = choices[i]
      return s + (ci != null && q.a[ci] ? q.a[ci].p : 0)
    }, 0)
    return { score: maxRaw > 0 ? Math.round((raw / maxRaw) * 100) : 0 }
  }, [questions, choices])

  const cat = audience ? getCategory(audience, score) : null

  const recommendations = useMemo(() => {
    if (!audience) return []
    const weakThreshold = audience === 'child' || audience === 'elderly' ? 9 : 8
    const weak = questions
      .map((q, i) => {
        const ci = choices[i]
        return { rec: q.rec, p: ci != null && q.a[ci] ? q.a[ci].p : -1 }
      })
      .filter((w) => w.p >= weakThreshold)
      .sort((a, b) => b.p - a.p)
    const recs: string[] = []
    for (const w of weak) if (!recs.includes(w.rec)) recs.push(w.rec)
    for (const g of GENERIC_RECS) {
      if (recs.length >= 3) break
      if (!recs.includes(g)) recs.push(g)
    }
    return recs.slice(0, 3)
  }, [questions, choices, audience])

  // Animație bară scor
  useEffect(() => {
    if (screen === 'result') {
      const t = setTimeout(() => setBarWidth(score), 80)
      return () => clearTimeout(t)
    }
    setBarWidth(0)
  }, [screen, score])

  // Tracking anonim Supabase (o singură dată per rezultat)
  useEffect(() => {
    if (screen === 'result' && audience && !sentRef.current) {
      sentRef.current = true
      supabase
        .from('scam_score_results')
        .insert({ public_type: audience, score, created_at: new Date().toISOString() })
        .then(
          () => {},
          () => {}
        )
    }
  }, [screen, audience, score])

  const pickAudience = (a: Audience) => {
    setAudience(a)
    if (a === 'company') {
      setScreen('department')
      return
    }
    setDept('general')
    setChoices(new Array(buildQuestions(a, 'general').length).fill(null))
    setStep(0)
    setScreen('quiz')
  }

  const pickDept = (d: Dept) => {
    setDept(d)
    setChoices(new Array(buildQuestions('company', d).length).fill(null))
    setStep(0)
    setScreen('quiz')
  }

  const choose = (idx: number) => {
    setChoices((prev) => {
      const n = [...prev]
      n[step] = idx
      return n
    })
  }

  const next = () => {
    if (step < questions.length - 1) setStep(step + 1)
    else setScreen('result')
  }

  const back = () => {
    if (step > 0) setStep(step - 1)
    else {
      // înapoi la selector
      setScreen(audience === 'company' ? 'department' : 'audience')
    }
  }

  const restart = () => {
    sentRef.current = false
    setScreen('audience')
    setAudience(null)
    setDept('general')
    setChoices([])
    setStep(0)
    setBarWidth(0)
  }

  // ---------- Share ----------
  const shareUrl = 'https://everify.ro/scam-score'
  const shareText =
    audience === 'company'
      ? 'Cât de pregătită e echipa ta la scam-uri? Testează-te pe eVerify.'
      : `Am luat ${score}/100 la testul de vulnerabilitate la scam-uri pe eVerify. Tu cât iei?`
  const waHref = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`

  const wrap: React.CSSProperties = {
    minHeight: '100vh',
    background: NAVY,
    color: '#ffffff',
    fontFamily: 'var(--font-plus-jakarta), sans-serif',
    padding: '56px 20px 80px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }

  // ---------- AUDIENCE ----------
  if (screen === 'audience') {
    return (
      <div style={wrap}>
        <div className="ss-fade" style={{ width: '100%', maxWidth: 560, textAlign: 'center' }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>🛡️</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 10, lineHeight: 1.2 }}>
            Cât de vulnerabil ești la <span style={{ color: ACCENT }}>scam-uri</span>?
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, marginBottom: 36, lineHeight: 1.5 }}>
            Răspunde la câteva întrebări și află scorul tău de vulnerabilitate. Durează sub 2 minute.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Pentru cine faci testul?</p>
          <div className="ss-grid-2">
            {AUDIENCES.map((a) => (
              <button key={a.key} className="ss-card" onClick={() => pickAudience(a.key)}>
                <span style={{ fontSize: 30 }}>{a.emoji}</span>
                <span>
                  <span style={{ display: 'block', fontWeight: 700, fontSize: 16 }}>{a.title}</span>
                  <span style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{a.sub}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ---------- DEPARTMENT (company) ----------
  if (screen === 'department') {
    return (
      <div style={wrap}>
        <div className="ss-fade" style={{ width: '100%', maxWidth: 560, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>Pentru ce departament?</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 32, lineHeight: 1.5 }}>
            Toți angajații răspund la un bloc general. Departamentele expuse au întrebări suplimentare.
          </p>
          <div className="ss-grid-2">
            {DEPTS.map((d) => (
              <button key={d.key} className="ss-card" onClick={() => pickDept(d.key)}>
                <span style={{ fontSize: 26 }}>{d.emoji}</span>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{d.title}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => { setAudience(null); setScreen('audience') }}
            style={{ marginTop: 24, background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            ← Înapoi la public
          </button>
        </div>
      </div>
    )
  }

  // ---------- QUIZ ----------
  if (screen === 'quiz') {
    const cur = questions[step]
    const selected = choices[step]
    return (
      <div style={wrap}>
        <div style={{ width: '100%', maxWidth: 560 }}>
          {/* Progress segments */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {questions.map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  background: i < step ? 'rgba(255,255,255,0.4)' : i === step ? ACCENT : 'rgba(255,255,255,0.15)',
                  transition: 'background 0.3s ease',
                }}
              />
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 28, fontWeight: 600 }}>
            Întrebarea {step + 1} din {questions.length}
          </p>

          {/* Question + answers — re-animate on step change via key */}
          <div key={step} className="ss-fade">
            <h2 style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.45, marginBottom: 28, maxWidth: 560 }}>{cur.q}</h2>
            <div className="ss-grid-2" style={{ marginBottom: 28 }}>
              {cur.a.map((ans, i) => (
                <button key={i} className={`ss-card${selected === i ? ' ss-selected' : ''}`} onClick={() => choose(i)}>
                  {ans.t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <button
              onClick={back}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', padding: '8px 4px' }}
            >
              ← Înapoi
            </button>
            <button
              onClick={next}
              disabled={selected == null}
              style={{
                background: selected == null ? 'rgba(255,255,255,0.08)' : `linear-gradient(135deg, ${ACCENT}, #6366f1)`,
                color: selected == null ? 'rgba(255,255,255,0.4)' : '#fff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: selected == null ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                transition: 'background 0.2s ease',
              }}
            >
              {step < questions.length - 1 ? 'Continuă ❯' : 'Vezi rezultatul ❯'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---------- RESULT ----------
  return (
    <div style={wrap}>
      <div className="ss-fade" style={{ width: '100%', maxWidth: 560, textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
          Scorul tău de vulnerabilitate
        </p>
        <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1, color: cat?.color, marginBottom: 4 }}>
          {score}
          <span style={{ fontSize: 24, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>/100</span>
        </div>

        {/* Animated bar */}
        <div style={{ background: 'rgba(255,255,255,0.08)', height: 12, borderRadius: 8, overflow: 'hidden', margin: '20px 0 24px' }}>
          <div
            style={{
              width: `${barWidth}%`,
              height: '100%',
              borderRadius: 8,
              background: cat?.color,
              transition: 'width 1.2s ease-out',
            }}
          />
        </div>

        <div style={{ fontSize: 28, marginBottom: 6 }}>{cat?.emoji}</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: cat?.color }}>{cat?.title}</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55, marginBottom: 32 }}>{cat?.desc}</p>

        {/* Recommendations */}
        <div style={{ textAlign: 'left', marginBottom: 32 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 14, textAlign: 'center' }}>
            🎯 Recomandările tale personalizate
          </p>
          {recommendations.map((r, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: 10,
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              <span style={{ color: ACCENT, fontWeight: 800, flexShrink: 0 }}>{i + 1}.</span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{r}</span>
            </div>
          ))}
        </div>

        {/* Share */}
        <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>Distribuie scorul tău</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: '#25D366', color: '#fff', padding: '11px 22px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            💬 WhatsApp
          </a>
          <a
            href={fbHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: '#1877F2', color: '#fff', padding: '11px 22px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            📘 Facebook
          </a>
        </div>

        {/* CTA secundar */}
        <a
          href="/check-url"
          style={{ display: 'block', background: `linear-gradient(135deg, ${ACCENT}, #6366f1)`, color: '#fff', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none', marginBottom: 12 }}
        >
          Verifică gratuit un site suspect pe eVerify ❯
        </a>

        <button
          onClick={restart}
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}
        >
          ↻ Ia testul din nou
        </button>
      </div>
    </div>
  )
}
