'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { apiClient } from '@/lib/api-client'

type ConnectStatus = {
  hasAccount: boolean
  onboarded: boolean
  chargesEnabled: boolean
  payoutsEnabled: boolean
  requirements: string[]
}

export default function PagosPage() {
  const { getToken } = useAuth()
  const [status, setStatus] = useState<ConnectStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken()
        if (!token) return
        const data = await apiClient<ConnectStatus>('/connect/status', token)
        setStatus(data)
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [getToken])

  async function handleConnect() {
    setConnecting(true)
    try {
      const token = await getToken()
      if (!token) return
      const data = await apiClient<{ url: string }>('/connect/onboarding', token, {
        method: 'POST',
        body: JSON.stringify({ webReturnUrl: window.location.href }),
      })
      window.location.href = data.url
    } catch (e: any) {
      alert(e?.message ?? 'Error al conectar con Stripe')
      setConnecting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Cargando...</p>
    </div>
  )

  const isReady = status?.onboarded && status?.chargesEnabled && status?.payoutsEnabled

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Cuenta de pagos</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Necesitas conectar tu cuenta bancaria para cobrar por tus trabajos</p>
      </div>

      <div className="p-6 rounded-2xl border flex flex-col gap-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'rgba(126,200,227,0.1)' }}>
            {isReady ? '✅' : '💳'}
          </div>
          <div>
            <p className="font-semibold">
              {isReady ? 'Cuenta conectada' : status?.hasAccount ? 'Onboarding incompleto' : 'Sin cuenta de pagos'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {isReady
                ? 'Puedes aceptar ofertas y cobrar por tus trabajos'
                : 'Completa el proceso para poder cobrar'}
            </p>
          </div>
        </div>

        {!isReady && (
          <>
            {status?.requirements && status.requirements.length > 0 && (
              <div className="p-3 rounded-lg text-xs" style={{ background: 'rgba(251,191,36,0.08)', color: '#fbbf24' }}>
                Hay información pendiente que Stripe necesita para activar tu cuenta.
              </div>
            )}
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
              style={{ background: 'var(--accent)', color: '#0a0f14' }}>
              {connecting ? 'Redirigiendo a Stripe...' : status?.hasAccount ? 'Completar onboarding →' : 'Conectar cuenta bancaria →'}
            </button>
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              Procesado de forma segura por Stripe. FokuSport nunca almacena tus datos bancarios.
            </p>
          </>
        )}

        {isReady && (
          <div className="flex flex-col gap-2">
            <StatusRow label="Cobros habilitados" ok={status!.chargesEnabled} />
            <StatusRow label="Pagos habilitados" ok={status!.payoutsEnabled} />
          </div>
        )}
      </div>

      {isReady && (
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          Para gestionar tu cuenta bancaria o ver tus pagos, accede a tu dashboard de Stripe directamente.
        </p>
      )}
    </div>
  )
}

function StatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
        style={{ background: ok ? '#1a3a2a' : '#2a1a1a', color: ok ? '#4ade80' : '#f87171' }}>
        {ok ? 'Activo' : 'Inactivo'}
      </span>
    </div>
  )
}
