import { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import RoadMap, { EvidenceFrame } from '../components/RoadMap'
import { Button, ErrorState, SeverityBadge, StatusBadge } from '../components/ui'
import { useToasts } from '../components/Toasts'
import { getIncident, listIncidents, updateIncidentStatus } from '../api/incidents'
import { CITY, CITY_BOUNDS, toBoundsParams } from '../api/geo'
import { useApi } from '../api/useApi'

const FILTERS = [
  { id: 'alta', label: 'Alta', color: 'var(--high)' },
  { id: 'media', label: 'Media', color: 'var(--med)' },
  { id: 'baja', label: 'Baja', color: 'var(--low)' },
]
const SEVERITY_LABEL = { alta: 'Alta', media: 'Media', baja: 'Baja' }

/** Máximo que admite la API por página; el área visible rara vez tiene más. */
const MAP_PAGE_SIZE = 100

export default function MapPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { push } = useToasts()
  const focusId = location.state?.focus ?? null
  const [active, setActive] = useState(['alta', 'media', 'baja'])
  const [selected, setSelected] = useState(focusId)
  const [saving, setSaving] = useState(false)
  // Área visible del mapa; hasta que Leaflet la informe se usa la cobertura de la ciudad.
  const [bounds, setBounds] = useState(CITY_BOUNDS)

  // Al llegar desde el detalle de un incidente se centra el mapa en él.
  const focusFetcher = useCallback(
    ({ signal }) => (focusId ? getIncident(focusId, { signal }) : Promise.resolve(null)),
    [focusId]
  )
  const { data: focusIncident } = useApi(focusFetcher, [focusId])

  // Una consulta por área visible; el filtro de severidad se aplica sobre lo ya traído
  // para que apagar una chincheta no dispare otra petición.
  const fetcher = useCallback(
    ({ signal }) => listIncidents({ bounds: toBoundsParams(bounds), limit: MAP_PAGE_SIZE, signal }),
    [bounds]
  )
  const { data, loading, error, reload } = useApi(fetcher, [bounds])

  const incidents = useMemo(() => data?.items ?? [], [data])

  const counts = useMemo(() => {
    const table = { alta: 0, media: 0, baja: 0 }
    for (const i of incidents) table[i.severity] = (table[i.severity] ?? 0) + 1
    return table
  }, [incidents])

  const markers = useMemo(
    () =>
      incidents
        .filter((i) => active.includes(i.severity))
        .map((i) => ({
          id: i.id,
          severity: i.severity,
          lat: i.lat,
          lon: i.lon,
          label: `${i.type} · ${SEVERITY_LABEL[i.severity] ?? i.severity}`,
        })),
    [incidents, active]
  )

  const incident = incidents.find((i) => i.id === selected) ?? null

  const toggle = (id) =>
    setActive((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]))

  const markAsReviewed = async () => {
    setSaving(true)
    try {
      await updateIncidentStatus(incident.id, 'revisado')
      reload()
      push({ tone: 'success', title: `${incident.shortId} marcado como revisado` })
    } catch (err) {
      push({ tone: 'high', title: 'No se pudo cambiar el estado', desc: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (error) {
    return (
      <main className="content">
        <ErrorState
          title="No pudimos cargar el mapa"
          description={error.message}
          code={error.detail}
          onRetry={reload}
        />
      </main>
    )
  }

  return (
    <main style={{ flex: 1, minWidth: 0, position: 'relative', display: 'flex' }}>
      <RoadMap
        className="flush"
        style={{ flex: 1 }}
        markers={markers}
        selected={selected}
        onSelect={setSelected}
        onBoundsChange={setBounds}
        focus={focusIncident}
      >
        <div className="map-overlay" style={{ top: 14, left: 14 }}>
          <span className="gchip on">
            <Icon name="filter" size={14} strokeWidth={1.8} />
            {active.length} de 3 severidades
          </span>
          {FILTERS.map((f) => {
            const on = active.includes(f.id)
            return (
              <button key={f.id} className={`gchip ${on ? '' : 'off'}`} onClick={() => toggle(f.id)} aria-pressed={on}>
                <i style={{ width: 8, height: 8, borderRadius: '50%', background: f.color, display: 'block' }} />
                {f.label} · {counts[f.id] ?? 0}
              </button>
            )
          })}
        </div>

        <div
          className="map-stats"
          style={{
            position: 'absolute',
            left: 14,
            bottom: 14,
            background: 'var(--surf)',
            border: '1px solid var(--line)',
            borderRadius: 11,
            padding: '11px 13px',
            display: 'flex',
            gap: 22,
            alignItems: 'center',
            boxShadow: 'var(--shadow)',
          }}
        >
          <Stat label="CIUDAD" value={CITY.name} />
          <Stat
            label="ÁREA VISIBLE"
            value={`${bounds.minLatitude.toFixed(3)}, ${bounds.minLongitude.toFixed(3)} → ${bounds.maxLatitude.toFixed(3)}, ${bounds.maxLongitude.toFixed(3)}`}
            mono
          />
          <Stat
            label="INCIDENTES"
            value={
              loading
                ? '…'
                : data && data.total > incidents.length
                  ? `${markers.length} de ${data.total}`
                  : String(markers.length)
            }
            mono
          />
          <span style={{ width: 1, height: 34, background: 'var(--line)' }} />
          <span className="mono sub-text" style={{ fontSize: 11 }}>
            Filtrado por área visible
          </span>
        </div>
      </RoadMap>

      {incident && (
        <aside className="side-panel">
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div className="mono sub-text" style={{ fontSize: 11 }}>
                {incident.shortId}
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 3 }}>
                {incident.type}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <SeverityBadge value={incident.severity} />
                <StatusBadge value={incident.status} />
              </div>
            </div>
            <button className="iconbtn" onClick={() => setSelected(null)} aria-label="Cerrar panel">
              <Icon name="close" size={15} strokeWidth={2.2} />
            </button>
          </div>

          <div style={{ padding: '14px 16px' }}>
            <div style={{ borderRadius: 11, overflow: 'hidden', border: '1px solid var(--line)', position: 'relative' }}>
              <EvidenceFrame confidence={incident.confidence} label={incident.type.toLowerCase()} />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginTop: 14,
                padding: '10px 12px',
                background: 'var(--surf-2)',
                border: '1px solid var(--line)',
                borderRadius: 10,
              }}
            >
              <div style={{ flex: 1 }}>
                <div className="sub-text" style={{ fontSize: 11 }}>
                  Confianza del modelo
                </div>
                <div style={{ height: 6, background: 'var(--line)', borderRadius: 3, marginTop: 7, overflow: 'hidden' }}>
                  <span style={{ display: 'block', width: `${incident.confidence}%`, height: '100%', background: 'var(--acc)' }} />
                </div>
              </div>
              <div className="mono" style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>
                {incident.confidence}%
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--line)' }}>
            <Row k="Tipo" v={incident.type} />
            <Row k="Detectado" v={incident.date} mono />
            <Row k="Recorrido" v={incident.inspectionId.slice(0, 8).toUpperCase()} mono />
            <Row k="Coordenadas" v={`${incident.lat}, ${incident.lon}`} mono last />
          </div>

          <div style={{ marginTop: 'auto', padding: '14px 16px', borderTop: '1px solid var(--line)', display: 'flex', gap: 8 }}>
            <Button variant="primary" style={{ flex: 1 }} onClick={() => navigate(`/incidentes/${incident.id}`)}>
              Ver detalle completo
            </Button>
            {incident.status === 'nuevo' && (
              <Button loading={saving} onClick={markAsReviewed}>
                Marcar revisado
              </Button>
            )}
          </div>
        </aside>
      )}
    </main>
  )
}

function Stat({ label, value, mono }) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--sub)', fontWeight: 800 }}>{label}</div>
      <div className={mono ? 'mono' : ''} style={{ fontWeight: 800, fontSize: 13, marginTop: 3 }}>
        {value}
      </div>
    </div>
  )
}

function Row({ k, v, mono, last }) {
  return (
    <div className="kv" style={last ? { borderBottom: 'none' } : undefined}>
      <span className="k">{k}</span>
      <span className={`v ${mono ? 'mono' : ''}`}>{v}</span>
    </div>
  )
}
