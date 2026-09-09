import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary:
    'bg-volt-400 text-ink-950 hover:bg-volt-300 active:bg-volt-500 shadow-[0_0_0_1px_var(--color-volt-500),0_10px_40px_-12px_color-mix(in_srgb,var(--color-volt-400)_60%,transparent)]',
  secondary:
    'bg-ink-800 text-chalk border border-ink-600 hover:border-volt-400 hover:text-volt-300',
  ghost: 'text-ash hover:text-chalk hover:bg-ink-800',
  danger: 'bg-rose-500/15 text-rose-400 border border-rose-500/40 hover:bg-rose-500/25',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5 rounded-lg',
  md: 'h-11 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-13 px-7 text-[15px] gap-2.5 rounded-xl',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'relative inline-flex select-none items-center justify-center font-semibold uppercase tracking-wide',
        'transition-[transform,background-color,border-color,color] duration-150 will-change-transform',
        'hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-45',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
})
