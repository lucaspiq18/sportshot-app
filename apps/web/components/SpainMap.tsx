'use client'

import { useRouter } from 'next/navigation'

type Tile = {
  id: string
  name: string
  col: number
  row: number
  span?: number // colSpan
}

const TW = 70  // tile width
const TH = 34  // tile height
const G  = 2   // gap

// Geographic tile layout of Spain's 52 provinces
// col 0 = west, col 9 = east | row 0 = north, row 7 = south
const TILES: Tile[] = [
  // Row 0 — northern coast
  { id: 'A Coruña',   name: 'A Coruña',   col: 0, row: 0 },
  { id: 'Lugo',       name: 'Lugo',        col: 1, row: 0 },
  { id: 'Asturias',   name: 'Asturias',    col: 2, row: 0, span: 2 },
  { id: 'Cantabria',  name: 'Cantabria',   col: 4, row: 0 },
  { id: 'Bizkaia',    name: 'Bizkaia',     col: 5, row: 0 },
  { id: 'Gipuzkoa',   name: 'Gipuzkoa',   col: 6, row: 0 },

  // Row 1
  { id: 'Pontevedra', name: 'Pontevedra', col: 0, row: 1 },
  { id: 'Ourense',    name: 'Ourense',    col: 1, row: 1 },
  { id: 'León',       name: 'León',       col: 2, row: 1 },
  { id: 'Palencia',   name: 'Palencia',   col: 3, row: 1 },
  { id: 'Burgos',     name: 'Burgos',     col: 4, row: 1 },
  { id: 'Álava',      name: 'Álava',      col: 5, row: 1 },
  { id: 'Navarra',    name: 'Navarra',    col: 6, row: 1 },
  { id: 'Huesca',     name: 'Huesca',     col: 7, row: 1 },
  { id: 'Lleida',     name: 'Lleida',     col: 8, row: 1 },
  { id: 'Girona',     name: 'Girona',     col: 9, row: 1 },

  // Row 2
  { id: 'Zamora',     name: 'Zamora',     col: 1, row: 2 },
  { id: 'Valladolid', name: 'Valladolid', col: 2, row: 2 },
  { id: 'Soria',      name: 'Soria',      col: 4, row: 2 },
  { id: 'La Rioja',   name: 'La Rioja',   col: 5, row: 2 },
  { id: 'Zaragoza',   name: 'Zaragoza',   col: 6, row: 2 },
  { id: 'Tarragona',  name: 'Tarragona',  col: 8, row: 2 },
  { id: 'Barcelona',  name: 'Barcelona',  col: 9, row: 2 },

  // Row 3
  { id: 'Salamanca',  name: 'Salamanca',  col: 0, row: 3 },
  { id: 'Ávila',      name: 'Ávila',      col: 1, row: 3 },
  { id: 'Segovia',    name: 'Segovia',    col: 2, row: 3 },
  { id: 'Madrid',     name: 'Madrid',     col: 3, row: 3 },
  { id: 'Guadalajara',name: 'Guadalajara',col: 4, row: 3 },
  { id: 'Cuenca',     name: 'Cuenca',     col: 5, row: 3 },
  { id: 'Teruel',     name: 'Teruel',     col: 6, row: 3 },
  { id: 'Castellón',  name: 'Castellón',  col: 8, row: 3 },

  // Row 4
  { id: 'Cáceres',    name: 'Cáceres',    col: 0, row: 4 },
  { id: 'Toledo',     name: 'Toledo',     col: 1, row: 4 },
  { id: 'Ciudad Real',name: 'Ciudad Real',col: 3, row: 4 },
  { id: 'Albacete',   name: 'Albacete',   col: 5, row: 4 },
  { id: 'Valencia',   name: 'Valencia',   col: 8, row: 4 },

  // Row 5
  { id: 'Badajoz',    name: 'Badajoz',    col: 0, row: 5 },
  { id: 'Córdoba',    name: 'Córdoba',    col: 2, row: 5 },
  { id: 'Jaén',       name: 'Jaén',       col: 3, row: 5 },
  { id: 'Granada',    name: 'Granada',    col: 4, row: 5 },
  { id: 'Almería',    name: 'Almería',    col: 5, row: 5 },
  { id: 'Murcia',     name: 'Murcia',     col: 6, row: 5 },
  { id: 'Alicante',   name: 'Alicante',   col: 8, row: 5 },

  // Row 6
  { id: 'Huelva',     name: 'Huelva',     col: 0, row: 6 },
  { id: 'Sevilla',    name: 'Sevilla',    col: 1, row: 6 },
  { id: 'Málaga',     name: 'Málaga',     col: 2, row: 6 },

  // Row 7
  { id: 'Cádiz',      name: 'Cádiz',      col: 0, row: 7 },
]

// Island tiles shown as a small inset (col offset from right)
const ISLAND_TILES: (Tile & { insetCol: number; insetRow: number })[] = [
  { id: 'Baleares',        name: 'Baleares',       col: 0, row: 0, insetCol: 0, insetRow: 0, span: 2 },
  { id: 'Las Palmas',      name: 'Las Palmas',     col: 0, row: 0, insetCol: 0, insetRow: 1 },
  { id: 'S.C. Tenerife',   name: 'S.C. Tenerife',  col: 0, row: 0, insetCol: 1, insetRow: 1 },
  { id: 'Ceuta',           name: 'Ceuta',           col: 0, row: 0, insetCol: 0, insetRow: 2 },
  { id: 'Melilla',         name: 'Melilla',         col: 0, row: 0, insetCol: 1, insetRow: 2 },
]

const COLS = 10
const ROWS = 8
const W = COLS * (TW + G)  // 720
const H = ROWS * (TH + G)  // 288

// Inset starts at bottom-right
const INSET_X = W - 2 * (TW + G)
const INSET_Y = H - 3 * (TH + G) - 20  // just above bottom, row 5 area

export default function SpainMap({ selected }: { selected?: string }) {
  const router = useRouter()

  function handleClick(province: string) {
    if (province === selected) {
      router.push('/dashboard/photographer/eventos')
    } else {
      router.push(`/dashboard/photographer/eventos?city=${encodeURIComponent(province)}`)
    }
  }

  function tileStyle(id: string) {
    const isSelected = selected === id
    const isActive = !selected || isSelected
    return {
      fill: isSelected ? 'var(--accent)' : isActive ? 'var(--surface-2, #1a2535)' : 'var(--surface)',
      stroke: isSelected ? 'var(--accent)' : 'var(--border)',
      strokeWidth: isSelected ? 1.5 : 1,
      opacity: isActive ? 1 : 0.45,
      cursor: 'pointer',
      transition: 'all 0.15s',
    }
  }

  function labelStyle(id: string) {
    const isSelected = selected === id
    return {
      fill: isSelected ? '#0a0f14' : 'var(--text-muted)',
      fontSize: 8,
      fontFamily: 'system-ui, sans-serif',
      pointerEvents: 'none' as const,
      fontWeight: isSelected ? '700' : '400',
    }
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H + 10}`}
        style={{ width: '100%', maxWidth: W, display: 'block', margin: '0 auto' }}
      >
        {/* Main province tiles */}
        {TILES.map(t => {
          const x = t.col * (TW + G)
          const y = t.row * (TH + G)
          const w = (t.span ?? 1) * (TW + G) - G
          const cx = x + w / 2
          const cy = y + TH / 2 + 1
          return (
            <g key={t.id} onClick={() => handleClick(t.id)} style={{ cursor: 'pointer' }}>
              <rect
                x={x} y={y} width={w} height={TH} rx={4}
                style={tileStyle(t.id)}
              />
              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
                style={labelStyle(t.id)}>
                {t.name}
              </text>
            </g>
          )
        })}

        {/* Island inset — border */}
        <rect
          x={INSET_X - 4} y={INSET_Y - 4}
          width={2 * (TW + G) + 4} height={3 * (TH + G) + 4}
          rx={6} fill="none"
          stroke="var(--border)" strokeWidth={1} strokeDasharray="3 2"
        />
        <text x={INSET_X - 4} y={INSET_Y - 8}
          style={{ fill: 'var(--text-muted)', fontSize: 7, fontFamily: 'system-ui', opacity: 0.6 }}>
          Islas y ciudades
        </text>

        {/* Island tiles */}
        {ISLAND_TILES.map(t => {
          const x = INSET_X + t.insetCol * (TW + G)
          const y = INSET_Y + t.insetRow * (TH + G)
          const w = (t.span ?? 1) * (TW + G) - G
          const cx = x + w / 2
          const cy = y + TH / 2 + 1
          return (
            <g key={t.id} onClick={() => handleClick(t.id)} style={{ cursor: 'pointer' }}>
              <rect x={x} y={y} width={w} height={TH} rx={4} style={tileStyle(t.id)} />
              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
                style={labelStyle(t.id)}>
                {t.name}
              </text>
            </g>
          )
        })}
      </svg>

      {selected && (
        <div className="text-center mt-2">
          <button
            onClick={() => router.push('/dashboard/photographer/eventos')}
            className="text-xs px-3 py-1 rounded-full border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            ✕ Quitar filtro · {selected}
          </button>
        </div>
      )}
    </div>
  )
}
