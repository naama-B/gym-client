import { motion } from 'motion/react'
import { CalendarClock, MessageSquareQuote, Star, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useReviewedSessions } from '../api/queries'
import { formatFull, relativeTime } from '../lib/format'
import { Avatar } from '../components/ui/Avatar'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { Skeleton } from '../components/ui/Spinner'
import { StarDisplay } from '../components/ui/StarRating'

export function ReviewsPage() {
  const reviews = useReviewedSessions()

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-volt-300">What members said</p>
        <h1 className="display text-5xl sm:text-6xl">Class reviews</h1>
        <p className="max-w-xl text-sm text-ash">
          Every class that members have rated, grouped by session — the title and instructor, then
          the reviews they left afterwards.
        </p>
      </header>

      {reviews.isError ? (
        <ErrorState error={reviews.error} onRetry={() => reviews.refetch()} />
      ) : reviews.isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : !reviews.data || reviews.data.length === 0 ? (
        <EmptyState icon={MessageSquareQuote} title="No reviews yet">
          Once members rate a class they've attended, it shows up here.
        </EmptyState>
      ) : (
        <div className="space-y-6">
          {reviews.data.map((session, i) => (
            <motion.section
              key={session.classSessionId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
              className="card overflow-hidden p-6 sm:p-7"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link
                    to={`/classes/${session.classSessionId}`}
                    className="display text-3xl transition-colors hover:text-volt-300"
                  >
                    {session.classTypeName}
                  </Link>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ash">
                    <span className="inline-flex items-center gap-2">
                      <UserRound className="size-4 text-smoke" /> {session.instructorName}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <CalendarClock className="size-4 text-smoke" /> {formatFull(session.startsAtUtc)}
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700 bg-ink-900/60 px-2.5 py-1.5">
                  <Star className="size-3.5 fill-volt-400 text-volt-400" />
                  <span className="tnum font-display text-sm font-semibold">
                    {session.averageStars?.toFixed(1)}
                  </span>
                  <span className="text-xs text-smoke">
                    · {session.ratingCount} review{session.ratingCount === 1 ? '' : 's'}
                  </span>
                </span>
              </div>

              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {session.ratings.map((r) => (
                  <li key={r.id} className="panel rounded-xl p-4">
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
                  </li>
                ))}
              </ul>
            </motion.section>
          ))}
        </div>
      )}
    </div>
  )
}
