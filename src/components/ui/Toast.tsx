import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { usePortalContainer } from '../../lib/usePortalContainer'

type ToastTone = 'success' | 'error' | 'info'
interface Toast {
  id: number
  tone: ToastTone
  title: string
  message?: string
}

interface ToastContextValue {
  push: (t: Omit<Toast, 'id'>) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const icons = { success: CheckCircle2, error: TriangleAlert, info: Info }
const accents: Record<ToastTone, string> = {
  success: 'text-volt-300',
  error: 'text-rose-400',
  info: 'text-sky-400',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const container = usePortalContainer('toast')

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = Date.now() + Math.random()
      setToasts((prev) => [...prev, { ...t, id }])
      window.setTimeout(() => remove(id), 4800)
    },
    [remove],
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      push,
      success: (title, message) => push({ tone: 'success', title, message }),
      error: (title, message) => push({ tone: 'error', title, message }),
      info: (title, message) => push({ tone: 'info', title, message }),
    }),
    [push],
  )

  return (
    <ToastContext value={value}>
      {children}
      {container && createPortal(
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6">
          <AnimatePresence initial={false}>
            {toasts.map((t) => {
              const Icon = icons[t.tone]
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 40, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 32 }}
                  className="panel pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl p-3.5 shadow-[0_20px_50px_-20px_rgb(23_22_28/0.25)]"
                >
                  <Icon className={cn('mt-0.5 size-5 shrink-0', accents[t.tone])} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-semibold uppercase tracking-tight">
                      {t.title}
                    </p>
                    {t.message && <p className="mt-0.5 text-[13px] text-ash">{t.message}</p>}
                  </div>
                  <button
                    onClick={() => remove(t.id)}
                    aria-label="Dismiss"
                    className="grid size-6 shrink-0 place-items-center rounded-md text-smoke hover:text-chalk"
                  >
                    <X className="size-3.5" />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>,
        container,
      )}
    </ToastContext>
  )
}

export function useToast(): ToastContextValue {
  const ctx = use(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
