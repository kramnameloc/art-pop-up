import type { Artwork } from '../domain/types'
import { templates } from '../domain/templates'
import { PaperSurface } from './PaperSurface'
import { Icon } from './Icon'

export function PaperStage({
  artwork,
  open,
  onToggle,
  onReset,
}: {
  artwork: Artwork
  open: boolean
  onToggle: () => void
  onReset: () => void
}) {
  return (
    <section className="stage-section" aria-labelledby="stage-title">
      <div className="stage-heading">
        <div className="section-heading">
          <span className="step-number">2</span>
          <h2 id="stage-title">Play with your paper</h2>
        </div>
        <span className="small-label">MAKE ROOM FOR WONDER</span>
      </div>
      <div className={`craft-table ${open ? 'is-open' : ''}`}>
        <div className="table-toolbar">
          <span>
            <span className="status-dot" />
            {artwork.title}
          </span>
          <span className="view-badge">{open ? 'Open paper' : 'Folded paper'}</span>
        </div>
        <span className="table-star star-one" aria-hidden="true">
          ✳
        </span>
        <span className="table-star star-two" aria-hidden="true">
          ✧
        </span>
        <div className="paper-holder">
          <span className="paper-tape" aria-hidden="true" />
          <PaperSurface template={templates[artwork.templateId]} open={open} artwork={artwork} />
        </div>
        {!open && (
          <div className="handwritten" aria-hidden="true">
            a little paper magic <span>⤵</span>
          </div>
        )}
        <div className="stage-caption" aria-live="polite">
          {open
            ? 'A whole new space for your imagination.'
            : 'Big possibilities, tucked into a little fold.'}
        </div>
      </div>
      <div className="stage-controls">
        <div>
          <span className="preview-tag">US LETTER · 8.5 × 11 IN</span>
          <p>Concept preview. Give it a little unfold.</p>
        </div>
        <div className="control-buttons">
          <button
            className="icon-button reset-button"
            onClick={onReset}
            aria-label="Reset paper"
            disabled={!open}
          >
            <Icon name="reset" />
          </button>
          <button className="primary-button" onClick={onToggle} aria-expanded={open}>
            <Icon name="open" />
            {open ? 'Fold it back' : 'Open the paper'}
          </button>
        </div>
      </div>
    </section>
  )
}
