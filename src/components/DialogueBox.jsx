import { useEffect, useState } from 'react'

function Portrait({ npc }) {
  const col=npc.id%3,row=Math.floor(npc.id/3)
  return <div className="portrait-art" role="img" aria-label={`${npc.name} portrait`} style={{backgroundImage:"url('/assets/npc-portraits.png')",backgroundPosition:`${col*50}% ${row*100}%`}} />
}

function splitDialogue(text) {
  if (!text) return []
  const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(undefined,{granularity:'sentence'}) : null
  return text.split(/\n\s*\n/).flatMap(paragraph=>{
    const parts=segmenter?Array.from(segmenter.segment(paragraph),part=>part.segment.trim()):(paragraph.match(/[^.!?]+(?:[.!?]+|$)/g)||[paragraph]).map(part=>part.trim())
    return parts.filter(Boolean)
  })
}

export default function DialogueBox({ npc, completed, onSave, onComplete, onClose, sound }) {
  const [mode,setMode]=useState('facts'),[typed,setTyped]=useState(''),[lineIndex,setLineIndex]=useState(0)
  const text=mode==='facts'?npc.facts:mode==='context'?npc.context:mode==='retry'?"Not quite. Let’s try that once more.":mode==='result'?"That’s it. Thank you for learning with me.":''
  const lines=mode==='facts'||mode==='context'?splitDialogue(text):text?[text]:[]
  const currentLine=lines[lineIndex]||''

  useEffect(()=>{setMode('facts');setLineIndex(0);setTyped('');onSave(npc.id,'facts')},[npc.id])
  useEffect(()=>{
    setTyped('');if(!currentLine)return
    let index=0,ticks=0
    const timer=setInterval(()=>{index=Math.min(index+2,currentLine.length);setTyped(currentLine.slice(0,index));ticks++;if(index>=currentLine.length)clearInterval(timer);else if(ticks%6===0)sound('blip')},18)
    return()=>clearInterval(timer)
  },[currentLine,lineIndex,sound])
  useEffect(()=>{
    const onKey=e=>{if(e.key==='Escape')onClose()}
    window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)
  },[onClose])

  const advance=()=>{
    if(typed.length<currentLine.length){setTyped(currentLine);return}
    if(lineIndex<lines.length-1){setLineIndex(i=>i+1);return}
    if(mode==='facts'){onSave(npc.id,'context');setMode('context');setLineIndex(0)}
    else if(mode==='context')setMode('quiz')
    else if(mode==='retry')setMode('quiz')
    else if(mode==='result')onClose()
  }
  const answerQuiz=index=>{
    if(index===npc.quiz.answer){onComplete(npc.id);setLineIndex(0);setMode('result')}
    else{setLineIndex(0);setMode('retry')}
  }
  const handlePanelClick=e=>{
    if(e.target.closest('button'))return
    if(['facts','context','retry','result'].includes(mode))advance()
  }

  return <div className="dialogue-wrap" role="dialog" aria-modal="true" aria-label={`Conversation with ${npc.name}`}>
    <div className="dialogue-portrait"><Portrait npc={npc}/></div>
    <section className={`dialogue-card speech-panel speech-${mode}`} onClick={handlePanelClick}>
      {['facts','context','retry','result'].includes(mode)&&<>
        <div className="speech-line" aria-live="polite">{typed}{typed.length<currentLine.length&&<span className="typing-cursor">▌</span>}</div>
        <span className="speech-next" aria-hidden="true">▼</span>
      </>}
      {mode==='quiz'&&<>
        <div className="speech-question">{npc.quiz.question}</div>
        <div className="speech-answers">{npc.quiz.options.map((option,i)=><button key={option} onClick={()=>answerQuiz(i)}><span>{String.fromCharCode(65+i)}.</span>{option}</button>)}</div>
      </>}
    </section>
  </div>
}
