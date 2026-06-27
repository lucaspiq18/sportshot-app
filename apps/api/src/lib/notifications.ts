import { prisma } from './prisma'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

interface PushMessage {
  to: string
  title: string
  body: string
  data?: Record<string, unknown>
  sound?: 'default' | null
  badge?: number
}

// Envía notificaciones a todos los tokens registrados de un usuario.
// Si un token está expirado (error DeviceNotRegistered), lo elimina.
export async function notifyUser(userId: string, message: Omit<PushMessage, 'to'>) {
  const tokens = await prisma.pushToken.findMany({ where: { userId } })
  if (tokens.length === 0) return

  const messages: PushMessage[] = tokens.map((t) => ({
    to: t.token,
    sound: 'default',
    ...message,
  }))

  const res = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(messages),
  })

  const { data } = await res.json() as { data: Array<{ status: string; details?: { error?: string } }> }

  // Limpiar tokens expirados
  const expired = tokens.filter((_, i) => data[i]?.details?.error === 'DeviceNotRegistered')
  if (expired.length > 0) {
    await prisma.pushToken.deleteMany({ where: { id: { in: expired.map((t) => t.id) } } })
  }
}

// Mensajes tipados por evento — un lugar para mantener todas las notificaciones
export const notify = {
  newOffer: (photographerUserId: string, teamName: string, eventName: string, price: number) =>
    notifyUser(photographerUserId, {
      title: `Nueva oferta de ${teamName}`,
      body: `${eventName} · ${(price / 100).toFixed(0)} €`,
      data: { screen: 'photographer/offers' },
    }),

  offerAccepted: (teamUserId: string, photographerName: string, eventName: string) =>
    notifyUser(teamUserId, {
      title: '¡Oferta aceptada!',
      body: `${photographerName} ha aceptado cubrir ${eventName}`,
      data: { screen: 'bookings' },
    }),

  offerRejected: (teamUserId: string, eventName: string) =>
    notifyUser(teamUserId, {
      title: 'Oferta no disponible',
      body: `El fotógrafo no puede cubrir ${eventName}`,
      data: { screen: 'team/explore' },
    }),

  materialDelivered: (teamUserId: string, eventName: string) =>
    notifyUser(teamUserId, {
      title: 'Material entregado',
      body: `Las fotos de ${eventName} están listas para revisar. Tienes 48h para aprobarlas.`,
      data: { screen: 'bookings' },
    }),

  paymentReleased: (photographerUserId: string, amount: number) =>
    notifyUser(photographerUserId, {
      title: 'Pago recibido',
      body: `${(amount / 100).toFixed(0)} € transferidos a tu cuenta`,
      data: { screen: 'photographer/payments' },
    }),

  reviewDeadlineReminder: (teamUserId: string, eventName: string, hoursLeft: number) =>
    notifyUser(teamUserId, {
      title: 'Recuerda revisar las fotos',
      body: `Quedan ${hoursLeft}h para aprobar las fotos de ${eventName} o se liberará el pago automáticamente`,
      data: { screen: 'bookings' },
    }),

  newReview: (photographerUserId: string, rating: number) =>
    notifyUser(photographerUserId, {
      title: 'Nueva valoración',
      body: `Has recibido una valoración de ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`,
      data: { screen: 'profile' },
    }),
}
