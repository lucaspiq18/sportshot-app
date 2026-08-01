'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { apiClient } from '@/lib/api-client'

type Deliverables = {
  photoCount: number
  deadlineHours: number
  usage: string[]
}

type Offer = {
  id: string
  eventName: string
  budgetOffered: number
  deliverables: Deliverables
  message: string | null
  status: string
  expiresAt: string
  slot: { startsAt: string; endsAt: string; city: string; sports: string[] }
  team: { clubName: string; sport: string; city: string; logoUrl: string | null }
}

const USAGE_LABELS: Record<string, string> = {
  social_media: 'Redes sociales',
  press: 'Prensa',
  internal: 'Uso interno',
}

export default function PhotographerOfferDetail() {
  const { offerId } = useParams<{ offerId: string }>()
  const { getToken } = useAuth()
  const router = useRouter()
  const [offer, setOffer] = useState<Offer | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<'accept' | 'reject' | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken()
        if (!token) return
        const res = await apiClient<Offer>(`/offers/${offerId}`, token)
        setOffer(res)
      } catch {
        router.push('/dashboard/photographer')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [offerId, getToken, router])

  async function handleAction(action: 'accept' | 'reject') {
    if (!offer) return
    setActing(action)
    try {
      const token = await getToken()
      if (!token) return
      await apiClient(`/offers/${offer.id}/${action}`, token, { method: 'POST' })
      router.push('/dashboard/photographer')
    } catch (e: any) {
      const msg = e?.message ?? 'Error al procesar la oferta'
      alert(msg)
      setActing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Cargando oferta...</p>
      </div>
    )
  }

  if (!offer) return null

  const budgetEur = (offer.budgetOffered / 100).toFixed(2)
  const eventDate = new Date(offer.slot.startsAt).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const eventTime = new Date(offer.slot.startsAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  const expiresDate = new Date(offer.expiresAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  const deliverables = offer.deliverables as Deliverables

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6">
      <div>
        <button onClick={() => router.back()} className="text-xs mb-4 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
          ← Volver
        </button>
        <h1 className="text-2xl font-bold">{offer.eventName}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Oferta de {offer.team.clubName}</p>
      </div>

      {/* Presupuesto */}
      <div className="p-5 rounded-2xl border text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="text-4xl font-bold" style={{ color: 'var(--accent)' }}>{budgetEur} €</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Presupuesto ofertado</p>
      </div>

      {/* Detalles del evento */}
      <section className="p-5 rounded-2xl border flex flex-col gap-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <h2 className="text-sm font-semibold">Detalles del evento</h2>
        <Row label="Fecha" value={`${eventDate} · ${eventTime}`} />
        <Row label="Ciudad" value={offer.slot.city} />
        <Row label="Deportes" value={offer.slot.sports.join(', ')} />
        <Row label="Club" value={`${offer.team.clubName} · ${offer.team.sport}`} />
      </section>

      {/* Entregables */}
      <section className="p-5 rounded-2xl border flex flex-col gap-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <h2 className="text-sm font-semibold">Entregables solicitados</h2>
        <Row label="Nº de fotos" value={`${deliverables.photoCount} fotos`} />
        <Row label="Entrega en" value={`${deliverables.deadlineHours} horas`} />
        <Row label="Uso" value={deliverables.usage.map(u => USAGE_LABELS[u] ?? u).join(', ')} />
      </section>

      {/* Mensaje */}
      {offer.message && (
        <section className="p-5 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold mb-2">Mensaje del equipo</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{offer.message}</p>
        </section>
      )}

      <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>Oferta válida hasta {expiresDate}</p>

      {/* Acciones */}
      {offer.status === 'pending' ? (
        <div className="flex gap-3">
          <button
            onClick={() => handleAction('reject')}
            disabled={acting !== null}
            className="flex-1 py-3 rounded-xl text-sm font-medium border disabled:opacity-50"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            {acting === 'reject' ? 'Rechazando...' : 'Rechazar'}
          </button>
          <button
            onClick={() => handleAction('accept')}
            disabled={acting !== null}
            className="flex-1 py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
            style={{ background: 'var(--accent)', color: '#0a0f14' }}
          >
            {acting === 'accept' ? 'Aceptando...' : 'Aceptar oferta'}
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-xl border text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-sm font-medium">Esta oferta ya fue {offer.status === 'accepted' ? 'aceptada' : 'rechazada'}</p>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="text-xs text-right">{value}</span>
    </div>
  )
}
