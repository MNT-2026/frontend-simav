/**
 * Cliente HTTP de la API de ROADVISION.
 * Única puerta de salida a la red: el resto del frontend no llama a fetch.
 */

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace(/\/$/, '')

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

async function request(path, { method = 'GET', body, params, signal } = {}) {
  let response
  try {
    response = await fetch(`${BASE_URL}${path}${buildQuery(params)}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError('No pudimos contactar con el servidor', { status: 0 })
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
