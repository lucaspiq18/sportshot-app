import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const createSlotSchema = z.object({
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  sport: z.string().min(1),
  city: z.string().min(1),
})

const searchSlotsSchema = z.object({
  sport: z.string().optional(),
  city: z.string().optional(),
  date: z.string().date().optional(),
})

export async function slotsRoutes(app: FastifyInstance) {
  // Fotógrafo publica disponibilidad
  app.post('/slots', async (req, reply) => {
    const body = createSlotSchema.parse(req.body)
    const photographerId = req.user.photographerId

    if (!photographerId) {
      return reply.status(403).send({ data: null, error: { code: 'NOT_PHOTOGRAPHER', message: 'Solo fotógrafos pueden publicar slots' } })
    }

    const slot = await prisma.availabilitySlot.create({
      data: {
        photographerId,
        startsAt: new Date(body.startsAt),
        endsAt: new Date(body.endsAt),
        sport: body.sport,
        city: body.city,
      },
    })

    return { data: slot, error: null }
  })

  // Buscar slots disponibles (vista del equipo)
  app.get('/slots', async (req, reply) => {
    const query = searchSlotsSchema.parse(req.query)

    const slots = await prisma.availabilitySlot.findMany({
      where: {
        status: 'open',
        ...(query.sport && { sport: query.sport }),
        ...(query.city && { city: query.city }),
        ...(query.date && {
          startsAt: {
            gte: new Date(query.date),
            lt: new Date(new Date(query.date).getTime() + 86400000),
          },
        }),
        startsAt: { gt: new Date() },
      },
      include: {
        photographer: {
          include: { user: { select: { fullName: true, avatarUrl: true } } },
        },
        _count: { select: { offers: { where: { status: 'pending' } } } },
      },
      orderBy: { startsAt: 'asc' },
    })

    return { data: slots, error: null }
  })

  // Cancelar slot propio
  app.delete('/slots/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const photographerId = req.user.photographerId

    const slot = await prisma.availabilitySlot.findUnique({ where: { id } })

    if (!slot || slot.photographerId !== photographerId) {
      return reply.status(404).send({ data: null, error: { code: 'NOT_FOUND', message: 'Slot no encontrado' } })
    }

    if (slot.status === 'booked') {
      return reply.status(400).send({ data: null, error: { code: 'SLOT_BOOKED', message: 'No puedes cancelar un slot ya reservado' } })
    }

    await prisma.availabilitySlot.update({
      where: { id },
      data: { status: 'cancelled' },
    })

    return { data: { ok: true }, error: null }
  })
}
