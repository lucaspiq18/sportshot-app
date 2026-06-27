import { Worker, Queue } from 'bullmq'
import { redis } from '../lib/redis'
import { prisma } from '../lib/prisma'
import { mail } from '../emails/index'
import { notify } from '../lib/notifications'

export const eventReminderQueue = new Queue('event-reminder', { connection: redis })

// Se llama al crear un Booking — programa el recordatorio 24h antes del evento
export async function scheduleEventReminder(bookingId: string, eventDate: Date) {
  const fireAt = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000)
  const delay = fireAt.getTime() - Date.now()

  if (delay <= 0) return // evento en menos de 24h, no tiene sentido el recordatorio

  await eventReminderQueue.add(
    'remind',
    { bookingId },
    { delay, jobId: `reminder-${bookingId}`, removeOnComplete: true }
  )
}

export function startEventReminderWorker() {
  return new Worker(
    'event-reminder',
    async (job) => {
      const { bookingId } = job.data as { bookingId: string }

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          team: { include: { user: true } },
          photographer: { include: { user: true } },
          offer: true,
          slot: true,
        },
      })

      if (!booking || booking.status !== 'confirmed') return

      await Promise.allSettled([
        mail.eventReminder({
          teamEmail: booking.team.user.email,
          teamName: booking.team.clubName,
          photographerEmail: booking.photographer.user.email,
          photographerName: booking.photographer.user.fullName,
          eventName: booking.offer.eventName,
          eventDate: booking.slot.startsAt,
          eventCity: booking.slot.city,
        }),
        notify.reviewDeadlineReminder(
          booking.team.userId,
          booking.offer.eventName,
          24
        ),
      ])
    },
    { connection: redis }
  )
}
