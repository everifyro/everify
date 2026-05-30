# Scam Score — Capcane + ordine amestecată (toate versiunile)

## Principii aplicate
- Răspunsul corect (0 puncte) NU e primul în listă la nicio întrebare
- Cel puțin 1-2 întrebări capcană per versiune (supraîncredere testată)
- Ordinea răspunsurilor e amestecată — nu de la "cel mai bun" la "cel mai rău"
- Capcanele sunt marcate cu [CAPCANĂ] în spec, dar NU în UI

---

## VERSIUNEA ADULȚI — modificări față de v1

### Întrebarea 3 (URL site) — ordine amestecată
Ordinea răspunsurilor:
1. Rar → 8
2. Niciodată / nu știu ce să caut → 10
3. Mereu, verific fiecare literă → 0  ← corect, dar al treilea
4. Doar dacă pare suspect → 4

### Întrebarea 4 (parole) — ordine amestecată
1. Da, cam aceeași peste tot → 10
2. Nu, fiecare cont are parolă unică (am manager de parole) → 0  ← corect, dar al doilea
3. Câteva variații ale aceleiași parole → 5

### Întrebarea capcană nouă — înlocuiește întrebarea 10 (actualizări)
[CAPCANĂ] Întrebarea: "Ai primit vreodată un email de phishing și l-ai recunoscut imediat. Înseamnă că ești protejat?"
- Da, dacă îl recunosc înseamnă că sunt vigilent → 8  ← capcană: supraîncredere
- Nu neapărat — atacurile evoluează constant și unul mai sofisticat mă poate prinde → 0  ← corect
- Depinde de cât de convingător e emailul → 5
- Nu am primit niciodată email de phishing → 9  ← capcană: nimeni nu e ocolit

**De ce e capcană:** Oamenii care cred că "recunosc phishing-ul" sunt mai vulnerabili la atacuri sofisticate — supraîncrederea e un risc real.

---

## VERSIUNEA COPII — modificări față de v1

### Întrebarea 1 (skin-uri/parola) — ordine amestecată
1. Poate, dacă pare de treabă → 10
2. Da, vreau skin-urile → 12
3. Nu dau parola nimănui, niciodată → 0  ← corect, dar al treilea
4. Întreb un părinte → 3

### Întrebarea capcană nouă
[CAPCANĂ] Întrebarea: "Prietenul tău cel mai bun de la școală îți cere pe chat parola la un joc ca să îți trimită un cadou surpriză. Ce faci?"
- Îi dau parola, e cel mai bun prieten al meu → 10  ← capcană: chiar și prietenii pot fi compromisi
- Nu dau parola nimănui, nici prietenilor → 0  ← corect
- Îl întreb de ce are nevoie de parolă → 4
- Îi spun părinților despre cerere → 2

**De ce e capcană:** Copiii cred că prietenii sunt siguri. Conturile prietenilor pot fi compromise sau cererea poate veni de la cineva care pretinde că e prietenul lor.

### Întrebarea 5 (download joc) — ordine amestecată
1. Descarc, vreau jocul → 11
2. Apăs pe tot ca să meargă → 12
3. Întreb un adult întâi → 0  ← corect, dar al treilea
4. Doar din magazinul oficial (App Store/Google Play) → 1

---

## VERSIUNEA VÂRSTNICI — modificări față de v1

### Întrebarea 1 (nepot la nevoie) — ordine amestecată
1. Mă panichez, dar verific întâi → 6
2. Trimit banii imediat, e o urgență → 12
3. Închid și sun eu direct ruda la numărul ei știut → 0  ← corect, dar al treilea
4. Întreb detalii pe care doar ruda le-ar ști → 2

### Întrebarea capcană nouă
[CAPCANĂ] Întrebarea: "Folosești internetul doar pentru lucruri simple (email, știri). Ești mai puțin expus la fraude decât cei care fac cumpărături online?"
- Da, cu cât folosești mai puțin internetul, cu atât ești mai sigur → 9  ← capcană: fals
- Nu neapărat — fraudele vin și prin email și telefon, nu doar prin cumpărături → 0  ← corect
- Poate, depinde de ce site-uri vizitezi → 5
- Da, eu nu dau datele cardului online → 7  ← capcană parțială: frauda vine și prin telefon

**De ce e capcană:** Vârstnicii care folosesc puțin internetul cred că sunt în afara pericolului. De fapt fraudele prin telefon și email simplu îi vizează exact pe ei.

### Întrebarea 8 (graba) — ordine amestecată
1. Fac ce zice, ca să nu pierd → 12
2. Mă stresez și acționez repede → 11
3. Mă opresc — graba e semn de înșelătorie → 0  ← corect, dar al treilea
4. Cer timp de gândire → 3

---

## VERSIUNEA COMPANII — modificări față de v2

### BLOC GENERAL

#### Întrebarea 1 (link reautentificare) — ordine amestecată
1. Dau click dacă pare de la firmă → 9
2. Mă loghez direct prin link → 10
3. Verific adresa expeditorului înainte → 3
4. Nu dau click — merg manual la site-ul oficial → 0  ← corect, dar al patrulea

#### Întrebarea 3 (stick USB) — ordine amestecată
1. Îl introduc să văd al cui e → 10
2. Îl predau la IT, nu îl introduc în calculator → 0  ← corect, dar al doilea
3. Îl las acolo → 2

#### Întrebare capcană generală
[CAPCANĂ] Întrebarea: "Firma voastră a făcut un training de securitate acum 6 luni. Angajații sunt pregătiți?"
- Da, training-ul acoperă tot ce trebuie știut → 9  ← capcană: un training vechi nu e suficient
- Parțial — amenințările evoluează, e nevoie de training periodic → 0  ← corect
- Depinde cât de bun a fost training-ul → 5
- Da, dacă angajații au trecut testul final → 7  ← capcană: testul nu garantează comportamentul real

**De ce e capcană:** Firmele care au făcut un training cred că sunt protejate. Atacatorii știu asta și lovesc după perioade de „relaxare".

---

### MODUL FINANȚE

#### Întrebarea 8 (CEO fraud) — ordine amestecată
1. Execut imediat, e de la CEO → 10
2. Execut dacă emailul pare autentic → 9
3. Răspund cerând confirmare scrisă → 3
4. Refuz și verific pe alt canal (telefon/Teams) înainte de orice → 0  ← corect, dar al patrulea

#### Întrebare capcană Finanțe
[CAPCANĂ] Întrebarea: "Cunoașteți personal furnizorul și lucrați cu el de ani de zile. Primiți o factură cu IBAN nou. Verificați?"
- Nu, îl cunoaștem bine, nu e nevoie → 10  ← capcană: relațiile de lungă durată sunt exploatate exact pentru asta
- Da, sun mereu la numărul din contract indiferent de cine e furnizorul → 0  ← corect
- Poate, dacă suma e mare → 6
- Întreb colegul care se ocupă de furnizor → 4

---

### MODUL HR

#### Întrebarea 8 (CV cu atașament periculos) — ordine amestecată
1. Îl deschid direct — vreau să văd CV-ul → 10
2. Îl deschid doar dacă candidatul pare serios → 7
3. Îl trimit la IT pentru scanare înainte de a-l deschide → 0  ← corect, dar al treilea

#### Întrebare capcană HR
[CAPCANĂ] Întrebarea: "Un angajat vă trimite cererea de schimbare cont bancar de pe emailul lui de firmă, cu semnătură digitală. Procesați?"
- Da, e de pe emailul oficial cu semnătură → 9  ← capcană: emailul de firmă poate fi compromis
- Da, semnătura digitală confirmă identitatea → 8  ← capcană: semnăturile pot fi falsificate
- Nu — confirm direct cu angajatul față în față sau telefonic → 0  ← corect
- Întreb managerul lui să confirme → 3

---

### MODUL IT

#### Întrebarea 9 (ransomware primele 5 minute) — ordine amestecată
1. Încerc să rezolv direct pe calculator → 10
2. Încerc să înțeleg situația înainte să acționez → 5
3. Izoleze imediat calculatorul din rețea + alertez echipa + activez planul de incident → 0  ← corect, dar al treilea

#### Întrebare capcană IT
[CAPCANĂ] Întrebarea: "Aveți antivirus actualizat pe toate calculatoarele. Sunteți protejați împotriva ransomware?"
- Da, antivirusul detectează orice ransomware → 9  ← capcană: antivirusul nu detectează ransomware nou (zero-day)
- Parțial — antivirusul e un strat, dar backup-urile izolate și segmentarea rețelei sunt esențiale → 0  ← corect
- Depinde de cât de nou e ransomware-ul → 4
- Da, plus că avem și firewall → 7  ← capcană: firewall + antivirus nu sunt suficiente fără backup izolat

---

### MODUL VÂNZĂRI

#### Întrebarea 8 (contract cu macros) — ordine amestecată
1. Activez, vreau să văd contractul → 10
2. Activez dacă documentul pare oficial → 8
3. Nu activez macro-urile — trimit documentul la IT → 0  ← corect, dar al treilea

#### Întrebare capcană Vânzări
[CAPCANĂ] Întrebarea: "Un client fidel de 3 ani vă cere datele de contact ale unui alt client, spunând că vor să colaboreze. Ce faceți?"
- Îi dau datele, e un client de încredere → 10  ← capcană: nici clienții fideli nu primesc date ale altor clienți
- Întreb managerul înainte → 3
- Refuz — datele clienților sunt confidențiale indiferent de cine cere → 0  ← corect
- Trimit dacă clientul semnează o declarație → 6  ← capcană parțială: tot e o breșă GDPR

---

### MODUL CONDUCERE

#### Întrebarea 8 (avocat fraudulos) — ordine amestecată
1. Transfer imediat — urgența și confidențialitatea sunt semne de legitimitate → 10
2. Acționez — e o situație legală sensibilă → 9
3. Cer mai multe detalii înainte → 4
4. Verific identitatea avocatului pe alt canal și refuz să acționez fără procedură → 0  ← corect, dar al patrulea

#### Întrebare capcană Conducere
[CAPCANĂ] Întrebarea: "Sunteți sigur că angajații voștri nu ar cădea în capcana unui email de phishing. De ce?"
- Da, am angajați experimentați și educați → 8  ← capcană: supraîncredere în oameni
- Da, am instalat filtre anti-spam bune → 7  ← capcană: filtrele nu prind tot
- Nu sunt 100% sigur — oricine poate fi păcălit în ziua proastă, inclusiv eu → 0  ← corect
- Depinde de angajat → 4

---

## Instrucțiuni de implementare pentru Claude Code

1. Pentru fiecare întrebare listată mai sus, înlocuiește ordinea răspunsurilor în `page.tsx` cu ordinea din acest document.
2. Adaugă întrebările capcană ca întrebări suplimentare (una per versiune/modul).
3. Numărul total de întrebări crește cu 1 per versiune/modul — renormalizează scorurile.
4. NU afișa [CAPCANĂ] în UI — e doar pentru documentație internă.
5. Capcanele nu au răspuns "evident corect" la primul loc — utilizatorul trebuie să gândească.
