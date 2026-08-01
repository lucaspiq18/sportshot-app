'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { apiClient } from '@/lib/api-client'

const USAGE_OPTIONS = [
  { value: 'social_media', label: 'Redes sociales' },
  { value: 'press', label: 'Prensa' },
  { value: 'internal', label: 'Uso interno' },
]

export default function MakeOfferPage() {
  const { slotId } = useParams<{ slotId: string }>()
  const { getToken } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    eventName: '',
    budgetOffered: '',
    photoCount: '20',
    deadlineHours: '48',
    usage: ['social_media'] as string[],
    message: '',
  })

  function toggleUsage(val: string) {
    setForm(f => ({
      ...f,
      usage: f.usage.includes(val) ? f.usage.filter(u => u !== val) : [...f.usage, val],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.usage.length === 0) { alert('Selecciona al menos un uso'); return }
    setLoading(true)
    try {
      const token = await getToken()
      if (!token) return
      await apiClient('/offers', token, {
        method: 'POST',
        body: JSON.stringify({
          slotId,
          eventName: form.eventName,
          budgetOffered: Math.round(parseFloat(form.budgetOffered) * 100),
          deliverables: {
            photoCount: parseInt(form.photoCount),
            deadlineHours: parseInt(form.deadlineHours),
            usage: form.usage,
          },
          message: form.message || undefined,
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
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Rellena los detalles del evento y tu oferta</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <input
          required
          placeholder="Nombre del evento"
          value={form.eventName}
          onChange={e => setForm(f => ({ ...f, eventName: e.target.value }))}
          className="px-4 py-3 rounded-lg border text-sm outline-none focus:border-[var(--accent)]"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />

        <div>
          <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Tu oferta (€)</label>
          <input
            required type="number" min="1" step="0.01" placeholder="90"
            value={form.budgetOffered}
            onChange={e => setForm(f => ({ ...f, budgetOffered: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border text-sm outline-none focus:border-[var(--accent)]"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Nº de fotos</label>
            <input
              required type="number" min="1" placeholder="20"
              value={form.photoCount}
              onChange={e => setForm(f => ({ ...f, photoCount: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border text-sm outline-none focus:border-[var(--accent)]"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Entrega en (horas)</label>
            <input
              required type="number" min="1" placeholder="48"
              value={form.deadlineHours}
              onChange={e => setForm(f => ({ ...f, deadlineHours: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border text-sm outline-none focus:border-[var(--accent)]"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>
        </div>

        <div>
          <label className="text-xs mb-2 block" style={{ color: 'var(--text-muted)' }}>Uso de las fotos</label>
          <div className="flex gap-2 flex-wrap">
            {USAGE_OPTIONS.map(opt => (
              <button
                key={opt.value} type="button"
                onClick={() => toggleUsage(opt.value)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                style={{
                  background: form.usage.includes(opt.value) ? 'var(--accent)' : 'var(--surface)',
                  color: form.usage.includes(opt.value) ? '#0a0f14' : 'var(--text-muted)',
                  borderColor: form.usage.includes(opt.value) ? 'var(--accent)' : 'var(--border)',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          placeholder="Mensaje para el fotógrafo (opcional)"
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          rows={3}
          className="px-4 py-3 rounded-lg border text-sm outline-none resize-none focus:border-[var(--accent)]"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />

        <div className="flex gap-3 mt-1">
          <button
            type="button" onClick={() => router.back()}
            className="flex-1 py-3 rounded-lg text-sm font-medium border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Cancelar
          </button>
          <button
            type="submit" disabled={loading}
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
