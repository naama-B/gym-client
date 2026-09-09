import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="display text-[22vw] leading-none text-ink-800 sm:text-[12rem]">404</p>
      <h1 className="display -mt-4 text-3xl">Off the schedule</h1>
      <p className="max-w-sm text-sm text-ash">
        That page doesn't exist. Head back to the class list.
      </p>
      <Link to="/classes">
        <Button className="mt-2">Back to classes</Button>
      </Link>
    </div>
  )
}
