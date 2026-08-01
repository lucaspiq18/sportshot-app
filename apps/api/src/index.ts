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

  await app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })

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
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: { photographer: true, team: true },
    })

    if (!user) {
      const email = (payload as any).email_addresses?.[0]?.email_address ?? (payload as any).email ?? ''
      const fullName = [(payload as any).first_name, (payload as any).last_name].filter(Boolean).join(' ') || 'Usuario'
      // Try to find by email first (user may exist with different id)
      const existing = email ? await prisma.user.findUnique({ where: { email }, include: { photographer: true, team: true } }) : null
      if (existing) {
        user = existing
      } else {
        user = await prisma.user.create({
          data: { id: userId, email, fullName, role: 'pending' },
          include: { photographer: true, team: true },
        })
      }
    }

    req.user = {
      sub: userId,
      userId: user.id,
      role: user.role,
      photographerId: user.photographer?.id ?? null,
      teamId: user.team?.id ?? null,
    }
  })

  // One-time migration: add referral columns if missing
  setTimeout(async () => {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "photographers" ADD COLUMN IF NOT EXISTS "referralCode" TEXT UNIQUE`)
      await prisma.$executeRawUnsafe(`ALTER TABLE "photographers" ADD COLUMN IF NOT EXISTS "referredById" TEXT REFERENCES "photographers"("id") ON DELETE SET NULL`)
      await prisma.$executeRawUnsafe(`ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "referrerPhotographerId" TEXT`)
      await prisma.$executeRawUnsafe(`ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "referrerPayout" INTEGER NOT NULL DEFAULT 0`)
      console.log('Migration: referral columns applied')
    } catch (e) {
      console.error('Migration error:', (e as Error).message)
    }
  }, 5000)

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
