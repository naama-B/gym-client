import { useState, type FormEvent } from 'react'
import { errorMessage } from '../../api/client'
import { useCreateClassType, useUpdateClassType } from '../../api/queries'
import type { ClassTypeResponse } from '../../api/types'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'

export function ClassTypeForm({
  open,
  onClose,
  existing,
}: {
  open: boolean
  onClose: () => void
  existing?: ClassTypeResponse
}) {
  const toast = useToast()
  const create = useCreateClassType()
  const update = useUpdateClassType()
  const busy = create.isPending || update.isPending

  const [form, setForm] = useState({
    name: existing?.name ?? '',
    description: existing?.description ?? '',
    durationMinutes: String(existing?.durationMinutes ?? 45),
    defaultCapacity: String(existing?.defaultCapacity ?? 12),
    tags: existing?.tags.join(', ') ?? '',
  })
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const body = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      durationMinutes: Number(form.durationMinutes),
      defaultCapacity: Number(form.defaultCapacity),
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    }
    try {
      if (existing) {
        await update.mutateAsync({ id: existing.id, body })
        toast.success('Class type updated', body.name)
      } else {
        await create.mutateAsync(body)
        toast.success('Class type created', body.name)
      }
      onClose()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existing ? 'Edit class type' : 'New class type'}
      description="Used as the template for scheduled sessions."
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Input
          label="Name"
          required
          minLength={2}
          maxLength={80}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <Textarea
          label="Description"
          maxLength={500}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Duration (min)"
            type="number"
            required
            min={10}
            max={240}
            value={form.durationMinutes}
            onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
          />
          <Input
            label="Default capacity"
            type="number"
            required
            min={1}
            max={500}
            value={form.defaultCapacity}
            onChange={(e) => setForm((f) => ({ ...f, defaultCapacity: e.target.value }))}
          />
        </div>
        <Input
          label="Tags"
          placeholder="Cardio, Beginner"
          hint="Comma-separated. New tags are created automatically."
          value={form.tags}
          onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          error={error ?? undefined}
        />
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={busy} className="flex-1">
            {existing ? 'Save changes' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
