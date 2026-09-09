import { useBook } from '../api/queries'
import { errorMessage } from '../api/client'
import type { ClassSessionResponse } from '../api/types'
import { useToast } from '../components/ui/Toast'

/** Wraps the book mutation with the right toast for confirmed vs. waitlisted vs. conflict. */
export function useBookAction() {
  const book = useBook()
  const toast = useToast()

  const run = async (session: Pick<ClassSessionResponse, 'id' | 'classTypeName'>) => {
    try {
      const result = await book.mutateAsync(session.id)
      if (result.status === 'Waitlisted') {
        toast.info('Added to the waitlist', `${session.classTypeName} — you're #${result.waitlistPosition}`)
      } else {
        toast.success('Spot booked', `${session.classTypeName} — see you there`)
      }
    } catch (err) {
      toast.error('Booking failed', errorMessage(err))
    }
  }

  return { run, pendingId: book.isPending ? book.variables : undefined, isPending: book.isPending }
}
