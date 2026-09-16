/**
 * Gráficos del sistema. Reglas: un solo eje, marcas finas,
 * rejilla discreta, etiquetas directas sólo donde aportan, y
 * los colores de serie salen de --s1 / --s2 (validados para daltonismo).
 * Los colores de severidad NUNCA se usan como serie categórica.
 */

import { useState } from 'react'

const AXIS = 'var(--sub)'
const GRID = 'var(--line-2)'

// Con título la mini gráfica es contenido; sin él, decoración que el lector de pantalla salta.
const sparkA11y = (title) => (title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })

/**
 * Tendencia mínima para una tarjeta KPI. La base es 0 y no el mínimo de la serie: con
 * conteos pequeños, escalar desde el mínimo convierte 3→4 en un salto dramático.
 * `title` aparece al pasar el cursor y es lo que lee un lector de pantalla.
 */
export function Sparkline({ points, color = 'var(--acc)', fill = true, height = 34, title }) {
  const max = Math.max(1, ...points)
  const step = points.length > 1 ? 220 / (points.length - 1) : 0
  const y = (v) => 30 - (v / max) * 26
  const d = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  return (
    <svg viewBox="0 0 220 34" preserveAspectRatio="none" style={{ width: '100%', height }} {...sparkA11y(title)}>
      {title && <title>{title}</title>}
      {fill && <path d={`${d} L220 34 L0 34 Z`} fill={color} opacity="0.09" />}
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export function SparkBars({ points, color = 'var(--acc)', height = 34, title }) {
  const max = Math.max(1, ...points)
  const w = 220 / points.length
  return (
    <svg viewBox="0 0 220 34" preserveAspectRatio="none" style={{ width: '100%', height }} {...sparkA11y(title)}>
      {title && <title>{title}</title>}
      <g fill={color} opacity="0.6">
        {points.map((v, i) => {
          const h = (v / max) * 28
          return <rect key={i} x={i * w + 2} y={34 - h} width={w - 4} height={h} rx="2" />
        })}
      </g>
    </svg>
  )
}

/**
 * Ticks enteros y "limpios" (pasos de 1, 2, 5, 10, 20, 50…) de 0 hasta cubrir `max`.
 * Los incidentes se cuentan de uno en uno: un eje con 3,75 no significa nada.
 */
export function integerTicks(max, target = 5) {
  const rough = Math.max(1, Math.ceil(max / target))
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const step = [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= rough)
  const top = Math.max(step, Math.ceil(max / step) * step)
  return Array.from({ length: top / step + 1 }, (_, i) => i * step)
}

/** Índices del eje X que llevan etiqueta: como mucho `maxLabels`, contando hacia atrás desde el último. */
function labeledIndexes(count, maxLabels) {
  const every = Math.max(1, Math.ceil(count / maxLabels))
  return new Set(Array.from({ length: count }, (_, i) => i).filter((i) => (count - 1 - i) % every === 0))
}

const plural = (n, unit) => `${n} ${n === 1 ? unit.one : unit.many}`

/** Caja de detalle dentro del SVG: el valor manda, el periodo acompaña. */
function ChartTooltip({ x, y, W, top, bottom, title, lines }) {
  // Ancho a la medida del texto más largo (~6,2 px por carácter a 10,5-12,5 px).
  const longest = Math.max(title.length, ...lines.map((l) => l.text.length + (l.color ? 3 : 0)))
  const width = Math.max(140, longest * 6.2 + 26)
  const height = 24 + lines.length * 17
  const left = x + 14 + width > W - 8 ? x - 14 - width : x + 14
  const boxTop = Math.min(Math.max(y - height / 2, top), bottom - height)
  return (
    <g pointerEvents="none">
      <rect x={left} y={boxTop} width={width} height={height} rx="8" fill="var(--surf)" stroke="var(--line)" />
      <text x={left + 11} y={boxTop + 17} fill="var(--mut)" fontFamily="Manrope, sans-serif" fontSize="10.5" fontWeight="600">
        {title}
      </text>
      {lines.map((line, i) => (
        <g key={line.text}>
          {line.color && (
            <path d={`M${left + 11} ${boxTop + 32 + i * 17}h10`} stroke={line.color} strokeWidth="3" strokeLinecap="round" />
          )}
          <text
            x={left + (line.color ? 27 : 11)}
            y={boxTop + 36 + i * 17}
            fill="var(--ink)"
            fontFamily="IBM Plex Mono, monospace"
            fontSize="12.5"
            fontWeight="700"
          >
            {line.text}
          </text>
        </g>
      ))}
    </g>
  )
}

/** Teclado: Enter o espacio fijan el detalle, Escape lo quita. */
function onChartKey(event, toggle, clear) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    toggle()
  } else if (event.key === 'Escape') {
    clear()
  }
}

function YAxis({ ticks, y, padL, plotW, padT, bottom, title }) {
  return (
    <>
      <g stroke={GRID} strokeWidth="1">
        {ticks.slice(1).map((t) => (
          <path key={t} d={`M${padL} ${y(t)}h${plotW}`} />
        ))}
      </g>
      <path d={`M${padL} ${y(0)}h${plotW}`} stroke="var(--line)" strokeWidth="1" />
      <g fill={AXIS} fontFamily="IBM Plex Mono, monospace" fontSize="10" textAnchor="end">
        {ticks.map((t) => (
          <text key={t} x={padL - 10} y={y(t) + 4}>
            {t}
          </text>
        ))}
      </g>
      <text
        transform={`translate(14 ${(padT + bottom) / 2}) rotate(-90)`}
        textAnchor="middle"
        fill={AXIS}
        fontFamily="Manrope, sans-serif"
        fontSize="10.5"
        fontWeight="700"
      >
        {title}
      </text>
    </>
  )
}

/**
 * Columnas transparentes que reciben el cursor, el clic y el foco: toda la franja del
 * periodo, no solo la marca de unos pocos píxeles.
 */
function HitColumns({ count, left, width, top, bottom, pinned, setHover, setPinned, labelFor }) {
  return Array.from({ length: count }, (_, i) => {
    const toggle = () => setPinned((p) => (p === i ? null : i))
    return (
      <rect
        key={i}
        x={left(i)}
        y={top}
        width={width}
        height={bottom - top}
        fill="transparent"
        style={{ cursor: 'pointer', outline: 'none' }}
        tabIndex={0}
        role="button"
        aria-pressed={pinned === i}
        aria-label={labelFor(i)}
        onPointerEnter={() => setHover(i)}
        onFocus={() => setHover(i)}
        onBlur={() => setHover(null)}
        onClick={toggle}
        onKeyDown={(e) => onChartKey(e, toggle, () => setPinned(null))}
      />
    )
  })
}

function XTitle({ text, x, H }) {
  return text ? (
    <text x={x} y={H - 8} textAnchor="middle" fill={AXIS} fontFamily="Manrope, sans-serif" fontSize="10.5" fontWeight="700">
      {text}
    </text>
  ) : null
}

const INCIDENTS = { one: 'incidente', many: 'incidentes' }

/**
 * Evolución temporal de una serie (sin leyenda: el título la nombra).
 * `data` son `{ label, detail, value }`: `label` va en el eje y `detail` en el recuadro que
 * aparece al pasar el cursor o al hacer clic. El clic fija el detalle; otro clic lo quita.
 */
export function TrendChart({ data, height = 250, yTitle = 'Incidentes', xTitle, unit = INCIDENTS }) {
  const [hover, setHover] = useState(null)
  const [pinned, setPinned] = useState(null)
  const W = 700
  const H = height
  const padL = 58
  const padR = 24
  const padT = 22
  const padB = xTitle ? 52 : 40
  const ticks = integerTicks(Math.max(0, ...data.map((d) => d.value)))
  const max = ticks[ticks.length - 1]
  const plotW = W - padL - padR
  const step = data.length > 1 ? plotW / (data.length - 1) : plotW
  const x = (i) => padL + (data.length === 1 ? plotW / 2 : i * step)
  const y = (v) => padT + (1 - v / max) * (H - padT - padB)
  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)} ${y(d.value)}`).join(' ')
  const labeled = labeledIndexes(data.length, 12)
  const active = hover ?? pinned
  const last = data.length - 1

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%' }}
      onPointerLeave={() => setHover(null)}
    >
      <YAxis ticks={ticks} y={y} padL={padL} plotW={plotW} padT={padT} bottom={y(0)} title={yTitle} />

      <path d={`${line} L${x(last)} ${y(0)} L${x(0)} ${y(0)} Z`} fill="var(--s1)" opacity="0.08" />
      <path d={line} fill="none" stroke="var(--s1)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {active != null && (
        <path d={`M${x(active)} ${padT}V${y(0)}`} stroke="var(--ink)" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
      )}
      <g fill="var(--s1)" stroke="var(--surf)" strokeWidth="2">
        {data.map((d, i) => (
          <circle key={i} cx={x(i)} cy={y(d.value)} r={i === active ? 7 : 4.5} />
        ))}
      </g>
      {active == null && last >= 0 && (
        <text x={x(last)} y={y(data[last].value) - 12} textAnchor="end" fill="var(--ink)" fontFamily="IBM Plex Mono, monospace" fontSize="11" fontWeight="600">
          {data[last].value}
        </text>
      )}

      <g fill={AXIS} fontFamily="Manrope, sans-serif" fontSize="10.5" fontWeight="600" textAnchor="middle">
        {data.map((d, i) =>
          labeled.has(i) ? (
            <text key={i} x={x(i)} y={H - padB + 20}>
              {d.label}
            </text>
          ) : null
        )}
      </g>
      <XTitle text={xTitle} x={padL + plotW / 2} H={H} />

      <HitColumns
        count={data.length}
        left={(i) => x(i) - step / 2}
        width={step}
        top={padT}
        bottom={y(0)}
        pinned={pinned}
        setHover={setHover}
        setPinned={setPinned}
        labelFor={(i) => `${data[i].detail}: ${plural(data[i].value, unit)}`}
      />

      {active != null && data[active] && (
        <ChartTooltip
          x={x(active)}
          y={y(data[active].value)}
          W={W}
          top={padT}
          bottom={y(0)}
          title={data[active].detail}
          lines={[{ text: plural(data[active].value, unit) }]}
        />
      )}
    </svg>
  )
}

/**
 * Dos series agrupadas por periodo. `data` son `{ label, detail, [key]: valor }` y `series`
 * nombra cada una: `[{ key, label, color }, …]`. Cada barra lleva su valor encima y el
 * recuadro de detalle (cursor o clic) muestra el periodo completo.
 */
export function GroupedBars({ data, series, height = 240, yTitle = 'Incidentes', xTitle }) {
  const [hover, setHover] = useState(null)
  const [pinned, setPinned] = useState(null)
  // Más estrecho que la tarjeta: el SVG escala y el texto del eje queda legible.
  const W = 460
  const H = height
  const padL = 54
  const padR = 12
  const padT = 18
  const padB = xTitle ? 50 : 32
  const ticks = integerTicks(Math.max(0, ...data.flatMap((d) => series.map((s) => d[s.key]))))
  const max = ticks[ticks.length - 1]
  const plotW = W - padL - padR
  const groupW = plotW / Math.max(1, data.length)
  const bw = Math.min(22, groupW / 2.6)
  const y = (v) => padT + (1 - v / max) * (H - padT - padB)
  const labeled = labeledIndexes(data.length, 8)
  const active = hover ?? pinned

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%' }}
      onPointerLeave={() => setHover(null)}
    >
      <YAxis ticks={ticks} y={y} padL={padL} plotW={plotW} padT={padT} bottom={y(0)} title={yTitle} />

      {data.map((d, i) => {
        const cx = padL + i * groupW + groupW / 2
        return (
          <g key={i} opacity={active == null || active === i ? 1 : 0.45}>
            {series.map((s, j) => {
              // Barras pegadas al centro del grupo con 2 px de aire entre ellas.
              const bx = j === 0 ? cx - bw - 1 : cx + 1
              const value = d[s.key]
              return (
                <g key={s.key}>
                  {value > 0 && <rect x={bx} y={y(value)} width={bw} height={y(0) - y(value)} rx="4" fill={s.color} />}
                  <text
                    x={bx + bw / 2}
                    y={y(value) - 5}
                    textAnchor="middle"
                    fill="var(--mut)"
                    fontFamily="IBM Plex Mono, monospace"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {value}
                  </text>
                </g>
              )
            })}
            {labeled.has(i) && (
              <text x={cx} y={H - padB + 18} textAnchor="middle" fill={AXIS} fontFamily="Manrope, sans-serif" fontSize="10.5" fontWeight="600">
                {d.label}
              </text>
            )}
          </g>
        )
      })}
      <XTitle text={xTitle} x={padL + plotW / 2} H={H} />

      <HitColumns
        count={data.length}
        left={(i) => padL + i * groupW}
        width={groupW}
        top={padT}
        bottom={y(0)}
        pinned={pinned}
        setHover={setHover}
        setPinned={setPinned}
        labelFor={(i) => `${data[i].detail}: ${series.map((s) => `${s.label} ${data[i][s.key]}`).join(', ')}`}
      />

      {active != null && data[active] && (
        <ChartTooltip
          x={padL + active * groupW + groupW / 2}
          y={(padT + y(0)) / 2}
          W={W}
          top={padT}
          bottom={y(0)}
          title={data[active].detail}
          lines={series.map((s) => ({ text: `${s.label}: ${data[active][s.key]}`, color: s.color }))}
        />
      )}
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
