# Vera — Pachet complet de implementare (eVerify.ro)

## PARTEA 1 — MESAJUL DE SALUT

Text RO: "👋 Salut! Sunt Vera, asistenta eVerify.ro. Te ajut să te protejezi de înșelătorii — mesaje suspecte, SMS-uri, IBAN-uri, site-uri sau oferte de job false. Cu ce te pot ajuta azi?"

Text EN: "👋 Hi! I'm Vera, the eVerify.ro assistant. I help you stay safe from scams — suspicious messages, SMS, IBANs, fake websites or job offers. What can I help you check today?"

## PARTEA 2 — AUTO-DESCHIDERE

Întârziere: 5 secunde. Frecvență: o dată per sesiune (sessionStorage). Pagini: toate.

useEffect(() => {
  const alreadyOpened = sessionStorage.getItem('vera_auto_opened');
  if (!alreadyOpened) {
    const timer = setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem('vera_auto_opened', 'true');
    }, 5000);
    return () => clearTimeout(timer);
  }
}, []);
