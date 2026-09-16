import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import * as authApi from '../api/auth'
import { setUnauthorizedHandler } from '../api/client'

const AuthContext = createContext(null)

/**
 * Sesión del usuario. Los tokens viven en cookies HttpOnly, así que aquí solo se guarda
 * quién es: `status` es `comprobando` al arrancar, y luego `autenticado` o `anonimo`.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('comprobando')

  useEffect(() => {
    const controller = new AbortController()
    authApi
      .getCurrentUser({ signal: controller.signal })
      .then((current) => {
        setUser(current)
        setStatus('autenticado')
      })
      .catch((error) => {
        if (error.name === 'AbortError') return
        setUser(null)
        setStatus('anonimo')
      })
    return () => controller.abort()
  }, [])

  // Si una petición cualquiera recibe 401 tras intentar renovar, la sesión se da por perdida.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null)
      setStatus('anonimo')
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  const login = useCallback(async (email, password) => {
    const current = await authApi.login(email, password)
    setUser(current)
    setStatus('autenticado')
    return current
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      // Aunque el servidor falle, en este navegador se sale.
      setUser(null)
      setStatus('anonimo')
    }
  }, [])

  const value = useMemo(() => ({ user, status, login, logout }), [user, status, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}

/** Ruta protegida: sin sesión manda al login recordando a dónde se quería ir. */
export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'comprobando') {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
        <span className="spinner" aria-label="Comprobando sesión" />
      </div>
    )
  }
  if (status === 'anonimo') {
    return <Navigate to="/" replace state={{ from: location.pathname + location.search }} />
  }
  return <Outlet />
}
