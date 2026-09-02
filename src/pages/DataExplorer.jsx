import { useMemo, useState } from 'react'
import Icon from '../components/Icon'
import { Button, Card, Checkbox, Pager, SeverityBadge } from '../components/ui'
import { useFakeExport } from '../components/Toasts'
import { incidents } from '../data/mock'

const PAGE_SIZE = 13
const TOTAL_ROWS = 2480

export default function DataExplorer() {
  const exportFile = useFakeExport()
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return incidents
    return incidents.filter((i) => Object.values(i).join(' ').toLowerCase().includes(q))
  }, [query])

  const pages = Math.max(1, Math.ceil(TOTAL_ROWS / PAGE_SIZE))
  const visible = rows.slice(0, PAGE_SIZE)

  return (
    <main className="content">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div className="h-lg">Base de datos de incidentes</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>
            Registro completo de detecciones con todos sus campos ·{' '}
            <span className="mono">{TOTAL_ROWS.toLocaleString('es')} filas</span> · última sincronización hace 2 min
          </div>
        </div>
        <Button size="lg">Generar reporte</Button>
        <Button size="lg" icon="download" onClick={() => exportFile('la exportación en CSV', `${TOTAL_ROWS} registros`)}>
          Exportar CSV
        </Button>
        <Button
          size="lg"
          variant="primary"
          icon="download"
          onClick={() => exportFile('la exportación en Excel', `${TOTAL_ROWS} registros · 12 columnas`)}
        >
          Exportar Excel
        </Button>
      </div>

      <div className="row-between" style={{ flexWrap: 'wrap' }}>
        <div className="searchbox" style={{ width: 280, height: 36, background: 'var(--surf)' }}>
          <Icon name="search" size={15} strokeWidth={1.8} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en todos los campos"
            style={{ border: 0, background: 'transparent', outline: 'none', width: '100%', font: 'inherit', color: 'var(--ink)' }}
          />
        </div>
        <span className="filter">
          Periodo: <b>01 mar – 02 sep</b>
          <Icon name="chevronDown" size={13} strokeWidth={2.4} />
        </span>
        <span className="filter">
          Tipo: <b>Todos</b>
          <Icon name="chevronDown" size={13} strokeWidth={2.4} />
        </span>
        <span className="filter">
          Ruta: <b>Todas</b>
          <Icon name="chevronDown" size={13} strokeWidth={2.4} />
        </span>
        <span className="filter">
          Confianza ≥ <b>70%</b>
          <Icon name="chevronDown" size={13} strokeWidth={2.4} />
        </span>
        <span className="spacer" />
        <span className="filter">
          <Icon name="columns" size={14} strokeWidth={1.8} />
          Columnas · <b>12 de 16</b>
        </span>
        <span className="filter">
          Densidad
          <Icon name="chevronDown" size={13} strokeWidth={2.4} />
        </span>
      </div>

      <Card style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="table-wrap">
          <table className="tbl compact">
            <thead>
              <tr>
                <th className="plain" style={{ width: 38 }}>
                  <Checkbox checked={false} onChange={() => {}} label="Seleccionar todo" />
                </th>
                <th className="plain">ID</th>
                <th className="plain">Tipo</th>
                <th className="plain">Severidad</th>
                <th className="plain">Confianza</th>
                <th className="plain">Latitud</th>
                <th className="plain">Longitud</th>
                <th className="plain">Dirección</th>
                <th className="plain">Ruta</th>
                <th className="plain">Cámara</th>
                <th className="plain">Vehículo</th>
                <th className="plain">Km</th>
                <th className="plain">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Checkbox checked={false} onChange={() => {}} label={`Seleccionar ${r.id}`} />
                  </td>
                  <td className="mono" style={{ fontWeight: 700 }}>{r.id}</td>
                  <td>{r.type}</td>
                  <td>
                    <SeverityBadge value={r.severity} />
                  </td>
                  <td className="mono">{(r.confidence / 100).toFixed(2)}</td>
                  <td className="mono">{r.lat.toFixed(6)}</td>
                  <td className="mono">{r.lon.toFixed(6)}</td>
                  <td>{r.location}</td>
                  <td>{r.route}</td>
                  <td className="mono">{r.camera}</td>
                  <td className="mono">{r.vehicle}</td>
                  <td className="mono">{r.km.toFixed(2)}</td>
                  <td className="mono muted">{r.date}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td />
                <td className="mono">{TOTAL_ROWS.toLocaleString('es')} filas</td>
                <td>—</td>
                <td>—</td>
                <td className="mono">med. 0.86</td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
                <td className="mono">10 cám.</td>
                <td className="mono">8 veh.</td>
                <td className="mono">Σ 35.7</td>
                <td>—</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <Pager
          page={page}
          pages={pages}
          total={TOTAL_ROWS}
          range={`${(page - 1) * PAGE_SIZE + 1}–${(page - 1) * PAGE_SIZE + visible.length}`}
          onPage={setPage}
        />
      </Card>
    </main>
  )
}
