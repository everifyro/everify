import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";
import EmergencyButton from "@/components/EmergencyButton";
import Header from "@/components/Header";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "eVerify — Protecție Anti-Scam România",
  description: "Verificați mesaje suspecte și site-uri web cu ajutorul inteligenței artificiale. Platforma românească anti-scam cu peste 200 tipuri de fraude documentate.",
  keywords: "scam, frauda, verificare, anti-scam, Romania, escrocherie, phishing, verificare site",
  openGraph: {
    title: "eVerify — Protecție Anti-Scam România",
    description: "Verificați mesaje suspecte și site-uri web cu ajutorul inteligenței artificiale.",
    url: "https://everify.ro",
    siteName: "eVerify",
    locale: "ro_RO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className={`${plusJakarta.variable} h-full`}>
      <body className="min-h-full flex flex-col" style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif', background: '#f8fafc', color: '#1e293b' }}>
        <Header />
        {children}

        {/* Footer */}
        <footer style={{
          background: '#1e293b',
          padding: '24px 24px',
          marginTop: 'auto',
          position: 'relative'
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>

            {/* Trust badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
              {[
                '🔒 256-bit SSL Encrypted',
                '✅ GDPR Compliant',
                '🛡️ Powered by Google Safe Browsing',
                '🌐 Verificare Interpol/Europol URLhaus',
                '💳 Plăți securizate prin Stripe',
              ].map((b, i) => (
                <span key={i} style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{b}</span>
              ))}
              <span style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span><span style={{ color: '#0ea5e9' }}>e</span>Verify</span>
                <span style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: 'white', borderRadius: 4, padding: '1px 5px', fontSize: 9, fontWeight: 800 }}>AI</span>
              </span>
              {[
                '🇷🇴 Made in Romania',
                '🚫 Nu vindem date personale',
                '🌍 Date stocate în UE',
                '💯 200+ tipuri de fraude documentate',
                '⚡ Verdict în sub 5 secunde',
                '🏆 Cea mai completă bază de date anti-scam din România',
              ].map((b, i) => (
                <span key={i} style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{b}</span>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <a href="/de-ce-everify" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textDecoration: 'none' }}>De ce eVerify?</a>
                <a href="/scam-types" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textDecoration: 'none' }}>Tipuri de fraude</a>
                <a href="/check-url" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textDecoration: 'none' }}>Verificare site</a>
                <a href="/prices" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textDecoration: 'none' }}>Prețuri</a>
                <a href="/contact" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textDecoration: 'none' }}>Contact</a>
                <a href="/privacy" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textDecoration: 'none' }}>Confidențialitate</a>
                <a href="/terms" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textDecoration: 'none' }}>Termeni și Condiții</a>
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                © {new Date().getFullYear()} eVerify. Toate drepturile rezervate.
              </span>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: 1.6, textAlign: 'center' }}>
              <strong style={{ color: 'rgba(255,255,255,0.45)' }}>Disclaimer:</strong> Conținutul generat de platforma eVerify are caracter exclusiv informativ și este produs cu ajutorul inteligenței artificiale. Acesta nu constituie consultanță juridică, tehnică sau financiară și nu poate fi utilizat ca probă sau mijloc de dovadă în niciun proces juridic, administrativ sau de altă natură. eVerify nu garantează acuratețea absolută a rezultatelor. În cazul unor prejudicii financiare, contactați autoritățile competente: Poliția Română (112), DNSC (1911), ANPC (021.9551).
            </p>
          </div>
        </footer>

        <CookieBanner />
        <EmergencyButton />
      </body>
    </html>
  );
}