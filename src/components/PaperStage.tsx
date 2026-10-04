import { useEffect, useRef, type PointerEvent, type KeyboardEvent } from 'react'
import type { Artwork } from '../domain/types'
import { clampProgress } from '../domain/foldGeometry'
import { useFold, useReducedMotion } from '../hooks/useFold'
import { FoldingPaper } from './FoldingPaper'
import { Icon } from './Icon'

const stateLabels = {
  closed: 'Folded paper',
  opening: 'Opening…',
  open: 'Open paper',
  closing: 'Folding…',
}

export function PaperStage({ artwork, quietMotion }: { artwork: Artwork; quietMotion: boolean }) {
  const reduced = useReducedMotion(quietMotion)
  const fold = useFold(reduced)
  const holder = useRef<HTMLDivElement>(null)
  const drag = useRef<{
    id: number
    y: number
    progress: number
    target: 0 | 1
    travel: number
    viewportWidth: number
    viewportHeight: number
  } | null>(null)
  const handle = useRef<HTMLDivElement>(null)
  const { animateTo } = fold

  useEffect(() => {
    function cancel() {
      if (!drag.current) return
      const { id, target } = drag.current
      drag.current = null
      if (handle.current?.hasPointerCapture(id)) handle.current.releasePointerCapture(id)
      animateTo(target)
    }
    window.addEventListener('blur', cancel)
    window.addEventListener('resize', cancel)
    document.addEventListener('visibilitychange', cancel)
    return () => {
      window.removeEventListener('blur', cancel)
      window.removeEventListener('resize', cancel)
      document.removeEventListener('visibilitychange', cancel)
    }
  }, [animateTo])

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0 || drag.current) return
    event.preventDefault()
    event.currentTarget.focus()
    event.currentTarget.setPointerCapture(event.pointerId)
    fold.stop()
    drag.current = {
      id: event.pointerId,
      y: event.clientY,
      progress: fold.current.current.progress,
      target: fold.current.current.target,
      travel: ((holder.current?.getBoundingClientRect().width ?? 320) * 792) / 612 / 2,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    }
  }
  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const active = drag.current
    if (!active || event.pointerId !== active.id) return
    fold.dragTo(active.progress + (active.y - event.clientY) / active.travel)
  }
  function finishDrag(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    const active = drag.current
    if (!active || event.pointerId !== active.id) return
    drag.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId)
    // A tap on the tab is also useful; a drag snaps at the halfway point.
    const moved = Math.abs(event.clientY - active.y) > 4
    const resized =
      active.viewportWidth !== window.innerWidth || active.viewportHeight !== window.innerHeight
    animateTo(
      cancelled || resized
        ? active.target
        : moved
          ? fold.current.current.progress >= 0.5
            ? 1
            : 0
          : active.target
            ? 0
            : 1,
    )
  }
  function keyHandle(event: KeyboardEvent<HTMLDivElement>) {
    const targets: Record<string, 0 | 1> = {
      ArrowUp: 1,
      ArrowRight: 1,
      End: 1,
      ArrowDown: 0,
      ArrowLeft: 0,
      Home: 0,
    }
    if (event.key === 'Escape' && drag.current) {
      event.preventDefault()
      const active = drag.current
      drag.current = null
      if (event.currentTarget.hasPointerCapture(active.id))
        event.currentTarget.releasePointerCapture(active.id)
      animateTo(active.target)
    } else if (event.key in targets) {
      event.preventDefault()
      animateTo(targets[event.key])
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      fold.toggle()
    }
  }
  function clearDrag() {
    const active = drag.current
    drag.current = null
    if (active && handle.current?.hasPointerCapture(active.id))
      handle.current.releasePointerCapture(active.id)
  }

  return (
    <section className="stage-section" aria-labelledby="stage-title" data-fold-state={fold.state}>
      <div className="stage-heading">
        <div className="section-heading">
          <span className="step-number">2</span>
          <h2 id="stage-title">Play with your paper</h2>
        </div>
        <span className="small-label">MAKE ROOM FOR WONDER</span>
      </div>
      <div className="craft-table">
        <div className="table-toolbar">
          <span>
            <span className="status-dot" />
            {artwork.title}
          </span>
          <span className="view-badge">{stateLabels[fold.state]}</span>
        </div>
        <span className="table-star star-one" aria-hidden="true">
          ✳
        </span>
        <span className="table-star star-two" aria-hidden="true">
          ✧
        </span>
        <div className="paper-holder" ref={holder}>
          <FoldingPaper artwork={artwork} progress={fold.progress} />
        </div>
        <div
          ref={handle}
          className="paper-pull-tab"
          role="slider"
          tabIndex={0}
          aria-label="Unfold paper"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(clampProgress(fold.progress) * 100)}
          aria-valuetext={
            fold.progress === 0 ? 'Folded' : fold.progress === 1 ? 'Open' : 'Partly unfolded'
          }
          aria-orientation="vertical"
          aria-describedby="drag-hint"
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={finishDrag}
          onPointerCancel={(event) => finishDrag(event, true)}
          onLostPointerCapture={(event) => finishDrag(event, true)}
          onKeyDown={keyHandle}
        >
          <span aria-hidden="true">↕</span>
          <span>Pull for a surprise</span>
          <span className="grip-dots" aria-hidden="true">
            ⠿
          </span>
        </div>
        <p id="drag-hint" className="drag-hint">
          Drag up to open, down to fold. Or use the button below.
        </p>
        <div className="stage-caption" aria-live="polite" aria-atomic="true">
          {fold.state === 'open'
            ? artwork.descriptions.open
            : fold.state === 'closed'
              ? 'Big possibilities, tucked into a little fold.'
              : 'A little paper magic…'}
        </div>
      </div>
      <div className="stage-controls">
        <div>
          <span className="preview-tag">ONE LITTLE SHEET · A BIG SURPRISE</span>
          <p>Open it. Fold it. Find the joy again.</p>
        </div>
        <div className="control-buttons">
          <button
            className="icon-button reset-button"
            aria-label="Reset paper"
            disabled={fold.state === 'closed'}
            onClick={() => {
              clearDrag()
              fold.reset()
            }}
          >
            <Icon name="reset" />
          </button>
          <button
            className="primary-button"
            onClick={() => {
              clearDrag()
              fold.toggle()
            }}
            aria-expanded={fold.target === 1}
          >
            <Icon name="open" />
            {fold.target ? 'Fold it back' : 'Open the surprise'}
          </button>
        </div>
      </div>
    </section>
  )
}
