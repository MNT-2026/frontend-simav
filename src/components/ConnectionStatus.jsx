import { useEffect, useState } from 'react'
import { checkHealth } from '../api/inspections'

const POLL_MS = 30000

/**
 * Estado de la conexión con la API, sondeando `GET /health`.
 * Solo se hace visible cuando algo va mal: en verde no distrae.
 */
export default function ConnectionStatus() {
  const [online, setOnline] = useState(null)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    const ping = async () => {
      try {
        await checkHealth({ signal: controller.signal })
        if (!cancelled) setOnline(true)
      } catch (error) {
        if (!cancelled && error.name !== 'AbortError') setOnline(false)
      }
    }

    ping()
    const timer = setInterval(ping, POLL_MS)
    return () => {
      cancelled = true
      controller.abort()
      clearInterval(timer)
    }
  }, [])

  if (online !== false) return null

  return (
    <span
      className="badge high"
      title="El backend no responde. Los datos mostrados pueden estar desactualizados."
    >
      <i />
      Sin conexión
    </span>
  )
}
