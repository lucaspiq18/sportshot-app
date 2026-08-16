'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { apiClient } from '@/lib/api-client'

type Bid = {
  id: string
  proposedPrice: number
  message: string | null
  status: string
  createdAt: string
  photographer: {
    user: { fullName: string; avatarUrl: string | null }
  }
}

type TeamEvent = {
  id: string
  eventName: string
  sport: string
  city: string
  eventDate: string
  budget: number
  description: string | null
  status: string
  team: { clubName: string }
  bids: Bid[]
}

export default function EventoDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const { getToken } = useAuth()
  const router = useRouter()
  const [event, setEvent] = useState<TeamEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)

  async function load() {
    try {
      const token = await getToken()
      if (!token) return
      const data = await apiClient<TeamEvent>(`/team-events/${eventId}`, token)
      setEvent(data)
    } catch {
      router.push('/dashboard/team/eventos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [eventId])

  async function handleBid(bidId: string, action: 'accept' | 'reject') {
    setActing(bidId + action)
    try {
      const token = await getToken()
      if (!token) return
      await apiClient(`/team-events/${eventId}/bids/${bidId}/${action}`, token, { method: 'POST', body: '{}' })
      await load()
    } catch (e: any) {
      alert(e?.message ?? 'Error al procesar la puja')
    } finally {
      setActing(null)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Cargando evento...</p>
    </div>
  )

  if (!event) return null

  const eventDate = new Date(event.eventDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const pendingBids = event.bids.filter(b => b.status === 'pending')
  const resolvedBids = event.bids.filter(b => b.status !== 'pending')

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <button onClick={() => router.push('/dashboard/team/eventos')} className="text-xs mb-4 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>← Mis partidos</button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{event.eventName}</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{event.sport} · {event.city} · {eventDate}</p>
          </div>
          <span className="px-2 py-1 rounded-full text-xs font-medium shrink-0"
            style={{
              background: event.status === 'open' ? '#1a3a2a' : '#2a2a1a',
              color: event.status === 'open' ? '#4ade80' : '#facc15',
            }}>
            {event.status === 'open' ? 'Abierto' : event.status === 'closed' ? 'Cerrado' : 'Cancelado'}
          </span>
        </div>
      </div>

      <div className="p-5 rounded-2xl border flex justify-between items-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div>
          <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Presupuesto publicado</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{(event.budget / 100).toFixed(0)} €</p>
        </div>
        {event.description && (
          <p className="text-sm max-w-xs text-right" style={{ color: 'var(--text-muted)' }}>{event.description}</p>
        )}
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-4">
          Pujas recibidas {pendingBids.length > 0 && <span className="ml-2 px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--accent)', color: '#0a0f14' }}>{pendingBids.length}</span>}
        </h2>

        {event.bids.length === 0 ? (
          <div className="p-6 rounded-xl border text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Aún no hay fotógrafos interesados. Las propuestas aparecerán aquí.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {[...pendingBids, ...resolvedBids].map(bid => (
              <div key={bid.id} className="p-4 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: 'var(--accent)', color: '#0a0f14' }}>
                      {bid.photographer.user.fullName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{bid.photographer.user.fullName}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--accent)' }}>
                        {(bid.proposedPrice / 100).toFixed(0)} €
                        {bid.proposedPrice <= event.budget && (
                          <span className="ml-1.5" style={{ color: 'var(--text-muted)' }}>· dentro del presupuesto</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {bid.status === 'pending' && event.status === 'open' ? (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleBid(bid.id, 'reject')}
                        disabled={acting !== null}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border disabled:opacity-50"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                        {acting === bid.id + 'reject' ? '...' : 'Rechazar'}
                      </button>
                      <button
                        onClick={() => handleBid(bid.id, 'accept')}
                        disabled={acting !== null}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                        style={{ background: 'var(--accent)', color: '#0a0f14' }}>
                        {acting === bid.id + 'accept' ? '...' : 'Aceptar'}
                      </button>
                    </div>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs font-medium shrink-0"
                      style={{
                        background: bid.status === 'accepted' ? '#1a3a2a' : '#2a1a1a',
                        color: bid.status === 'accepted' ? '#4ade80' : '#f87171',
                      }}>
                      {bid.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                    </span>
                  )}
                </div>
                {bid.message && (
                  <p className="text-xs mt-3 pt-3 border-t" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>{bid.message}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
