import { apiServer } from '@/lib/api'
import Link from 'next/link'
import ProvinceFilter from './ProvinceFilter'

type Slot = {
  id: string
  startsAt: string
  endsAt: string
  city: string
  sports: string[]
  price: number
  photographer: { user: { fullName: string; avatarUrl: string | null } }
}

type Booking = {
  id: string
  agreedPrice: number
  status: string
  offer: { eventName: string; eventDate: string }
  photographer: { user: { fullName: string } }
}

export default async function TeamDashboard({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>
}) {
  const { city } = await searchParams
  let slots: Slot[] = []
  let bookings: Booking[] = []

  try {
    const query = city ? `?city=${encodeURIComponent(city)}` : ''
    slots = await apiServer<Slot[]>(`/slots${query}`)
  } catch {}
  try {
    bookings = await apiServer<Booking[]>('/bookings')
  } catch {}

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold mb-1">Panel de equipo</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Encuentra fotógrafos y gestiona tus reservas</p>
      </div>

      {/* Explorar fotógrafos */}
      <section>
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <h2 className="text-lg font-semibold">Fotógrafos disponibles</h2>
          <ProvinceFilter selected={city} />
        </div>
        {slots.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No hay slots disponibles en este momento.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots.map((slot) => (
              <div key={slot.id} className="p-5 rounded-xl border flex flex-col gap-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'var(--accent)', color: '#0a0f14' }}>
                    {slot.photographer.user.fullName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{slot.photographer.user.fullName}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{slot.city}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {slot.sports.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--bg)', color: 'var(--accent)' }}>{s}</span>
                  ))}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {new Date(slot.startsAt).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{(slot.price / 100).toFixed(0)}€</span>
                  <Link href={`/dashboard/team/offer/${slot.id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: 'var(--accent)', color: '#0a0f14' }}>
                    Hacer oferta
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Publicar partido */}
      <Link href="/dashboard/team/eventos"
        className="flex items-center justify-between p-5 rounded-2xl border transition-colors hover:border-[var(--accent)]"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(126,200,227,0.1)' }}>🏟️</div>
          <div>
            <p className="font-semibold text-sm">Mis partidos publicados</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Publica tu partido y recibe propuestas de fotógrafos</p>
          </div>
        </div>
        <span style={{ color: 'var(--accent)' }}>→</span>
      </Link>

      {/* Reseñas pendientes */}
      <Link href="/dashboard/resenas"
        className="flex items-center justify-between p-5 rounded-2xl border transition-colors hover:border-[var(--accent)]"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(126,200,227,0.1)' }}>⭐</div>
          <div>
            <p className="font-semibold text-sm">Mis reseñas</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Valora tus trabajos completados</p>
          </div>
        </div>
        <span style={{ color: 'var(--accent)' }}>→</span>
      </Link>

      {/* Mis reservas */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Mis reservas</h2>
        {bookings.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No tienes reservas todavía.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map((b) => (
              <div key={b.id} className="p-4 rounded-xl border flex items-center justify-between" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div>
                  <p className="font-medium text-sm">{b.offer.eventName}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{b.photographer.user.fullName} · {(b.agreedPrice / 100).toFixed(0)}€</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ background: b.status === 'confirmed' ? '#1a3a2a' : '#2a1a1a', color: b.status === 'confirmed' ? '#4ade80' : '#f87171' }}>
                  {b.status === 'confirmed' ? 'Confirmada' : b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
