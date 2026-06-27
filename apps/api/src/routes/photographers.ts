import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'

export async function photographersRoutes(app: FastifyInstance) {

  // Perfil público de un fotógrafo
  app.get('/photographers/:photographerId', async (req, reply) => {
    const { photographerId } = req.params as { photographerId: string }

    const photographer = await prisma.photographer.findUnique({
      where: { id: photographerId },
      include: {
        user: { select: { fullName: true } },
        _count: { select: { bookings: { where: { status: 'completed' } } } },
      },
    })

    if (!photographer) {
      return reply.status(404).send({ data: null, error: { code: 'NOT_FOUND', message: 'Fotógrafo no encontrado' } })
    }

    // Últimas 3 reseñas para preview en el perfil
    const reviews = await prisma.review.findMany({
      where: { booking: { photographerId } },
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: { select: { fullName: true } },
        booking: { include: { offer: { select: { eventName: true } } } },
      },
    })

    // Slots disponibles próximos (próximos 30 días)
    const slots = await prisma.slot.findMany({
      where: {
        photographerId,
        startsAt: { gte: new Date() },
        status: 'available',
      },
      orderBy: { startsAt: 'asc' },
      take: 10,
      select: { id: true, startsAt: true, endsAt: true, city: true, price: true, sports: true },
    })

    return {
      data: {
        id: photographer.id,
        fullName: photographer.user.fullName,
        city: photographer.city,
        sports: photographer.sports,
        bio: photographer.bio,
        ratingAvg: photographer.ratingAvg,
        ratingCount: photographer._count.bookings,
        completedJobs: photographer._count.bookings,
        reviews,
        slots,
      },
      error: null,
    }
  })
}
