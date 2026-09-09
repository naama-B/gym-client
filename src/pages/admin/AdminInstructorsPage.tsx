import { useState, type FormEvent } from 'react'
import { UserPlus, Users } from 'lucide-react'
import { errorMessage } from '../../api/client'
import { useCreateInstructor, useInstructors } from '../../api/queries'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Input, Textarea } from '../../components/ui/Field'
import { LoadingBlock } from '../../components/ui/Spinner'
import { useToast } from '../../components/ui/Toast'

export function AdminInstructorsPage() {
  const toast = useToast()
  const instructors = useInstructors()
  const create = useCreateInstructor()

  const [form, setForm] = useState({ fullName: '', bio: '' })
  const [error, setError] = useState<string | null>(null)

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
          Roster <span className="text-ink-600">/ {instructors.data?.length ?? 0}</span>
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
          instructors.data.map((i) => (
            <Card key={i.id} className="flex items-start gap-4 p-4">
              <Avatar name={i.fullName} size="lg" />
              <div>
                <p className="font-display text-lg font-semibold uppercase tracking-tight">
                  {i.fullName}
                </p>
                {i.bio ? (
                  <p className="mt-0.5 text-[13px] text-ash">{i.bio}</p>
                ) : (
                  <p className="mt-0.5 text-[13px] text-smoke">No bio.</p>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
