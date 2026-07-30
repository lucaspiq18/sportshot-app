'use client'
import { useAuth } from '@clerk/nextjs'
import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'

type ReferralStats = {
  referralCode: string
  totalReferrals: number
  totalEarned: number
  referrals: {
    id: string
    fullName: string
    completedBookings: number
    totalEarned: number
  }[]
}

export default function ReferidosPage() {
  const { getToken } = useAuth()
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const fetch = useCallback(async () => {
    const token = await getToken()
    if (!token) return
    const data = await apiClient<ReferralStats>('/referrals', token).catch(() => null)
    setStats(data)
    setLoading(false)
  }, [getToken])

  useEffect(() => { fetch() }, [fetch])

  function copyCode() {
    if (!stats?.referralCode) return
    navigator.clipboard.writeText(stats.referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold mb-1">Programa de referidos</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Invita a otros fotógrafos y gana el 1% de cada trabajo que completen</p>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Cargando…</p>
      ) : !stats ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No se pudo cargar la información.</p>
      ) : (
        <>
          {/* Código */}
          <div className="p-6 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Tu código de referido</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold font-mono tracking-widest" style={{ color: 'var(--accent)' }}>
                {stats.referralCode}
              </span>
              <button
                onClick={copyCode}
                className="px-4 py-2 rounded-lg text-xs font-semibold border transition-colors"
                style={{ borderColor: 'var(--border)', color: copied ? 'var(--accent)' : 'var(--text-muted)' }}
              >
                {copied ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>
            <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
              Comparte este código con otros fotógrafos. Cuando se registren con él y completen trabajos, recibirás el 1% de cada venta automáticamente.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <p className="text-3xl font-bold mb-1" style={{ color: 'var(--accent)' }}>{stats.totalReferrals}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Fotógrafos referidos</p>
            </div>
            <div className="p-5 rounded-xl border text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <p className="text-3xl font-bold mb-1" style={{ color: 'var(--accent)' }}>{(stats.totalEarned / 100).toFixed(2)} €</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Ganado por referidos</p>
            </div>
          </div>

          {/* Cómo funciona */}
          <div className="p-5 rounded-xl border flex flex-col gap-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h2 className="font-semibold text-sm">Cómo funciona</h2>
            {[
              { n: '1', t: 'Comparte tu código', d: 'Envía tu código a fotógrafos que conozcas' },
              { n: '2', t: 'Se registran con tu código', d: 'Lo introducen al crear su perfil de fotógrafo' },
              { n: '3', t: 'Completan un trabajo', d: 'Cada vez que cobren, tú recibes el 1% automáticamente' },
            ].map(s => (
              <div key={s.n} className="flex gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" style={{ background: 'var(--accent)', color: '#0a0f14' }}>{s.n}</span>
                <div>
                  <p className="text-sm font-medium">{s.t}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Lista de referidos */}
          {stats.referrals.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4">Tus referidos</h2>
              <div className="flex flex-col gap-3">
                {stats.referrals.map(r => (
                  <div key={r.id} className="p-4 rounded-xl border flex items-center justify-between" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <div>
                      <p className="font-medium text-sm">{r.fullName}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{r.completedBookings} trabajo{r.completedBookings !== 1 ? 's' : ''} completado{r.completedBookings !== 1 ? 's' : ''}</p>
                    </div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--accent)' }}>+{(r.totalEarned / 100).toFixed(2)} €</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
