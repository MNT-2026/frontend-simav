import { useTheme } from '../theme/ThemeProvider'
import logoDark from '../assets/brand/simav-logo-dark.png'
import logoLight from '../assets/brand/simav-logo-light.png'
import markDark from '../assets/brand/simav-mark-dark.png'
import markLight from '../assets/brand/simav-mark-light.png'

/**
 * Logo de SIMAV. El original es blanco y azul, pensado para fondos oscuros (Dark y Night);
 * sobre Light lo blanco pasa a azul oscuro para que se lea.
 *
 * `variant="mark"` es solo el símbolo (menú colapsado). `surface` fuerza la variante para
 * superficies que no siguen el tema, como la hoja siempre blanca del informe.
 */
const SOURCES = {
  full: { light: logoLight, dark: logoDark },
  mark: { light: markLight, dark: markDark },
}

export default function BrandLogo({ variant = 'full', height = 30, surface, className = '' }) {
  const { theme } = useTheme()
  const tone = (surface ?? theme) === 'light' ? 'light' : 'dark'
  return (
    <img
      src={SOURCES[variant][tone]}
      alt="SIMAV"
      className={`brand-logo ${className}`}
      style={{ height }}
      draggable={false}
    />
  )
}
