# Prompt pentru Claude Code — Implementare /scam-score

Copiază tot ce urmează și lipește în Claude Code.

---

Creează pagina `/scam-score` după specificațiile de mai jos.

## Design — Varianta imersivă dark (obligatoriu)

- Fundal: `#0F172A` (dark navy) pe toată pagina, nu doar pe container
- Întrebări una câte una, tranziție smoothă între ele (fade sau slide)
- Sus: bara de progres din segmente (ex. 10 segmente, cele parcurse = alb 40%, cel curent = #60A5FA, viitoarele = alb 15%)
- Întrebarea: font 20-22px, alb, max-width 560px, line-height 1.45
- Răspunsuri: grid 2x2 (sau coloană pe mobil), fiecare card cu background rgba(255,255,255,0.05), border rgba(255,255,255,0.1), hover → border #60A5FA + background rgba(96,165,250,0.15)
- La selecție: highlight imediat + buton "Continuă" devine activ
- Font: Plus Jakarta Sans (deja în proiect)
- Responsive: pe mobil răspunsurile devin coloană 1x4

## Selector de public (primul ecran, înainte de întrebări)

4 carduri în grid 2x2:
- 👦 Copil (8–14 ani)
- 🧑 Adult
- 👵 Vârstnic (65+)
- 🏢 Companie

La Companie: după selectare apare un al doilea selector de departament:
- Orice angajat (general)
- Finanțe / Contabilitate
- HR / Resurse Umane
- IT / Administrare sisteme
- Vânzări / Relații clienți
- Conducere / Management

## Întrebări — din fișierul scam-score-v2-spec.md

Folosește exact întrebările și punctajele din specificație pentru fiecare versiune de public.
Normalizare la /100 pentru toate versiunile (copii și vârstnici au 8 întrebări × 12.5).
La companii: scor general (7 întrebări × 10 = 70) + modul departament (3 întrebări × 10 = 30) = 100.

## Ecranul de rezultat

- Scor mare afișat central (font 64px, bold, culoare după categorie)
- Bară animată (fill de la 0 la scor final, animație 1.2s ease-out)
- Categoria text + descriere (din specificație)
- 3 recomandări personalizate (carduri, alese pe baza întrebărilor cu scor mare)
- Buton mare "Distribuie scorul tău" cu text pre-completat:
  - WhatsApp: `https://wa.me/?text=Am luat [SCOR]/100 la testul de vulnerabilitate la scam-uri pe eVerify. Tu cât iei? → everify.ro/scam-score`
  - Facebook: `https://www.facebook.com/sharer/sharer.php?u=https://everify.ro/scam-score`
- CTA secundar: "Verifică gratuit un site pe eVerify" → `/check-url`
- Buton "Ia testul din nou" → resetează starea

## Tracking Supabase (opțional, anonim)

La final, trimite în Supabase un rând cu: `{ public_type, score, created_at }` — fără date personale.
Tabelul se numește `scam_score_results` (creează-l dacă nu există, cu RLS public insert only).

## Ruta și navigare

- Ruta: `/scam-score`
- Adaugă link în header și în footer sub "Instrumente"
- Adaugă în sitemap.xml

## Note tehnice

- Tot calculul în React state — fără backend pentru quiz
- Folosește componentele și layout-ul existent din proiect
- Nu folosi librării noi de animație — CSS transitions sunt suficiente
- Verifică că pagina trece `npx tsc --noEmit` după implementare
