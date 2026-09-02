import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import RoadMap, { EvidenceFrame } from '../components/RoadMap'
import { Button, SeverityBadge, StatusBadge } from '../components/ui'
import { incidents, mapMarkers, severityBreakdown } from '../data/mock'

const FILTERS = [
  { id: 'alta', label: 'Alta', color: 'var(--high)' },
  { id: 'media', label: 'Media', color: 'var(--med)' },
  { id: 'baja', label: 'Baja', color: 'var(--low)' },
]

export default function MapPage() {
  const navigate = useNavigate()
  const [active, setActive] = useState(['alta', 'media', 'baja'])
  const [selected, setSelected] = useState('IGB-00231')

  const markers = mapMarkers.filter((m) => active.includes(m.severity))
  const incident = incidents.find((i) => i.id === selected)

  const toggle = (id) =>
    setActive((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]))

  return (
    <main style={{ flex: 1, minWidth: 0, position: 'relative', display: 'flex' }}>
      <RoadMap
        className="flush"
        style={{ flex: 1 }}
        markers={markers}
        selected={selected}
        onSelect={setSelected}
      >
        <div className="map-overlay" style={{ top: 14, left: 14 }}>
          <div className="gchip" style={{ width: 250, color: 'var(--sub)', fontWeight: 600 }}>
            <Icon name="search" size={14} strokeWidth={1.9} />
            Buscar ubicación o ruta…
          </div>
          <span className="gchip on">
            <Icon name="filter" size={14} strokeWidth={1.8} />
            {active.length} de 3 severidades
          </span>
          {FILTERS.map((f) => {
            const count = severityBreakdown.find((s) => s.id === f.id)?.count
            const on = active.includes(f.id)
            return (
              <button key={f.id} className={`gchip ${on ? '' : 'off'}`} onClick={() => toggle(f.id)} aria-pressed={on}>
                <i style={{ width: 8, height: 8, borderRadius: '50%', background: f.color, display: 'block' }} />
                {f.label} · {count}
              </button>
            )
          })}
        </div>

        <div
          style={{
            position: 'absolute',
            left: 14,
            bottom: 14,
            zIndex: 2,
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
          <Stat label="RUTA VISIBLE" value="Troncal Norte–Centro" />
          <Stat label="TRAMO" value="35.7 km" mono />
          <Stat label="INCIDENTES" value={String(markers.length * 14 + 7)} mono />
          <span style={{ width: 1, height: 34, background: 'var(--line)' }} />
          <span className="mono sub-text" style={{ fontSize: 11 }}>
            Escala 1:12 000 · 200 m
          </span>
        </div>

        <div className="zoom" style={{ right: incident ? 406 : 14 }}>
          <button aria-label="Acercar">+</button>
          <button aria-label="Alejar">−</button>
        </div>
      </RoadMap>

      {incident && (
        <aside className="side-panel">
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div className="mono sub-text" style={{ fontSize: 11 }}>
                {incident.id}
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 3 }}>
                {incident.type} · {incident.severity === 'alta' ? 'profundo' : 'detectado'}
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
              <div
                style={{
                  position: 'absolute',
                  right: 8,
                  bottom: 8,
                  background: 'rgba(6,10,18,.78)',
                  color: '#fff',
                  borderRadius: 6,
                  padding: '3px 7px',
                  fontSize: 10.5,
                  fontWeight: 700,
                }}
              >
                Evidencia 1 / 3
              </div>
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
            <Row k="Fecha y hora" v={incident.date} mono />
            <Row k="Cámara" v={incident.camera} mono />
            <Row k="Vehículo" v={incident.vehicle} mono />
            <Row k="Ruta" v={incident.route} />
            <Row k="Ubicación" v={incident.location} />
            <Row k="Coordenadas" v={`${incident.lat}, ${incident.lon}`} mono last />
          </div>

          <div style={{ marginTop: 'auto', padding: '14px 16px', borderTop: '1px solid var(--line)', display: 'flex', gap: 8 }}>
            <Button variant="primary" style={{ flex: 1 }} onClick={() => navigate(`/incidentes/${incident.id}`)}>
              Ver detalle completo
            </Button>
            <Button>Marcar revisado</Button>
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
