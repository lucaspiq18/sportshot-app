import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { notify } from '../lib/notifications'

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
})

export async function reviewsRoutes(app: FastifyInstance) {

  // Equipo deja valoración tras completar una reserva
  app.post('/bookings/:bookingId/review', async (req, reply) => {
    const { bookingId } = req.params as { bookingId: string }
    const body = createReviewSchema.parse(req.body)
    const userId = req.user.userId
    const teamId = req.user.teamId

    if (!teamId) {
      return reply.status(403).send({ data: null, error: { code: 'NOT_TEAM', message: 'Solo los equipos pueden valorar' } })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { photographer: { include: { user: true } } },
    })

    if (!booking || booking.teamId !== teamId) {
      return reply.status(404).send({ data: null, error: { code: 'NOT_FOUND', message: 'Reserva no encontrada' } })
    }

    if (booking.status !== 'completed') {
      return reply.status(400).send({ data: null, error: { code: 'NOT_COMPLETED', message: 'Solo puedes valorar reservas completadas' } })
    }

    const existing = await prisma.review.findUnique({
      where: { bookingId_reviewerId: { bookingId, reviewerId: userId } },
    })
    if (existing) {
      return reply.status(409).send({ data: null, error: { code: 'ALREADY_REVIEWED', message: 'Ya has valorado esta reserva' } })
    }

    // Crear review y recalcular media del fotógrafo en una transacción
    const [review] = await prisma.$transaction([
      prisma.review.create({
        data: { bookingId, reviewerId: userId, rating: body.rating, comment: body.comment },
      }),
      prisma.photographer.update({
        where: { id: booking.photographerId },
        data: {
          ratingCount: { increment: 1 },
          // Recalcular media con fórmula incremental: newAvg = (oldAvg * oldCount + newRating) / newCount
          ratingAvg: {
            set: await computeNewAvg(booking.photographerId, body.rating),
          },
        },
      }),
    ])

    // Notificar al fotógrafo (no bloqueante)
    notify.newReview(booking.photographer.userId, body.rating).catch(() => {})

    return { data: review, error: null }
  })

  // Obtener valoraciones de un fotógrafo (público)
  app.get('/photographers/:photographerId/reviews', async (req, reply) => {
    const { photographerId } = req.params as { photographerId: string }
    const { page = '1', limit = '10' } = req.query as { page?: string; limit?: string }

    const take = Math.min(parseInt(limit), 50)
    const skip = (parseInt(page) - 1) * take

    const [reviews, total, photographer] = await Promise.all([
      prisma.review.findMany({
        where: { booking: { photographerId } },
        include: { reviewer: { select: { fullName: true } }, booking: { include: { offer: { select: { eventName: true } } } } },
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
      data: {
        reviews,
        pagination: { total, page: parseInt(page), limit: take, pages: Math.ceil(total / take) },
        summary: photographer,
      },
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
