import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import {
  Button,
  Card,
  Checkbox,
  Confidence,
  EmptyState,
  ErrorState,
  Modal,
  Pager,
  SeverityBadge,
  Skeleton,
  StatusBadge,
} from '../components/ui'
import { useFakeExport, useToasts } from '../components/Toasts'
import { listIncidents, updateIncidentStatus } from '../api/incidents'
import { useApi } from '../api/useApi'

const PAGE_SIZE = 10

export default function Incidents() {
  const navigate = useNavigate()
  const exportFile = useFakeExport()
  const { push } = useToasts()

  const [query, setQuery] = useState('')
  const [severity, setSeverity] = useState('todas')
  const [status, setStatus] = useState('todos')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState([])
  const [confirm, setConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  // Los filtros y la paginación viajan a la API: la tabla nunca tiene todo el conjunto.
  const fetcher = useCallback(
    ({ signal }) =>
      listIncidents({
        severity: severity === 'todas' ? undefined : severity,
        status: status === 'todos' ? undefined : status,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        signal,
      }),
    [severity, status, page]
  )
  const { data, loading, error, reload } = useApi(fetcher, [severity, status, page])

  const total = data?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // La API no tiene búsqueda por texto: esto filtra solo lo que ya está en pantalla.
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const items = data?.items ?? []
    if (!q) return items
    return items.filter((i) => `${i.shortId} ${i.type} ${i.lat} ${i.lon}`.toLowerCase().includes(q))
  }, [data, query])

  const allOnPage = rows.length > 0 && rows.every((r) => selected.includes(r.id))
  const someOnPage = rows.some((r) => selected.includes(r.id))

  const toggleAll = () =>
    setSelected(
      allOnPage
        ? selected.filter((id) => !rows.some((r) => r.id === id))
        : [...new Set([...selected, ...rows.map((r) => r.id)])]
    )

  const toggleOne = (id) =>
    setSelected((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]))

  const resetFilters = () => {
    setQuery('')
    setSeverity('todas')
    setStatus('todos')
    setPage(1)
  }

  /** El backend rechaza las transiciones ilegales, así que contamos cuáles pasaron. */
  const markSelectedAsReviewed = async () => {
    setSaving(true)
    const results = await Promise.allSettled(
      selected.map((id) => updateIncidentStatus(id, 'revisado'))
    )
    const ok = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.length - ok
    setSaving(false)
    setConfirm(false)
    setSelected([])
    reload()

    if (ok > 0) {
      push({
        tone: 'success',
        title: `${ok} ${ok === 1 ? 'incidente marcado' : 'incidentes marcados'} como revisados`,
        desc: failed > 0 ? `${failed} ya no admitían ese cambio` : 'Registrado en el servidor',
      })
    } else {
      push({
        tone: 'high',
        title: 'No se pudo cambiar el estado',
        desc: 'Solo los incidentes nuevos pueden pasar a revisados',
      })
    }
  }

  return (
    <main className="content">
      <div className="row-between" style={{ flexWrap: 'wrap' }}>
        <div className="searchbox" style={{ width: 300, background: 'var(--surf)' }}>
          <Icon name="search" size={15} strokeWidth={1.8} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrar esta página por ID o coordenadas"
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
            ['atendido', 'Atendido'],
            ['descartado', 'Descartado'],
          ]}
        />
        {(query || severity !== 'todas' || status !== 'todos') && (
          <button onClick={resetFilters} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--acc)', fontWeight: 700, fontSize: 12 }}>
            Limpiar
          </button>
        )}

        <span className="spacer" />
        <span className="sub-text" style={{ fontSize: 11.5 }}>
          Más recientes primero
        </span>
        <Button icon="download" onClick={() => exportFile('la exportación', `${total} incidentes`)}>
          Exportar
        </Button>
      </div>

      {selected.length > 0 && (
        <div className="bulkbar">
          <Checkbox checked indeterminate onChange={() => setSelected([])} label="Deseleccionar todo" />
          <span style={{ fontWeight: 800, fontSize: 12.5 }}>{selected.length} incidentes seleccionados</span>
          <span style={{ width: 1, height: 20, background: 'currentColor', opacity: 0.2 }} />
          <button onClick={() => setConfirm(true)}>Marcar como revisados</button>
          <button onClick={() => exportFile('la selección', `${selected.length} incidentes`)}>Exportar selección</button>
          <span className="spacer" />
          <button onClick={() => setSelected([])}>Deseleccionar</button>
        </div>
      )}

      <Card style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {error ? (
          <ErrorState
            title="No pudimos cargar los incidentes"
            description={error.message}
            code={error.detail}
            onRetry={reload}
          />
        ) : loading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState
            title="Ningún incidente coincide"
            description="No hay detecciones con los filtros actuales. Prueba a quitar un filtro."
            actions={<Button onClick={resetFilters}>Limpiar filtros</Button>}
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
                    <th className="plain" style={{ width: 104 }}>ID</th>
                    <th className="plain" style={{ width: 118 }}>Tipo</th>
                    <th className="plain" style={{ width: 108 }}>Severidad</th>
                    <th className="plain">Coordenadas</th>
                    <th className="plain" style={{ width: 128 }}>Confianza</th>
                    <th className="plain" style={{ width: 96 }}>Cámara</th>
                    <th className="plain" style={{ width: 100 }}>Vehículo</th>
                    <th className="plain" style={{ width: 130 }}>Detectado</th>
                    <th className="plain" style={{ width: 140 }}>Estado</th>
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
                      <td onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={selected.includes(it.id)} onChange={() => toggleOne(it.id)} label={`Seleccionar ${it.shortId}`} />
                      </td>
                      <td className="mono" style={{ fontWeight: 600 }}>
                        {it.shortId}
                      </td>
                      <td style={{ fontWeight: 700 }}>{it.type}</td>
                      <td>
                        <SeverityBadge value={it.severity} />
                      </td>
                      <td className="mono" style={{ fontWeight: 600 }}>
                        {it.lat.toFixed(5)}, {it.lon.toFixed(5)}
                      </td>
                      <td>
                        <Confidence value={it.confidence} />
                      </td>
                      <td className="mono muted">—</td>
                      <td className="mono muted">—</td>
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
              page={page}
              pages={pages}
              total={total}
              range={`${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)}`}
              onPage={setPage}
            />
          </>
        )}
      </Card>

      <Modal
        open={confirm}
        tone="med"
        title={`¿Marcar ${selected.length} incidentes como revisados?`}
        description="Quedarán registrados como verificados en el servidor. Los que ya no estén en estado nuevo se omitirán."
        confirmLabel={saving ? 'Guardando…' : 'Sí, marcar'}
        onClose={() => setConfirm(false)}
        onConfirm={markSelectedAsReviewed}
      />
    </main>
  )
}

function TableSkeleton() {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {Array.from({ length: 8 }, (_, i) => (
        <Skeleton key={i} h={16} />
      ))}
    </div>
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
