import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { onDeliveryCreated, onDeliveryApproved } from './webhooks/delivery'
import { notify } from '../lib/notifications'
import { mail } from '../emails/index'

const createDeliverySchema = z.object({
  filesUrl: z.array(z.string().url()).min(1),
  photoCount: z.number().int().positive(),
})

export async function deliveriesRoutes(app: FastifyInstance) {
  // Fotógrafo sube el material entregado
  app.post('/bookings/:bookingId/delivery', async (req, reply) => {
    const { bookingId } = req.params as { bookingId: string }
    const body = createDeliverySchema.parse(req.body)
    const photographerId = req.user.photographerId

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { delivery: true },
    })

    if (!booking || booking.photographerId !== photographerId) {
      return reply.status(404).send({ data: null, error: { code: 'NOT_FOUND', message: 'Reserva no encontrada' } })
    }

    if (booking.status !== 'confirmed') {
      return reply.status(400).send({ data: null, error: { code: 'INVALID_STATUS', message: 'Solo puedes entregar material en reservas confirmadas' } })
    }

    if (booking.delivery) {
      return reply.status(400).send({ data: null, error: { code: 'ALREADY_DELIVERED', message: 'Ya subiste el material para esta reserva' } })
    }

    const reviewDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000)

    const delivery = await prisma.delivery.create({
      data: {
        bookingId,
        filesUrl: body.filesUrl,
        photoCount: body.photoCount,
        reviewDeadline,
      },
    })

    // Programar liberación automática a las 48h
    await onDeliveryCreated(delivery.id, reviewDeadline)

    // Notificar al equipo que el material está listo
    const bookingWithTeam = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        team: { include: { user: true } },
        photographer: { include: { user: true } },
        offer: true,
      },
    })
    if (bookingWithTeam) {
      notify.materialDelivered(bookingWithTeam.team.userId, bookingWithTeam.offer.eventName).catch(() => {})

      mail.materialDelivered({
        teamEmail: bookingWithTeam.team.user.email,
        teamName: bookingWithTeam.team.clubName,
        photographerName: bookingWithTeam.photographer.user.fullName,
        eventName: bookingWithTeam.offer.eventName,
        photoCount: body.photoCount,
        reviewDeadline,
      }).catch(() => {})
    }

    return { data: delivery, error: null }
  })

  // Equipo aprueba la entrega antes de las 48h
  app.post('/bookings/:bookingId/delivery/approve', async (req, reply) => {
    const { bookingId } = req.params as { bookingId: string }
    const teamId = req.user.teamId

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { delivery: true },
    })

    if (!booking || booking.teamId !== teamId) {
      return reply.status(404).send({ data: null, error: { code: 'NOT_FOUND', message: 'Reserva no encontrada' } })
    }

    if (!booking.delivery) {
      return reply.status(400).send({ data: null, error: { code: 'NO_DELIVERY', message: 'El fotógrafo aún no ha entregado el material' } })
    }

    if (booking.delivery.approvedAt) {
      return reply.status(400).send({ data: null, error: { code: 'ALREADY_APPROVED', message: 'La entrega ya fue aprobada' } })
    }

    // Captura el pago y transfiere al fotógrafo
    await onDeliveryApproved(bookingId)

    return { data: { ok: true }, error: null }
  })
}
