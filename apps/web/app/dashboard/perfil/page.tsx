import { apiServer } from '@/lib/api'
import { ProfileClient } from './ProfileClient'

type Me = { id: string; fullName: string; email: string; avatarUrl: string | null; role: string; phone: string | null }

export default async function PerfilPage() {
  let me: Me | null = null
  try { me = await apiServer<Me>('/me') } catch {}

  if (!me) {
    return (
      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
        No se pudo cargar el perfil.
      </div>
    )
  }

  return <ProfileClient me={me} />
}
