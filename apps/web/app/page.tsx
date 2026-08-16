import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Logo } from '@/components/Logo'

export default async function Home() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <main className="min-h-screen flex flex-col" style={{ background: '#0a0f14', color: '#e8edf2' }}>
      <style>{`
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.85; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-badge { animation: fade-up 0.6s ease both; }
        .hero-h1    { animation: fade-up 0.6s 0.1s ease both; }
        .hero-sub   { animation: fade-up 0.6s 0.2s ease both; }
        .hero-cta   { animation: fade-up 0.6s 0.3s ease both; }
        .glow       { animation: glow-pulse 4s ease-in-out infinite; }
        .grad-border {
          background: linear-gradient(#0f1921, #0f1921) padding-box,
                      linear-gradient(135deg, #7ec8e3 0%, #1e2d3d 60%) border-box;
          border: 1px solid transparent;
        }
        .grad-border-amber {
          background: linear-gradient(#0f1921, #0f1921) padding-box,
                      linear-gradient(135deg, #f4a853 0%, #1e2d3d 60%) border-box;
          border: 1px solid transparent;
        }
        .step-line::before {
          content: '';
          position: absolute;
          left: 19px; top: 40px; bottom: -24px;
          width: 1px;
          background: linear-gradient(to bottom, #1e2d3d, transparent);
        }
      `}</style>

      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b backdrop-blur-md"
        style={{ borderColor: '#1e2d3d', background: 'rgba(10,15,20,0.9)' }}>
        <Logo height={28} />
        <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: '#4a6070' }}>
          <Link href="/como-funciona" className="hover:text-[#e8edf2] transition-colors">Cómo funciona</Link>
          <Link href="/pricing" className="hover:text-[#e8edf2] transition-colors">Precios</Link>
          <Link href="/faq" className="hover:text-[#e8edf2] transition-colors">FAQ</Link>
          <Link href="/contacto" className="hover:text-[#e8edf2] transition-colors">Contacto</Link>
        </div>
        <div className="flex gap-3">
          <Link href="/sign-in"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:text-[#e8edf2]"
            style={{ color: '#4a6070' }}>
            Entrar
          </Link>
          <Link href="/sign-up"
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: '#7ec8e3', color: '#0a0f14' }}>
            Registrarse
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-28 pb-24 overflow-hidden">
        {/* Glow radial */}
        <div className="glow absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(126,200,227,0.12) 0%, transparent 70%)',
        }} />
        {/* Grid texture */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(126,200,227,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(126,200,227,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <div className="relative z-10 flex flex-col items-center">
          <div className="hero-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8 border"
            style={{ borderColor: '#1e2d3d', background: 'rgba(126,200,227,0.06)', color: '#7ec8e3' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#7ec8e3' }} />
            Marketplace de fotografía deportiva · España
          </div>

          <h1 className="hero-h1 font-black tracking-tight mb-6 leading-none"
            style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', letterSpacing: '-0.04em', maxWidth: 820 }}>
            El partido merece<br />
            <span style={{ color: '#7ec8e3' }}>ser recordado.</span>
          </h1>

          <p className="hero-sub text-lg mb-10 max-w-xl leading-relaxed" style={{ color: '#4a6070' }}>
            FokuSport conecta equipos deportivos con fotógrafos profesionales. Publica tu partido, recibe propuestas y paga solo cuando tienes las fotos.
          </p>

          <div className="hero-cta flex flex-col sm:flex-row gap-3 mb-5">
            <Link href="/sign-up?role=team"
              className="px-7 py-3.5 rounded-xl font-bold text-sm"
              style={{ background: '#7ec8e3', color: '#0a0f14' }}>
              Soy un equipo →
            </Link>
            <Link href="/sign-up?role=photographer"
              className="px-7 py-3.5 rounded-xl font-bold text-sm border"
              style={{ borderColor: '#1e2d3d', color: '#e8edf2', background: '#0f1921' }}>
              Soy fotógrafo →
            </Link>
          </div>
          <p className="text-xs" style={{ color: '#2a4050' }}>Sin comisiones ocultas · Pago seguro vía Stripe · Fotos garantizadas</p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-y py-10" style={{ borderColor: '#1e2d3d', background: '#0f1921' }}>
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 text-center px-6">
          {[
            { value: '48h', label: 'Entrega de fotos' },
            { value: '90%', label: 'Para el fotógrafo' },
            { value: '100%', label: 'Pago protegido' },
          ].map(s => (
            <div key={s.label}>
              <p className="font-black mb-1" style={{ fontSize: '2.2rem', color: '#7ec8e3', letterSpacing: '-0.04em' }}>{s.value}</p>
              <p className="text-xs" style={{ color: '#4a6070' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DOS FLUJOS ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-center mb-3" style={{ color: '#7ec8e3' }}>DOS FORMAS DE TRABAJAR</p>
          <h2 className="font-black text-center mb-16" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', letterSpacing: '-0.03em' }}>
            Tú decides cómo conectar
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Flujo 1: Equipo busca fotógrafo */}
            <div className="grad-border-amber rounded-2xl p-8 flex flex-col gap-6" style={{ background: '#0f1921' }}>
              <div>
                <span className="text-xs font-semibold tracking-widest" style={{ color: '#f4a853' }}>EQUIPOS</span>
                <h3 className="font-black mt-2 mb-1" style={{ fontSize: '1.4rem', letterSpacing: '-0.02em' }}>
                  Publica tu partido
                </h3>
                <p className="text-sm" style={{ color: '#4a6070' }}>
                  Dí cuándo y dónde juegas. Los fotógrafos de tu zona te envían su propuesta con precio.
                </p>
              </div>
              <ol className="flex flex-col gap-4">
                {[
                  'Publica el partido con tu presupuesto',
                  'Recibe propuestas de fotógrafos',
                  'Elige el que más te convence',
                  'Paga al recibir las fotos',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mt-0.5"
                      style={{ background: 'rgba(244,168,83,0.12)', color: '#f4a853' }}>
                      {i + 1}
                    </span>
                    <span className="text-sm" style={{ color: '#8aa0b0' }}>{step}</span>
                  </li>
                ))}
              </ol>
              <Link href="/sign-up"
                className="mt-auto inline-flex items-center justify-center py-3 rounded-xl text-sm font-bold"
                style={{ background: 'rgba(244,168,83,0.1)', color: '#f4a853', border: '1px solid rgba(244,168,83,0.2)' }}>
                Registrar mi equipo →
              </Link>
            </div>

            {/* Flujo 2: Fotógrafo publica disponibilidad */}
            <div className="grad-border rounded-2xl p-8 flex flex-col gap-6" style={{ background: '#0f1921' }}>
              <div>
                <span className="text-xs font-semibold tracking-widest" style={{ color: '#7ec8e3' }}>FOTÓGRAFOS</span>
                <h3 className="font-black mt-2 mb-1" style={{ fontSize: '1.4rem', letterSpacing: '-0.02em' }}>
                  Publica tu disponibilidad
                </h3>
                <p className="text-sm" style={{ color: '#4a6070' }}>
                  Abre tu agenda. Los equipos de tu zona te hacen ofertas para cubrir sus partidos.
                </p>
              </div>
              <ol className="flex flex-col gap-4">
                {[
                  'Publica tu disponibilidad con precio',
                  'Los equipos te hacen ofertas',
                  'Acepta la que más te interese',
                  'Cobra al entregar las fotos',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mt-0.5"
                      style={{ background: 'rgba(126,200,227,0.1)', color: '#7ec8e3' }}>
                      {i + 1}
                    </span>
                    <span className="text-sm" style={{ color: '#8aa0b0' }}>{step}</span>
                  </li>
                ))}
              </ol>
              <Link href="/sign-up"
                className="mt-auto inline-flex items-center justify-center py-3 rounded-xl text-sm font-bold"
                style={{ background: 'rgba(126,200,227,0.08)', color: '#7ec8e3', border: '1px solid rgba(126,200,227,0.2)' }}>
                Unirme como fotógrafo →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── POR QUÉ FOKUSPORT ── */}
      <section className="py-24 px-6 border-t" style={{ borderColor: '#1e2d3d', background: '#0a0f14' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-center mb-3" style={{ color: '#7ec8e3' }}>GARANTÍAS</p>
          <h2 className="font-black text-center mb-16" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', letterSpacing: '-0.03em' }}>
            Sin sorpresas, para nadie
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🔒', title: 'Pago en escrow', desc: 'El dinero queda retenido hasta que el equipo aprueba las fotos. Nadie pierde.' },
              { icon: '⚡', title: '48h de entrega', desc: 'Los fotógrafos se comprometen a entregar en 48 horas tras el evento.' },
              { icon: '💬', title: 'Acuerdo antes de empezar', desc: 'Precio, entregables y uso de las fotos queda pactado antes del disparo.' },
              { icon: '📸', title: 'Fotógrafos verificados', desc: 'Cada fotógrafo pasa por un proceso de verificación antes de publicar.' },
              { icon: '🏆', title: 'Para cualquier deporte', desc: 'Fútbol, baloncesto, atletismo, natación… cualquier deporte tiene cabida.' },
              { icon: '📍', title: 'Tu ciudad, tu fotógrafo', desc: 'Conectamos por proximidad para reducir costes de desplazamiento.' },
            ].map(f => (
              <div key={f.title} className="p-6 rounded-2xl border" style={{ background: '#0f1921', borderColor: '#1e2d3d' }}>
                <span className="text-2xl mb-4 block">{f.icon}</span>
                <h3 className="font-bold text-sm mb-2">{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#4a6070' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="relative py-28 px-6 overflow-hidden border-t" style={{ borderColor: '#1e2d3d' }}>
        <div className="glow absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 60% at 50% 100%, rgba(126,200,227,0.1) 0%, transparent 70%)',
        }} />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="font-black mb-5" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', letterSpacing: '-0.04em' }}>
            El próximo partido<br />merece buenas fotos.
          </h2>
          <p className="mb-10 text-lg" style={{ color: '#4a6070' }}>
            Únete gratis. Sin cuotas mensuales, sin compromisos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/sign-up"
              className="px-8 py-4 rounded-xl font-bold text-base"
              style={{ background: '#7ec8e3', color: '#0a0f14' }}>
              Crear cuenta gratis →
            </Link>
            <Link href="/como-funciona"
              className="px-8 py-4 rounded-xl font-bold text-base border"
              style={{ borderColor: '#1e2d3d', color: '#4a6070' }}>
              Ver cómo funciona
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-8 py-10" style={{ borderColor: '#1e2d3d' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo height={22} />
          <p className="text-xs" style={{ color: '#2a4050' }}>© 2026 FokuSport. Todos los derechos reservados.</p>
          <div className="flex gap-6 text-xs" style={{ color: '#2a4050' }}>
            <Link href="#" className="hover:text-[#4a6070] transition-colors">Privacidad</Link>
            <Link href="#" className="hover:text-[#4a6070] transition-colors">Términos</Link>
            <Link href="/contacto" className="hover:text-[#4a6070] transition-colors">Contacto</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
