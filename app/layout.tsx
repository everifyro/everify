import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";
import EmergencyButton from "@/components/EmergencyButton";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html
      lang="ro"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        {children}

        {/* Footer Disclaimer Global */}
        <footer style={{
          background: 'rgba(5,13,26,0.98)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '20px 24px',
          marginTop: 'auto'
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <a href="/de-ce-everify" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textDecoration: 'none' }}>De ce eVerify?</a>
                <a href="/scam-types" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textDecoration: 'none' }}>Tipuri de fraude</a>
                <a href="/check-url" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textDecoration: 'none' }}>Verificare site</a>
                <a href="/prices" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textDecoration: 'none' }}>Prețuri</a>
                <a href="/contact" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textDecoration: 'none' }}>Contact</a>
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                © {new Date().getFullYear()} eVerify. Toate drepturile rezervate.
              </span>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: 0, lineHeight: 1.6, textAlign: 'center' }}>
              <strong style={{ color: 'rgba(255,255,255,0.35)' }}>Disclaimer:</strong> Conținutul generat de platforma eVerify are caracter exclusiv informativ și este produs cu ajutorul inteligenței artificiale. Acesta nu constituie consultanță juridică, tehnică sau financiară și nu poate fi utilizat ca probă sau mijloc de dovadă în niciun proces juridic, administrativ sau de altă natură. eVerify nu garantează acuratețea absolută a rezultatelor. În cazul unor prejudicii financiare, contactați autoritățile competente: Poliția Română (112), DNSC (1911), ANPC (021.9551).
            </p>
          </div>
        </footer>

        <CookieBanner />
        <EmergencyButton />
      </body>
    </html>
  );
}