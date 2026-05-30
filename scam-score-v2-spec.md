# Scam Score Personal v2 — Specificație completă (multi-public)

Test de vulnerabilitate la fraude online. Userul răspunde la întrebări, primește un
scor 0–100 și o interpretare cu recomandări personalizate. Conceput pentru distribuire virală.

**Principii noi față de v1:**
- Întrebări mai scurte, formulate ca scenariu real ("ți se întâmplă X — ce faci?"), nu ca jargon.
- Scor MARE = vulnerabilitate MARE (intuitiv: "am luat 70, tu cât?").
- 4 versiuni de public: **Copii**, **Adulți**, **Vârstnici**, **Companii**.
- La companii: bloc general pentru orice angajat + module pe departamentele cele mai expuse.
- Recomandările sunt legate de întrebările unde userul a pierdut puncte (nu generice).

Ruta sugerată: /scam-score, cu selector de public la început
(Sunt: 👦 Copil · 🧑 Adult · 👵 Vârstnic · 🏢 Companie).

---

# VERSIUNEA 1 — ADULȚI (publicul principal)

10 întrebări. Scor max 100 (fiecare întrebare max 10).

### 1. Primești un SMS: „Coletul tău e blocat, plătește 2 lei taxa" cu un link. Ce faci?
- Îl șterg — curierii nu cer plăți prin SMS cu link → 0
- Intru separat pe site-ul/app-ul curierului ca să verific → 2
- Apăs linkul să văd despre ce e → 9
- Plătesc, să nu pierd coletul → 10

### 2. Te sună cineva „de la bancă" și cere codul primit prin SMS ca să „oprească o fraudă". Ce faci?
- Închid — banca nu cere niciodată coduri → 0
- Ezit, dar nu dau codul → 4
- Întreb detalii, apoi poate dau → 8
- Dau codul, vor să mă ajute → 10

### 3. Înainte să introduci parola pe un site, te uiți la adresa exactă din bara browserului?
- Mereu, verific fiecare literă → 0
- Doar dacă ceva mi se pare ciudat → 4
- Rar → 8
- Nu știu la ce să mă uit → 10

### 4. Folosești aceeași parolă (sau variații) pe mai multe conturi?
- Nu, fiecare cont are parolă unică (am manager de parole) → 0
- Câteva variații ale aceleiași parole → 5
- Da, cam aceeași peste tot → 10

### 5. Ai autentificare în doi pași (2FA / cod la logare) pe email și pe bancă?
- Da, pe ambele → 0
- Doar pe unul → 5
- Nu / nu știu ce e → 10

### 6. Vezi un produs scump redus 90% pe un magazin de care n-ai auzit. Reacția?
- Verific magazinul: recenzii, date firmă, vechimea site-ului → 0
- Sunt sceptic, probabil renunț → 3
- Mă tentează, e ofertă bună → 8
- Cumpăr repede, până nu se termină → 10

### 7. Un mesaj spune că ai câștigat un telefon/voucher și trebuie doar să dai click. Ce faci?
- Îl ignor / îl raportez ca spam → 0
- Mă uit din curiozitate → 6
- Dau click să văd ce am câștigat → 9
- Completez datele ca să primesc premiul → 10

### 8. Cumperi de pe OLX/Marketplace de la un necunoscut. Cum plătești?
- Plată la livrare sau verific întâi vânzătorul (IBAN/telefon) → 0
- De obicei la livrare, dar nu mereu → 4
- Plătesc în avans dacă prețul e bun → 9
- Trimit banii repede ca să nu-mi scape → 10

### 9. Cât din viața ta (locație, planuri, achiziții) e public pe rețele?
- Foarte puțin / cont privat → 0
- Lucruri generale → 4
- Destul de mult → 8
- Aproape tot, în timp real → 10

### 10. Cât de des actualizezi telefonul/calculatorul (sistem + aplicații)?
- Automat, mereu la zi → 0
- Când îmi aduc aminte → 5
- Rar, amân mereu → 9
- Niciodată → 10

---

# VERSIUNEA 2 — COPII (8–14 ani)

Limbaj simplu, scenarii din lumea lor (jocuri, telefon, prieteni online). 8 întrebări, fiecare max 12.5 (rotunjit la scor /100). Ton prietenos, fără frică.

### 1. Un jucător necunoscut din joc îți zice că-ți dă skin-uri/V-bucks gratis dacă-i dai parola contului. Ce faci?
- Nu dau parola nimănui, niciodată → 0
- Întreb un părinte → 3
- Poate, dacă pare de treabă → 10
- Da, vreau skin-urile → 12

### 2. Cineva pe care nu-l cunoști îți scrie și vrea să fiți „prieteni secreți", să nu spui părinților. Ce faci?
- Spun imediat unui părinte/adult → 0
- Blochez persoana → 1
- Răspund, dar nu spun nimic → 11
- Vorbesc cu el, pare prietenos → 12

### 3. Un link spune „Ai câștigat un telefon! Apasă aici!". Ce faci?
- Nu apăs, sigur e o păcăleală → 0
- Întreb un adult → 3
- Apăs să văd → 11
- Apăs și scriu datele → 12

### 4. Un „prieten" îți cere pe chat o poză cu tine sau adresa de acasă. Ce faci?
- Nu trimit așa ceva → 0
- Întreb mama/tata → 2
- Trimit dacă e prieten → 11
- Trimit, nu e mare lucru → 12

### 5. Vrei să descarci un joc gratis de pe un site ciudat. Ce faci?
- Întreb un adult întâi → 0
- Doar din magazinul oficial (App Store/Google Play) → 1
- Descarc, vreau jocul → 11
- Apăs pe tot ca să meargă → 12

### 6. Cineva îți spune lucruri urâte sau te sperie online. Ce faci?
- Spun unui adult de încredere → 0
- Blochez și nu răspund → 2
- Mă cert cu el → 9
- Nu spun nimănui, mi-e rușine → 12

### 7. Un mesaj zice „contul tău se închide, scrie parola aici acum!". Ce faci?
- Nu scriu parola, e o capcană → 0
- Întreb un adult → 3
- Scriu, să nu pierd contul → 12

### 8. Cât de des vorbești cu părinții despre ce faci pe internet?
- Des, le spun ce văd → 0
- Câteodată → 5
- Aproape niciodată → 10
- Nu vor să știe ce fac → 12

**Interpretare copii (ton încurajator):**
- 0–25 → 🟢 „Ești super atent! Știi să te ferești de capcane."
- 26–55 → 🟡 „E bine, dar mai sunt câteva trucuri de învățat. Întreabă mereu un adult."
- 56–100 → 🔴 „Atenție! Unele răspunsuri te pot pune în pericol. Vorbește cu un părinte despre asta."

---

# VERSIUNEA 3 — VÂRSTNICI (65+)

Limbaj foarte clar, scenarii frecvente la ei (telefon, „nepotul la nevoie", pensie, bancă). 8 întrebări, max 12.5 fiecare. Fără jargon tehnic.

### 1. Te sună cineva și spune că e nepotul/ruda ta, are o urgență și are nevoie urgent de bani. Ce faci?
- Închid și sun eu direct ruda la numărul ei știut → 0
- Întreb detalii pe care doar ruda le-ar ști → 2
- Mă panichez, dar verific întâi → 6
- Trimit banii imediat, e o urgență → 12

### 2. Un mesaj sau apel spune că ai câștigat o sumă de bani / un premiu, dar trebuie să plătești o taxă întâi. Ce faci?
- Ignor — premiile reale nu cer bani înainte → 0
- Întreb un membru al familiei → 2
- Sunt curios, întreb cât e taxa → 9
- Plătesc taxa ca să primesc premiul → 12

### 3. Te sună „de la bancă" și cer parola sau codul primit pe telefon. Ce faci?
- Închid — banca nu cere niciodată asta → 0
- Spun că merg personal la bancă să verific → 2
- Ezit, dar nu spun codul → 7
- Le dau codul, par de la bancă → 12

### 4. Primești un mesaj că ai o factură neplătită sau un colet, cu un link. Ce faci?
- Nu apăs linkul, sun la firmă la numărul oficial → 0
- Întreb pe cineva din familie → 3
- Apăs linkul să văd → 11
- Plătesc prin link, să nu am probleme → 12

### 5. Cineva la ușă sau la telefon îți oferă o investiție sigură cu câștig mare și rapid. Ce faci?
- Refuz — câștig „sigur și mare" = înșelătorie → 0
- Cer timp și mă sfătuiesc cu familia → 3
- Mă interesează, ascult mai departe → 9
- Investesc, e o ocazie bună → 12

### 6. Ai pe cineva de încredere (familie) cu care vorbești înainte de decizii cu bani pe telefon/internet?
- Da, întreb mereu înainte → 0
- Uneori → 5
- Rar → 9
- Mă descurc singur(ă) → 11

### 7. Știi că banca, poliția sau o instituție NU îți va cere niciodată parole sau coduri prin telefon?
- Da, știu sigur → 0
- Cam știu, dar nu sunt sigur(ă) → 6
- Nu știam asta → 12

### 8. Dacă te grăbește cineva („acum, imediat, altfel pierzi totul"), ce faci?
- Mă opresc — graba e semn de înșelătorie → 0
- Cer timp de gândire → 3
- Mă stresez și acționez repede → 11
- Fac ce zice, ca să nu pierd → 12

**Interpretare vârstnici (ton respectuos, fără a-i face să se simtă proști):**
- 0–25 → 🟢 „Foarte bine. Aveți reflexe corecte și e greu să fiți păcălit(ă)."
- 26–55 → 🟡 „Bine, dar atenție la câteva capcane. Regula de aur: la orice grabă sau cerere de bani — opriți-vă și sunați un apropiat."
- 56–100 → 🔴 „Atenție mărită. Vă recomandăm să discutați cu un membru al familiei înainte de orice decizie cu bani făcută la telefon sau pe internet."

---

# VERSIUNEA 4 — COMPANII (angajați)

Structură în două părți:
**(A) Bloc general** — pentru orice angajat, indiferent de rol.
**(B) Module pe departament** — întrebări suplimentare pentru cele mai expuse roluri.

La final, scorul combină blocul general + modulul ales. Util ca instrument de training intern.

## (A) Bloc general — orice angajat (7 întrebări, max 10 fiecare → 70)

### 1. Primești un email de la „CEO/șef" care cere urgent o plată sau date confidențiale, „strict secret, nu spune nimănui". Ce faci?
- Verific pe alt canal (sun/Teams) înainte de orice → 0
- Răspund cerând confirmare → 3
- Mă conformez, e de la șef → 9
- Execut imediat, e urgent → 10

### 2. Un email cere să dai click pe un link și să te „reautentifici" la un cont de muncă. Ce faci?
- Nu dau click; merg manual la site-ul oficial → 0
- Verific adresa expeditorului întâi → 3
- Dau click dacă pare de la firmă → 9
- Mă loghez direct prin link → 10

### 3. Folosești parole diferite pentru conturile de muncă și ai 2FA activat?
- Da, parole unice + 2FA peste tot → 0
- Parțial → 5
- Aceeași parolă, fără 2FA → 10

### 4. Găsești un stick USB necunoscut în birou/parcare. Ce faci?
- Îl predau la IT, nu îl bag în calculator → 0
- Îl las acolo → 2
- Îl bag să văd al cui e → 10

### 5. Un „furnizor" trimite o factură cu IBAN schimbat față de cel obișnuit. Ce faci?
- Sun furnizorul la numărul cunoscut ca să confirm → 0
- Întreb colegii/contabilitatea → 3
- Plătesc, e de la furnizorul nostru → 10

### 6. Lucrezi de pe laptopul de muncă pe Wi-Fi public (cafenea, aeroport). Ce faci?
- Folosesc VPN-ul firmei mereu → 0
- Doar pentru lucruri sensibile → 5
- Mă conectez normal, fără VPN → 10

### 7. Dacă observi ceva suspect (email ciudat, cont compromis), știi cui raportezi și o faci?
- Da, raportez imediat la IT/securitate → 0
- Aș întreba un coleg → 5
- Nu știu cui / probabil ignor → 10

## (B) Module pe departament (3 întrebări fiecare, max 10 → 30)

### MODUL: FINANȚE / CONTABILITATE (cel mai expus — fraude de plată)
**1.** Ai un proces de dublă-aprobare pentru plăți sau modificări de IBAN?
- Da, mereu, două persoane → 0 / Uneori → 5 / Nu, decid singur → 10
**2.** O cerere de plată urgentă „în afara procedurii" de la conducere — ce faci?
- Refuz până trece prin proces → 0 / Verific telefonic → 3 / Execut, e urgent → 10
**3.** Verifici schimbările de cont bancar ale furnizorilor pe canal separat?
- Mereu → 0 / Uneori → 5 / Plătesc pe ce scrie în email → 10

### MODUL: HR / RESURSE UMANE (expus — date personale, CV-uri cu malware)
**1.** Deschizi atașamente din CV-uri/aplicații de la candidați necunoscuți?
- Doar în mediu sigur / le scanez → 0 / De obicei direct → 6 / Mereu direct → 10
**2.** Cereri de schimbare a contului unde se virează salariul unui angajat — verifici?
- Confirm direct cu angajatul → 0 / Întreb pe email → 5 / Modific la cerere → 10
**3.** Datele personale ale angajaților sunt accesate/trimise doar pe canale securizate?
- Mereu → 0 / De obicei → 5 / Le trimit pe email normal → 10

### MODUL: IT / ADMINISTRARE SISTEME (țintă de mare valoare)
**1.** Conturile cu privilegii (admin) au 2FA și sunt separate de cele zilnice?
- Da, complet separat → 0 / Parțial → 5 / Folosesc admin pentru tot → 10
**2.** Aplici la timp patch-urile de securitate critice?
- Imediat / automat → 0 / Cu întârziere → 6 / Rar → 10
**3.** Ai backup-uri testate și izolate (împotriva ransomware)?
- Da, testate regulat → 0 / Există dar netestate → 6 / Nu → 10

### MODUL: VÂNZĂRI / RELAȚII CLIENȚI (expus — phishing, date clienți)
**1.** Verifici identitatea unui „client" care cere date sau modificări sensibile?
- Mereu, pe canal oficial → 0 / Uneori → 5 / Am încredere → 10
**2.** Dai click pe linkuri/atașamente din emailuri de la „clienți" noi?
- Verific întâi → 0 / De obicei deschid → 6 / Mereu → 10
**3.** Datele clienților le partajezi doar prin sistemele aprobate?
- Da → 0 / Uneori pe email → 5 / Cum e mai rapid → 10

### MODUL: CONDUCERE / MANAGEMENT (țintă pentru „CEO fraud", spionaj)
**1.** Știi că ești o țintă preferată pentru fraude personalizate (whaling)?
- Da, sunt foarte atent → 0 / Oarecum → 5 / Nu mă gândisem → 10
**2.** Confirmi pe canal secundar cererile financiare făcute în numele tău?
- Am procedură clară → 0 / Uneori → 5 / Mă bazez pe email → 10
**3.** Separi dispozitivele/conturile personale de cele de muncă?
- Da → 0 / Parțial → 5 / Le amestec → 10

**Interpretare companii (scor general + modul, normalizat la 100):**
- 0–20 → 🟢 „Igienă de securitate solidă. Mențineți training-ul periodic."
- 21–45 → 🟡 „Bine, dar există vectori de atac deschiși. Recomandăm training pe punctele slabe."
- 46–70 → 🟠 „Risc ridicat. Mai multe practici expun firma la fraude costisitoare — prioritizați remedierea."
- 71–100 → 🔴 „Risc critic. Firma e foarte expusă la fraude cu pierderi greu de recuperat. Acțiune urgentă recomandată."

---

# Recomandări personalizate (logica comună)

Reține întrebările cu scor mare (≥8 la versiunile pe 10, ≥9 la cele pe 12) și afișează 3 recomandări legate de ele. Dacă sunt mai puține de 3 puncte slabe, completează cu recomandări generale.

**Mapare (adulți / general):**
- Întrebări parolă/2FA mari → „Folosește parole unice + un manager gratuit (ex. Bitwarden) și activează 2FA peste tot."
- Întrebări SMS/apel bancă/premiu mari → „Regula de aur: nicio bancă sau instituție nu cere coduri/parole prin telefon sau SMS. Orice grabă = oprește-te."
- Întrebare URL mare → „Verifică adresa exactă a site-ului pe eVerify înainte să introduci date."
- Întrebare magazin/reducere mare → „Ofertele imposibile sunt momeală. Verifică magazinul pe eVerify înainte de plată."
- Întrebare OLX/IBAN mare → „Verifică IBAN-ul sau telefonul vânzătorului pe eVerify și preferă plata la livrare."
- Întrebare social media mare → „Restrânge ce postezi public — escrocii își construiesc atacul din ce afli despre tine."
- Întrebare update mare → „Pune actualizările pe automat; multe atacuri folosesc găuri deja reparate."

**Companii — adăugări pe modul:**
- Finanțe → „Implementează dublă-aprobare pentru plăți și confirmă orice schimbare de IBAN pe canal separat."
- HR → „Scanează atașamentele din aplicații și confirmă direct cu angajatul orice schimbare de cont salarial."
- IT → „Separă conturile admin, activează 2FA pe ele și testează regulat backup-urile izolate."
- Vânzări → „Verifică identitatea clienților pe canal oficial înainte de date/modificări sensibile."
- Conducere → „Ești țintă de whaling: confirmă pe canal secundar orice cerere financiară făcută în numele tău."

---

# Note de UI / implementare

- **Selector de public la început**: 4 carduri (Copil / Adult / Vârstnic / Companie). La Companie, după blocul general, un al doilea selector pentru departament.
- Întrebări una câte una (ideal pe mobil), cu bară de progres.
- Final: scor normalizat la 100, bară animată colorată pe categorie, categoria text + cele 3 recomandări.
- Buton mare „Distribuie scorul" (Facebook / WhatsApp), text precompletat:
  „Am luat [scor]/100 la testul de vulnerabilitate la scam-uri pe eVerify. Tu cât iei?"
  (la companii: „Cât de pregătită e echipa ta? Testează-te pe eVerify.")
- CTA secundar: „Verifică gratuit un site / număr / IBAN pe eVerify" → linkuri spre paginile de verificare.
- Paletă și componente existente: #f8fafc fundal, #1e293b text, albastru-indigo accent, Plus Jakarta Sans.
- **Fără backend**: tot calculul în React state. Opțional: trimite în Supabase doar scorul final + versiunea (anonim) pentru statistici agregate, ca la /scam-types.
- Fiecare versiune normalizează la /100 (copiii/vârstnicii au 8 întrebări × 12.5; companiile general 70 + modul 30).
