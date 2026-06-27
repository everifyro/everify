# eVerify — Progress Tracker

> Document viu, actualizat la finalul fiecărei sesiuni. Bază fixă + adăugiri, nu rescriere completă.

## CONTEXT PROIECT
Platformă românească anti-fraudă, operator Portal Net Services SRL (CUI RO37812015). Stack: Next.js, Vercel, Supabase, Stripe, Anthropic API, MailerLite. GitHub: github.com/everifyro/everify. Local: ~/Projects/everify. Claude Code: cd ~/Projects/everify && claude → /model claude-sonnet-4-6. Server local: npm run dev.

**Preferințe stilistice:** ton formal/protocolar tip autoritate publică; niciodată nu se menționează Claude/Anthropic (foloseste "modele AI verificate și performante"); "Platforma eVerify" ca operator de date; termen "credite" nu "verificări".

---

## 1. CE AM IMPLEMENTAT

### Infrastructură
- Next.js, Vercel, Supabase, Stripe, Anthropic API, MailerLite — toate conectate
- Supabase Pro ($25/lună) — fără risc pauză automată, backup zilnic 7 zile
- Vercel Pro ($20/lună)
- everify.ro — DNS + SSL complet funcțional (nameservere Vercel prin Romarg)
- Autentificare Supabase, tabele: profiles, analyses, scam_reports, report_entities, newsletter_tokens
- Font: Plus Jakarta Sans

### Pagini de verificare
- AI Checker (/check-ai) — 1 credit, system prompt 6 reguli
- /check-url — 10 surse threat intelligence (Google Safe Browsing, URLhaus, VirusTotal, OpenPhish, crt.sh, RDAP, IPInfo, AbuseIPDB, Shodan) + typosquatting, 2 credite
- /check-iban — MOD97 + bănci RO + SEPA, 1 credit
- /check-job — 7 module, scor 0-100, gate completitudine, 2 credite

### Sistem typosquatting (rescris, validat)
- 1143 branduri românești protejate (din CSV 5000 branduri)
- 4 patternuri de detecție: brand-segment cu "-", brand exact+TLD greșit, Levenshtein ≤1 (5+ caractere), concatenat fără separator (6+ caractere)
- Testat: wise.com, btleasing.ro, ing.com, bancatransilvania.it → 100/100 corect; anaf-login.com, paypal-secure.net, ing-bank-ro.com → 25/100 corect
- Penalizare: typosquatting confirmat → scor maxim 25/100

### Features transversale
- Upload imagini + OCR (Claude Haiku vision), stocare doar text extras
- Scroll automat + highlight glow
- Newsletter popup (60s, 3 credite bonus după confirmare) — automatizare email NU trimite încă efectiv
- Abonare automată la newsletter la înregistrare
- Structură corelare raportări (report_entities + getCorrelations()) — bază grafic relații viitor
- Vera Bot — ghidează spre tool-uri, nu verifică ea însăși
- SOS + Raportează
- Homepage = "Coming Soon" neutru (COMING_SOON flag în lib/config.ts), AI Checker mutat la /check-ai

### Monetizare
- Stripe: Starter 5€/20cr, Basic 9€/50cr, Pro 19€/120cr, Expert 49€/350cr
- Pagini: /scam-types, /preturi, /raporteaza, /scam-score, /dashboard, /contact, /privacy, /terms

### Fix-uri vizuale recente
1. Popup newsletter fără blur
2. Header fundal solid opac
3. Carduri statistici homepage centrate
4. "Ghid complet" → /scam-types
5. Card "200+ tipuri fraude" — emoji+text actualizat
6. Centrare text carduri scurte (toate paginile)
7. Hierarhie butoane — un CTA pulsant per pagină
8. AI Checker mutat / → /check-ai

---

## 2. CE A RĂMAS DE IMPLEMENTAT

### 🔴 URGENT — bug critic
Pe mobil (telefon real, confirmat incognito), toate paginile: butonul "Verifică" nu declanșează nimic, meniu hamburger nu se deschide, SOS și Raportează nu răspund la click (nici deschidere, nici X).

Diagnostic parțial: overlay invizibil position:fixed din NewsletterPopup.tsx bloca click-uri după 60s. Fix aplicat (pointerEvents none/auto) — problema PERSISTĂ după fix.

Plan debug: verifică TOATE position:fixed din Header.tsx, EmergencyButton.tsx, ReportButton.tsx, VeraBot.tsx, layout.tsx, cookie banner. Confirmă pointer-events:none pe fiecare în stare inactivă. Test cu console.log în onClick handlers.

Bug conex: SOS poziționat vizual peste meniu hamburger pe mobil.

### 🟡 Bug-uri minore
- Credite afișează "—" în loc de număr pe mobil (/check-url)
- Input+buton "Verifică" se înghesuie pe ecrane <480px (parțial fixat, nu universal)
- crt.sh "undefined zile — undefined cert." intermitent (parsing bug)
- MailerLite — email confirmare {{confirm_url}} NU se trimite (automație neconfigurată)

### Features noi planificate
- Dark mode toggle
- Widget feedback in-app
- Popup 👍👎 post-verificare
- Email follow-up MailerLite după prima verificare reală (24-48h)
- Sistem afiliere (/afiliere + dashboard + ?ref=)
- Have I Been Pwned, /check-shop, /check-invest, /check-rent, /check-phone, PDF analysis
- Grafic relații vizual (dependent de volum date raportări)
- PhishTank (înregistrări temporar dezactivate la ei)
- SEO, FAQ, selector limbă RO/EN, testimoniale, 2FA

---

## 3. DE ȚINUT CONT

### Decizii business
- Logo eVerify — neterminat (vectorizare cerea plată), AMÂNAT
- Brand "eVerify" PĂSTRAT (OSIM liber RO; conflict UK doar la EUIPO, risc acceptabil pe termen scurt)
- OSIM — NU se înregistrează pe persoană fizică (expune date personale); se așteaptă SRL nou sau reactivare Portal Net Services
- Portal Net Services SRL — reactivare în curs (nu dizolvare), accountant Emilia Petre are documentația
- Site ascuns public — homepage "Coming Soon" până la lansare (1 aug 2026), Vercel Password Protection prea scump ($150/lună)
- Vercel "Improve models with my data" — DEZACTIVAT explicit

### Plan de afaceri
- Document .docx generat: P&L 2026 (aug-dec) și 2027, asumpții explicite (NU date validate)
- MAU 800→33.000, conversie 5%, ARPU 24 RON/lună, marketing 500€→300€/lună
- Cost unic OSIM+SRL ~1100€ (T3 2026)

### Reguli tehnice permanente
- Niciun proiect pe Desktop/Documents (iCloud blochează git) — mereu ~/Projects/
- Secrete API — editate manual în .env.local (open -e), NICIODATĂ prin Claude Code direct
- Threat intelligence surse gratuite — VirusTotal/AbuseIPDB/IPInfo/Shodan cu key, restul fără
- Whitelist domenii ELIMINAT din typosquatting (înlocuit cu 4 patternuri)

### Greșeli de evitat
- Grupează fix-uri într-un singur prompt, nu fragmentat
- Nu accepta sugestii auto din coada Claude Code fără verificare
- Nu presupune fix global după un singur test — verifică pe toate paginile
- .env.local — editare manuală, nu prin Claude Code
