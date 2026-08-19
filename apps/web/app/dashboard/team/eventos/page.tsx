export const dynamic = 'force-dynamic'
import { apiServer } from '@/lib/api'
import Link from 'next/link'

type TeamEvent = {
  id: string
  eventName: string
  sport: string
  city: string
  eventDate: string
  budget: number
  status: string
  _count: { bids: number }
}

export default async function MisEventosPage() {
  let events: TeamEvent[] = []
  try { events = await apiServer<TeamEvent[]>('/team-events/mine') } catch {}

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Mis partidos publicados</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Gestiona los eventos que has publicado para fotógrafos</p>
        </div>
        <Link href="/dashboard/team/evento/nuevo"
          className="px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: 'var(--accent)', color: '#0a0f14' }}>
          + Nuevo partido
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="p-10 rounded-2xl border text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-2xl mb-3">📸</p>
          <p className="font-medium mb-1">Ningún partido publicado</p>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Publica tu partido y los fotógrafos te enviarán sus propuestas</p>
          <Link href="/dashboard/team/evento/nuevo"
            className="inline-block px-5 py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: 'var(--accent)', color: '#0a0f14' }}>
            Publicar partido
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map(ev => (
            <Link key={ev.id} href={`/dashboard/team/evento/${ev.id}`}
              className="p-5 rounded-2xl border flex items-center justify-between hover:border-[var(--accent)] transition-colors"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex flex-col gap-1">
                <p className="font-semibold">{ev.eventName}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {ev.sport} · {ev.city} · {new Date(ev.eventDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Presupuesto: {(ev.budget / 100).toFixed(0)} € · {ev._count.bids} puja{ev._count.bids !== 1 ? 's' : ''} pendiente{ev._count.bids !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: ev.status === 'open' ? '#1a3a2a' : '#2a2a1a',
                    color: ev.status === 'open' ? '#4ade80' : '#facc15',
                  }}>
                  {ev.status === 'open' ? 'Abierto' : ev.status === 'closed' ? 'Cerrado' : 'Cancelado'}
                </span>
                <span style={{ color: 'var(--accent)' }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
