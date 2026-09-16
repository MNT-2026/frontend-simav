/** Estadísticas de anomalías: `GET /road-incidents/stats`, ya traducidas a la interfaz. */

import { api } from './client'
import { CITY } from './geo'
import { SEVERITY_TO_UI, TYPE_TO_UI } from './mappers'

const GRANULARITY_TO_API = { Día: 'day', Semana: 'week', Mes: 'month' }

// Cuántos periodos completos muestra cada granularidad, contando el actual.
const PERIODS = { Día: 30, Semana: 12, Mes: 12 }

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

/**
 * Pide las estadísticas de los últimos N periodos hasta ahora. La ventana empieza al inicio
 * de un periodo (en hora de la ciudad) para que el primer punto de la serie no salga cortado.
 */
export async function getStatistics({ grain = 'Semana', hotspotsLimit = 20, signal } = {}) {
  const now = new Date()
  const from = windowStart(grain, cityToday(now))
  const stats = await api.get('/road-incidents/stats', {
    signal,
    params: {
      date_from: `${isoDate(from)}T00:00:00${CITY.utcOffset}`,
      date_to: now.toISOString(),
      granularity: GRANULARITY_TO_API[grain],
      timezone: CITY.timezone,
      hotspots_limit: hotspotsLimit,
    },
  })
  return toUiStatistics(stats, grain, from, cityToday(now))
}

function toUiStatistics(stats, grain, from, today) {
  return {
    total: stats.total,
    previousTotal: stats.previous_period_total,
    // null cuando no hay con qué comparar: mejor no decir nada que inventar un +100%.
    changePct:
      stats.previous_period_total > 0
        ? ((stats.total - stats.previous_period_total) / stats.previous_period_total) * 100
        : null,
    bySeverity: renameKeys(stats.by_severity, SEVERITY_TO_UI),
    byType: renameKeys(stats.by_type, TYPE_TO_UI),
    highUnreviewed: stats.high_unreviewed,
    rangeLabel: `${formatDay(from)} – ${formatDay(today)} ${today.getUTCFullYear()}`,
    timeline: stats.timeline.map((point, i, all) => {
      const start = parseDate(point.period_start)
      const current = i === all.length - 1
      return {
        label: periodLabel(start, grain),
        // Lo que se lee al pasar el cursor o hacer clic: el periodo completo, sin abreviar.
        detail: periodDetail(start, grain) + (current ? ' · en curso' : ''),
        start,
        total: point.total,
        bySeverity: renameKeys(point.by_severity, SEVERITY_TO_UI),
        byType: renameKeys(point.by_type, TYPE_TO_UI),
      }
    }),
    hotspots: stats.hotspots.map((cell, i) => {
      const bySeverity = renameKeys(cell.by_severity, SEVERITY_TO_UI)
      return {
        id: `${i}:${cell.latitude}:${cell.longitude}`,
        lat: cell.latitude,
        lon: cell.longitude,
        count: cell.count,
        bySeverity,
        level: dominantSeverity(bySeverity),
      }
    }),
  }
}

/** La severidad con más anomalías en la zona; a igualdad manda la más grave. */
function dominantSeverity(bySeverity) {
  return ['alta', 'media', 'baja'].reduce((best, s) => (bySeverity[s] > bySeverity[best] ? s : best), 'alta')
}

function renameKeys(counts, table) {
  return Object.fromEntries(Object.entries(counts).map(([key, n]) => [table[key] ?? key, n]))
}

// ---------- calendario ----------
// Las fechas de calendario se manejan como Date en UTC a medianoche: así la aritmética de
// días no depende de la zona horaria del navegador.

/** Fecha de hoy en la ciudad de la operación, aunque el navegador esté en otra zona. */
function cityToday(now) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CITY.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
  return parseDate(parts)
}

function windowStart(grain, today) {
  const n = PERIODS[grain]
  if (grain === 'Día') return addDays(today, -(n - 1))
  if (grain === 'Semana') {
    const monday = addDays(today, -((today.getUTCDay() + 6) % 7))
    return addDays(monday, -7 * (n - 1))
  }
  return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - (n - 1), 1))
}

/** Etiqueta corta del eje X: la fecha en que empieza el periodo, que es lo que se reconoce. */
function periodLabel(start, grain) {
  if (grain === 'Mes') return `${MONTHS[start.getUTCMonth()]} ${start.getUTCFullYear()}`
  // Día y semana: «14 sep». En semanas es el lunes con que empieza.
  return formatDay(start, { pad: false })
}

/** Texto completo del periodo para el recuadro de detalle. */
function periodDetail(start, grain) {
  if (grain === 'Día') {
    return `${WEEKDAYS[start.getUTCDay()]} ${formatDay(start, { pad: false })} ${start.getUTCFullYear()}`
  }
  if (grain === 'Semana') {
    const end = addDays(start, 6)
    const sameMonth = start.getUTCMonth() === end.getUTCMonth()
    const sameYear = start.getUTCFullYear() === end.getUTCFullYear()
    const from = sameMonth
      ? String(start.getUTCDate())
      : formatDay(start, { pad: false }) + (sameYear ? '' : ` ${start.getUTCFullYear()}`)
    return `Semana del ${from} al ${formatDay(end, { pad: false })} ${end.getUTCFullYear()}`
  }
  return `${MONTH_NAMES[start.getUTCMonth()]} ${start.getUTCFullYear()}`
}

function parseDate(iso) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function isoDate(date) {
  return date.toISOString().slice(0, 10)
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 86400000)
}

function formatDay(date, { pad = true } = {}) {
  const day = pad ? String(date.getUTCDate()).padStart(2, '0') : String(date.getUTCDate())
  return `${day} ${MONTHS[date.getUTCMonth()]}`
}
