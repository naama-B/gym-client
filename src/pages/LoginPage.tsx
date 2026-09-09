import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Field'
import { AuthLayout } from './AuthLayout'

const demos = [
  { label: 'Admin', email: 'admin@gym.local', password: 'Admin#123' },
  { label: 'Member', email: 'dana@gym.local', password: 'Member#123' },
]

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/classes'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (isAuthenticated) return <Navigate to={from} replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to book classes and manage your queue."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-semibold text-volt-300 hover:text-volt-400">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error ?? undefined}
        />
        <Button type="submit" size="lg" loading={busy} fullWidth className="mt-2">
          Sign in
        </Button>
      </form>

      <div className="mt-6 rounded-xl border border-ink-700 bg-ink-900/60 p-3">
        <p className="font-display text-[11px] uppercase tracking-[0.12em] text-smoke">
          Demo accounts
        </p>
        <div className="mt-2 flex gap-2">
          {demos.map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => {
                setEmail(d.email)
                setPassword(d.password)
                setError(null)
              }}
              className="flex-1 rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-left text-[13px] transition-colors hover:border-volt-400"
            >
              <span className="font-display font-semibold uppercase tracking-wide text-chalk">
                {d.label}
              </span>
              <span className="block truncate text-smoke">{d.email}</span>
            </button>
          ))}
        </div>
      </div>
    </AuthLayout>
  )
}
