import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Field'
import { AuthLayout } from './AuthLayout'

export function RegisterPage() {
  const { isAuthenticated, register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (isAuthenticated) return <Navigate to="/classes" replace />

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await register(form)
      navigate('/classes', { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title="Join the room"
      subtitle="Create an account to start booking classes."
      footer={
        <>
          Already a member?{' '}
          <Link to="/login" className="font-semibold text-volt-300 hover:text-volt-400">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Input
          label="Full name"
          autoComplete="name"
          required
          minLength={2}
          value={form.fullName}
          onChange={set('fullName')}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={set('email')}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          hint="At least 6 characters."
          value={form.password}
          onChange={set('password')}
          error={error ?? undefined}
        />
        <Button type="submit" size="lg" loading={busy} fullWidth className="mt-2">
          Create account
        </Button>
      </form>
    </AuthLayout>
  )
}
