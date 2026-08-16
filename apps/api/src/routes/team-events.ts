import type { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { stripe, calculateSplit, COMMISSION_PCT } from '../lib/stripe'

const createEventSchema = z.object({
  eventName: z.string().min(1),
  sport: z.string().min(1),
  city: z.string().min(1),
  localidad: z.string().optional(),
  eventDate: z.string().datetime(),
  budget: z.number().int().positive(),
  description: z.string().max(500).optional(),
})

const createBidSchema = z.object({
  proposedPrice: z.number().int().positive(),
  message: z.string().max(500).optional(),
})

export async function teamEventsRoutes(app: FastifyInstance) {

  // Equipo publica un evento/partido
  app.post('/team-events', async (req, reply) => {
    const teamId = req.user.teamId
    if (!teamId) return reply.status(403).send({ data: null, error: { code: 'NOT_TEAM', message: 'Solo equipos pueden publicar eventos' } })

    const body = createEventSchema.parse(req.body)

    const event = await prisma.teamEvent.create({
      data: {
        teamId,
        eventName: body.eventName,
        sport: body.sport,
        city: body.city,
        localidad: body.localidad ?? null,
        eventDate: new Date(body.eventDate),
        budget: body.budget,
        description: body.description ?? null,
        expiresAt: new Date(new Date(body.eventDate).getTime() - 24 * 60 * 60 * 1000), // expira 24h antes del evento
      },
    })

    return { data: event, error: null }
  })

  // Listar eventos abiertos — fotógrafos los ven, con filtro por ciudad
  app.get('/team-events', async (req, reply) => {
    const { city } = req.query as { city?: string }

    const events = await prisma.teamEvent.findMany({
      where: {
        status: 'open',
        eventDate: { gt: new Date() },
        ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
      },
      include: {
        team: { select: { clubName: true, sport: true, logoUrl: true } },
        _count: { select: { bids: { where: { status: 'pending' } } } },
      },
      orderBy: { eventDate: 'asc' },
    })

    return { data: events, error: null }
  })

  // Eventos propios del equipo
  app.get('/team-events/mine', async (req, reply) => {
    const teamId = req.user.teamId
    if (!teamId) return reply.status(403).send({ data: null, error: { code: 'NOT_TEAM', message: 'Acceso denegado' } })

    const events = await prisma.teamEvent.findMany({
      where: { teamId },
      include: {
        _count: { select: { bids: { where: { status: 'pending' } } } },
      },
      orderBy: { eventDate: 'asc' },
    })

    return { data: events, error: null }
  })

  // Detalle de un evento — equipo ve las pujas, fotógrafo ve el evento
  app.get('/team-events/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { teamId, photographerId } = req.user

    const event = await prisma.teamEvent.findUnique({
      where: { id },
      include: {
        team: { select: { clubName: true, sport: true, city: true, logoUrl: true } },
        bids: teamId
          ? {
              include: {
                photographer: { include: { user: { select: { fullName: true, avatarUrl: true } } } },
              },
              orderBy: { createdAt: 'asc' },
            }
          : {
              where: { photographerId: photographerId ?? '' },
            },
      },
    })

    if (!event) return reply.status(404).send({ data: null, error: { code: 'NOT_FOUND', message: 'Evento no encontrado' } })

    // Solo el equipo dueño o cualquier fotógrafo puede verlo
    if (teamId && event.teamId !== teamId) {
      return reply.status(403).send({ data: null, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } })
    }

    return { data: event, error: null }
  })

  // Fotógrafo envía una puja a un evento
  app.post('/team-events/:id/bids', async (req, reply) => {
    const { id } = req.params as { id: string }
    const photographerId = req.user.photographerId
    if (!photographerId) return reply.status(403).send({ data: null, error: { code: 'NOT_PHOTOGRAPHER', message: 'Solo fotógrafos pueden pujar' } })

    const body = createBidSchema.parse(req.body)

    const event = await prisma.teamEvent.findUnique({ where: { id } })
    if (!event || event.status !== 'open' || event.eventDate < new Date()) {
      return reply.status(400).send({ data: null, error: { code: 'EVENT_UNAVAILABLE', message: 'El evento no está disponible' } })
    }

    // Un fotógrafo solo puede tener una puja activa por evento
    const existing = await prisma.photographerBid.findUnique({
      where: { teamEventId_photographerId: { teamEventId: id, photographerId } },
    })
    if (existing) {
      return reply.status(409).send({ data: null, error: { code: 'ALREADY_BID', message: 'Ya has enviado una puja para este evento' } })
    }

    const bid = await prisma.photographerBid.create({
      data: {
        teamEventId: id,
        photographerId,
        proposedPrice: body.proposedPrice,
        message: body.message ?? null,
      },
    })

    return { data: bid, error: null }
  })

  // Equipo acepta la puja de un fotógrafo
  app.post('/team-events/:id/bids/:bidId/accept', async (req, reply) => {
    const { id, bidId } = req.params as { id: string; bidId: string }
    const teamId = req.user.teamId
    if (!teamId) return reply.status(403).send({ data: null, error: { code: 'NOT_TEAM', message: 'Acceso denegado' } })

    const event = await prisma.teamEvent.findUnique({ where: { id } })
    if (!event || event.teamId !== teamId) {
      return reply.status(404).send({ data: null, error: { code: 'NOT_FOUND', message: 'Evento no encontrado' } })
    }
    if (event.status !== 'open') {
      return reply.status(400).send({ data: null, error: { code: 'EVENT_CLOSED', message: 'Este evento ya está cerrado' } })
    }

    const bid = await prisma.photographerBid.findUnique({
      where: { id: bidId },
      include: { photographer: { include: { user: true, referredBy: true } } },
    })
    if (!bid || bid.teamEventId !== id || bid.status !== 'pending') {
      return reply.status(404).send({ data: null, error: { code: 'NOT_FOUND', message: 'Puja no encontrada' } })
    }

    if (!bid.photographer.stripeOnboarded) {
      return reply.status(400).send({ data: null, error: { code: 'STRIPE_NOT_ONBOARDED', message: 'El fotógrafo aún no ha completado el onboarding de pagos' } })
    }

    const bookingId = randomUUID()
    const referrer = bid.photographer.referredBy ?? null
    const { commissionAmount, photographerPayout, referrerPayout } = calculateSplit(bid.proposedPrice, !!referrer)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: bid.proposedPrice,
      currency: 'eur',
      capture_method: 'manual',
      application_fee_amount: commissionAmount,
      transfer_data: { destination: bid.photographer.stripeAccountId! },
      metadata: { bidId: bid.id, bookingId },
    })

    const [booking] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          id: bookingId,
          bidId: bid.id,
          teamId,
          photographerId: bid.photographerId,
          agreedPrice: bid.proposedPrice,
        },
      }),
      prisma.payment.create({
        data: {
          bookingId,
          stripePaymentIntentId: paymentIntent.id,
          amount: bid.proposedPrice,
          commissionPct: COMMISSION_PCT,
          commissionAmount,
          photographerPayout,
          referrerPhotographerId: referrer?.id ?? null,
          referrerPayout,
        },
      }),
      prisma.photographerBid.update({ where: { id: bidId }, data: { status: 'accepted' } }),
      prisma.photographerBid.updateMany({
        where: { teamEventId: id, id: { not: bidId }, status: 'pending' },
        data: { status: 'rejected' },
      }),
      prisma.teamEvent.update({ where: { id }, data: { status: 'closed' } }),
    ])

    return { data: booking, error: null }
  })

  // Equipo rechaza la puja de un fotógrafo
  app.post('/team-events/:id/bids/:bidId/reject', async (req, reply) => {
    const { id, bidId } = req.params as { id: string; bidId: string }
    const teamId = req.user.teamId
    if (!teamId) return reply.status(403).send({ data: null, error: { code: 'NOT_TEAM', message: 'Acceso denegado' } })

    const bid = await prisma.photographerBid.findUnique({
      where: { id: bidId },
      include: { teamEvent: true },
    })
    if (!bid || bid.teamEvent.teamId !== teamId || bid.status !== 'pending') {
      return reply.status(404).send({ data: null, error: { code: 'NOT_FOUND', message: 'Puja no encontrada' } })
    }

    await prisma.photographerBid.update({ where: { id: bidId }, data: { status: 'rejected' } })

    return { data: { ok: true }, error: null }
  })
}
