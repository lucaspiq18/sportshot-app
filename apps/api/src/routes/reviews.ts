import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { notify } from '../lib/notifications'

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
})

export async function reviewsRoutes(app: FastifyInstance) {

  // Cualquier parte del booking (equipo o fotógrafo) puede dejar su reseña
  app.post('/bookings/:bookingId/review', async (req, reply) => {
    const { bookingId } = req.params as { bookingId: string }
    const body = createReviewSchema.parse(req.body)
    const userId = req.user.userId
    const { teamId, photographerId } = req.user

    if (!teamId && !photographerId) {
      return reply.status(403).send({ data: null, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        photographer: { include: { user: true } },
        team: { include: { user: true } },
      },
    })

    if (!booking) {
      return reply.status(404).send({ data: null, error: { code: 'NOT_FOUND', message: 'Reserva no encontrada' } })
    }

    // Verificar que el usuario pertenece a esta reserva
    const isTeam = teamId && booking.teamId === teamId
    const isPhotographer = photographerId && booking.photographerId === photographerId

    if (!isTeam && !isPhotographer) {
      return reply.status(403).send({ data: null, error: { code: 'FORBIDDEN', message: 'No perteneces a esta reserva' } })
    }

    if (booking.status !== 'completed') {
      return reply.status(400).send({ data: null, error: { code: 'NOT_COMPLETED', message: 'Solo puedes valorar reservas completadas' } })
    }

    const existing = await prisma.review.findUnique({
      where: { bookingId_reviewerId: { bookingId, reviewerId: userId } },
    })
    if (existing) {
      return reply.status(409).send({ data: null, error: { code: 'ALREADY_REVIEWED', message: 'Ya has dejado tu reseña para esta reserva' } })
    }

    const review = await prisma.review.create({
      data: { bookingId, reviewerId: userId, rating: body.rating, comment: body.comment },
    })

    // Si es el equipo quien valora → actualizar media del fotógrafo
    if (isTeam) {
      const newAvg = await computeNewAvg(booking.photographerId, body.rating)
      await prisma.photographer.update({
        where: { id: booking.photographerId },
        data: { ratingCount: { increment: 1 }, ratingAvg: { set: newAvg } },
      })
      notify.newReview(booking.photographer.userId, body.rating).catch(() => {})
    } else {
      // Fotógrafo valora al equipo → notificar al equipo
      notify.newReview(booking.team.userId, body.rating).catch(() => {})
    }

    return { data: review, error: null }
  })

  // Reservas completadas pendientes de reseña por el usuario actual
  app.get('/bookings/pending-review', async (req) => {
    const { userId, teamId, photographerId } = req.user

    const bookings = await prisma.booking.findMany({
      where: {
        status: 'completed',
        ...(teamId ? { teamId } : { photographerId: photographerId! }),
        // No tienen reseña del usuario actual
        reviews: { none: { reviewerId: userId } },
      },
      include: {
        offer: { select: { eventName: true } },
        photographer: { include: { user: { select: { fullName: true, avatarUrl: true } } } },
        team: { select: { clubName: true, logoUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return { data: bookings, error: null }
  })

  // Reseñas ya enviadas por el usuario actual
  app.get('/bookings/my-reviews', async (req) => {
    const { userId } = req.user

    const reviews = await prisma.review.findMany({
      where: { reviewerId: userId },
      include: {
        booking: {
          include: {
            offer: { select: { eventName: true } },
            photographer: { include: { user: { select: { fullName: true } } } },
            team: { select: { clubName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return { data: reviews, error: null }
  })

  // Valoraciones de un fotógrafo (público)
  app.get('/photographers/:photographerId/reviews', async (req) => {
    const { photographerId } = req.params as { photographerId: string }
    const { page = '1', limit = '10' } = req.query as { page?: string; limit?: string }

    const take = Math.min(parseInt(limit), 50)
    const skip = (parseInt(page) - 1) * take

    const [reviews, total, photographer] = await Promise.all([
      prisma.review.findMany({
        where: {
          booking: { photographerId },
        },
        include: {
          reviewer: { select: { fullName: true } },
          booking: { include: { offer: { select: { eventName: true } }, team: { select: { clubName: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.review.count({ where: { booking: { photographerId } } }),
      prisma.photographer.findUnique({
        where: { id: photographerId },
        select: { ratingAvg: true, ratingCount: true },
      }),
    ])

    return {
      data: { reviews, pagination: { total, page: parseInt(page), limit: take, pages: Math.ceil(total / take) }, summary: photographer },
      error: null,
    }
  })
}

async function computeNewAvg(photographerId: string, newRating: number): Promise<number> {
  const agg = await prisma.review.aggregate({
    where: { booking: { photographerId } },
    _avg: { rating: true },
    _count: { rating: true },
  })
  const currentSum = (agg._avg.rating ?? 0) * agg._count.rating
  return parseFloat(((currentSum + newRating) / (agg._count.rating + 1)).toFixed(2))
}
