import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowUpRight, Download, Menu, Pause, Play, Radar, Sparkles, UserRound, X } from 'lucide-react'
import { makeAsterBadge, type BadgeImages, type BadgeVariant } from './asterBadge'
import './LanyardLanding.css'

const Lanyard3D = lazy(() => import('./Lanyard3D'))
const DitherBackground = lazy(() => import('./DitherBackground'))
const SOURCE = 'https://github.com/htvarkali/Aster2'
const ORIGINAL = 'https://github.com/bump-hackgt/bump'
const TEMPLATE = 'https://github.com/tejavarkali-hub/lanyardly'

function Reveal({ children, className = '', staticMotion = false }: { children: React.ReactNode; className?: string; staticMotion?: boolean }) {
  if (staticMotion || typeof IntersectionObserver === 'undefined') return <div className={className}>{children}</div>
  return <motion.div className={className} initial={{ opacity: 0, y: 12, filter: 'blur(12px)' }}
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true, amount: .12 }}
    transition={{ type: 'spring', bounce: .3, duration: staticMotion ? 0 : 1.5 }}>{children}</motion.div>
}

function Brand() {
  return <a className="ll-brand" href="#top" aria-label="Aster, back to top"><svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M8 33 20 5l12 28M12 24h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><g fill="currentColor"><circle cx="8" cy="33" r="2"/><circle cx="20" cy="5" r="2.4"/><circle cx="32" cy="33" r="2"/><circle cx="12" cy="24" r="1.5"/><circle cx="28" cy="24" r="1.5"/></g></svg><span>ASTER / IRL</span></a>
}

export default function LanyardLanding() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [heroVisible, setHeroVisible] = useState(true)
  const [name, setName] = useState('')
  const [appliedName, setAppliedName] = useState('')
  const [variant, setVariant] = useState<BadgeVariant>('dark')
  const [appliedVariant, setAppliedVariant] = useState<BadgeVariant>('dark')
  const [badge, setBadge] = useState<BadgeImages | null>(null)
  const hero = useRef<HTMLElement>(null)
  const exportUrls = useRef(new Set<string>())
  const stopped = paused || reducedMotion

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const element = hero.current
    if (!element || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (!cancelled) setBadge(makeAsterBadge(appliedName, appliedVariant))
    })
    return () => { cancelled = true }
  }, [appliedName, appliedVariant])

  useEffect(() => () => {
    for (const url of exportUrls.current) URL.revokeObjectURL(url)
    exportUrls.current.clear()
  }, [])

  const apply = () => { setAppliedName(name); setAppliedVariant(variant) }
  const changed = name !== appliedName || variant !== appliedVariant
  const exportBadge = () => {
    if (!badge) return
    // A Blob URL and attached anchor work in WebKit as well as Chromium.
    // Keep the URL alive while the browser starts saving the image.
    const encoded = badge.badgeUrl.split(',')[1]
    const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0))
    const url = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }))
    exportUrls.current.add(url)
    const link = document.createElement('a')
    link.href = url
    link.download = `aster-${appliedName.trim().replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'badge'}.png`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => { URL.revokeObjectURL(url); exportUrls.current.delete(url) }, 30000)
  }

  return <div className="lanyard-landing" id="top" data-motion={stopped ? 'paused' : 'running'}>
    <a className="ll-skip" href="#main">Skip to content</a>
    <header className="ll-header"><nav className="ll-nav ll-shell" aria-label="Primary">
      <Brand />
      <button className="ll-menu-button" type="button" onClick={() => setMenuOpen(value => !value)} aria-expanded={menuOpen} aria-controls="ll-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X /> : <Menu />}</button>
      <div className={`ll-menu${menuOpen ? ' ll-menu-open' : ''}`} id="ll-menu">
        <a href="#the-idea" onClick={() => setMenuOpen(false)}>The idea</a>
        <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
        <a className="ll-button ll-button-small" href={SOURCE} target="_blank" rel="noreferrer">View source <ArrowUpRight size={14} /></a>
      </div>
    </nav></header>
    <main id="main">
      <section className="ll-hero" ref={hero} aria-labelledby="ll-title">
        <Suspense fallback={<div className="lanyard-dither-fallback" />}><DitherBackground paused={stopped || !heroVisible} /></Suspense>
        <div className="ll-hero-grid">
          <div className="ll-hero-copy">
            <p className="ll-eyebrow">ASTER / CRAFTING CONSTELLATIONS</p>
            <Reveal staticMotion={stopped}><h1 id="ll-title">Your next<br />connection.</h1></Reveal>
            <Reveal staticMotion={stopped}><p className="ll-hero-description">Find your people. Build your constellation. Aster helps people in the same room find common ground and start a real conversation.</p></Reveal>
            <Reveal staticMotion={stopped} className="ll-actions"><a className="ll-button" href="#how-it-works">Meet Aster</a><a className="ll-button ll-button-ghost" href="#the-idea">A closer look <ArrowUpRight size={16} /></a></Reveal>
          </div>
          <div className="ll-lanyard-area">
            <div className="ll-lanyard-canvas" aria-label="An interactive Aster badge. Drag the badge to move it.">
              {badge ? <Suspense fallback={<img className="ll-badge-loading" src={badge.badgeUrl} alt="Aster constellation badge" />}><Lanyard3D textureUrl={badge.textureUrl} fallbackUrl={badge.badgeUrl} paused={stopped || !heroVisible} reducedMotion={reducedMotion} /></Suspense> : <div className="ll-badge-loading-text">Preparing your badge</div>}
            </div>
            <div className="ll-badge-controls">
              <div className="ll-badge-controls-top"><label htmlFor="badge-name">Personalize your card</label><fieldset className="ll-variants"><legend className="sr-only">Badge color</legend>
                {(['dark', 'light'] as const).map(value => <label key={value} className={`ll-variant ll-variant-${value}`}><input type="radio" name="badge-variant" value={value} checked={variant === value} onChange={() => setVariant(value)} aria-label={value === 'dark' ? 'Blue badge' : 'Light badge'} /><span /></label>)}
              </fieldset></div>
              <form className="ll-badge-form" onSubmit={event => { event.preventDefault(); apply() }}><div className="ll-name-field"><input id="badge-name" type="text" value={name} onChange={event => setName(event.target.value)} maxLength={20} placeholder="Enter your name" autoComplete="off" /><span aria-hidden="true">{name.length}/20</span></div><button className="ll-button ll-button-small" type="submit" disabled={!changed}>Apply</button><button className="ll-icon-button" type="button" onClick={exportBadge} disabled={!badge} aria-label="Download your badge as PNG" title="Download as PNG"><Download size={17} /></button></form>
              <div className="ll-badge-controls-bottom"><span aria-live="polite">{appliedName ? `Made for ${appliedName}` : 'A little of you, in real life.'}</span><button type="button" className="ll-motion-button" onClick={() => setPaused(value => !value)} disabled={reducedMotion} aria-pressed={stopped}>{stopped ? <Play size={12} /> : <Pause size={12} />}{reducedMotion ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion'}</button></div>
            </div>
          </div>
        </div>
      </section>
      <section className="ll-context-strip"><div className="ll-shell ll-context-inner"><p>MADE FOR<br />REAL LIFE</p><div className="ll-context-window"><div className="ll-context-track">{[0, 1].map(copy => <div className="ll-context-set" key={copy} aria-hidden={copy === 1 || undefined}>{['Hackathons', 'Meetups', 'Campus', 'Conferences'].map(context => <span key={context}>{context}</span>)}</div>)}</div></div></div></section>
      <section className="ll-features ll-content-shell" id="the-idea" aria-labelledby="ll-features-title">
        <Reveal staticMotion={stopped}><h2 id="ll-features-title">A little common ground.<br />A better first hello.</h2></Reveal>
        <Reveal staticMotion={stopped}><div className="ll-feature-card">{[
          { Icon: UserRound, title: 'A profile that’s you', description: 'Type an introduction. Review your interests before saving your card.' },
          { Icon: Radar, title: 'People already nearby', description: 'Meet someone in the room. Tap phones and confirm each other before sharing your full profiles.' },
          { Icon: Sparkles, title: 'Something to talk about', description: 'See the interests you share and a grounded question to start the conversation.' },
        ].map(({ Icon, title, description }) => <article key={title}><div className="ll-card-decorator" aria-hidden="true"><div><Icon size={24} /></div></div><h3>{title}</h3><p>{description}</p></article>)}</div></Reveal>
      </section>
      <section className="ll-agenda ll-content-shell" id="how-it-works" aria-labelledby="ll-steps-title">
        <Reveal staticMotion={stopped} className="ll-agenda-heading"><h2 id="ll-steps-title">How it works</h2><p>One meeting.<br />A new point of connection.</p></Reveal>
        <Reveal staticMotion={stopped} className="ll-agenda-list"><ol>{[
          ['Bring a little of yourself', 'Add the interests, experiences, and goals you want to share. You get the final say on your profile.'],
          ['Make the first move', 'Gently tap phones with someone nearby. Both of you confirm that you met each other.'],
          ['Find your shared thread', 'Aster compares your profiles and reveals common ground, with a conversation starter to help you begin.'],
          ['Keep the connection', 'Save people and your shared interests locally on your phone. Then put the phones down and talk.'],
        ].map(([title, description], index) => <li key={title}><h3><span>0{index + 1}</span>{title}</h3><p>{description}</p></li>)}</ol></Reveal>
      </section>
      <section className="ll-cta ll-content-shell"><div className="ll-cta-panel"><Reveal staticMotion={stopped}><h2>Every constellation<br />starts with a connection.</h2><p>An iOS prototype for people who are already in the room.</p><div className="ll-actions"><a className="ll-button" href="#how-it-works">See how it works</a><a className="ll-button ll-button-outline" href={SOURCE} target="_blank" rel="noreferrer">Explore the code <ArrowUpRight size={16} /></a></div></Reveal></div></section>
    </main>
    <footer className="ll-footer ll-content-shell"><Brand /><nav aria-label="Footer"><a href="#the-idea">The idea</a><a href="#how-it-works">How it works</a><a href={ORIGINAL} target="_blank" rel="noreferrer">Original Bump</a><a href={TEMPLATE} target="_blank" rel="noreferrer">Website template</a></nav><p>Built on <a href={ORIGINAL} target="_blank" rel="noreferrer">Bump</a>. UI adapted from <a href={TEMPLATE} target="_blank" rel="noreferrer">Lanyardly</a> with Tailark &amp; React Bits.</p></footer>
  </div>
}
