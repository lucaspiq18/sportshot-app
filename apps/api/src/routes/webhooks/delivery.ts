import type Stripe from 'stripe'
import { prisma } from '../../lib/prisma'
import { stripe } from '../../lib/stripe'
import { releaseFundsQueue } from '../../jobs/release-funds'
import { notify } from '../../lib/notifications'
import { mail } from '../../emails/index'

// Llamado internamente cuando el fotógrafo sube el material.
// Programa el job de liberación automática a las 48h.
export async function onDeliveryCreated(deliveryId: string, reviewDeadline: Date) {
  const delay = reviewDeadline.getTime() - Date.now()

  await releaseFundsQueue.add(
    'release',
    { deliveryId },
    { delay, jobId: `release-${deliveryId}`, removeOnComplete: true }
  )
}

// Llamado cuando el equipo aprueba manualmente la entrega antes de las 48h.
export async function onDeliveryApproved(bookingId: string) {
  // Primero marcar entrega y booking como completados — esto nunca falla
  await prisma.$transaction([
    prisma.delivery.update({ where: { bookingId }, data: { approvedAt: new Date() } }),
    prisma.booking.update({ where: { id: bookingId }, data: { status: 'completed' } }),
  ])

  // Intentar operaciones Stripe en best-effort (no bloquean el flujo)
  try {
    const payment = await prisma.payment.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
            photographer: { include: { user: true } },
            offer: true,
            bid: { include: { teamEvent: true } },
          },
        },
      },
    })

    if (!payment || payment.status !== 'authorized') return

    try { await stripe.paymentIntents.capture(payment.stripePaymentIntentId) } catch {}
    try { await releaseFundsQueue.remove(`release-${bookingId}`) } catch {}

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'captured', capturedAt: new Date() },
    })

    const photographer = payment.booking.photographer
    if (!photographer.stripeAccountId || !photographer.stripeOnboarded) return

    const transfer = await stripe.transfers.create({
      amount: payment.photographerPayout,
      currency: 'eur',
      destination: photographer.stripeAccountId,
      metadata: { bookingId },
    })

    await prisma.payment.update({
      where: { id: payment.id },
      data: { stripeTransferId: transfer.id, status: 'transferred', transferredAt: new Date() },
    })

    recalculateTier(photographer.id, payment.photographerPayout).catch(() => {})
    notify.paymentReleased(photographer.userId, payment.photographerPayout).catch(() => {})

    const eventName = payment.booking.offer?.eventName ?? (payment.booking as any).bid?.teamEvent?.eventName ?? 'Sesión fotográfica'
    mail.paymentReleased({
      photographerEmail: photographer.user.email,
      photographerName: photographer.user.fullName,
      eventName,
      grossAmount: payment.amount,
      commissionAmount: payment.commissionAmount,
      netAmount: payment.photographerPayout,
      tier: photographer.tier,
    }).catch(() => {})
  } catch (e) {
    console.error('onDeliveryApproved Stripe error (non-fatal):', e)
  }
}

async function recalculateTier(photographerId: string, newEarnings: number) {
  const photographer = await prisma.photographer.findUnique({ where: { id: photographerId } })
  if (!photographer) return

  const totalEarned = photographer.totalEarned + newEarnings
  const tierThresholds = [
    { tier: 'elite', min: 1_500_000 },  // 15.000€ en céntimos
    { tier: 'pro',   min:   500_000 },  // 5.000€
    { tier: 'active',min:   100_000 },  // 1.000€
    { tier: 'new',   min:           0 },
  ] as const

  const commissionByTier = { elite: 5, pro: 8, active: 12, new: 15 } as const

  const newTier = tierThresholds.find((t) => totalEarned >= t.min)!.tier

  await prisma.photographer.update({
    where: { id: photographerId },
    data: {
      totalEarned,
      tier: newTier,
      commissionPct: commissionByTier[newTier],
    },
  })
}
