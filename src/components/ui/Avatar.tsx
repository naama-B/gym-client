import { initials } from '../../lib/format'
import { cn } from '../../lib/cn'

const palette = [
  'bg-volt-400/15 text-volt-300',
  'bg-sky-400/15 text-sky-400',
  'bg-ember-500/15 text-ember-400',
  'bg-rose-500/15 text-rose-400',
]

export function Avatar({
  name,
  size = 'md',
  className,
}: {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const dim = size === 'sm' ? 'size-8 text-[11px]' : size === 'lg' ? 'size-12 text-sm' : 'size-10 text-xs'
  const hue = palette[name.charCodeAt(0) % palette.length]
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full border border-ink-600 font-display font-bold uppercase',
        dim,
        hue,
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  )
}
