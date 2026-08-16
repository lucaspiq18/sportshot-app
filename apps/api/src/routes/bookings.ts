import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function bookingsRoutes(app: FastifyInstance) {

  // GET /bookings — list for the current user (team or photographer)
  app.get('/bookings', async (req, reply) => {
    const { teamId, photographerId } = req.user

    const where = teamId
      ? { teamId }
      : photographerId
      ? { photographerId }
      : null

    if (!where) return reply.status(403).send({ data: null, error: { code: 'NO_ROLE', message: '' } })

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        offer: { select: { eventName: true, eventDate: true } },
        bid: { include: { teamEvent: { select: { eventName: true, eventDate: true, city: true } } } },
        team: { select: { clubName: true } },
        photographer: { select: { user: { select: { fullName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return { data: bookings, error: null }
  })

  // GET /bookings/:id — single booking detail
  app.get('/bookings/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { teamId, photographerId, userId } = req.user

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        offer: { select: { eventName: true, eventDate: true } },
        bid: { include: { teamEvent: { select: { eventName: true, eventDate: true, city: true, sport: true } } } },
        slot: { select: { startsAt: true, endsAt: true, city: true, sports: true } },
        team: { select: { clubName: true, user: { select: { fullName: true } } } },
        photographer: { select: { user: { select: { fullName: true, id: true } } } },
        delivery: { select: { status: true, photoUrls: true } },
        payment: { select: { status: true, amount: true } },
      },
    })

    if (!booking) return reply.status(404).send({ data: null, error: { code: 'NOT_FOUND', message: '' } })
    if (booking.teamId !== teamId && booking.photographerId !== photographerId) {
      return reply.status(403).send({ data: null, error: { code: 'FORBIDDEN', message: '' } })
    }

    return { data: { ...booking, currentUserId: userId }, error: null }
  })

  // GET /bookings/:id/messages
  app.get('/bookings/:id/messages', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { teamId, photographerId } = req.user

    const booking = await prisma.booking.findUnique({ where: { id }, select: { teamId: true, photographerId: true } })
    if (!booking || (booking.teamId !== teamId && booking.photographerId !== photographerId)) {
      return reply.status(403).send({ data: null, error: { code: 'FORBIDDEN', message: '' } })
    }

    const messages = await prisma.message.findMany({
      where: { bookingId: id },
      include: { sender: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'asc' },
    })

    return { data: messages, error: null }
  })

  // POST /bookings/:id/messages
  app.post('/bookings/:id/messages', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { teamId, photographerId, userId } = req.user
    const { content } = z.object({ content: z.string().min(1).max(2000) }).parse(req.body)

    const booking = await prisma.booking.findUnique({ where: { id }, select: { teamId: true, photographerId: true } })
    if (!booking || (booking.teamId !== teamId && booking.photographerId !== photographerId)) {
      return reply.status(403).send({ data: null, error: { code: 'FORBIDDEN', message: '' } })
    }

    const message = await prisma.message.create({
      data: { bookingId: id, senderId: userId, content },
      include: { sender: { select: { id: true, fullName: true } } },
    })

    return { data: message, error: null }
  })
}
