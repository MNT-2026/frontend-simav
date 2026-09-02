import { useNavigate, useParams } from 'react-router-dom'
import Icon from '../components/Icon'
import { MiniMap } from '../components/RoadMap'
import { Button, Card, ErrorState, SeverityBadge, StatusBadge } from '../components/ui'
import { useFakeExport, useToasts } from '../components/Toasts'
import { incidentTimeline, incidents } from '../data/mock'

const DEFAULT_TIMELINE = [
  { key: 'detectado', label: 'Detectado', when: '—', who: 'IA ROADVISION', done: true },
  { key: 'revisado', label: 'Revisado', when: 'Pendiente', who: '' },
  { key: 'seguimiento', label: 'En seguimiento', when: 'Pendiente', who: '' },
  { key: 'atendido', label: 'Atendido', when: 'Pendiente · SLA 48 h', who: '' },
]

export default function IncidentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const exportFile = useFakeExport()
  const { push } = useToasts()

  const incident = incidents.find((i) => i.id === id)

  if (!incident) {
    return (
      <main className="content">
        <Card style={{ flex: 1, display: 'flex' }}>
          <ErrorState
            title="No encontramos ese incidente"
            description={`El identificador ${id} no existe o fue eliminado del registro.`}
            code="error 404 · svc-incidents"
            onRetry={() => navigate('/incidentes')}
          />
        </Card>
      </main>
    )
  }

  const steps = incidentTimeline[incident.id] ?? DEFAULT_TIMELINE

  return (
    <main className="content">
      <div className="row-between">
        <Button onClick={() => navigate(-1)} aria-label="Volver">
          <Icon name="chevronLeft" size={16} strokeWidth={2.4} />
        </Button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.03em' }}>
              {incident.type} en calzada · {incident.location}
            </span>
            <SeverityBadge value={incident.severity} />
            <StatusBadge value={incident.status} />
          </div>
          <div className="mono sub-text" style={{ fontSize: 12, marginTop: 4 }}>
            {incident.id} · detectado el {incident.date} · {incident.route}
          </div>
        </div>
        <span className="spacer" />
        <Button icon="download" onClick={() => exportFile('la ficha en PDF', incident.id)}>
          Exportar ficha PDF
        </Button>
        <Button onClick={() => push({ tone: 'success', title: 'Cuadrilla asignada', desc: 'Cuadrilla Norte 2 · SLA 48 h' })}>
          Asignar cuadrilla
        </Button>
        <Button
          variant="primary"
          onClick={() => push({ tone: 'success', title: `${incident.id} marcado como atendido` })}
        >
          Marcar como atendido
        </Button>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 14, minHeight: 0 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 320 }}>
            <div className="card-head">
              <span className="card-title">Evidencia visual</span>
              <span className="sub-text">
                Fotograma 1 de 3 · {incident.camera} · {incident.date}
              </span>
              <span className="spacer" />
              <Button size="sm">Ver original</Button>
              <Button size="sm">Descargar</Button>
            </div>
            <div style={{ flex: 1, position: 'relative', background: '#4E524B', minHeight: 0 }}>
              <svg
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                viewBox="0 0 800 420"
                preserveAspectRatio="xMidYMid slice"
                role="img"
                aria-label={`Fotograma de ${incident.type}`}
              >
                <rect width="800" height="420" fill="#7A7E75" />
                <path d="M0 250h800v170H0z" fill="#5F635B" />
                <path d="M0 236h800v14H0z" fill="#9AA093" />
                <path d="M0 90h800v146H0z" fill="#8E9289" />
                <g opacity="0.5" stroke="#EDEFE8" strokeWidth="7" strokeDasharray="46 40">
                  <path d="M0 340h800" />
                </g>
                <ellipse cx="392" cy="312" rx="118" ry="58" fill="#3A3D37" />
                <ellipse cx="392" cy="304" rx="98" ry="44" fill="#252823" />
                <ellipse cx="372" cy="298" rx="54" ry="22" fill="#171A16" />
                <rect x="258" y="240" width="272" height="146" fill="none" stroke="var(--acc-bright)" strokeWidth="3" rx="4" />
                <rect x="258" y="212" width="196" height="28" fill="var(--acc-bright)" rx="3" />
                <text x="268" y="232" fontFamily="IBM Plex Mono, monospace" fontSize="15" fontWeight="600" fill="#04091A">
                  {incident.type.toLowerCase()} · {incident.confidence}%
                </text>
                <g stroke="var(--acc-bright)" strokeWidth="2" opacity="0.55">
                  <path d="M258 240h-40M530 386h40" />
                </g>
                <text x="556" y="392" fontFamily="IBM Plex Mono, monospace" fontSize="13" fill="var(--acc-bright)">
                  ≈ 78 cm
                </text>
              </svg>
              <div className="mono" style={{ position: 'absolute', right: 14, top: 14, background: 'rgba(6,10,18,.72)', color: '#fff', borderRadius: 7, padding: '5px 9px', fontSize: 11, fontWeight: 600 }}>
                {incident.lat}, {incident.lon}
              </div>
            </div>
          </Card>

          <Card>
            <div className="card-head">
              <span className="card-title">Seguimiento del incidente</span>
              <span className="spacer" />
              <span className="sub-text">Tiempo transcurrido: 6 h 12 min</span>
            </div>
            <div className="timeline">
              {steps.map((s, i) => (
                <div
                  key={s.key}
                  className={`step ${s.done ? 'done' : ''} ${s.current ? 'current' : ''}`}
                  style={i === steps.length - 1 ? { flex: '0 0 200px' } : undefined}
                >
                  {i < steps.length - 1 && <div className="line" />}
                  <div className="dotv">
                    {s.done ? (
                      <Icon name="check" size={13} strokeWidth={3.2} />
                    ) : s.current ? (
                      <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'currentColor', display: 'block' }} />
                    ) : null}
                  </div>
                  <div className="slab" style={!s.done && !s.current ? { color: 'var(--sub)' } : undefined}>
                    {s.label}
                  </div>
                  <div className="sdate">
                    {s.when}
                    {s.who ? ` · ${s.who}` : ''}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ flex: '0 0 396px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
          <Card>
            <div className="card-head">
              <span className="card-title">Información del incidente</span>
            </div>
            <Row k="Tipo" v={incident.type} />
            <Row k="Severidad" v={<span style={{ color: 'var(--high-ink)' }}>Alta</span>} hide={incident.severity !== 'alta'} />
            <Row k="Severidad" v={incident.severity} hide={incident.severity === 'alta'} />
            <Row
              k="Confianza IA"
              v={
                <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ width: 70, height: 6, background: 'var(--line)', borderRadius: 3, display: 'block', overflow: 'hidden' }}>
                    <span style={{ display: 'block', width: `${incident.confidence}%`, height: '100%', background: 'var(--acc)' }} />
                  </span>
                  <span className="mono">{incident.confidence}%</span>
                </span>
              }
            />
            <Row k="Fecha y hora" v={incident.date} mono />
            <Row k="Cámara" v={incident.camera} mono />
            <Row k="Vehículo" v={incident.vehicle} mono />
            <Row k="Ruta" v={incident.route} />
            <Row k="Latitud" v={incident.lat.toFixed(6)} mono />
            <Row k="Longitud" v={incident.lon.toFixed(6)} mono />
            <Row k="Dirección" v={incident.location} last />
          </Card>

          <Card style={{ flex: 1, minHeight: 200, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="card-head">
              <span className="card-title">Ubicación exacta</span>
              <span className="spacer" />
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/mapa') }} style={{ fontSize: 11.5 }}>
                Abrir en el mapa
              </a>
            </div>
            <MiniMap severity={incident.severity} style={{ flex: 1, minHeight: 0 }} />
            <div style={{ padding: '11px 15px', borderTop: '1px solid var(--line)', display: 'flex', gap: 8 }}>
              <Button
                style={{ flex: 1 }}
                onClick={() => {
                  navigator.clipboard?.writeText(`${incident.lat}, ${incident.lon}`)
                  push({ tone: 'success', title: 'Coordenadas copiadas', desc: `${incident.lat}, ${incident.lon}` })
                }}
              >
                Copiar coordenadas
              </Button>
              <Button style={{ flex: 1 }} onClick={() => navigate('/mapa')}>
                Ver ruta completa
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}

function Row({ k, v, mono, last, hide }) {
  if (hide) return null
  return (
    <div className="kv" style={last ? { borderBottom: 'none' } : undefined}>
      <span className="k">{k}</span>
      <span className={`v ${mono ? 'mono' : ''}`}>{v}</span>
    </div>
  )
}
