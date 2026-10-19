import { useState, type FormEvent } from 'react'
import { Archive, ArchiveRestore, UserPlus, Users } from 'lucide-react'
import { errorMessage } from '../../api/client'
import {
  useActivateInstructor,
  useCreateInstructor,
  useDeactivateInstructor,
  useInstructors,
} from '../../api/queries'
import type { InstructorResponse } from '../../api/types'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Input, Textarea } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { LoadingBlock } from '../../components/ui/Spinner'
import { useToast } from '../../components/ui/Toast'

export function AdminInstructorsPage() {
  const toast = useToast()
  const instructors = useInstructors(true)
  const create = useCreateInstructor()
  const activate = useActivateInstructor()

  const [form, setForm] = useState({ fullName: '', bio: '' })
  const [error, setError] = useState<string | null>(null)
  const [deactivating, setDeactivating] = useState<InstructorResponse | null>(null)

  const activeCount = instructors.data?.filter((i) => i.isActive).length ?? 0
  // active first, then inactive; the API already sorts by name within each group
  const sorted = instructors.data
    ? [...instructors.data].sort((a, b) => Number(b.isActive) - Number(a.isActive))
    : []

  const reactivate = async (i: InstructorResponse) => {
    try {
      await activate.mutateAsync(i.id)
      toast.success('Instructor reactivated', i.fullName)
    } catch (err) {
      toast.error('Could not reactivate', errorMessage(err))
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await create.mutateAsync({ fullName: form.fullName.trim(), bio: form.bio.trim() || null })
      toast.success('Instructor added', form.fullName.trim())
      setForm({ fullName: '', bio: '' })
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card className="h-fit p-5 lg:sticky lg:top-24">
        <div className="mb-4 flex items-center gap-2">
          <UserPlus className="size-5 text-volt-400" />
          <h2 className="font-display text-lg uppercase tracking-tight">Add instructor</h2>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Input
            label="Full name"
            required
            minLength={2}
            maxLength={120}
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
          />
          <Textarea
            label="Bio"
            maxLength={1000}
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            error={error ?? undefined}
          />
          <Button type="submit" loading={create.isPending} fullWidth>
            Add to roster
          </Button>
        </form>
      </Card>

      <div className="space-y-3">
        <h2 className="font-display text-sm uppercase tracking-[0.15em] text-smoke">
          Roster <span className="text-ink-600">/ {activeCount} active</span>
        </h2>
        {instructors.isLoading ? (
          <LoadingBlock />
        ) : instructors.isError ? (
          <ErrorState error={instructors.error} onRetry={() => instructors.refetch()} />
        ) : !instructors.data || instructors.data.length === 0 ? (
          <EmptyState icon={Users} title="No instructors yet">
            Add an instructor before scheduling sessions.
          </EmptyState>
        ) : (
          sorted.map((i) => (
            <Card
              key={i.id}
              className={'flex items-start gap-4 p-4 ' + (i.isActive ? '' : 'border-dashed shadow-none')}
            >
              <div className={'shrink-0 ' + (i.isActive ? '' : 'opacity-50 grayscale')}>
                <Avatar name={i.fullName} size="lg" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={
                      'font-display text-lg font-semibold uppercase tracking-tight ' +
                      (i.isActive ? '' : 'text-smoke line-through decoration-1')
                    }
                  >
                    {i.fullName}
                  </p>
                  {!i.isActive && <Badge tone="rose">Inactive</Badge>}
                </div>
                <p className={'mt-0.5 text-[13px] ' + (i.bio ? 'text-ash' : 'text-smoke') + (i.isActive ? '' : ' opacity-50')}>
                  {i.bio || 'No bio.'}
                </p>
              </div>
              {i.isActive ? (
                <IconBtn label="Deactivate" danger onClick={() => setDeactivating(i)}>
                  <Archive className="size-4" />
                </IconBtn>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 shrink-0"
                  loading={activate.isPending && activate.variables === i.id}
                  onClick={() => reactivate(i)}
                >
                  <ArchiveRestore className="size-4" />
                  <span className="max-sm:sr-only">Reactivate</span>
                </Button>
              )}
            </Card>
          ))
        )}
      </div>

      {deactivating && (
        <DeactivateDialog instructor={deactivating} onClose={() => setDeactivating(null)} />
      )}
    </div>
  )
}

function IconBtn({
  label,
  danger,
  onClick,
  children,
}: {
  label: string
  danger?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className={
        'grid size-8 shrink-0 place-items-center rounded-lg border border-ink-700 text-smoke transition-colors ' +
        (danger ? 'hover:border-rose-500/50 hover:text-rose-400' : 'hover:border-volt-400 hover:text-volt-300')
      }
    >
      {children}
    </button>
  )
}

function DeactivateDialog({
  instructor,
  onClose,
}: {
  instructor: InstructorResponse
  onClose: () => void
}) {
  const toast = useToast()
  const deactivate = useDeactivateInstructor()

  const confirm = async () => {
    try {
      await deactivate.mutateAsync(instructor.id)
      toast.success('Instructor deactivated', instructor.fullName)
      onClose()
    } catch (err) {
      toast.error('Could not deactivate', errorMessage(err))
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Deactivate instructor"
      description={`${instructor.fullName} will leave the roster. No new sessions can be scheduled with them.`}
    >
      <p className="text-sm text-ash">
        Past sessions and their reviews are kept. If the instructor still has an upcoming session,
        cancel it first on the Sessions tab — otherwise deactivation is refused. You can reactivate
        the instructor at any time.
      </p>
      <div className="mt-5 flex gap-3">
        <Button variant="ghost" onClick={onClose} className="flex-1">
          Keep them
        </Button>
        <Button variant="danger" loading={deactivate.isPending} onClick={confirm} className="flex-1">
          Deactivate
        </Button>
      </div>
    </Modal>
  )
}
