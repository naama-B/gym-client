import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RotateCcw, Unplug } from 'lucide-react'
import { Button } from './ui/Button'

interface Props {
  children: ReactNode
}
interface State {
  error: Error | null
}

/**
 * Catches render-time errors anywhere below it so a bug in one screen shows a recoverable
 * message instead of a blank white page. React only routes errors to class components, so
 * this stays a class.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  private reset = () => {
    this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="grid min-h-svh place-items-center p-6">
        <div className="card flex max-w-md flex-col items-center gap-3 px-6 py-12 text-center">
          <div className="grid size-14 place-items-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
            <Unplug className="size-6" aria-hidden />
          </div>
          <h1 className="font-display text-lg uppercase tracking-tight">Something broke</h1>
          <p className="max-w-sm text-sm text-ash">
            The screen hit an unexpected error. Reloading usually clears it.
          </p>
          <p className="max-w-sm break-words font-mono text-[11px] text-smoke">
            {this.state.error.message}
          </p>
          <div className="mt-1 flex gap-2">
            <Button variant="secondary" size="sm" onClick={this.reset}>
              <RotateCcw className="size-4" /> Try again
            </Button>
            <Button size="sm" onClick={() => window.location.reload()}>
              Reload
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
