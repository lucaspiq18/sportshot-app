'use client'
import { useState } from 'react'
import { AvatarUpload } from '@/components/AvatarUpload'

type Me = { id: string; fullName: string; email: string; avatarUrl: string | null; role: string; phone: string | null }

const ROLE_LABEL: Record<string, string> = { photographer: 'Fotógrafo', team: 'Equipo / Club', admin: 'Administrador' }

export function ProfileClient({ me }: { me: Me }) {
  const [avatarUrl, setAvatarUrl] = useState(me.avatarUrl)

  return (
    <div className="flex flex-col gap-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold mb-1">Mi perfil</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Gestiona tu información de cuenta</p>
      </div>

      {/* Avatar */}
      <div className="p-6 rounded-2xl border flex items-center gap-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <AvatarUpload
          currentUrl={avatarUrl}
          name={me.fullName}
          size={80}
          onUpdated={setAvatarUrl}
        />
        <div>
          <p className="font-semibold text-lg">{me.fullName}</p>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{me.email}</p>
          <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(126,200,227,0.1)', color: 'var(--accent)' }}>
            {ROLE_LABEL[me.role] ?? me.role}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-6 rounded-2xl border flex flex-col gap-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <h2 className="font-semibold">Información de cuenta</h2>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Nombre completo</p>
            <p className="text-sm font-medium">{me.fullName}</p>
          </div>
          <div>
            <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Email</p>
            <p className="text-sm font-medium">{me.email}</p>
          </div>
          {me.phone && (
            <div>
              <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Teléfono</p>
              <p className="text-sm font-medium">{me.phone}</p>
            </div>
          )}
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          Para cambiar tu nombre o email, usa la configuración de tu cuenta en el menú superior derecho.
        </p>
      </div>

      <p className="text-xs text-center" style={{ color: 'var(--border)' }}>
        Haz clic en tu foto de perfil para cambiarla · Máx. 5 MB · JPG, PNG o WebP
      </p>
    </div>
  )
}
