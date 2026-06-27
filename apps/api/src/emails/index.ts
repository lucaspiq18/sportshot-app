import { sendEmail } from './client'
import { bookingConfirmedEmail } from './templates/booking-confirmed'
import { offerReceivedEmail } from './templates/offer-received'
import { materialDeliveredEmail } from './templates/material-delivered'
import { paymentReleasedEmail } from './templates/payment-released'
import { eventReminderEmail } from './templates/event-reminder'

const APP_URL = process.env.APP_URL ?? 'https://sportshot.app'

export const mail = {
  bookingConfirmed: async (opts: {
    teamEmail: string; teamName: string
    photographerEmail: string; photographerName: string
    eventName: string; eventDate: Date; eventCity: string; agreedPrice: number
  }) => {
    await Promise.allSettled([
      sendEmail({
        to: opts.teamEmail,
        subject: `Reserva confirmada · ${opts.eventName}`,
        html: bookingConfirmedEmail({
          recipientName: opts.teamName,
          role: 'team',
          eventName: opts.eventName,
          eventDate: opts.eventDate,
          eventCity: opts.eventCity,
          agreedPrice: opts.agreedPrice,
          counterpartName: opts.photographerName,
          appUrl: `${APP_URL}/bookings`,
        }),
      }),
      sendEmail({
        to: opts.photographerEmail,
        subject: `Reserva confirmada · ${opts.eventName}`,
        html: bookingConfirmedEmail({
          recipientName: opts.photographerName,
          role: 'photographer',
          eventName: opts.eventName,
          eventDate: opts.eventDate,
          eventCity: opts.eventCity,
          agreedPrice: opts.agreedPrice,
          counterpartName: opts.teamName,
          appUrl: `${APP_URL}/bookings`,
        }),
      }),
    ])
  },

  offerReceived: (opts: {
    photographerEmail: string; photographerName: string; teamName: string
    eventName: string; eventDate: Date; eventCity: string
    budgetOffered: number; message: string | null
  }) =>
    sendEmail({
      to: opts.photographerEmail,
      subject: `Nueva oferta de ${opts.teamName} · ${opts.eventName}`,
      html: offerReceivedEmail({ ...opts, appUrl: `${APP_URL}/offers` }),
    }),

  materialDelivered: (opts: {
    teamEmail: string; teamName: string; photographerName: string
    eventName: string; photoCount: number; reviewDeadline: Date
  }) =>
    sendEmail({
      to: opts.teamEmail,
      subject: `Fotos listas para revisar · ${opts.eventName}`,
      html: materialDeliveredEmail({ ...opts, appUrl: `${APP_URL}/bookings` }),
    }),

  paymentReleased: (opts: {
    photographerEmail: string; photographerName: string; eventName: string
    grossAmount: number; commissionAmount: number; netAmount: number; tier: string
  }) =>
    sendEmail({
      to: opts.photographerEmail,
      subject: `Pago transferido · ${opts.eventName}`,
      html: paymentReleasedEmail({ ...opts, appUrl: `${APP_URL}/payments` }),
    }),

  eventReminder: (opts: {
    teamEmail: string; teamName: string
    photographerEmail: string; photographerName: string
    eventName: string; eventDate: Date; eventCity: string
  }) =>
    Promise.allSettled([
      sendEmail({
        to: opts.teamEmail,
        subject: `Mañana: ${opts.eventName}`,
        html: eventReminderEmail({
          recipientName: opts.teamName, role: 'team',
          eventName: opts.eventName, eventDate: opts.eventDate,
          eventCity: opts.eventCity, counterpartName: opts.photographerName,
          appUrl: `${APP_URL}/bookings`,
        }),
      }),
      sendEmail({
        to: opts.photographerEmail,
        subject: `Mañana: ${opts.eventName}`,
        html: eventReminderEmail({
          recipientName: opts.photographerName, role: 'photographer',
          eventName: opts.eventName, eventDate: opts.eventDate,
          eventCity: opts.eventCity, counterpartName: opts.teamName,
          appUrl: `${APP_URL}/bookings`,
        }),
      }),
    ]),
}
