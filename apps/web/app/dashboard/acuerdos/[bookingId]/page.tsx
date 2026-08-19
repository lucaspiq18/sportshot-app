'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { apiClient } from '@/lib/api-client'

type Message = {
  id: string
  content: string
  createdAt: string
  sender: { id: string; fullName: string }
}

type Booking = {
  id: string
  agreedPrice: number
  status: string
  createdAt: string
  currentUserId: string
  offer: { eventName: string } | null
  bid: { teamEvent: { eventName: string; eventDate: string; city: string; sport: string } } | null
  slot: { startsAt: string; city: string; sports: string[] } | null
  team: { clubName: string; user: { fullName: string } }
  photographer: { userId: string; user: { fullName: string } }
  delivery: { deliveredAt: string; approvedAt: string | null; photoCount: number; filesUrl: string[] } | null
  payment: { amount: number } | null
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

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export default function AcuerdoDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const { getToken } = useAuth()
  const router = useRouter()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [deliveryUrl, setDeliveryUrl] = useState('')
  const [deliveryCount, setDeliveryCount] = useState('')
  const [deliverySending, setDeliverySending] = useState(false)
  const [deliveryError, setDeliveryError] = useState('')
  const [approving, setApproving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchMessages = useCallback(async () => {
    try {
      const token = await getToken()
      if (!token) return
      const data = await apiClient<Message[]>(`/bookings/${bookingId}/messages`, token)
      setMessages(data)
    } catch {}
  }, [bookingId, getToken])

  useEffect(() => {
    async function init() {
      try {
        const token = await getToken()
        if (!token) return
        const data = await apiClient<Booking>(`/bookings/${bookingId}`, token)
        setBooking(data)
        try {
          const msgs = await apiClient<Message[]>(`/bookings/${bookingId}/messages`, token)
          setMessages(msgs)
        } catch {}
      } catch (e: any) {
        setError(e?.message ?? 'Error al cargar el acuerdo')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [bookingId, getToken, router])

  // Poll messages every 8s
  useEffect(() => {
    pollRef.current = setInterval(fetchMessages, 8000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [fetchMessages])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleApprove() {
    setApproving(true)
    try {
      const token = await getToken()
      if (!token) return
      await apiClient(`/bookings/${bookingId}/delivery/approve`, token, { method: 'POST' })
      const data = await apiClient<Booking>(`/bookings/${bookingId}`, token)
      setBooking(data)
    } catch {} finally {
      setApproving(false)
    }
  }

  async function handleDelivery(e: React.FormEvent) {
    e.preventDefault()
    if (!deliveryUrl.trim() || !deliveryCount) return
    setDeliverySending(true)
    setDeliveryError('')
    try {
      const token = await getToken()
      if (!token) return
      await apiClient(`/bookings/${bookingId}/delivery`, token, {
        method: 'POST',
        body: JSON.stringify({ filesUrl: [deliveryUrl.trim()], photoCount: Number(deliveryCount) }),
      })
      const data = await apiClient<Booking>(`/bookings/${bookingId}`, token)
      setBooking(data)
      setDeliveryUrl('')
      setDeliveryCount('')
    } catch (err: any) {
      setDeliveryError(err?.message ?? 'Error al registrar la entrega')
    } finally {
      setDeliverySending(false)
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    try {
      const token = await getToken()
      if (!token) return
      await apiClient(`/bookings/${bookingId}/messages`, token, {
        method: 'POST',
        body: JSON.stringify({ content: text.trim() }),
      })
      setText('')
      await fetchMessages()
    } catch {} finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Cargando…</p>
      </div>
    )
  }
  if (error || !booking) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <button onClick={() => router.back()} className="text-xs flex items-center gap-1 self-start" style={{ color: 'var(--text-muted)' }}>← Volver</button>
        <div className="p-6 rounded-2xl border text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="font-medium mb-1">No se pudo cargar el acuerdo</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{error}</p>
        </div>
      </div>
    )
  }

  const sc = STATUS_COLOR[booking.status] ?? STATUS_COLOR.confirmed
  const eventName = booking.offer?.eventName ?? booking.bid?.teamEvent.eventName ?? 'Acuerdo'
  const eventDate = booking.bid?.teamEvent.eventDate
  const locationStr = booking.bid?.teamEvent.city ?? booking.slot?.city ?? null

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <button onClick={() => router.back()} className="text-xs flex items-center gap-1 self-start" style={{ color: 'var(--text-muted)' }}>
        ← Volver
      </button>

      {/* Header del acuerdo */}
      <div className="p-5 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="font-bold text-lg leading-tight">{eventName}</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {booking.team.clubName} · {booking.photographer.user.fullName}
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: sc.bg, color: sc.text }}>
            {STATUS_LABEL[booking.status] ?? booking.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Precio acordado', value: `${(booking.agreedPrice / 100).toFixed(0)} €` },
            { label: 'Fecha del evento', value: eventDate ? fmtDate(eventDate) : '—' },
            { label: 'Ubicación', value: locationStr ?? '—' },
            { label: 'Acuerdo creado', value: fmtDate(booking.createdAt) },
            booking.payment && { label: 'Precio acordado', value: `${(booking.payment.amount / 100).toFixed(0)} €` },
            booking.delivery && { label: 'Entrega', value: booking.delivery.approvedAt ? 'Aprobada' : 'Entregada, pendiente de aprobación' },
          ].filter(Boolean).map((row: any) => (
            <div key={row.label} className="p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
              <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{row.label}</p>
              <p className="text-sm font-semibold">{row.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fotos entregadas */}
      {booking.delivery ? (
        <div className="p-5 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="font-semibold text-sm mb-1">Fotos entregadas</p>
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            {booking.delivery.photoCount} foto{booking.delivery.photoCount !== 1 ? 's' : ''} · {booking.delivery.approvedAt ? 'Entrega aprobada ✓' : 'Pendiente de aprobación'}
          </p>
          {!booking.delivery.approvedAt && booking.currentUserId !== booking.photographer.userId && (
            <button
              onClick={handleApprove}
              disabled={approving}
              className="w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 mb-3"
              style={{ background: 'var(--accent)', color: '#0a0f14' }}
            >
              {approving ? 'Aprobando…' : 'Aprobar entrega y liberar pago'}
            </button>
          )}
          <div className="flex flex-col gap-2">
            {booking.delivery.filesUrl.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm hover:opacity-80 transition-opacity"
                style={{ background: 'var(--bg)', color: 'var(--accent)', border: '1px solid var(--border)' }}
              >
                <span style={{ flexShrink: 0 }}>🔗</span>
                <span className="truncate">{url}</span>
              </a>
            ))}
          </div>
        </div>
      ) : booking.currentUserId === booking.photographer.userId && booking.status === 'confirmed' ? (
        <div className="p-5 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="font-semibold text-sm mb-1">Entregar fotos</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Pega el enlace donde el equipo puede descargar las fotos (Google Drive, WeTransfer, Dropbox…)</p>
          <form onSubmit={handleDelivery} className="flex flex-col gap-3">
            <input
              value={deliveryUrl}
              onChange={e => setDeliveryUrl(e.target.value)}
              placeholder="https://drive.google.com/…"
              type="url"
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-[var(--accent)]"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
            <div className="flex gap-2 items-center">
              <input
                value={deliveryCount}
                onChange={e => setDeliveryCount(e.target.value)}
                placeholder="Nº de fotos"
                type="number"
                min="1"
                className="w-32 px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-[var(--accent)]"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
              <button
                type="submit"
                disabled={deliverySending || !deliveryUrl.trim() || !deliveryCount}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40"
                style={{ background: 'var(--accent)', color: '#0a0f14' }}
              >
                {deliverySending ? 'Enviando…' : 'Registrar entrega'}
              </button>
            </div>
            {deliveryError && <p className="text-xs" style={{ color: '#f87171' }}>{deliveryError}</p>}
          </form>
        </div>
      ) : null}

      {/* Chat */}
      <div className="flex flex-col rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="font-semibold text-sm">Mensajes</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Coordina los detalles con la otra parte</p>
        </div>

        <div className="flex flex-col gap-3 p-5 min-h-[240px] max-h-[400px] overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-sm text-center my-auto" style={{ color: 'var(--text-muted)' }}>
              Aún no hay mensajes. ¡Empieza la conversación!
            </p>
          ) : (
            messages.map(msg => {
              const isMe = msg.sender.id === booking.currentUserId
              return (
                <div key={msg.id} className={`flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {isMe ? 'Tú' : msg.sender.fullName} · {fmtTime(msg.createdAt)}
                  </p>
                  <div
                    className="px-4 py-2.5 rounded-2xl text-sm max-w-[80%]"
                    style={isMe
                      ? { background: 'var(--accent)', color: '#0a0f14' }
                      : { background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex gap-2 p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Escribe un mensaje…"
            className="flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-[var(--accent)]"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40"
            style={{ background: 'var(--accent)', color: '#0a0f14' }}
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  )
}
