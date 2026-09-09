import { cn } from '../lib/cn'

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 32 32" className="size-7" aria-hidden>
        <rect width="32" height="32" rx="8" className="fill-ink-800" />
        <path
          d="M7 24V8h7a5 5 0 0 1 0 10h-3v6z"
          fill="none"
          className="stroke-volt-400"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <path
          d="M18 16.5h2.4l1.6-3 2.6 6 1.6-3H30"
          fill="none"
          className="stroke-volt-400"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-display text-lg font-bold uppercase tracking-[0.14em]">Pulse</span>
    </span>
  )
}
