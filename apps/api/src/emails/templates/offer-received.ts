import { baseTemplate, heading, paragraph, metaTable, ctaButton, infoBox } from './base'

interface OfferReceivedProps {
  photographerName: string
  teamName: string
  eventName: string
  eventDate: Date
  eventCity: string
  budgetOffered: number
  message: string | null
  appUrl: string
}

export function offerReceivedEmail(p: OfferReceivedProps): string {
  const price = (p.budgetOffered / 100).toFixed(0)
  const formattedDate = p.eventDate.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  const formattedTime = p.eventDate.toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit',
  })

  const content = `
    ${heading(`Nueva oferta de ${p.teamName}`)}
    ${paragraph(`Hola ${p.photographerName}, has recibido una oferta para cubrir el siguiente evento:`)}
    ${metaTable([
      { label: 'Evento',   value: p.eventName },
      { label: 'Fecha',    value: `${formattedDate} · ${formattedTime}` },
      { label: 'Ciudad',   value: p.eventCity },
      { label: 'Oferta',   value: `${price} €` },
    ])}
    ${p.message ? `
      <div style="background:#fafaf8;border-radius:8px;padding:16px;margin:16px 0;border:1px solid #eeede8;">
        <p style="margin:0 0 6px;font-size:12px;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">Mensaje del equipo</p>
        <p style="margin:0;font-size:14px;color:#444;line-height:1.7;font-style:italic;">"${p.message}"</p>
      </div>` : ''}
    ${infoBox('Tienes 48 horas para aceptar o rechazar esta oferta antes de que expire.', 'warning')}
    ${ctaButton('Ver oferta en la app', p.appUrl)}
  `

  return baseTemplate(content)
}
