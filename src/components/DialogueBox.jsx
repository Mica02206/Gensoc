import { useEffect, useRef, useState } from 'react'

function Portrait({ npc }) {
  const ref = useRef(null)
  useEffect(() => {
    const c=ref.current,ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,144,162)
    // warm paper backdrop and soft pixel frame
    ctx.fillStyle='#e8c99b';ctx.fillRect(0,0,144,162);ctx.fillStyle='#d9b581';ctx.fillRect(0,0,144,7);ctx.fillRect(0,155,144,7)
    ctx.fillStyle='#bed0a4';ctx.fillRect(9,11,126,119);ctx.fillStyle='#d6dfbc';ctx.fillRect(17,20,110,103)
    ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(21,25,4,70)
    // shoulders, collar and face
    ctx.fillStyle=npc.outfit;ctx.fillRect(18,119,108,34);ctx.fillRect(10,136,124,17)
    ctx.fillStyle=npc.accent;ctx.fillRect(54,119,36,17);ctx.fillRect(67,131,10,22)
    ctx.fillStyle=npc.skin;ctx.fillRect(49,45,47,70);ctx.fillRect(44,63,5,19);ctx.fillRect(96,63,5,19)
    ctx.fillStyle=npc.hair;ctx.fillRect(43,32,60,23);ctx.fillRect(39,44,12,50);ctx.fillRect(96,43,11,40);ctx.fillRect(48,26,45,11)
    ctx.fillStyle=npc.skin;ctx.fillRect(47,42,5,10);ctx.fillRect(51,39,45,18)
    ctx.fillStyle='#453836';ctx.fillRect(58,68,5,4);ctx.fillRect(82,68,5,4);ctx.fillRect(68,90,12,3)
    ctx.fillStyle='#edc59c';ctx.fillRect(52,77,10,4);ctx.fillRect(84,77,10,4)
    ctx.fillStyle='#fff1d5';ctx.fillRect(7,7,130,4);ctx.fillRect(7,151,130,4)
  },[npc])
  return <canvas ref={ref} width="144" height="162" className="portrait" aria-label={`${npc.name} portrait`} />
}

export default function DialogueBox({ npc, completed, saved, onSave, onComplete, onClose, sound }) {
  const [mode,setMode]=useState('menu'), [shown,setShown]=useState(false), [answer,setAnswer]=useState(null), [typed,setTyped]=useState('')
  const text = mode==='facts' ? npc.facts : mode==='context' ? npc.context : mode==='result' ? npc.quiz.explain : ''
  useEffect(()=>{setShown(false);setAnswer(null);setMode('menu')},[npc.id])
  useEffect(()=>{
    setTyped(''); if (!text) return
    let index=0, ticks=0; const interval=setInterval(()=>{index=Math.min(index+2,text.length);setTyped(text.slice(0,index));ticks++;if(index>=text.length)clearInterval(interval);else if(ticks%6===0)sound('blip')},18)
    return()=>clearInterval(interval)
  },[text,sound])
  const choose = next => { setMode(next);setShown(false);setAnswer(null); if(next==='facts'||next==='context') onSave(npc.id,next) }
  const answerQuiz = index => { setAnswer(index);if(index===npc.quiz.answer){onComplete(npc.id);setMode('result')} else setMode('retry') }
  return <div className="dialogue-wrap" role="dialog" aria-modal="true" aria-label={`Conversation with ${npc.name}`}>
    <div className="dialogue-portrait"><Portrait npc={npc}/><div className="portrait-caption">{npc.name}</div></div>
    <section className="dialogue-card">
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
        <div className="story-text">{typed}{typed.length<text.length&&<span className="typing-cursor">▌</span>}</div>
        <div className="dialogue-footer"><span className="saved-tag">✦ Added to your journal</span><button className="small-secondary" onClick={()=>setShown(true)}>Continue <span>→</span></button></div>
        {shown&&<div className="after-reading"><span>Want to try a quick knowledge check?</span><button className="primary-button" onClick={()=>choose('quiz')}>Take the quiz <span>→</span></button><button className="link-button" onClick={()=>setMode('menu')}>Choose another topic</button></div>}
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
