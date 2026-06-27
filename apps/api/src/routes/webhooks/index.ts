import type { FastifyInstance } from 'fastify'
import { stripe } from '../../lib/stripe'
import {
  onPaymentIntentSucceeded,
  onPaymentIntentFailed,
  onTransferCreated,
} from './payment-intent'
import { onAccountUpdated } from './connect'

export async function webhooksRoutes(app: FastifyInstance) {
  // Webhook principal de la cuenta SportShot
  app.post(
    '/webhooks/stripe',
    { config: { rawBody: true } },
    async (req, reply) => {
      const sig = req.headers['stripe-signature'] as string

      let event
      try {
        event = stripe.webhooks.constructEvent(
          (req as any).rawBody,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET!
        )
      } catch {
        return reply.status(400).send({ error: 'Invalid signature' })
      }

      try {
        switch (event.type) {
          case 'payment_intent.succeeded':
            await onPaymentIntentSucceeded(event.data.object)
            break
          case 'payment_intent.payment_failed':
            await onPaymentIntentFailed(event.data.object)
            break
          case 'transfer.created':
            await onTransferCreated(event.data.object)
            break
          default:
            // Evento no manejado — respondemos 200 igualmente para que Stripe no reintente
            break
        }
      } catch (err) {
        console.error('Webhook handler error', event.type, err)
        // Devolvemos 500 para que Stripe reintente el evento
        return reply.status(500).send({ error: 'Handler failed' })
      }

      return { received: true }
    }
  )

  // Webhook de Connect — eventos de cuentas de fotógrafos (cuenta_xxx)
  app.post(
    '/webhooks/stripe/connect',
    { config: { rawBody: true } },
    async (req, reply) => {
      const sig = req.headers['stripe-signature'] as string

      let event
      try {
        event = stripe.webhooks.constructEvent(
          (req as any).rawBody,
          sig,
          process.env.STRIPE_CONNECT_WEBHOOK_SECRET!
        )
      } catch {
        return reply.status(400).send({ error: 'Invalid signature' })
      }

      try {
        switch (event.type) {
          case 'account.updated':
            await onAccountUpdated(event.data.object)
            break
          default:
            break
        }
      } catch (err) {
        console.error('Connect webhook handler error', event.type, err)
        return reply.status(500).send({ error: 'Handler failed' })
      }

      return { received: true }
    }
  )
}
