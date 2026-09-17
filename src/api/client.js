/**
 * Cliente HTTP de la API de ROADVISION.
 * Única puerta de salida a la red: el resto del frontend no llama a fetch.
 */

/**
 * En producción la API se sirve bajo el mismo dominio del panel: Vercel reenvía `/api/*`
 * al backend (ver vercel.json). Así las cookies de sesión son del mismo sitio y el panel
 * puede leer la cookie CSRF, algo imposible si la API viviera en otro dominio.
 */
const DEFAULT_API_URL = import.meta.env.PROD ? '/api/v1' : 'http://localhost:8000/api/v1'
const BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '')

/** Error de la API con el código HTTP, para que las pantallas distingan un 404 de una caída. */
export class ApiError extends Error {
  constructor(message, { status, detail } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status ?? 0
    this.detail = detail
  }

  get isNotFound() {
    return this.status === 404
  }

  get isUnauthorized() {
    return this.status === 401
  }

  /** Sin red o con la base caída: la pantalla ofrece reintentar en vez de culpar al usuario. */
  get isUnavailable() {
    return this.status === 0 || this.status === 503
  }
}

/** Descarta los valores vacíos para no mandar `?status=undefined`. */
function buildQuery(params = {}) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.append(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

const CSRF_COOKIE = 'simav_csrf'
const CSRF_HEADER = 'X-CSRF-Token'
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

/** La cookie CSRF es legible a propósito: se reenvía en una cabecera (double-submit). */
function readCsrfToken() {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

/** El AuthProvider se suscribe aquí para enterarse de que la sesión se perdió. */
let onUnauthorized = () => {}
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler ?? (() => {})
}

async function send(path, { method = 'GET', body, params, signal } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (!SAFE_METHODS.has(method)) {
    const csrf = readCsrfToken()
    if (csrf) headers[CSRF_HEADER] = csrf
  }
  try {
    return await fetch(`${BASE_URL}${path}${buildQuery(params)}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal,
      // Los tokens viajan en cookies HttpOnly: sin esto el navegador no las manda.
      credentials: 'include',
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError('No pudimos contactar con el servidor', { status: 0 })
  }
}

/** Una sola renovación en vuelo aunque fallen varias peticiones a la vez. */
let refreshing = null
function refreshSession() {
  refreshing ??= send('/auth/refresh', { method: 'POST' })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

// Las rutas de sesión no disparan la renovación automática: evita bucles y reintentos absurdos.
const SESSION_PATHS = new Set(['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'])

async function request(path, options = {}) {
  const method = options.method ?? 'GET'
  let response = await send(path, options)

  // El access dura minutos: si caducó, se renueva con la cookie de refresco y se reintenta.
  if (response.status === 401 && !SESSION_PATHS.has(path)) {
    if (await refreshSession()) response = await send(path, options)
    if (response.status === 401) onUnauthorized()
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), {
      status: response.status,
      detail: `${method} ${path} · ${response.status}`,
    })
  }

  return response.status === 204 ? null : response.json()
}

async function readErrorMessage(response) {
  try {
    const body = await response.json()
    // FastAPI devuelve `detail` como texto o como lista de errores de validación.
    if (typeof body.detail === 'string') return body.detail
    if (Array.isArray(body.detail)) return body.detail.map((e) => e.msg).join(' · ')
  } catch {
    /* respuesta sin cuerpo JSON */
  }
  return `El servidor respondió ${response.status}`
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
}

export { BASE_URL }
