import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { CalendarPlus, ChevronDown, ListOrdered, X } from 'lucide-react'
import { errorMessage } from '../../api/client'
import {
  useCancelSession,
  useClassTypes,
  useCreateSession,
  useInstructors,
  useSessions,
  useWaitlist,
} from '../../api/queries'
import type { ClassSessionResponse } from '../../api/types'
import { formatDay, formatTime, isPast, localInputToUtcIso, toLocalInputValue } from '../../lib/format'
import { cn } from '../../lib/cn'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ErrorState } from '../../components/ui/ErrorState'
import { Input, Select } from '../../components/ui/Field'
import { LoadingBlock } from '../../components/ui/Spinner'
import { useToast } from '../../components/ui/Toast'

function defaultStart() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(18, 0, 0, 0)
  return toLocalInputValue(d)
}

export function AdminSessionsPage() {
  const toast = useToast()
  const classTypes = useClassTypes()
  const instructors = useInstructors()
  const create = useCreateSession()
  const sessions = useSessions({ page: 1, pageSize: 50, sortBy: 'startsAt', sortDescending: false })

  const [form, setForm] = useState({
    classTypeId: '',
    instructorId: '',
    startsAt: defaultStart(),
    capacity: '',
  })
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const created = await create.mutateAsync({
        classTypeId: Number(form.classTypeId),
        instructorId: Number(form.instructorId),
        startsAtUtc: localInputToUtcIso(form.startsAt),
        capacity: form.capacity ? Number(form.capacity) : null,
      })
      toast.success('Session scheduled', `${created.classTypeName} · ${formatDay(created.startsAtUtc)}`)
      setForm((f) => ({ ...f, capacity: '' }))
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const upcoming = useMemo(
    () => (sessions.data?.items ?? []).filter((s) => !isPast(s.startsAtUtc)),
    [sessions.data],
  )
  const ready = classTypes.data && instructors.data

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      {/* Create */}
      <Card className="h-fit p-5 lg:sticky lg:top-24">
        <div className="mb-4 flex items-center gap-2">
          <CalendarPlus className="size-5 text-volt-400" />
          <h2 className="font-display text-lg uppercase tracking-tight">New session</h2>
        </div>

        {classTypes.isError || instructors.isError ? (
          <ErrorState error={classTypes.error ?? instructors.error} />
        ) : !ready ? (
          <LoadingBlock label="Loading catalogue" />
        ) : classTypes.data!.length === 0 || instructors.data!.length === 0 ? (
          <p className="text-sm text-ash">
            Add at least one{' '}
            <Link to="/admin/class-types" className="font-semibold text-volt-300">
              class type
            </Link>{' '}
            and{' '}
            <Link to="/admin/instructors" className="font-semibold text-volt-300">
              instructor
            </Link>{' '}
            first.
          </p>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <Select
              label="Class type"
              required
              value={form.classTypeId}
              onChange={(e) => setForm((f) => ({ ...f, classTypeId: e.target.value }))}
            >
              <option value="">Select…</option>
              {classTypes.data!.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.durationMinutes}m · cap {c.defaultCapacity}
                </option>
              ))}
            </Select>
            <Select
              label="Instructor"
              required
              value={form.instructorId}
              onChange={(e) => setForm((f) => ({ ...f, instructorId: e.target.value }))}
            >
              <option value="">Select…</option>
              {instructors.data!.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.fullName}
                </option>
              ))}
            </Select>
            <Input
              label="Starts at"
              type="datetime-local"
              required
              value={form.startsAt}
              onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
            />
            <Input
              label="Capacity"
              type="number"
              min={1}
              max={500}
              placeholder="Default for the class type"
              hint="Leave blank to use the class type's default."
              value={form.capacity}
              onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
              error={error ?? undefined}
            />
            <Button type="submit" loading={create.isPending} fullWidth>
              Schedule session
            </Button>
          </form>
        )}
      </Card>

      {/* List */}
      <div className="space-y-3">
        <h2 className="font-display text-sm uppercase tracking-[0.15em] text-smoke">
          Upcoming <span className="text-ink-600">/ {upcoming.length}</span>
        </h2>
        {sessions.isLoading ? (
          <LoadingBlock />
        ) : sessions.isError ? (
          <ErrorState error={sessions.error} onRetry={() => sessions.refetch()} />
        ) : upcoming.length === 0 ? (
          <Card className="p-6 text-sm text-ash">No upcoming sessions scheduled.</Card>
        ) : (
          upcoming.map((s) => <AdminSessionRow key={s.id} session={s} />)
        )}
      </div>
    </div>
  )
}

function AdminSessionRow({ session }: { session: ClassSessionResponse }) {
  const toast = useToast()
  const cancel = useCancelSession()
  const [open, setOpen] = useState(false)
  const cancelled = session.status === 'Cancelled'

  const doCancel = async () => {
    try {
      await cancel.mutateAsync(session.id)
      toast.success('Session cancelled', session.classTypeName)
    } catch (err) {
      toast.error('Could not cancel', errorMessage(err))
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-4 p-4">
        <div className="min-w-0 flex-1">
          <Link
            to={`/classes/${session.id}`}
            className="font-display text-lg font-semibold uppercase tracking-tight hover:text-volt-300"
          >
            {session.classTypeName}
          </Link>
          <p className="tnum text-[13px] text-smoke">
            {formatDay(session.startsAtUtc)} · {formatTime(session.startsAtUtc)} ·{' '}
            {session.instructorName}
          </p>
        </div>

        <div className="tnum flex items-center gap-2 text-[13px]">
          <Badge tone={session.availableSpots === 0 ? 'ember' : 'neutral'}>
            {session.bookedCount}/{session.capacity}
          </Badge>
          {cancelled && <Badge tone="rose">Cancelled</Badge>}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen((v) => !v)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border border-ink-700 px-3 py-2 font-display text-[12px] font-semibold uppercase tracking-wide text-ash transition-colors hover:text-chalk',
              open && 'border-volt-400 text-volt-300',
            )}
          >
            <ListOrdered className="size-3.5" /> Waitlist
            <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
          </button>
          {!cancelled && (
            <Button variant="danger" size="sm" loading={cancel.isPending} onClick={doCancel}>
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="overflow-hidden border-t border-ink-800 bg-ink-950/40 px-4 py-3"
        >
          <WaitlistInline sessionId={session.id} />
        </motion.div>
      )}
    </Card>
  )
}

function WaitlistInline({ sessionId }: { sessionId: number }) {
  const waitlist = useWaitlist(sessionId)
  if (waitlist.isLoading) return <p className="py-2 text-sm text-smoke">Loading queue…</p>
  if (waitlist.isError) return <p className="py-2 text-sm text-rose-400">Couldn't load the queue.</p>
  if (!waitlist.data || waitlist.data.entries.length === 0)
    return <p className="py-2 text-sm text-smoke">Nobody is waiting.</p>

  return (
    <ol className="divide-y divide-ink-800">
      {waitlist.data.entries.map((e) => (
        <li key={e.memberId} className="flex items-center gap-3 py-2">
          <span className="tnum grid size-6 place-items-center rounded-md bg-ink-800 font-display text-[11px] font-bold text-volt-300">
            {e.position}
          </span>
          <Avatar name={e.memberName} size="sm" />
          <span className="text-sm">{e.memberName}</span>
        </li>
      ))}
    </ol>
  )
}
