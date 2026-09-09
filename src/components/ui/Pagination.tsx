import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  const pages = pageWindow(page, totalPages)

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
      <PagerButton disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous">
        <ChevronLeft className="size-4" />
      </PagerButton>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-1.5 text-smoke">
            …
          </span>
        ) : (
          <PagerButton key={p} active={p === page} onClick={() => onChange(p)}>
            {p}
          </PagerButton>
        ),
      )}
      <PagerButton disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next">
        <ChevronRight className="size-4" />
      </PagerButton>
    </nav>
  )
}

function PagerButton({
  active,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        'tnum grid h-9 min-w-9 place-items-center rounded-lg border px-2 font-display text-sm font-semibold transition-colors',
        active
          ? 'border-volt-400 bg-volt-400 text-ink-950'
          : 'border-ink-700 text-ash hover:border-ink-600 hover:text-chalk',
        'disabled:pointer-events-none disabled:opacity-40',
        className,
      )}
      {...rest}
    />
  )
}

function pageWindow(page: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const out: (number | '…')[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(total - 1, page + 1)
  if (start > 2) out.push('…')
  for (let i = start; i <= end; i++) out.push(i)
  if (end < total - 1) out.push('…')
  out.push(total)
  return out
}
