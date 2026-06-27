import { baseTemplate, heading, paragraph, metaTable, ctaButton } from './base'

interface EventReminderProps {
  recipientName: string
  role: 'team' | 'photographer'
  eventName: string
  eventDate: Date
  eventCity: string
  counterpartName: string
  appUrl: string
}

export function eventReminderEmail(p: EventReminderProps): string {
  const formattedDate = p.eventDate.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  const formattedTime = p.eventDate.toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit',
  })

  const isTeam = p.role === 'team'

  const content = `
    ${heading('Recordatorio: mañana tienes un evento')}
    ${paragraph(`Hola ${p.recipientName}, te recordamos que mañana tienes programado lo siguiente:`)}
    ${metaTable([
      { label: 'Evento',    value: p.eventName },
      { label: 'Fecha',     value: `${formattedDate} a las ${formattedTime}` },
      { label: 'Ciudad',    value: p.eventCity },
      { label: isTeam ? 'Fotógrafo' : 'Equipo', value: p.counterpartName },
    ])}
    ${isTeam
      ? `<p style="font-size:14px;color:#444;line-height:1.7;">Asegúrate de proporcionar acceso al fotógrafo con antelación.</p>`
      : `<p style="font-size:14px;color:#444;line-height:1.7;">Recuerda llegar con tiempo suficiente para preparar el equipo antes del inicio.</p>`
    }
    ${ctaButton('Ver detalles de la reserva', p.appUrl)}
  `

  return baseTemplate(content)
}
