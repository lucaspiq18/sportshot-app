'use client'
import { useAuth } from '@clerk/nextjs'
import { useState } from 'react'
import { apiClient } from '@/lib/api-client'

interface Props {
  bookingId: string
  targetName: string
  onSubmitted: () => void
}

export function ReviewForm({ bookingId, targetName, onSubmitted }: Props) {
  const { getToken } = useAuth()
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setError('Selecciona una puntuación'); return }
    setSaving(true)
    setError('')
    try {
      const token = await getToken()
      if (!token) throw new Error('No auth')
      await apiClient(`/bookings/${bookingId}/review`, token, {
        method: 'POST',
        body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
      })
      onSubmitted()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al enviar la reseña')
    } finally {
      setSaving(false)
    }
  }

  const active = hovered || rating

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Valora tu experiencia con <strong style={{ color: 'var(--text)' }}>{targetName}</strong>
      </p>

      {/* Estrellas */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="text-3xl transition-transform hover:scale-110"
            style={{ color: star <= active ? '#f59e0b' : 'var(--border)' }}
          >
            ★
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm self-center" style={{ color: 'var(--text-muted)' }}>
            {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][rating]}
          </span>
        )}
      </div>

      {/* Comentario */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Comentario <span style={{ color: 'var(--border)' }}>(opcional)</span>
        </label>
        <textarea
          rows={3}
          value={comment}
          onChange={e => setComment(e.target.value)}
          maxLength={500}
          placeholder="Cuéntanos cómo fue la experiencia…"
          className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
          style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
        <p className="text-xs mt-1 text-right" style={{ color: 'var(--border)' }}>{comment.length}/500</p>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={saving || rating === 0}
        className="w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40"
        style={{ background: 'var(--accent)', color: '#0a0f14' }}
      >
        {saving ? 'Enviando…' : 'Enviar reseña'}
      </button>
    </form>
  )
}
