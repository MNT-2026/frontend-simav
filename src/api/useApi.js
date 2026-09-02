import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Ejecuta una llamada a la API y devuelve `{ data, loading, error, reload }`.
 *
 * `deps` funciona como en `useEffect`: cuando cambian, se vuelve a pedir y se cancela la
 * petición anterior, así una respuesta lenta no pisa a una más reciente.
 */
export function useApi(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const [nonce, setNonce] = useState(0)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false

    setState((prev) => ({ ...prev, loading: true, error: null }))
    fetcherRef
      .current({ signal: controller.signal })
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((error) => {
        if (cancelled || error.name === 'AbortError') return
        setState({ data: null, loading: false, error })
      })

    return () => {
      cancelled = true
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  return { ...state, reload }
}
