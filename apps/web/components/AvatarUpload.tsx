'use client'
import { useAuth } from '@clerk/nextjs'
import { useRef, useState } from 'react'
import { apiClient } from '@/lib/api-client'

interface Props {
  currentUrl?: string | null
  name: string
  size?: number
  onUpdated?: (url: string) => void
}

export function AvatarUpload({ currentUrl, name, size = 64, onUpdated }: Props) {
  const { getToken } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  async function handleFile(file: File) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Solo se aceptan JPG, PNG o WebP')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar 5 MB')
      return
    }

    setError('')
    setUploading(true)

    // Mostrar preview local inmediatamente
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)

    try {
      const token = await getToken()
      if (!token) throw new Error('No auth')

      // 1. Solicitar URL prefirmada
      const { uploadUrl, key } = await apiClient<{ uploadUrl: string; key: string }>(
        '/uploads/avatar',
        token,
        {
          method: 'POST',
          body: JSON.stringify({ contentType: file.type, filename: file.name }),
        }
      )

      // 2. Subir directamente a R2
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      if (!putRes.ok) throw new Error('Error subiendo imagen')

      // 3. Confirmar en backend → actualiza avatarUrl en BD
      const { avatarUrl } = await apiClient<{ avatarUrl: string }>(
        '/uploads/avatar/confirm',
        token,
        { method: 'POST', body: JSON.stringify({ key }) }
      )

      setPreview(avatarUrl)
      onUpdated?.(avatarUrl)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen')
      setPreview(currentUrl ?? null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative group">
        <button
          type="button"
          onClick={() => !uploading && inputRef.current?.click()}
          className="rounded-full overflow-hidden flex items-center justify-center font-bold relative"
          style={{ width: size, height: size, background: 'var(--surface)', border: '2px solid var(--border)', flexShrink: 0 }}
          title="Cambiar foto de perfil"
        >
          {preview ? (
            <img src={preview} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span style={{ fontSize: size * 0.35, color: 'var(--accent)' }}>{initials}</span>
          )}

          {/* Overlay hover */}
          <span
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(10,15,20,0.6)', fontSize: size * 0.22 }}
          >
            {uploading ? '…' : '📷'}
          </span>
        </button>

        {uploading && (
          <span
            className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
          />
        )}
      </div>

      {error && <p className="text-xs text-red-400 text-center max-w-[120px]">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
      />
    </div>
  )
}
