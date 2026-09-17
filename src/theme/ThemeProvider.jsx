import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)

export const THEMES = [
  { id: 'light', label: 'Light', icon: 'sun', hint: 'Turnos diurnos y oficina' },
  { id: 'dark', label: 'Dark', icon: 'moon', hint: 'Salas de control iluminadas' },
  { id: 'night', label: 'Night', icon: 'night', hint: 'Turnos nocturnos · máximo contraste' },
]

// Las claves conservan el nombre anterior (ROADVISION) para no perder el tema ya guardado.
const KEY = 'roadvision:theme'
const MOTION_KEY = 'roadvision:motion'

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(KEY) || 'light')
  const [reducedMotion, setReducedMotion] = useState(
    () => localStorage.getItem(MOTION_KEY) === '1'
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(KEY, theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion ? 'reduced' : 'full'
    localStorage.setItem(MOTION_KEY, reducedMotion ? '1' : '0')
  }, [reducedMotion])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      reducedMotion,
      setReducedMotion,
      cycle: () => {
        const i = THEMES.findIndex((t) => t.id === theme)
        setTheme(THEMES[(i + 1) % THEMES.length].id)
      },
    }),
    [theme, reducedMotion]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>')
  return ctx
}
