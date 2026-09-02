import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { Button, Card, StatusBadge } from '../components/ui'
import { vehicles } from '../data/mock'

export default function Vehicles() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(vehicles[0].id)
  const v = vehicles.find((x) => x.id === selected)
  const active = vehicles.filter((x) => x.status === 'transmitiendo').length

  return (
    <main className="content">
      <div style={{ display: 'flex', gap: 12 }}>
        <Mini label="Vehículos en flota" value={String(vehicles.length)} />
        <Mini label="Transmitiendo ahora" value={String(active)} color="var(--low-ink)" />
        <Mini label="Km recorridos hoy" value="128.4" />
        <Mini label="Cobertura de rutas" value="92%" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Button onClick={() => navigate('/mapa')}>Ver en el mapa</Button>
          <Button variant="dark">Registrar vehículo</Button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 14, minHeight: 0 }}>
        <Card style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="card-head">
            <span className="card-title">Flota</span>
            <span className="spacer" />
            <div className="searchbox" style={{ width: 220, height: 30 }}>
              <Icon name="search" size={14} strokeWidth={1.8} />
              Buscar vehículo o ruta
            </div>
          </div>
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th className="plain" style={{ width: 106 }}>ID</th>
                  <th className="plain" style={{ width: 140 }}>Cámara</th>
                  <th className="plain">Ruta</th>
                  <th className="plain" style={{ width: 140 }}>Estado</th>
                  <th className="plain" style={{ width: 140 }}>Última transmisión</th>
                  <th className="plain" style={{ width: 120 }}>Km recorridos</th>
                  <th className="plain" style={{ width: 110 }}>Incidentes</th>
                  <th className="plain" style={{ width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {vehicles.map((row) => (
                  <tr key={row.id} className={row.id === selected ? 'selected' : ''} onClick={() => setSelected(row.id)}>
                    <td className="mono" style={{ fontWeight: 700 }}>{row.id}</td>
                    <td className="mono" style={row.cameras.length ? undefined : { color: 'var(--sub)' }}>
                      {row.cameras.length ? row.cameras.join(' · ') : 'Sin cámara'}
                    </td>
                    <td style={{ fontWeight: 600 }}>{row.route}</td>
                    <td>
                      <StatusBadge value={row.status === 'advertencia' ? 'advertencia' : row.status} />
                    </td>
                    <td className="mono muted">{row.lastTx}</td>
                    <td className="mono">{row.km} km</td>
                    <td className="mono" style={{ fontWeight: 700 }}>{row.incidents}</td>
                    <td style={{ color: 'var(--sub)' }}>›</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card style={{ flex: '0 0 372px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="card-head">
            <div>
              <div className="card-title mono">{v.id}</div>
              <div className="sub-text" style={{ fontSize: 11, marginTop: 2 }}>
                Padrón 2021 · {v.route}
              </div>
            </div>
            <span className="spacer" />
            <StatusBadge value={v.status} />
          </div>

          <div style={{ position: 'relative', height: 184, background: 'var(--map-bg)', borderBottom: '1px solid var(--line)' }}>
            <svg
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              viewBox="0 0 372 184"
              preserveAspectRatio="xMidYMid slice"
              role="img"
              aria-label="Posición del vehículo"
            >
              <rect width="372" height="184" fill="var(--map-bg)" />
              <g stroke="var(--map-road-2)" strokeWidth="2" fill="none">
                <path d="M0 46h372M0 138h372M76 0v184M280 0v184" />
              </g>
              <g stroke="var(--map-road)" strokeWidth="8" fill="none" strokeLinecap="round">
                <path d="M0 92h372" />
                <path d="M176 0v184" />
              </g>
              <path
                d="M14 168 C70 130 96 96 176 84 C246 74 288 46 360 26"
                fill="none"
                stroke="var(--map-route)"
                strokeWidth="3"
                strokeDasharray="9 7"
                opacity="0.8"
              />
              <circle cx="176" cy="84" r="17" fill="var(--acc)" opacity="0.22" />
              <circle cx="176" cy="84" r="9" fill="var(--acc)" />
              <circle cx="176" cy="84" r="3.4" fill="var(--surf)" />
              <circle cx="96" cy="122" r="5.5" fill="var(--high)" stroke="var(--map-bg)" strokeWidth="2" />
              <circle cx="256" cy="58" r="5.5" fill="var(--med)" stroke="var(--map-bg)" strokeWidth="2" />
            </svg>
            <div
              className="mono"
              style={{
                position: 'absolute',
                left: 10,
                bottom: 10,
                background: 'var(--surf)',
                border: '1px solid var(--line)',
                borderRadius: 7,
                padding: '4px 8px',
                fontSize: 10.5,
                fontWeight: 700,
              }}
            >
              4.65124, −74.07213 · 28 km/h
            </div>
          </div>

          <Row k="Cámaras instaladas" v={v.cameras.join(' · ') || '—'} mono />
          <Row k="Ruta asignada" v={v.route} />
          <Row k="Última transmisión" v={v.lastTx} mono />
          <Row k="Km recorridos (hoy)" v={`${v.km} km`} mono />
          <Row k="Km analizados (hoy)" v={`${v.kmAnalyzed} km`} mono />
          <Row k="Incidentes detectados" v={v.incidents} mono />
          <Row k="Conductor de turno" v={v.driver} last />

          <div style={{ marginTop: 'auto', padding: '13px 15px', borderTop: '1px solid var(--line)', display: 'flex', gap: 8 }}>
            <Button style={{ flex: 1 }}>Historial de ruta</Button>
            <Button variant="primary" style={{ flex: 1 }} onClick={() => navigate('/incidentes')}>
              Ver incidentes
            </Button>
          </div>
        </Card>
      </div>
    </main>
  )
}

function Mini({ label, value, color }) {
  return (
    <div className="card" style={{ flex: 1, padding: '12px 14px' }}>
      <div className="sect" style={{ padding: 0, letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div className="mono" style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 5, color }}>
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
