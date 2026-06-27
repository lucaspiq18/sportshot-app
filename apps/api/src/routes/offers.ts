import type { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { stripe, calculateSplit } from '../lib/stripe'
import { notify } from '../lib/notifications'
import { mail } from '../emails/index'
import { scheduleEventReminder } from '../jobs/event-reminder'

const createOfferSchema = z.object({
  slotId: z.string().uuid(),
  eventName: z.string().min(1),
  budgetOffered: z.number().int().positive(),
  deliverables: z.object({
    photoCount: z.number().int().positive(),
    deadlineHours: z.number().int().positive(),
    usage: z.array(z.enum(['social_media', 'press', 'internal'])),
  }),
  message: z.string().optional(),
})

export async function offersRoutes(app: FastifyInstance) {
  // Equipo hace una oferta a un slot
  app.post('/offers', async (req, reply) => {
    const body = createOfferSchema.parse(req.body)
    const teamId = req.user.teamId

    if (!teamId) {
      return reply.status(403).send({ data: null, error: { code: 'NOT_TEAM', message: 'Solo equipos pueden hacer ofertas' } })
    }

    const slot = await prisma.availabilitySlot.findUnique({ where: { id: body.slotId } })

    if (!slot || slot.status !== 'open') {
      return reply.status(400).send({ data: null, error: { code: 'SLOT_UNAVAILABLE', message: 'El slot no está disponible' } })
    }

    const offer = await prisma.offer.create({
      data: {
        slotId: body.slotId,
        teamId,
        eventName: body.eventName,
        budgetOffered: body.budgetOffered,
        deliverables: body.deliverables,
        message: body.message ?? null,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
      include: { slot: { include: { photographer: { include: { user: true } } } }, team: true },
    })

    // Notificar al fotógrafo en segundo plano — no bloquea la respuesta
    notify.newOffer(
      offer.slot.photographer.userId,
      offer.team.clubName,
      offer.eventName,
      offer.budgetOffered
    ).catch(() => {})

    mail.offerReceived({
      photographerEmail: offer.slot.photographer.user.email,
      photographerName: offer.slot.photographer.user.fullName,
      teamName: offer.team.clubName,
      eventName: offer.eventName,
      eventDate: offer.slot.startsAt,
      eventCity: offer.slot.city,
      budgetOffered: offer.budgetOffered,
      message: offer.message,
    }).catch(() => {})

    return { data: offer, error: null }
  })

  // Fotógrafo ve sus ofertas recibidas
  app.get('/offers/received', async (req, reply) => {
    const photographerId = req.user.photographerId

    if (!photographerId) {
      return reply.status(403).send({ data: null, error: { code: 'NOT_PHOTOGRAPHER', message: 'Acceso denegado' } })
    }

    const offers = await prisma.offer.findMany({
      where: {
        slot: { photographerId },
        status: 'pending',
        expiresAt: { gt: new Date() },
      },
      include: {
        slot: true,
        team: { select: { clubName: true, logoUrl: true, sport: true, city: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return { data: offers, error: null }
  })

  // Fotógrafo acepta una oferta — transacción atómica
  app.post('/offers/:id/accept', async (req, reply) => {
    const { id } = req.params as { id: string }
    const photographerId = req.user.photographerId

    if (!photographerId) {
      return reply.status(403).send({ data: null, error: { code: 'NOT_PHOTOGRAPHER', message: 'Acceso denegado' } })
    }

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        slot: true,
        team: { include: { user: true } },
      },
    })

    if (!offer || offer.slot.photographerId !== photographerId) {
      return reply.status(404).send({ data: null, error: { code: 'NOT_FOUND', message: 'Oferta no encontrada' } })
    }

    if (offer.status !== 'pending' || offer.slot.status !== 'open') {
      return reply.status(400).send({ data: null, error: { code: 'OFFER_UNAVAILABLE', message: 'Esta oferta ya no está disponible' } })
    }

    const photographer = await prisma.photographer.findUnique({ where: { id: photographerId }, include: { user: true } })
    if (!photographer?.stripeOnboarded) {
      return reply.status(400).send({ data: null, error: { code: 'STRIPE_NOT_ONBOARDED', message: 'Debes completar el onboarding de pagos antes de aceptar ofertas' } })
    }

    // Generar el ID del booking antes de la transacción para usarlo en Payment
    const bookingId = randomUUID()

    const { commissionAmount, photographerPayout } = calculateSplit(offer.budgetOffered, photographer.commissionPct)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: offer.budgetOffered,
      currency: 'eur',
      capture_method: 'manual',
      application_fee_amount: commissionAmount,
      transfer_data: { destination: photographer.stripeAccountId! },
      metadata: { offerId: offer.id, bookingId },
    })

    // Transacción atómica: aceptar oferta, rechazar el resto, cerrar slot, crear booking y payment
    const [booking] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          id: bookingId,
          offerId: offer.id,
          slotId: offer.slotId,
          teamId: offer.teamId,
          photographerId,
          agreedPrice: offer.budgetOffered,
        },
      }),
      prisma.payment.create({
        data: {
          bookingId,
          stripePaymentIntentId: paymentIntent.id,
          amount: offer.budgetOffered,
          commissionPct: photographer.commissionPct,
          commissionAmount,
          photographerPayout,
        },
      }),
      prisma.offer.update({
        where: { id },
        data: { status: 'accepted' },
      }),
      prisma.offer.updateMany({
        where: { slotId: offer.slotId, id: { not: id }, status: 'pending' },
        data: { status: 'rejected' },
      }),
      prisma.availabilitySlot.update({
        where: { id: offer.slotId },
        data: { status: 'booked' },
      }),
    ])

    // Notificar al equipo que su oferta fue aceptada
    notify.offerAccepted(
      offer.team.userId,
      photographer.user?.fullName ?? 'El fotógrafo',
      offer.eventName
    ).catch(() => {})

    scheduleEventReminder(booking.id, offer.slot.startsAt).catch(() => {})

    mail.bookingConfirmed({
      teamEmail: offer.team.user.email,
      teamName: offer.team.clubName,
      photographerEmail: photographer.user!.email,
      photographerName: photographer.user!.fullName,
      eventName: offer.eventName,
      eventDate: offer.slot.startsAt,
      eventCity: offer.slot.city,
      agreedPrice: offer.budgetOffered,
    }).catch(() => {})

    return { data: booking, error: null }
  })

  // Fotógrafo rechaza una oferta
  app.post('/offers/:id/reject', async (req, reply) => {
    const { id } = req.params as { id: string }
    const photographerId = req.user.photographerId

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { slot: true, team: true },
    })

    if (!offer || offer.slot.photographerId !== photographerId) {
      return reply.status(404).send({ data: null, error: { code: 'NOT_FOUND', message: 'Oferta no encontrada' } })
    }

    if (offer.status !== 'pending') {
      return reply.status(400).send({ data: null, error: { code: 'ALREADY_RESOLVED', message: 'Esta oferta ya fue resuelta' } })
    }

    await prisma.offer.update({ where: { id }, data: { status: 'rejected' } })

    notify.offerRejected(offer.team.userId, offer.eventName).catch(() => {})

    return { data: { ok: true }, error: null }
  })
}
