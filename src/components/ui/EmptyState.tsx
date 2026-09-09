import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: LucideIcon
  title: string
  children?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="grid size-14 place-items-center rounded-2xl border border-ink-600 bg-ink-850 text-volt-400">
        <Icon className="size-6" aria-hidden />
      </div>
      <h3 className="font-display text-lg uppercase tracking-tight">{title}</h3>
      {children && <p className="max-w-sm text-sm text-ash">{children}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
