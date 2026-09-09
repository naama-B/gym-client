import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { setAuthToken, setUnauthorizedHandler } from '../api/client'
import { authApi } from '../api/endpoints'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../api/types'

const STORAGE_KEY = 'pulse.auth'

interface AuthContextValue {
  user: AuthResponse | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (body: LoginRequest) => Promise<void>
  register: (body: RegisterRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStored(): AuthResponse | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthResponse
    if (!parsed.accessToken || !parsed.expiresAtUtc) return null
    if (new Date(parsed.expiresAtUtc).getTime() <= Date.now()) return null
    return parsed
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(() => {
    const stored = readStored()
    if (stored) setAuthToken(stored.accessToken)
    return stored
  })
  const persist = useCallback((next: AuthResponse | null) => {
    setUser(next)
    setAuthToken(next?.accessToken ?? null)
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* storage unavailable — session stays in memory only */
    }
  }, [])

  const logout = useCallback(() => persist(null), [persist])

  const login = useCallback(
    async (body: LoginRequest) => {
      persist(await authApi.login(body))
    },
    [persist],
  )

  const register = useCallback(
    async (body: RegisterRequest) => {
      persist(await authApi.register(body))
    },
    [persist],
  )

  // A 401 from any authenticated request drops the session.
  useEffect(() => {
    setUnauthorizedHandler(() => persist(null))
    return () => setUnauthorizedHandler(null)
  }, [persist])

  // Auto-logout when the token expires while the tab is open.
  useEffect(() => {
    if (!user) return
    const ms = new Date(user.expiresAtUtc).getTime() - Date.now()
    const timer = window.setTimeout(logout, Math.max(0, ms))
    return () => window.clearTimeout(timer)
  }, [user, logout])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user != null,
      isAdmin: user?.role === 'Admin',
      login,
      register,
      logout,
    }),
    [user, login, register, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): AuthContextValue {
  const ctx = use(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
