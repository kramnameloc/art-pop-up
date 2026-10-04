import { useState } from 'react'
import { templates, createPrototypeSvg } from '../domain/templates'
import type { TemplateId } from '../domain/types'
import { PaperSurface } from './PaperSurface'
import { Icon } from './Icon'

export function FoldLab() {
  const [templateId, setTemplateId] = useState<TemplateId>('surprise')
  const template = templates[templateId]
  function download() {
    const url = URL.createObjectURL(
      new Blob([createPrototypeSvg(template)], { type: 'image/svg+xml' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = `${template.id}-fold-prototype-v${template.version}.svg`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return (
    <div className="fold-lab">
      <p className="modal-intro">
        A little paper experiment. Compare the layouts, then try them with a real sheet.
      </p>
      <fieldset className="template-choice">
        <legend>Choose a fold</legend>
        {Object.values(templates).map((item) => (
          <label key={item.id}>
            <input
              type="radio"
              name="template"
              value={item.id}
              checked={templateId === item.id}
              onChange={() => setTemplateId(item.id)}
            />
            <span>{item.name}</span>
          </label>
        ))}
      </fieldset>
      <p>{template.description}</p>
      <div className="lab-preview">
        <figure>
          <PaperSurface template={template} open numbered />
          <figcaption>Open sheet</figcaption>
        </figure>
        <Icon name="arrow" />
        <figure>
          <PaperSurface template={template} open={false} numbered />
          <figcaption>Expected folded view</figcaption>
        </figure>
      </div>
      <div className="lab-instructions">
        <h3>Try it on paper</h3>
        <ol>
          {template.instructions.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
      <button className="primary-button" onClick={download}>
        <Icon name="download" /> Download numbered sheet
      </button>
      <p className="fine-print">
        The sheet is US Letter: 8.5 × 11 inches. Print at actual size on Letter paper. If your
        printer shrinks the sheet, trim to its outside border and measure folds inside that border.
        These are geometric prototypes, awaiting a physical fold check.
      </p>
    </div>
  )
}
