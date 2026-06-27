import Fastify from 'fastify'
import cors from '@fastify/cors'
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

async function main() {
  const app = Fastify({
    logger: true,
    bodyLimit: 1048576,
  })

  app.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
    ;(req as any).rawBody = body
    try {
      done(null, JSON.parse(body.toString()))
    } catch (err) {
      done(err as Error, undefined)
    }
  })

  await app.register(cors, { origin: true })

  // Clerk usa RS256 — verificamos con su JWKS endpoint
  // CLERK_JWKS_URL tiene formato: https://<clerk-domain>/.well-known/jwks.json
  const { createRemoteJWKSet, jwtVerify } = await import('jose')
  const JWKS = createRemoteJWKSet(new URL(process.env.CLERK_JWKS_URL!))

  async function verifyClerkToken(token: string): Promise<{ sub: string } | null> {
    try {
      const { payload } = await jwtVerify(token, JWKS, { algorithms: ['RS256'] })
      return payload as { sub: string }
    } catch {
      return null
    }
  }

  const WEBHOOK_ROUTES = [
    '/api/v1/webhooks/stripe',
    '/api/v1/webhooks/stripe/connect',
    '/api/v1/connect/return',
    '/api/v1/connect/refresh',
  ]

  app.addHook('onRequest', async (req, reply) => {
    const publicRoutes = ['/health', ...WEBHOOK_ROUTES]
    if (publicRoutes.includes(req.url)) return

    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ data: null, error: { code: 'UNAUTHORIZED', message: 'Token requerido' } })
    }

    const token = authHeader.slice(7)
    const payload = await verifyClerkToken(token)

    if (!payload) {
      return reply.status(401).send({ data: null, error: { code: 'UNAUTHORIZED', message: 'Token inválido' } })
    }

    const userId = payload.sub
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { photographer: true, team: true },
    })

    if (!user) return reply.status(401).send({ data: null, error: { code: 'UNAUTHORIZED', message: 'Usuario no encontrado' } })

    req.user = {
      sub: userId,
      userId: user.id,
      role: user.role,
      photographerId: user.photographer?.id ?? null,
      teamId: user.team?.id ?? null,
    }
  })

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

  startReleaseFundsWorker()
  startEventReminderWorker()

  try {
    await app.listen({ port: Number(process.env.PORT ?? 3000), host: '0.0.0.0' })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
