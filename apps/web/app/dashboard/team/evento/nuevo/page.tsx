'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { apiClient } from '@/lib/api-client'

export default function NuevoEventoPage() {
  const { getToken } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    eventName: '',
    sport: '',
    city: '',
    eventDate: '',
    eventTime: '10:00',
    budget: '',
    description: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const token = await getToken()
      if (!token) return
      const eventDate = new Date(`${form.eventDate}T${form.eventTime}:00`).toISOString()
      await apiClient('/team-events', token, {
        method: 'POST',
        body: JSON.stringify({
          eventName: form.eventName,
          sport: form.sport,
          city: form.city,
          eventDate,
          budget: Math.round(parseFloat(form.budget) * 100),
          description: form.description || undefined,
        }),
      })
      router.push('/dashboard/team/eventos')
    } catch (e: any) {
      alert(e?.message ?? 'Error al publicar el evento')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-4 py-3 rounded-lg border text-sm outline-none focus:border-[var(--accent)]'
  const inputStyle = { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }

  return (
    <div className="max-w-lg mx-auto">
      <button onClick={() => router.back()} className="text-xs mb-5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>← Volver</button>
      <h1 className="text-2xl font-bold mb-1">Publicar partido</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Los fotógrafos registrados podrán ver tu partido y enviarte su propuesta</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <input
          required placeholder="Nombre del evento (ej. Final Liga Juvenil)"
          value={form.eventName}
          onChange={e => setForm(f => ({ ...f, eventName: e.target.value }))}
          className={inputClass} style={inputStyle}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Deporte</label>
            <input
              required placeholder="Baloncesto"
              value={form.sport}
              onChange={e => setForm(f => ({ ...f, sport: e.target.value }))}
              className={inputClass} style={inputStyle}
            />
          </div>
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Ciudad</label>
            <input
              required placeholder="Madrid"
              value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              className={inputClass} style={inputStyle}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Fecha del partido</label>
            <input
              required type="date" min={new Date().toISOString().split('T')[0]}
              value={form.eventDate}
              onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))}
              className={inputClass} style={inputStyle}
            />
          </div>
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Hora</label>
            <input
              required type="time"
              value={form.eventTime}
              onChange={e => setForm(f => ({ ...f, eventTime: e.target.value }))}
              className={inputClass} style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Presupuesto máximo (€)</label>
          <input
            required type="number" min="1" step="0.01" placeholder="150"
            value={form.budget}
            onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
            className={inputClass} style={inputStyle}
          />
        </div>

        <div>
          <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Descripción (opcional)</label>
          <textarea
            placeholder="Detalles sobre el partido, número de fotos que necesitas..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border text-sm outline-none resize-none focus:border-[var(--accent)]"
            style={inputStyle}
          />
        </div>

        <div className="flex gap-3 mt-1">
          <button type="button" onClick={() => router.back()}
            className="flex-1 py-3 rounded-lg text-sm font-medium border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-3 rounded-lg text-sm font-semibold disabled:opacity-50"
            style={{ background: 'var(--accent)', color: '#0a0f14' }}>
            {loading ? 'Publicando...' : 'Publicar partido'}
          </button>
        </div>
      </form>
    </div>
  )
}
