import { useEffect, useState } from 'react'

function Portrait({ npc }) {
  const col=npc.id%3,row=Math.floor(npc.id/3)
  return <div className="portrait-art" role="img" aria-label={`${npc.name} portrait`} style={{backgroundImage:"url('/assets/npc-portraits.png')",backgroundPosition:`${col*50}% ${row*100}%`}} />
}

function splitDialogue(text) {
  if (!text) return []
  const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(undefined, { granularity: 'sentence' }) : null
  return text.split(/\n\s*\n/).flatMap(paragraph => {
    const parts = segmenter
      ? Array.from(segmenter.segment(paragraph), part => part.segment.trim())
      : (paragraph.match(/[^.!?]+(?:[.!?]+|$)/g) || [paragraph]).map(part => part.trim())
    return parts.filter(Boolean)
  })
}

export default function DialogueBox({ npc, completed, saved, onSave, onComplete, onClose, sound }) {
  const [mode,setMode]=useState('menu'), [answer,setAnswer]=useState(null), [typed,setTyped]=useState(''), [lineIndex,setLineIndex]=useState(0)
  const text = mode==='facts' ? npc.facts : mode==='context' ? npc.context : mode==='result' ? npc.quiz.explain : ''
  const lines = (mode==='facts'||mode==='context') ? splitDialogue(text) : text ? [text] : []
  const currentLine = lines[lineIndex] || ''
  useEffect(()=>{setAnswer(null);setMode('menu');setLineIndex(0);setTyped('')},[npc.id])
  useEffect(()=>{
    setTyped(''); if (!currentLine) return
    let index=0, ticks=0; const interval=setInterval(()=>{index=Math.min(index+2,currentLine.length);setTyped(currentLine.slice(0,index));ticks++;if(index>=currentLine.length)clearInterval(interval);else if(ticks%6===0)sound('blip')},18)
    return()=>clearInterval(interval)
  },[currentLine,lineIndex,sound])
  const choose = next => { setMode(next);setLineIndex(0);setTyped('');setAnswer(null); if(next==='facts'||next==='context') onSave(npc.id,next) }
  const advanceLine = () => {
    if (typed.length < currentLine.length) { setTyped(currentLine); return }
    if (lineIndex < lines.length-1) setLineIndex(index=>index+1)
    else setMode('read-done')
  }
  const handlePanelClick = event => {
    if ((mode==='facts'||mode==='context') && !event.target.closest('button')) advanceLine()
  }
  const answerQuiz = index => { setAnswer(index);if(index===npc.quiz.answer){onComplete(npc.id);setLineIndex(0);setMode('result')} else setMode('retry') }
  return <div className="dialogue-wrap" role="dialog" aria-modal="true" aria-label={`Conversation with ${npc.name}`}>
    <div className="dialogue-portrait"><Portrait npc={npc}/><div className="portrait-caption">{npc.name}</div></div>
    <section className={`dialogue-card ${mode==='facts'||mode==='context'?'reading-mode':''}`} onClick={handlePanelClick}>
      <header className="dialogue-header"><span><i className="status-dot" />{npc.role}</span><button className="icon-close" onClick={onClose} aria-label="Close conversation">×</button></header>
      {mode==='menu' && <>
        <h2>What would you like to ask?</h2><p className="dialogue-sub">Choose a topic to explore with {npc.name.split(' ')[0]}.</p>
        <div className="dialogue-options">
          <button onClick={()=>choose('facts')}><span>✦</span><b>Important facts</b><small>{saved.includes(`${npc.id}:facts`)?'Read in your journal':'Learn the module basics'}</small><em>↗</em></button>
          <button onClick={()=>choose('context')}><span>◈</span><b>Real-world context</b><small>How this connects beyond the grove</small><em>↗</em></button>
          <button onClick={()=>choose('quiz')}><span>✎</span><b>Knowledge check</b><small>{completed.includes(npc.id)?'Passed · retake anytime':'One question, no pressure'}</small><em>↗</em></button>
        </div>
      </>}
      {(mode==='facts'||mode==='context')&&<>
        <div className="chapter-kicker">MODULE {npc.chapter} · {npc.title.toUpperCase()}</div><h2>{mode==='facts'?'A little knowledge':'Out in the world'}</h2>
        <div className="story-text" aria-live="polite">{typed}{typed.length<currentLine.length&&<span className="typing-cursor">▌</span>}</div>
        <div className="dialogue-footer"><span className="saved-tag">✦ JOURNAL · {String(lineIndex+1).padStart(2,'0')} / {String(lines.length).padStart(2,'0')}</span><button className="small-secondary next-line-button" onClick={advanceLine}>{typed.length<currentLine.length?'Show text':'Next'} <span>→</span></button></div>
        <div className="click-hint">CLICK THE DIALOGUE TO CONTINUE <span>▼</span></div>
      </>}
      {mode==='read-done'&&<>
        <div className="chapter-kicker">MODULE {npc.chapter} · NOTES SAVED</div><h2>You’ve heard the main idea.</h2><p className="feedback-text">The things {npc.name.split(' ')[0]} shared are saved in your Field Journal. Ready for a quick knowledge check?</p>
        <div className="result-actions"><button className="primary-button" onClick={()=>choose('quiz')}>Take the quiz <span>→</span></button><button className="small-secondary" onClick={()=>setMode('menu')}>More topics</button></div>
      </>}
      {mode==='quiz'&&<>
        <div className="chapter-kicker">MODULE {npc.chapter} · KNOWLEDGE CHECK</div><h2>{npc.quiz.question}</h2>
        <div className="quiz-options">{npc.quiz.options.map((option,i)=><button key={option} onClick={()=>answerQuiz(i)}><span className="option-key">{String.fromCharCode(65+i)}</span>{option}<span className="option-arrow">↗</span></button>)}</div>
        <div className="dialogue-footer"><span className="quiet-note">Take your time. You can try again.</span><button className="link-button" onClick={()=>setMode('menu')}>Back to topics</button></div>
      </>}
      {mode==='retry'&&<>
        <div className="chapter-kicker">A MOMENT TO REFLECT</div><h2>Not quite—and that’s okay.</h2><p className="feedback-text">Review the module notes, then give the question another try.</p>
        <div className="result-actions"><button className="primary-button" onClick={()=>setMode('quiz')}>Try again <span>→</span></button><button className="small-secondary" onClick={()=>choose('facts')}>Review the facts</button></div>
      </>}
      {mode==='result'&&<>
        <div className="chapter-kicker">{completed.includes(npc.id)?'MODULE COMPLETE':'WELL DONE'}</div><h2>{completed.includes(npc.id)?'A new chapter, learned.':'You got it!'}</h2><p className="feedback-text">{npc.quiz.explain}</p>
        <div className="result-actions"><button className="primary-button" onClick={onClose}>{completed.includes(npc.id)?'Back to the village':'Close'} <span>→</span></button><button className="link-button" onClick={()=>setMode('menu')}>Explore more</button></div>
      </>}
    </section>
  </div>
}
