export function Logo({
  height = 28,
  variant = 'dark',
}: {
  height?: number
  variant?: 'dark' | 'light'
}) {
  const textColor = variant === 'dark' ? '#f0f4f7' : '#0f1a22'
  const deco = variant === 'dark' ? 'rgba(240,244,247,0.36)' : 'rgba(15,26,34,0.22)'
  const w = (400 / 120) * height

  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 400 120"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="FokuSport"
      style={{ display: 'block' }}
    >
      {/* Foku */}
      <text x="22" y="38" fontFamily="'Arial Black','Helvetica Neue',Arial,sans-serif" fontSize="37" fontWeight="900" fill={textColor}>Foku</text>

      {/* S — large, accent, spans both lines */}
      <text x="118" y="105" fontFamily="'Arial Black','Helvetica Neue',Arial,sans-serif" fontSize="131" fontWeight="900" fill="#7EC8E3">S</text>

      {/* port */}
      <text x="200" y="105" fontFamily="'Arial Black','Helvetica Neue',Arial,sans-serif" fontSize="37" fontWeight="900" fill={textColor}>port</text>

      {/* Olympic rings — above 'port' */}
      {([
        [215, 46], [243, 46], [271, 46],
        [229, 60], [257, 60],
      ] as [number, number][]).map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="13.5" stroke={deco} strokeWidth="3.5" fill="none" />
      ))}

      {/* Camera — below 'Foku' */}
      {/* Body with lens hole (evenodd) */}
      <path
        d="M48,54 H94 Q98,54 98,58 V83 Q98,87 94,87 H48 Q44,87 44,83 V58 Q44,54 48,54 Z M79,70 A10,10,0,1,0,59,70 A10,10,0,1,0,79,70 Z"
        fill={deco}
        fillRule="evenodd"
      />
      {/* Viewfinder bump */}
      <path d="M51,47 H62 Q64,47 64,49 V54 H49 V49 Q49,47 51,47 Z" fill={deco} />
      {/* Inner lens dot */}
      <circle cx="69" cy="70" r="3.8" fill={deco} />
    </svg>
  )
}
