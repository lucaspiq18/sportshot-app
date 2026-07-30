'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { apiClient } from '@/lib/api-client'

const SPORTS = ['Fútbol', 'Baloncesto', 'Voleibol', 'Balonmano', 'Atletismo', 'Natación', 'Tenis', 'Rugby', 'Ciclismo', 'Otro']

export default function OnboardingPage() {
  const { getToken } = useAuth()
  const router = useRouter()
  const [role, setRole] = useState<'photographer' | 'team' | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ fullName: '', city: '', sports: [] as string[], bio: '', clubName: '', sport: '', category: '', referralCode: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const token = await getToken()
      if (!token) return
      if (role === 'photographer') {
        await apiClient('/onboarding/photographer', token, {
          method: 'POST',
          body: JSON.stringify({ fullName: form.fullName, city: form.city, sports: form.sports, bio: form.bio, referralCode: form.referralCode || undefined }),
        })
      } else {
        await apiClient('/onboarding/team', token, {
          method: 'POST',
          body: JSON.stringify({ fullName: form.fullName, clubName: form.clubName, sport: form.sport, city: form.city, category: form.category }),
        })
      }
      router.push('/dashboard')
    } catch {
      alert('Error al guardar. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (!role) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-6" style={{ background: 'var(--bg)' }}>
        <h1 className="text-3xl font-bold">¿Cómo quieres usar Fokusport?</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No podrás cambiar el rol después del registro</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-xl">
          {[
            { role: 'photographer' as const, title: 'Soy fotógrafo', desc: 'Publica tu disponibilidad y recibe ofertas de equipos' },
            { role: 'team' as const, title: 'Soy equipo / club', desc: 'Encuentra fotógrafos para tus eventos deportivos' },
          ].map((opt) => (
            <button key={opt.role} onClick={() => setRole(opt.role)}
              className="p-6 rounded-xl border text-left transition-colors hover:border-[var(--accent)]"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h2 className="font-semibold text-lg mb-2">{opt.title}</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-8">{role === 'photographer' ? 'Tu perfil de fotógrafo' : 'Tu perfil de equipo'}</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input required placeholder="Nombre completo" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
            className="px-4 py-3 rounded-lg border text-sm outline-none focus:border-[var(--accent)]"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }} />
          <input required placeholder="Ciudad" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
            className="px-4 py-3 rounded-lg border text-sm outline-none focus:border-[var(--accent)]"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }} />

          {role === 'photographer' ? (<>
            <div className="flex flex-wrap gap-2">
              {SPORTS.map(s => (
                <button type="button" key={s} onClick={() => setForm(f => ({ ...f, sports: f.sports.includes(s) ? f.sports.filter(x => x !== s) : [...f.sports, s] }))}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                  style={{ background: form.sports.includes(s) ? 'var(--accent)' : 'var(--surface)', color: form.sports.includes(s) ? '#0a0f14' : 'var(--text-muted)', borderColor: form.sports.includes(s) ? 'var(--accent)' : 'var(--border)' }}>
                  {s}
                </button>
              ))}
            </div>
            <textarea placeholder="Cuéntanos sobre ti (máx. 300 caracteres)" maxLength={300} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              rows={3} className="px-4 py-3 rounded-lg border text-sm outline-none resize-none focus:border-[var(--accent)]"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }} />
            <div>
              <input
                placeholder="Código de referido (opcional)"
                value={form.referralCode}
                onChange={e => setForm(f => ({ ...f, referralCode: e.target.value.toUpperCase() }))}
                maxLength={20}
                className="w-full px-4 py-3 rounded-lg border text-sm outline-none focus:border-[var(--accent)] font-mono"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>Si otro fotógrafo te ha invitado, introduce su código aquí</p>
            </div>
          </>) : (<>
            <input required placeholder="Nombre del club" value={form.clubName} onChange={e => setForm(f => ({ ...f, clubName: e.target.value }))}
              className="px-4 py-3 rounded-lg border text-sm outline-none focus:border-[var(--accent)]"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }} />
            <select required value={form.sport} onChange={e => setForm(f => ({ ...f, sport: e.target.value }))}
              className="px-4 py-3 rounded-lg border text-sm outline-none"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: form.sport ? 'var(--text)' : 'var(--text-muted)' }}>
              <option value="">Selecciona deporte</option>
              {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input placeholder="Categoría (opcional)" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="px-4 py-3 rounded-lg border text-sm outline-none focus:border-[var(--accent)]"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }} />
          </>)}

          <button type="submit" disabled={loading}
            className="mt-2 py-3 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-50"
            style={{ background: 'var(--accent)', color: '#0a0f14' }}>
            {loading ? 'Guardando...' : 'Continuar'}
          </button>
        </form>
      </div>
    </div>
  )
}
