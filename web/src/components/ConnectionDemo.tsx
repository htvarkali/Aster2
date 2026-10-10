import { useState } from 'react'
import './ConnectionDemo.css'

type Person = { name: string; interests: string[] }
type ConnectionExample = {
  people: [Person, Person]
  shared: string
  opener: string
}

const EXAMPLES: ConnectionExample[] = [
  {
    people: [
      { name: 'Maya', interests: ['Film photography', 'Hiking', 'Synths'] },
      { name: 'Dev', interests: ['Film photography', 'Climbing', 'Cooking'] },
    ],
    shared: 'Film photography',
    opener: 'What’s your favorite thing to shoot on film?',
  },
  {
    people: [
      { name: 'Priya', interests: ['Night hiking', 'Typography', 'Birding'] },
      { name: 'Theo', interests: ['Night hiking', 'Chess', 'Baking'] },
    ],
    shared: 'Night hiking',
    opener: 'Have you found a good trail for seeing the stars?',
  },
  {
    people: [
      { name: 'Sam', interests: ['Jazz', 'Board games', 'Cooking'] },
      { name: 'Rosa', interests: ['Jazz', 'Photography', 'Astronomy'] },
    ],
    shared: 'Jazz',
    opener: 'Which jazz record do you always come back to?',
  },
]

// Only render an overlap when both fictional profiles explicitly contain it.
const VALID_EXAMPLES = EXAMPLES.filter((example) =>
  example.people.every((person) => person.interests.includes(example.shared)),
)

function ConnectionStar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" aria-hidden="true">
      <path d="M14 1.5 16.7 11.3 26.5 14 16.7 16.7 14 26.5 11.3 16.7 1.5 14 11.3 11.3Z" fill="currentColor" />
    </svg>
  )
}

export default function ConnectionDemo() {
  const [selected, setSelected] = useState(0)
  const example = VALID_EXAMPLES[selected]

  return (
    <section className="connection-demo" id="the-overlap" aria-labelledby="connection-demo-title">
      <div className="aster-shell connection-demo__layout">
        <div className="connection-demo__intro">
          <p className="connection-demo__eyebrow">The common ground</p>
          <h2 className="connection-demo__title" id="connection-demo-title">
            There’s already<br />a <em>thread.</em>
          </h2>
          <p className="connection-demo__description">
            After you both confirm, Aster finds what’s in both profiles and gives
            you a question to start with.
          </p>

          <div className="connection-demo__switches" role="group" aria-label="Choose a fictional connection">
            {VALID_EXAMPLES.map((item, index) => (
              <button
                key={item.shared}
                type="button"
                className="connection-demo__switch"
                aria-pressed={selected === index}
                aria-controls="connection-demo-preview"
                onClick={() => setSelected(index)}
              >
                <span className="connection-demo__switch-number" aria-hidden="true">0{index + 1}</span>
                <span>{item.people[0].name} <span className="connection-demo__switch-and">&amp;</span> {item.people[1].name}</span>
                <span className="connection-demo__switch-arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
          <p className="connection-demo__note">Fictional people. A real way to break the ice.</p>
        </div>

        <div className="connection-demo__preview" id="connection-demo-preview" aria-live="polite" aria-atomic="true">
          <div className="connection-demo__preview-heading">
            <span>Illustrative connection</span>
            <span className="connection-demo__page-number">0{selected + 1} / 03</span>
          </div>

          <div key={example.shared} className="connection-demo__study">
            <div className="connection-demo__people">
              {example.people.map((person, index) => (
                <article className="connection-demo__person" key={person.name}>
                  <div className="connection-demo__person-heading">
                    <span className={`connection-demo__avatar connection-demo__avatar--${index}`} aria-hidden="true">{person.name[0]}</span>
                    <h3>{person.name}</h3>
                  </div>
                  <ul className="connection-demo__interests" aria-label={`${person.name}’s interests`}>
                    {person.interests.map((interest) => (
                      <li key={interest} className={interest === example.shared ? 'connection-demo__interest connection-demo__interest--shared' : 'connection-demo__interest'}>
                        <span className="connection-demo__interest-dot" aria-hidden="true" />
                        {interest}
                        {interest === example.shared && <span className="sr-only">, shared interest</span>}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <div className="connection-demo__join" aria-hidden="true">
              <svg viewBox="0 0 500 75" preserveAspectRatio="none">
                <path className="connection-demo__join-line" d="M120 0V20Q120 35 135 35H235M380 0V20Q380 35 365 35H265M250 48V75" />
                <circle cx="120" cy="2" r="2.5" />
                <circle cx="380" cy="2" r="2.5" />
              </svg>
              <ConnectionStar className="connection-demo__join-star" />
            </div>

            <div className="connection-demo__result">
              <p className="connection-demo__result-label">The shared thread</p>
              <p className="connection-demo__shared">{example.shared}</p>
              <div className="connection-demo__opener">
                <ConnectionStar className="connection-demo__opener-star" />
                <div>
                  <p className="connection-demo__opener-label">Start here</p>
                  <blockquote>“{example.opener}”</blockquote>
                </div>
              </div>
            </div>
          </div>

          <p className="connection-demo__preview-note">Shown in both profiles. No guessing required.</p>
        </div>
      </div>
    </section>
  )
}
