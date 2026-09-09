import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type Tone = 'volt' | 'ember' | 'sky' | 'rose' | 'neutral'

const tones: Record<Tone, string> = {
  volt: 'bg-volt-400/12 text-volt-300 border-volt-400/30',
  ember: 'bg-ember-500/12 text-ember-400 border-ember-500/30',
  sky: 'bg-sky-400/12 text-sky-400 border-sky-400/30',
  rose: 'bg-rose-500/12 text-rose-400 border-rose-500/30',
  neutral: 'bg-ink-750 text-ash border-ink-600',
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
  dot?: boolean
}

export function Badge({ tone = 'neutral', dot, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1',
        'font-display text-[11px] font-semibold uppercase tracking-[0.08em]',
        tones[tone],
        className,
      )}
      {...rest}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  )
}
