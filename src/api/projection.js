/**
 * Proyección entre coordenadas geográficas y el lienzo del mapa vectorial.
 *
 * `RoadMap.jsx` dibuja sobre un `viewBox="0 0 1200 840"` inventado, no sobre teselas
 * reales. Hasta que exista un mapa de verdad, proyectamos linealmente el área de
 * cobertura sobre ese lienzo: las posiciones relativas entre marcadores son correctas,
 * pero no coinciden con las calles dibujadas.
 */

export const MAP_WIDTH = 1200
export const MAP_HEIGHT = 840

/** Área de cobertura de la operación. Ajustar cuando cambie la ciudad. */
export const CITY_BOUNDS = {
  minLatitude: 4.6,
  minLongitude: -74.1,
  maxLatitude: 4.69,
  maxLongitude: -74.03,
}

/** Coordenadas geográficas → punto del `viewBox`. La latitud crece hacia arriba, la y hacia abajo. */
export function toCanvas({ lat, lon }, bounds = CITY_BOUNDS) {
  const x = ratio(lon, bounds.minLongitude, bounds.maxLongitude) * MAP_WIDTH
  const y = (1 - ratio(lat, bounds.minLatitude, bounds.maxLatitude)) * MAP_HEIGHT
  return { x: clamp(x, 0, MAP_WIDTH), y: clamp(y, 0, MAP_HEIGHT) }
}

/** Los cuatro parámetros que espera `GET /road-incidents` para filtrar por área. */
export function toBoundsParams(bounds = CITY_BOUNDS) {
  return {
    min_latitude: bounds.minLatitude,
    min_longitude: bounds.minLongitude,
    max_latitude: bounds.maxLatitude,
    max_longitude: bounds.maxLongitude,
  }
}

function ratio(value, min, max) {
  return max === min ? 0.5 : (value - min) / (max - min)
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
