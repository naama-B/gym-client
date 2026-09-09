import { motion } from 'motion/react'
import { cn } from '../../lib/cn'

/** A horizontal fill bar: booked vs capacity, colour shifts as it fills. */
export function CapacityMeter({
  booked,
  capacity,
  className,
}: {
  booked: number
  capacity: number
  className?: string
}) {
  const ratio = capacity > 0 ? Math.min(1, booked / capacity) : 0
  const left = Math.max(0, capacity - booked)
  const tone =
    left === 0 ? 'bg-ember-500' : ratio >= 0.75 ? 'bg-volt-400' : 'bg-volt-500'

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between">
        <span className="font-display text-[11px] font-semibold uppercase tracking-[0.1em] text-smoke">
          {left === 0 ? 'Full — waitlist open' : `${left} spot${left === 1 ? '' : 's'} left`}
        </span>
        <span className="tnum text-[11px] text-smoke">
          {booked}/{capacity}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ink-800">
        <motion.div
          className={cn('h-full rounded-full', tone)}
          initial={{ width: 0 }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 22 }}
        />
      </div>
    </div>
  )
}
