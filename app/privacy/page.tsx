export default function Privacy() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'sans-serif', padding: '60px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
            Politica de <span style={{ color: '#0ea5e9' }}>Confidențialitate</span>
          </h1>
          <p style={{ color: 'rgba(30,41,59,0.6)', fontSize: 14 }}>
            Ultima actualizare: Mai 2026
          </p>
        </div>

        {[
          {
            title: '1. Informații generale',
            content: 'Prezenta Politică de Confidențialitate descrie modul în care platforma eVerify (denumită în continuare "eVerify", "noi" sau "platforma") colectează, utilizează și protejează datele cu caracter personal ale utilizatorilor, în conformitate cu Regulamentul (UE) 2016/679 al Parlamentului European și al Consiliului (GDPR) și legislația română aplicabilă. Operator de date: Platforma eVerify. Contact: contact@everify.ro.'
          },
          {
            title: '2. Datele colectate',
            content: 'eVerify colectează următoarele categorii de date: (a) Date de identificare: adresa de email furnizată la înregistrare; (b) Date de utilizare: mesajele și URL-urile introduse pentru verificare, istoricul analizelor efectuate, numărul de verificări utilizate; (c) Date tehnice: adresa IP, tipul de browser, sistemul de operare, data și ora accesării platformei; (d) Date de plată: procesate exclusiv prin Stripe — eVerify nu stochează datele complete ale cardului bancar.'
          },
          {
            title: '3. Scopul prelucrării datelor',
            content: 'Datele cu caracter personal sunt prelucrate în următoarele scopuri: furnizarea serviciilor platformei eVerify; gestionarea contului de utilizator și a creditelor; procesarea plăților; îmbunătățirea continuă a serviciilor; respectarea obligațiilor legale aplicabile; transmiterea de comunicări cu privire la servicii, în cazul în care utilizatorul și-a exprimat consimțământul.'
          },
          {
            title: '4. Temeiul juridic al prelucrării',
            content: 'Prelucrarea datelor se realizează în baza: executării contractului dintre utilizator și eVerify (furnizarea serviciilor); consimțământului utilizatorului (pentru comunicări de marketing și newsletter); interesului legitim al eVerify (securitatea platformei, prevenirea fraudelor); obligației legale (respectarea cerințelor fiscale și contabile aplicabile).'
          },
          {
            title: '5. Stocarea și securitatea datelor',
            content: 'Datele sunt stocate pe servere situate în Uniunea Europeană și sunt protejate prin măsuri tehnice și organizatorice adecvate, inclusiv criptare SSL/TLS. eVerify nu transferă date cu caracter personal în afara Spațiului Economic European fără garanții adecvate. Datele sunt păstrate pe durata activității contului de utilizator și până la 3 ani după ștergerea acestuia, sau mai puțin, dacă legislația aplicabilă impune altfel.'
          },
          {
            title: '6. Drepturile utilizatorilor',
            content: 'În conformitate cu GDPR, utilizatorii beneficiază de următoarele drepturi: dreptul de acces la datele personale; dreptul la rectificarea datelor inexacte; dreptul la ștergerea datelor ("dreptul de a fi uitat"); dreptul la restricționarea prelucrării; dreptul la portabilitatea datelor; dreptul de opoziție față de prelucrare; dreptul de a nu face obiectul unei decizii automate. Pentru exercitarea acestor drepturi, utilizatorii pot contacta eVerify la adresa contact@everify.ro.'
          },
          {
            title: '7. Cookie-uri',
            content: 'Platforma eVerify utilizează cookie-uri esențiale pentru funcționarea serviciului și cookie-uri analitice pentru îmbunătățirea experienței utilizatorului. Utilizatorul poate gestiona preferințele privind cookie-urile prin bannerul afișat la prima accesare a platformei sau prin setările browserului.'
          },
          {
            title: '8. Servicii terțe',
            content: 'eVerify utilizează servicii terțe pentru furnizarea platformei, inclusiv servicii de stocare date, autentificare, procesare plăți, hosting și verificare URL-uri. Fiecare dintre acești furnizori respectă cerințele GDPR și deține propria politică de confidențialitate.'
          },
          {
            title: '9. Modificări ale politicii',
            content: 'eVerify își rezervă dreptul de a modifica prezenta Politică de Confidențialitate în orice moment. Utilizatorii vor fi notificați cu privire la modificările semnificative prin email sau prin afișarea unui anunț pe platformă. Continuarea utilizării platformei după notificare constituie acceptarea noii versiuni a politicii.'
          },
          {
            title: '10. Contact și autoritatea de supraveghere',
            content: 'Operator de date: Platforma eVerify. Pentru orice întrebări sau solicitări legate de prelucrarea datelor cu caracter personal, utilizatorii pot contacta eVerify la adresa contact@everify.ro. Utilizatorii au dreptul de a depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP), la adresa anspdcp.eu.'
          }
        ].map((section, i) => (
          <div key={i} style={{ background: '#ffffff', border: '1px solid rgba(30,41,59,0.1)', borderRadius: 14, padding: '24px 28px', marginBottom: 16, boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#0ea5e9' }}>{section.title}</h2>
            <p style={{ fontSize: 14, color: 'rgba(30,41,59,0.7)', lineHeight: 1.8, margin: 0 }}>{section.content}</p>
          </div>
        ))}

        <div style={{ background: 'rgba(30,41,59,0.04)', border: '1px solid rgba(30,41,59,0.1)', borderRadius: 12, padding: '16px 20px', marginTop: 24 }}>
          <p style={{ fontSize: 12, color: 'rgba(30,41,59,0.55)', margin: 0, lineHeight: 1.7, textAlign: 'center' }}>
            Pentru orice întrebări privind confidențialitatea datelor, contactați-ne la <a href="mailto:contact@everify.ro" style={{ color: '#0ea5e9' }}>contact@everify.ro</a>
          </p>
        </div>

      </div>
    </div>
  )
}