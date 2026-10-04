import { useEffect, useState } from 'react'
import { loadArtworks } from './domain/artworkRepository'
import type { Artwork } from './domain/types'
import { DemoGallery } from './components/DemoGallery'
import { PaperStage } from './components/PaperStage'
import { Modal } from './components/Modal'
import { FoldLab } from './components/FoldLab'
import { Icon } from './components/Icon'
import { PrintPreview } from './components/PrintPreview'

type Collection =
  { status: 'loading' } | { status: 'error' } | { status: 'ready'; artworks: Artwork[] }
type Dialog = 'help' | 'grownups' | 'folds' | 'print' | null

export default function App() {
  const [collection, setCollection] = useState<Collection>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [selectedId, setSelectedId] = useState('picnic-cooler')
  const [dialog, setDialog] = useState<Dialog>(null)
  const [quietMotion, setQuietMotion] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(10000)])
    loadArtworks(signal)
      .then((artworks) => setCollection({ status: 'ready', artworks }))
      .catch(() => {
        if (!controller.signal.aborted) setCollection({ status: 'error' })
      })
    return () => controller.abort()
  }, [attempt])

  function retry() {
    setCollection({ status: 'loading' })
    setAttempt((value) => value + 1)
  }

  const selected =
    collection.status === 'ready'
      ? (collection.artworks.find((artwork) => artwork.id === selectedId) ?? collection.artworks[0])
      : null

  return (
    <div className="app" data-quiet-motion={quietMotion}>
      <a className="skip-link" href="#studio">
        Skip to the paper studio
      </a>
      <header className="site-header">
        <a className="brand" href="./" aria-label="Pop and Paper home">
          <span className="brand-mark">
            <Icon name="fold" size={27} />
          </span>
          <span>
            pop <em>&</em> paper<span className="brand-dot">.</span>
          </span>
        </a>
        <nav aria-label="Studio help">
          <button className="text-button" onClick={() => setDialog('help')}>
            <Icon name="help" size={18} />
            How it works
          </button>
          <button className="grownup-button" onClick={() => setDialog('grownups')}>
            <Icon name="settings" size={17} />
            For grown-ups
          </button>
        </nav>
      </header>
      <main id="studio" tabIndex={-1}>
        <section className="intro" aria-labelledby="page-title">
          <div className="eyebrow">
            <span />
            THE LITTLE PAPER ART STUDIO
          </div>
          <h1 id="page-title">
            A little fold.
            <br className="mobile-break" /> <em>A big surprise.</em>
            <span className="title-spark" aria-hidden="true">
              ✳
            </span>
          </h1>
          <p>
            A happy place for curious hands and colorful imaginations.
            <br className="desktop-break" /> Pick a picture, unfold your paper, and discover what’s
            inside.
          </p>
          <span className="intro-doodle" aria-hidden="true">
            <Icon name="star" size={39} />
            <span>
              made for
              <br />
              little makers
            </span>
          </span>
        </section>
        {collection.status === 'loading' && (
          <section className="collection-state" role="status" aria-live="polite">
            <span className="loading-paper">
              <Icon name="fold" size={38} />
            </span>
            <h2>Setting out the paper…</h2>
            <p>Your little art studio is on its way.</p>
          </section>
        )}
        {collection.status === 'error' && (
          <section className="collection-state" role="alert">
            <Icon name="fold" size={38} />
            <h2>Our paper got a little stuck.</h2>
            <p>We couldn’t load the picture collection. Let’s give it another try.</p>
            <button className="primary-button" onClick={retry}>
              <Icon name="reset" />
              Try again
            </button>
          </section>
        )}
        {collection.status === 'ready' && selected && (
          <div className="studio-layout">
            <DemoGallery
              artworks={collection.artworks}
              selectedId={selected.id}
              onSelect={(id) => {
                setSelectedId(id)
              }}
            />
            <PaperStage
              artwork={selected}
              key={selected.id}
              quietMotion={quietMotion}
              onPrint={() => setDialog('print')}
            />
          </div>
        )}
        <section className="studio-bottom" aria-label="About this studio">
          <div className="maker-message">
            <span className="sun-stamp" aria-hidden="true">
              ☀
            </span>
            <div>
              <strong>A little paper. A lot of possibility.</strong>
              <p>A picnic, a party, a tiny garden. Which surprise will you find?</p>
            </div>
          </div>
          <button className="text-button fold-lab-link" onClick={() => setDialog('folds')}>
            <Icon name="fold" size={19} />
            Explore the folds
            <Icon name="arrow" size={17} />
          </button>
        </section>
      </main>
      <footer className="site-footer">
        <span>Made for making. And a little bit of magic.</span>
        <span>
          <Icon name="leaf" size={15} />
          Just you, paper & imagination.
        </span>
      </footer>
      {dialog === 'help' && (
        <Modal title="A little guide to paper play" onClose={() => setDialog(null)}>
          <p className="modal-intro">There’s no right or wrong way to be curious.</p>
          <ol className="help-steps">
            <li>
              <span>1</span>
              <div>
                <h3>Pick a little idea</h3>
                <p>Choose the cooler, gift box, or flower pot.</p>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <h3>Open your paper</h3>
                <p>
                  Press “Open the surprise” to discover what’s hiding inside. Press “Fold it back”
                  to start again.
                </p>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <h3>Print, color, and fold</h3>
                <p>
                  Ask a grown-up to open “Print & color”. Pick your paper size, print the picture,
                  and follow the folding directions to make a surprise of your own.
                </p>
              </div>
            </li>
          </ol>
          <p className="fine-print">
            Use the button with a mouse, touch, or Tab and Enter. Drag the pull tab up to open and
            down to fold, or focus it and use the arrow keys.
          </p>
        </Modal>
      )}
      {dialog === 'grownups' && (
        <Modal title="A spot for grown-ups" onClose={() => setDialog(null)}>
          <p className="modal-intro">A calm little space to make the studio your own.</p>
          <label className="setting-row">
            <span>
              <strong>Less movement</strong>
              <span>Open and fold instantly, with no animated movement.</span>
            </span>
            <input
              type="checkbox"
              checked={quietMotion}
              onChange={(event) => setQuietMotion(event.target.checked)}
            />
          </label>
          <p className="fine-print">
            Your device’s reduced-motion preference is always respected. This extra setting lasts
            until you refresh.
          </p>
          <div className="grownup-note">
            <h3>About this early studio</h3>
            <p>
              These original pictures live right here in the studio. No account, personal details,
              or API key is needed. Print coloring sheets on US Letter or A4 paper, with optional
              guides and a separate instruction sheet.
            </p>
            <p>
              The paper geometry still needs a real-world fold check. The fold lab includes numbered
              sheets and directions to try at home.
            </p>
            <button className="secondary-button" onClick={() => setDialog('folds')}>
              <Icon name="fold" />
              Visit the fold lab
              <Icon name="arrow" size={17} />
            </button>
            {selected && (
              <button className="secondary-button" onClick={() => setDialog('print')}>
                <Icon name="print" />
                Print &amp; color
              </button>
            )}
          </div>
        </Modal>
      )}
      {dialog === 'folds' && (
        <Modal title="The little fold lab" onClose={() => setDialog(null)} wide>
          <FoldLab />
        </Modal>
      )}
      {selected && (
        <PrintPreview
          artwork={selected}
          open={dialog === 'print'}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  )
}
