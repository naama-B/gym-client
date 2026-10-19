import { useState } from 'react'
import { Archive, ArchiveRestore, Clock, Dumbbell, Pencil, Plus, Users } from 'lucide-react'
import { errorMessage } from '../../api/client'
import {
  useActivateClassType,
  useClassTypes,
  useDeactivateClassType,
} from '../../api/queries'
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
  const classTypes = useClassTypes(true)
  const toast = useToast()
  const activate = useActivateClassType()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<ClassTypeResponse | null>(null)
  const [deactivating, setDeactivating] = useState<ClassTypeResponse | null>(null)

  const activeCount = classTypes.data?.filter((c) => c.isActive).length ?? 0
  // active first, then inactive; the API already sorts by name within each group
  const sorted = classTypes.data
    ? [...classTypes.data].sort((a, b) => Number(b.isActive) - Number(a.isActive))
    : []

  const reactivate = async (c: ClassTypeResponse) => {
    try {
      await activate.mutateAsync(c.id)
      toast.success('Class type reactivated', c.name)
    } catch (err) {
      toast.error('Could not reactivate', errorMessage(err))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm uppercase tracking-[0.15em] text-smoke">
          Catalogue <span className="text-ink-600">/ {activeCount} active</span>
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
          {sorted.map((c) => (
            <Card
              key={c.id}
              className={'flex flex-col gap-3 p-5 ' + (c.isActive ? '' : 'border-dashed opacity-60')}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-xl uppercase tracking-tight">{c.name}</h3>
                  {!c.isActive && <Badge tone="rose">Inactive</Badge>}
                </div>
                <div className="flex gap-1">
                  <IconBtn label="Edit" onClick={() => setEditing(c)}>
                    <Pencil className="size-4" />
                  </IconBtn>
                  {c.isActive ? (
                    <IconBtn label="Deactivate" danger onClick={() => setDeactivating(c)}>
                      <Archive className="size-4" />
                    </IconBtn>
                  ) : (
                    <IconBtn
                      label="Reactivate"
                      disabled={activate.isPending}
                      onClick={() => reactivate(c)}
                    >
                      <ArchiveRestore className="size-4" />
                    </IconBtn>
                  )}
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
      {deactivating && (
        <DeactivateDialog classType={deactivating} onClose={() => setDeactivating(null)} />
      )}
    </div>
  )
}

function IconBtn({
  label,
  danger,
  disabled,
  onClick,
  children,
}: {
  label: string
  danger?: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={
        'grid size-8 place-items-center rounded-lg border border-ink-700 text-smoke transition-colors disabled:opacity-50 ' +
        (danger ? 'hover:border-rose-500/50 hover:text-rose-400' : 'hover:border-volt-400 hover:text-volt-300')
      }
    >
      {children}
    </button>
  )
}

function DeactivateDialog({
  classType,
  onClose,
}: {
  classType: ClassTypeResponse
  onClose: () => void
}) {
  const toast = useToast()
  const deactivate = useDeactivateClassType()

  const confirm = async () => {
    try {
      await deactivate.mutateAsync(classType.id)
      toast.success('Class type deactivated', classType.name)
      onClose()
    } catch (err) {
      toast.error('Could not deactivate', errorMessage(err))
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Deactivate class type"
      description={`"${classType.name}" will stop being offered. No new sessions can be scheduled for it.`}
    >
      <p className="text-sm text-ash">
        Past sessions, bookings and reviews are kept. If any upcoming session of this type is
        still scheduled, cancel it first on the Sessions tab — otherwise deactivation is refused.
        You can reactivate the class type at any time.
      </p>
      <div className="mt-5 flex gap-3">
        <Button variant="ghost" onClick={onClose} className="flex-1">
          Keep it
        </Button>
        <Button variant="danger" loading={deactivate.isPending} onClick={confirm} className="flex-1">
          Deactivate
        </Button>
      </div>
    </Modal>
  )
}
