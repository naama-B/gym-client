import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowLeft,
  CalendarClock,
  Clock,
  ListOrdered,
  MessageSquareQuote,
  Star,
  UserRound,
  X,
} from 'lucide-react'
import { errorMessage } from '../api/client'
import {
  useCancelSession,
  useMyBookings,
  useRatings,
  useSession,
  useWaitlist,
} from '../api/queries'
import { useAuth } from '../auth/AuthContext'
import { endsAt, formatFull, isPast, relativeTime } from '../lib/format'
import { useBookAction } from '../lib/useBookAction'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { CapacityMeter } from '../components/ui/CapacityMeter'
import { Card } from '../components/ui/Card'
import { ErrorState } from '../components/ui/ErrorState'
import { LoadingBlock } from '../components/ui/Spinner'
import { StarDisplay } from '../components/ui/StarRating'
import { useToast } from '../components/ui/Toast'
import { RateModal } from '../components/RateModal'

export function SessionDetailPage() {
  const { id } = useParams()
  const sessionId = Number(id)
  const { user, isAdmin } = useAuth()
  const toast = useToast()

  const session = useSession(sessionId)
  const ratings = useRatings(sessionId)
  const myBookings = useMyBookings()
  const { run, isPending: booking } = useBookAction()
  const cancelSession = useCancelSession()

  const [showWaitlist, setShowWaitlist] = useState(false)
  const [rateOpen, setRateOpen] = useState(false)

  if (session.isLoading) return <LoadingBlock label="Loading class" />
  if (session.isError || !session.data)
    return <ErrorState error={session.error} onRetry={() => session.refetch()} />

  const s = session.data
  const past = isPast(s.startsAtUtc)
  const cancelled = s.status === 'Cancelled'
  const full = s.availableSpots === 0
  const myBooking = myBookings.data?.find((b) => b.classSessionId === s.id)
  const held = myBooking && myBooking.status !== 'CancelledByMember'
  const myRating = ratings.data?.ratings.find((r) => r.memberId === user?.memberId)
  const canRate = past && !cancelled && myBooking?.status === 'Confirmed'

  const doCancelSession = async () => {
    try {
      await cancelSession.mutateAsync(s.id)
      toast.success('Session cancelled', s.classTypeName)
    } catch (err) {
      toast.error('Could not cancel', errorMessage(err))
    }
  }

  return (
    <div className="space-y-8">
      <Link
        to="/classes"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-smoke transition-colors hover:text-chalk"
      >
        <ArrowLeft className="size-4" /> All classes
      </Link>

      {/* Hero */}
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card relative overflow-hidden p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-volt-400/10 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-2">
          {cancelled ? (
            <Badge tone="rose">Cancelled</Badge>
          ) : past ? (
            <Badge tone="neutral">Completed</Badge>
          ) : full ? (
            <Badge tone="ember" dot>Waitlist open</Badge>
          ) : (
            <Badge tone="volt" dot>{s.availableSpots} spots left</Badge>
          )}
          <Badge tone="neutral">{s.durationMinutes} min</Badge>
          {s.ratingCount > 0 && (
            <Badge tone="neutral">
              <Star className="size-3 fill-volt-400 text-volt-400" /> {s.averageStars?.toFixed(1)}
            </Badge>
          )}
        </div>

        <h1 className="display mt-4 text-5xl sm:text-6xl">{s.classTypeName}</h1>

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ash">
          <span className="inline-flex items-center gap-2">
            <CalendarClock className="size-4 text-smoke" /> {formatFull(s.startsAtUtc)}
          </span>
          <span className="tnum inline-flex items-center gap-2">
            <Clock className="size-4 text-smoke" /> ends {endsAt(s.startsAtUtc, s.durationMinutes)}
          </span>
          <span className="inline-flex items-center gap-2">
            <UserRound className="size-4 text-smoke" /> {s.instructorName}
          </span>
        </div>

        {!past && !cancelled && (
          <div className="mt-6 max-w-sm">
            <CapacityMeter booked={s.bookedCount} capacity={s.capacity} />
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {cancelled ? (
            <p className="text-sm text-smoke">This session is no longer running.</p>
          ) : past ? (
            <p className="text-sm text-smoke">This class has already taken place.</p>
          ) : held ? (
            <>
              <Badge tone={myBooking?.status === 'Waitlisted' ? 'ember' : 'volt'} dot>
                {myBooking?.status === 'Waitlisted'
                  ? `You're #${myBooking.waitlistPosition} in the queue`
                  : "You're booked in"}
              </Badge>
              <Link to="/bookings">
                <Button variant="secondary" size="sm">
                  Manage in My Bookings
                </Button>
              </Link>
            </>
          ) : (
            <Button
              size="lg"
              variant={full ? 'secondary' : 'primary'}
              loading={booking}
              onClick={() => run(s)}
            >
              {full ? 'Join the waitlist' : 'Book my spot'}
            </Button>
          )}
        </div>
      </motion.header>

      {/* Admin controls */}
      {isAdmin && (
        <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p className="font-display text-sm uppercase tracking-tight">Admin controls</p>
            <p className="text-[13px] text-smoke">Manage this session.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowWaitlist((v) => !v)}
            >
              <ListOrdered className="size-4" />
              {showWaitlist ? 'Hide' : 'View'} waitlist
            </Button>
            {!cancelled && (
              <Button
                variant="danger"
                size="sm"
                loading={cancelSession.isPending}
                onClick={doCancelSession}
              >
                <X className="size-4" /> Cancel session
              </Button>
            )}
          </div>
        </Card>
      )}

      {isAdmin && showWaitlist && <WaitlistPanel sessionId={s.id} />}

      {/* Ratings */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.25em] text-volt-300">
              Satisfaction
            </p>
            <h2 className="display mt-1 text-3xl">Member ratings</h2>
          </div>
          <div className="flex items-center gap-3">
            <StarDisplay value={s.averageStars} count={s.ratingCount} />
            {canRate && (
              <Button size="sm" variant={myRating ? 'secondary' : 'primary'} onClick={() => setRateOpen(true)}>
                {myRating ? 'Update my rating' : 'Rate this class'}
              </Button>
            )}
          </div>
        </div>

        {ratings.isLoading ? (
          <LoadingBlock label="Loading ratings" />
        ) : ratings.isError ? (
          <ErrorState error={ratings.error} onRetry={() => ratings.refetch()} />
        ) : !ratings.data || ratings.data.ratings.length === 0 ? (
          <Card className="flex items-center gap-3 p-6 text-sm text-ash">
            <MessageSquareQuote className="size-5 text-smoke" />
            No ratings yet{canRate ? ' — be the first.' : '.'}
          </Card>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {ratings.data.ratings.map((r, i) => (
              <motion.li
                key={r.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.25) }}
                className="card p-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={r.memberName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{r.memberName}</p>
                    <p className="text-[11px] text-smoke">
                      {relativeTime(r.updatedAtUtc ?? r.createdAtUtc)}
                      {r.updatedAtUtc && ' · edited'}
                    </p>
                  </div>
                  <StarDisplay value={r.stars} size="sm" />
                </div>
                {r.comment && <p className="mt-3 text-[13px] text-ash">{r.comment}</p>}
              </motion.li>
            ))}
          </ul>
        )}
      </section>

      <RateModal
        open={rateOpen}
        onClose={() => setRateOpen(false)}
        sessionId={s.id}
        sessionName={s.classTypeName}
        existing={myRating}
      />
    </div>
  )
}

function WaitlistPanel({ sessionId }: { sessionId: number }) {
  const waitlist = useWaitlist(sessionId)

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
      <Card className="p-5">
        <p className="mb-3 font-display text-sm uppercase tracking-tight">
          Waiting list
          {waitlist.data && (
            <span className="ml-2 text-smoke">{waitlist.data.count} in queue</span>
          )}
        </p>
        {waitlist.isLoading ? (
          <LoadingBlock label="Loading queue" />
        ) : waitlist.isError ? (
          <ErrorState error={waitlist.error} onRetry={() => waitlist.refetch()} />
        ) : !waitlist.data || waitlist.data.entries.length === 0 ? (
          <p className="text-sm text-smoke">Nobody is waiting for this session.</p>
        ) : (
          <ol className="divide-y divide-ink-800">
            {waitlist.data.entries.map((e) => (
              <li key={e.memberId} className="flex items-center gap-3 py-2.5">
                <span className="tnum grid size-7 place-items-center rounded-lg bg-ink-800 font-display text-xs font-bold text-volt-300">
                  {e.position}
                </span>
                <Avatar name={e.memberName} size="sm" />
                <span className="flex-1 text-sm">{e.memberName}</span>
                <span className="text-[11px] text-smoke">{relativeTime(e.createdAtUtc)}</span>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </motion.div>
  )
}
