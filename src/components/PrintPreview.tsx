import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { Artwork } from '../domain/types'
import {
  DEFAULT_PRINT_OPTIONS,
  PRINT_PAPERS,
  createPrintLayout,
  foldDirection,
  formatPrintDistance,
  type PrintOptions,
  type PrintPaper,
} from '../domain/printLayout'
import { Icon } from './Icon'
import { Modal } from './Modal'
import { PrintLayout } from './PrintLayout'

export function PrintPreview({
  artwork,
  open,
  onClose,
}: {
  artwork: Artwork
  open: boolean
  onClose: () => void
}) {
  const [options, setOptions] = useState<PrintOptions>(DEFAULT_PRINT_OPTIONS)
  const [printError, setPrintError] = useState(false)
  const layout = createPrintLayout(artwork, options.paper)
  function toggle(key: 'guides' | 'ruler' | 'instructions', value: boolean) {
    setOptions((current) => ({ ...current, [key]: value }))
  }
  function print() {
    setPrintError(false)
    try {
      window.print()
    } catch {
      setPrintError(true)
    }
  }
  return (
    <>
      {/* Keep the same master ready for the browser's own Print command, even outside preview. */}
      {createPortal(
        <div className="print-output">
          <style>{`@page { size: ${layout.paper.cssSize} portrait; margin: 0; }`}</style>
          <PrintLayout artwork={artwork} options={options} />
        </div>,
        document.body,
      )}
      {open && (
        <Modal title="Print a little surprise" onClose={onClose} wide>
          <p className="modal-intro">
            A coloring craft to make together. Start with a grown-up and a sheet of paper.
          </p>
          <div className="print-settings">
            <fieldset className="print-paper-choice">
              <legend>Paper size</legend>
              {(Object.keys(PRINT_PAPERS) as PrintPaper[]).map((paper) => (
                <label key={paper}>
                  <input
                    type="radio"
                    name="print-paper"
                    value={paper}
                    checked={options.paper === paper}
                    onChange={() => setOptions((current) => ({ ...current, paper }))}
                  />
                  <span>
                    <strong>{PRINT_PAPERS[paper].label}</strong>
                    <small>{PRINT_PAPERS[paper].dimensions}</small>
                  </span>
                </label>
              ))}
            </fieldset>
            <div className="print-extras">
              <label>
                <input
                  type="checkbox"
                  checked={options.guides}
                  onChange={(event) => toggle('guides', event.target.checked)}
                />
                <span>
                  Subtle fold guides<small>Turn off for clean artwork.</small>
                </span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={options.ruler}
                  onChange={(event) => toggle('ruler', event.target.checked)}
                />
                <span>
                  50 mm calibration ruler<small>Check the size after printing.</small>
                </span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={options.instructions}
                  onChange={(event) => toggle('instructions', event.target.checked)}
                />
                <span>
                  Separate instruction sheet<small>Adds one page. Print single-sided.</small>
                </span>
              </label>
            </div>
          </div>
          <div className="print-help">
            <h3>In your print dialog</h3>
            <p>
              Choose <strong>{layout.paper.label}</strong>, portrait,{' '}
              <strong>100% / Actual size</strong>, and single-sided printing. Turn{' '}
              <strong>headers and footers off</strong> and choose <strong>no added margins</strong>;
              safe margins are already included. To keep a PDF, choose <strong>Save as PDF</strong>{' '}
              as the destination.
            </p>
            <p className="fine-print">
              Trial prints: the folds still need a hands-on check. Try one sheet first and check
              that the picture joins within 2 mm.
            </p>
          </div>
          {printError && (
            <p role="alert">
              The print dialog couldn’t open. Use your browser’s Print command to print these pages.
            </p>
          )}
          <div className="print-actions">
            <button className="primary-button" onClick={print}>
              <Icon name="print" />
              Print / Save as PDF
            </button>
            <button className="secondary-button" onClick={onClose}>
              Back to playing
            </button>
          </div>
          <div className="print-summary" aria-live="polite">
            <strong>{artwork.title}</strong>
            <span>
              {layout.paper.label} · {options.instructions ? '2 pages' : '1 page'}
            </span>
          </div>
          <div className="print-preview" aria-label="Print preview">
            <PrintLayout artwork={artwork} options={options} />
          </div>
          <div className="print-help">
            <details>
              <summary>Read the folding directions</summary>
              <p>
                Color first. Keep the whole sheet; don’t trim it. Start with the picture facing you
                and its top edge at the top. Measure from the top edge of the flat sheet; mark both
                edges before folding if guides are off.
              </p>
              <ol>
                {layout.folds.map((fold) => (
                  <li key={fold.number}>
                    <strong>{formatPrintDistance(fold.y)} from the top:</strong>{' '}
                    {foldDirection(fold.direction)}
                  </li>
                ))}
              </ol>
              <p>{layout.template.printCheck} Pull the top edge up to reveal the surprise.</p>
            </details>
          </div>
        </Modal>
      )}
    </>
  )
}
