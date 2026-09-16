/**
 * Geografía de la operación: Ibagué (Tolima, código DANE 73001).
 *
 * El mapa es real (Leaflet + teselas de OpenStreetMap), así que aquí solo viven el
 * encuadre inicial y la traducción de un área visible a los filtros de la API.
 */

// Colombia no tiene horario de verano: el desfase es fijo todo el año.
export const CITY = {
  name: 'Ibagué',
  center: [4.4389, -75.2105],
  zoom: 13,
  timezone: 'America/Bogota',
  utcOffset: '-05:00',
}

/** Área de cobertura de la operación: el casco urbano de Ibagué con algo de margen. */
export const CITY_BOUNDS = {
  minLatitude: 4.39,
  minLongitude: -75.28,
  maxLatitude: 4.49,
  maxLongitude: -75.12,
}

/** `LatLngBounds` de Leaflet → el mismo formato que `CITY_BOUNDS`. */
export function fromLeafletBounds(bounds) {
  return {
    minLatitude: round(bounds.getSouth()),
    minLongitude: round(bounds.getWest()),
    maxLatitude: round(bounds.getNorth()),
    maxLongitude: round(bounds.getEast()),
  }
}

/** Los cuatro parámetros que espera `GET /road-incidents` para filtrar por área. */
export function toBoundsParams(bounds = CITY_BOUNDS) {
  return {
    min_latitude: Math.max(-90, bounds.minLatitude),
    min_longitude: Math.max(-180, bounds.minLongitude),
    max_latitude: Math.min(90, bounds.maxLatitude),
    max_longitude: Math.min(180, bounds.maxLongitude),
  }
}

function round(value) {
  return Math.round(value * 1e5) / 1e5
}
