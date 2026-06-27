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
// Captura el PaymentIntent y programa el transfer inmediato.
export async function onDeliveryApproved(bookingId: string) {
  const payment = await prisma.payment.findUnique({
    where: { bookingId },
    include: {
      booking: {
        include: {
          photographer: { include: { user: true } },
          offer: true,
        },
      },
    },
  })

  if (!payment || payment.status !== 'authorized') return

  // Capturar el PaymentIntent (sacar el dinero de la tarjeta del equipo)
  await stripe.paymentIntents.capture(payment.stripePaymentIntentId)

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'captured', capturedAt: new Date() },
  })

  // Cancelar el job automático de 48h — ya no es necesario
  await releaseFundsQueue.remove(`release-${payment.bookingId}`)

  // Crear el transfer al fotógrafo
  const transfer = await stripe.transfers.create({
    amount: payment.photographerPayout,
    currency: 'eur',
    destination: payment.booking.photographer.stripeAccountId!,
    metadata: { bookingId },
  })

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        stripeTransferId: transfer.id,
        status: 'transferred',
        transferredAt: new Date(),
      },
    }),
    prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'completed' },
    }),
    prisma.delivery.update({
      where: { bookingId },
      data: { approvedAt: new Date() },
    }),
  ])

  // Actualizar tier del fotógrafo si supera umbral de volumen
  await recalculateTier(payment.booking.photographer.id, payment.photographerPayout)

  // Notificar al fotógrafo que el pago está en camino
  notify.paymentReleased(payment.booking.photographer.userId, payment.photographerPayout).catch(() => {})

  mail.paymentReleased({
    photographerEmail: payment.booking.photographer.user.email,
    photographerName: payment.booking.photographer.user.fullName,
    eventName: payment.booking.offer.eventName,
    grossAmount: payment.amount,
    commissionAmount: payment.commissionAmount,
    netAmount: payment.photographerPayout,
    tier: payment.booking.photographer.tier,
  }).catch(() => {})
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
