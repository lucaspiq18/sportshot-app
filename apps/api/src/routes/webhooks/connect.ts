import type Stripe from 'stripe'
import { prisma } from '../../lib/prisma'

// Stripe notifica cuando el fotógrafo completa (o pierde) la capacidad de cobrar.
// Mantenemos stripe_onboarded sincronizado para bloquear aceptaciones si el fotógrafo
// tiene problemas con su cuenta.
export async function onAccountUpdated(account: Stripe.Account) {
  const onboarded = account.charges_enabled && account.payouts_enabled

  await prisma.photographer.updateMany({
    where: { stripeAccountId: account.id },
    data: { stripeOnboarded: onboarded },
  })
}
