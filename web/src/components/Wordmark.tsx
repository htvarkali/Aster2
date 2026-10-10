import wordmark from '../assets/aster-wordmark.svg'

/** Shared vector wordmark for the Aster working brand. */
export default function Wordmark({ className, label }: { className?: string; label?: string }) {
  return (
    <span className={className}>
      <img src={wordmark} alt="" aria-hidden="true" />
      <span className="sr-only">{label ?? 'Aster'}</span>
    </span>
  )
}
