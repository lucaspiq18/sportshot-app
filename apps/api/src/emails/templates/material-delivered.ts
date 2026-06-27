import { baseTemplate, heading, paragraph, metaTable, ctaButton, infoBox } from './base'

interface MaterialDeliveredProps {
  teamName: string
  photographerName: string
  eventName: string
  photoCount: number
  reviewDeadline: Date
  appUrl: string
}

export function materialDeliveredEmail(p: MaterialDeliveredProps): string {
  const deadline = p.reviewDeadline.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  })

  const content = `
    ${heading('Tu material fotográfico está listo')}
    ${paragraph(`Hola ${p.teamName}, ${p.photographerName} ha entregado las fotos de <strong>${p.eventName}</strong>.`)}
    ${metaTable([
      { label: 'Fotógrafo',   value: p.photographerName },
      { label: 'Evento',      value: p.eventName },
      { label: 'Fotos',       value: `${p.photoCount} fotografías` },
      { label: 'Revisar antes de', value: deadline },
    ])}
    ${infoBox(`Tienes hasta el <strong>${deadline}</strong> para revisar y aprobar las fotos. Si no realizas ninguna acción, el pago se liberará automáticamente al fotógrafo.`, 'warning')}
    ${ctaButton('Revisar y aprobar fotos', p.appUrl)}
    ${paragraph('<small style="color:#aaa;">Si detectas algún problema con el material puedes abrir una disputa desde la app antes de que expire el plazo.</small>')}
  `

  return baseTemplate(content)
}
