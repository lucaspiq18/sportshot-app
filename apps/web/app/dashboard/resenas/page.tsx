'use client'
import { useAuth } from '@clerk/nextjs'
import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { ReviewForm } from '@/components/ReviewForm'

type PendingBooking = {
  id: string
  agreedPrice: number
  offer: { eventName: string }
  photographer: { user: { fullName: string; avatarUrl: string | null } }
  team: { clubName: string; logoUrl: string | null }
}

type MyReview = {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  booking: {
    offer: { eventName: string }
    photographer: { user: { fullName: string } }
    team: { clubName: string }
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-base">
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} style={{ color: s <= rating ? '#f59e0b' : 'var(--border)' }}>★</span>
      ))}
    </span>
  )
}

export default function ResenasPage() {
  const { getToken } = useAuth()
  const [pending, setPending] = useState<PendingBooking[]>([])
  const [done, setDone] = useState<MyReview[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [role, setRole] = useState<'photographer' | 'team' | null>(null)

  const fetchAll = useCallback(async () => {
    const token = await getToken()
    if (!token) return
    const [p, d] = await Promise.all([
      apiClient<PendingBooking[]>('/bookings/pending-review', token).catch(() => []),
      apiClient<MyReview[]>('/bookings/my-reviews', token).catch(() => []),
    ])
    setPending(p)
    setDone(d)

    // Inferir rol desde los datos
    if (p.length > 0 || d.length > 0) {
      const sample = p[0] ?? null
      // Si tenemos bookings pendientes, determinar rol comparando IDs — por simplicidad
      // el rol viene del token pero no lo exponemos aquí; usamos la API /me
    }
    setLoading(false)
  }, [getToken])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Determinar el nombre del "otro" en cada booking
  function getTargetName(booking: PendingBooking): string {
    // Lo determinaremos comparando qué campos tienen datos relevantes
    // El rol se puede inferir del /me, pero por simplicidad mostramos ambos
    return `${booking.photographer.user.fullName} / ${booking.team.clubName}`
  }

  // Nombre a mostrar cuando ya se sabe el rol (necesitamos /me)
  // Para MVP mostramos la info disponible
  function getPendingLabel(b: PendingBooking) {
    return { photographer: b.photographer.user.fullName, team: b.team.clubName }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold mb-1">Reseñas</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Valora tus trabajos completados</p>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Cargando…</p>
      ) : (
        <>
          {/* Pendientes */}
          <section>
            <h2 className="text-lg font-semibold mb-4">
              Pendientes de valorar
              {pending.length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'var(--accent)', color: '#0a0f14' }}>
                  {pending.length}
                </span>
              )}
            </h2>

            {pending.length === 0 ? (
              <div className="p-6 rounded-xl border text-center text-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                No tienes trabajos pendientes de valorar
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {pending.map(b => {
                  const { photographer, team } = getPendingLabel(b)
                  const isOpen = activeId === b.id
                  return (
                    <div key={b.id} className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: isOpen ? 'var(--accent)' : 'var(--border)' }}>
                      {/* Cabecera */}
                      <button
                        onClick={() => setActiveId(isOpen ? null : b.id)}
                        className="w-full flex items-center justify-between p-5 text-left"
                      >
                        <div className="flex flex-col gap-0.5">
                          <p className="font-semibold">{b.offer.eventName}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {photographer} · {team} · {(b.agreedPrice / 100).toFixed(0)} €
                          </p>
                        </div>
                        <span className="text-sm font-medium ml-4 flex-shrink-0" style={{ color: 'var(--accent)' }}>
                          {isOpen ? 'Cerrar' : 'Valorar →'}
                        </span>
                      </button>

                      {/* Formulario expandido */}
                      {isOpen && (
                        <div className="px-5 pb-5 border-t" style={{ borderColor: 'var(--border)' }}>
                          <div className="pt-4">
                            <ReviewForm
                              bookingId={b.id}
                              targetName={photographer}
                              onSubmitted={() => {
                                setActiveId(null)
                                fetchAll()
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Ya valoradas */}
          {done.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4">Mis reseñas enviadas</h2>
              <div className="flex flex-col gap-3">
                {done.map(r => (
                  <div key={r.id} className="p-5 rounded-xl border flex flex-col gap-2" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-sm">{r.booking.offer.eventName}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {r.booking.photographer.user.fullName} · {r.booking.team.clubName}
                        </p>
                      </div>
                      <Stars rating={r.rating} />
                    </div>
                    {r.comment && (
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>"{r.comment}"</p>
                    )}
                    <p className="text-xs" style={{ color: 'var(--border)' }}>
                      {new Date(r.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
