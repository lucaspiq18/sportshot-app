import { apiServer } from '@/lib/api'
import Link from 'next/link'

type Booking = {
  id: string
  agreedPrice: number
  status: string
  createdAt: string
  offer: { eventName: string; eventDate: string } | null
  bid: { teamEvent: { eventName: string; eventDate: string; city: string; localidad: string | null } } | null
  team: { clubName: string }
  photographer: { user: { fullName: string } }
  _count: { messages: number }
}

const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Confirmado',
  completed: 'Completado',
  disputed: 'En disputa',
  cancelled: 'Cancelado',
}

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  confirmed: { bg: 'rgba(74,222,128,0.12)', text: '#4ade80' },
  completed: { bg: 'rgba(126,200,227,0.12)', text: '#7ec8e3' },
  disputed:  { bg: 'rgba(251,191,36,0.12)',  text: '#fbbf24' },
  cancelled: { bg: 'rgba(248,113,113,0.12)', text: '#f87171' },
}

function eventName(b: Booking) {
  if (b.offer) return b.offer.eventName
  if (b.bid)   return b.bid.teamEvent.eventName
  return 'Acuerdo'
}

function eventDate(b: Booking) {
  const raw = b.offer?.eventDate ?? b.bid?.teamEvent.eventDate
  if (!raw) return null
  return new Date(raw).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

function location(b: Booking) {
  const te = b.bid?.teamEvent
  if (!te) return null
  return te.localidad ? `${te.localidad}, ${te.city}` : te.city
}

export default async function AcuerdosPage() {
  let bookings: Booking[] = []
  try { bookings = await apiServer<Booking[]>('/bookings') } catch {}

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Mis acuerdos</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Trabajos en los que hay un acuerdo cerrado</p>
      </div>

      {bookings.length === 0 ? (
        <div className="p-10 rounded-2xl border text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-2xl mb-3">🤝</p>
          <p className="font-medium mb-1">Aún no tienes acuerdos</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Cuando se cierre un trato aparecerá aquí</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map(b => {
            const sc = STATUS_COLOR[b.status] ?? STATUS_COLOR.confirmed
            return (
              <Link
                key={b.id}
                href={`/dashboard/acuerdos/${b.id}`}
                className="p-5 rounded-2xl border flex items-center justify-between gap-4 hover:border-[var(--accent)] transition-colors"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{eventName(b)}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {b.team.clubName} · {b.photographer.user.fullName}
                    {eventDate(b) && ` · ${eventDate(b)}`}
                    {location(b) && ` · ${location(b)}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {b._count.messages > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(126,200,227,0.1)', color: 'var(--accent)' }}>
                      💬 {b._count.messages}
                    </span>
                  )}
                  <div className="text-right">
                    <p className="font-bold text-sm">{(b.agreedPrice / 100).toFixed(0)} €</p>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.text }}>
                      {STATUS_LABEL[b.status] ?? b.status}
                    </span>
                  </div>
                  <span style={{ color: 'var(--accent)' }}>→</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
