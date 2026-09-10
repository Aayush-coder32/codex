import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const AuthContext = createContext(null)
const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const roleLabels = { student: 'Student', faculty: 'Faculty', company: 'Company', admin: 'Admin' }

async function authRequest(path, { method = 'POST', body } = {}) {
  let response
  try {
    response = await fetch(`${apiBaseUrl}/api/v1/auth/${path}`, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Unable to reach the SkillBridge API. Please try again in a moment.')
  }

  const payload = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) throw new Error(payload?.error?.message || 'The request could not be completed.')
  return payload?.data
}

function createSession(data) {
  const role = data.user.role.toLowerCase()
  const initials = data.user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

  return {
    role,
    accessToken: data.accessToken,
    user: { ...data.user, role: roleLabels[role] || data.user.role, initials },
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    authRequest('refresh')
      .then((data) => setSession(createSession(data)))
      .catch(() => setSession(null))
      .finally(() => setInitializing(false))
  }, [])

  const login = useCallback(async (credentials) => {
    const nextSession = createSession(await authRequest('login', { body: credentials }))
    setSession(nextSession)
    return nextSession
  }, [])

  const register = useCallback(async (details) => {
    const nextSession = createSession(await authRequest('register', { body: details }))
    setSession(nextSession)
    return nextSession
  }, [])

  const logout = useCallback(async () => {
    try {
      await authRequest('logout')
    } catch {
      // Clear the browser session even if the API is temporarily unavailable.
    } finally {
      setSession(null)
    }
  }, [])

  const forgotPassword = useCallback((email) => authRequest('forgot-password', { body: { email } }), [])

  return <AuthContext.Provider value={{
    session,
    user: session?.user,
    role: session?.role,
    accessToken: session?.accessToken,
    initializing,
    login,
    register,
    logout,
    forgotPassword,
  }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
