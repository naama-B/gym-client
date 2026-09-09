/** The API returns UTC timestamps. Parse defensively and render in the viewer's zone. */
function parseUtc(iso: string): Date {
  const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso)
  return new Date(hasZone ? iso : `${iso}Z`)
}

const dayFmt = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
const weekdayFmt = new Intl.DateTimeFormat(undefined, { weekday: 'short' })
const timeFmt = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' })
const fullFmt = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatDay(iso: string): string {
  return dayFmt.format(parseUtc(iso))
}

export function weekdayShort(iso: string): string {
  return weekdayFmt.format(parseUtc(iso))
}

export function dayOfMonth(iso: string): number {
  return parseUtc(iso).getDate()
}

export function formatTime(iso: string): string {
  return timeFmt.format(parseUtc(iso))
}

export function formatFull(iso: string): string {
  return fullFmt.format(parseUtc(iso))
}

export function endsAt(startIso: string, durationMinutes: number): string {
  return timeFmt.format(new Date(parseUtc(startIso).getTime() + durationMinutes * 60_000))
}

export function isPast(iso: string): boolean {
  return parseUtc(iso).getTime() <= Date.now()
}

/** "in 3 days", "in 2h", "just now", "5 days ago". */
export function relativeTime(iso: string): string {
  const diffMs = parseUtc(iso).getTime() - Date.now()
  const abs = Math.abs(diffMs)
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['day', 86_400_000],
    ['hour', 3_600_000],
    ['minute', 60_000],
  ]
  for (const [unit, ms] of units) {
    if (abs >= ms || unit === 'minute') {
      return rtf.format(Math.round(diffMs / ms), unit)
    }
  }
  return 'just now'
}

/** Format a Date as a `datetime-local` input value (local time, no seconds). */
export function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}

/** Convert a `datetime-local` value (local time) to a UTC ISO string for the API. */
export function localInputToUtcIso(value: string): string {
  return new Date(value).toISOString()
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')
}
