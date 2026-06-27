import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { presignedUploadUrl, presignedDownloadUrl, r2Key } from '../lib/r2'
import { prisma } from '../lib/prisma'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
type AllowedType = typeof ALLOWED_TYPES[number]

const uploadRequestSchema = z.object({
  files: z.array(z.object({
    filename: z.string().min(1),
    contentType: z.enum(ALLOWED_TYPES),
    sizeBytes: z.number().int().positive().max(50 * 1024 * 1024), // 50 MB por foto
  })).min(1).max(200), // máximo 200 fotos por entrega
  bookingId: z.string().uuid(),
})

const portfolioUploadSchema = z.object({
  files: z.array(z.object({
    filename: z.string().min(1),
    contentType: z.enum(ALLOWED_TYPES),
  })).min(1).max(20),
})

export async function uploadsRoutes(app: FastifyInstance) {

  // 1. Fotógrafo solicita URLs prefirmadas para subir la entrega
  app.post('/uploads/delivery', async (req, reply) => {
    const body = uploadRequestSchema.parse(req.body)
    const photographerId = req.user.photographerId

    if (!photographerId) {
      return reply.status(403).send({ data: null, error: { code: 'NOT_PHOTOGRAPHER', message: 'Acceso denegado' } })
    }

    const booking = await prisma.booking.findUnique({ where: { id: body.bookingId } })

    if (!booking || booking.photographerId !== photographerId) {
      return reply.status(404).send({ data: null, error: { code: 'NOT_FOUND', message: 'Reserva no encontrada' } })
    }

    if (booking.status !== 'confirmed') {
      return reply.status(400).send({ data: null, error: { code: 'INVALID_STATUS', message: 'Solo puedes subir material en reservas confirmadas' } })
    }

    // Generar una URL prefirmada por cada archivo
    const urls = await Promise.all(
      body.files.map(async (file) => {
        const ext = file.filename.split('.').pop() ?? 'jpg'
        const key = r2Key.delivery(body.bookingId, `${randomUUID()}.${ext}`)
        const uploadUrl = await presignedUploadUrl(key, file.contentType)
        return { key, uploadUrl, filename: file.filename }
      })
    )

    return { data: { urls }, error: null }
  })

  // 2. Fotógrafo confirma que terminó de subir — registra la entrega en BD
  // (reemplaza el endpoint anterior en deliveries.ts para el caso de upload a R2)
  app.post('/uploads/delivery/confirm', async (req, reply) => {
    const body = z.object({
      bookingId: z.string().uuid(),
      keys: z.array(z.string()).min(1),
    }).parse(req.body)

    const photographerId = req.user.photographerId

    if (!photographerId) {
      return reply.status(403).send({ data: null, error: { code: 'NOT_PHOTOGRAPHER', message: 'Acceso denegado' } })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: body.bookingId },
      include: { delivery: true, team: { include: { user: true } }, offer: true },
    })

    if (!booking || booking.photographerId !== photographerId) {
      return reply.status(404).send({ data: null, error: { code: 'NOT_FOUND', message: 'Reserva no encontrada' } })
    }

    if (booking.delivery) {
      return reply.status(400).send({ data: null, error: { code: 'ALREADY_DELIVERED', message: 'Ya existe una entrega para esta reserva' } })
    }

    const reviewDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000)

    const delivery = await prisma.delivery.create({
      data: {
        bookingId: body.bookingId,
        filesUrl: body.keys,  // guardamos las keys de R2, no URLs directas
        photoCount: body.keys.length,
        reviewDeadline,
      },
    })

    // Importar aquí para evitar dependencia circular
    const { onDeliveryCreated } = await import('./webhooks/delivery')
    const { notify } = await import('../lib/notifications')
    const { mail } = await import('../emails/index')

    await onDeliveryCreated(delivery.id, reviewDeadline)

    notify.materialDelivered(booking.team.userId, booking.offer.eventName).catch(() => {})
    mail.materialDelivered({
      teamEmail: booking.team.user.email,
      teamName: booking.team.clubName,
      photographerName: '', // se completa con include si se necesita
      eventName: booking.offer.eventName,
      photoCount: body.keys.length,
      reviewDeadline,
    }).catch(() => {})

    return { data: delivery, error: null }
  })

  // 3. Equipo solicita URLs de descarga para ver/descargar las fotos
  app.post('/uploads/delivery/download-urls', async (req, reply) => {
    const body = z.object({ bookingId: z.string().uuid() }).parse(req.body)
    const teamId = req.user.teamId

    if (!teamId) {
      return reply.status(403).send({ data: null, error: { code: 'NOT_TEAM', message: 'Acceso denegado' } })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: body.bookingId },
      include: { delivery: true },
    })

    if (!booking || booking.teamId !== teamId) {
      return reply.status(404).send({ data: null, error: { code: 'NOT_FOUND', message: 'Reserva no encontrada' } })
    }

    if (!booking.delivery) {
      return reply.status(404).send({ data: null, error: { code: 'NO_DELIVERY', message: 'El fotógrafo aún no ha entregado el material' } })
    }

    // Generar URLs firmadas de descarga para cada foto (expiran en 1h)
    const downloadUrls = await Promise.all(
      booking.delivery.filesUrl.map((key) => presignedDownloadUrl(key))
    )

    return { data: { urls: downloadUrls, expiresIn: 3600 }, error: null }
  })

  // 4. Fotógrafo sube fotos al portfolio
  app.post('/uploads/portfolio', async (req, reply) => {
    const body = portfolioUploadSchema.parse(req.body)
    const photographerId = req.user.photographerId

    if (!photographerId) {
      return reply.status(403).send({ data: null, error: { code: 'NOT_PHOTOGRAPHER', message: 'Acceso denegado' } })
    }

    const urls = await Promise.all(
      body.files.map(async (file) => {
        const ext = file.filename.split('.').pop() ?? 'jpg'
        const key = r2Key.portfolio(photographerId, `${randomUUID()}.${ext}`)
        const uploadUrl = await presignedUploadUrl(key, file.contentType)
        return { key, uploadUrl }
      })
    )

    return { data: { urls }, error: null }
  })
}
