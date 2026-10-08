import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '../../lib/cn'

const baseControl =
  'w-full rounded-xl border border-ink-600 bg-ink-900/80 px-3.5 py-3 text-sm text-chalk ' +
  'placeholder:text-smoke transition-colors focus:border-volt-400 focus:outline-none ' +
  'disabled:opacity-50 disabled:cursor-not-allowed'

interface WrapProps {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  required?: boolean
  children: (id: string) => ReactNode
}

function FieldWrap({ label, hint, error, required, children }: WrapProps) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="font-display text-[12px] font-semibold uppercase tracking-[0.08em] text-ash"
        >
          {label}
          {required && <span className="text-volt-300"> *</span>}
        </label>
      )}
      {children(id)}
      {error ? (
        <p className="text-[12px] font-medium text-rose-400">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-smoke">{hint}</p>
      ) : null}
    </div>
  )
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, required, className, ...rest },
  ref,
) {
  return (
    <FieldWrap label={label} hint={hint} error={error} required={required}>
      {(id) => (
        <input
          id={id}
          ref={ref}
          required={required}
          aria-invalid={error ? true : undefined}
          className={cn(baseControl, error && 'border-rose-500/60', className)}
          {...rest}
        />
      )}
    </FieldWrap>
  )
})

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, required, className, ...rest },
  ref,
) {
  return (
    <FieldWrap label={label} hint={hint} error={error} required={required}>
      {(id) => (
        <textarea
          id={id}
          ref={ref}
          required={required}
          aria-invalid={error ? true : undefined}
          className={cn(baseControl, 'min-h-24 resize-y', error && 'border-rose-500/60', className)}
          {...rest}
        />
      )}
    </FieldWrap>
  )
})

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, required, className, children, ...rest },
  ref,
) {
  return (
    <FieldWrap label={label} hint={hint} error={error} required={required}>
      {(id) => (
        <select
          id={id}
          ref={ref}
          required={required}
          className={cn(baseControl, 'appearance-none pr-9', error && 'border-rose-500/60', className)}
          {...rest}
        >
          {children}
        </select>
      )}
    </FieldWrap>
  )
})
