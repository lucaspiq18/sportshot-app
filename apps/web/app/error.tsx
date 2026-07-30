'use client'
import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-8 text-center" style={{ background: 'var(--bg)' }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mb-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        500
      </div>
      <h1 className="text-4xl font-bold mb-3">Algo salió mal</h1>
      <p className="text-base mb-10 max-w-sm" style={{ color: 'var(--text-muted)' }}>
        Se ha producido un error inesperado. Inténtalo de nuevo o contacta con soporte si el problema persiste.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--accent)', color: '#0a0f14' }}
        >
          Reintentar
        </button>
        <Link href="/" className="px-5 py-2.5 rounded-xl text-sm font-semibold border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          Volver al inicio
        </Link>
      </div>
      {error.digest && (
        <p className="mt-8 text-xs font-mono" style={{ color: 'var(--border)' }}>Error ID: {error.digest}</p>
      )}
    </main>
  )
}
