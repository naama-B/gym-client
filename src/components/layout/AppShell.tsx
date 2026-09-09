import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { CalendarDays, LayoutGrid, LogOut, Menu, ShieldHalf, Ticket, X } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { cn } from '../../lib/cn'
import { Avatar } from '../ui/Avatar'
import { Logo } from '../Logo'

const links = [
  { to: '/classes', label: 'Classes', icon: LayoutGrid },
  { to: '/bookings', label: 'My Bookings', icon: Ticket },
]
const adminLink = { to: '/admin', label: 'Admin', icon: ShieldHalf }

function NavItem({
  to,
  label,
  icon: Icon,
  onClick,
}: {
  to: string
  label: string
  icon: typeof LayoutGrid
  onClick?: () => void
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-2 rounded-lg px-3 py-2 font-display text-[13px] font-semibold uppercase tracking-wide transition-colors',
          isActive ? 'text-chalk' : 'text-smoke hover:text-chalk',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="size-4" />
          {label}
          {isActive && (
            <motion.span
              layoutId="nav-underline"
              className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-volt-400"
            />
          )}
        </>
      )}
    </NavLink>
  )
}

export function AppShell() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const nav = isAdmin ? [...links, adminLink] : links

  const doLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="panel sticky top-0 z-40 border-x-0 border-t-0">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <NavLink to="/classes" aria-label="Pulse home">
              <Logo />
            </NavLink>
            <nav className="hidden items-center gap-1 md:flex">
              {nav.map((l) => (
                <NavItem key={l.to} {...l} />
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2.5 sm:flex">
              <Avatar name={user?.fullName ?? '?'} size="sm" />
              <div className="leading-tight">
                <p className="max-w-32 truncate text-[13px] font-semibold">{user?.fullName}</p>
                <p className="font-display text-[10px] uppercase tracking-[0.12em] text-smoke">
                  {user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={doLogout}
              className="hidden size-9 place-items-center rounded-lg text-smoke transition-colors hover:bg-ink-800 hover:text-rose-400 sm:grid"
              aria-label="Log out"
            >
              <LogOut className="size-4" />
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="grid size-9 place-items-center rounded-lg text-chalk hover:bg-ink-800 md:hidden"
              aria-label="Menu"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-ink-700 md:hidden"
            >
              <div className="flex flex-col gap-1 p-4">
                {nav.map((l) => (
                  <NavItem key={l.to} {...l} onClick={() => setMenuOpen(false)} />
                ))}
                <button
                  onClick={doLogout}
                  className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 font-display text-[13px] font-semibold uppercase tracking-wide text-rose-400"
                >
                  <LogOut className="size-4" /> Log out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="mx-auto w-full max-w-6xl grow px-4 py-8 sm:px-6 sm:py-12">
        <Outlet />
      </main>

      <footer className="border-t border-ink-800">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-smoke sm:flex-row">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" /> Pulse — book your spot in the room.
          </span>
          <span>Front end for the Gym API · React + Vite</span>
        </div>
      </footer>
    </div>
  )
}
