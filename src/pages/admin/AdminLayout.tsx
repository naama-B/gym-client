import { NavLink, Outlet } from 'react-router-dom'
import { motion } from 'motion/react'
import { CalendarPlus, Dumbbell, Users } from 'lucide-react'
import { cn } from '../../lib/cn'

const tabs = [
  { to: '/admin/sessions', label: 'Sessions', icon: CalendarPlus },
  { to: '/admin/class-types', label: 'Class types', icon: Dumbbell },
  { to: '/admin/instructors', label: 'Instructors', icon: Users },
]

export function AdminLayout() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-volt-400">Control room</p>
        <h1 className="display text-5xl sm:text-6xl">Admin</h1>
        <p className="max-w-xl text-sm text-ash">
          Schedule sessions, curate the class catalogue, and keep the roster of instructors current.
        </p>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-ink-800 no-scrollbar">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-2 whitespace-nowrap px-4 py-3 font-display text-[13px] font-semibold uppercase tracking-wide transition-colors',
                isActive ? 'text-chalk' : 'text-smoke hover:text-chalk',
              )
            }
          >
            {({ isActive }) => (
              <>
                <t.icon className="size-4" />
                {t.label}
                {isActive && (
                  <motion.span
                    layoutId="admin-tab"
                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-volt-400"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  )
}
