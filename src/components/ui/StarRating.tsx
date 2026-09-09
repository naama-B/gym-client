import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '../../lib/cn'

export function StarDisplay({
  value,
  count,
  size = 'md',
  className,
}: {
  value: number | null
  count?: number
  size?: 'sm' | 'md'
  className?: string
}) {
  const dim = size === 'sm' ? 'size-3.5' : 'size-4'
  const rounded = value != null ? Math.round(value) : 0
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              dim,
              i <= rounded ? 'fill-volt-400 text-volt-400' : 'fill-ink-750 text-ink-750',
            )}
            aria-hidden
          />
        ))}
      </span>
      {value != null && (
        <span className="tnum font-display text-xs font-semibold text-ash">
          {value.toFixed(1)}
          {count != null && <span className="text-smoke"> · {count}</span>}
        </span>
      )}
      {value == null && <span className="text-xs text-smoke">Not yet rated</span>}
    </span>
  )
}

export function StarInput({
  value,
  onChange,
  disabled,
}: {
  value: number
  onChange: (v: number) => void
  disabled?: boolean
}) {
  const [hover, setHover] = useState(0)
  const shown = hover || value
  return (
    <div
      className="inline-flex items-center gap-1"
      role="radiogroup"
      aria-label="Star rating"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
          disabled={disabled}
          onMouseEnter={() => setHover(i)}
          onClick={() => onChange(i)}
          className={cn(
            'rounded-md p-1 transition-transform hover:scale-110 disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          <Star
            className={cn(
              'size-8 transition-colors',
              i <= shown ? 'fill-volt-400 text-volt-400' : 'fill-ink-800 text-ink-600',
            )}
          />
        </button>
      ))}
    </div>
  )
}
