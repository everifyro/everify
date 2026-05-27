'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const scamTypes = [
  {
    id: 1,
    title: 'Fraudă pe OLX / platforme de anunțuri cu link fals de curier',
    englishTitle: 'OLX Courier Scam',
    emoji: '📦',
    shortDesc: 'Un cumpărător fals trimite un link de curier sau de plată și solicită datele cardului bancar.',
    fullDesc: 'Escrocul contactează vânzătorul pe OLX sau pe altă platformă de anunțuri, pretinzând că dorește să achiziționeze produsul. Trimite un link fals care imită Fan Courier, Sameday, Cargus sau DPD, solicitând introducerea datelor cardului pentru "ridicarea banilor". Odată introduse datele, contul bancar este golit.',
    semne: ['Link extern în afara platformei OLX', 'Urgență artificială ("trebuie să confirmi acum")', 'Cumpărătorul nu dorește întâlnire fizică', 'Link-ul nu provine de pe domeniul oficial al curierului'],
    ceFaci: ['Nu accesați niciun link primit prin mesaje private', 'Folosiți exclusiv sistemul de plată oficial OLX', 'Verificați adresa URL înainte de a introduce orice date', 'Raportați anunțul și blocați utilizatorul suspect'],
    raporteaza: ['Poliția Română: 112 sau sesizare online pe politiaromana.ro', 'DNSC: 1911 sau pnrisc.dnsc.ro', 'Banca dumneavoastră, dacă ați furnizat date bancare']
  },
  {
    id: 2,
    title: 'Magazine online false sau care comercializează produse contrafăcute',
    englishTitle: 'Fake Online Store / Counterfeit Products',
    emoji: '🛒',
    shortDesc: 'Plătiți, primiți produse contrafăcute sau nu primiți nimic. Site-ul are sediul în străinătate, returul este imposibil.',
    fullDesc: 'Site-uri care imită magazine legitime sau oferă produse la prețuri extrem de mici. După efectuarea plății, fie nu se livrează nimic, fie se livrează produse contrafăcute (medicamente, produse de îngrijire, electronice). Sediul companiei este în Bulgaria, China sau altă țară, iar returul este practic imposibil sau extrem de costisitor.',
    semne: ['Prețuri mult sub piață (reduceri de 70-90%)', 'Site creat recent (sub 3 luni)', 'Lipsesc date fiscale reale (CUI, adresă verificabilă)', 'Plata se acceptă doar prin transfer bancar sau criptomonede', 'Recenzii false sau absente'],
    ceFaci: ['Verificați site-ul pe everify.ro/check-url înainte de cumpărare', 'Căutați CUI-ul companiei pe portalul ANAF', 'Plătiți exclusiv prin card bancar (protecție prin chargeback)', 'Evitați transferurile bancare directe către persoane fizice'],
    raporteaza: ['ANPC: 021.9551 sau anpc.ro', 'Poliția Română: sesizare online pe politiaromana.ro', 'Banca dumneavoastră pentru inițierea procedurii de chargeback']
  },
  {
    id: 3,
    title: 'Mesaj ANAF fals cu datorii sau rambursări',
    englishTitle: 'ANAF Scam',
    emoji: '🏛️',
    shortDesc: 'Email sau SMS fals în numele ANAF cu link pentru plata unor datorii sau primirea unei rambursări fiscale.',
    fullDesc: 'Escrocii trimit mesaje false care imită comunicările oficiale ale ANAF, notificând victima despre o datorie fiscală urgentă sau o rambursare de impozit. Linkul din mesaj conduce la un site fals care colectează datele bancare sau personale ale victimei.',
    semne: ['ANAF nu comunică prin SMS sau WhatsApp', 'Link-ul nu este pe domeniul oficial anaf.ro', 'Urgență artificială și amenințări cu penalități', 'Solicitare de date de card pentru "primirea rambursării"'],
    ceFaci: ['Verificați direct pe anaf.ro în contul SPV', 'Nu accesați linkuri din SMS-uri care pretind a fi de la ANAF', 'Contactați ANAF la numărul oficial pentru clarificări', 'Raportați mesajul la DNSC'],
    raporteaza: ['DNSC: 1911 sau pnrisc.dnsc.ro', 'ANAF: 031.403.91.60', 'Poliția Română: 112']
  },
  {
    id: 4,
    title: 'Inspector bancar fals / cont sigur',
    englishTitle: 'Inspector Banker Scam',
    emoji: '🏦',
    shortDesc: 'Apelantul pretinde că este angajat al băncii și solicită transferul banilor într-un pretins "cont sigur".',
    fullDesc: 'Victima primește un apel telefonic de la o persoană care se prezintă ca inspector sau ofițer de securitate al băncii, anunțând că există o tentativă de fraudă pe contul său. Pentru "protejarea banilor", victima este convinsă să transfere fondurile într-un "cont sigur" controlat de escroc. Pierderea este totală și ireversibilă.',
    semne: ['Nicio bancă nu solicită transferuri telefonice pentru "protecție"', 'Presiune psihologică și urgență extremă', 'Solicitarea de a nu informa pe nimeni', 'Numărul apelant poate părea oficial (caller ID spoofing)'],
    ceFaci: ['Închideți imediat apelul', 'Sunați direct la bancă la numărul de pe spatele cardului', 'Nu transferați bani indiferent de justificare', 'Raportați imediat incidentul la bancă și la poliție'],
    raporteaza: ['Banca dumneavoastră: numărul de pe spatele cardului', 'Poliția Română: 112', 'DNSC: 1911']
  },
  {
    id: 5,
    title: 'Frauda "mi-am schimbat numărul" pe WhatsApp',
    englishTitle: 'WhatsApp Number Change Scam',
    emoji: '📱',
    shortDesc: 'Escrocul pretinde că este copilul dumneavoastră sau o rudă apropiată și solicită bani urgent de pe un număr nou.',
    fullDesc: 'Victima primește un mesaj WhatsApp de la un număr necunoscut: "Mamă/Tată, mi-am schimbat numărul. Acesta este noul meu număr. Am o urgență și am nevoie de bani." Escrocul exploatează afecțiunea părintească și urgența situației pentru a obține transferuri bancare rapide.',
    semne: ['Număr de telefon necunoscut', 'Urgență imediată fără posibilitate de verificare', 'Refuză apelul video sau vocal', 'Solicită transfer bancar sau Revolut imediat'],
    ceFaci: ['Sunați pe numărul vechi al rudei pentru verificare', 'Solicitați un apel video pentru confirmarea identității', 'Nu transferați bani fără verificare directă', 'Alertați ruda respectivă cu privire la tentativa de fraudă'],
    raporteaza: ['Poliția Română: 112', 'DNSC: 1911']
  },
  {
    id: 6,
    title: 'Suport bancar fals pe rețele sociale',
    englishTitle: 'Fake Bank Support Social Media',
    emoji: '💬',
    shortDesc: 'Cont fals de suport al băncii pe Facebook sau Instagram solicită date bancare sub pretextul rezolvării unei probleme.',
    fullDesc: 'Escrocii creează conturi false care imită paginile oficiale ale băncilor pe Facebook, Instagram sau X. Când un client postează o reclamație sau o întrebare, contul fals intervine cu "ajutor", solicitând date de card, credențiale de acces sau coduri OTP pentru "verificarea identității".',
    semne: ['Contul nu are insignă oficială de verificare', 'Număr mic de urmăritori sau cont creat recent', 'Solicită date sensibile prin mesaje private', 'Trimite link-uri externe în afara site-ului oficial al băncii'],
    ceFaci: ['Contactați banca exclusiv prin canalele oficiale', 'Verificați că pagina deține insigna oficială de verificare', 'Nu furnizați niciodată date bancare pe rețele sociale', 'Raportați contul fals platformei respective'],
    raporteaza: ['Banca dumneavoastră: numărul oficial', 'DNSC: 1911', 'Raportați contul fals direct pe Facebook sau Instagram']
  },
  {
    id: 7,
    title: 'Fraudă prin acces la distanță (AnyDesk/TeamViewer)',
    englishTitle: 'Remote Access Scam',
    emoji: '💻',
    shortDesc: 'Victima este convinsă să instaleze un program de acces la distanță, oferind escrocului control total asupra dispozitivului.',
    fullDesc: 'Escrocul contactează victima pretinzând că reprezintă serviciul de suport tehnic al Microsoft, al băncii sau al furnizorului de internet și o convinge să instaleze AnyDesk, TeamViewer sau RustDesk. Odată obținut accesul, escrocul efectuează transferuri bancare, fură date personale și financiare sau instalează programe malițioase.',
    semne: ['Nicio companie legitimă nu solicită instalarea de software de acces la distanță prin telefon', 'Apel nesolicitat referitor la "probleme" la calculator sau la contul bancar', 'Presiune pentru acțiune imediată', 'Solicitarea de a accesa aplicația bancară în timp ce "tehnicianul" urmărește ecranul'],
    ceFaci: ['Nu instalați niciodată software la solicitarea telefonică', 'Închideți imediat apelul', 'Dacă ați instalat deja programul, deconectați internetul și contactați banca', 'Efectuați o scanare antivirus completă a dispozitivului'],
    raporteaza: ['Banca dumneavoastră: numărul de pe spatele cardului', 'Poliția Română: 112', 'DNSC: 1911']
  },
  {
    id: 8,
    title: 'Taxă falsă pentru colet vamal',
    englishTitle: 'Fake Customs Fee',
    emoji: '📮',
    shortDesc: 'SMS sau email despre un colet reținut la vamă pentru care trebuie achitată o taxă mică printr-un link fals.',
    fullDesc: 'Victima primește un SMS sau un email care imită Poșta Română, DHL, DPD sau alte servicii de curierat, anunțând că un colet a fost reținut la vamă și că trebuie achitată o taxă mică (5-20 lei) pentru eliberare. Linkul conduce la un site fals care colectează datele complete ale cardului bancar.',
    semne: ['Nu așteptați niciun colet din exterior', 'Link-ul nu provine de pe domeniul oficial al serviciului de curierat', 'Taxa solicitată este neobișnuit de mică', 'SMS primit de la un număr necunoscut sau internațional'],
    ceFaci: ['Verificați direct pe site-ul oficial al curierului, folosind numărul de tracking', 'Nu accesați linkuri din SMS-uri referitoare la colete', 'Contactați direct serviciul de curierat la numărul oficial'],
    raporteaza: ['DNSC: 1911 sau pnrisc.dnsc.ro', 'Poliția Română: sesizare online pe politiaromana.ro', 'Banca dumneavoastră, dacă ați furnizat date bancare']
  },
  {
    id: 9,
    title: 'Escrocherie romantică online (Romance Scam)',
    englishTitle: 'Romance Scam',
    emoji: '❤️',
    shortDesc: 'Relație online construită pe parcursul mai multor luni, urmată de cereri repetate de bani pentru diverse "urgențe".',
    fullDesc: 'Escrocul creează un profil fals atractiv pe Facebook, Instagram, Tinder sau alte platforme și construiește o relație romantică pe parcursul săptămânilor sau lunilor. Odată câștigată încrederea victimei, apar "urgențe" (operație medicală, bilet de avion, probleme legale) care necesită sume de bani. Escrocul nu se întâlnește niciodată fizic cu victima.',
    semne: ['Profilul conține prea puține fotografii sau fotografiile par profesionale', 'Refuză constant întâlnirile fizice sau apelurile video', 'Declarații de dragoste exagerate, manifestate foarte rapid', 'Pretinde că locuiește în altă țară sau că se află "în misiune"', 'Cererile de bani apar după câștigarea încrederii'],
    ceFaci: ['Efectuați o căutare inversă a fotografiilor de profil', 'Nu trimiteți niciodată bani unor persoane cunoscute exclusiv în mediul online', 'Discutați situația cu un prieten de încredere sau cu un membru al familiei', 'Raportați profilul platformei respective'],
    raporteaza: ['Poliția Română: 112 sau sesizare online pe politiaromana.ro', 'DNSC: 1911', 'Raportați profilul fals platformei (Facebook, Instagram, Tinder)']
  },
  {
    id: 10,
    title: 'Grupuri false de investiții pe Telegram sau WhatsApp',
    englishTitle: 'Fake Investment Groups',
    emoji: '📈',
    shortDesc: 'Grupuri cu membri falși care prezintă profituri fabricate pentru a determina victimele să investească sume tot mai mari.',
    fullDesc: 'Victima este adăugată sau invitată într-un grup de Telegram sau WhatsApp dedicat "investițiilor profitabile". Membrii grupului (în realitate conturi false controlate de aceiași escroci) postează capturi de ecran cu profituri spectaculoase. Victima este convinsă să investească sume mici inițial, constată "profituri" în dashboard-ul fals, mărește investiția și, în final, nu mai poate retrage fondurile.',
    semne: ['Profituri garantate sau nerealiste (50-200% lunar)', 'Presiune pentru a investi rapid, fără timp de reflecție', 'Nu există informații verificabile despre companie sau platformă', 'Retragerile sunt blocate sau necesită achitarea unor "taxe suplimentare"', 'Platforma nu este autorizată de ASF România'],
    ceFaci: ['Verificați autorizarea platformei pe site-ul ASF (Autoritatea de Supraveghere Financiară)', 'Nu investiți sume pe care nu vă permiteți să le pierdeți', 'Ignorați grupurile în care ați fost adăugați fără consimțământul dumneavoastră', 'Raportați grupul platformei respective'],
    raporteaza: ['Poliția Română: 112', 'DNSC: 1911', 'ASF România: asf.ro', 'ANPC: 021.9551']
  }
]

export default function ScamTypes() {
  const [openId, setOpenId] = useState<number | null>(null)

  const handleClick = async (id: number) => {
    if (openId === id) {
      setOpenId(null)
      return
    }
    setOpenId(id)

    try {
      const { data } = await supabase
        .from('scam_type_clicks')
        .select('clicks')
        .eq('scam_id', id)
        .single()

      if (data) {
        await supabase
          .from('scam_type_clicks')
          .update({ clicks: data.clicks + 1 })
          .eq('scam_id', id)
      } else {
        await supabase
          .from('scam_type_clicks')
          .insert({ scam_id: id, clicks: 1 })
      }
    } catch (e) {
      // Tracking opțional
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'sans-serif', padding: '60px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
            Tipuri de <span style={{ color: '#0ea5e9' }}>Fraude Documentate</span>
          </h1>
          <p style={{ color: 'rgba(30,41,59,0.65)', fontSize: 15, maxWidth: 600, margin: '0 auto 16px' }}>
            Baza de date eVerify conține peste 210 tipuri de fraude și escrocherii documentate. În scopul informării publice, prezentăm mai jos cele mai frecvente 10 tipuri identificate în România.
          </p>
          <div style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '12px 20px', display: 'inline-block' }}>
            <p style={{ fontSize: 13, color: 'rgba(30,41,59,0.65)', margin: 0 }}>
              Informațiile complete sunt utilizate exclusiv în procesul de analiză AI pentru protecția utilizatorilor. Publicarea unui număr limitat de tipuri are scopul de a nu facilita activitatea infracțională.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 48 }}>
          {scamTypes.map((scam) => (
            <div key={scam.id} style={{ background: '#ffffff', border: `1px solid ${openId === scam.id ? 'rgba(14,165,233,0.4)' : 'rgba(30,41,59,0.1)'}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s', boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>

              <button
                onClick={() => handleClick(scam.id)}
                style={{ width: '100%', background: 'none', border: 'none', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ fontSize: 28, flexShrink: 0 }}>{scam.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: '#0ea5e9', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>#{scam.id}</span>
                    <span style={{ fontSize: 11, color: 'rgba(30,41,59,0.5)', fontStyle: 'italic' }}>{scam.englishTitle}</span>
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>{scam.title}</p>
                  <p style={{ fontSize: 13, color: 'rgba(30,41,59,0.65)', margin: 0 }}>{scam.shortDesc}</p>
                </div>
                <span style={{ fontSize: 18, color: 'rgba(30,41,59,0.6)', flexShrink: 0, transform: openId === scam.id ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▼</span>
              </button>

              {openId === scam.id && (
                <div style={{ padding: '0 22px 22px', borderTop: '1px solid rgba(30,41,59,0.08)' }}>

                  <div style={{ marginTop: 16, marginBottom: 16 }}>
                    <p style={{ fontSize: 14, color: 'rgba(30,41,59,0.75)', lineHeight: 1.7, margin: 0 }}>{scam.fullDesc}</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>

                    <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: '14px 16px' }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>⚠️ Semne de alarmă</p>
                      {scam.semne.map((s, i) => (
                        <p key={i} style={{ fontSize: 13, color: 'rgba(30,41,59,0.75)', marginBottom: 6, paddingLeft: 8, borderLeft: '2px solid rgba(239,68,68,0.3)' }}>
                          {s}
                        </p>
                      ))}
                    </div>

                    <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 10, padding: '14px 16px' }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#22c55e', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>🛡️ Ce să faceți</p>
                      {scam.ceFaci.map((c, i) => (
                        <p key={i} style={{ fontSize: 13, color: 'rgba(30,41,59,0.75)', marginBottom: 6, paddingLeft: 8, borderLeft: '2px solid rgba(34,197,94,0.3)' }}>
                          {c}
                        </p>
                      ))}
                    </div>

                  </div>

                  <div style={{ marginTop: 16, background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 10, padding: '14px 16px' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#0ea5e9', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>📢 Raportați la</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {scam.raporteaza.map((r, i) => (
                        <span key={i} style={{ fontSize: 12, color: 'rgba(30,41,59,0.75)', background: 'rgba(14,165,233,0.1)', padding: '4px 10px', borderRadius: 6 }}>
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 16, padding: '32px 24px', marginBottom: 32 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Ați primit un mesaj suspect?</h3>
          <p style={{ color: 'rgba(30,41,59,0.65)', fontSize: 14, marginBottom: 20 }}>
            Utilizați sistemul de analiză AI eVerify pentru un verdict imediat. Primele 5 verificări sunt gratuite.
          </p>
          <a href="/" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: 'white', padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Verificați acum →
          </a>
        </div>

        <div style={{ background: 'rgba(30,41,59,0.04)', border: '1px solid rgba(30,41,59,0.1)', borderRadius: 12, padding: '16px 20px' }}>
          <p style={{ fontSize: 12, color: 'rgba(30,41,59,0.55)', margin: 0, lineHeight: 1.7 }}>
            <strong style={{ color: 'rgba(30,41,59,0.75)' }}>Notă legală:</strong> Informațiile prezentate pe această pagină au caracter exclusiv educativ și informativ. Conținutul este generat și verificat cu ajutorul inteligenței artificiale și nu constituie consultanță juridică. Acestea nu pot fi utilizate ca probă sau mijloc de dovadă în niciun proces juridic, administrativ sau de altă natură. eVerify nu își asumă responsabilitatea pentru deciziile luate exclusiv pe baza informațiilor prezentate. În cazul unor prejudicii financiare, contactați autoritățile competente.
          </p>
        </div>

      </div>
    </div>
  )
}