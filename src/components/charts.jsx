/**
 * Gráficos del sistema. Reglas: un solo eje, marcas finas,
 * rejilla discreta, etiquetas directas sólo donde aportan, y
 * los colores de serie salen de --s1 / --s2 (validados para daltonismo).
 * Los colores de severidad NUNCA se usan como serie categórica.
 */

const AXIS = 'var(--sub)'
const GRID = 'var(--line-2)'

export function Sparkline({ points, color = 'var(--acc)', fill = true, height = 34 }) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const span = max - min || 1
  const step = 220 / (points.length - 1)
  const y = (v) => 30 - ((v - min) / span) * 26
  const d = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  return (
    <svg viewBox="0 0 220 34" preserveAspectRatio="none" style={{ width: '100%', height }} aria-hidden="true">
      {fill && <path d={`${d} L220 34 L0 34 Z`} fill={color} opacity="0.09" />}
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export function SparkBars({ points, color = 'var(--acc)', height = 34 }) {
  const max = Math.max(...points)
  const w = 220 / points.length
  return (
    <svg viewBox="0 0 220 34" preserveAspectRatio="none" style={{ width: '100%', height }} aria-hidden="true">
      <g fill={color} opacity="0.6">
        {points.map((v, i) => {
          const h = (v / max) * 28
          return <rect key={i} x={i * w + 2} y={34 - h} width={w - 4} height={h} rx="2" />
        })}
      </g>
    </svg>
  )
}

/** Evolución temporal. Una serie: sin leyenda, el título la nombra. */
export function TrendChart({ data, height = 250, highlight }) {
  const W = 700
  const H = height
  const padL = 44
  const padR = 24
  const padT = 22
  const padB = 40
  const max = Math.ceil(Math.max(...data.map((d) => d.value)) / 15) * 15 || 60
  const x = (i) => padL + (i * (W - padL - padR)) / (data.length - 1)
  const y = (v) => padT + (1 - v / max) * (H - padT - padB)
  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)} ${y(d.value)}`).join(' ')
  const ticks = [max, (max / 4) * 3, max / 2, max / 4, 0]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
      <g stroke={GRID} strokeWidth="1">
        {ticks.slice(0, 4).map((t) => (
          <path key={t} d={`M${padL} ${y(t)}h${W - padL - padR}`} />
        ))}
      </g>
      <path d={`M${padL} ${y(0)}h${W - padL - padR}`} stroke="var(--line)" strokeWidth="1" />
      <g fill={AXIS} fontFamily="IBM Plex Mono, monospace" fontSize="10" textAnchor="end">
        {ticks.map((t) => (
          <text key={t} x={padL - 8} y={y(t) + 4}>
            {t}
          </text>
        ))}
      </g>
      <path d={`${line} L${x(data.length - 1)} ${y(0)} L${padL} ${y(0)} Z`} fill="var(--s1)" opacity="0.08" />
      <path d={line} fill="none" stroke="var(--s1)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <g fill="var(--s1)" stroke="var(--surf)" strokeWidth="2">
        {data.map((d, i) => (
          <circle key={d.label} cx={x(i)} cy={y(d.value)} r={i === data.length - 1 ? 5.5 : 4.5} />
        ))}
      </g>
      {/* etiquetas directas: sólo primero y último */}
      <g fontFamily="IBM Plex Mono, monospace" fontSize="11" fontWeight="600" fill="var(--ink)">
        <text x={x(0)} y={y(data[0].value) - 10} textAnchor="middle">
          {data[0].value}
        </text>
        <text x={x(data.length - 1)} y={y(data[data.length - 1].value) - 12} textAnchor="end">
          {data[data.length - 1].value}
        </text>
      </g>
      <g fill={AXIS} fontFamily="Manrope, sans-serif" fontSize="10.5" fontWeight="600" textAnchor="middle">
        {data.map((d, i) => (
          <text key={d.label} x={x(i)} y={H - 14}>
            {d.label}
          </text>
        ))}
      </g>
      {highlight != null && (
        <g>
          <path d={`M${x(highlight)} ${padT}v${H - padT - padB}`} stroke="var(--ink)" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
        </g>
      )}
    </svg>
  )
}

/** Dos series categóricas agrupadas: leyenda obligatoria + etiqueta directa en la última barra. */
export function GroupedBars({ data, height = 240 }) {
  const W = 520
  const H = height
  const padL = 36
  const padB = 30
  const padT = 14
  const max = Math.ceil(Math.max(...data.flatMap((d) => [d.potholes, d.cracks])) / 6) * 6 || 24
  const groupW = (W - padL - 12) / data.length
  const y = (v) => padT + (1 - v / max) * (H - padT - padB)
  const ticks = [max, (max * 3) / 4, max / 2, max / 4, 0]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
      <g stroke={GRID}>
        {ticks.slice(0, 4).map((t) => (
          <path key={t} d={`M${padL} ${y(t)}h${W - padL - 12}`} />
        ))}
      </g>
      <path d={`M${padL} ${y(0)}h${W - padL - 12}`} stroke="var(--line)" />
      <g fill={AXIS} fontFamily="IBM Plex Mono, monospace" fontSize="10" textAnchor="end">
        {ticks.map((t) => (
          <text key={t} x={padL - 8} y={y(t) + 4}>
            {Math.round(t)}
          </text>
        ))}
      </g>
      {data.map((d, i) => {
        const gx = padL + i * groupW
        const bw = Math.min(22, groupW / 2.6)
        return (
          <g key={d.label}>
            <rect x={gx + groupW / 2 - bw - 2} y={y(d.potholes)} width={bw} height={y(0) - y(d.potholes)} rx="4" fill="var(--s1)" />
            <rect x={gx + groupW / 2 + 2} y={y(d.cracks)} width={bw} height={y(0) - y(d.cracks)} rx="4" fill="var(--s2)" />
            <text x={gx + groupW / 2} y={H - 10} textAnchor="middle" fill={AXIS} fontFamily="Manrope, sans-serif" fontSize="10.5" fontWeight="600">
              {d.label}
            </text>
            {i === data.length - 1 && (
              <>
                <text x={gx + groupW / 2 - bw / 2 - 2} y={y(d.potholes) - 6} textAnchor="middle" fill="var(--ink)" fontFamily="IBM Plex Mono, monospace" fontSize="10.5" fontWeight="600">
                  {d.potholes}
                </text>
                <text x={gx + groupW / 2 + bw / 2 + 2} y={y(d.cracks) - 6} textAnchor="middle" fill="var(--ink)" fontFamily="IBM Plex Mono, monospace" fontSize="10.5" fontWeight="600">
                  {d.cracks}
                </text>
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export function Legend({ items }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center', fontSize: 11.5, fontWeight: 700, color: 'var(--mut)' }}>
      {items.map((it) => (
        <span key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <i style={{ width: 10, height: 10, borderRadius: 3, display: 'block', background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  )
}

/** Ranking horizontal: una sola tinta, la magnitud la da la longitud. */
export function RankBars({ data, height = 240 }) {
  const W = 400
  const rowH = height / data.length
  const max = Math.max(...data.map((d) => d.count))
  return (
    <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
      {data.map((d, i) => {
        const y = i * rowH
        const w = (d.count / max) * (W - 70)
        return (
          <g key={d.zone}>
            <text x="0" y={y + 16} fill="var(--ink)" fontFamily="Manrope, sans-serif" fontSize="11.5" fontWeight="700">
              {d.zone}
            </text>
            <rect x="0" y={y + 24} width={w} height="14" rx="4" fill="var(--s1)" opacity={1 - i * 0.16} />
            <text
              x={w + 10}
              y={y + 36}
              fill="var(--ink)"
              fontFamily="IBM Plex Mono, monospace"
              fontSize="11.5"
              fontWeight="600"
            >
              {d.count}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Barra apilada de severidad: colores de ESTADO, siempre con etiqueta al lado. */
export function SeverityBar({ items }) {
  return (
    <div style={{ display: 'flex', height: 16, gap: 2, borderRadius: 4, overflow: 'hidden' }}>
      {items.map((s) => (
        <span key={s.id} title={`${s.label}: ${s.count}`} style={{ width: `${s.pct}%`, background: s.color, display: 'block' }} />
      ))}
    </div>
  )
}

/** Mapa de calor sencillo: burbujas proporcionales sobre la trama vial. */
export function GeoDensity({ height = 250 }) {
  const blobs = [
    { x: 120, y: 104, r: 46, color: 'var(--high)', n: 38 },
    { x: 280, y: 150, r: 34, color: 'var(--med)', n: 27 },
    { x: 330, y: 60, r: 26, color: 'var(--med)', n: 13 },
    { x: 60, y: 200, r: 22, color: 'var(--low)', n: 9 },
  ]
  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <rect width="400" height="250" fill="var(--map-bg)" />
      <g stroke="var(--map-road-2)" strokeWidth="2" fill="none">
        <path d="M0 50h400M0 150h400M0 210h400M60 0v250M180 0v250M300 0v250" />
      </g>
      <g stroke="var(--map-road)" strokeWidth="7" fill="none" strokeLinecap="round">
        <path d="M0 104h400" />
        <path d="M120 0v250" />
        <path d="M280 0v250" />
      </g>
      {blobs.map((b) => (
        <g key={b.n}>
          <circle cx={b.x} cy={b.y} r={b.r} fill={b.color} opacity="0.18" />
          <text x={b.x} y={b.y + 4} textAnchor="middle" fill="var(--ink)" fontFamily="IBM Plex Mono, monospace" fontSize="12" fontWeight="600">
            {b.n}
          </text>
        </g>
      ))}
    </svg>
  )
}
