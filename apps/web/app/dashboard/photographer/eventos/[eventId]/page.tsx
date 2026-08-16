'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { apiClient } from '@/lib/api-client'

type MyBid = {
  id: string
  proposedPrice: number
  message: string | null
  status: string
}

type TeamEvent = {
  id: string
  eventName: string
  sport: string
  city: string
  localidad: string | null
  eventDate: string
  budget: number
  description: string | null
  status: string
  team: { clubName: string; sport: string; city: string }
  bids: MyBid[]
}

export default function EventoDetailPhotographerPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const { getToken } = useAuth()
  const router = useRouter()
  const [event, setEvent] = useState<TeamEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ proposedPrice: '', message: '' })

  async function load() {
    try {
      const token = await getToken()
      if (!token) return
      const data = await apiClient<TeamEvent>(`/team-events/${eventId}`, token)
      setEvent(data)
      if (data.bids.length === 0) {
        setForm(f => ({ ...f, proposedPrice: (data.budget / 100).toFixed(2) }))
      }
    } catch {
      router.push('/dashboard/photographer/eventos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [eventId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const token = await getToken()
      if (!token) return
      await apiClient(`/team-events/${eventId}/bids`, token, {
        method: 'POST',
        body: JSON.stringify({
          proposedPrice: Math.round(parseFloat(form.proposedPrice) * 100),
          message: form.message || undefined,
        }),
      })
      await load()
    } catch (e: any) {
      alert(e?.message ?? 'Error al enviar la puja')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Cargando evento...</p>
    </div>
  )

  if (!event) return null

  const eventDate = new Date(event.eventDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const myBid = event.bids[0] ?? null
  const inputStyle = { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6">
      <div>
        <button onClick={() => router.push('/dashboard/photographer/eventos')} className="text-xs mb-4 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
          ← Volver a partidos
        </button>
        <h1 className="text-2xl font-bold">{event.eventName}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{event.team.clubName}</p>
      </div>

      {/* Info del evento */}
      <section className="p-5 rounded-2xl border flex flex-col gap-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <Row label="Fecha" value={eventDate} />
        <Row label="Deporte" value={event.sport} />
        <Row label="Ubicación" value={event.localidad ? `${event.localidad}, ${event.city}` : event.city} />
        <Row label="Presupuesto del equipo" value={`${(event.budget / 100).toFixed(0)} €`} accent />
      </section>

      {event.description && (
        <section className="p-5 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold mb-2">Descripción</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{event.description}</p>
        </section>
      )}

      {/* Estado de mi puja o formulario para pujar */}
      {myBid ? (
        <section className="p-5 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold mb-3">Tu puja</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{(myBid.proposedPrice / 100).toFixed(0)} €</p>
              {myBid.message && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{myBid.message}</p>}
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: myBid.status === 'accepted' ? '#1a3a2a' : myBid.status === 'rejected' ? '#2a1a1a' : '#1a2a3a',
                color: myBid.status === 'accepted' ? '#4ade80' : myBid.status === 'rejected' ? '#f87171' : '#7ec8e3',
              }}>
              {myBid.status === 'accepted' ? '✓ Aceptada' : myBid.status === 'rejected' ? 'Rechazada' : 'Pendiente de respuesta'}
            </span>
          </div>
          {myBid.status === 'accepted' && (
            <p className="text-xs mt-3 pt-3 border-t" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
              El equipo ha aceptado tu propuesta. Pronto recibirás más detalles.
            </p>
          )}
        </section>
      ) : event.status === 'open' ? (
        <section className="p-5 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold mb-4">Enviar propuesta</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Tu precio (€)</label>
              <input
                required type="number" min="1" step="0.01"
                value={form.proposedPrice}
                onChange={e => setForm(f => ({ ...f, proposedPrice: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border text-sm outline-none focus:border-[var(--accent)]"
                style={inputStyle}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>El equipo propone {(event.budget / 100).toFixed(0)} €</p>
            </div>
            <textarea
              placeholder="Mensaje para el equipo (opcional) — cuéntales tu experiencia, equipo, etc."
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border text-sm outline-none resize-none focus:border-[var(--accent)]"
              style={inputStyle}
            />
            <button type="submit" disabled={submitting}
              className="py-3 rounded-lg text-sm font-semibold disabled:opacity-50"
              style={{ background: 'var(--accent)', color: '#0a0f14' }}>
              {submitting ? 'Enviando...' : 'Enviar propuesta'}
            </button>
          </form>
        </section>
      ) : (
        <div className="p-5 rounded-2xl border text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Este evento ya está cerrado.</p>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="text-xs text-right font-medium" style={{ color: accent ? 'var(--accent)' : 'var(--text)' }}>{value}</span>
    </div>
  )
}
