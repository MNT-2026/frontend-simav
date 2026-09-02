import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import RoadMap from '../components/RoadMap'
import { Sparkline, SparkBars } from '../components/charts'
import { Button, Card, Delta, SeverityBadge, Skeleton } from '../components/ui'
import { useFakeExport } from '../components/Toasts'
import { criticalTrend, incidents, kpis, severityBreakdown, vehicles, weeklyTrend } from '../data/mock'

const PERIODS = ['Hoy', '7 días', '30 días', 'Personalizado']

export default function Dashboard() {
  const navigate = useNavigate()
  const exportFile = useFakeExport()
  const [period, setPeriod] = useState('7 días')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 550)
    return () => clearTimeout(t)
  }, [period])

  const recent = incidents.slice(0, 5)
  const trend = weeklyTrend.map((w) => w.value)

  return (
    <main className="content">
      <div className="row-between">
        <div className="chips" role="tablist" aria-label="Periodo">
          {PERIODS.map((p) => (
            <button key={p} role="tab" aria-selected={p === period} className={p === period ? 'on' : ''} onClick={() => setPeriod(p)}>
              {p}
            </button>
          ))}
        </div>
        <div className="sub-text" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--low)', display: 'block' }} />
          Datos actualizados hace 2 min · Ruta troncal Norte–Centro
        </div>
        <span className="spacer" />
        <Button icon="filter">Filtros</Button>
        <Button variant="primary" icon="download" onClick={() => exportFile('la exportación en Excel', '147 incidentes · 12 columnas')}>
          Exportar Excel
        </Button>
      </div>

      {loading ? <KpiSkeleton /> : <KpiRow trend={trend} />}

      <div className="dashboard-main" style={{ flex: 1, display: 'flex', gap: 14, minHeight: 420 }}>
        <RoadMap style={{ flex: 1, minWidth: 0 }} onSelect={(id) => navigate(`/incidentes/${id}`)}>
          <div className="map-overlay" style={{ top: 12, left: 12 }}>
            <div className="gchip" style={{ width: 230, color: 'var(--sub)', fontWeight: 600 }}>
              <Icon name="search" size={14} strokeWidth={1.9} />
              Buscar ubicación o ruta…
            </div>
            <span className="gchip">
              <i style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--high)' }} />
              Alta
            </span>
            <span className="gchip">
              <i style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--med)' }} />
              Media
            </span>
            <span className="gchip off">
              <i style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--low)' }} />
              Baja
            </span>
          </div>
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
            {severityBreakdown.map((s) => (
              <div key={s.id} className="legend-row">
                <i style={{ background: s.color }} />
                {s.label.split(' · ')[0]} · {s.count}
              </div>
            ))}
          </div>
          <div className="zoom">
            <button aria-label="Acercar">+</button>
            <button aria-label="Alejar">−</button>
          </div>
        </RoadMap>

        <div className="dashboard-side" style={{ flex: '0 0 330px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
          <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            <div className="card-head">
              <span className="card-title">Incidentes recientes</span>
              <span className="spacer" />
              <span className="badge high">
                <i />
                {kpis.criticalUnreviewed} nuevos
              </span>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              {recent.map((it) => (
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
                        {it.id}
                      </span>
                      <SeverityBadge value={it.severity} />
                    </span>
                    <span style={{ display: 'block', fontWeight: 700, fontSize: 12.5, marginTop: 2 }}>
                      {it.type} · {it.location}
                    </span>
                    <span className="sub-text" style={{ display: 'block', fontSize: 10.5 }}>
                      {it.camera} · {it.vehicle} · {it.date} · IA {it.confidence}%
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <div style={{ padding: '10px 14px', borderTop: '1px solid var(--line)' }}>
              <Link to="/incidentes">Ver los {kpis.total} incidentes →</Link>
            </div>
          </Card>

          <Card>
            <div className="card-head">
              <span className="card-title">Flota en ruta</span>
              <span className="spacer" />
              <span className="mono sub-text">
                {vehicles.filter((v) => v.status === 'transmitiendo').length} / {vehicles.length} activos
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

function KpiRow({ trend }) {
  return (
    <div className="kpis">
      <Kpi icon="incident" label="Incidentes totales" value="147" delta={12.4} invert note="vs. periodo anterior">
        <Sparkline points={trend} color="var(--s1)" />
      </Kpi>
      <Kpi icon="pothole" label="Baches" value="82" delta={8.1} invert note="56% del total">
        <SparkBars points={[16, 13, 19, 15, 22, 18, 25, 21, 28]} color="var(--s1)" />
      </Kpi>
      <Kpi icon="crack" label="Grietas" value="65" delta={-3.2} invert note="44% del total">
        <SparkBars points={[24, 20, 22, 17, 19, 14, 16, 12, 13]} color="var(--s2)" />
      </Kpi>
      <Kpi critical icon="incident" label="Críticos · requieren acción" value="23" valueColor="var(--high-ink)" badge>
        <Sparkline points={criticalTrend} color="var(--high)" />
      </Kpi>
      <Kpi icon="km" label="Kilómetros analizados" value="35.7" unit="km" delta={5.6} note="4.1 inc./km">
        <Sparkline points={[28, 25, 26, 21, 23, 17, 15, 12, 10].reverse()} color="var(--acc)" fill={false} />
      </Kpi>
      <Kpi icon="camera" label="Cámaras activas" value="8" unit="/ 10" cameras />
    </div>
  )
}

function Kpi({ icon, label, value, unit, delta, invert, note, valueColor, critical, badge, cameras, children }) {
  return (
    <div className={`kpi ${critical ? 'critical' : ''}`}>
      <div className="kpi-top" style={critical ? { color: 'var(--high-ink)' } : undefined}>
        <Icon name={icon} size={15} />
        <span className="kpi-label">{label}</span>
      </div>
      <div className="kpi-value mono" style={valueColor ? { color: valueColor } : undefined}>
        {value} {unit && <small>{unit}</small>}
      </div>
      <div className="kpi-delta">
        {delta != null && <Delta value={delta} invert={invert} />}
        {badge && (
          <>
            <span className="badge high">
              <i />
              Severidad alta
            </span>
            <span className="sub-text">9 sin revisar</span>
          </>
        )}
        {cameras && (
          <>
            <span className="badge med">
              <i />1 advertencia
            </span>
            <span className="badge high">
              <i />1 offline
            </span>
          </>
        )}
        {note && <span className="sub-text">{note}</span>}
      </div>
      {children && <div className="kpi-spark">{children}</div>}
      {cameras && (
        <div style={{ position: 'absolute', left: 14, right: 14, bottom: 16, display: 'flex', gap: 3 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                background: i < 8 ? 'var(--low)' : i === 8 ? 'var(--med)' : 'var(--line)',
              }}
            />
          ))}
        </div>
      )}
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
