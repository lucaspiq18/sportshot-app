import { apiServer } from '@/lib/api'
import Link from 'next/link'

type Slot = { id: string; startsAt: string; endsAt: string; city: string; sports: string[]; price: number; status: string; _count: { offers: number } }
type Offer = { id: string; eventName: string; budgetOffered: number; status: string; team: { clubName: string } }

export default async function PhotographerDashboard() {
  let slots: Slot[] = []
  let offers: Offer[] = []

  try { slots = await apiServer<Slot[]>('/slots/mine') } catch {}
  try { offers = await apiServer<Offer[]>('/offers/received') } catch {}

  const openSlots = slots.filter(s => s.status === 'open').length
  const bookedSlots = slots.filter(s => s.status === 'booked').length

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Panel de fotógrafo</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Gestiona tu disponibilidad y ofertas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Slots disponibles', value: openSlots },
          { label: 'Slots reservados', value: bookedSlots },
          { label: 'Ofertas pendientes', value: offers.length },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-xl border text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-3xl font-bold mb-1" style={{ color: 'var(--accent)' }}>{s.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Acceso al calendario */}
      <Link href="/dashboard/photographer/calendario"
        className="flex items-center justify-between p-6 rounded-2xl border group transition-colors hover:border-[var(--accent)]"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'rgba(126,200,227,0.1)' }}>📅</div>
          <div>
            <p className="font-semibold">Mi disponibilidad</p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Ver y gestionar los próximos 28 días · {openSlots} slot{openSlots !== 1 ? 's' : ''} abierto{openSlots !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <span className="text-xl" style={{ color: 'var(--accent)' }}>→</span>
      </Link>

      {/* Referidos */}
      <Link href="/dashboard/photographer/referidos"
        className="flex items-center justify-between p-5 rounded-2xl border transition-colors hover:border-[var(--accent)]"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(126,200,227,0.1)' }}>🔗</div>
          <div>
            <p className="font-semibold text-sm">Programa de referidos</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Invita fotógrafos y gana el 1% de sus ventas</p>
          </div>
        </div>
        <span style={{ color: 'var(--accent)' }}>→</span>
      </Link>

      {/* Eventos de equipos */}
      <Link href="/dashboard/photographer/eventos"
        className="flex items-center justify-between p-5 rounded-2xl border transition-colors hover:border-[var(--accent)]"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(126,200,227,0.1)' }}>🏟️</div>
          <div>
            <p className="font-semibold text-sm">Partidos que buscan fotógrafo</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Equipos que han publicado su partido y esperan propuestas</p>
          </div>
        </div>
        <span style={{ color: 'var(--accent)' }}>→</span>
      </Link>

      {/* Reseñas */}
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

      {/* Ofertas pendientes */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Ofertas pendientes</h2>
        {offers.length === 0 ? (
          <div className="p-6 rounded-xl border text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No tienes ofertas pendientes.</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Publica disponibilidad para empezar a recibirlas.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {offers.map((offer) => (
              <div key={offer.id} className="p-4 rounded-xl border flex items-center justify-between" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div>
                  <p className="font-medium text-sm">{offer.eventName}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{offer.team.clubName} · {(offer.budgetOffered / 100).toFixed(0)} €</p>
                </div>
                <Link href={`/dashboard/photographer/ofertas/${offer.id}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: 'var(--accent)', color: '#0a0f14' }}>
                  Ver →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
