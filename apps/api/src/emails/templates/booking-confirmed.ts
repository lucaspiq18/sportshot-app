import { baseTemplate, heading, paragraph, metaTable, ctaButton, infoBox } from './base'

interface BookingConfirmedProps {
  recipientName: string
  role: 'team' | 'photographer'
  eventName: string
  eventDate: Date
  eventCity: string
  agreedPrice: number
  counterpartName: string
  appUrl: string
}

export function bookingConfirmedEmail(p: BookingConfirmedProps): string {
  const price = (p.agreedPrice / 100).toFixed(0)
  const formattedDate = p.eventDate.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const formattedTime = p.eventDate.toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit',
  })

  const isTeam = p.role === 'team'

  const content = `
    ${heading('Reserva confirmada')}
    ${paragraph(`Hola ${p.recipientName}, tu reserva está confirmada. Aquí tienes el resumen:`)}
    ${metaTable([
      { label: 'Evento',        value: p.eventName },
      { label: 'Fecha',         value: `${formattedDate} a las ${formattedTime}` },
      { label: 'Ciudad',        value: p.eventCity },
      { label: isTeam ? 'Fotógrafo' : 'Equipo', value: p.counterpartName },
      { label: 'Precio acordado', value: `${price} €` },
    ])}
    ${isTeam
      ? infoBox('El pago ha quedado bloqueado y se liberará al fotógrafo una vez apruebes el material entregado.', 'info')
      : infoBox('El pago está asegurado. Recibirás la transferencia cuando el equipo apruebe el material o pasen 48h sin disputa.', 'success')
    }
    ${ctaButton('Ver reserva', p.appUrl)}
  `

  return baseTemplate(content)
}
