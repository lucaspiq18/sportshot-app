import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { slotsRoutes } from './routes/slots'
import { offersRoutes } from './routes/offers'
import { deliveriesRoutes } from './routes/deliveries'
import { connectRoutes } from './routes/connect'
import { tokensRoutes } from './routes/tokens'
import { uploadsRoutes } from './routes/uploads'
import { reviewsRoutes } from './routes/reviews'
import { onboardingRoutes } from './routes/onboarding'
import { photographersRoutes } from './routes/photographers'
import { webhooksRoutes } from './routes/webhooks/index'
import { startReleaseFundsWorker } from './jobs/release-funds'
import { startEventReminderWorker } from './jobs/event-reminder'
import { prisma } from './lib/prisma'

const app = Fastify({
  logger: true,
  // Necesario para que Stripe pueda verificar la firma del webhook
  bodyLimit: 1048576,
})

// Guardar rawBody antes de parsear — requerido por stripe.webhooks.constructEvent
app.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
  ;(req as any).rawBody = body
  try {
    done(null, JSON.parse(body.toString()))
  } catch (err) {
    done(err as Error, undefined)
  }
})

// Plugins
await app.register(cors, { origin: true })
await app.register(jwt, { secret: process.env.JWT_SECRET! })

const WEBHOOK_ROUTES = [
  '/api/v1/webhooks/stripe',
  '/api/v1/webhooks/stripe/connect',
  '/api/v1/connect/return',
  '/api/v1/connect/refresh',
]

// Auth hook — adjunta user a cada request
app.addHook('onRequest', async (req, reply) => {
  const publicRoutes = ['/health', ...WEBHOOK_ROUTES]
  if (publicRoutes.includes(req.url)) return

  try {
    await req.jwtVerify()

    // Cargar perfil de fotógrafo o equipo según el rol
    const userId = (req.user as { sub: string }).sub
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { photographer: true, team: true },
    })

    if (!user) return reply.status(401).send({ data: null, error: { code: 'UNAUTHORIZED', message: 'Usuario no encontrado' } })

    req.user = {
      ...req.user,
      userId: user.id,
      role: user.role,
      photographerId: user.photographer?.id ?? null,
      teamId: user.team?.id ?? null,
    }
  } catch {
    return reply.status(401).send({ data: null, error: { code: 'UNAUTHORIZED', message: 'Token inválido' } })
  }
})

// Rutas
app.get('/health', async () => ({ ok: true }))
await app.register(slotsRoutes, { prefix: '/api/v1' })
await app.register(offersRoutes, { prefix: '/api/v1' })
await app.register(deliveriesRoutes, { prefix: '/api/v1' })
await app.register(connectRoutes, { prefix: '/api/v1' })
await app.register(tokensRoutes, { prefix: '/api/v1' })
await app.register(uploadsRoutes, { prefix: '/api/v1' })
await app.register(reviewsRoutes, { prefix: '/api/v1' })
await app.register(onboardingRoutes, { prefix: '/api/v1' })
await app.register(photographersRoutes, { prefix: '/api/v1' })
await app.register(webhooksRoutes, { prefix: '/api/v1' })

// Workers
startReleaseFundsWorker()
startEventReminderWorker()

// Arranque
try {
  await app.listen({ port: Number(process.env.PORT ?? 3000), host: '0.0.0.0' })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
