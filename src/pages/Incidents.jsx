import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import {
  Button,
  Card,
  Checkbox,
  Confidence,
  EmptyState,
  Modal,
  Pager,
  SeverityBadge,
  StatusBadge,
} from '../components/ui'
import { useFakeExport, useToasts } from '../components/Toasts'
import { incidents as ALL } from '../data/mock'

const PAGE_SIZE = 10
const SEV_ORDER = { alta: 3, media: 2, baja: 1 }

export default function Incidents() {
  const navigate = useNavigate()
  const exportFile = useFakeExport()
  const { push } = useToasts()

  const [query, setQuery] = useState('')
  const [severity, setSeverity] = useState('todas')
  const [status, setStatus] = useState('todos')
  const [sort, setSort] = useState({ key: 'date', dir: 'desc' })
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState([])
  const [confirm, setConfirm] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let rows = ALL.filter((i) => {
      if (severity !== 'todas' && i.severity !== severity) return false
      if (status !== 'todos' && i.status !== status) return false
      if (!q) return true
      return [i.id, i.location, i.route, i.camera, i.vehicle].join(' ').toLowerCase().includes(q)
    })
    rows = [...rows].sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1
      if (sort.key === 'severity') return (SEV_ORDER[a.severity] - SEV_ORDER[b.severity]) * dir
      if (sort.key === 'confidence') return (a.confidence - b.confidence) * dir
      return String(a[sort.key]).localeCompare(String(b[sort.key])) * dir
    })
    return rows
  }, [query, severity, status, sort])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pages)
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const allOnPage = rows.length > 0 && rows.every((r) => selected.includes(r.id))
  const someOnPage = rows.some((r) => selected.includes(r.id))

  const toggleAll = () =>
    setSelected(allOnPage ? selected.filter((id) => !rows.some((r) => r.id === id)) : [...new Set([...selected, ...rows.map((r) => r.id)])])

  const toggleOne = (id) =>
    setSelected((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]))

  const th = (key, label, extra = {}) => (
    <th onClick={() => setSort((s) => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }))} {...extra}>
      {label}
      {sort.key === key && (
        <Icon
          name={sort.dir === 'desc' ? 'chevronDown' : 'chevronDown'}
          size={11}
          strokeWidth={3}
          style={{ display: 'inline', verticalAlign: -1, marginLeft: 4, transform: sort.dir === 'asc' ? 'rotate(180deg)' : 'none' }}
        />
      )}
    </th>
  )

  const resetFilters = () => {
    setQuery('')
    setSeverity('todas')
    setStatus('todos')
    setPage(1)
  }

  return (
    <main className="content">
      <div className="row-between" style={{ flexWrap: 'wrap' }}>
        <div className="searchbox" style={{ width: 300, background: 'var(--surf)' }}>
          <Icon name="search" size={15} strokeWidth={1.8} />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Buscar por ID, ubicación o ruta"
            style={{ border: 0, background: 'transparent', outline: 'none', width: '100%', font: 'inherit', color: 'var(--ink)' }}
          />
        </div>

        <Select
          label="Severidad"
          value={severity}
          onChange={(v) => {
            setSeverity(v)
            setPage(1)
          }}
          options={[
            ['todas', 'Todas'],
            ['alta', 'Alta'],
            ['media', 'Media'],
            ['baja', 'Baja'],
          ]}
        />
        <Select
          label="Estado"
          value={status}
          onChange={(v) => {
            setStatus(v)
            setPage(1)
          }}
          options={[
            ['todos', 'Todos'],
            ['nuevo', 'Nuevo'],
            ['revisado', 'Revisado'],
            ['seguimiento', 'En seguimiento'],
            ['atendido', 'Atendido'],
          ]}
        />
        <span className="filter">
          <Icon name="calendar" size={14} strokeWidth={1.8} />
          Últimos 7 días
          <Icon name="chevronDown" size={13} strokeWidth={2.4} />
        </span>
        {(query || severity !== 'todas' || status !== 'todos') && (
          <button onClick={resetFilters} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--acc)', fontWeight: 700, fontSize: 12 }}>
            Limpiar
          </button>
        )}

        <span className="spacer" />
        <Button icon="download" onClick={() => exportFile('la exportación', `${filtered.length} incidentes`)}>
          Exportar
        </Button>
        <Button variant="dark">Crear incidente manual</Button>
      </div>

      {selected.length > 0 && (
        <div className="bulkbar">
          <Checkbox checked indeterminate onChange={() => setSelected([])} label="Deseleccionar todo" />
          <span style={{ fontWeight: 800, fontSize: 12.5 }}>{selected.length} incidentes seleccionados</span>
          <span style={{ width: 1, height: 20, background: 'currentColor', opacity: 0.2 }} />
          <button onClick={() => setConfirm(true)}>Cambiar estado</button>
          <button onClick={() => push({ tone: 'success', title: 'Cuadrilla asignada', desc: `${selected.length} incidentes · Cuadrilla Norte 2` })}>
            Asignar cuadrilla
          </button>
          <button onClick={() => exportFile('la selección', `${selected.length} incidentes`)}>Exportar selección</button>
          <span className="spacer" />
          <button onClick={() => setSelected([])}>Deseleccionar</button>
        </div>
      )}

      <Card style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {rows.length === 0 ? (
          <EmptyState
            title="Ningún incidente coincide"
            description="No hay detecciones con los filtros actuales. Prueba a ampliar el periodo o a quitar un filtro."
            actions={
              <>
                <Button onClick={resetFilters}>Limpiar filtros</Button>
                <Button variant="dark" onClick={() => setSeverity('todas')}>
                  Ver todas las severidades
                </Button>
              </>
            }
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th className="plain" style={{ width: 42 }}>
                      <Checkbox checked={allOnPage} indeterminate={!allOnPage && someOnPage} onChange={toggleAll} label="Seleccionar página" />
                    </th>
                    {th('id', 'ID', { style: { width: 104 } })}
                    {th('type', 'Tipo', { style: { width: 118 } })}
                    {th('severity', 'Severidad', { style: { width: 108 } })}
                    {th('location', 'Ubicación')}
                    {th('confidence', 'Confianza', { style: { width: 128 } })}
                    {th('camera', 'Cámara', { style: { width: 96 } })}
                    {th('vehicle', 'Vehículo', { style: { width: 100 } })}
                    {th('date', 'Fecha', { style: { width: 130 } })}
                    {th('status', 'Estado', { style: { width: 140 } })}
                    <th className="plain" style={{ width: 44 }} />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((it) => (
                    <tr
                      key={it.id}
                      className={selected.includes(it.id) ? 'selected' : ''}
                      onClick={() => navigate(`/incidentes/${it.id}`)}
                    >
                      <td>
                        <Checkbox checked={selected.includes(it.id)} onChange={() => toggleOne(it.id)} label={`Seleccionar ${it.id}`} />
                      </td>
                      <td className="mono" style={{ fontWeight: 600 }}>
                        {it.id}
                      </td>
                      <td style={{ fontWeight: 700 }}>{it.type}</td>
                      <td>
                        <SeverityBadge value={it.severity} />
                      </td>
                      <td style={{ fontWeight: 600 }}>{it.location}</td>
                      <td>
                        <Confidence value={it.confidence} />
                      </td>
                      <td className="mono">{it.camera}</td>
                      <td className="mono">{it.vehicle}</td>
                      <td className="mono muted">{it.date}</td>
                      <td>
                        <StatusBadge value={it.status} />
                      </td>
                      <td style={{ color: 'var(--sub)' }}>›</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager
              page={current}
              pages={pages}
              total={filtered.length}
              range={`${(current - 1) * PAGE_SIZE + 1}–${Math.min(current * PAGE_SIZE, filtered.length)}`}
              onPage={setPage}
            />
          </>
        )}
      </Card>

      <Modal
        open={confirm}
        tone="med"
        title={`¿Marcar ${selected.length} incidentes como atendidos?`}
        description="Se cerrará su seguimiento y quedarán registrados a tu nombre. Podrás reabrirlos desde el historial."
        confirmLabel="Sí, marcar"
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false)
          push({
            tone: 'success',
            title: `${selected.length} incidentes marcados como atendidos`,
            desc: `Registrado a nombre de Sofía Marín`,
          })
          setSelected([])
        }}
      />
    </main>
  )
}

function Select({ label, value, onChange, options }) {
  const current = options.find(([v]) => v === value)?.[1]
  return (
    <label className={`filter ${value !== options[0][0] ? 'on' : ''}`} style={{ position: 'relative' }}>
      {label}: <b>{current}</b>
      <Icon name="chevronDown" size={13} strokeWidth={2.4} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }}
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  )
}
