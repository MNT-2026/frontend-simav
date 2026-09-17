import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import Icon from '../components/Icon'
import { Button } from '../components/ui'
import { useAuth } from '../auth/AuthProvider'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { status, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // A donde se quería ir antes de que RequireAuth mandara aquí.
  const destino = location.state?.from ?? '/dashboard'

  if (status === 'autenticado') return <Navigate to={destino} replace />

  const submit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Escribe tu correo y tu contraseña.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate(destino, { replace: true })
    } catch (err) {
      setError(
        err.isUnavailable
          ? 'No pudimos contactar con el servidor. Inténtalo de nuevo en unos segundos.'
          : err.isUnauthorized
            ? 'Correo o contraseña incorrectos.'
            : err.message
      )
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <div className="login-pane">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BrandLogo height={72} />
        </div>

        <form onSubmit={submit} style={{ margin: 'auto 0', padding: '36px 0' }}>
          <h1>Bienvenida de nuevo.</h1>
          <p className="muted" style={{ fontSize: 14, marginTop: 10, lineHeight: 1.5 }}>
            Accede al centro de control de infraestructura vial de tu ciudad.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 34 }}>
            <div>
              <label className="flabel" htmlFor="email">
                Correo institucional
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Icon
                  name="mail"
                  size={16}
                  strokeWidth={1.8}
                  style={{ position: 'absolute', left: 11, color: 'var(--sub)' }}
                />
                <input
                  id="email"
                  type="email"
                  className="field"
                  style={{ paddingLeft: 35, height: 44 }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="flabel" htmlFor="pass">
                Contraseña
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Icon
                  name="lock"
                  size={16}
                  strokeWidth={1.8}
                  style={{ position: 'absolute', left: 11, color: 'var(--sub)' }}
                />
                <input
                  id="pass"
                  type={show ? 'text' : 'password'}
                  className={`field ${error ? 'invalid' : ''}`}
                  style={{ paddingLeft: 35, paddingRight: 40, height: 44 }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  style={{
                    position: 'absolute',
                    right: 10,
                    border: 0,
                    background: 'transparent',
                    color: 'var(--mut)',
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                >
                  <Icon name="eye" size={17} strokeWidth={1.8} />
                </button>
              </div>
              {error ? (
                <div className="ferror">
                  <Icon name="alert" size={13} strokeWidth={2.2} />
                  {error}
                </div>
              ) : (
                <div className="fhint">Mínimo 10 caracteres</div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
                <span
                  className={`checkbox ${remember ? 'on' : ''}`}
                  onClick={() => setRemember((v) => !v)}
                  style={{ borderRadius: 5 }}
                >
                  {remember && <Icon name="check" size={11} strokeWidth={3.4} />}
                </span>
                Mantener sesión activa
              </label>
              <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: 12.5 }}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button variant="primary" type="submit" loading={loading} style={{ height: 46, fontSize: 14 }}>
              {loading ? 'Entrando…' : 'Entrar al sistema'}
              {!loading && <Icon name="arrowRight" size={17} strokeWidth={2.4} />}
            </Button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--sub)', fontSize: 11, fontWeight: 700 }}>
              <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              O CONTINÚA CON
              <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>

            <Button
              type="button"
              style={{ height: 44 }}
              disabled
              title="El acceso por directorio corporativo todavía no está disponible"
            >
              <Icon name="shield" size={16} strokeWidth={1.9} />
              Directorio corporativo (SSO)
            </Button>
          </div>
        </form>

        <div className="sub-text" style={{ fontSize: 11, lineHeight: 1.6 }}>
          Acceso restringido a personal autorizado de la Secretaría de Movilidad.
          <br />
          Toda actividad queda registrada ·{' '}
          <a href="#" onClick={(e) => e.preventDefault()}>
            Política de uso
          </a>
        </div>
      </div>

      <div className="login-hero">
        <svg width="100%" height="100%" viewBox="0 0 880 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <radialGradient id="glow" cx="52%" cy="38%" r="62%">
              <stop offset="0%" stopColor="#0E2350" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#061024" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#03060d" />
            </radialGradient>
            <linearGradient id="route" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#4C8DFF" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#4C8DFF" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <rect width="880" height="900" fill="url(#glow)" />
          <g stroke="#101B2E" strokeWidth="1" fill="none" opacity="0.9">
            <path d="M0 120h880M0 240h880M0 360h880M0 480h880M0 600h880M0 720h880M0 840h880" />
            <path d="M110 0v900M220 0v900M330 0v900M440 0v900M550 0v900M660 0v900M770 0v900" />
          </g>
          <g stroke="#17263C" strokeWidth="7" fill="none" strokeLinecap="round">
            <path d="M-20 620 C160 560 260 470 440 430 C600 394 700 300 900 250" />
            <path d="M120 900 C180 700 260 620 440 560 C620 500 700 380 880 340" />
            <path d="M0 300h880" />
            <path d="M560 0v900" />
          </g>
          <path
            d="M-20 620 C160 560 260 470 440 430 C600 394 700 300 900 250"
            fill="none"
            stroke="url(#route)"
            strokeWidth="3"
            strokeDasharray="14 10"
            strokeLinecap="round"
          />
          <circle cx="440" cy="430" r="30" fill="#4C8DFF" opacity="0.12" />
          <circle cx="440" cy="430" r="9" fill="#4C8DFF" />
          <circle cx="248" cy="516" r="20" fill="#F2665A" opacity="0.14" />
          <circle cx="248" cy="516" r="7" fill="#F2665A" />
          <circle cx="646" cy="330" r="20" fill="#EFA648" opacity="0.14" />
          <circle cx="646" cy="330" r="7" fill="#EFA648" />
          <circle cx="150" cy="690" r="6" fill="#2CC0A8" />
          <circle cx="760" cy="286" r="6" fill="#2CC0A8" />
          <text x="64" y="140" fill="#25344A" fontFamily="IBM Plex Mono, monospace" fontSize="12" letterSpacing="3">
            LAT 4.6512 · LON −74.0721
          </text>
        </svg>

        <div className="hero-stat" style={{ top: 96, right: 64, width: 230 }}>
          <div className="l">Kilómetros analizados hoy</div>
          <div className="v mono">35.7 km</div>
          <div style={{ fontSize: 11, color: '#8090a4', fontWeight: 600, marginTop: 2 }}>
            8 cámaras · 6 vehículos en ruta
          </div>
        </div>
        <div className="hero-stat" style={{ bottom: 200, left: 64, width: 214 }}>
          <div className="l">Detecciones IA · 7 días</div>
          <div className="v mono">147</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8, fontSize: 11, fontWeight: 700 }}>
            <span style={{ color: '#F2665A' }}>■ 23 altas</span>
            <span style={{ color: '#EFA648' }}>■ 59 medias</span>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 64,
            bottom: 88,
            right: 64,
            color: '#5b6a7d',
            fontSize: 12.5,
            fontWeight: 600,
            lineHeight: 1.6,
            maxWidth: 420,
          }}
        >
          Detección automática de baches y grietas a partir de cámaras embarcadas en la flota de
          transporte público.
        </div>
      </div>
    </div>
  )
}
