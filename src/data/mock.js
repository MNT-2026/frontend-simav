/**
 * Datos de muestra. Sustituir por la API real de ROADVISION.
 * Nombres de rutas, direcciones y personas son ficticios.
 */

export const user = { name: 'Sofía Marín', role: 'Administrador', initials: 'SM' }

export const kpis = {
  total: 147,
  potholes: 82,
  cracks: 65,
  critical: 23,
  criticalUnreviewed: 9,
  km: 35.7,
  camerasActive: 8,
  camerasTotal: 10,
}

export const severityBreakdown = [
  { id: 'alta', label: 'Alta · requiere acción', count: 23, pct: 15.6, sla: 'SLA 48 h · 9 sin revisar', color: 'var(--high)' },
  { id: 'media', label: 'Media · programar', count: 59, pct: 40.2, sla: 'SLA 15 días', color: 'var(--med)' },
  { id: 'baja', label: 'Baja · monitorear', count: 65, pct: 44.2, sla: 'Sin SLA', color: 'var(--low)' },
]

export const weeklyTrend = [
  { label: 'S26', value: 18 },
  { label: 'S27', value: 21 },
  { label: 'S28', value: 20 },
  { label: 'S29', value: 27 },
  { label: 'S30', value: 25 },
  { label: 'S31', value: 32 },
  { label: 'S32', value: 30 },
  { label: 'S33', value: 38 },
  { label: 'S34', value: 42 },
]

export const criticalTrend = [4, 5, 7, 6, 9, 8, 11, 13, 16]

export const typeByMonth = [
  { label: 'Abr', potholes: 10, cracks: 8 },
  { label: 'May', potholes: 12, cracks: 9 },
  { label: 'Jun', potholes: 14, cracks: 7 },
  { label: 'Jul', potholes: 16, cracks: 9 },
  { label: 'Ago', potholes: 19, cracks: 9 },
  { label: 'Sep', potholes: 21, cracks: 10 },
]

export const hotspots = [
  { zone: 'Av. Troncal km 3–6', count: 38, level: 'alta' },
  { zone: 'Centro histórico', count: 27, level: 'media' },
  { zone: 'Circular Norte', count: 21, level: 'media' },
  { zone: 'Zona industrial', count: 13, level: 'baja' },
  { zone: 'Ruta Sur km 8–11', count: 9, level: 'baja' },
]

/** Marcadores del mapa en coordenadas del viewBox 0 0 1200 840. */
export const mapMarkers = [
  { id: 'IGB-00231', x: 560, y: 286, severity: 'alta' },
  { id: 'IGB-00225', x: 340, y: 440, severity: 'alta' },
  { id: 'IGB-00229', x: 850, y: 178, severity: 'media' },
  { id: 'IGB-00228', x: 248, y: 558, severity: 'media' },
  { id: 'IGB-00222', x: 1010, y: 128, severity: 'media' },
  { id: 'IGB-00227', x: 430, y: 366, severity: 'baja' },
  { id: 'IGB-00226', x: 700, y: 240, severity: 'baja' },
  { id: 'IGB-00223', x: 150, y: 670, severity: 'baja' },
  { id: 'IGB-00219', x: 1120, y: 80, severity: 'baja' },
  { id: 'IGB-00221', x: 940, y: 300, severity: 'baja' },
]

export const mapClusters = [
  { id: 'c1', x: 760, y: 120, count: 18, severity: 'alta' },
  { id: 'c2', x: 270, y: 500, count: 7, severity: 'media' },
]

const rows = [
  ['IGB-00231', 'Bache', 'alta', 'Av. Troncal km 4.2', 94, 'CAM-03', 'BUS-117', '02/09 08:14', 'nuevo', 4.65124, -74.0721, 4.2, 'Troncal Norte–Centro'],
  ['IGB-00230', 'Grieta', 'alta', 'Calle 8 con carrera 21', 91, 'CAM-07', 'BUS-204', '02/09 08:06', 'nuevo', 4.64891, -74.06982, 2.8, 'Circular Centro'],
  ['IGB-00229', 'Bache', 'media', 'Carrera 12 con 45', 88, 'CAM-03', 'BUS-117', '02/09 07:52', 'revisado', 4.6442, -74.0756, 3.1, 'Troncal Norte–Centro'],
  ['IGB-00228', 'Grieta', 'media', 'Av. Norte km 1.8', 86, 'CAM-01', 'BUS-088', '02/09 07:33', 'seguimiento', 4.66013, -74.0614, 1.8, 'Ruta Sur'],
  ['IGB-00227', 'Bache', 'baja', 'Calle 30 sur', 79, 'CAM-05', 'BUS-142', '02/09 07:10', 'atendido', 4.61244, -74.08491, 7.4, 'Troncal Oriente'],
  ['IGB-00226', 'Grieta', 'baja', 'Diagonal 5 con 60', 76, 'CAM-09', 'BUS-311', '01/09 19:44', 'atendido', 4.62987, -74.09122, 5.9, 'Circular Norte'],
  ['IGB-00225', 'Bache', 'alta', 'Av. Troncal km 6.9', 96, 'CAM-03', 'BUS-117', '01/09 18:21', 'seguimiento', 4.65771, -74.07005, 6.9, 'Troncal Norte–Centro'],
  ['IGB-00224', 'Grieta', 'media', 'Calle 14 con 3', 83, 'CAM-06', 'BUS-204', '01/09 17:02', 'revisado', 4.6394, -74.07833, 2.2, 'Circular Centro'],
  ['IGB-00223', 'Bache', 'baja', 'Carrera 30 con 72', 74, 'CAM-02', 'BUS-055', '01/09 15:38', 'atendido', 4.66521, -74.05567, 9.1, 'Alimentadora Oeste'],
  ['IGB-00222', 'Bache', 'media', 'Av. Circunvalar km 2.1', 87, 'CAM-08', 'BUS-311', '01/09 14:15', 'revisado', 4.67103, -74.04912, 2.1, 'Circular Norte'],
  ['IGB-00221', 'Grieta', 'media', 'Calle 22 sur con 14', 82, 'CAM-01', 'BUS-088', '01/09 12:47', 'atendido', 4.62218, -74.08874, 8.6, 'Ruta Sur'],
  ['IGB-00220', 'Bache', 'alta', 'Av. Troncal km 4.6', 93, 'CAM-03', 'BUS-117', '01/09 11:05', 'atendido', 4.65339, -74.07361, 4.6, 'Troncal Norte–Centro'],
  ['IGB-00219', 'Grieta', 'baja', 'Transversal 9 con 41', 71, 'CAM-05', 'BUS-142', '01/09 09:22', 'atendido', 4.63456, -74.0829, 5.3, 'Troncal Oriente'],
  ['IGB-00218', 'Bache', 'media', 'Calle 60 con 18', 85, 'CAM-06', 'BUS-204', '31/08 18:40', 'revisado', 4.64102, -74.06611, 3.4, 'Circular Centro'],
  ['IGB-00217', 'Grieta', 'alta', 'Av. Troncal km 2.8', 92, 'CAM-03', 'BUS-117', '31/08 16:12', 'seguimiento', 4.64988, -74.07742, 2.8, 'Troncal Norte–Centro'],
  ['IGB-00216', 'Bache', 'baja', 'Carrera 7 con 90', 77, 'CAM-02', 'BUS-055', '31/08 14:29', 'atendido', 4.67219, -74.05011, 10.2, 'Alimentadora Oeste'],
]

export const incidents = rows.map(
  ([id, type, severity, location, confidence, camera, vehicle, date, status, lat, lon, km, route]) => ({
    id,
    type,
    severity,
    location,
    confidence,
    camera,
    vehicle,
    date,
    status,
    lat,
    lon,
    km,
    route,
  })
)

export const incidentTimeline = {
  'IGB-00231': [
    { key: 'detectado', label: 'Detectado', when: '02/09 · 08:14', who: 'IA ROADVISION', done: true },
    { key: 'revisado', label: 'Revisado', when: '02/09 · 09:02', who: 'Sofía Marín', done: true },
    { key: 'seguimiento', label: 'En seguimiento', when: '02/09 · 11:40', who: 'Cuadrilla Norte 2', current: true },
    { key: 'atendido', label: 'Atendido', when: 'Pendiente · SLA 48 h', who: '' },
  ],
}

export const cameras = [
  { id: 'CAM-03', vehicle: 'BUS-117', status: 'activa', lastSeen: 'hace 12 s', km: 9.4, incidents: 41, route: 'Troncal Norte–Centro', confidence: 89, firmware: '2.4.1' },
  { id: 'CAM-01', vehicle: 'BUS-088', status: 'activa', lastSeen: 'hace 8 s', km: 6.2, incidents: 22, route: 'Ruta Sur', confidence: 86, firmware: '2.4.1' },
  { id: 'CAM-02', vehicle: 'BUS-055', status: 'activa', lastSeen: 'hace 21 s', km: 4.8, incidents: 15, route: 'Alimentadora Oeste', confidence: 84, firmware: '2.3.9' },
  { id: 'CAM-05', vehicle: 'BUS-142', status: 'activa', lastSeen: 'hace 6 s', km: 5.1, incidents: 18, route: 'Troncal Oriente', confidence: 88, firmware: '2.4.1' },
  { id: 'CAM-06', vehicle: 'BUS-204', status: 'activa', lastSeen: 'hace 14 s', km: 3.6, incidents: 11, route: 'Circular Centro', confidence: 85, firmware: '2.4.1' },
  { id: 'CAM-07', vehicle: 'BUS-204', status: 'activa', lastSeen: 'hace 9 s', km: 3.6, incidents: 14, route: 'Circular Centro', confidence: 87, firmware: '2.4.1' },
  { id: 'CAM-09', vehicle: 'BUS-311', status: 'activa', lastSeen: 'hace 33 s', km: 2.1, incidents: 9, route: 'Circular Norte', confidence: 83, firmware: '2.3.9' },
  { id: 'CAM-10', vehicle: 'BUS-311', status: 'activa', lastSeen: 'hace 40 s', km: 0.9, incidents: 4, route: 'Circular Norte', confidence: 81, firmware: '2.3.9' },
  { id: 'CAM-08', vehicle: 'BUS-311', status: 'advertencia', lastSeen: 'hace 14 min · lente sucio', km: 1.2, incidents: 13, route: 'Circular Norte', confidence: 71, firmware: '2.3.9' },
  { id: 'CAM-04', vehicle: null, status: 'offline', lastSeen: 'hace 2 d 4 h', km: 0, incidents: 0, route: '—', confidence: 0, firmware: '2.2.4' },
]

export const vehicles = [
  { id: 'BUS-117', cameras: ['CAM-03'], route: 'Troncal Norte–Centro', status: 'transmitiendo', lastTx: 'hace 12 s', km: 24.6, kmAnalyzed: 9.4, incidents: 41, driver: 'J. Ramírez · turno 2' },
  { id: 'BUS-204', cameras: ['CAM-06', 'CAM-07'], route: 'Circular Centro', status: 'transmitiendo', lastTx: 'hace 9 s', km: 18.2, kmAnalyzed: 7.2, incidents: 25, driver: 'L. Ortega · turno 1' },
  { id: 'BUS-088', cameras: ['CAM-01'], route: 'Ruta Sur', status: 'advertencia', lastTx: 'hace 3 min', km: 15.7, kmAnalyzed: 6.2, incidents: 22, driver: 'M. Duarte · turno 2' },
  { id: 'BUS-055', cameras: ['CAM-02'], route: 'Alimentadora Oeste', status: 'transmitiendo', lastTx: 'hace 21 s', km: 12.9, kmAnalyzed: 4.8, incidents: 15, driver: 'A. Peña · turno 1' },
  { id: 'BUS-142', cameras: ['CAM-05'], route: 'Troncal Oriente', status: 'transmitiendo', lastTx: 'hace 6 s', km: 19.4, kmAnalyzed: 5.1, incidents: 18, driver: 'R. Cano · turno 2' },
  { id: 'BUS-311', cameras: ['CAM-08', 'CAM-09', 'CAM-10'], route: 'Circular Norte', status: 'transmitiendo', lastTx: 'hace 33 s', km: 21.1, kmAnalyzed: 4.2, incidents: 26, driver: 'S. Vidal · turno 1' },
  { id: 'BUS-076', cameras: [], route: 'Alimentadora Este', status: 'offline', lastTx: 'hace 1 d', km: 6.5, kmAnalyzed: 0, incidents: 0, driver: '—' },
  { id: 'BUS-290', cameras: [], route: 'Reserva', status: 'offline', lastTx: '—', km: 10, kmAnalyzed: 0, incidents: 0, driver: '—' },
]

export const notifications = [
  { id: 1, tone: 'high', title: '2 incidentes críticos nuevos', desc: 'Av. Troncal km 4.2 · hace 6 min', unread: true },
  { id: 2, tone: 'med', title: 'CAM-08 con lente sucio', desc: 'Confianza media 71% · hace 14 min', unread: true },
  { id: 3, tone: 'neutral', title: 'Reporte de agosto disponible', desc: 'REP-2026-08-014 · ayer', unread: false },
]

export const SEVERITY_LABEL = { alta: 'Alta', media: 'Media', baja: 'Baja' }
export const SEVERITY_CLASS = { alta: 'high', media: 'med', baja: 'low' }
export const STATUS_LABEL = {
  nuevo: 'Nuevo',
  revisado: 'Revisado',
  seguimiento: 'En seguimiento',
  atendido: 'Atendido',
  descartado: 'Descartado',
  activa: 'Activa',
  advertencia: 'Advertencia',
  offline: 'Offline',
  transmitiendo: 'Transmitiendo',
}
