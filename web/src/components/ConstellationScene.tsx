import type { CSSProperties } from 'react'
import './ConstellationScene.css'

type ConstellationSceneProps = {
  paused?: boolean
}

type StarProps = {
  x: number
  y: number
  size?: number
  tone?: 'paper' | 'ember' | 'sage'
  delay?: number
}

function Star({ x, y, size = 8, tone = 'paper', delay = 0 }: StarProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        className={`constellation__star constellation__star--${tone}`}
        d={`M 0 ${-size} L ${size * 0.25} ${-size * 0.25} L ${size} 0 L ${size * 0.25} ${size * 0.25} L 0 ${size} L ${-size * 0.25} ${size * 0.25} L ${-size} 0 L ${-size * 0.25} ${-size * 0.25} Z`}
        style={{ animationDelay: `${delay}s` }}
      />
    </g>
  )
}

const NODES = [
  { x: 78, y: 170, size: 8, tone: 'sage', delay: -1 },
  { x: 142, y: 84, size: 5, tone: 'paper', delay: -3 },
  { x: 258, y: 140, size: 11, tone: 'paper', delay: -4 },
  { x: 357, y: 73, size: 5, tone: 'sage', delay: -2 },
  { x: 493, y: 140, size: 7, tone: 'ember', delay: -5 },
  { x: 526, y: 246, size: 5, tone: 'paper', delay: -3 },
  { x: 421, y: 237, size: 9, tone: 'sage', delay: -6 },
  { x: 338, y: 207, size: 4, tone: 'paper', delay: -1 },
  { x: 196, y: 221, size: 5, tone: 'ember', delay: -2 },
] satisfies StarProps[]

const EDGES = [
  [78, 170, 142, 84], [142, 84, 258, 140], [258, 140, 357, 73],
  [357, 73, 493, 140], [493, 140, 526, 246], [526, 246, 421, 237],
  [421, 237, 338, 207], [338, 207, 258, 140], [258, 140, 196, 221],
  [196, 221, 78, 170], [78, 170, 258, 140], [258, 140, 493, 140],
  [142, 84, 196, 221], [357, 73, 338, 207], [338, 207, 493, 140],
]

function Phone({ person, initial, variant }: {
  person: string
  initial: string
  variant: 'sage' | 'ember'
}) {
  return (
    <div className={`constellation__phone constellation__phone--${variant}`}>
      <div className="constellation__screen">
        <div className="constellation__status" aria-hidden="true">
          <span>9:41</span><span className="constellation__island" />
          <span className="constellation__signal">▮▮▮</span>
        </div>
        <div className="constellation__app-top">
          <span className="constellation__app-name">aster<span>✳</span></span>
          <span className="constellation__app-menu" aria-hidden="true">···</span>
        </div>
        <div className="constellation__profile">
          <div className="constellation__avatar" aria-hidden="true">
            <span>{initial}</span>
            <svg viewBox="0 0 90 90" fill="none">
              <circle cx="45" cy="45" r="34" />
              <path d="M11 45H79M45 11V79M21 21L69 69M21 69L69 21" />
            </svg>
          </div>
          <span className="constellation__small-label">Your next conversation</span>
          <h3>{person}</h3>
        </div>
        <div className="constellation__shared">
          <span className="constellation__small-label">A point in common</span>
          <div className="constellation__shared-name"><span aria-hidden="true">✳</span> Stargazing</div>
          <p>“Your favorite place<br />to see the stars?”</p>
        </div>
        <div className="constellation__home-bar" aria-hidden="true" />
      </div>
    </div>
  )
}

export default function ConstellationScene({ paused = false }: ConstellationSceneProps) {
  return (
    <figure
      className={`constellation${paused ? ' constellation--paused' : ''}`}
      aria-label="Illustrative example: two phones connect through a moving constellation. Fictional people Maya and Jules find stargazing in common."
    >
      <div className="constellation__scene">
        <div className="constellation__atlas-label" aria-hidden="true">
          <span className="constellation__live-dot" />
          <span>A small world, after all</span>
        </div>
        <span className="constellation__coordinate constellation__coordinate--top" aria-hidden="true">01.02 / A CHANCE ENCOUNTER</span>
        <svg className="constellation__graph" viewBox="0 0 600 600" aria-hidden="true">
          <g className="constellation__guides">
            <circle cx="300" cy="274" r="226" />
            <circle cx="300" cy="274" r="156" />
            <path d="M300 27V521M53 274H547" />
            <path d="M290 27H310M290 521H310M53 264V284M547 264V284" />
          </g>
          <g className="constellation__dust">
            <circle cx="53" cy="94" r="1.4" /><circle cx="227" cy="59" r="1.5" />
            <circle cx="432" cy="64" r="1" /><circle cx="552" cy="181" r="1.6" />
            <circle cx="103" cy="290" r="1.3" /><circle cx="473" cy="302" r="1.4" />
            <circle cx="298" cy="99" r="1" /><circle cx="395" cy="175" r="1.2" />
            <circle cx="127" cy="132" r="1" /><circle cx="557" cy="359" r="1" />
          </g>
          <g className="constellation__network">
            <g className="constellation__edges">
              {EDGES.map(([x1, y1, x2, y2], index) => (
                <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} />
              ))}
            </g>
            <g className="constellation__traces">
              <path d="M78 170L258 140L338 207L421 237L526 246" />
              <path d="M142 84L258 140L357 73L493 140" />
            </g>
            {NODES.map((node, index) => <Star key={index} {...node} />)}
          </g>
          <g className="constellation__meeting">
            <path className="constellation__connection" d="M258 140C295 173 300 246 300 317M300 317C278 316 252 328 232 361M300 317C329 318 354 336 369 365" />
            <circle className="constellation__meeting-ring" cx="300" cy="317" r="26" />
            <circle className="constellation__meeting-ring constellation__meeting-ring--outer" cx="300" cy="317" r="40" />
            <Star x={300} y={317} size={19} tone="ember" delay={-3} />
          </g>
          <g className="constellation__graph-labels">
            <text x="66" y="204">THE STRANGER</text>
            <text x="444" y="110">THE POSSIBILITY</text>
          </g>
        </svg>
        <div className="constellation__phones" style={{ '--phone-delay': '-2s' } as CSSProperties}>
          <Phone person="Jules" initial="J" variant="sage" />
          <Phone person="Maya" initial="M" variant="ember" />
        </div>
        <div className="constellation__connection-note" aria-hidden="true">
          <span>From strangers</span>
          <span className="constellation__note-line" />
          <span>to a constellation.</span>
        </div>
      </div>
      <figcaption className="constellation__caption">
        <span>Illustrative example · fictional profiles</span>
        <span>02 people <span aria-hidden="true">/</span> 01 connection</span>
      </figcaption>
    </figure>
  )
}
