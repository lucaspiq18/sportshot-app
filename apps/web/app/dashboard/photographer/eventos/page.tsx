import { apiServer } from '@/lib/api'
import Link from 'next/link'

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
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Equipos que han publicado su partido y esperan propuestas</p>
      </div>

      {/* Filtro por ciudad */}
      <form method="GET" className="flex gap-2">
        <input
          name="city"
          defaultValue={city ?? ''}
          placeholder="Filtrar por ciudad..."
          className="flex-1 px-4 py-2.5 rounded-lg border text-sm outline-none focus:border-[var(--accent)]"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
        <button type="submit"
          className="px-4 py-2.5 rounded-lg text-sm font-medium"
          style={{ background: 'var(--accent)', color: '#0a0f14' }}>
          Buscar
        </button>
        {city && (
          <Link href="/dashboard/photographer/eventos"
            className="px-4 py-2.5 rounded-lg text-sm font-medium border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            ✕
          </Link>
        )}
      </form>

      {events.length === 0 ? (
        <div className="p-10 rounded-2xl border text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-2xl mb-3">🏟️</p>
          <p className="font-medium mb-1">No hay partidos disponibles{city ? ` en ${city}` : ''}</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {city ? 'Prueba con otra ciudad o elimina el filtro' : 'Vuelve más tarde, los equipos irán publicando sus partidos'}
          </p>
        </div>
      ) : (
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
      )}
    </div>
  )
}
