import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { CalendarX2, Search, SlidersHorizontal } from 'lucide-react'
import { useMyBookings, useSessions } from '../api/queries'
import type { BookingResponse, ClassSessionQuery } from '../api/types'
import { useBookAction } from '../lib/useBookAction'
import { useDebounced } from '../lib/useDebounced'
import { cn } from '../lib/cn'
import { SessionCard } from '../components/SessionCard'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { Pagination } from '../components/ui/Pagination'
import { Skeleton } from '../components/ui/Spinner'

const PAGE_SIZE = 9
const sorts: { key: string; label: string; q: Partial<ClassSessionQuery> }[] = [
  { key: 'soon', label: 'Starting soon', q: { sortBy: 'startsAt', sortDescending: false } },
  { key: 'later', label: 'Latest first', q: { sortBy: 'startsAt', sortDescending: true } },
  { key: 'open', label: 'Most open', q: { sortBy: 'available', sortDescending: false } },
]

export function SessionsPage() {
  const [search, setSearch] = useState('')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [sortKey, setSortKey] = useState('soon')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounced(search)
  // Pinned at mount: this page only lists classes that haven't taken place yet.
  const [fromUtc] = useState(() => new Date().toISOString())

  // Any filter change resets to page 1.
  const setSearchReset = (v: string) => {
    setSearch(v)
    setPage(1)
  }
  const toggleAvailable = () => {
    setOnlyAvailable((v) => !v)
    setPage(1)
  }
  const setSort = (v: string) => {
    setSortKey(v)
    setPage(1)
  }

  const query: ClassSessionQuery = {
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch.trim() || undefined,
    onlyAvailable: onlyAvailable || undefined,
    fromUtc,
    ...sorts.find((s) => s.key === sortKey)!.q,
  }

  const sessions = useSessions(query)
  const myBookings = useMyBookings()
  const { run, pendingId } = useBookAction()

  const bookingBySession = useMemo(() => {
    const map = new Map<number, BookingResponse>()
    for (const b of myBookings.data ?? []) map.set(b.classSessionId, b)
    return map
  }, [myBookings.data])

  const data = sessions.data

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-volt-300">The schedule</p>
        <h1 className="display text-5xl sm:text-6xl">Find your class</h1>
        <p className="max-w-xl text-sm text-ash">
          Every class that hasn't taken place yet. Each session has a fixed capacity — book early,
          and when it's full you'll join the queue and move up automatically as people drop.
        </p>
      </header>

      {/* Filter bar */}
      <div className="panel flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-smoke" />
          <input
            value={search}
            onChange={(e) => setSearchReset(e.target.value)}
            placeholder="Search classes — spin, yoga, hiit…"
            className="w-full rounded-xl border border-ink-700 bg-ink-900/70 py-2.5 pl-10 pr-3 text-sm placeholder:text-smoke focus:border-volt-400 focus:outline-none"
          />
        </div>
        <button
          onClick={toggleAvailable}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 font-display text-[12px] font-semibold uppercase tracking-wide transition-colors',
            onlyAvailable
              ? 'border-volt-400 bg-volt-400/10 text-volt-300'
              : 'border-ink-700 text-ash hover:text-chalk',
          )}
        >
          <span className={cn('size-2 rounded-full', onlyAvailable ? 'bg-volt-400' : 'bg-ink-600')} />
          Open spots only
        </button>
        <div className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-smoke" />
          <select
            value={sortKey}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none rounded-xl border border-ink-700 bg-ink-900/70 py-2.5 pl-9 pr-8 text-sm focus:border-volt-400 focus:outline-none"
          >
            {sorts.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {sessions.isError ? (
        <ErrorState error={sessions.error} onRetry={() => sessions.refetch()} />
      ) : sessions.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState icon={CalendarX2} title="No classes match">
          Try clearing the search or the "open spots only" filter.
        </EmptyState>
      ) : (
        <>
          <div
            className={cn(
              'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
              sessions.isFetching && 'opacity-60 transition-opacity',
            )}
          >
            {data.items.map((s, i) => (
              <SessionCard
                key={s.id}
                session={s}
                index={i}
                myBooking={bookingBySession.get(s.id)}
                onBook={run}
                booking={pendingId === s.id}
              />
            ))}
          </div>

          <motion.div layout className="flex flex-col items-center gap-3">
            <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
            <p className="text-xs text-smoke">
              {data.totalCount} class{data.totalCount === 1 ? '' : 'es'} · page {data.page} of{' '}
              {Math.max(1, data.totalPages)}
            </p>
          </motion.div>
        </>
      )}
    </div>
  )
}
