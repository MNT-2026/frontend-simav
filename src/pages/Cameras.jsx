import { useState } from 'react'
import Icon from '../components/Icon'
import { Button, Card, StatusBadge } from '../components/ui'
import { useToasts } from '../components/Toasts'
import { cameras, kpis } from '../data/mock'

export default function Cameras() {
  const [selected, setSelected] = useState(cameras[0].id)
  const { push } = useToasts()
  const cam = cameras.find((c) => c.id === selected)

  return (
    <main className="content">
      <div style={{ display: 'flex', gap: 12 }}>
        <Mini label="Cámaras activas" value={`${kpis.camerasActive}`} unit={`/ ${kpis.camerasTotal}`} />
        <Mini label="Con advertencia" value="1" color="var(--med-ink)" />
        <Mini label="Offline" value="1" color="var(--high-ink)" />
        <Mini label="Km analizados hoy" value="35.7" />
        <Mini label="Detecciones · 7 días" value="147" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Button onClick={() => push({ tone: 'info', title: 'Diagnóstico en curso', desc: '10 cámaras · tarda ~30 s' })}>
            Diagnóstico de flota
          </Button>
          <Button variant="dark">Registrar cámara</Button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 14, minHeight: 0 }}>
        <Card style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="card-head">
            <span className="card-title">Inventario de cámaras</span>
            <span className="spacer" />
            <div className="searchbox" style={{ width: 220, height: 30 }}>
              <Icon name="search" size={14} strokeWidth={1.8} />
              Buscar cámara
            </div>
          </div>
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th className="plain" style={{ width: 96 }}>ID</th>
                  <th className="plain" style={{ width: 110 }}>Vehículo</th>
                  <th className="plain" style={{ width: 130 }}>Estado</th>
                  <th className="plain">Última conexión</th>
                  <th className="plain" style={{ width: 130 }}>Km analizados</th>
                  <th className="plain" style={{ width: 120 }}>Incidentes</th>
                  <th className="plain" style={{ width: 44 }} />
                </tr>
              </thead>
              <tbody>
                {cameras.map((c) => (
                  <tr key={c.id} className={c.id === selected ? 'selected' : ''} onClick={() => setSelected(c.id)}>
                    <td className="mono" style={{ fontWeight: 700 }}>{c.id}</td>
                    <td className="mono" style={!c.vehicle ? { color: 'var(--sub)' } : undefined}>
                      {c.vehicle ?? 'Sin asignar'}
                    </td>
                    <td>
                      <StatusBadge value={c.status} />
                    </td>
                    <td
                      className="mono"
                      style={{
                        color:
                          c.status === 'offline'
                            ? 'var(--high-ink)'
                            : c.status === 'advertencia'
                            ? 'var(--med-ink)'
                            : 'var(--mut)',
                      }}
                    >
                      {c.lastSeen}
                    </td>
                    <td className="mono">{c.km ? `${c.km} km` : '—'}</td>
                    <td className="mono" style={{ fontWeight: 700 }}>{c.incidents}</td>
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
              <div className="card-title mono">{cam.id}</div>
              <div className="sub-text" style={{ fontSize: 11, marginTop: 2 }}>
                Frontal · {cam.vehicle ?? 'sin vehículo'} · {cam.route}
              </div>
            </div>
            <span className="spacer" />
            <StatusBadge value={cam.status} />
          </div>

          <div style={{ padding: '14px 15px' }}>
            <div style={{ borderRadius: 11, overflow: 'hidden', border: '1px solid var(--line)', position: 'relative', background: '#4E524B' }}>
              <svg viewBox="0 0 340 190" style={{ width: '100%', display: 'block' }} role="img" aria-label="Vista de la cámara">
                <rect width="340" height="190" fill={cam.status === 'offline' ? '#3B3F3A' : '#7A7E75'} />
                <path d="M0 118h340v72H0z" fill="#5F635B" />
                <path d="M0 110h340v8H0z" fill="#9AA093" />
                <g opacity="0.55" stroke="#EDEFE8" strokeWidth="5" strokeDasharray="26 22">
                  <path d="M0 160h340" />
                </g>
                <ellipse cx="180" cy="146" rx="46" ry="20" fill="#2E312C" />
                {cam.status !== 'offline' && (
                  <rect x="130" y="122" width="102" height="52" fill="none" stroke="var(--acc-bright)" strokeWidth="2" rx="3" />
                )}
                {cam.status === 'offline' && (
                  <text x="170" y="100" textAnchor="middle" fontFamily="Manrope" fontSize="14" fontWeight="800" fill="#C9CEC6">
                    SIN SEÑAL
                  </text>
                )}
              </svg>
              {cam.status !== 'offline' && (
                <div
                  style={{
                    position: 'absolute',
                    left: 9,
                    top: 9,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(6,10,18,.72)',
                    borderRadius: 6,
                    padding: '3px 8px',
                    color: '#fff',
                    fontSize: 10.5,
                    fontWeight: 800,
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--high)', display: 'block' }} />
                  EN VIVO
                </div>
              )}
              <div className="mono" style={{ position: 'absolute', right: 9, bottom: 9, background: 'rgba(6,10,18,.72)', color: '#fff', borderRadius: 6, padding: '3px 7px', fontSize: 10 }}>
                1080p · 24 fps
              </div>
            </div>
          </div>

          <Row k="Vehículo asignado" v={cam.vehicle ?? '—'} mono />
          <Row k="Ruta" v={cam.route} />
          <Row k="Última conexión" v={cam.lastSeen} mono />
          <Row k="Km analizados (7 d)" v={`${cam.km} km`} mono />
          <Row k="Incidentes detectados" v={cam.incidents} mono />
          <Row k="Confianza media IA" v={cam.confidence ? `${cam.confidence}%` : '—'} mono />
          <Row k="Firmware" v={cam.firmware} mono />

          <div style={{ padding: '13px 15px' }}>
            <div className="sect" style={{ padding: '0 0 9px' }}>
              Actividad · últimos 14 días
            </div>
            <svg viewBox="0 0 320 60" style={{ width: '100%', height: 60 }} aria-hidden="true">
              <g fill="var(--acc)" opacity="0.65">
                {[30, 38, 24, 42, 34, 46, 30, 40, 26, 44, 36, 50, 32].map((h, i) => (
                  <rect key={i} x={i * 22} y={60 - h} width="16" height={h} rx="2" />
                ))}
              </g>
              <rect x="286" y="6" width="16" height="54" rx="2" fill="var(--acc)" />
            </svg>
          </div>

          <div style={{ marginTop: 'auto', padding: '13px 15px', borderTop: '1px solid var(--line)', display: 'flex', gap: 8 }}>
            <Button style={{ flex: 1 }}>Ver incidentes</Button>
            <Button variant="primary" style={{ flex: 1 }} onClick={() => push({ tone: 'info', title: `Diagnóstico de ${cam.id}`, desc: 'Comprobando enfoque y conectividad' })}>
              Diagnóstico
            </Button>
          </div>
        </Card>
      </div>
    </main>
  )
}

function Mini({ label, value, unit, color }) {
  return (
    <div className="card" style={{ flex: 1, padding: '12px 14px' }}>
      <div className="sect" style={{ padding: 0, letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div className="mono" style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 5, color }}>
        {value} {unit && <span style={{ fontSize: 14, color: 'var(--sub)' }}>{unit}</span>}
      </div>
    </div>
  )
}

function Row({ k, v, mono }) {
  return (
    <div className="kv">
      <span className="k">{k}</span>
      <span className={`v ${mono ? 'mono' : ''}`}>{v}</span>
    </div>
  )
}
