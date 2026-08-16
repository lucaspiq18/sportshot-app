'use client'

import { useRouter } from 'next/navigation'

export default function CityFilter({ provinces, selected }: { provinces: string[]; selected?: string }) {
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    if (val) {
      router.push(`/dashboard/photographer/eventos?city=${encodeURIComponent(val)}`)
    } else {
      router.push('/dashboard/photographer/eventos')
    }
  }

  return (
    <select
      value={selected ?? ''}
      onChange={handleChange}
      className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
    >
      <option value="">Todas las provincias</option>
      {provinces.map(p => (
        <option key={p} value={p}>{p}</option>
      ))}
    </select>
  )
}
