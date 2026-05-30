export default function Terms() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'sans-serif', padding: '60px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
            Termeni și <span style={{ color: '#0ea5e9' }}>Condiții</span>
          </h1>
          <p style={{ color: 'rgba(30,41,59,0.6)', fontSize: 14 }}>
            Ultima actualizare: Mai 2026
          </p>
        </div>

        {[
          {
            title: '1. Acceptarea termenilor',
            content: 'Prin accesarea și utilizarea platformei eVerify (disponibilă la adresa everify.ro), utilizatorul acceptă în mod expres prezentele Termeni și Condiții. În cazul în care utilizatorul nu este de acord cu acești termeni, este rugat să nu utilizeze platforma. eVerify își rezervă dreptul de a modifica acești termeni în orice moment, cu notificarea prealabilă a utilizatorilor.'
          },
          {
            title: '2. Descrierea serviciilor',
            content: 'eVerify este o platformă digitală care oferă următoarele servicii: (a) Analiză AI a mesajelor suspecte pentru identificarea tentativelor de fraudă; (b) Verificarea site-urilor web pentru evaluarea gradului de siguranță; (c) Informații educative despre tipurile de fraude online documentate. Toate serviciile sunt furnizate cu ajutorul inteligenței artificiale și au caracter exclusiv informativ.'
          },
          {
            title: '3. Limitarea răspunderii',
            content: 'Rezultatele generate de platforma eVerify au caracter exclusiv informativ și nu constituie consultanță juridică, tehnică sau financiară. eVerify nu garantează acuratețea absolută a analizelor generate prin inteligență artificială. Platforma nu poate fi ținută răspunzătoare pentru deciziile luate de utilizatori exclusiv pe baza rezultatelor furnizate. Rezultatele nu pot fi utilizate ca probă sau mijloc de dovadă în niciun proces juridic, administrativ sau de altă natură.'
          },
          {
            title: '4. Contul de utilizator',
            content: 'Pentru accesarea serviciilor complete ale platformei, utilizatorul trebuie să creeze un cont cu o adresă de email validă. Utilizatorul este responsabil pentru menținerea confidențialității credențialelor de acces și pentru toate activitățile desfășurate prin contul său. eVerify își rezervă dreptul de a suspenda sau închide conturile care încalcă prezentele Termeni și Condiții.'
          },
          {
            title: '5. Credite și plăți',
            content: 'Serviciile eVerify funcționează pe baza unui sistem de credite. Primele 5 credite sunt gratuite pentru utilizatorii nou înregistrați. Creditele achiziționate nu expiră și se cumulează în contul utilizatorului. Plățile sunt procesate exclusiv prin Stripe, o platformă securizată de procesare a plăților. eVerify nu stochează datele complete ale cardului bancar. Toate prețurile sunt exprimate în EUR și includ TVA aplicabil.'
          },
          {
            title: '6. Politica de rambursare',
            content: 'Utilizatorii nemulțumiți de serviciile eVerify pot solicita rambursarea în termen de 30 de zile de la data achiziției, prin transmiterea unei solicitări la adresa contact@everify.ro. Rambursările se procesează în termen de 5-10 zile lucrătoare, în funcție de banca emitentă a cardului. Creditele utilizate nu sunt rambursabile.'
          },
          {
            title: '7. Utilizarea acceptabilă',
            content: 'Utilizatorul se angajează să utilizeze platforma eVerify exclusiv în scopuri legale și conforme cu prezentele Termeni și Condiții. Este interzisă utilizarea platformei pentru: tentative de fraudă sau activități ilegale; suprasolicitarea sistemelor prin atacuri automatizate; extragerea sau copierea bazei de date; orice activitate care poate prejudicia funcționarea platformei sau alți utilizatori.'
          },
          {
            title: '8. Proprietatea intelectuală',
            content: 'Conținutul platformei eVerify, inclusiv textele, grafica, logo-urile, baza de date cu tipuri de fraude și codul sursă, sunt proprietatea exclusivă a platformei eVerify și sunt protejate de legislația privind drepturile de autor și proprietatea intelectuală. Este interzisă reproducerea, distribuirea sau modificarea acestora fără acordul scris prealabil al eVerify.'
          },
          {
            title: '9. Disponibilitatea serviciilor',
            content: 'eVerify depune toate eforturile pentru a asigura disponibilitatea continuă a platformei. Cu toate acestea, nu poate garanta funcționarea neîntreruptă a serviciilor, putând interveni perioade de întreținere sau situații tehnice neprevăzute. eVerify nu poate fi ținut răspunzător pentru prejudiciile cauzate de indisponibilitatea temporară a platformei.'
          },
          {
            title: '10. Legea aplicabilă',
            content: 'Prezentele Termeni și Condiții sunt guvernate de legislația română. Orice litigiu decurgând din sau în legătură cu utilizarea platformei eVerify va fi soluționat pe cale amiabilă sau, în caz de eșec, prin instanțele competente din România. Pentru orice întrebări sau solicitări, utilizatorii pot contacta eVerify la adresa contact@everify.ro.'
          }
        ].map((section, i) => (
          <div key={i} style={{ background: '#ffffff', border: '1px solid rgba(30,41,59,0.1)', borderRadius: 14, padding: '24px 28px', marginBottom: 16, boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#0ea5e9' }}>{section.title}</h2>
            <p style={{ fontSize: 14, color: 'rgba(30,41,59,0.7)', lineHeight: 1.8, margin: 0 }}>{section.content}</p>
          </div>
        ))}

        <div style={{ background: 'rgba(30,41,59,0.04)', border: '1px solid rgba(30,41,59,0.1)', borderRadius: 12, padding: '16px 20px', marginTop: 24 }}>
          <p style={{ fontSize: 12, color: 'rgba(30,41,59,0.55)', margin: 0, lineHeight: 1.7, textAlign: 'center' }}>
            Pentru orice întrebări privind Termenii și Condițiile, contactați-ne la <a href="mailto:contact@everify.ro" style={{ color: '#0ea5e9' }}>contact@everify.ro</a>
          </p>
        </div>

      </div>
    </div>
  )
}