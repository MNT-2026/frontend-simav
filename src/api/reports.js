/**
 * Reportes: `POST/GET /reports` y el detalle que se pide aparte a `/road-incidents`.
 *
 * Un reporte guarda dos cosas: los parámetros con que se pidió y una foto de las cifras al
 * generarlo. La serie temporal y el listado no se guardan: se piden con esos mismos
 * parámetros, así que pueden diferir de la foto si después cambió algo (y la interfaz lo dice).
 */

import { api } from './client'
import { CITY } from './geo'
import {
  SEVERITY_TO_API,
  SEVERITY_TO_UI,
  STATUS_TO_API,
  STATUS_TO_UI,
  TYPE_TO_API,
  TYPE_TO_UI,
  toUiIncident,
} from './mappers'

export const TEMPLATE_TO_UI = {
  MONTHLY_INFRASTRUCTURE: 'mensual',
  WEEKLY_CREWS: 'semanal',
  CRITICAL_PENDING: 'critico',
}
const TEMPLATE_TO_API = Object.fromEntries(Object.entries(TEMPLATE_TO_UI).map(([a, u]) => [u, a]))

export const TEMPLATE_LABEL = {
  mensual: 'Informe mensual de infraestructura',
  semanal: 'Resumen semanal de cuadrillas',
  critico: 'Incidentes críticos pendientes',
}

// Mismos límites que el dominio del backend: se validan antes de enviar para no gastar
// una petición, pero el servidor sigue siendo quien decide.
export const MAX_TITLE_LENGTH = 160
export const MAX_PERIOD_DAYS = 366

/** Estados que el backend cuenta como pendientes (ACTIVE + VERIFIED). */
const PENDING_UI = ['nuevo', 'revisado']

// ---------- validación del formulario ----------

/** Devuelve el primer problema del formulario, o `null` si se puede enviar. */
export function validateReportForm({ template, title, periodStart, periodEnd }) {
  if (!TEMPLATE_TO_API[template]) return 'Elige una plantilla'
  if (!periodStart || !periodEnd) return 'Indica la fecha inicial y la final'
  const start = parseDate(periodStart)
  const end = parseDate(periodEnd)
  if (!start || !end) return 'Las fechas no son válidas'
  if (start > end) return 'La fecha inicial no puede ser posterior a la final'
  if (daysBetween(start, end) + 1 > MAX_PERIOD_DAYS) {
    return `Un reporte no puede cubrir más de ${MAX_PERIOD_DAYS} días`
  }
  if ((title ?? '').trim().length > MAX_TITLE_LENGTH) {
    return `El título no puede superar ${MAX_TITLE_LENGTH} caracteres`
  }
  return null
}

// ---------- llamadas ----------

export async function generateReport(form) {
  const problem = validateReportForm(form)
  if (problem) throw new Error(problem)
  const title = (form.title ?? '').trim()
  const created = await api.post('/reports', {
    template: TEMPLATE_TO_API[form.template],
    title: title || null,
    period_start: form.periodStart,
    period_end: form.periodEnd,
    timezone: CITY.timezone,
    // Un valor que no tenga traducción es un error de programación: mejor fallar que
    // mandar un filtro mutilado y generar un reporte con otro alcance del que se pidió.
    types: toApiList(form.types, TYPE_TO_API, 'tipo'),
    severities: toApiList(form.severities, SEVERITY_TO_API, 'severidad'),
    statuses: toApiList(form.statuses, STATUS_TO_API, 'estado'),
  })
  return toUiReport(created)
}

export async function listReports({ limit = 10, offset = 0, signal } = {}) {
  const page = await api.get('/reports', { signal, params: { limit, offset } })
  return {
    items: page.items.map(toUiReport),
    total: page.total,
    limit: page.limit,
    offset: page.offset,
  }
}

/**
 * Serie temporal y anomalías del reporte, pedidas con exactamente su ventana y sus filtros
 * (los guardados en el servidor, no los del formulario).
 */
export async function getReportDetail(report, { recentLimit = 8, signal } = {}) {
  const filters = {
    type: toApiList(report.filters.types, TYPE_TO_API, 'tipo'),
    severity: toApiList(report.filters.severities, SEVERITY_TO_API, 'severidad'),
    status: toApiList(report.filters.statuses, STATUS_TO_API, 'estado'),
    date_from: report.detectedFrom,
    date_to: report.detectedTo,
  }
  const granularity = grainFor(report)
  const [stats, recent] = await Promise.all([
    api.get('/road-incidents/stats', {
      signal,
      params: { ...filters, granularity, timezone: report.timezone, hotspots_limit: 1 },
    }),
    api.get('/road-incidents', { signal, params: { ...filters, limit: recentLimit, offset: 0 } }),
  ])

  const live = {
    total: stats.total,
    bySeverity: mapCounts(stats.by_severity, SEVERITY_TO_UI, 'severidad'),
    byType: mapCounts(stats.by_type, TYPE_TO_UI, 'tipo'),
  }
  return {
    granularity,
    timeline: stats.timeline.map((point) => {
      const start = parseDate(point.period_start)
      return {
        label: periodLabel(start, granularity),
        detail: periodDetail(start, granularity, report),
        value: point.total,
      }
    }),
    recent: recent.items.map(toUiIncident),
    recentTotal: recent.total,
    live,
    drift: compareWithSnapshot(report.summary, live, recent.total),
  }
}

// ---------- traducción e integridad ----------

/**
 * Reporte de la API con la forma que usan las pantallas. Si las cifras no cuadran entre sí
 * (un desglose que no suma el total) el reporte se marca como no íntegro en vez de pintarse:
 * un documento oficial con números contradictorios es peor que ninguno.
 */
export function toUiReport(report) {
  const problems = []
  const safe = (fn, fallback) => {
    try {
      return fn()
    } catch (error) {
      problems.push(error.message)
      return fallback
    }
  }

  const summary = report.summary ?? {}
  const bySeverity = safe(() => mapCounts(summary.by_severity, SEVERITY_TO_UI, 'severidad'), {})
  const byType = safe(() => mapCounts(summary.by_type, TYPE_TO_UI, 'tipo'), {})
  const byStatus = safe(() => mapCounts(summary.by_status, STATUS_TO_UI, 'estado'), {})
  const total = Number.isInteger(summary.total) && summary.total >= 0 ? summary.total : NaN
  if (Number.isNaN(total)) problems.push('El total del reporte no es válido')

  if (problems.length === 0) {
    for (const [name, counts] of [['severidad', bySeverity], ['tipo', byType], ['estado', byStatus]]) {
      if (sum(counts) !== total) problems.push(`El desglose por ${name} no suma el total (${total})`)
    }
    const pending = PENDING_UI.reduce((acc, s) => acc + byStatus[s], 0)
    if (summary.pending !== pending) problems.push('Los pendientes no coinciden con el desglose por estado')
    if (summary.resolved !== byStatus.atendido) problems.push('Los atendidos no coinciden con el desglose por estado')
  }

  const filters = report.filters ?? {}
  return {
    id: report.id,
    code: report.code,
    template: TEMPLATE_TO_UI[report.template] ?? safe(() => fail(`Plantilla desconocida: ${report.template}`), null),
    title: report.title,
    periodStart: report.period_start,
    periodEnd: report.period_end,
    timezone: report.timezone,
    detectedFrom: report.detected_from,
    detectedTo: report.detected_to,
    filters: {
      types: safe(() => toUiList(filters.types, TYPE_TO_UI, 'tipo'), []),
      severities: safe(() => toUiList(filters.severities, SEVERITY_TO_UI, 'severidad'), []),
      statuses: safe(() => toUiList(filters.statuses, STATUS_TO_UI, 'estado'), []),
    },
    summary: {
      total,
      pending: summary.pending,
      resolved: summary.resolved,
      bySeverity,
      byType,
      byStatus,
    },
    createdByName: report.created_by_name,
    createdAt: report.created_at,
    integrityProblems: problems,
  }
}

/**
 * Diferencias entre la foto guardada y lo que hay hoy con los mismos filtros. Son normales
 * (una anomalía atendida sale de un filtro «pendientes», una detección tardía entra en el
 * periodo), pero quien lee el reporte tiene que saber que la gráfica y la tabla son de hoy.
 */
function compareWithSnapshot(snapshot, live, listedTotal) {
  const changes = []
  if (live.total !== snapshot.total) changes.push(`total: ${snapshot.total} → ${live.total}`)
  for (const [key, value] of Object.entries(snapshot.bySeverity)) {
    if (live.bySeverity[key] !== value) changes.push(`severidad ${key}: ${value} → ${live.bySeverity[key]}`)
  }
  for (const [key, value] of Object.entries(snapshot.byType)) {
    if (live.byType[key] !== value) changes.push(`${key}: ${value} → ${live.byType[key]}`)
  }
  // Las dos consultas en vivo deben contar lo mismo; si no, algo cambió entre una y otra.
  const inconsistent = listedTotal !== live.total
  return { changed: changes.length > 0, changes, inconsistent }
}

/** Conteos por enum → por palabra de la interfaz. Exige todas las claves y ninguna extra. */
function mapCounts(counts, table, name) {
  if (!counts || typeof counts !== 'object') fail(`Falta el desglose por ${name}`)
  const result = {}
  for (const [key, value] of Object.entries(counts)) {
    if (!(key in table)) fail(`Valor de ${name} desconocido: ${key}`)
    if (!Number.isInteger(value) || value < 0) fail(`Conteo inválido para ${name} ${key}`)
    result[table[key]] = value
  }
  for (const [key, ui] of Object.entries(table)) {
    if (!(ui in result)) fail(`Falta ${name} ${key} en el desglose`)
  }
  return result
}

function toApiList(values = [], table, name) {
  return [...new Set(values)].map((value) => table[value] ?? fail(`Valor de ${name} desconocido: ${value}`))
}

function toUiList(values = [], table, name) {
  return values.map((value) => table[value] ?? fail(`Valor de ${name} desconocido: ${value}`))
}

function fail(message) {
  throw new Error(message)
}

function sum(counts) {
  return Object.values(counts).reduce((acc, n) => acc + n, 0)
}

// ---------- calendario ----------
// Fechas de calendario como Date en UTC a medianoche, igual que en statistics.js.

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** Día en un periodo corto, semana en uno de hasta cuatro meses y mes en adelante. */
function grainFor(report) {
  const days = daysBetween(parseDate(report.periodStart), parseDate(report.periodEnd)) + 1
  if (days <= 31) return 'day'
  if (days <= 120) return 'week'
  return 'month'
}

function periodLabel(start, granularity) {
  if (granularity === 'month') return `${MONTHS[start.getUTCMonth()]} ${start.getUTCFullYear()}`
  return `${start.getUTCDate()} ${MONTHS[start.getUTCMonth()]}`
}

/** La semana o el mes del servidor puede empezar antes del reporte: se recorta al periodo. */
function periodDetail(start, granularity, report) {
  if (granularity === 'day') return formatDate(start)
  const first = parseDate(report.periodStart)
  const last = parseDate(report.periodEnd)
  const end =
    granularity === 'week'
      ? addDays(start, 6)
      : addDays(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1)), -1)
  const from = start < first ? first : start
  const to = end > last ? last : end
  return `${formatDate(from)} – ${formatDate(to)}`
}

export function parseDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '')
  if (!match) return null
  const [, y, m, d] = match.map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  // Rechaza fechas como 2026-02-31, que Date corrige en silencio.
  return date.getUTCMonth() === m - 1 && date.getUTCDate() === d ? date : null
}

function daysBetween(a, b) {
  return Math.round((b - a) / 86400000)
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 86400000)
}

/** `2026-08-01` → `01 ago 2026`. Acepta Date (calendario) o texto ISO de fecha. */
export function formatDate(value) {
  const date = value instanceof Date ? value : parseDate(value)
  if (!date) return '—'
  return `${String(date.getUTCDate()).padStart(2, '0')} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

/** Instante → `02/09/2026 08:14` en hora de la ciudad, no del navegador. */
export function formatInstant(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: CITY.timezone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

/** Hoy en la ciudad de la operación, como `YYYY-MM-DD`. */
export function cityTodayIso(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: CITY.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

/** El mes anterior completo: el periodo por defecto de un informe mensual. */
export function previousMonth(todayIso = cityTodayIso()) {
  const today = parseDate(todayIso)
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1))
  const end = addDays(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)), -1)
  return { periodStart: start.toISOString().slice(0, 10), periodEnd: end.toISOString().slice(0, 10) }
}

/** Los últimos siete días hasta hoy: el periodo por defecto del resumen de cuadrillas. */
export function lastWeek(todayIso = cityTodayIso()) {
  const today = parseDate(todayIso)
  return { periodStart: addDays(today, -6).toISOString().slice(0, 10), periodEnd: todayIso }
}
