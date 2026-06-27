import { Worker, Queue } from 'bullmq'
import { redis } from '../lib/redis'
import { prisma } from '../lib/prisma'
import { stripe } from '../lib/stripe'

export const releaseFundsQueue = new Queue('release-funds', { connection: redis })

export function startReleaseFundsWorker() {
  return new Worker(
    'release-funds',
    async (job) => {
      const { deliveryId } = job.data as { deliveryId: string }

      const delivery = await prisma.delivery.findUnique({
        where: { id: deliveryId },
        include: { booking: { include: { payment: true } } },
      })

      if (!delivery || delivery.approvedAt !== null) return
      if (delivery.reviewDeadline > new Date()) return

      const payment = delivery.booking.payment
      if (!payment || payment.status !== 'captured') return

      const transfer = await stripe.transfers.create({
        amount: payment.photographerPayout,
        currency: 'eur',
        destination: delivery.booking.photographerId,
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
          where: { id: delivery.bookingId },
          data: { status: 'completed' },
        }),
        prisma.delivery.update({
          where: { id: deliveryId },
          data: { approvedAt: new Date() },
        }),
      ])
    },
    { connection: redis }
  )
}
