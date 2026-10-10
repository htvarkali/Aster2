import { useEffect, useRef, useState } from 'react'
import ConstellationScene from './ConstellationScene'
import ConnectionDemo from './ConnectionDemo'
import wordmark from '../assets/aster-wordmark.svg'
import './AsterLanding.css'

const SOURCE = 'https://github.com/bump-hackgt/bump'

function Star({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 1.5 23.8 15.4 38.5 20 23.8 24.6 20 38.5 16.2 24.6 1.5 20 16.2 15.4Z" fill="currentColor" /></svg>
}

function Arrow({ down = false }: { down?: boolean }) {
  return <svg className={down ? 'aster-arrow is-down' : 'aster-arrow'} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

const STEPS = [
  { title: 'Bring a little of you.', text: 'Talk or type a short introduction. Shape a profile from your interests, experiences, and things you want to try.', note: 'Your words. Your final say.' },
  { title: 'Make the first move.', text: 'Meet someone nearby and gently tap phones. Both of you confirm the connection before sharing your full cards.', note: 'One meeting. Two yeses.' },
  { title: 'Find your common ground.', text: 'Discover a specific interest you share and a grounded conversation starter. Save the connection, then start talking.', note: 'A reason to put the phones down.' },
]

export default function AsterLanding() {
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const element = root.current
    if (!element || reducedMotion || typeof IntersectionObserver === 'undefined') return
    element.classList.add('aster-observing')
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' })
    element.querySelectorAll('[data-reveal]').forEach(target => observer.observe(target))
    return () => {
      observer.disconnect()
      element.classList.remove('aster-observing')
    }
  }, [reducedMotion])

  useEffect(() => {
    const element = root.current
    if (!element) return
    const syncVisibility = () => { element.dataset.pageVisible = String(!document.hidden) }
    syncVisibility()
    document.addEventListener('visibilitychange', syncVisibility)
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      entries.forEach(entry => { (entry.target as HTMLElement).dataset.inView = String(entry.isIntersecting) })
    })
    element.querySelectorAll('.aster-hero-visual, .aster-gesture, .aster-closing').forEach(target => observer?.observe(target))
    return () => {
      observer?.disconnect()
      document.removeEventListener('visibilitychange', syncVisibility)
    }
  }, [])

  const motionPaused = paused || reducedMotion

  return (
    <div ref={root} className="aster-landing" data-motion={motionPaused ? 'paused' : 'running'}>
      <a className="aster-skip" href="#main">Skip to content</a>
      <header className="aster-header aster-shell" id="top">
        <a className="aster-brand" href="#top" aria-label="Aster, back to top">
          <Star />
          <img src={wordmark} alt="Aster" width="107" height="22" />
        </a>
        <nav className="aster-nav" aria-label="Primary">
          <a href="#the-idea">The idea</a>
          <a href="#how-it-works">How it works</a>
          <a href="#the-overlap">Common ground</a>
        </nav>
        <a className="aster-source" href={SOURCE} target="_blank" rel="noreferrer">View source <Arrow /></a>
      </header>

      <main id="main">
        <section className="aster-hero aster-shell" aria-labelledby="aster-title">
          <div className="aster-hero-copy">
            <p className="aster-eyebrow"><span className="aster-tiny-star">✦</span> A small hello. A new constellation.</p>
            <h1 id="aster-title">Your people.<br /><em>In your orbit.</em></h1>
            <p className="aster-hero-description">The people you click with might already be next to you. Aster helps you find the common ground, so the first hello comes a little easier.</p>
            <div className="aster-hero-actions">
              <a className="aster-button" href="#how-it-works">Meet Aster <Arrow down /></a>
              <a className="aster-text-link" href="#the-overlap">See a connection <Arrow /></a>
            </div>
            <div className="aster-hero-note">
              <div className="aster-person-dots" aria-hidden="true"><span>M</span><span>D</span><Star /></div>
              <p>Find your people.<br /><strong>Build your constellation.</strong></p>
            </div>
          </div>
          <div className="aster-hero-visual">
            <ConstellationScene paused={motionPaused} />
            <button className="aster-motion-toggle" type="button" onClick={() => setPaused(value => !value)} aria-pressed={motionPaused} disabled={reducedMotion}>
              <svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">{motionPaused ? <path d="m5 3 8 5-8 5Z" /> : <><rect x="4" y="3" width="2" height="10" rx=".5" /><rect x="10" y="3" width="2" height="10" rx=".5" /></>}</svg>
              {reducedMotion ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion'}
            </button>
          </div>
          <div className="aster-hero-caption">
            <span>Made for the people already in the room.</span>
            <a href="#the-idea">A closer look <Arrow down /></a>
          </div>
        </section>

        <section className="aster-idea aster-shell" id="the-idea" aria-labelledby="idea-title">
          <div className="aster-section-label" data-reveal><span>01 / THE IDEA</span><Star /></div>
          <div className="aster-idea-content" data-reveal>
            <h2 id="idea-title">So many people.<br />So many <em>possible connections.</em></h2>
            <div className="aster-idea-aside">
              <span className="aster-quiet-rule" />
              <p>A familiar interest. A skill you want to learn. A place you both love.</p>
              <p>Sometimes all it takes is seeing the little thing you have in common.</p>
            </div>
          </div>
          <div className="aster-orbit-strip" aria-label="Examples of shared interests">
            {['Film photography', 'Night hiking', 'Jazz', 'Making things', 'Good coffee'].map((interest, index) => <span key={interest}><Star />{interest}<small>0{index + 1}</small></span>)}
          </div>
        </section>

        <section className="aster-process aster-shell" id="how-it-works" aria-labelledby="process-title">
          <div className="aster-process-heading" data-reveal>
            <p className="aster-eyebrow">02 / HOW IT WORKS</p>
            <h2 id="process-title">From strangers<br />to <em>something shared.</em></h2>
            <p>A little context.<br />A much better first conversation.</p>
          </div>
          <ol className="aster-steps">
            {STEPS.map((step, index) => <li key={step.title} data-reveal>
              <div className="aster-step-marker"><span>0{index + 1}</span><Star /></div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <span className="aster-step-note">{step.note}</span>
            </li>)}
          </ol>
        </section>

        <section className="aster-gesture" aria-labelledby="gesture-title">
          <svg className="aster-gesture-network" viewBox="0 0 1400 650" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <g fill="none"><path d="M0 480 280 370 700 325 1030 390 1400 475M0 105 330 170 700 325 1070 145 1400 80M280 370 330 170 700 92 1070 145 1030 390 700 548 280 370" /><path className="aster-gesture-pulse" d="M280 370 700 325 1030 390M330 170 700 325 1070 145" /></g>
            <g>{[[280, 370], [330, 170], [700, 92], [1070, 145], [1030, 390], [700, 548]].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" />)}</g>
          </svg>
          <img className="aster-gesture-phone aster-gesture-phone-blue" src="/assets/phone-blue@1600.png" alt="" width="1100" height="506" loading="lazy" />
          <img className="aster-gesture-phone aster-gesture-phone-orange" src="/assets/phone-orange@1600.png" alt="" width="1100" height="604" loading="lazy" />
          <div className="aster-gesture-copy" data-reveal>
            <p className="aster-eyebrow">THE MEETING POINT</p>
            <Star className="aster-gesture-star" />
            <h2 id="gesture-title">One small tap.<br /><em>A whole new orbit.</em></h2>
            <p>Both of you confirm.<br />Then the common ground comes into view.</p>
          </div>
          <span className="aster-gesture-caption">A real-world gesture. A reason to connect.</span>
        </section>

        <ConnectionDemo />

        <section className="aster-details aster-shell" aria-labelledby="details-title">
          <div className="aster-details-intro" data-reveal>
            <p className="aster-eyebrow">MADE FOR THE MOMENT</p>
            <h2 id="details-title">Human connection.<br /><em>Thoughtfully made.</em></h2>
            <p>Aster gives you something to talk about. What happens next is yours.</p>
          </div>
          <div className="aster-detail-list" data-reveal>
            <article><span>01</span><div><h3>A profile that feels like you.</h3><p>You review and edit your interests before saving your card.</p></div><Star /></article>
            <article><span>02</span><div><h3>Common ground with a source.</h3><p>Matching starts with what both profiles support. AI can help put it into words.</p></div><Star /></article>
            <article><span>03</span><div><h3>Connections worth keeping.</h3><p>Save people and shared interests on your phone, ready to revisit after the first hello.</p></div><Star /></article>
          </div>
        </section>

        <section className="aster-closing" aria-labelledby="closing-title">
          <div className="aster-shell aster-closing-inner">
            <div className="aster-closing-orbit" aria-hidden="true"><span /><span /><span /><Star /></div>
            <p className="aster-eyebrow">CRAFTING CONSTELLATIONS</p>
            <h2 id="closing-title">Every constellation starts<br />with <em>one connection.</em></h2>
            <a className="aster-button" href="#the-overlap">Find the common ground <Arrow /></a>
            <p className="aster-closing-note">An iOS prototype for a better first hello.</p>
          </div>
        </section>
      </main>

      <footer className="aster-footer aster-shell">
        <a className="aster-brand" href="#top" aria-label="Aster, back to top"><Star /><img src={wordmark} alt="Aster" width="107" height="22" /></a>
        <p>Built on <a href={SOURCE} target="_blank" rel="noreferrer">Bump</a>. Reimagined for Crafting Constellations.</p>
        <a className="aster-footer-source" href={SOURCE} target="_blank" rel="noreferrer">The code <Arrow /></a>
      </footer>
    </div>
  )
}
