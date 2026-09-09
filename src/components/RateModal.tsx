import { useState, type FormEvent } from 'react'
import { errorMessage } from '../api/client'
import { useRate } from '../api/queries'
import type { ClassRatingResponse } from '../api/types'
import { Button } from './ui/Button'
import { Textarea } from './ui/Field'
import { Modal } from './ui/Modal'
import { StarInput } from './ui/StarRating'
import { useToast } from './ui/Toast'

export function RateModal({
  open,
  onClose,
  sessionId,
  sessionName,
  existing,
}: {
  open: boolean
  onClose: () => void
  sessionId: number
  sessionName: string
  existing?: ClassRatingResponse
}) {
  const toast = useToast()
  const rate = useRate(sessionId)
  const [stars, setStars] = useState(existing?.stars ?? 0)
  const [comment, setComment] = useState(existing?.comment ?? '')
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (stars < 1) {
      setError('Pick between 1 and 5 stars.')
      return
    }
    setError(null)
    try {
      await rate.mutateAsync({ stars, comment: comment.trim() || null })
      toast.success(existing ? 'Rating updated' : 'Thanks for the rating', sessionName)
      onClose()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existing ? 'Update your rating' : 'Rate this class'}
      description={sessionName}
    >
      <form onSubmit={submit} className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-2 rounded-xl border border-ink-700 bg-ink-900/50 py-5">
          <StarInput value={stars} onChange={setStars} disabled={rate.isPending} />
          <p className="font-display text-xs uppercase tracking-[0.15em] text-smoke">
            {['Tap to rate', 'Poor', 'Meh', 'Good', 'Great', 'Elite'][stars]}
          </p>
        </div>
        <Textarea
          label="Comment"
          placeholder="What worked, what didn't…"
          maxLength={1000}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          error={error ?? undefined}
        />
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={rate.isPending} className="flex-1">
            {existing ? 'Save' : 'Submit'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
