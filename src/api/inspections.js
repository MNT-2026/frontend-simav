/** Recorridos de captura: `/road-inspections`. */

import { api } from './client'
import { toUiInspection } from './mappers'

const STATUS_TO_API = {
  creado: 'CREATED',
  grabando: 'RECORDING',
  procesando: 'PROCESSING',
  completado: 'COMPLETED',
  fallido: 'FAILED',
}

export async function listInspections({ status, deviceId, limit = 20, offset = 0, signal } = {}) {
  const page = await api.get('/road-inspections', {
    signal,
    params: { status: STATUS_TO_API[status], device_id: deviceId, limit, offset },
  })
  return {
    items: page.items.map(toUiInspection),
    total: page.total,
    limit: page.limit,
    offset: page.offset,
  }
}

export async function getInspection(id, { signal } = {}) {
  return toUiInspection(await api.get(`/road-inspections/${id}`, { signal }))
}

export async function createInspection({ sourceType = 'VEHICLE_CAMERA', deviceId = null } = {}) {
  return toUiInspection(
    await api.post('/road-inspections', { source_type: sourceType, device_id: deviceId })
  )
}

/** Avanza el ciclo de vida. El backend rechaza con 409 las transiciones ilegales. */
export async function updateInspectionStatus(id, uiStatus) {
  const status = STATUS_TO_API[uiStatus] ?? uiStatus
  return toUiInspection(await api.patch(`/road-inspections/${id}/status`, { status }))
}

/** ¿Responde el backend? Lo usa el indicador de conexión de la cabecera. */
export async function checkHealth({ signal } = {}) {
  await api.get('/health', { signal })
  return true
}
