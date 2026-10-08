import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { Logo } from '../components/Logo'

const words = ['LIFT', 'FLOW', 'SPRINT', 'BREATHE', 'PUSH', 'RECOVER']

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
      {/* Kinetic panel — the brand statement, in full accent */}
      <div className="relative hidden overflow-hidden border-r border-[color-mix(in_srgb,var(--color-ink-950)_12%,transparent)] bg-[linear-gradient(155deg,var(--color-volt-400),var(--color-volt-500))] lg:block">
        <div className="absolute inset-0 -z-0 bg-[radial-gradient(38rem_38rem_at_16%_14%,color-mix(in_srgb,#fff_20%,transparent),transparent_60%)]" />
        <div className="absolute inset-0 -z-0 bg-[repeating-linear-gradient(115deg,color-mix(in_srgb,var(--color-ink-950)_6%,transparent)_0_2px,transparent_2px_46px)]" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-ink-950 [&_path]:stroke-ink-950 [&_rect]:fill-[color-mix(in_srgb,var(--color-ink-950)_12%,transparent)]">
          <Logo />
          <div className="space-y-2 overflow-hidden">
            {words.map((w, i) => (
              <motion.p
                key={w}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: i === 2 ? 1 : 0.16, x: 0 }}
                transition={{ delay: 0.1 + i * 0.07, type: 'spring', stiffness: 200, damping: 24 }}
                className="display text-[7vw] leading-[0.82] text-ink-950 xl:text-[6rem]"
                style={i === 2 ? { color: '#fff' } : undefined}
              >
                {w}
              </motion.p>
            ))}
          </div>
          <p className="max-w-sm text-sm text-ink-950/70">
            One room. Limited spots. When a class fills, you get a place in the queue and move up
            automatically — no refresh roulette.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 26 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="display text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-ash">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-sm text-ash">{footer}</div>
        </motion.div>
      </div>
    </div>
  )
}
