import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Star, Ticket, X } from 'lucide-react'
import { errorMessage } from '../api/client'
import { useCancelBooking, useMyBookings } from '../api/queries'
import type { BookingResponse } from '../api/types'
import { dayOfMonth, formatDay, formatTime, isPast, weekdayShort } from '../lib/format'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { LoadingBlock } from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'
import { RateModal } from '../components/RateModal'

export function MyBookingsPage() {
  const bookings = useMyBookings()
  const [rateFor, setRateFor] = useState<BookingResponse | null>(null)

  if (bookings.isLoading) return <LoadingBlock label="Loading your bookings" />
  if (bookings.isError) return <ErrorState error={bookings.error} onRetry={() => bookings.refetch()} />

  const all = bookings.data ?? []
  const active = all.filter((b) => b.status !== 'CancelledByMember' && !isPast(b.startsAtUtc))
  const history = all
    .filter((b) => b.status === 'CancelledByMember' || isPast(b.startsAtUtc))
    .sort((a, b) => +new Date(b.startsAtUtc) - +new Date(a.startsAtUtc))

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-volt-400">Your spots</p>
        <h1 className="display text-5xl sm:text-6xl">My bookings</h1>
      </header>

      {all.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No bookings yet"
          action={
            <Link to="/classes">
              <Button size="sm">Browse classes</Button>
            </Link>
          }
        >
          Once you book a class it shows up here with your queue position and rating options.
        </EmptyState>
      ) : (
        <>
          <Section title="Upcoming" count={active.length}>
            {active.length === 0 ? (
              <Card className="p-6 text-sm text-ash">
                Nothing on the calendar.{' '}
                <Link to="/classes" className="font-semibold text-volt-300">
                  Book something →
                </Link>
              </Card>
            ) : (
              active.map((b, i) => <BookingRow key={b.id} booking={b} index={i} />)
            )}
          </Section>

          {history.length > 0 && (
            <Section title="History" count={history.length}>
              {history.map((b, i) => (
                <BookingRow key={b.id} booking={b} index={i} onRate={() => setRateFor(b)} />
              ))}
            </Section>
          )}
        </>
      )}

      {rateFor && (
        <RateModal
          open
          onClose={() => setRateFor(null)}
          sessionId={rateFor.classSessionId}
          sessionName={rateFor.classTypeName}
        />
      )}
    </div>
  )
}

function Section({
  title,
  count,
  children,
}: {
  title: string
  count: number
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-sm uppercase tracking-[0.15em] text-smoke">
        {title} <span className="text-ink-600">/ {count}</span>
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function BookingRow({
  booking,
  index,
  onRate,
}: {
  booking: BookingResponse
  index: number
  onRate?: () => void
}) {
  const toast = useToast()
  const cancel = useCancelBooking()
  const past = isPast(booking.startsAtUtc)
  const cancelledByMe = booking.status === 'CancelledByMember'

  const doCancel = async () => {
    try {
      await cancel.mutateAsync({ bookingId: booking.id, sessionId: booking.classSessionId })
      toast.success('Booking cancelled', booking.classTypeName)
    } catch (err) {
      toast.error('Could not cancel', errorMessage(err))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.25) }}
    >
      <Card className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
        <div className="tnum flex w-14 shrink-0 flex-col items-center rounded-xl border border-ink-700 bg-ink-900 py-2 text-center">
          <span className="font-display text-[11px] uppercase text-smoke">
            {weekdayShort(booking.startsAtUtc)}
          </span>
          <span className="font-display text-lg font-bold leading-none">
            {dayOfMonth(booking.startsAtUtc)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <Link
            to={`/classes/${booking.classSessionId}`}
            className="font-display text-lg font-semibold uppercase tracking-tight hover:text-volt-300"
          >
            {booking.classTypeName}
          </Link>
          <p className="tnum text-[13px] text-smoke">
            {formatDay(booking.startsAtUtc)} · {formatTime(booking.startsAtUtc)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {cancelledByMe ? (
            <Badge tone="neutral">Cancelled</Badge>
          ) : booking.status === 'Waitlisted' ? (
            <Badge tone="ember" dot>
              Queue #{booking.waitlistPosition}
            </Badge>
          ) : past ? (
            <Badge tone="neutral">Attended</Badge>
          ) : (
            <Badge tone="volt" dot>
              Booked
            </Badge>
          )}

          {!past && !cancelledByMe && (
            <Button variant="danger" size="sm" loading={cancel.isPending} onClick={doCancel}>
              <X className="size-4" /> Cancel
            </Button>
          )}
          {past && !cancelledByMe && booking.status === 'Confirmed' && onRate && (
            <Button variant="secondary" size="sm" onClick={onRate}>
              <Star className="size-4" /> Rate
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
