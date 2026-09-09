import { useState } from 'react'
import { Clock, Dumbbell, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { errorMessage } from '../../api/client'
import { useClassTypes, useDeleteClassType } from '../../api/queries'
import type { ClassTypeResponse } from '../../api/types'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Modal } from '../../components/ui/Modal'
import { LoadingBlock } from '../../components/ui/Spinner'
import { useToast } from '../../components/ui/Toast'
import { ClassTypeForm } from './ClassTypeForm'

export function AdminClassTypesPage() {
  const classTypes = useClassTypes()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<ClassTypeResponse | null>(null)
  const [deleting, setDeleting] = useState<ClassTypeResponse | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm uppercase tracking-[0.15em] text-smoke">
          Catalogue <span className="text-ink-600">/ {classTypes.data?.length ?? 0}</span>
        </h2>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="size-4" /> New class type
        </Button>
      </div>

      {classTypes.isLoading ? (
        <LoadingBlock />
      ) : classTypes.isError ? (
        <ErrorState error={classTypes.error} onRetry={() => classTypes.refetch()} />
      ) : !classTypes.data || classTypes.data.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No class types"
          action={
            <Button size="sm" onClick={() => setCreating(true)}>
              Create the first
            </Button>
          }
        >
          Class types are the templates behind every scheduled session.
        </EmptyState>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {classTypes.data.map((c) => (
            <Card key={c.id} className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-xl uppercase tracking-tight">{c.name}</h3>
                <div className="flex gap-1">
                  <IconBtn label="Edit" onClick={() => setEditing(c)}>
                    <Pencil className="size-4" />
                  </IconBtn>
                  <IconBtn label="Delete" danger onClick={() => setDeleting(c)}>
                    <Trash2 className="size-4" />
                  </IconBtn>
                </div>
              </div>
              {c.description && <p className="text-[13px] text-ash">{c.description}</p>}
              <div className="tnum flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-smoke">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" /> {c.durationMinutes} min
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-3.5" /> cap {c.defaultCapacity}
                </span>
              </div>
              {c.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {c.tags.map((t) => (
                    <Badge key={t} tone="neutral">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {creating && <ClassTypeForm open onClose={() => setCreating(false)} />}
      {editing && (
        <ClassTypeForm open onClose={() => setEditing(null)} existing={editing} />
      )}
      {deleting && (
        <DeleteDialog classType={deleting} onClose={() => setDeleting(null)} />
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
      onClick={onClick}
      className={
        'grid size-8 place-items-center rounded-lg border border-ink-700 text-smoke transition-colors ' +
        (danger ? 'hover:border-rose-500/50 hover:text-rose-400' : 'hover:border-volt-400 hover:text-volt-300')
      }
    >
      {children}
    </button>
  )
}

function DeleteDialog({
  classType,
  onClose,
}: {
  classType: ClassTypeResponse
  onClose: () => void
}) {
  const toast = useToast()
  const del = useDeleteClassType()

  const confirm = async () => {
    try {
      await del.mutateAsync(classType.id)
      toast.success('Class type deleted', classType.name)
      onClose()
    } catch (err) {
      toast.error('Could not delete', errorMessage(err))
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Delete class type"
      description={`"${classType.name}" will be removed from the catalogue.`}
    >
      <p className="text-sm text-ash">
        This fails if any scheduled session still uses it — cancel or wait those out first.
      </p>
      <div className="mt-5 flex gap-3">
        <Button variant="ghost" onClick={onClose} className="flex-1">
          Keep it
        </Button>
        <Button variant="danger" loading={del.isPending} onClick={confirm} className="flex-1">
          Delete
        </Button>
      </div>
    </Modal>
  )
}
