import Icon from './Icon'
import { SEVERITY_CLASS, SEVERITY_LABEL, STATUS_LABEL } from '../data/mock'

export function Button({ variant = 'default', size, icon, loading, children, ...rest }) {
  const cls = ['btn', variant !== 'default' && variant, size, !children && 'icon']
    .filter(Boolean)
    .join(' ')
  return (
    <button className={cls} {...rest}>
      {loading ? <span className="spinner" /> : icon ? <Icon name={icon} size={15} strokeWidth={1.9} /> : null}
      {children}
    </button>
  )
}

export function Card({ children, style, className = '', ...rest }) {
  return (
    <div className={`card ${className}`} style={style} {...rest}>
      {children}
    </div>
  )
}

export function CardHead({ title, question, children }) {
  return (
    <div className="card-head">
      <div>
        <div className="card-title">{title}</div>
        {question && <div className="card-q">{question}</div>}
      </div>
      {children}
    </div>
  )
}

export function SeverityBadge({ value }) {
  return (
    <span className={`badge ${SEVERITY_CLASS[value] ?? 'neutral'}`}>
      <i />
      {SEVERITY_LABEL[value] ?? value}
    </span>
  )
}

export function StatusBadge({ value }) {
  return (
    <span className={`status ${value}`}>
      <i />
      {STATUS_LABEL[value] ?? value}
    </span>
  )
}

export function Confidence({ value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span className="meter">
        <span style={{ width: `${value}%` }} />
      </span>
      <span className="mono" style={{ fontWeight: 700 }}>
        {value}%
      </span>
    </div>
  )
}

export function Checkbox({ checked, indeterminate, onChange, label }) {
  return (
    <span
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={label}
      tabIndex={0}
      className={`checkbox ${checked || indeterminate ? 'on' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onChange?.(!checked)
      }}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          onChange?.(!checked)
        }
      }}
    >
      {indeterminate ? (
        <Icon name="minus" size={11} strokeWidth={3.4} />
      ) : checked ? (
        <Icon name="check" size={11} strokeWidth={3.4} />
      ) : null}
    </span>
  )
}

export function Switch({ checked, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`switch ${checked ? 'on' : ''}`}
      onClick={() => onChange?.(!checked)}
    />
  )
}

export function Skeleton({ w = '100%', h = 11, style }) {
  return <span className="skeleton" style={{ display: 'block', width: w, height: h, ...style }} />
}

export function EmptyState({ title, description, actions }) {
  return (
    <div className="empty">
      <svg width="112" height="76" viewBox="0 0 112 76" aria-hidden="true">
        <rect x="6" y="10" width="100" height="58" rx="8" fill="var(--line-2)" />
        <path d="M6 40h100" stroke="var(--line)" strokeWidth="2" />
        <path d="M46 10v58" stroke="var(--line)" strokeWidth="2" />
        <circle cx="46" cy="40" r="13" fill="none" stroke="var(--sub)" strokeWidth="2.5" strokeDasharray="4 4" />
        <path d="m56 50 9 9" stroke="var(--sub)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <h3>{title}</h3>
      <p>{description}</p>
      {actions && <div style={{ display: 'flex', gap: 9, marginTop: 16 }}>{actions}</div>}
    </div>
  )
}

export function ErrorState({ title, description, code, onRetry }) {
  return (
    <div className="empty">
      <div className="state-icon" style={{ background: 'var(--high-soft)', color: 'var(--high)' }}>
        <Icon name="alert" size={24} strokeWidth={2} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <div style={{ display: 'flex', gap: 9, marginTop: 16 }}>
        <Button variant="dark" onClick={onRetry}>
          Reintentar
        </Button>
        <Button>Ver estado del sistema</Button>
      </div>
      {code && (
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--sub)', marginTop: 14 }}>
          {code}
        </div>
      )}
    </div>
  )
}

export function Modal({ open, tone = 'med', title, description, confirmLabel, onConfirm, onClose }) {
  if (!open) return null
  const color = tone === 'high' ? 'var(--high)' : tone === 'low' ? 'var(--low)' : 'var(--med)'
  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body">
          <div
            className="state-icon"
            style={{ background: `${color}22`, color, width: 38, height: 38, borderRadius: 11 }}
          >
            <Icon name={tone === 'low' ? 'ok' : 'warn'} size={20} strokeWidth={2} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 12 }}>
            {title}
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 7, lineHeight: 1.6 }}>
            {description}
          </div>
        </div>
        <div className="modal-foot">
          <Button style={{ flex: 1 }} onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" style={{ flex: 1 }} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function Pager({ page, pages, total, range, onPage }) {
  const nums = []
  for (let i = 1; i <= Math.min(pages, 4); i++) nums.push(i)
  return (
    <div className="pager">
      <span className="muted" style={{ fontSize: 12 }}>
        Mostrando <b style={{ color: 'var(--ink)' }}>{range}</b> de{' '}
        <b style={{ color: 'var(--ink)' }}>{total.toLocaleString('es')}</b> registros
      </span>
      <span className="spacer" />
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <button className="pg" disabled={page === 1} onClick={() => onPage(page - 1)} aria-label="Anterior">
          ‹
        </button>
        {nums.map((n) => (
          <button key={n} className={`pg ${n === page ? 'on' : ''}`} onClick={() => onPage(n)}>
            {n}
          </button>
        ))}
        {pages > 5 && <span style={{ color: 'var(--sub)', fontWeight: 700, padding: '0 3px' }}>…</span>}
        {pages > 4 && (
          <button className={`pg ${pages === page ? 'on' : ''}`} onClick={() => onPage(pages)}>
            {pages}
          </button>
        )}
        <button className="pg" disabled={page === pages} onClick={() => onPage(page + 1)} aria-label="Siguiente">
          ›
        </button>
      </div>
    </div>
  )
}

export function Delta({ value, invert }) {
  const up = value > 0
  const bad = invert ? !up : up
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        color: bad ? 'var(--high-ink)' : 'var(--low-ink)',
        fontWeight: 700,
      }}
    >
      <Icon name={up ? 'arrowUp' : 'arrowDown'} size={12} strokeWidth={3} />
      {Math.abs(value)}%
    </span>
  )
}
