import { useEffect, useState } from 'react'

const lines = [
  "Hi there! I'm Renli. Welcome to Goodfolk Grove.",
  "This village is a little learning journey about gender, identity, and respect.",
  "Meet the six guides, hear their stories, and explore each topic at your own pace.",
  "Whenever you're ready, let's begin."
]

export default function IntroDialogue({ onFinish, sound }) {
  const [lineIndex, setLineIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const line = lines[lineIndex]

  useEffect(() => {
    setTyped('')
    let count = 0
    const timer = setInterval(() => {
      count = Math.min(count + 2, line.length)
      setTyped(line.slice(0, count))
      if (count >= line.length) clearInterval(timer)
      else if (count % 12 === 0) sound('blip')
    }, 24)
    return () => clearInterval(timer)
  }, [line, sound])

  const advance = () => {
    if (typed.length < line.length) { setTyped(line); return }
    if (lineIndex < lines.length - 1) { setLineIndex(index => index + 1); return }
    onFinish()
  }

  return <div className="dialogue-wrap intro-wrap" role="dialog" aria-modal="true" aria-label="Renli's introduction">
    <div className="intro-portrait" role="img" aria-label="Renli, the village explorer" />
    <section className="dialogue-card speech-panel intro-panel" onClick={advance}>
      <div className="speech-line" aria-live="polite">{typed}{typed.length < line.length && <span className="typing-cursor">▌</span>}</div>
      <span className="speech-next" aria-hidden="true">▼</span>
    </section>
  </div>
}
