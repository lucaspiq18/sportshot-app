import Link from 'next/link'

export default function ComoFunciona() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b backdrop-blur-sm" style={{ borderColor: 'var(--border)', background: 'rgba(10,15,20,0.85)' }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: 'var(--accent)', color: '#0a0f14' }}>F</div>
          <span className="text-base font-bold">Fokusport</span>
        </Link>
        <div className="flex gap-3">
          <Link href="/sign-in" className="px-4 py-2 rounded-lg text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Iniciar sesión</Link>
          <Link href="/sign-up" className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: 'var(--accent)', color: '#0a0f14' }}>Registrarse</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-20">
        <h1 className="text-4xl font-bold mb-4 text-center">Cómo funciona Fokusport</h1>
        <p className="text-center mb-20 text-lg" style={{ color: 'var(--text-muted)' }}>Todo el proceso, explicado paso a paso</p>

        {/* Para equipos */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'rgba(126,200,227,0.1)' }}>⚽</div>
            <h2 className="text-2xl font-bold">Para equipos y clubes</h2>
          </div>
          <div className="flex flex-col gap-6">
            {[
              { step: '1', title: 'Crea tu cuenta', desc: 'Regístrate gratis en menos de 2 minutos. Indica tu club, deporte y ciudad.' },
              { step: '2', title: 'Explora fotógrafos', desc: 'Busca fotógrafos disponibles en tu zona por deporte, fecha y precio. Ve sus perfiles y valoraciones.' },
              { step: '3', title: 'Haz una oferta', desc: 'Selecciona un slot disponible e indica el nombre del evento, fecha y tu presupuesto.' },
              { step: '4', title: 'El fotógrafo acepta', desc: 'El fotógrafo revisa tu oferta y la acepta. El pago queda retenido hasta que recibes las fotos.' },
              { step: '5', title: 'Recibe tus fotos', desc: 'En menos de 48h recibes un enlace de descarga con todas las fotos en alta resolución.' },
              { step: '6', title: 'Valora al fotógrafo', desc: 'Deja tu valoración para ayudar a otros equipos a elegir al mejor fotógrafo.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5" style={{ background: 'var(--accent)', color: '#0a0f14' }}>{item.step}</div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Para fotógrafos */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'rgba(126,200,227,0.1)' }}>📷</div>
            <h2 className="text-2xl font-bold">Para fotógrafos</h2>
          </div>
          <div className="flex flex-col gap-6">
            {[
              { step: '1', title: 'Crea tu perfil', desc: 'Regístrate e indica tus deportes, ciudad y una breve bio. Sin necesidad de portfolio externo.' },
              { step: '2', title: 'Publica tu disponibilidad', desc: 'Añade slots con tu disponibilidad, ciudad y precio base. Los equipos te encontrarán.' },
              { step: '3', title: 'Recibe y acepta ofertas', desc: 'Los equipos te envían ofertas con el presupuesto y el evento. Acepta las que te interesen.' },
              { step: '4', title: 'Fotografía el evento', desc: 'Acude al evento, haz tu trabajo y edita las fotos.' },
              { step: '5', title: 'Entrega las fotos', desc: 'Sube las fotos a la plataforma. El equipo recibe el enlace de descarga.' },
              { step: '6', title: 'Cobra', desc: 'Una vez el equipo confirma la recepción, el pago se libera a tu cuenta en 1-2 días hábiles.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5" style={{ background: 'var(--accent)', color: '#0a0f14' }}>{item.step}</div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center p-10 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="text-2xl font-bold mb-3">¿Listo para empezar?</h2>
          <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>Regístrate gratis y empieza a conectar hoy mismo</p>
          <Link href="/sign-up" className="inline-flex px-6 py-3 rounded-xl font-semibold text-sm" style={{ background: 'var(--accent)', color: '#0a0f14' }}>
            Crear cuenta gratis →
          </Link>
        </div>
      </div>
    </main>
  )
}
