'use client'
import { usePathname } from 'next/navigation'
import { COMING_SOON } from '@/lib/config'

export default function ShellGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (COMING_SOON && (pathname === '/' || pathname === '/check-ai')) return null
  return <>{children}</>
}
