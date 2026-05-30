'use client'
import { useRouter } from 'next/navigation'

export default function DeCeEverify() {
  const router = useRouter()

  const avantaje = [
    {
      icon: '🤖',
      title: 'Analiză prin Inteligență Artificială',
      desc: 'Sistemul eVerify utilizează modele de inteligență artificială verificate și performante, selectate pentru eficiența lor în identificarea și analizarea tentativelor de fraudă, asigurând un verdict rapid și fundamentat pentru fiecare solicitare.'
    },
    {
      icon: '🛡️',
      title: 'Bază de date cu peste 200 tipuri diferite de fraude',
      desc: 'Dispunem de cea mai completă bază de date anti-scam documentată pentru România, cu tipuri de fraude în română și engleză, actualizată permanent cu noile metode utilizate de infractori.'
    },
    {
      icon: '🌐',
      title: 'Verificare site-uri web în timp real',
      desc: 'Serviciul de verificare URL utilizează Google Safe Browsing și URLhaus (partener oficial Interpol/Europol) pentru a determina dacă un site web este sigur înainte de a introduce date personale sau bancare.'
    },
    {
      icon: '⚡',
      title: 'Verdict în câteva secunde',
      desc: 'Spre deosebire de metodele tradiționale de verificare, platforma eVerify furnizează un verdict clar și detaliat în câteva secunde, accesibil oricând, de pe orice dispozitiv.'
    },
    {
      icon: '🇷🇴',
      title: 'Specializat pentru România',
      desc: 'Platforma este optimizată pentru contextul românesc: include fraude specifice pieței locale, instituții de raportare din România, numere de urgență naționale și comunicare în limba română.'
    },
    {
      icon: '🔒',
      title: 'Confidențialitate și securitate',
      desc: 'Datele dumneavoastră sunt prelucrate în conformitate cu Regulamentul General privind Protecția Datelor (GDPR). Nu stocăm date personale fără consimțământul explicit al utilizatorului.'
    },
    {
      icon: '📱',
      title: 'Accesibil pe orice dispozitiv',
      desc: 'Platforma eVerify este optimizată pentru utilizare atât pe desktop, cât și pe dispozitive mobile, permițând verificarea rapidă a mesajelor suspecte în orice moment.'
    },
    {
      icon: '🏛️',
      title: 'Informații verificate din surse oficiale',
      desc: 'Numerele de urgență, instituțiile de raportare și procedurile recomandate sunt preluate exclusiv din surse oficiale: DNSC, Poliția Română, ANPC, ANAF și instituții bancare autorizate.'
    },
    {
      icon: '🆘',
      title: 'Buton de urgență cu numere esențiale',
      desc: 'Platforma eVerify pune la dispoziție un buton de urgență permanent vizibil, care oferă acces imediat la cele mai importante numere de telefon naționale: urgențe (112), fraude cibernetice (1911 — DNSC), protecția consumatorilor (ANPC), linii de suport pentru victime și numerele de blocare card ale principalelor bănci din România.'
    },
  ]

  const statistici = [
    { numar: '200+', label: 'Tipuri diferite de fraude documentate' },
    { numar: '24/7', label: 'Disponibilitate continuă' },
    { numar: '5', label: 'Verificări gratuite la înregistrare' },
    { numar: '3', label: 'Surse independente de verificare URL' },
  ]

  const comparatie = [
    { aspect: 'Timp de răspuns', everify: '< 5 secunde', altele: 'Ore sau zile' },
    { aspect: 'Disponibilitate', everify: '24/7, oricând', altele: 'Program limitat' },
    { aspect: 'Tipuri de fraude acoperite', everify: '200+ documentate', altele: 'Generale, nedocumentate' },
    { aspect: 'Specific pentru România', everify: '✅ Da', altele: '❌ Nu' },
    { aspect: 'Verificare site-uri web', everify: '✅ Da', altele: '❌ Rar' },
    { aspect: 'Numere urgență România', everify: '✅ Integrate', altele: '❌ Absente' },
    { aspect: 'Buton SOS cu numere esențiale', everify: '✅ Permanent vizibil', altele: '❌ Absent' },
    { aspect: 'Surse verificare URL', everify: 'Google + Interpol/Europol', altele: 'Necunoscute' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'sans-serif', padding: '60px 20px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🛡️</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>
            De ce să utilizați <span style={{ color: '#0ea5e9' }}>eVerify</span>?
          </h1>
          <p style={{ color: 'rgba(30,41,59,0.65)', fontSize: 16, maxWidth: 620, margin: '0 auto 24px' }}>
            eVerify este platforma românească dedicată protecției cetățenilor împotriva fraudelor și escrocheriilor online, oferind analiză în timp real prin inteligență artificială.
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn-pulse"
            style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', border: 'none', color: 'white', padding: '13px 28px', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center' }}
          >
            Încercați gratuit <span style={{ fontSize: '1.4em', lineHeight: 1 }}>❯</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 64 }}>
          {statistici.map((s, i) => (
            <div key={i} style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 14, padding: '24px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#0ea5e9', marginBottom: 8 }}>{s.numar}</div>
              <div style={{ fontSize: 13, color: 'rgba(30,41,59,0.65)', lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#ffffff', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 16, padding: '32px 28px', marginBottom: 48, boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, color: '#0ea5e9' }}>Misiunea noastră</h2>
          <p style={{ fontSize: 15, color: 'rgba(30,41,59,0.75)', lineHeight: 1.8, marginBottom: 16 }}>
            În România, mii de cetățeni cad victime ale fraudelor online în fiecare an, cu prejudicii financiare semnificative. Escrocii utilizează metode din ce în ce mai sofisticate, inclusiv inteligența artificială, pentru a înșela victimele.
          </p>
          <p style={{ fontSize: 15, color: 'rgba(30,41,59,0.75)', lineHeight: 1.8, margin: 0 }}>
            eVerify a fost creat cu scopul de a pune la dispoziția fiecărui cetățean român un instrument accesibil, rapid și fiabil de verificare a mesajelor suspecte și a site-urilor web, contribuind la reducerea numărului de victime ale fraudelor online.
          </p>
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>
          Avantajele platformei <span style={{ color: '#0ea5e9' }}>eVerify</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16, marginBottom: 64 }}>
          {avantaje.map((a, i) => (
            <div key={i} style={{ background: '#ffffff', border: '1px solid rgba(30,41,59,0.1)', borderRadius: 14, padding: '22px 24px', display: 'flex', gap: 16, boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{a.icon}</span>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>{a.title}</p>
                <p style={{ fontSize: 13, color: 'rgba(30,41,59,0.7)', lineHeight: 1.7, margin: 0 }}>{a.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>
          eVerify vs. alte metode de verificare
        </h2>
        <div style={{ background: '#ffffff', border: '1px solid rgba(30,41,59,0.1)', borderRadius: 16, overflow: 'hidden', marginBottom: 64, boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', background: 'rgba(14,165,233,0.1)', padding: '14px 20px', borderBottom: '1px solid rgba(30,41,59,0.1)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(30,41,59,0.65)', textTransform: 'uppercase', letterSpacing: 1 }}>Aspect</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>eVerify</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(30,41,59,0.65)', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>Alte metode</span>
          </div>
          {comparatie.map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '14px 20px', borderBottom: i < comparatie.length - 1 ? '1px solid rgba(30,41,59,0.08)' : 'none', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'rgba(30,41,59,0.7)' }}>{row.aspect}</span>
              <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 600, textAlign: 'center' }}>{row.everify}</span>
              <span style={{ fontSize: 13, color: 'rgba(30,41,59,0.55)', textAlign: 'center' }}>{row.altele}</span>
            </div>
          ))}
        </div>

        <div style={{ background: '#ffffff', border: '1px solid rgba(30,41,59,0.1)', borderRadius: 16, padding: '32px 28px', marginBottom: 48, boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Cui se adresează eVerify?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { icon: '👴', title: 'Persoane vârstnice', desc: 'Cel mai frecvent vizate de escroci prin telefon și mesaje false.' },
              { icon: '👨‍👩‍👧', title: 'Familii', desc: 'Protejați-vă familia de fraudele de tip "nepotul are accident".' },
              { icon: '🛍️', title: 'Cumpărători online', desc: 'Verificați site-urile înainte de a efectua plăți online.' },
              { icon: '💼', title: 'Companii', desc: 'Protejați angajații și activele companiei de fraudele BEC și CEO Fraud.' },
              { icon: '🌍', title: 'Diaspora română', desc: 'Verificați ofertele de joburi, chirii și servicii din România.' },
              { icon: '🎓', title: 'Tineri și studenți', desc: 'Identificați ofertele false de joburi, burse și cursuri online.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'rgba(30,41,59,0.04)', border: '1px solid rgba(30,41,59,0.1)', borderRadius: 12, padding: '18px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{item.icon}</div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>{item.title}</p>
                <p style={{ fontSize: 12, color: 'rgba(30,41,59,0.65)', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 16, padding: '28px 28px', marginBottom: 48, display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ fontSize: 40, flexShrink: 0 }}>🆘</div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#ef4444' }}>Buton de urgență permanent disponibil</h3>
            <p style={{ fontSize: 14, color: 'rgba(30,41,59,0.7)', lineHeight: 1.7, margin: 0 }}>
              Pe toate paginile platformei eVerify este disponibil un buton de urgență (<strong style={{ color: '#ef4444' }}>🆘</strong>) permanent vizibil în colțul din dreapta jos al ecranului. La apăsarea acestuia, utilizatorul are acces imediat la cele mai importante numere de telefon naționale: <strong style={{ color: '#1e293b' }}>112</strong> (urgențe generale), <strong style={{ color: '#1e293b' }}>1911</strong> (DNSC — fraude cibernetice), numerele de urgență ale principalelor bănci din România pentru blocarea imediată a cardurilor, linii de suport pentru victime ale violenței domestice, pentru copii în pericol și pentru prevenirea suicidului. Toate numerele sunt apelabile direct din dispozitivul mobil, fără a fi necesară memorarea acestora.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(99,102,241,0.1))', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 16, padding: '40px 24px', marginBottom: 32 }}>
          <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Protejați-vă acum</h3>
          <p style={{ color: 'rgba(30,41,59,0.65)', fontSize: 15, marginBottom: 24, maxWidth: 500, margin: '0 auto 24px' }}>
            Primele 5 verificări sunt gratuite. Nu este necesară introducerea datelor de card.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/')}
              className="btn-pulse"
              style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', border: 'none', color: 'white', padding: '13px 28px', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center' }}
            >
              Verificați un mesaj <span style={{ fontSize: '1.4em', lineHeight: 1 }}>❯</span>
            </button>
            <button
              onClick={() => router.push('/check-url')}
              className="btn-pulse"
              style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', border: 'none', color: 'white', padding: '13px 28px', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center' }}
            >
              Verificați un site web <span style={{ fontSize: '1.4em', lineHeight: 1 }}>❯</span>
            </button>
          </div>
        </div>

        <div style={{ background: 'rgba(30,41,59,0.04)', border: '1px solid rgba(30,41,59,0.1)', borderRadius: 12, padding: '16px 20px' }}>
          <p style={{ fontSize: 12, color: 'rgba(30,41,59,0.55)', margin: 0, lineHeight: 1.7 }}>
            <strong style={{ color: 'rgba(30,41,59,0.75)' }}>Notă legală:</strong> Conținutul generat de platforma eVerify are caracter exclusiv informativ și este produs cu ajutorul inteligenței artificiale. Acesta nu constituie consultanță juridică, tehnică sau financiară și nu poate fi utilizat ca probă sau mijloc de dovadă în niciun proces juridic, administrativ sau de altă natură. eVerify nu garantează acuratețea absolută a rezultatelor și recomandă contactarea autorităților competente în cazul unor prejudicii financiare.
          </p>
        </div>

      </div>
    </div>
  )
}