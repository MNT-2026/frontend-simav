import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import Icon from './Icon'

const ToastContext = createContext(null)

const TONE = {
  success: { icon: 'check', color: 'var(--low)' },
  error: { icon: 'alert', color: 'var(--high)' },
  info: { icon: 'download', color: 'var(--acc-bright)' },
}

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])

  const dismiss = useCallback((id) => setItems((v) => v.filter((t) => t.id !== id)), [])

  const push = useCallback((toast) => {
    const id = Math.random().toString(36).slice(2)
    setItems((v) => [...v, { id, tone: 'info', ...toast }])
    return id
  }, [])

  const update = useCallback(
    (id, patch) => setItems((v) => v.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    []
  )

  return (
    <ToastContext.Provider value={{ push, update, dismiss }}>
      {children}
      <div className="toasts">
        {items.map((t) => (
          <Toast key={t.id} {...t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function Toast({ id, tone, title, desc, progress, action, ttl = 4200, onClose }) {
  useEffect(() => {
    if (progress != null) return
    const t = setTimeout(onClose, ttl)
    return () => clearTimeout(t)
  }, [progress, ttl, onClose])

  const { icon, color } = TONE[tone] ?? TONE.info
  return (
    <div className="toast" role="status">
      <span className="tico" style={{ background: `${color}28`, color }}>
        <Icon name={icon} size={16} strokeWidth={2.3} />
      </span>
      <div style={{ flex: 1 }}>
        <div className="ttitle">{title}</div>
        {desc && <div className="tdesc">{desc}</div>}
        {progress != null && (
          <div className="progress">
            <span style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      {action && (
        <button className="tclose" style={{ color: 'var(--acc-bright)', fontSize: 11.5, fontWeight: 800, opacity: 1 }} onClick={action.onClick}>
          {action.label}
        </button>
      )}
      <button className="tclose" onClick={onClose} aria-label="Cerrar aviso">
        ×
      </button>
    </div>
  )
}

export function useToasts() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToasts debe usarse dentro de <ToastProvider>')
  return ctx
}

/** Exportación simulada: muestra progreso y termina en éxito. */
export function useFakeExport() {
  const { push, update, dismiss } = useToasts()
  return useCallback(
    (label, desc) => {
      const id = push({ tone: 'info', title: `Preparando ${label}`, desc, progress: 8 })
      let p = 8
      const timer = setInterval(() => {
        p += 14 + Math.random() * 12
        if (p >= 100) {
          clearInterval(timer)
          dismiss(id)
          push({
            tone: 'success',
            title: `${label} lista`,
            desc: desc,
            action: { label: 'Descargar', onClick: () => {} },
          })
        } else {
          update(id, { progress: Math.round(p) })
        }
      }, 340)
    },
    [push, update, dismiss]
  )
}
