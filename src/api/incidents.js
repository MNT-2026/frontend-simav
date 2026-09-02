/** Anomalías viales: `GET/PATCH /road-incidents` y el alta bajo un recorrido. */

import { api } from './client'
import { SEVERITY_TO_API, STATUS_TO_API, TYPE_TO_API, toUiIncident } from './mappers'

/**
 * Lista paginada. Los filtros llegan en español desde la interfaz y salen como enums.
 * `bounds` recorta por área geográfica (lo que necesita el mapa).
 */
export async function listIncidents({
  severity,
  status,
  type,
  inspectionId,
  minConfidence,
  bounds,
  limit = 20,
  offset = 0,
  signal,
} = {}) {
  const page = await api.get('/road-incidents', {
    signal,
    params: {
      severity: SEVERITY_TO_API[severity],
      status: STATUS_TO_API[status],
      type: TYPE_TO_API[type],
      inspection_id: inspectionId,
      min_confidence: minConfidence,
      ...(bounds ?? {}),
      limit,
      offset,
    },
  })
  return {
    items: page.items.map(toUiIncident),
    total: page.total,
    limit: page.limit,
    offset: page.offset,
  }
}

/** Solo el total, sin traer las filas: para los KPIs del panel. */
export async function countIncidents(filters = {}) {
  const page = await listIncidents({ ...filters, limit: 1, offset: 0 })
  return page.total
}

export async function getIncident(id, { signal } = {}) {
  return toUiIncident(await api.get(`/road-incidents/${id}`, { signal }))
}

/** Avanza la revisión. El backend rechaza con 409 las transiciones ilegales. */
export async function updateIncidentStatus(id, uiStatus) {
  const status = STATUS_TO_API[uiStatus]
  if (!status) throw new Error(`Estado desconocido: ${uiStatus}`)
  return toUiIncident(await api.patch(`/road-incidents/${id}/status`, { status }))
}

/** Registra una detección dentro de un recorrido existente. */
export async function registerIncident(inspectionId, { type, lat, lon, confidence, severity, detectedAt, evidenceUrl }) {
  const created = await api.post(`/road-inspections/${inspectionId}/incidents`, {
    type: TYPE_TO_API[type] ?? type,
    latitude: lat,
    longitude: lon,
    // La interfaz trabaja en porcentaje; el dominio, de 0 a 1.
    confidence: confidence > 1 ? confidence / 100 : confidence,
    severity: SEVERITY_TO_API[severity] ?? severity,
    detected_at: detectedAt ?? new Date().toISOString(),
    evidence_url: evidenceUrl ?? null,
  })
  return toUiIncident(created)
}
