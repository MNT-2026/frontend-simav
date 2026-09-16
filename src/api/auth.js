import { api } from './client'

const ROLES = { OWNER: 'Propietario', ADMIN: 'Administrador', MEMBER: 'Miembro' }

/** Iniciales para el avatar: primera letra de las dos primeras palabras del nombre. */
function initialsOf(name) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

/** `{ user, tenant }` del backend → lo que pinta la interfaz. */
function toSession({ user, tenant }) {
  return {
    id: user.id,
    email: user.email,
    name: user.full_name,
    initials: initialsOf(user.full_name || user.email),
    role: ROLES[user.role] ?? user.role,
    tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
  }
}

export async function login(email, password) {
  return toSession(await api.post('/auth/login', { email, password }))
}

/** Sesión actual a partir de las cookies; lanza 401 si no hay ninguna. */
export async function getCurrentUser(options) {
  return toSession(await api.get('/auth/me', options))
}

export function logout() {
  return api.post('/auth/logout')
}
