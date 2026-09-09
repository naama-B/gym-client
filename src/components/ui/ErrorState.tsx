import { RotateCcw, Unplug } from 'lucide-react'
import { errorMessage } from '../../api/client'
import { Button } from './Button'

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="grid size-14 place-items-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
        <Unplug className="size-6" aria-hidden />
      </div>
      <h3 className="font-display text-lg uppercase tracking-tight">Couldn't load that</h3>
      <p className="max-w-sm text-sm text-ash">{errorMessage(error)}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-1">
          <RotateCcw className="size-4" /> Retry
        </Button>
      )}
    </div>
  )
}
