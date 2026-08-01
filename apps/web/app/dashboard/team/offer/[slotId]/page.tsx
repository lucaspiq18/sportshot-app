'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { apiClient } from '@/lib/api-client'

export default function MakeOfferPage() {
  const { slotId } = useParams<{ slotId: string }>()
  const { getToken } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ eventName: '', eventDate: '', notes: '', offeredPrice: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const token = await getToken()
      if (!token) return
      await apiClient('/offers', token, {
        method: 'POST',
        body: JSON.stringify({
          slotId,
          eventName: form.eventName,
          eventDate: new Date(form.eventDate).toISOString(),
          notes: form.notes || undefined,
          offeredPrice: Math.round(parseFloat(form.offeredPrice) * 100),
        }),
      })
      router.push('/dashboard/team')
    } catch {
      alert('Error al enviar la oferta. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-2">Hacer oferta</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Rellena los detalles del evento y tu oferta económica</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          required
          placeholder="Nombre del evento"
          value={form.eventName}
          onChange={e => setForm(f => ({ ...f, eventName: e.target.value }))}
          className="px-4 py-3 rounded-lg border text-sm outline-none focus:border-[var(--accent)]"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Fecha del evento</label>
          <input
            required
            type="datetime-local"
            value={form.eventDate}
            onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border text-sm outline-none focus:border-[var(--accent)]"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </div>
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Tu oferta (€)</label>
          <input
            required
            type="number"
            min="1"
            step="0.01"
            placeholder="90"
            value={form.offeredPrice}
            onChange={e => setForm(f => ({ ...f, offeredPrice: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border text-sm outline-none focus:border-[var(--accent)]"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </div>
        <textarea
          placeholder="Notas adicionales (opcional)"
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          rows={3}
          className="px-4 py-3 rounded-lg border text-sm outline-none resize-none focus:border-[var(--accent)]"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 rounded-lg text-sm font-medium border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-lg text-sm font-semibold disabled:opacity-50"
            style={{ background: 'var(--accent)', color: '#0a0f14' }}
          >
            {loading ? 'Enviando...' : 'Enviar oferta'}
          </button>
        </div>
      </form>
    </div>
  )
}
