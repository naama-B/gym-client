import { useState, useEffect } from 'react'

/**
 * A dedicated <div> appended to <body> for a portal to render into. Each overlay (the modal,
 * the toast stack) gets its OWN container instead of all portaling straight into <body>:
 * when two AnimatePresence trees mutate the same parent's child list at the same moment
 * (e.g. a toast appears while the modal animates out) React can throw
 * "Failed to execute 'insertBefore' on 'Node'". Separate containers keep them apart.
 */
export function usePortalContainer(name: string): HTMLElement | null {
  const [el] = useState<HTMLDivElement | null>(() => {
    if (typeof document === 'undefined') return null
    const node = document.createElement('div')
    node.dataset.portal = name
    return node
  })

  useEffect(() => {
    if (!el) return
    document.body.appendChild(el)
    return () => {
      el.remove()
    }
  }, [el])

  return el
}
