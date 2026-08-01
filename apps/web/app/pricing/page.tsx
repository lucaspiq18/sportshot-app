import Link from 'next/link'
import { Logo } from '@/components/Logo'

export default function Pricing() {
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

      <div className="max-w-5xl mx-auto px-8 py-20">
        <h1 className="text-4xl font-bold mb-4 text-center">Precios simples y transparentes</h1>
        <p className="text-center mb-16 text-lg" style={{ color: 'var(--text-muted)' }}>Sin sorpresas. Pagas solo cuando consigues lo que buscas.</p>

        {/* Planes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {/* Equipos */}
          <div className="p-8 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-6" style={{ background: 'rgba(126,200,227,0.1)' }}>⚽</div>
            <h2 className="text-xl font-bold mb-1">Equipos y clubes</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Para equipos que necesitan cobertura fotográfica</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">Gratis</span>
              <span className="text-sm ml-2" style={{ color: 'var(--text-muted)' }}>para registrarte</span>
            </div>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Pagas exactamente el precio acordado con el fotógrafo. FokuSport deduce su comisión del pago al fotógrafo, no añade nada extra al equipo.</p>
            <ul className="flex flex-col gap-3 text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
              {[
                'Acceso a todos los fotógrafos',
                'Búsqueda por ciudad, deporte y fecha',
                'Sistema de ofertas y negociación',
                'Pago protegido (no se libera hasta recibir fotos)',
                'Descarga ilimitada en alta resolución',
                'Valoraciones y reseñas',
                'Soporte por email',
              ].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/sign-up" className="flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold" style={{ background: 'var(--accent)', color: '#0a0f14' }}>
              Registrar mi equipo gratis →
            </Link>
          </div>

          {/* Fotógrafos */}
          <div className="p-8 rounded-2xl border relative overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--accent)' }}>
            <div className="absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-semibold" style={{ background: 'var(--accent)', color: '#0a0f14' }}>Popular</div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-6" style={{ background: 'rgba(126,200,227,0.1)' }}>📷</div>
            <h2 className="text-xl font-bold mb-1">Fotógrafos</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Para fotógrafos que quieren más encargos</p>
            <div className="mb-2">
              <span className="text-4xl font-bold">90%</span>
              <span className="text-sm ml-2" style={{ color: 'var(--text-muted)' }}>para ti</span>
            </div>
            <p className="text-sm mb-6" style={{ color: 'var(--accent)' }}>Cobras el 90% de lo acordado · FokuSport retiene el 10%</p>
            <ul className="flex flex-col gap-3 text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
              {[
                'Perfil público con tus deportes y ciudad',
                'Publicación de slots de disponibilidad',
                'Recibe ofertas de equipos locales',
                'Chat integrado con el equipo',
                'Cobro seguro vía Stripe Connect',
                'Pago en 1-2 días hábiles tras entrega',
                'Historial de trabajos y valoraciones',
                'Soporte prioritario',
              ].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/sign-up" className="flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold border" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
              Unirme como fotógrafo →
            </Link>
          </div>
        </div>

        {/* FAQ precios */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 text-center">Preguntas sobre precios</h2>
          <div className="flex flex-col gap-4">
            {[
              { q: '¿Cuánto cobra FokuSport de comisión?', a: 'FokuSport retiene un 10% del precio acordado entre el equipo y el fotógrafo. El equipo paga siempre el precio exacto que negoció — el 10% se deduce del pago al fotógrafo, no se añade encima.' },
              { q: '¿Cómo funciona el sistema de pago protegido?', a: 'Cuando un equipo acepta una oferta, el pago queda retenido de forma segura. El dinero solo se libera al fotógrafo cuando el equipo confirma haber recibido las fotos. Nunca pierdes dinero.' },
              { q: '¿Cuándo cobra el fotógrafo?', a: 'Una vez el equipo descarga o confirma las fotos, el pago se transfiere al fotógrafo en 1-2 días hábiles a través de Stripe Connect.' },
              { q: '¿Hay algún coste de registro?', a: 'No. Registrarse en FokuSport es completamente gratuito tanto para equipos como para fotógrafos.' },
            ].map((item) => (
              <div key={item.q} className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <h3 className="font-semibold mb-2">{item.q}</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center p-10 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="text-2xl font-bold mb-3">Empieza hoy, sin compromiso</h2>
          <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>Registro gratuito · Sin tarjeta · Sin permanencia</p>
          <Link href="/sign-up" className="inline-flex px-6 py-3 rounded-xl font-semibold text-sm" style={{ background: 'var(--accent)', color: '#0a0f14' }}>
            Crear cuenta gratis →
          </Link>
        </div>
      </div>
    </main>
  )
}
