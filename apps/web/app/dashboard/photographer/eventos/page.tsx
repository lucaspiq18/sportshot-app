import { apiServer } from '@/lib/api'
import Link from 'next/link'
import SpainMap from '@/components/SpainMap'

type TeamEvent = {
  id: string
  eventName: string
  sport: string
  city: string
  eventDate: string
  budget: number
  description: string | null
  team: { clubName: string; logoUrl: string | null }
  _count: { bids: number }
}

export default async function ExplorarEventosPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>
}) {
  const { city } = await searchParams
  let events: TeamEvent[] = []
  try {
    const query = city ? `?city=${encodeURIComponent(city)}` : ''
    events = await apiServer<TeamEvent[]>(`/team-events${query}`)
  } catch {}

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Partidos que buscan fotógrafo</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {city ? `Partidos en ${city}` : 'Selecciona una provincia para filtrar'}
        </p>
      </div>

      {/* Mapa de España */}
      <div className="p-4 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <SpainMap selected={city} />
      </div>

      {/* Lista de eventos */}
      {events.length === 0 ? (
        <div className="p-8 rounded-2xl border text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-2xl mb-3">🏟️</p>
          <p className="font-medium mb-1">
            {city ? `No hay partidos en ${city}` : 'No hay partidos disponibles'}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {city ? 'Prueba con otra provincia' : 'Vuelve más tarde, los equipos irán publicando sus partidos'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {events.length} partido{events.length !== 1 ? 's' : ''}{city ? ` en ${city}` : ' disponibles'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map(ev => (
              <Link key={ev.id} href={`/dashboard/photographer/eventos/${ev.id}`}
                className="p-5 rounded-2xl border flex flex-col gap-3 hover:border-[var(--accent)] transition-colors"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{ev.eventName}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{ev.team.clubName}</p>
                  </div>
                  <span className="text-xl font-bold shrink-0" style={{ color: 'var(--accent)' }}>
                    {(ev.budget / 100).toFixed(0)} €
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--bg)', color: 'var(--accent)' }}>{ev.sport}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}>📍 {ev.city}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}>
                    {new Date(ev.eventDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                {ev.description && (
                  <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>{ev.description}</p>
                )}
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {ev._count.bids === 0 ? 'Sé el primero en pujar' : `${ev._count.bids} fotógrafo${ev._count.bids !== 1 ? 's' : ''} interesado${ev._count.bids !== 1 ? 's' : ''}`}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
