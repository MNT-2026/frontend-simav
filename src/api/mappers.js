/**
 * Traducción entre el vocabulario del backend (inglés, canónico) y el de la interfaz
 * (español). La API nunca ve palabras en español y las pantallas nunca ven enums.
 */

export const TYPE_TO_UI = {
  POTHOLE: 'Bache',
  CRACK: 'Grieta',
  ROAD_DAMAGE: 'Daño en vía',
}
export const TYPE_TO_API = invert(TYPE_TO_UI)

export const SEVERITY_TO_UI = { HIGH: 'alta', MEDIUM: 'media', LOW: 'baja' }
export const SEVERITY_TO_API = invert(SEVERITY_TO_UI)

/**
 * El backend no tiene un estado equivalente a «en seguimiento»: su flujo es
 * ACTIVE → VERIFIED → RESOLVED, con DISMISSED como descarte.
 */
export const STATUS_TO_UI = {
  ACTIVE: 'nuevo',
  VERIFIED: 'revisado',
  RESOLVED: 'atendido',
  DISMISSED: 'descartado',
}
export const STATUS_TO_API = invert(STATUS_TO_UI)

export const SOURCE_TO_UI = {
  SMARTPHONE: 'Smartphone',
  VEHICLE_CAMERA: 'Cámara de vehículo',
  UPLOADED_VIDEO: 'Video cargado',
}

export const INSPECTION_STATUS_TO_UI = {
  CREATED: 'creado',
  RECORDING: 'grabando',
  PROCESSING: 'procesando',
  COMPLETED: 'completado',
  FAILED: 'fallido',
}

function invert(table) {
  return Object.fromEntries(Object.entries(table).map(([api, ui]) => [ui, api]))
}

/** `2026-09-02T08:14:00Z` → `02/09 08:14`, el formato que usan las tablas. */
export function formatDateTime(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  return `${dd}/${mm} ${hh}:${mi}`
}

/**
 * Una anomalía de la API con la forma que consumen las pantallas.
 *
 * Los campos que el backend todavía no modela (dirección, ruta, cámara, vehículo) llegan
 * como `null`: las pantallas los pintan como «—» en vez de inventarlos.
 */
export function toUiIncident(incident) {
  return {
    id: incident.id,
    shortId: shortId(incident.id),
    inspectionId: incident.inspection_id,
    type: TYPE_TO_UI[incident.type] ?? incident.type,
    severity: SEVERITY_TO_UI[incident.severity] ?? incident.severity,
    status: STATUS_TO_UI[incident.status] ?? incident.status,
    // El dominio maneja la confianza de 0 a 1; la interfaz la muestra en porcentaje.
    confidence: Math.round(incident.confidence * 100),
    lat: incident.latitude,
    lon: incident.longitude,
    evidenceUrl: incident.evidence_url,
    date: formatDateTime(incident.detected_at),
    detectedAt: incident.detected_at,
    createdAt: incident.created_at,
    location: null,
    route: null,
    camera: null,
    vehicle: null,
  }
}

export function toUiInspection(inspection) {
  return {
    id: inspection.id,
    shortId: shortId(inspection.id),
    status: INSPECTION_STATUS_TO_UI[inspection.status] ?? inspection.status,
    sourceType: SOURCE_TO_UI[inspection.source_type] ?? inspection.source_type,
    deviceId: inspection.device_id,
    startedAt: inspection.started_at,
    finishedAt: inspection.finished_at,
    date: formatDateTime(inspection.started_at),
  }
}

/** Un UUID no cabe en una columna de tabla; los 8 primeros caracteres sí y bastan para leer. */
export function shortId(uuid) {
  return String(uuid).slice(0, 8).toUpperCase()
}
