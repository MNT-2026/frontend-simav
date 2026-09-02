import { useState } from 'react'
import Icon from '../components/Icon'
import { Button, Card, Switch } from '../components/ui'
import { useFakeExport } from '../components/Toasts'
import { weeklyTrend } from '../data/mock'

const ZONES = ['Norte', 'Centro', 'Sur', 'Oriente', 'Occidente']
const TYPES = ['Baches', 'Grietas']
const SEVERITIES = [
  { id: 'alta', label: 'Alta', color: 'var(--high)' },
  { id: 'media', label: 'Media', color: 'var(--med)' },
  { id: 'baja', label: 'Baja', color: 'var(--low)' },
]

export default function Reports() {
  const exportFile = useFakeExport()
  const [zones, setZones] = useState(['Norte', 'Centro'])
  const [types, setTypes] = useState(['Baches', 'Grietas'])
  const [severities, setSeverities] = useState(['alta', 'media'])
  const [photos, setPhotos] = useState(true)

  const toggle = (list, set, v) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  return (
    <main className="content" style={{ flexDirection: 'row', gap: 14 }}>
      <Card style={{ flex: '0 0 340px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 15px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em' }}>Configurar reporte</div>
          <div className="sub-text" style={{ marginTop: 3 }}>
            Los cambios se reflejan en la vista previa
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          <Group label="Plantilla">
            <select className="field" defaultValue="mensual">
              <option value="mensual">Informe mensual de infraestructura</option>
              <option value="semanal">Resumen semanal de cuadrillas</option>
              <option value="critico">Incidentes críticos pendientes</option>
            </select>
          </Group>

          <Group label="Fecha">
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="date" className="field" defaultValue="2026-08-01" aria-label="Desde" />
              <input type="date" className="field" defaultValue="2026-08-31" aria-label="Hasta" />
            </div>
          </Group>

          <Group label="Zona">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ZONES.map((z) => (
                <button key={z} className={`pill ${zones.includes(z) ? 'on' : ''}`} onClick={() => toggle(zones, setZones, z)}>
                  <i />
                  {z}
                </button>
              ))}
            </div>
          </Group>

          <Group label="Tipo de incidente">
            <div style={{ display: 'flex', gap: 6 }}>
              {TYPES.map((t) => (
                <button key={t} className={`pill ${types.includes(t) ? 'on' : ''}`} onClick={() => toggle(types, setTypes, t)}>
                  <i />
                  {t}
                </button>
              ))}
            </div>
          </Group>

          <Group label="Severidad">
            <div style={{ display: 'flex', gap: 6 }}>
              {SEVERITIES.map((s) => (
                <button
                  key={s.id}
                  className={`pill ${severities.includes(s.id) ? 'on' : ''}`}
                  onClick={() => toggle(severities, setSeverities, s.id)}
                >
                  <i style={severities.includes(s.id) ? undefined : { background: s.color }} />
                  {s.label}
                </button>
              ))}
            </div>
          </Group>

          <Group label="Cámara y vehículo">
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="field" aria-label="Cámara">
                <option>Todas</option>
                <option>CAM-03</option>
              </select>
              <select className="field" aria-label="Vehículo">
                <option>Todos</option>
                <option>BUS-117</option>
              </select>
            </div>
          </Group>

          <Group label="Estado" last>
            <select className="field" aria-label="Estado">
              <option>Todos los estados</option>
              <option>Sólo pendientes</option>
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
              <Switch checked={photos} onChange={setPhotos} label="Incluir fotografías" />
              <div>
                <div style={{ fontWeight: 700, fontSize: 12.5 }}>Incluir fotografías de evidencia</div>
                <div className="sub-text" style={{ fontSize: 11 }}>
                  Aumenta el tamaño del PDF
                </div>
              </div>
            </div>
          </Group>
        </div>

        <div style={{ padding: '13px 15px', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button variant="primary" size="lg" onClick={() => exportFile('el reporte', 'REP-2026-08-014 · 6 páginas')}>
            Generar reporte
          </Button>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button style={{ flex: 1 }} icon="download" onClick={() => exportFile('el PDF', 'REP-2026-08-014')}>
              PDF
            </Button>
            <Button style={{ flex: 1 }} icon="download" onClick={() => exportFile('el Excel', 'REP-2026-08-014')}>
              Excel
            </Button>
          </div>
        </div>
      </Card>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
        <div className="row-between">
          <div style={{ fontSize: 13, fontWeight: 800 }}>Vista previa</div>
          <span className="sub-text">
            Página 1 de 6 · A4 vertical · {zones.length} zonas · {severities.length} severidades
          </span>
          <span className="spacer" />
          <Button size="sm">Anterior</Button>
          <Button size="sm">Siguiente</Button>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            background: 'var(--line-2)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-lg)',
            display: 'flex',
            justifyContent: 'center',
            padding: 20,
            overflow: 'auto',
          }}
        >
          <ReportSheet zones={zones} severities={severities} />
        </div>

        <Card style={{ padding: '12px 15px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 12.5, fontWeight: 800 }}>Reportes recientes</div>
          <span className="muted" style={{ fontSize: 12 }}>REP-2026-07-011 · julio 2026</span>
          <span className="muted" style={{ fontSize: 12 }}>REP-2026-06-009 · junio 2026</span>
          <span className="spacer" />
          <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: 12 }}>
            Ver historial completo →
          </a>
        </Card>
      </div>
    </main>
  )
}

function Group({ label, children, last }) {
  return (
    <div style={{ padding: '14px 15px', borderBottom: last ? 'none' : '1px solid var(--line-2)' }}>
      <span className="flabel">{label}</span>
      {children}
    </div>
  )
}

function ReportSheet({ zones, severities }) {
  return (
    <div
      style={{
        width: 560,
        background: '#fff',
        color: '#0d1420',
        border: '1px solid var(--line)',
        boxShadow: 'var(--shadow)',
        padding: '34px 38px',
        height: 'fit-content',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, borderBottom: '2px solid #0d1420', paddingBottom: 14 }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Icon name="road" size={15} strokeWidth={2.1} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.02em' }}>
            ROADVISION <span style={{ fontWeight: 500, color: '#5a6678' }}>· Informe mensual</span>
          </div>
          <div style={{ fontSize: 9.5, color: '#8c97a8', fontWeight: 700, letterSpacing: '0.06em', marginTop: 2 }}>
            SECRETARÍA DE MOVILIDAD · ZONA {zones.map((z) => z.toUpperCase()).join(' Y ') || '—'}
          </div>
        </div>
        <div className="mono" style={{ fontSize: 10, color: '#5a6678', textAlign: 'right' }}>
          01–31 AGO 2026
          <br />
          REP-2026-08-014
        </div>
      </div>

      <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 20, lineHeight: 1.25 }}>
        Estado de la infraestructura vial
        <br />
        Agosto 2026
      </div>
      <p style={{ fontSize: 11, color: '#5a6678', fontWeight: 600, marginTop: 8, lineHeight: 1.6 }}>
        Durante agosto se analizaron 35.7 km de vía con 8 cámaras embarcadas. Se detectaron 82
        incidentes, de los cuales 23 requieren intervención prioritaria en un plazo de 48 horas.
      </p>

      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <Cell label="INCIDENTES" value="82" />
        <Cell label="CRÍTICOS" value="23" color="#b0322a" />
        <Cell label="KM" value="35.7" />
        <Cell label="ATENDIDOS" value="46" color="#0b7e6d" />
      </div>

      <div style={{ fontSize: 11, fontWeight: 800, marginTop: 20 }}>1. Evolución semanal</div>
      <svg viewBox="0 0 484 130" style={{ width: '100%', height: 130, marginTop: 8 }} aria-hidden="true">
        <g stroke="#edf1f7">
          <path d="M26 16h458M26 52h458M26 88h458" />
        </g>
        <path d="M26 112h458" stroke="#e2e7f0" />
        {(() => {
          const pts = weeklyTrend.slice(-5)
          const max = Math.max(...pts.map((p) => p.value))
          const x = (i) => 60 + i * 92
          const y = (v) => 112 - (v / max) * 80
          const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)} ${y(p.value)}`).join(' ')
          return (
            <>
              <path d={d} fill="none" stroke="#2f6bff" strokeWidth="2" strokeLinejoin="round" />
              {pts.map((p, i) => (
                <circle key={p.label} cx={x(i)} cy={y(p.value)} r={i === pts.length - 1 ? 4.2 : 3.6} fill="#2f6bff" stroke="#fff" strokeWidth="1.6" />
              ))}
              {pts.map((p, i) => (
                <text key={`l-${p.label}`} x={x(i)} y="126" textAnchor="middle" fill="#8c97a8" fontFamily="Manrope, sans-serif" fontSize="8.5" fontWeight="700">
                  {p.label}
                </text>
              ))}
            </>
          )
        })()}
      </svg>

      <div style={{ fontSize: 11, fontWeight: 800, marginTop: 16 }}>
        2. Incidentes prioritarios ({severities.join(', ') || 'sin filtro'})
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8, fontSize: 9.5 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e2e7f0' }}>
            {['ID', 'TIPO', 'UBICACIÓN', 'CONF.'].map((h, i) => (
              <th key={h} style={{ textAlign: i === 3 ? 'right' : 'left', padding: '5px 0', color: '#8c97a8', fontSize: 8.5, letterSpacing: '0.06em' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            ['IGB-00231', 'Bache', 'Av. Troncal km 4.2', '94%'],
            ['IGB-00230', 'Grieta', 'Calle 8 · carrera 21', '91%'],
            ['IGB-00225', 'Bache', 'Av. Troncal km 6.9', '96%'],
            ['IGB-00220', 'Bache', 'Av. Troncal km 4.6', '93%'],
          ].map((r) => (
            <tr key={r[0]} style={{ borderBottom: '1px solid #edf1f7' }}>
              <td className="mono" style={{ padding: '5px 0' }}>{r[0]}</td>
              <td>{r[1]}</td>
              <td>{r[2]}</td>
              <td className="mono" style={{ textAlign: 'right' }}>{r[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 20, paddingTop: 10, borderTop: '1px solid #e2e7f0', display: 'flex', fontSize: 8.5, color: '#8c97a8', fontWeight: 700 }}>
        <span>Generado el 02/09/2026 por Sofía Marín</span>
        <span style={{ marginLeft: 'auto' }}>Página 1 de 6</span>
      </div>
    </div>
  )
}

function Cell({ label, value, color }) {
  return (
    <div style={{ flex: 1, border: '1px solid #e2e7f0', borderRadius: 8, padding: 10 }}>
      <div style={{ fontSize: 8.5, letterSpacing: '0.09em', color: '#8c97a8', fontWeight: 800 }}>{label}</div>
      <div className="mono" style={{ fontSize: 20, fontWeight: 800, marginTop: 3, color }}>
        {value}
      </div>
    </div>
  )
}
