import type { FastifyInstance } from 'fastify'
import { stripe } from '../lib/stripe'
import { prisma } from '../lib/prisma'

export async function connectRoutes(app: FastifyInstance) {

  // 1. Crear cuenta Connect Express y devolver el link de onboarding
  app.post('/connect/onboarding', async (req, reply) => {
    const photographerId = req.user.photographerId

    if (!photographerId) {
      return reply.status(403).send({ data: null, error: { code: 'NOT_PHOTOGRAPHER', message: 'Solo fotógrafos pueden conectar una cuenta de pagos' } })
    }

    const photographer = await prisma.photographer.findUnique({
      where: { id: photographerId },
      include: { user: true },
    })

    if (!photographer) {
      return reply.status(404).send({ data: null, error: { code: 'NOT_FOUND', message: 'Fotógrafo no encontrado' } })
    }

    // Si ya tiene cuenta, reusar — puede que necesite completar pasos pendientes
    let accountId = photographer.stripeAccountId

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'ES',
        email: photographer.user.email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: { photographerId },
      })

      accountId = account.id

      await prisma.photographer.update({
        where: { id: photographerId },
        data: { stripeAccountId: accountId },
      })
    }

    // Generar link de onboarding (expira en ~10 min)
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.API_BASE_URL}/api/v1/connect/refresh?photographerId=${photographerId}`,
      return_url: `${process.env.API_BASE_URL}/api/v1/connect/return?photographerId=${photographerId}`,
      type: 'account_onboarding',
    })

    return { data: { url: accountLink.url }, error: null }
  })

  // 2. El fotógrafo volvió del onboarding (completado o no)
  // Stripe redirige aquí tras completar el formulario.
  // Verificamos el estado real consultando la cuenta.
  app.get('/connect/return', async (req, reply) => {
    const { photographerId } = req.query as { photographerId: string }

    const photographer = await prisma.photographer.findUnique({
      where: { id: photographerId },
    })

    if (!photographer?.stripeAccountId) {
      return reply.redirect(`${process.env.APP_SCHEME}://connect/error`)
    }

    const account = await stripe.accounts.retrieve(photographer.stripeAccountId)
    const onboarded = account.charges_enabled && account.payouts_enabled

    await prisma.photographer.update({
      where: { id: photographerId },
      data: { stripeOnboarded: onboarded },
    })

    // Deep link de vuelta a la app
    const status = onboarded ? 'success' : 'pending'
    return reply.redirect(`${process.env.APP_SCHEME}://connect/${status}`)
  })

  // 3. El link de onboarding expiró — Stripe redirige aquí para pedir uno nuevo
  app.get('/connect/refresh', async (req, reply) => {
    const { photographerId } = req.query as { photographerId: string }

    const photographer = await prisma.photographer.findUnique({
      where: { id: photographerId },
    })

    if (!photographer?.stripeAccountId) {
      return reply.redirect(`${process.env.APP_SCHEME}://connect/error`)
    }

    // Generar un nuevo link y redirigir al fotógrafo
    const accountLink = await stripe.accountLinks.create({
      account: photographer.stripeAccountId,
      refresh_url: `${process.env.API_BASE_URL}/api/v1/connect/refresh?photographerId=${photographerId}`,
      return_url: `${process.env.API_BASE_URL}/api/v1/connect/return?photographerId=${photographerId}`,
      type: 'account_onboarding',
    })

    return reply.redirect(accountLink.url)
  })

  // 4. Estado actual de la cuenta — la app lo consulta al volver del browser
  app.get('/connect/status', async (req, reply) => {
    const photographerId = req.user.photographerId

    if (!photographerId) {
      return reply.status(403).send({ data: null, error: { code: 'NOT_PHOTOGRAPHER', message: 'Acceso denegado' } })
    }

    const photographer = await prisma.photographer.findUnique({
      where: { id: photographerId },
    })

    if (!photographer) {
      return reply.status(404).send({ data: null, error: { code: 'NOT_FOUND', message: 'Fotógrafo no encontrado' } })
    }

    // Si tiene cuenta, verificar estado real en Stripe (no confiar solo en la BD)
    let requirements: string[] = []
    let payoutsEnabled = false
    let chargesEnabled = false

    if (photographer.stripeAccountId) {
      const account = await stripe.accounts.retrieve(photographer.stripeAccountId)
      payoutsEnabled = account.payouts_enabled ?? false
      chargesEnabled = account.charges_enabled ?? false
      requirements = [
        ...(account.requirements?.currently_due ?? []),
        ...(account.requirements?.past_due ?? []),
      ]
    }

    return {
      data: {
        hasAccount: !!photographer.stripeAccountId,
        onboarded: photographer.stripeOnboarded,
        chargesEnabled,
        payoutsEnabled,
        requirements,
      },
      error: null,
    }
  })
}
