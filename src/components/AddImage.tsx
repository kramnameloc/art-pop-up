import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import {
  buildArtworkPrompt,
  MAX_SCENE_LENGTH,
  MAX_SVG_BYTES,
  MAX_TITLE_LENGTH,
  prepareSvg,
  svgImageUrl,
} from '../domain/manualArtwork'
import { customArtwork, type CustomArtworkRecord } from '../domain/customArtworkRepository'
import { templates } from '../domain/templates'
import { Icon } from './Icon'
import { Modal } from './Modal'
import { PaperSurface } from './PaperSurface'

const steps = ['Describe', 'Copy prompt', 'Import & preview']

export function AddImage({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (record: CustomArtworkRecord) => void
}) {
  const [step, setStep] = useState(0)
  const [scene, setScene] = useState('')
  const [title, setTitle] = useState('')
  const [source, setSource] = useState('')
  const [preview, setPreview] = useState<{ record: CustomArtworkRecord; fitted: boolean } | null>(
    null,
  )
  const [error, setError] = useState('')
  const [copyMessage, setCopyMessage] = useState('')
  const [fileMessage, setFileMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const promptField = useRef<HTMLTextAreaElement>(null)
  const stepHeading = useRef<HTMLHeadingElement>(null)
  const revision = useRef(0)
  const prompt = buildArtworkPrompt(scene)

  function goTo(next: number) {
    // Move focus as part of the transition, before someone can start typing in the next step.
    flushSync(() => {
      setStep(next)
      setError('')
      setCopyMessage('')
    })
    stepHeading.current?.focus()
    stepHeading.current?.scrollIntoView({ block: 'nearest' })
  }

  function changeSource(value: string) {
    revision.current++
    setSource(value)
    setPreview(null)
    setError('')
    setFileMessage('')
    setBusy(false)
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopyMessage('Prompt copied. Paste it into a ChatGPT conversation.')
    } catch {
      promptField.current?.focus()
      promptField.current?.select()
      setCopyMessage('Copy was unavailable. The prompt is selected: use Copy or Ctrl+C / ⌘C.')
    }
  }

  async function readFile(file: File | undefined) {
    if (!file) return
    changeSource('')
    if (!/\.svg$/i.test(file.name)) {
      setError('Choose an .svg file, or paste SVG code below. PNG and JPG files are not supported.')
      return
    }
    if (file.size > MAX_SVG_BYTES) {
      setError('This SVG is too large. Use a simpler SVG under 400 KB.')
      return
    }
    const current = revision.current
    setBusy(true)
    try {
      const text = await file.text()
      if (current !== revision.current) return
      setSource(text)
      setFileMessage(`${file.name} is ready to preview.`)
      if (!title.trim()) setTitle(file.name.replace(/\.svg$/i, '').slice(0, MAX_TITLE_LENGTH))
    } catch {
      if (current === revision.current)
        setError('This file could not be read. Try it again or paste its SVG code.')
    } finally {
      if (current === revision.current) setBusy(false)
    }
  }

  async function makePreview() {
    setError('')
    setPreview(null)
    const current = revision.current
    setBusy(true)
    try {
      const prepared = prepareSvg(source)
      const image = new Image()
      image.src = svgImageUrl(prepared.svg)
      await image.decode()
      if (current !== revision.current) return
      setPreview({
        fitted: prepared.fitted,
        record: {
          id: `custom-${crypto.randomUUID()}`,
          title: title.trim() || 'My paper surprise',
          scene: scene.trim(),
          svg: prepared.svg,
          templateId: 'surprise',
          templateVersion: 1,
          createdAt: new Date().toISOString(),
        },
      })
    } catch (cause) {
      if (current === revision.current)
        setError(
          cause instanceof Error
            ? cause.message
            : 'This SVG could not be previewed. Check its code and try again.',
        )
    } finally {
      if (current === revision.current) setBusy(false)
    }
  }

  function save() {
    if (!preview) return
    try {
      onSave({ ...preview.record, title: title.trim() || 'My paper surprise', scene: scene.trim() })
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'This picture could not be saved. Try again.',
      )
    }
  }

  return (
    <Modal title="Add your own image" onClose={onClose} wide>
      <p className="modal-intro">
        Manual mode · Make a picture with a grown-up. Use ChatGPT to write SVG code, then bring it
        back here. No API key needed.
      </p>
      <ol className="import-steps" aria-label="Add image progress">
        {steps.map((label, index) => (
          <li key={label} aria-current={step === index ? 'step' : undefined}>
            <span>{index + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      <div className="manual-form">
        <h3 ref={stepHeading} tabIndex={-1}>
          {steps[step]}
        </h3>
        {step === 0 && (
          <>
            <label htmlFor="scene-idea">Describe your scene</label>
            <p className="field-hint" id="scene-hint">
              What should the folded picture look like, and what surprise is hiding inside?
            </p>
            <textarea
              id="scene-idea"
              aria-describedby="scene-hint"
              rows={5}
              maxLength={MAX_SCENE_LENGTH}
              placeholder="A little teapot that opens to reveal a garden party with friendly mice, flowers, and cupcakes."
              value={scene}
              onChange={(event) => setScene(event.target.value)}
            />
            <div className="manual-actions">
              <button className="primary-button" disabled={!scene.trim()} onClick={() => goTo(1)}>
                Build my prompt <Icon name="arrow" size={17} />
              </button>
              <button className="text-button" onClick={() => goTo(2)}>
                I already have an SVG
              </button>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <p className="field-hint">
              Copy these instructions into ChatGPT. Its reply should be one SVG code block. Use that
              block’s “Copy code” button, then paste it here in the next step. The prompt includes
              the art style, paper size, and fold positions.
            </p>
            <label htmlFor="artwork-prompt">Your ChatGPT prompt</label>
            <textarea
              id="artwork-prompt"
              ref={promptField}
              className="code-field"
              rows={10}
              value={prompt}
              readOnly
            />
            <div className="manual-actions">
              <button className="secondary-button" onClick={copyPrompt}>
                <Icon name="copy" size={18} /> Copy prompt
              </button>
            </div>
            {copyMessage && (
              <p className="field-hint" role="status">
                {copyMessage}
              </p>
            )}
            <div className="manual-actions">
              <button className="secondary-button" onClick={() => goTo(0)}>
                Back
              </button>
              <button className="primary-button" onClick={() => goTo(2)}>
                I have my SVG <Icon name="arrow" size={17} />
              </button>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <label htmlFor="picture-title">Picture name</label>
            <input
              id="picture-title"
              type="text"
              maxLength={MAX_TITLE_LENGTH}
              placeholder="My paper surprise"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <label htmlFor="svg-file">Upload an SVG file</label>
            <input
              id="svg-file"
              type="file"
              accept=".svg,image/svg+xml"
              aria-describedby="svg-hint"
              onChange={(event) => {
                void readFile(event.target.files?.[0])
                event.target.value = ''
              }}
            />
            {fileMessage && (
              <p className="field-hint" role="status">
                {fileMessage}
              </p>
            )}
            <label htmlFor="svg-source">Or paste SVG code</label>
            <textarea
              id="svg-source"
              className="code-field"
              rows={6}
              spellCheck={false}
              placeholder={'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 612 792">…</svg>'}
              value={source}
              onChange={(event) => changeSource(event.target.value)}
              aria-describedby="svg-hint"
            />
            <p className="field-hint" id="svg-hint">
              Static vector SVG, up to 400 KB. A 612 × 792 viewBox fits the folds exactly. Other
              sizes fit inside the paper without stretching. Use the prompt for a picture that joins
              when folded.
            </p>
            <details className="svg-requirements">
              <summary>SVG compatibility tips</summary>
              <p>
                Use shapes and paths with fill and stroke attributes. Remove scripts, animation,
                embedded images, text, styles, and external links. If a ChatGPT response fails,
                paste the error into that conversation and ask for a corrected SVG.
              </p>
            </details>
            <div className="manual-actions">
              <button
                className="secondary-button"
                disabled={busy}
                onClick={() => goTo(scene.trim() ? 1 : 0)}
              >
                Back
              </button>
              <button
                className="secondary-button"
                disabled={busy || !source.trim()}
                onClick={() => void makePreview()}
              >
                {busy ? 'Preparing preview…' : 'Preview my picture'}
              </button>
            </div>
            {preview && (
              <section className="custom-preview" aria-label="Review your picture">
                <h3>Check your little surprise</h3>
                <p className="field-hint">
                  Do the top and bottom join? Is the surprise hidden until the paper opens?
                </p>
                {preview.fitted && (
                  <p className="import-notice">
                    This SVG was fitted to the paper. Its folds may not line up; use the prompt’s
                    612 × 792 layout to adjust it.
                  </p>
                )}
                <div className="custom-preview-papers">
                  {[false, true].map((open) => (
                    <figure key={String(open)}>
                      <PaperSurface
                        template={templates.surprise}
                        artwork={customArtwork(preview.record)}
                        open={open}
                      />
                      <figcaption>
                        {open ? 'Open · the whole scene' : 'Folded · the surprise is hidden'}
                      </figcaption>
                    </figure>
                  ))}
                </div>
                <button className="primary-button" onClick={save}>
                  <Icon name="check" size={18} /> Save to my pictures
                </button>
              </section>
            )}
          </>
        )}
        {error && (
          <p className="import-error" role="alert">
            {error}
          </p>
        )}
      </div>
      <p className="fine-print">
        Saved in local storage in this browser only. Clearing site data removes your saved pictures.
        Keep your original SVG as a backup. Nothing is sent to ChatGPT by this app.
      </p>
    </Modal>
  )
}
