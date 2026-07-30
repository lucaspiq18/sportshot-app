import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-8 text-center" style={{ background: 'var(--bg)' }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mb-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        404
      </div>
      <h1 className="text-4xl font-bold mb-3">Página no encontrada</h1>
      <p className="text-base mb-10 max-w-sm" style={{ color: 'var(--text-muted)' }}>
        La página que buscas no existe o ha sido movida.
      </p>
      <div className="flex gap-3">
        <Link href="/" className="px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'var(--accent)', color: '#0a0f14' }}>
          Volver al inicio
        </Link>
        <Link href="/contacto" className="px-5 py-2.5 rounded-xl text-sm font-semibold border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          Contactar soporte
        </Link>
      </div>
    </main>
  )
}
