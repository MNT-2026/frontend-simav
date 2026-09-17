import { useCallback, useState } from 'react'
import BrandLogo from '../components/BrandLogo'
import Icon from '../components/Icon'
import { TrendChart } from '../components/charts'
import { Button, Card, EmptyState, ErrorState, Skeleton } from '../components/ui'
import { useToasts } from '../components/Toasts'
import { CITY } from '../api/geo'
import {
  MAX_TITLE_LENGTH,
  TEMPLATE_LABEL,
  formatDate,
  formatInstant,
  downloadReportPdf,
  generateReport,
  getReportDetail,
  lastWeek,
  listReports,
  previousMonth,
  validateReportForm,
} from '../api/reports'
import { useApi } from '../api/useApi'

const HISTORY_PAGE = 8
const TYPES = ['Bache', 'Grieta', 'Daño en vía']
const SEVERITIES = [
  { id: 'alta', label: 'Alta', color: 'var(--high)' },
  { id: 'media', label: 'Media', color: 'var(--med)' },
  { id: 'baja', label: 'Baja', color: 'var(--low)' },
]
const STATUSES = [
  { id: 'nuevo', label: 'Nuevo' },
  { id: 'revisado', label: 'Revisado' },
  { id: 'atendido', label: 'Atendido' },
  { id: 'descartado', label: 'Descartado' },
]

/** Cada plantilla propone un periodo y unos filtros; quien genera puede cambiarlos. */
function presetFor(template) {
  if (template === 'semanal') return { ...lastWeek(), types: [], severities: [], statuses: [] }
  if (template === 'critico') {
    return { ...previousMonth(), types: [], severities: ['alta'], statuses: ['nuevo', 'revisado'] }
  }
  return { ...previousMonth(), types: [], severities: [], statuses: [] }
}

export default function Reports() {
  const { push } = useToasts()
  const [form, setForm] = useState(() => ({ template: 'mensual', title: '', ...presetFor('mensual') }))
  const [generating, setGenerating] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [offset, setOffset] = useState(0)

  const historyFetcher = useCallback(
    ({ signal }) => listReports({ limit: HISTORY_PAGE, offset, signal }),
    [offset],
  )
  const history = useApi(historyFetcher, [offset])

  // Si no se eligió ninguno, se muestra el más reciente del historial.
  const current = selected ?? (offset === 0 ? history.data?.items[0] : null) ?? null

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }))
  const toggle = (key, value) =>
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((x) => x !== value) : [...prev[key], value],
    }))

  const problem = validateReportForm(form)

  const submit = async () => {
    // Un segundo clic mientras se genera crearía un reporte duplicado con otro código.
    if (generating || problem) return
    setGenerating(true)
    try {
      const report = await generateReport(form)
      setSelected(report)
      setOffset(0)
      history.reload()
      push({ tone: 'success', title: `Reporte ${report.code} generado`, desc: report.title })
    } catch (err) {
      push({ tone: 'high', title: 'No se pudo generar el reporte', desc: err.message })
    } finally {
      setGenerating(false)
    }
  }

  const download = async () => {
    if (!current || downloading) return
    setDownloading(true)
    try {
      await downloadReportPdf(current)
    } catch (err) {
      push({ tone: 'high', title: 'No se pudo descargar el PDF', desc: err.message })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <main className="content" style={{ flexDirection: 'row', gap: 14 }}>
      <Card style={{ flex: '0 0 340px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 15px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em' }}>Configurar reporte</div>
          <div className="sub-text" style={{ marginTop: 3 }}>
            Las cifras se calculan en el servidor al generarlo y quedan guardadas
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          <Group label="Plantilla">
            <select
              className="field"
              value={form.template}
              onChange={(e) => set({ template: e.target.value, ...presetFor(e.target.value) })}
            >
              {Object.entries(TEMPLATE_LABEL).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </Group>

          <Group label="Título (opcional)">
            <input
              className="field"
              value={form.title}
              maxLength={MAX_TITLE_LENGTH}
              placeholder={TEMPLATE_LABEL[form.template]}
              onChange={(e) => set({ title: e.target.value })}
            />
          </Group>

          <Group label={`Periodo (hora de ${CITY.name})`}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="date"
                className={`field ${problem && /fecha|días/.test(problem) ? 'invalid' : ''}`}
                value={form.periodStart}
                max={form.periodEnd || undefined}
                onChange={(e) => set({ periodStart: e.target.value })}
                aria-label="Desde"
              />
              <input
                type="date"
                className={`field ${problem && /fecha|días/.test(problem) ? 'invalid' : ''}`}
                value={form.periodEnd}
                min={form.periodStart || undefined}
                onChange={(e) => set({ periodEnd: e.target.value })}
                aria-label="Hasta"
              />
            </div>
            <div className="sub-text" style={{ fontSize: 11, marginTop: 6 }}>
              Ambos días incluidos
            </div>
          </Group>

          <Group label="Tipo de incidente">
            <Pills options={TYPES.map((t) => ({ id: t, label: t }))} value={form.types} onToggle={(v) => toggle('types', v)} />
          </Group>

          <Group label="Severidad">
            <Pills options={SEVERITIES} value={form.severities} onToggle={(v) => toggle('severities', v)} />
          </Group>

          <Group label="Estado" last>
            <Pills options={STATUSES} value={form.statuses} onToggle={(v) => toggle('statuses', v)} />
            <div className="sub-text" style={{ fontSize: 11, marginTop: 10 }}>
              En cada grupo, si no marcas ninguno se incluyen todos.
            </div>
          </Group>
        </div>

        <div style={{ padding: '13px 15px', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {problem && (
            <div className="sub-text" role="alert" style={{ color: 'var(--high)', fontSize: 12 }}>
              {problem}
            </div>
          )}
          <Button variant="primary" size="lg" loading={generating} disabled={generating || Boolean(problem)} onClick={submit}>
            {generating ? 'Generando…' : 'Generar reporte'}
          </Button>
        </div>
      </Card>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
        <div className="row-between">
          <div style={{ fontSize: 13, fontWeight: 800 }}>Vista previa</div>
          {current && (
            <span className="sub-text">
              {current.code} · {formatDate(current.periodStart)} – {formatDate(current.periodEnd)}
            </span>
          )}
          <span className="spacer" />
          <Button
            icon="download"
            loading={downloading}
            // Un reporte con cifras inconsistentes no se muestra, así que tampoco se exporta.
            disabled={!current || downloading || current.integrityProblems.length > 0}
            onClick={download}
          >
            Descargar PDF
          </Button>
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
          <Preview report={current} history={history} />
        </div>

        <History
          history={history}
          currentId={current?.id}
          offset={offset}
          onSelect={setSelected}
          onPage={(next) => {
            setSelected(null)
            setOffset(next)
          }}
        />
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

function Pills({ options, value, onToggle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map((o) => {
        const on = value.includes(o.id)
        return (
          <button key={o.id} className={`pill ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => onToggle(o.id)}>
            <i style={!on && o.color ? { background: o.color } : undefined} />
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function Preview({ report, history }) {
  if (!report) {
    if (history.loading) return <SheetSkeleton />
    if (history.error) {
      return (
        <ErrorState
          title="No pudimos cargar los reportes"
          description={history.error.message}
          code={history.error.detail}
          onRetry={history.reload}
        />
      )
    }
    return (
      <EmptyState
        title="Todavía no hay reportes"
        description="Configura el periodo y los filtros y pulsa «Generar reporte»."
      />
    )
  }

  if (report.integrityProblems.length > 0) {
    return (
      <div className="alert high" role="alert" style={{ height: 'fit-content', maxWidth: 560 }}>
        <Icon name="alert" size={18} />
        <div>
          <div style={{ fontWeight: 800 }}>El reporte {report.code} tiene cifras inconsistentes</div>
          <div className="sub-text" style={{ marginTop: 4 }}>
            No se muestra para no presentar datos contradictorios: {report.integrityProblems.join(' · ')}
          </div>
        </div>
      </div>
    )
  }

  // key: al cambiar de reporte se descarta el detalle anterior en vez de mezclarlo.
  return <ReportSheet key={report.id} report={report} />
}

function ReportSheet({ report }) {
  const fetcher = useCallback(({ signal }) => getReportDetail(report, { signal }), [report])
  const detail = useApi(fetcher, [report.id])
  const { summary } = report

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: 'fit-content' }}>
      {detail.data?.drift.changed && (
        <div className="alert med" style={{ width: 560 }}>
          <Icon name="alert" size={16} />
          <div style={{ fontSize: 12 }}>
            <b>Las cifras cambiaron desde que se generó.</b> El resumen es la foto del{' '}
            {formatInstant(report.createdAt)}; la gráfica y la tabla son de hoy ({detail.data.drift.changes.join(' · ')}).
          </div>
        </div>
      )}

      <div
        style={{
          width: 560,
          background: '#fff',
          color: '#0d1420',
          border: '1px solid var(--line)',
          boxShadow: 'var(--shadow)',
          padding: '34px 38px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, borderBottom: '2px solid #0d1420', paddingBottom: 14 }}>
          <BrandLogo variant="mark" height={30} surface="light" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.02em' }}>
              SIMAV <span style={{ fontWeight: 500, color: '#5a6678' }}>· {TEMPLATE_LABEL[report.template]}</span>
            </div>
            <div style={{ fontSize: 9.5, color: '#8c97a8', fontWeight: 700, letterSpacing: '0.06em', marginTop: 2 }}>
              {filtersText(report.filters).toUpperCase()}
            </div>
          </div>
          <div className="mono" style={{ fontSize: 10, color: '#5a6678', textAlign: 'right' }}>
            {formatDate(report.periodStart).toUpperCase()} – {formatDate(report.periodEnd).toUpperCase()}
            <br />
            {report.code}
          </div>
        </div>

        <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 20, lineHeight: 1.25 }}>
          {report.title}
        </div>
        <p style={{ fontSize: 11, color: '#5a6678', fontWeight: 600, marginTop: 8, lineHeight: 1.6 }}>
          Entre el {formatDate(report.periodStart)} y el {formatDate(report.periodEnd)} se registraron{' '}
          {plural(summary.total, 'incidente', 'incidentes')} con los filtros del reporte: {summary.pending} pendientes de
          atención y {summary.resolved} atendidos.
        </p>

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <Cell label="INCIDENTES" value={summary.total} />
          <Cell label="SEVERIDAD ALTA" value={summary.bySeverity.alta} color="#b0322a" />
          <Cell label="PENDIENTES" value={summary.pending} />
          <Cell label="ATENDIDOS" value={summary.resolved} color="#0b7e6d" />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 14, fontSize: 9.5 }}>
          <tbody>
            <BreakdownRow label="Por tipo" counts={summary.byType} />
            <BreakdownRow label="Por severidad" counts={summary.bySeverity} />
            <BreakdownRow label="Por estado" counts={summary.byStatus} />
          </tbody>
        </table>

        <div style={{ fontSize: 11, fontWeight: 800, marginTop: 20 }}>1. Evolución en el periodo</div>
        <div style={{ height: 170, marginTop: 8 }}>
          {detail.loading ? (
            <Skeleton h={160} />
          ) : detail.error ? (
            <SheetError detail={detail} />
          ) : detail.data.timeline.length === 0 ? (
            <Muted>Sin incidentes en el periodo.</Muted>
          ) : (
            <TrendChart data={detail.data.timeline} height={170} yTitle="Incidentes" />
          )}
        </div>

        <div style={{ fontSize: 11, fontWeight: 800, marginTop: 16 }}>
          2. Incidentes más recientes
          {detail.data && ` (${Math.min(detail.data.recent.length, detail.data.recentTotal)} de ${detail.data.recentTotal})`}
        </div>
        {detail.loading ? (
          <Skeleton h={80} style={{ marginTop: 8 }} />
        ) : detail.error ? null : detail.data.recent.length === 0 ? (
          <Muted>Sin incidentes que cumplan los filtros.</Muted>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8, fontSize: 9.5 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e7f0' }}>
                {['ID', 'TIPO', 'SEVERIDAD', 'ESTADO', 'DETECTADO', 'CONF.'].map((h, i) => (
                  <th key={h} style={{ textAlign: i === 5 ? 'right' : 'left', padding: '5px 0', color: '#8c97a8', fontSize: 8.5, letterSpacing: '0.06em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detail.data.recent.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #edf1f7' }}>
                  <td className="mono" style={{ padding: '5px 0' }}>{r.shortId}</td>
                  <td>{r.type}</td>
                  <td style={{ textTransform: 'capitalize' }}>{r.severity}</td>
                  <td style={{ textTransform: 'capitalize' }}>{r.status}</td>
                  <td className="mono">{formatInstant(r.detectedAt)}</td>
                  <td className="mono" style={{ textAlign: 'right' }}>{r.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {detail.data?.drift.inconsistent && (
          <Muted>Los datos cambiaron mientras se cargaban; recarga para verlos coherentes.</Muted>
        )}

        <div style={{ marginTop: 20, paddingTop: 10, borderTop: '1px solid #e2e7f0', display: 'flex', fontSize: 8.5, color: '#8c97a8', fontWeight: 700 }}>
          <span>
            Generado el {formatInstant(report.createdAt)} por {report.createdByName}
          </span>
          <span style={{ marginLeft: 'auto' }}>Zona horaria: {report.timezone}</span>
        </div>
      </div>
    </div>
  )
}

function History({ history, currentId, offset, onSelect, onPage }) {
  const page = history.data
  return (
    <Card style={{ padding: '12px 15px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="row-between">
        <div style={{ fontSize: 12.5, fontWeight: 800 }}>Historial de reportes</div>
        {page && <span className="muted" style={{ fontSize: 12 }}>{page.total} en total</span>}
        <span className="spacer" />
        <Button size="sm" disabled={offset === 0 || history.loading} onClick={() => onPage(Math.max(0, offset - HISTORY_PAGE))}>
          Anterior
        </Button>
        <Button
          size="sm"
          disabled={!page || offset + HISTORY_PAGE >= page.total || history.loading}
          onClick={() => onPage(offset + HISTORY_PAGE)}
        >
          Siguiente
        </Button>
      </div>
      {history.loading && !page ? (
        <Skeleton h={14} />
      ) : history.error ? (
        <span className="muted" style={{ fontSize: 12 }}>
          No se pudo cargar el historial: {history.error.message}{' '}
          <a href="#" onClick={(e) => (e.preventDefault(), history.reload())}>Reintentar</a>
        </span>
      ) : page.items.length === 0 ? (
        <span className="muted" style={{ fontSize: 12 }}>Aún no se ha generado ningún reporte.</span>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {page.items.map((r) => (
            <button
              key={r.id}
              className={`pill ${r.id === currentId ? 'on' : ''}`}
              aria-pressed={r.id === currentId}
              title={`${r.title} · ${formatDate(r.periodStart)} – ${formatDate(r.periodEnd)} · ${r.createdByName}`}
              onClick={() => onSelect(r)}
            >
              <i />
              <span className="mono">{r.code}</span>
              {r.integrityProblems.length > 0 && <Icon name="alert" size={12} />}
            </button>
          ))}
        </div>
      )}
    </Card>
  )
}

function BreakdownRow({ label, counts }) {
  return (
    <tr style={{ borderBottom: '1px solid #edf1f7' }}>
      <td style={{ padding: '5px 0', color: '#8c97a8', fontWeight: 800, width: 90 }}>{label}</td>
      <td style={{ textTransform: 'capitalize' }}>
        {Object.entries(counts)
          .map(([key, n]) => `${key} ${n}`)
          .join(' · ')}
      </td>
    </tr>
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

function SheetError({ detail }) {
  return (
    <div style={{ fontSize: 10.5, color: '#b0322a', fontWeight: 700 }}>
      No se pudo cargar el detalle: {detail.error.message}.{' '}
      <a href="#" onClick={(e) => (e.preventDefault(), detail.reload())}>Reintentar</a>
    </div>
  )
}

function Muted({ children }) {
  return <div style={{ fontSize: 10.5, color: '#8c97a8', fontWeight: 600, marginTop: 8 }}>{children}</div>
}

function SheetSkeleton() {
  return (
    <div style={{ width: 560, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Skeleton h={40} />
      <Skeleton h={24} w="60%" />
      <Skeleton h={180} />
    </div>
  )
}

function filtersText({ types, severities, statuses }) {
  const part = (list, all) => (list.length ? list.join(', ') : all)
  return [
    part(types, 'todos los tipos'),
    `severidad ${part(severities, 'todas')}`,
    `estado ${part(statuses, 'todos')}`,
  ].join(' · ')
}

function plural(n, one, many) {
  return `${n} ${n === 1 ? one : many}`
}
