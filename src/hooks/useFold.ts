import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { clampProgress } from '../domain/foldGeometry'
import type { PaperState } from '../domain/types'

const mediaQuery = '(prefers-reduced-motion: reduce)'
function subscribeMotion(callback: () => void) {
  const media = window.matchMedia(mediaQuery)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

export function useReducedMotion(quiet: boolean) {
  const reduced = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(mediaQuery).matches,
    () => false,
  )
  return quiet || reduced
}

export function useFold(reducedMotion: boolean) {
  const [view, setView] = useState<{ progress: number; state: PaperState; target: 0 | 1 }>({
    progress: 0,
    state: 'closed',
    target: 0,
  })
  const current = useRef(view)
  const frame = useRef<number | null>(null)

  const stop = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = null
  }, [])
  const update = useCallback((progress: number, target: 0 | 1, state: PaperState) => {
    current.current = { progress, target, state }
    setView(current.current)
  }, [])
  const animateTo = useCallback(
    (target: 0 | 1, instant = false) => {
      stop()
      const from = current.current.progress
      const settled = target ? 'open' : 'closed'
      if (reducedMotion || instant || Math.abs(target - from) < 0.001) {
        update(target, target, settled)
        return
      }
      const state = target ? 'opening' : 'closing'
      update(from, target, state)
      const start = performance.now()
      const duration = 850 * Math.abs(target - from)
      function tick(now: number) {
        const time = Math.min(1, (now - start) / duration)
        const ease = time * time * (3 - 2 * time)
        update(from + (target - from) * ease, target, time === 1 ? settled : state)
        frame.current = time === 1 ? null : requestAnimationFrame(tick)
      }
      frame.current = requestAnimationFrame(tick)
    },
    [reducedMotion, stop, update],
  )

  const dragTo = useCallback(
    (value: number) => {
      stop()
      const progress = clampProgress(value)
      const state =
        progress === 0
          ? 'closed'
          : progress === 1
            ? 'open'
            : progress >= current.current.progress
              ? 'opening'
              : 'closing'
      update(progress, current.current.target, state)
    },
    [stop, update],
  )

  // Honor a device preference that changes during an animation, too.
  useEffect(() => {
    if (!reducedMotion) return
    const id = requestAnimationFrame(() => animateTo(current.current.target, true))
    return () => cancelAnimationFrame(id)
  }, [reducedMotion, animateTo])
  useEffect(() => stop, [stop])

  return {
    ...view,
    current,
    animateTo,
    dragTo,
    stop,
    toggle: () => animateTo(current.current.target ? 0 : 1),
    reset: () => animateTo(0, true),
  }
}
