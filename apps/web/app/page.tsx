import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Logo } from '@/components/Logo'

export default async function Home() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b backdrop-blur-sm" style={{ borderColor: 'var(--border)', background: 'rgba(10,15,20,0.85)' }}>
        <div className="flex items-center gap-2">
          <Logo height={28} />
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          <Link href="/como-funciona" className="hover:opacity-80 transition-opacity">Cómo funciona</Link>
          <Link href="/pricing" className="hover:opacity-80 transition-opacity">Precios</Link>
          <Link href="/faq" className="hover:opacity-80 transition-opacity">FAQ</Link>
          <Link href="/contacto" className="hover:opacity-80 transition-opacity">Contacto</Link>
        </div>
        <div className="flex gap-3">
          <Link href="/sign-in" className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
            Iniciar sesión
          </Link>
          <Link href="/sign-up" className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90" style={{ background: 'var(--accent)', color: '#0a0f14' }}>
            Registrarse
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-28 pb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8 border" style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--accent)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
          Marketplace de fotografía deportiva
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl leading-tight">
          Fotógrafos deportivos,<br />
          <span style={{ color: 'var(--accent)' }}>cuando los necesitas</span>
        </h1>
        <p className="text-lg mb-10 max-w-lg leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Conecta tu equipo con fotógrafos profesionales para cada evento. Reserva, paga de forma segura y recibe tus fotos en 48h.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/sign-up" className="px-6 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90" style={{ background: 'var(--accent)', color: '#0a0f14' }}>
            Empieza gratis →
          </Link>
          <Link href="#como-funciona" className="px-6 py-3 rounded-xl font-semibold text-sm border transition-colors hover:opacity-80" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            Ver cómo funciona
          </Link>
        </div>
        <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>Sin comisiones ocultas · Pago seguro · Fotos garantizadas</p>
      </section>

      {/* Stats */}
      <section className="py-12 border-y mx-8 md:mx-16" style={{ borderColor: 'var(--border)' }}>
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
          {[
            { value: '48h', label: 'Entrega de fotos' },
            { value: '90%', label: 'Para el fotógrafo' },
            { value: '100%', label: 'Pago garantizado' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold mb-1" style={{ color: 'var(--accent)' }}>{s.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="py-24 px-8 max-w-5xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-4">Cómo funciona</h2>
        <p className="text-center mb-16 text-sm" style={{ color: 'var(--text-muted)' }}>Tres pasos para tener al fotógrafo perfecto en tu evento</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Explora y elige', desc: 'Busca fotógrafos disponibles en tu ciudad y deporte. Filtra por fecha, precio y especialidad.' },
            { step: '02', title: 'Haz tu oferta', desc: 'Propón tu presupuesto y descripción del evento. El fotógrafo acepta o propone cambios.' },
            { step: '03', title: 'Recibe tus fotos', desc: 'El pago se libera cuando recibes las fotos. Garantía total para ambas partes.' },
          ].map((item) => (
            <div key={item.step} className="flex flex-col gap-4">
              <span className="text-4xl font-bold" style={{ color: 'var(--border)' }}>{item.step}</span>
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Para quién */}
      <section id="para-quien" className="py-24 px-8" style={{ background: 'var(--surface)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">¿Para quién es FokuSport?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl border" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-6" style={{ background: 'rgba(126,200,227,0.1)' }}>⚽</div>
              <h3 className="text-xl font-bold mb-3">Equipos y clubes</h3>
              <ul className="flex flex-col gap-2 text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
                {['Encuentra fotógrafos en tu ciudad', 'Compara precios y portfolios', 'Paga solo cuando recibes las fotos', 'Descarga todas las imágenes en alta resolución'].map(i => (
                  <li key={i} className="flex items-center gap-2">
                    <span style={{ color: 'var(--accent)' }}>✓</span> {i}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className="inline-flex px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'var(--accent)', color: '#0a0f14' }}>
                Registrar mi equipo →
              </Link>
            </div>
            <div className="p-8 rounded-2xl border" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-6" style={{ background: 'rgba(126,200,227,0.1)' }}>📷</div>
              <h3 className="text-xl font-bold mb-3">Fotógrafos deportivos</h3>
              <ul className="flex flex-col gap-2 text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
                {['Publica tu disponibilidad en minutos', 'Recibe ofertas de equipos locales', 'Cobra de forma segura y garantizada', 'Construye tu portfolio deportivo'].map(i => (
                  <li key={i} className="flex items-center gap-2">
                    <span style={{ color: 'var(--accent)' }}>✓</span> {i}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className="inline-flex px-5 py-2.5 rounded-xl text-sm font-semibold border" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                Unirme como fotógrafo →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 px-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Listo para empezar</h2>
          <p className="mb-10 text-lg" style={{ color: 'var(--text-muted)' }}>Únete gratis y conecta con fotógrafos o equipos deportivos en tu zona.</p>
          <Link href="/sign-up" className="inline-flex px-8 py-4 rounded-xl font-semibold text-base transition-opacity hover:opacity-90" style={{ background: 'var(--accent)', color: '#0a0f14' }}>
            Crear cuenta gratis →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-8 py-10" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo height={22} />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>© 2026 FokuSport. Todos los derechos reservados.</p>
          <div className="flex gap-6 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Link href="#" className="hover:opacity-80">Privacidad</Link>
            <Link href="#" className="hover:opacity-80">Términos</Link>
            <Link href="/contacto" className="hover:opacity-80">Contacto</Link>
          </div>
        </div>
      </footer>

    </main>
  )
}
