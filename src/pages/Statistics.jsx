import { useCallback, useMemo, useState } from 'react'
import { GroupedBars, Legend, RankBars, SeverityBar, TrendChart } from '../components/charts'
import { HotspotMap } from '../components/RoadMap'
import { Button, Card, CardHead, EmptyState, ErrorState, Skeleton } from '../components/ui'
import { useFakeExport } from '../components/Toasts'
import { usePlaceNames } from '../api/geocoding'
import { getStatistics } from '../api/statistics'
import { useApi } from '../api/useApi'

const GRAIN = ['Día', 'Semana', 'Mes']
const PERIOD_NOUN = { Día: 'día', Semana: 'semana', Mes: 'mes' }

const SEVERITIES = [
  { id: 'alta', label: 'Alta · requiere acción', color: 'var(--high)' },
  { id: 'media', label: 'Media · programar', color: 'var(--med)' },
  { id: 'baja', label: 'Baja · monitorear', color: 'var(--low)' },
]

// Qué representa el eje X: en semanas, la fecha es el lunes con que empieza cada una.
const X_TITLE = {
  Día: 'Día',
  Semana: 'Semana (fecha del lunes en que inicia)',
  Mes: 'Mes',
}

// Las barras agrupadas se leen bien con pocos grupos; la serie completa ya está arriba.
const BAR_PERIODS = 8
const BAR_SCOPE = {
  Día: (n) => `últimos ${n} días`,
  Semana: (n) => `últimas ${n} semanas`,
  Mes: (n) => `últimos ${n} meses`,
}
const BAR_SERIES = [
  { key: 'potholes', label: 'Baches', color: 'var(--s1)' },
  { key: 'cracks', label: 'Grietas', color: 'var(--s2)' },
  // Gris neutro y no un tercer color de serie: s1/s2 son los únicos validados para daltonismo.
  { key: 'damage', label: 'Daños en vía', color: 'var(--sub)' },
]
// Zonas del ranking (el mapa muestra todas las que devuelve la API).
const TOP_ZONES = 5

export default function Statistics() {
  const exportFile = useFakeExport()
  const [grain, setGrain] = useState('Semana')

  const fetcher = useCallback(({ signal }) => getStatistics({ grain, signal }), [grain])
  const { data, loading, error, reload } = useApi(fetcher, [grain])

  const topZones = useMemo(() => (data?.hotspots ?? []).slice(0, TOP_ZONES), [data])
  const names = usePlaceNames(topZones)

  const toolbar = (
    <div className="row-between">
      <div className="chips" role="tablist" aria-label="Granularidad">
        {GRAIN.map((g) => (
          <button key={g} role="tab" aria-selected={g === grain} className={g === grain ? 'on' : ''} onClick={() => setGrain(g)}>
            {g}
          </button>
        ))}
      </div>
      <span className="filter">
        Ciudad: <b>Ibagué</b>
      </span>
      {data && <span className="filter">{data.rangeLabel}</span>}
      {loading && data && <span className="sub-text">Actualizando…</span>}
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
  )

  if (error) {
    return (
      <main className="content">
        {toolbar}
        <Card style={{ flex: 1, display: 'flex' }}>
          <ErrorState
            title="No pudimos cargar las estadísticas"
            description={error.message}
            code={error.detail}
            onRetry={reload}
          />
        </Card>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="content">
        {toolbar}
        <Card style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Skeleton w="30%" h={16} />
          <Skeleton h={180} />
          <Skeleton w="60%" />
          <Skeleton h={120} />
        </Card>
      </main>
    )
  }

  if (data.total === 0) {
    return (
      <main className="content">
        {toolbar}
        <Card style={{ flex: 1, display: 'flex' }}>
          <EmptyState
            title="Sin incidentes en este periodo"
            description="Cuando los recorridos registren anomalías, aquí verás su evolución, severidad y zonas."
          />
        </Card>
      </main>
    )
  }

  const trend = data.timeline.map((p) => ({ label: p.label, detail: p.detail, value: p.total }))
  const highSeries = data.timeline.map((p) => p.bySeverity.alta)
  const barPeriods = data.timeline.slice(-BAR_PERIODS)
  const bars = barPeriods.map((p) => ({
    label: p.label,
    detail: p.detail,
    potholes: p.byType.Bache ?? 0,
    cracks: p.byType.Grieta ?? 0,
    damage: p.byType['Daño en vía'] ?? 0,
  }))
  const barTotals = {
    potholes: bars.reduce((sum, b) => sum + b.potholes, 0),
    cracks: bars.reduce((sum, b) => sum + b.cracks, 0),
    damage: bars.reduce((sum, b) => sum + b.damage, 0),
  }

  const severities = SEVERITIES.map((s) => ({
    ...s,
    count: data.bySeverity[s.id] ?? 0,
    pct: Math.round(((data.bySeverity[s.id] ?? 0) / data.total) * 1000) / 10,
    sla:
      s.id === 'alta'
        ? `SLA 48 h · ${data.highUnreviewed} sin revisar`
        : s.id === 'media'
          ? 'SLA 15 días'
          : 'Sin SLA',
  }))

  const zones = topZones.map((z, i) => ({
    zone: `${i + 1}. ${truncate(names[z.id] ?? `${z.lat.toFixed(4)}, ${z.lon.toFixed(4)}`, 34)}`,
    count: z.count,
    level: z.level,
  }))
  const mapZones = data.hotspots.map((z) => ({ ...z, label: names[z.id] }))
  const topShare = Math.round((topZones.reduce((sum, z) => sum + z.count, 0) / data.total) * 100)

  return (
    <main className="content">
      {toolbar}

      <div style={{ flex: 1, display: 'flex', gap: 14, minHeight: 300 }}>
        <Card style={{ flex: 1.85, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <CardHead
            title="Evolución de incidentes"
            question={`Incidentes detectados por ${PERIOD_NOUN[grain]} · haz clic en un punto para ver la cantidad`}
          >
            <span className="spacer" />
            <div style={{ textAlign: 'right' }}>
              <div className="mono" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em' }}>
                {data.total}
              </div>
              <Change pct={data.changePct} />
            </div>
          </CardHead>
          <div style={{ flex: 1, minHeight: 0, padding: '4px 8px 8px' }}>
            <TrendChart key={grain} data={trend} yTitle="Incidentes detectados" xTitle={X_TITLE[grain]} />
          </div>
        </Card>

        <Card style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <CardHead title="Severidad detectada" question="¿Qué proporción exige intervención urgente?" />
          <div style={{ padding: '4px 15px 0' }}>
            <SeverityBar items={severities} />
          </div>
          <div style={{ flex: 1, padding: '14px 15px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {severities.map((s) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 11, height: 11, borderRadius: 3, background: s.color, display: 'block' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 12.5 }}>{s.label}</div>
                  <div className="sub-text" style={{ fontSize: 11 }}>
                    {s.sla}
                  </div>
                </div>
                <div className="mono" style={{ fontWeight: 800, fontSize: 16 }}>
                  {s.count}
                </div>
                <div className="mono sub-text" style={{ width: 40, textAlign: 'right' }}>
                  {s.pct}%
                </div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--line-2)', paddingTop: 13, marginTop: 2 }}>
              <div className="card-q" style={{ margin: '0 0 9px' }}>
                Severidad alta por {PERIOD_NOUN[grain]}
              </div>
              <MiniBars values={highSeries} />
            </div>
          </div>
        </Card>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 14, minHeight: 280 }}>
        <Card style={{ flex: 1.15, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <CardHead
            title="Incidentes por tipo"
            question={`Incidentes detectados de cada tipo por ${PERIOD_NOUN[grain]} · ${BAR_SCOPE[grain](bars.length)}`}
          >
            <span className="spacer" />
            <Legend
              items={[
                { label: `Baches · ${barTotals.potholes}`, color: 'var(--s1)' },
                { label: `Grietas · ${barTotals.cracks}`, color: 'var(--s2)' },
                { label: `Daños en vía · ${barTotals.damage}`, color: 'var(--sub)' },
              ]}
            />
          </CardHead>
          <div style={{ flex: 1, minHeight: 0, padding: '4px 8px 8px' }}>
            <GroupedBars
              key={grain}
              data={bars}
              series={BAR_SERIES}
              yTitle="Nº de incidentes"
              xTitle={X_TITLE[grain]}
            />
          </div>
          <div className="sub-text" style={{ fontSize: 11, padding: '0 15px 11px' }}>
            Cada barra es el número de reportes de ese tipo en el {PERIOD_NOUN[grain]}; pasa el cursor o haz clic para ver el
            detalle.
          </div>
        </Card>

        <Card style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <CardHead title="Zonas con mayor concentración" question="¿Dónde debe intervenir primero la cuadrilla?" />
          <div style={{ flex: 1, minHeight: 0, padding: '6px 15px 12px' }}>
            <RankBars data={zones} />
          </div>
          <div className="sub-text" style={{ fontSize: 10.5, padding: '0 15px 11px' }}>
            Celdas de 500 m · nombres de © OpenStreetMap (Nominatim)
          </div>
        </Card>

        <Card style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <CardHead title="Distribución geográfica" question="¿El deterioro está agrupado o disperso?" />
          <HotspotMap
            className="flush"
            style={{ flex: 1, minHeight: 200, borderTop: '1px solid var(--line)' }}
            hotspots={mapZones}
          >
            <div
              className="map-overlay"
              style={{
                left: 12,
                bottom: 12,
                display: 'block',
                background: 'var(--surf)',
                border: '1px solid var(--line)',
                borderRadius: 9,
                padding: '8px 10px',
                fontSize: 10.5,
                fontWeight: 700,
                color: 'var(--mut)',
                lineHeight: 1.7,
              }}
            >
              Las {topZones.length} zonas principales concentran
              <br />
              el {topShare}% de los incidentes del periodo.
            </div>
          </HotspotMap>
        </Card>
      </div>
    </main>
  )
}

/** Variación frente a la ventana anterior. Subir es malo: más deterioro detectado. */
function Change({ pct }) {
  if (pct == null) {
    return (
      <div className="sub-text" style={{ fontSize: 11, fontWeight: 700 }}>
        Sin datos del periodo anterior
      </div>
    )
  }
  const up = pct > 0
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: up ? 'var(--high-ink)' : 'var(--low-ink)' }}>
      {up ? '↑' : pct < 0 ? '↓' : '='} {Math.abs(pct).toFixed(1)}% vs. periodo anterior
    </div>
  )
}

function MiniBars({ values }) {
  const max = Math.max(1, ...values)
  const step = 320 / values.length
  return (
    <svg viewBox="0 0 320 76" style={{ width: '100%', height: 76 }} aria-hidden="true">
      <path d="M0 70h320" stroke="var(--line)" />
      <g fill="var(--high)">
        {values.map((v, i) => {
          const h = (v / max) * 60
          return <rect key={i} x={i * step + step * 0.15} y={70 - h} width={step * 0.7} height={h} rx="3" />
        })}
      </g>
    </svg>
  )
}

function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}
