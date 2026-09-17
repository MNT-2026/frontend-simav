import { useEffect } from 'react'
import {
  Circle,
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import { CITY, fromLeafletBounds } from '../api/geo'

const SEV_RADIUS = { alta: 9, media: 8, baja: 7 }

/**
 * Teselas estándar de OpenStreetMap: gratuitas y sin clave. El mapa es siempre claro,
 * sea cual sea el tema de la plataforma, para que las calles se lean igual en todos.
 */
const TILES = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}

function Tiles() {
  return <TileLayer url={TILES.url} attribution={TILES.attribution} maxZoom={19} />
}

/**
 * Lienzo del mapa. Fija el tema claro solo aquí dentro: marcadores, tooltips y controles
 * de Leaflet toman los tokens claros aunque la plataforma esté en dark o night.
 */
function MapCanvas({ children, ...options }) {
  return (
    <div className="map-canvas" data-theme="light">
      <MapContainer {...options}>{children}</MapContainer>
    </div>
  )
}

/** Avisa del área visible al cargar y después de cada arrastre o zoom. */
function BoundsWatcher({ onChange }) {
  const map = useMapEvents({
    moveend: () => onChange?.(fromLeafletBounds(map.getBounds())),
  })
  useEffect(() => {
    map.whenReady(() => onChange?.(fromLeafletBounds(map.getBounds())))
    // Solo al montar: después manda moveend.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])
  return null
}

/** Leaflet mide el contenedor una vez; si cambia (se abre un panel), hay que avisarle. */
function SizeWatcher() {
  const map = useMap()
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])
  return null
}

/** Centra el mapa en un punto cuando cambia (p. ej. al llegar desde el detalle). */
function FocusOn({ point, zoom = 17 }) {
  const map = useMap()
  const lat = point?.lat
  const lon = point?.lon
  useEffect(() => {
    if (lat != null && lon != null) map.setView([lat, lon], Math.max(map.getZoom(), zoom))
  }, [map, lat, lon, zoom])
  return null
}

/**
 * Mapa interactivo de ROADVISION sobre OpenStreetMap, centrado en Ibagué.
 *
 * `markers` son `{ id, severity, lat, lon, label? }`. Los colores de los marcadores salen
 * de clases CSS (`.sev-alta`…) y no de `pathOptions`, así siguen viniendo de los tokens.
 */
export default function RoadMap({
  markers = [],
  selected,
  onSelect,
  onBoundsChange,
  focus,
  className = '',
  children,
  style,
}) {
  return (
    <div className={`mapwrap ${className}`} style={style}>
      <MapCanvas center={CITY.center} zoom={CITY.zoom} zoomControl={false} minZoom={11}>
        <Tiles />
        <ZoomControl position="bottomright" />
        <SizeWatcher />
        <BoundsWatcher onChange={onBoundsChange} />
        <FocusOn point={focus} />

        {markers.map((m) => {
          const isSel = selected === m.id
          return (
            <CircleMarker
              // Leaflet solo aplica className al crear la capa: al seleccionar se recrea.
              key={`${m.id}:${isSel}`}
              center={[m.lat, m.lon]}
              radius={isSel ? SEV_RADIUS[m.severity] + 4 : SEV_RADIUS[m.severity]}
              pathOptions={{ className: `sev-marker sev-${m.severity}${isSel ? ' sel' : ''}` }}
              eventHandlers={{ click: () => onSelect?.(m.id) }}
            >
              {m.label && (
                <Tooltip direction="top" offset={[0, -8]}>
                  {m.label}
                </Tooltip>
              )}
            </CircleMarker>
          )
        })}
      </MapCanvas>
      {children}
    </div>
  )
}

/** Mapa reducido para fichas de detalle: un solo punto con su radio de precisión. */
export function MiniMap({ lat, lon, severity = 'alta', style }) {
  return (
    <div className="mapwrap flush" style={{ position: 'relative', ...style }}>
      <MapCanvas center={[lat, lon]} zoom={17} scrollWheelZoom={false}>
        <Tiles />
        <SizeWatcher />
        <FocusOn point={{ lat, lon }} />
        <Circle center={[lat, lon]} radius={15} pathOptions={{ className: 'precision' }} />
        <CircleMarker center={[lat, lon]} radius={9} pathOptions={{ className: `sev-marker sev-${severity}` }} />
      </MapCanvas>
    </div>
  )
}

/** Encuadra el recorrido del bus seleccionado cada vez que cambia la selección. */
function FitRoute({ id, path, position }) {
  const map = useMap()
  useEffect(() => {
    const puntos = path?.length ? path : position ? [position] : []
    if (!puntos.length) return
    map.fitBounds(puntos, { padding: [24, 24], maxZoom: 16 })
    // El id basta como dependencia: path y position cambian con él.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, id])
  return null
}

/**
 * Flota sobre el mapa real de Ibagué. `vehicles` son `{ id, status, position: [lat, lon],
 * path: [[lat, lon], …] }`; se dibujan todos los buses y el recorrido del seleccionado.
 */
export function VehicleMap({ vehicles = [], selected, onSelect, className = '', style, children }) {
  const current = vehicles.find((v) => v.id === selected)
  return (
    <div className={`mapwrap ${className}`} style={style}>
      <MapCanvas center={CITY.center} zoom={CITY.zoom} zoomControl={false} minZoom={11}>
        <Tiles />
        <ZoomControl position="bottomright" />
        <SizeWatcher />
        <FitRoute id={current?.id} path={current?.path} position={current?.position} />

        {current?.path?.length > 1 && (
          <Polyline positions={current.path} pathOptions={{ className: 'route-line' }} />
        )}

        {vehicles.map((v) => {
          const isSel = v.id === selected
          const offline = v.status === 'offline'
          return (
            <CircleMarker
              key={`${v.id}:${isSel}`}
              center={v.position}
              radius={isSel ? 10 : 7}
              pathOptions={{ className: `bus-marker${offline ? ' offline' : ''}${isSel ? ' sel' : ''}` }}
              eventHandlers={{ click: () => onSelect?.(v.id) }}
            >
              <Tooltip direction="top" offset={[0, -8]} permanent={isSel}>
                {v.id}
              </Tooltip>
            </CircleMarker>
          )
        })}
      </MapCanvas>
      {children}
    </div>
  )
}

/** Encuadra todas las zonas; sin zonas, deja la ciudad completa. */
function FitPoints({ points, signature }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 1) map.setView(points[0], 15)
    else if (points.length > 1) map.fitBounds(points, { padding: [28, 28], maxZoom: 15 })
    // La firma evita reencuadrar en cada render con el mismo contenido.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, signature])
  return null
}

/**
 * Zonas calientes sobre el mapa real: un círculo por zona, con área proporcional al
 * número de anomalías y el color de su severidad dominante.
 * `hotspots` son `{ id, lat, lon, count, level, label? }`.
 */
export function HotspotMap({ hotspots = [], className = '', style, children }) {
  const max = Math.max(1, ...hotspots.map((h) => h.count))
  const points = hotspots.map((h) => [h.lat, h.lon])
  return (
    <div className={`mapwrap ${className}`} style={style}>
      <MapCanvas center={CITY.center} zoom={CITY.zoom} zoomControl={false} minZoom={11}>
        <Tiles />
        <ZoomControl position="topright" />
        <SizeWatcher />
        <FitPoints points={points} signature={hotspots.map((h) => h.id).join('|')} />
        {hotspots.map((h) => (
          <CircleMarker
            key={h.id}
            center={[h.lat, h.lon]}
            // sqrt: el área, no el radio, es lo que el ojo compara.
            radius={7 + 17 * Math.sqrt(h.count / max)}
            pathOptions={{ className: `sev-marker hotspot sev-${h.level}` }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              {h.label ? `${h.label} · ` : ''}
              {h.count} {h.count === 1 ? 'incidente' : 'incidentes'}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapCanvas>
      {children}
    </div>
  )
}

/**
 * Evidencia de la detección. Con `src` muestra la foto real que subió la app móvil;
 * sin ella, un fotograma simulado con la caja de detección de la IA.
 */
export function EvidenceFrame({ src, confidence = 94, label = 'bache', height = 200 }) {
  if (src) {
    return (
      <div className="evidence-photo" style={{ height }}>
        <img src={src} alt={`Fotografía de ${label}`} loading="lazy" />
        <span className="evidence-label mono">
          {label} {confidence}%
        </span>
      </div>
    )
  }
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
