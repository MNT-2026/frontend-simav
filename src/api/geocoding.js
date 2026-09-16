/**
 * Nombre legible de un punto (calle y barrio) con Nominatim, la geocodificación inversa
 * gratuita de OpenStreetMap. Es la única llamada de red que no va a nuestra API.
 *
 * Su política de uso pide como máximo una petición por segundo y guardar en caché lo ya
 * resuelto: las peticiones salen en fila y los nombres se guardan en localStorage.
 */

import { useEffect, useState } from 'react'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'
const CACHE_KEY = 'roadvision:geocoding'
const MIN_INTERVAL_MS = 1100

let queue = Promise.resolve()
let lastRequestAt = 0

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeCache(key, name) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...readCache(), [key]: name }))
  } catch {
    /* sin almacenamiento: se vuelve a pedir la próxima vez */
  }
}

// ~11 m de precisión: dos zonas casi en el mismo sitio comparten nombre y caché.
const cacheKey = (lat, lon) => `${lat.toFixed(4)},${lon.toFixed(4)}`

/** «Calle 67 · La Pola», o `null` si Nominatim no sabe o no responde. */
export function reverseGeocode(lat, lon, { signal } = {}) {
  const key = cacheKey(lat, lon)
  const cached = readCache()[key]
  if (cached !== undefined) return Promise.resolve(cached)

  const task = queue.then(async () => {
    if (signal?.aborted) throw new DOMException('Cancelado', 'AbortError')
    const wait = lastRequestAt + MIN_INTERVAL_MS - Date.now()
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
    lastRequestAt = Date.now()

    const params = new URLSearchParams({
      format: 'jsonv2',
      lat: String(lat),
      lon: String(lon),
      zoom: '17',
      'accept-language': 'es',
    })
    const response = await fetch(`${NOMINATIM_URL}?${params}`, { signal })
    if (!response.ok) return null
    const { address = {} } = await response.json()
    const street = address.road ?? address.pedestrian ?? null
    const area = address.neighbourhood ?? address.suburb ?? address.quarter ?? null
    const name = [street, area].filter(Boolean).join(' · ') || null
    writeCache(key, name)
    return name
  })
  // Un fallo no debe atascar la fila para las siguientes.
  queue = task.catch(() => {})
  return task
}

/** `{ [id]: nombre }` para una lista de puntos `{ id, lat, lon }`, rellenándose poco a poco. */
export function usePlaceNames(points) {
  const [names, setNames] = useState({})
  const signature = points.map((p) => p.id).join('|')

  useEffect(() => {
    const controller = new AbortController()
    for (const point of points) {
      reverseGeocode(point.lat, point.lon, { signal: controller.signal })
        .then((name) => setNames((prev) => ({ ...prev, [point.id]: name })))
        .catch(() => {})
    }
    return () => controller.abort()
    // La firma de ids basta: los puntos cambian cuando cambian sus ids.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature])

  return names
}
