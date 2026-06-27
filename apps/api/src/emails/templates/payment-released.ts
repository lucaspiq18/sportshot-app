import { baseTemplate, heading, paragraph, metaTable, ctaButton, infoBox } from './base'

interface PaymentReleasedProps {
  photographerName: string
  eventName: string
  grossAmount: number
  commissionAmount: number
  netAmount: number
  tier: string
  appUrl: string
}

export function paymentReleasedEmail(p: PaymentReleasedProps): string {
  const fmt = (n: number) => (n / 100).toFixed(2)

  const content = `
    ${heading('Pago en camino')}
    ${paragraph(`Hola ${p.photographerName}, el equipo ha aprobado las fotos de <strong>${p.eventName}</strong> y hemos iniciado la transferencia a tu cuenta bancaria.`)}
    ${metaTable([
      { label: 'Evento',              value: p.eventName },
      { label: 'Precio acordado',     value: `${fmt(p.grossAmount)} €` },
      { label: `Comisión SportShot (tier ${p.tier})`, value: `- ${fmt(p.commissionAmount)} €` },
      { label: 'Recibirás',           value: `${fmt(p.netAmount)} €` },
    ])}
    ${infoBox('La transferencia llegará a tu cuenta en 2–5 días hábiles según tu banco.', 'success')}
    ${ctaButton('Ver historial de pagos', p.appUrl)}
  `

  return baseTemplate(content)
}
