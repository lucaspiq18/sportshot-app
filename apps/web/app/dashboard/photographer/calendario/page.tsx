'use client'
import { useAuth } from '@clerk/nextjs'
import { useEffect, useState, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'

type SlotStatus = 'open' | 'booked' | 'cancelled'
type Franja = {
  id: string
  startsAt: string
  endsAt: string
  city: string
  localidad: string | null
  sports: string[]
  price: number
  status: SlotStatus
  _count: { offers: number }
}

const STATUS_LABEL: Record<SlotStatus, string> = { open: 'Disponible', booked: 'Reservada', cancelled: 'Cancelada' }
const STATUS_COLOR: Record<SlotStatus, { bg: string; text: string }> = {
  open: { bg: 'rgba(74,222,128,0.15)', text: '#4ade80' },
  booked: { bg: 'rgba(126,200,227,0.15)', text: '#7EC8E3' },
  cancelled: { bg: 'rgba(100,100,100,0.15)', text: '#666' },
}

const SPORTS = ['Fútbol', 'Baloncesto', 'Balonmano', 'Voleibol', 'Natación', 'Atletismo', 'Tenis', 'Pádel', 'Ciclismo', 'Otro']

const PROVINCIAS = [
  'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz', 'Baleares',
  'Barcelona', 'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ciudad Real',
  'Córdoba', 'Cuenca', 'Girona', 'Granada', 'Guadalajara', 'Guipúzcoa', 'Huelva', 'Huesca',
  'Jaén', 'La Coruña', 'La Rioja', 'Las Palmas', 'León', 'Lleida', 'Lugo', 'Madrid',
  'Málaga', 'Murcia', 'Navarra', 'Ourense', 'Palencia', 'Pontevedra', 'Salamanca',
  'Santa Cruz de Tenerife', 'Segovia', 'Sevilla', 'Soria', 'Tarragona', 'Teruel', 'Toledo',
  'Valencia', 'Valladolid', 'Vizcaya', 'Zamora', 'Zaragoza', 'Ceuta', 'Melilla',
]

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function fmt(d: Date) {
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export default function CalendarioPage() {
  const { getToken } = useAuth()
  const [franjas, setFranjas] = useState<Franja[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFranja, setSelectedFranja] = useState<Franja | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const monday = new Date(today)
  const dow = today.getDay()
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))

  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })

  const [form, setForm] = useState({
    date: '',
    startTime: '09:00',
    endTime: '13:00',
    sports: [] as string[],
    localidad: '',
    provincia: '',
    price: '',
  })

  const fetchFranjas = useCallback(async () => {
    try {
      const token = await getToken()
      if (!token) return
      const data = await apiClient<Franja[]>('/slots/mine', token)
      setFranjas(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => { fetchFranjas() }, [fetchFranjas])

  function openNewFranja(day: Date) {
    const y = day.getFullYear()
    const m = String(day.getMonth() + 1).padStart(2, '0')
    const d = String(day.getDate()).padStart(2, '0')
    setForm({ date: `${y}-${m}-${d}`, startTime: '09:00', endTime: '13:00', sports: [], localidad: '', provincia: '', price: '' })
    setSelectedFranja(null)
    setShowForm(true)
    setError('')
  }

  function openFranjaDetail(franja: Franja, e: React.MouseEvent) {
    e.stopPropagation()
    setSelectedFranja(franja)
    setShowForm(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.date || form.sports.length === 0 || !form.price || !form.provincia || !form.localidad) {
      setError('Completa todos los campos')
      return
    }
    const startsAt = new Date(`${form.date}T${form.startTime}:00`)
    const endsAt = new Date(`${form.date}T${form.endTime}:00`)
    if (endsAt <= startsAt) { setError('La hora de fin debe ser posterior a la de inicio'); return }
    setSaving(true)
    setError('')
    try {
      const token = await getToken()
      if (!token) throw new Error('No auth')
      await apiClient('/slots', token, {
        method: 'POST',
        body: JSON.stringify({
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
          sports: form.sports,
          price: Math.round(Number(form.price) * 100),
          city: form.provincia,
          localidad: form.localidad,
        }),
      })
      setShowForm(false)
      await fetchFranjas()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar. Inténtalo de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true)
    try {
      const token = await getToken()
      if (!token) throw new Error('No auth')
      await apiClient(`/slots/${id}`, token, { method: 'DELETE' })
      setSelectedFranja(null)
      await fetchFranjas()
    } catch {
      setError('No se pudo cancelar la franja.')
    } finally {
      setDeleting(false)
    }
  }

  function toggleSport(sport: string) {
    setForm(f => ({ ...f, sports: f.sports.includes(sport) ? f.sports.filter(s => s !== sport) : [...f.sports, sport] }))
  }

  const weeks: Date[][] = []
  for (let i = 0; i < 28; i += 7) weeks.push(days.slice(i, i + 7))

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Mi disponibilidad</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Próximos 28 días · Haz clic en un día para añadir una franja</p>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#4ade80' }} />Disponible</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#7EC8E3' }} />Reservada</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--border)' }}>
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
            <div key={d} className="py-2 text-center text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{d}</div>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Cargando…</div>
        ) : (
          weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
              {week.map((day) => {
                const dayFranjas = franjas.filter(s => isSameDay(new Date(s.startsAt), day) && s.status !== 'cancelled')
                const isPast = day < today
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => !isPast && openNewFranja(day)}
                    className="min-h-[100px] p-2 border-r last:border-r-0 flex flex-col gap-1 transition-colors"
                    style={{
                      borderColor: 'var(--border)',
                      cursor: isPast ? 'default' : 'pointer',
                      background: isSameDay(day, today) ? 'rgba(126,200,227,0.04)' : undefined,
                    }}
                  >
                    <span
                      className="text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full"
                      style={{
                        background: isSameDay(day, today) ? 'var(--accent)' : undefined,
                        color: isSameDay(day, today) ? '#0a0f14' : isPast ? 'var(--border)' : 'var(--text)',
                      }}
                    >
                      {day.getDate()}
                    </span>
                    {dayFranjas.map(franja => (
                      <button
                        key={franja.id}
                        onClick={(e) => openFranjaDetail(franja, e)}
                        className="w-full text-left px-2 py-1 rounded-md text-xs font-medium truncate"
                        style={{ background: STATUS_COLOR[franja.status].bg, color: STATUS_COLOR[franja.status].text }}
                      >
                        {fmtTime(new Date(franja.startsAt))} {franja.status === 'booked' ? '🔒' : ''}
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          ))
        )}
      </div>

      {/* Panel lateral */}
      {(showForm || selectedFranja) && (
        <div className="fixed inset-0 z-50 flex" onClick={() => { setShowForm(false); setSelectedFranja(null) }}>
          <div className="flex-1" />
          <div
            className="w-full max-w-md h-full overflow-y-auto p-6 flex flex-col gap-5 shadow-2xl"
            style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Detalle de franja existente */}
            {selectedFranja && !showForm && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-lg">Detalle de la franja</h2>
                  <button onClick={() => setSelectedFranja(null)} className="text-xl" style={{ color: 'var(--text-muted)' }}>×</button>
                </div>
                <div className="p-4 rounded-xl border flex flex-col gap-3" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
                  <span className="inline-flex self-start px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: STATUS_COLOR[selectedFranja.status].bg, color: STATUS_COLOR[selectedFranja.status].text }}>
                    {STATUS_LABEL[selectedFranja.status]}
                  </span>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Inicio</p>
                    <p className="font-medium text-sm">{fmt(new Date(selectedFranja.startsAt))} · {fmtTime(new Date(selectedFranja.startsAt))}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Fin</p>
                    <p className="font-medium text-sm">{fmtTime(new Date(selectedFranja.endsAt))}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Ubicación</p>
                    <p className="text-sm font-medium">{selectedFranja.localidad ? `${selectedFranja.localidad}, ${selectedFranja.city}` : selectedFranja.city}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Deportes</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedFranja.sports.map(s => <span key={s} className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(126,200,227,0.1)', color: 'var(--accent)' }}>{s}</span>)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Precio base</p>
                    <p className="font-bold">{(selectedFranja.price / 100).toFixed(0)} €</p>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{selectedFranja._count.offers} oferta{selectedFranja._count.offers !== 1 ? 's' : ''} recibida{selectedFranja._count.offers !== 1 ? 's' : ''}</p>
                </div>

                {selectedFranja.status === 'booked' && (
                  <div className="p-4 rounded-xl text-sm" style={{ background: 'rgba(126,200,227,0.08)', border: '1px solid rgba(126,200,227,0.2)', color: 'var(--accent)' }}>
                    🔒 Esta franja está bloqueada — tienes una reserva confirmada.
                  </div>
                )}

                {error && <p className="text-xs text-red-400">{error}</p>}

                {selectedFranja.status === 'open' && (
                  <button
                    onClick={() => handleDelete(selectedFranja.id)}
                    disabled={deleting}
                    className="w-full py-2.5 rounded-xl text-sm font-medium border"
                    style={{ borderColor: '#ef4444', color: '#ef4444' }}
                  >
                    {deleting ? 'Cancelando…' : 'Cancelar franja'}
                  </button>
                )}
              </>
            )}

            {/* Formulario nueva franja */}
            {showForm && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-lg">Nueva franja</h2>
                  <button onClick={() => setShowForm(false)} className="text-xl" style={{ color: 'var(--text-muted)' }}>×</button>
                </div>
                <form onSubmit={handleCreate} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Fecha</label>
                    <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none" style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Hora inicio</label>
                      <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} required className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none" style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Hora fin</label>
                      <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} required className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none" style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                    </div>
                  </div>

                  {/* Localidad + Provincia */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Localidad</label>
                      <input
                        required
                        placeholder="Ej. Getafe"
                        value={form.localidad}
                        onChange={e => setForm(f => ({ ...f, localidad: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                        style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Provincia</label>
                      <select
                      required
                      value={form.provincia}
                      onChange={e => setForm(f => ({ ...f, provincia: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                      style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    >
                      <option value="">Selecciona provincia</option>
                      {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    </div>
                  </div>

                  {/* Deportes */}
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Deportes que cubres</label>
                    <div className="flex flex-wrap gap-2">
                      {SPORTS.map(sport => (
                        <button key={sport} type="button" onClick={() => toggleSport(sport)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                          style={{
                            background: form.sports.includes(sport) ? 'var(--accent)' : 'var(--bg)',
                            color: form.sports.includes(sport) ? '#0a0f14' : 'var(--text-muted)',
                            borderColor: form.sports.includes(sport) ? 'var(--accent)' : 'var(--border)',
                          }}
                        >
                          {sport}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Precio */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Precio base (€)</label>
                    <input type="number" min="0" step="1" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required placeholder="ej. 150" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none" style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Los equipos pueden ofrecerte más. Este es tu precio mínimo.</p>
                  </div>

                  {error && <p className="text-xs text-red-400">{error}</p>}

                  <button type="submit" disabled={saving} className="w-full py-3 rounded-xl text-sm font-semibold" style={{ background: 'var(--accent)', color: '#0a0f14' }}>
                    {saving ? 'Guardando…' : 'Publicar franja'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
