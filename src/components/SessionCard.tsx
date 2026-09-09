import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowUpRight, Clock, Dumbbell, UserRound } from 'lucide-react'
import type { BookingResponse, ClassSessionResponse } from '../api/types'
import { endsAt, formatDay, formatTime, isPast } from '../lib/format'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { CapacityMeter } from './ui/CapacityMeter'
import { StarDisplay } from './ui/StarRating'

export function SessionCard({
  session,
  myBooking,
  onBook,
  booking,
  index = 0,
}: {
  session: ClassSessionResponse
  myBooking?: BookingResponse
  onBook: (session: ClassSessionResponse) => void
  booking: boolean
  index?: number
}) {
  const cancelled = session.status === 'Cancelled'
  const past = isPast(session.startsAtUtc)
  const full = session.availableSpots === 0
  const held = myBooking && myBooking.status !== 'CancelledByMember'

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3), type: 'spring', stiffness: 260, damping: 26 }}
      whileHover={{ y: -4 }}
      className="card group relative flex flex-col overflow-hidden p-5 transition-colors hover:border-volt-400/50"
    >
      {/* volt glow on hover */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-volt-400/10 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge tone="neutral" className="tnum">
            {formatDay(session.startsAtUtc)}
          </Badge>
          {cancelled && <Badge tone="rose">Cancelled</Badge>}
          {!cancelled && past && <Badge tone="neutral">Done</Badge>}
          {!cancelled && !past && full && <Badge tone="ember" dot>Waitlist</Badge>}
          {held && myBooking?.status === 'Confirmed' && <Badge tone="volt" dot>Booked</Badge>}
          {held && myBooking?.status === 'Waitlisted' && (
            <Badge tone="ember" dot>Queue #{myBooking.waitlistPosition}</Badge>
          )}
        </div>
        <Link
          to={`/classes/${session.id}`}
          className="grid size-8 shrink-0 place-items-center rounded-lg border border-ink-700 text-smoke transition-colors hover:border-volt-400 hover:text-volt-300"
          aria-label={`Open ${session.classTypeName}`}
        >
          <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <Link to={`/classes/${session.id}`} className="mt-4 block">
        <h3 className="font-display text-2xl uppercase leading-none tracking-tight transition-colors group-hover:text-volt-300">
          {session.classTypeName}
        </h3>
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-ash">
        <span className="tnum inline-flex items-center gap-1.5">
          <Clock className="size-3.5 text-smoke" />
          {formatTime(session.startsAtUtc)}–{endsAt(session.startsAtUtc, session.durationMinutes)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <UserRound className="size-3.5 text-smoke" />
          {session.instructorName}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Dumbbell className="size-3.5 text-smoke" />
          {session.durationMinutes} min
        </span>
      </div>

      <div className="mt-4">
        <StarDisplay value={session.averageStars} count={session.ratingCount} size="sm" />
      </div>

      <div className="mt-auto pt-5">
        {!cancelled && !past && <CapacityMeter booked={session.bookedCount} capacity={session.capacity} className="mb-4" />}

        {cancelled ? (
          <p className="text-[13px] text-smoke">This session was cancelled.</p>
        ) : past ? (
          <Link to={`/classes/${session.id}`} className="text-[13px] font-semibold text-volt-300">
            View recap & ratings →
          </Link>
        ) : held ? (
          <Link to="/bookings">
            <Button variant="secondary" size="sm" fullWidth>
              Manage booking
            </Button>
          </Link>
        ) : (
          <Button
            size="sm"
            fullWidth
            variant={full ? 'secondary' : 'primary'}
            loading={booking}
            onClick={() => onBook(session)}
          >
            {full ? 'Join waitlist' : 'Book a spot'}
          </Button>
        )}
      </div>
    </motion.article>
  )
}
