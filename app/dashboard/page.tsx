'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [analyses, setAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
        return
      }
      fetchData(session.user.id)
    })
  }, [])

  const fetchData = async (uid: string) => {
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single()
    setProfile(prof)

    const { data: hist } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(10)
    setAnalyses(hist || [])
    setLoading(false)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Se încarcă...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>
            <span style={{ color: '#0ea5e9' }}>e</span>Verify Dashboard
          </h1>
          <button onClick={logout} style={{ background: 'rgba(30,41,59,0.06)', border: '1px solid rgba(30,41,59,0.12)', color: '#1e293b', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>
            Deconectare
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
          <div style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: 12, padding: 20 }}>
            <p style={{ color: 'rgba(30,41,59,0.65)', fontSize: 13, marginBottom: 8 }}>Credite rămase</p>
            <p style={{ fontSize: 36, fontWeight: 800, color: '#0ea5e9' }}>{profile?.credits ?? 0}</p>
          </div>
          <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, padding: 20 }}>
            <p style={{ color: 'rgba(30,41,59,0.65)', fontSize: 13, marginBottom: 8 }}>Plan activ</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: '#6366f1', textTransform: 'uppercase' }}>{profile?.plan ?? 'free'}</p>
          </div>
        </div>

        <div style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 12, padding: 20, marginBottom: 32, textAlign: 'center' }}>
          <p style={{ marginBottom: 12, color: 'rgba(30,41,59,0.65)' }}>Ai nevoie de mai multe credite?</p>
          <button onClick={() => router.push('/prices')} className="btn-pulse" style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', border: 'none', color: 'white', padding: '10px 24px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center' }}>
            Cumpără credite <span style={{ fontSize: '1.4em', lineHeight: 1 }}>❯</span>
          </button>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Istoric analize</h2>
        {analyses.length === 0 ? (
          <p style={{ color: 'rgba(30,41,59,0.5)' }}>Nu ai făcut nicio analiză încă.</p>
        ) : (
          analyses.map((a, i) => (
            <div key={i} style={{ background: '#ffffff', border: '1px solid rgba(30,41,59,0.1)', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
              <p style={{ fontSize: 13, color: 'rgba(30,41,59,0.6)', marginBottom: 6 }}>
                {new Date(a.created_at).toLocaleDateString('ro-RO')}
              </p>
              <p style={{ fontSize: 14, color: 'rgba(30,41,59,0.85)', marginBottom: 8 }}><strong>Întrebare:</strong> {a.question}</p>
              <p style={{ fontSize: 13, color: 'rgba(30,41,59,0.65)', whiteSpace: 'pre-wrap' }}>{a.answer?.slice(0, 200)}...</p>
            </div>
          ))
        )}

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <button onClick={() => router.push('/')} className="btn-pulse" style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', border: 'none', color: 'white', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center' }}>
            Înapoi la verificator <span style={{ fontSize: '1.4em', lineHeight: 1 }}>❯</span>
          </button>
        </div>

      </div>
    </div>
  )
}