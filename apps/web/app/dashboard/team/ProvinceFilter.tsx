'use client'

import { useRouter } from 'next/navigation'

const PROVINCES = [
  'A Coruña','Álava','Albacete','Alicante','Almería','Asturias','Ávila',
  'Badajoz','Baleares','Barcelona','Bizkaia','Burgos','Cáceres','Cádiz',
  'Cantabria','Castellón','Ceuta','Ciudad Real','Córdoba','Cuenca',
  'Gipuzkoa','Girona','Granada','Guadalajara','Huelva','Huesca',
  'Jaén','La Rioja','Las Palmas','León','Lleida','Lugo','Madrid',
  'Málaga','Melilla','Murcia','Navarra','Ourense','Palencia',
  'Pontevedra','Salamanca','S.C. Tenerife','Segovia','Sevilla','Soria',
  'Tarragona','Teruel','Toledo','Valencia','Valladolid','Zamora','Zaragoza',
]

export default function ProvinceFilter({ selected }: { selected?: string }) {
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    if (val) router.push(`/dashboard/team?city=${encodeURIComponent(val)}`)
    else router.push('/dashboard/team')
  }

  return (
    <select
      value={selected ?? ''}
      onChange={handleChange}
      className="px-4 py-2.5 rounded-xl border text-sm outline-none"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)', minWidth: 200 }}
    >
      <option value="">Todas las provincias</option>
      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
    </select>
  )
}
