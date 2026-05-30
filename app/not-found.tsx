'use client'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
      
      <div style={{ fontSize: 80, marginBottom: 24 }}>🔍</div>
      
      <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 8, color: '#0ea5e9' }}>404</h1>
      
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        Pagina nu a fost găsită
      </h2>
      
      <p style={{ color: 'rgba(30,41,59,0.65)', fontSize: 16, maxWidth: 480, marginBottom: 32, lineHeight: 1.6 }}>
        Pagina pe care o căutați nu există sau a fost mutată. Verificați adresa URL sau navigați înapoi la pagina principală.
      </p>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => router.push('/')}
          className="btn-pulse"
          style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', border: 'none', color: 'white', padding: '13px 28px', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center' }}
        >
          Pagina principală <span style={{ fontSize: '1.4em', lineHeight: 1 }}>❯</span>
        </button>
        <button
          onClick={() => router.back()}
          className="btn-pulse"
          style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', border: 'none', color: 'white', padding: '13px 28px', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center' }}
        >
          Înapoi <span style={{ fontSize: '1.4em', lineHeight: 1 }}>❯</span>
        </button>
      </div>

      <div style={{ marginTop: 48, display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="/scam-types" style={{ color: 'rgba(30,41,59,0.6)', fontSize: 13, textDecoration: 'none' }}>Tipuri de fraude</a>
        <a href="/check-url" style={{ color: 'rgba(30,41,59,0.6)', fontSize: 13, textDecoration: 'none' }}>Verificare site</a>
        <a href="/prices" style={{ color: 'rgba(30,41,59,0.6)', fontSize: 13, textDecoration: 'none' }}>Prețuri</a>
        <a href="/contact" style={{ color: 'rgba(30,41,59,0.6)', fontSize: 13, textDecoration: 'none' }}>Contact</a>
      </div>

    </div>
  )
}