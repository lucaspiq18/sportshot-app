'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Logo } from '@/components/Logo'

const faqs = [
  {
    category: 'General',
    items: [
      { q: '¿Qué es FokuSport?', a: 'FokuSport es un marketplace que conecta equipos y clubes deportivos con fotógrafos profesionales especializados en deporte. Los equipos encuentran fotógrafos disponibles en su ciudad, hacen una oferta, y reciben las fotos en menos de 48h.' },
      { q: '¿En qué ciudades está disponible FokuSport?', a: 'FokuSport está disponible en toda España. Los fotógrafos indican su ciudad y zona de cobertura en su perfil.' },
      { q: '¿Qué deportes cubre FokuSport?', a: 'Cubrimos todos los deportes: fútbol, baloncesto, balonmano, voleibol, natación, atletismo, tenis, pádel, ciclismo y muchos más. Los fotógrafos especifican los deportes en los que están especializados.' },
    ],
  },
  {
    category: 'Para equipos',
    items: [
      { q: '¿Cómo encuentro un fotógrafo para mi equipo?', a: 'Crea una cuenta como equipo, busca fotógrafos disponibles filtrando por ciudad, deporte y fecha, y envía una oferta al que más te guste. Recibirás confirmación en pocas horas.' },
      { q: '¿Cuánto cuesta contratar un fotógrafo?', a: 'El precio lo acuerdas directamente con el fotógrafo. Cada fotógrafo publica su precio base y tú haces una oferta. FokuSport no cobra comisión adicional al equipo.' },
      { q: '¿Qué pasa si no me gustan las fotos?', a: 'Antes de que el pago se libere, puedes revisar las fotos. Si hay un problema, nuestro equipo de soporte medía entre el equipo y el fotógrafo para encontrar una solución.' },
      { q: '¿En qué formato recibo las fotos?', a: 'Las fotos se entregan en alta resolución (JPG) a través de un enlace de descarga. El enlace estará disponible en tu cuenta durante 30 días.' },
      { q: '¿Puedo cancelar una reserva?', a: 'Sí, puedes cancelar hasta 48h antes del evento y recibirás el reembolso completo. Las cancelaciones con menos de 48h de antelación están sujetas a la política del fotógrafo.' },
    ],
  },
  {
    category: 'Para fotógrafos',
    items: [
      { q: '¿Cómo me registro como fotógrafo?', a: 'Crea una cuenta, selecciona el rol de fotógrafo, completa tu perfil con tu ciudad y deportes, y empieza a publicar tu disponibilidad. Todo en menos de 5 minutos.' },
      { q: '¿Cuándo cobro por mis trabajos?', a: 'Una vez el equipo descarga o confirma las fotos, el pago se transfiere a tu cuenta de Stripe Connect en 1-2 días hábiles.' },
      { q: '¿Qué porcentaje se lleva FokuSport?', a: 'FokuSport retiene un 10% del precio acordado. El fotógrafo recibe el 90% restante en 1-2 días hábiles tras entregar las fotos. El equipo siempre paga el precio exacto negociado, sin cargos extra.' },
      { q: '¿Necesito equipo profesional?', a: 'Recomendamos tener equipo de calidad para ofrecer resultados profesionales, pero no hay requisitos técnicos mínimos de equipo. Los equipos te elegirán en base a tu precio y valoraciones.' },
      { q: '¿Puedo rechazar una oferta?', a: 'Sí, tienes total libertad para aceptar o rechazar cualquier oferta. Solo recibirás notificaciones de eventos que encajen con tus slots de disponibilidad.' },
    ],
  },
  {
    category: 'Pagos y seguridad',
    items: [
      { q: '¿Cómo funciona el pago protegido?', a: 'Cuando se acepta una oferta, el pago del equipo queda retenido de forma segura. El dinero no se libera al fotógrafo hasta que el equipo confirma haber recibido las fotos. Ambas partes están protegidas.' },
      { q: '¿Qué métodos de pago aceptáis?', a: 'Aceptamos todas las tarjetas de crédito y débito principales (Visa, Mastercard, Amex) y transferencias bancarias a través de Stripe.' },
      { q: '¿Es seguro pagar en FokuSport?', a: 'Sí. Los pagos se procesan a través de Stripe, uno de los proveedores de pagos más seguros del mundo. FokuSport nunca almacena los datos de tu tarjeta.' },
    ],
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b" style={{ borderColor: 'var(--border)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left text-sm font-medium gap-4"
      >
        <span>{q}</span>
        <span className="flex-shrink-0 text-lg" style={{ color: 'var(--accent)' }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <p className="pb-4 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{a}</p>
      )}
    </div>
  )
}

export default function FAQ() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b backdrop-blur-sm" style={{ borderColor: 'var(--border)', background: 'rgba(10,15,20,0.85)' }}>
        <Link href="/" className="flex items-center gap-2">
          <Logo height={28} />
        </Link>
        <div className="flex gap-3">
          <Link href="/sign-in" className="px-4 py-2 rounded-lg text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Iniciar sesión</Link>
          <Link href="/sign-up" className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: 'var(--accent)', color: '#0a0f14' }}>Registrarse</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-8 py-20">
        <h1 className="text-4xl font-bold mb-4 text-center">Preguntas frecuentes</h1>
        <p className="text-center mb-16 text-lg" style={{ color: 'var(--text-muted)' }}>Todo lo que necesitas saber sobre FokuSport</p>

        <div className="flex flex-col gap-12">
          {faqs.map((section) => (
            <section key={section.category}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--accent)' }}>{section.category}</h2>
              <div className="rounded-xl border overflow-hidden px-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                {section.items.map((item) => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 text-center p-10 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-bold mb-2">¿No encuentras tu respuesta?</h2>
          <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>Escríbenos y te respondemos en menos de 24h</p>
          <Link href="/contacto" className="inline-flex px-6 py-3 rounded-xl font-semibold text-sm border" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
            Contactar →
          </Link>
        </div>
      </div>
    </main>
  )
}
