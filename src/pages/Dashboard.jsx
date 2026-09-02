import { useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import RoadMap from '../components/RoadMap'
import { Sparkline, SparkBars } from '../components/charts'
import { Button, Card, ErrorState, SeverityBadge, Skeleton } from '../components/ui'
import { useFakeExport } from '../components/Toasts'
import { countIncidents, listIncidents } from '../api/incidents'
import { CITY_BOUNDS, toBoundsParams, toCanvas } from '../api/projection'
import { useApi } from '../api/useApi'
import { criticalTrend, vehicles, weeklyTrend } from '../data/mock'

const SEVERITY_COLOR = { alta: 'var(--high)', media: 'var(--med)', baja: 'var(--low)' }
const SEVERITY_LABEL = { alta: 'Alta', media: 'Media', baja: 'Baja' }

export default function Dashboard() {
  const navigate = useNavigate()
  const exportFile = useFakeExport()

  const fetcher = useCallback(async ({ signal }) => {
    const [total, potholes, cracks, high, medium, low, recent, onMap] = await Promise.all([
      countIncidents({ signal }),
      countIncidents({ type: 'Bache', signal }),
      countIncidents({ type: 'Grieta', signal }),
      countIncidents({ severity: 'alta', signal }),
      countIncidents({ severity: 'media', signal }),
      countIncidents({ severity: 'baja', signal }),
      listIncidents({ limit: 5, signal }),
      listIncidents({ bounds: toBoundsParams(CITY_BOUNDS), limit: 100, signal }),
    ])
    return {
      total,
      potholes,
      cracks,
      severities: { alta: high, media: medium, baja: low },
      recent: recent.items,
      markers: onMap.items.map((i) => ({
        id: i.id,
        severity: i.severity,
        ...toCanvas({ lat: i.lat, lon: i.lon }),
      })),
    }
  }, [])
  const { data, loading, error, reload } = useApi(fetcher, [])

  if (error) {
    return (
      <main className="content">
        <Card style={{ flex: 1, display: 'flex' }}>
          <ErrorState
            title="No pudimos cargar el panel"
            description={error.message}
            code={error.detail}
            onRetry={reload}
          />
        </Card>
      </main>
    )
  }

  const trend = weeklyTrend.map((w) => w.value)

  return (
    <main className="content">
      <div className="row-between">
        <div className="sub-text" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--low)', display: 'block' }} />
          Datos en vivo desde la API
        </div>
        <span className="spacer" />
        <Button icon="refresh" onClick={reload}>
          Actualizar
        </Button>
        <Button
          variant="primary"
          icon="download"
          onClick={() => exportFile('la exportación en Excel', `${data?.total ?? 0} incidentes`)}
        >
          Exportar Excel
        </Button>
      </div>

      {loading ? <KpiSkeleton /> : <KpiRow data={data} trend={trend} />}

      <div className="dashboard-main" style={{ flex: 1, display: 'flex', gap: 14, minHeight: 420 }}>
        <RoadMap
          style={{ flex: 1, minWidth: 0 }}
          markers={data?.markers ?? []}
          onSelect={(id) => navigate(`/incidentes/${id}`)}
        >
          <div className="map-overlay" style={{ top: 12, right: 12 }}>
            <Link to="/mapa" className="gchip">
              <Icon name="map" size={14} strokeWidth={1.9} />
              Abrir mapa completo
            </Link>
          </div>
          <div className="legend">
            <div className="sect" style={{ padding: 0 }}>
              Severidad
            </div>
            {Object.entries(SEVERITY_LABEL).map(([id, label]) => (
              <div key={id} className="legend-row">
                <i style={{ background: SEVERITY_COLOR[id] }} />
                {label} · {data?.severities[id] ?? 0}
              </div>
            ))}
          </div>
        </RoadMap>

        <div className="dashboard-side" style={{ flex: '0 0 330px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
          <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            <div className="card-head">
              <span className="card-title">Incidentes recientes</span>
              <span className="spacer" />
              {data && (
                <span className="badge high">
                  <i />
                  {data.severities.alta} críticos
                </span>
              )}
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              {loading
                ? Array.from({ length: 5 }, (_, i) => (
                    <div key={i} style={{ padding: '12px 14px', borderBottom: '1px solid var(--line-2)' }}>
                      <Skeleton w="60%" />
                      <Skeleton w="85%" style={{ marginTop: 8 }} />
                    </div>
                  ))
                : data.recent.map((it) => (
                    <button
                      key={it.id}
                      onClick={() => navigate(`/incidentes/${it.id}`)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        border: 0,
                        borderBottom: '1px solid var(--line-2)',
                        background: 'transparent',
                        padding: '10px 14px',
                        display: 'flex',
                        gap: 10,
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Thumb type={it.type} />
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="mono sub-text" style={{ fontSize: 11 }}>
                            {it.shortId}
                          </span>
                          <SeverityBadge value={it.severity} />
                        </span>
                        <span style={{ display: 'block', fontWeight: 700, fontSize: 12.5, marginTop: 2 }}>
                          {it.type}
                        </span>
                        <span className="sub-text" style={{ display: 'block', fontSize: 10.5 }}>
                          {it.date} · IA {it.confidence}%
                        </span>
                      </span>
                    </button>
                  ))}
            </div>
            <div style={{ padding: '10px 14px', borderTop: '1px solid var(--line)' }}>
              <Link to="/incidentes">Ver los {data?.total ?? 0} incidentes →</Link>
            </div>
          </Card>

          <Card>
            <div className="card-head">
              <span className="card-title">Flota en ruta</span>
              <span className="spacer" />
              <span className="sub-text" style={{ fontSize: 10.5 }}>
                datos de demostración
              </span>
            </div>
            {vehicles.slice(0, 3).map((v) => (
              <div
                key={v.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 14px',
                  borderBottom: '1px solid var(--line-2)',
                }}
              >
                <span className="mono" style={{ fontWeight: 700 }}>
                  {v.id}
                </span>
                <span className="sub-text">{v.route}</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: v.status === 'transmitiendo' ? 'var(--low-ink)' : 'var(--med-ink)',
                  }}
                >
                  <i
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      display: 'block',
                      background: v.status === 'transmitiendo' ? 'var(--low)' : 'var(--med)',
                    }}
                  />
                  {v.status === 'transmitiendo' ? 'Transmitiendo' : 'Señal débil'}
                </span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </main>
  )
}

function KpiRow({ data, trend }) {
  const share = (n) => (data.total ? `${Math.round((n / data.total) * 100)}% del total` : 'Sin datos')
  return (
    <div className="kpis">
      <Kpi icon="incident" label="Incidentes totales" value={String(data.total)}>
        <Sparkline points={trend} color="var(--s1)" />
      </Kpi>
      <Kpi icon="pothole" label="Baches" value={String(data.potholes)} note={share(data.potholes)}>
        <SparkBars points={[16, 13, 19, 15, 22, 18, 25, 21, 28]} color="var(--s1)" />
      </Kpi>
      <Kpi icon="crack" label="Grietas" value={String(data.cracks)} note={share(data.cracks)}>
        <SparkBars points={[24, 20, 22, 17, 19, 14, 16, 12, 13]} color="var(--s2)" />
      </Kpi>
      <Kpi
        critical
        icon="incident"
        label="Críticos · requieren acción"
        value={String(data.severities.alta)}
        valueColor="var(--high-ink)"
        note={share(data.severities.alta)}
      >
        <Sparkline points={criticalTrend} color="var(--high)" />
      </Kpi>
      <Kpi icon="km" label="Kilómetros analizados" value="35.7" unit="km" note="dato de demostración">
        <Sparkline points={[28, 25, 26, 21, 23, 17, 15, 12, 10].reverse()} color="var(--acc)" fill={false} />
      </Kpi>
      <Kpi icon="camera" label="Cámaras activas" value="8" unit="/ 10" note="dato de demostración" />
    </div>
  )
}

function Kpi({ icon, label, value, unit, note, valueColor, critical, children }) {
  return (
    <div className={`kpi ${critical ? 'critical' : ''}`}>
      <div className="kpi-top" style={critical ? { color: 'var(--high-ink)' } : undefined}>
        <Icon name={icon} size={15} />
        <span className="kpi-label">{label}</span>
      </div>
      <div className="kpi-value mono" style={valueColor ? { color: valueColor } : undefined}>
        {value} {unit && <small>{unit}</small>}
      </div>
      <div className="kpi-delta">{note && <span className="sub-text">{note}</span>}</div>
      {children && <div className="kpi-spark">{children}</div>}
    </div>
  )
}

function KpiSkeleton() {
  return (
    <div className="kpis">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="kpi">
          <Skeleton w="58%" />
          <Skeleton w="40%" h={24} style={{ marginTop: 12 }} />
          <Skeleton w="70%" style={{ marginTop: 12 }} />
        </div>
      ))}
    </div>
  )
}

function Thumb({ type }) {
  return (
    <svg width="42" height="42" viewBox="0 0 42 42" style={{ borderRadius: 8, flex: '0 0 42px' }} aria-hidden="true">
      <rect width="42" height="42" fill="#8E9188" />
      <path d="M0 30h42v12H0z" fill="#6E7269" />
      {type === 'Bache' ? (
        <ellipse cx="20" cy="27" rx="10" ry="6" fill="#3A3D37" />
      ) : (
        <path d="M8 4 16 20l-6 5 9 6-4 7" stroke="#3A3D37" strokeWidth="2.5" fill="none" />
      )}
    </svg>
  )
}
