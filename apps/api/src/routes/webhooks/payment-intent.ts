import type Stripe from 'stripe'
import { prisma } from '../../lib/prisma'
import { releaseFundsQueue } from '../../jobs/release-funds'

// El equipo completó el pago — el PaymentIntent está autorizado (capture_method: manual)
// Aquí solo registramos que la autorización llegó. La captura ocurre al liberar fondos.
export async function onPaymentIntentSucceeded(pi: Stripe.PaymentIntent) {
  await prisma.payment.update({
    where: { stripePaymentIntentId: pi.id },
    data: { status: 'authorized' },
  })
}

// El pago falló (tarjeta rechazada, fondos insuficientes, etc.)
// Revertimos el booking y reabrimos el slot para que pueda recibir más ofertas.
export async function onPaymentIntentFailed(pi: Stripe.PaymentIntent) {
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: pi.id },
    include: { booking: true },
  })

  if (!payment) return

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'refunded' },
    }),
    prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'cancelled' },
    }),
    // Reabrimos el slot y la oferta aceptada para que el fotógrafo
    // pueda recibir nuevas ofertas en esa franja
    prisma.availabilitySlot.update({
      where: { id: payment.booking.slotId },
      data: { status: 'open' },
    }),
    prisma.offer.update({
      where: { id: payment.booking.offerId },
      data: { status: 'withdrawn' },
    }),
  ])
}

// El transfer al fotógrafo se completó — actualizamos el estado del pago
export async function onTransferCreated(transfer: Stripe.Transfer) {
  const bookingId = transfer.metadata?.bookingId
  if (!bookingId) return

  await prisma.payment.update({
    where: { bookingId },
    data: {
      stripeTransferId: transfer.id,
      status: 'transferred',
      transferredAt: new Date(),
    },
  })
}
