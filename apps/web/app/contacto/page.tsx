'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Contacto() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: conectar a endpoint real
    setSent(true)
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
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
        <h1 className="text-4xl font-bold mb-4 text-center">Contacto</h1>
        <p className="text-center mb-16 text-lg" style={{ color: 'var(--text-muted)' }}>Estamos aquí para ayudarte. Escríbenos y te respondemos en menos de 24h.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Info */}
          <div className="flex flex-col gap-6">
            <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="text-2xl mb-3">📧</div>
              <h3 className="font-semibold mb-1">Email</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>hola@fokusport.com</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Respondemos en menos de 24h</p>
            </div>
            <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="text-2xl mb-3">💬</div>
              <h3 className="font-semibold mb-1">Chat de soporte</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Disponible para usuarios registrados desde el panel de control</p>
            </div>
            <div className="p-6 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="text-2xl mb-3">❓</div>
              <h3 className="font-semibold mb-1">¿Tienes una duda?</h3>
              <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>Puede que ya tengamos la respuesta en nuestras preguntas frecuentes</p>
              <Link href="/faq" className="text-sm font-medium" style={{ color: 'var(--accent)' }}>Ver FAQ →</Link>
            </div>
          </div>

          {/* Formulario */}
          <div>
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 p-10 rounded-2xl border text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="text-4xl">✓</div>
                <h3 className="text-xl font-bold">Mensaje enviado</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Gracias por contactarnos. Te responderemos en menos de 24h en {form.email}.</p>
                <button onClick={() => { setSent(false); setForm({ nombre: '', email: '', asunto: '', mensaje: '' }) }} className="mt-2 text-sm" style={{ color: 'var(--accent)' }}>
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Nombre</label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Asunto</label>
                  <select
                    value={form.asunto}
                    onChange={e => setForm(f => ({ ...f, asunto: e.target.value }))}
                    required
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: form.asunto ? 'var(--text)' : 'var(--text-muted)' }}
                  >
                    <option value="" disabled>Selecciona un asunto</option>
                    <option value="soporte">Soporte técnico</option>
                    <option value="facturacion">Facturación y pagos</option>
                    <option value="fotograof">Soy fotógrafo</option>
                    <option value="equipo">Soy equipo o club</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Mensaje</label>
                  <textarea
                    required
                    rows={5}
                    value={form.mensaje}
                    onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    placeholder="Cuéntanos cómo podemos ayudarte..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-semibold text-sm"
                  style={{ background: 'var(--accent)', color: '#0a0f14' }}
                >
                  Enviar mensaje →
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
