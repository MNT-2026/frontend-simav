import { mapClusters, mapMarkers } from '../data/mock'

const SEV_COLOR = { alta: 'var(--high)', media: 'var(--med)', baja: 'var(--low)' }
const SEV_RADIUS = { alta: 9, media: 8, baja: 7 }

/**
 * Mapa vectorial de ROADVISION.
 * Todos los colores salen de tokens, así que el mapa cambia con el tema
 * — salvo los marcadores de severidad, que son idénticos en Light, Dark y Night.
 */
export default function RoadMap({
  markers = mapMarkers,
  clusters = mapClusters,
  selected,
  onSelect,
  showRoute = true,
  showLabels = true,
  className = '',
  children,
  style,
}) {
  return (
    <div className={`mapwrap ${className}`} style={style}>
      <svg viewBox="0 0 1200 840" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Mapa de incidentes">
        <rect width="1200" height="840" fill="var(--map-bg)" />

        {/* manzanas verdes y agua */}
        <rect x="80" y="90" width="300" height="190" fill="var(--map-park)" rx="4" />
        <rect x="820" y="560" width="340" height="240" fill="var(--map-park)" rx="4" />
        <path
          d="M-20 700 C180 660 360 740 600 700 C840 660 1000 740 1220 690 L1220 860 L-20 860Z"
          fill="var(--map-water)"
        />

        {/* trama menor */}
        <g stroke="var(--map-road-2)" strokeWidth="3" fill="none">
          <path d="M0 140h1200M0 240h1200M0 440h1200M0 540h1200M0 640h1200M0 760h1200" />
          <path d="M120 0v840M230 0v840M450 0v840M640 0v840M740 0v840M950 0v840M1060 0v840" />
        </g>

        {/* arterias */}
        <g stroke="var(--map-road)" strokeWidth="12" fill="none" strokeLinecap="round">
          <path d="M0 340h1200" />
          <path d="M340 0v840" />
          <path d="M850 0v840" />
          <path d="M0 780 L1200 720" />
        </g>
        <g stroke="var(--map-road)" strokeWidth="6" fill="none" strokeLinecap="round">
          <path d="M0 180 L1200 150" />
          <path d="M560 0v840" />
          <path d="M0 520 L1200 500" />
        </g>

        {showRoute && (
          <path
            d="M60 800 C200 700 280 560 340 440 C400 322 470 300 560 286 C680 268 760 230 850 178 C930 132 1040 110 1180 96"
            fill="none"
            stroke="var(--map-route)"
            strokeWidth="4"
            strokeDasharray="12 9"
            strokeLinecap="round"
            opacity="0.85"
          />
        )}

        {markers.map((m) => {
          const color = SEV_COLOR[m.severity]
          const r = SEV_RADIUS[m.severity]
          const isSel = selected === m.id
          return (
            <g key={m.id} className="marker" onClick={() => onSelect?.(m.id)}>
              <circle cx={m.x} cy={m.y} r={r * 2.6} fill={color} opacity="var(--map-halo)" />
              {isSel && (
                <circle cx={m.x} cy={m.y} r={r + 12} fill="none" stroke="var(--map-route)" strokeWidth="2.5" />
              )}
              <circle
                cx={m.x}
                cy={m.y}
                r={isSel ? r + 4 : r}
                fill={color}
                stroke="var(--map-bg)"
                strokeWidth="2.5"
              />
            </g>
          )
        })}

        {clusters.map((c) => (
          <g key={c.id} className="marker">
            <circle cx={c.x} cy={c.y} r="34" fill={SEV_COLOR[c.severity]} opacity="var(--map-halo)" />
            <circle cx={c.x} cy={c.y} r="24" fill="var(--surf)" stroke="var(--line)" strokeWidth="1.5" />
            <text
              x={c.x}
              y={c.y + 5}
              textAnchor="middle"
              fontFamily="IBM Plex Mono, monospace"
              fontSize="15"
              fontWeight="600"
              fill="var(--acc)"
            >
              {c.count}
            </text>
          </g>
        ))}

        {showLabels && (
          <g
            fill="var(--map-label)"
            fontFamily="Manrope, sans-serif"
            fontSize="12"
            fontWeight="700"
            letterSpacing="1.5"
          >
            <text x="104" y="122">PARQUE NORTE</text>
            <text x="846" y="592">ZONA INDUSTRIAL</text>
            <text x="366" y="322">AV. TRONCAL</text>
            <text x="60" y="742">RÍO ORIENTE</text>
          </g>
        )}
      </svg>
      {children}
    </div>
  )
}

/** Mapa reducido para fichas de detalle: un solo punto con radio de precisión. */
export function MiniMap({ severity = 'alta', style }) {
  return (
    <div className="mapwrap flush" style={{ position: 'relative', ...style }}>
      <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Ubicación exacta">
        <rect width="400" height="240" fill="var(--map-bg)" />
        <rect x="18" y="16" width="110" height="70" fill="var(--map-park)" rx="3" />
        <g stroke="var(--map-road-2)" strokeWidth="2" fill="none">
          <path d="M0 60h400M0 180h400M90 0v240M300 0v240" />
        </g>
        <g stroke="var(--map-road)" strokeWidth="9" fill="none" strokeLinecap="round">
          <path d="M0 122h400" />
          <path d="M196 0v240" />
        </g>
        <g stroke="var(--map-road)" strokeWidth="4.5" fill="none">
          <path d="M0 40 L400 30" />
          <path d="M0 206 L400 214" />
        </g>
        <circle cx="196" cy="122" r="30" fill={SEV_COLOR[severity]} opacity="var(--map-halo)" />
        <circle cx="196" cy="122" r="19" fill="none" stroke="var(--map-route)" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="196" cy="122" r="9" fill={SEV_COLOR[severity]} stroke="var(--surf)" strokeWidth="3" />
        <text x="16" y="230" fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="var(--map-label)">
          200 m
        </text>
      </svg>
    </div>
  )
}

/** Fotograma de evidencia simulado con la caja de detección de la IA. */
export function EvidenceFrame({ confidence = 94, label = 'bache', height = 200 }) {
  return (
    <svg viewBox="0 0 360 200" style={{ width: '100%', height, display: 'block' }} role="img" aria-label="Evidencia">
      <rect width="360" height="200" fill="#7A7E75" />
      <path d="M0 128h360v72H0z" fill="#565A52" />
      <path d="M0 118h360v10H0z" fill="#8B8F86" />
      <g opacity="0.55" stroke="#EDEFE8" strokeWidth="5" strokeDasharray="30 26">
        <path d="M0 170h360" />
      </g>
      <ellipse cx="176" cy="158" rx="52" ry="26" fill="#2E312C" />
      <ellipse cx="176" cy="154" rx="44" ry="20" fill="#1E211D" />
      <rect x="118" y="118" width="118" height="82" fill="none" stroke="var(--acc-bright)" strokeWidth="2.5" rx="3" />
      <rect x="118" y="100" width="104" height="17" fill="var(--acc-bright)" />
      <text x="124" y="113" fontFamily="IBM Plex Mono, monospace" fontSize="11" fontWeight="600" fill="#04091A">
        {label} {confidence}%
      </text>
    </svg>
  )
}
