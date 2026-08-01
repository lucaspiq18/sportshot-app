import { UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { apiServer } from '@/lib/api'

type Me = { fullName: string; avatarUrl: string | null; role: string }

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let me: Me | null = null
  try { me = await apiServer<Me>('/me') } catch {}

  const initials = (me?.fullName ?? '?')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <nav className="flex items-center justify-between px-8 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-6">
          <Link href="/dashboard"><Logo height={28} /></Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/perfil"
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-colors hover:opacity-80"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            title="Mi perfil"
          >
            <div
              className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--accent)' }}
            >
              {me?.avatarUrl ? (
                <img src={me.avatarUrl} alt={me.fullName} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--text)' }}>
              {me?.fullName?.split(' ')[0] ?? 'Perfil'}
            </span>
          </Link>
          <UserButton />
        </div>
      </nav>
      <main className="flex-1 px-8 py-8 max-w-6xl mx-auto w-full">{children}</main>
    </div>
  )
}
