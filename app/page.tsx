import { COMING_SOON } from '@/lib/config'
import { redirect } from 'next/navigation'

export default function Home() {
  if (!COMING_SOON) redirect('/check-ai')

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: 22, color: '#64748b', fontWeight: 500, margin: 0 }}>În curând</p>
    </div>
  )
}
