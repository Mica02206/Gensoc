import { useCallback, useEffect, useRef, useState } from 'react'
import { BookOpen, Volume2, VolumeX, Maximize2, Minimize2, Flower2, Sparkles, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, X, Check } from 'lucide-react'
import { modules } from './data/modulesData'
import GameCanvas from './components/GameCanvas'
import DialogueBox from './components/DialogueBox'
import FieldJournal from './components/FieldJournal'

function Minimap({ position, completed }) {
  const places=[[19,36],[49,45],[78,36],[23,52],[52,52],[80,52]]
  return <div className="minimap" aria-label="Village minimap"><div className="mini-path horizontal"/><div className="mini-path vertical"/>{places.map(([x,y],i)=><span key={i} className={`mini-npc ${completed.includes(i)?'done':''}`} style={{left:`${x}%`,top:`${y}%`}}>{completed.includes(i)?'✓':''}</span>)}<span className="mini-player" style={{left:`${position.x*100}%`,top:`${position.y*100}%`}}/></div>
}

function Summary({ completed, saved, onClose, onJournal }) {
  const notes=new Set(saved.map(s=>s.split(':')[0])).size
  return <div className="modal-scrim celebration-scrim"><section className="summary-modal" role="dialog" aria-modal="true" aria-label="Course integration complete">
    <div className="celebration-art"><div className="sunburst">✦</div><div className="little-houses"><span>⌂</span><span>⌂</span><span>⌂</span></div><div className="celebration-flower">✿</div></div>
    <div className="chapter-kicker">A VILLAGE FULL OF WISDOM</div><h2>Course Integration<br/><em>Complete</em></h2><p className="summary-copy">You listened, learned, and made space for every voice. Carry these ideas with you as you leave the grove.</p>
    <div className="summary-stats"><div><strong>06<span>/06</span></strong><small>MODULES CLEARED</small></div><div><strong>{notes}<span>/06</span></strong><small>JOURNAL CHAPTERS</small></div><div><strong>100<span>%</span></strong><small>COURSE SCORE</small></div></div>
    <div className="summary-actions"><button className="primary-button" onClick={onClose}>Wander the village <span>→</span></button><button className="small-secondary" onClick={onJournal}><BookOpen size={15}/> Read my field journal</button></div><div className="summary-signoff">MADE WITH CARE IN GOODFOLK GROVE <span>✦</span></div>
  </section></div>
}

function Dpad({ setDpad }) {
  const bind=direction=>({onPointerDown:e=>{e.preventDefault();setDpad(direction,true)},onPointerUp:e=>{e.preventDefault();setDpad(direction,false)},onPointerLeave:()=>setDpad(direction,false),onPointerCancel:()=>setDpad(direction,false)})
  return <div className="dpad" aria-label="Touch movement controls"><button className="pad-up" {...bind('up')} aria-label="Move up"><ArrowUp/></button><button className="pad-left" {...bind('left')} aria-label="Move left"><ArrowLeft/></button><button className="pad-right" {...bind('right')} aria-label="Move right"><ArrowRight/></button><button className="pad-down" {...bind('down')} aria-label="Move down"><ArrowDown/></button><span className="pad-center"/></div>
}

export default function App() {
  const [active,setActive]=useState(null),[journal,setJournal]=useState(false),[completed,setCompleted]=useState([]),[saved,setSaved]=useState([]),[muted,setMuted]=useState(true),[position,setPosition]=useState({x:.5,y:.55}),[near,setNear]=useState(null),[summary,setSummary]=useState(false),[isFullscreen,setIsFullscreen]=useState(false)
  const dpad=useRef({}), audio=useRef(null), mutedRef=useRef(muted), celebrated=useRef(false)
  mutedRef.current=muted
  const sound=useCallback(type=>{
    if(mutedRef.current)return
    try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;audio.current??=new Ctx();const ctx=audio.current,osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='square';osc.frequency.value=type==='complete'?880:type==='step'?125:660;gain.gain.setValueAtTime(.035,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.045);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.05)}catch{}
  },[])
  const nearby = useCallback(id=>setNear(id),[])
  const positionUpdate=useCallback(p=>setPosition(p),[])
  const interact=useCallback(id=>{setActive(id);sound('blip')},[sound])
  const save=(id,kind)=>setSaved(current=>current.includes(`${id}:${kind}`)?current:[...current,`${id}:${kind}`])
  const complete=id=>setCompleted(current=>current.includes(id)?current:[...current,id])
  useEffect(()=>{if(completed.length===6&&!celebrated.current){celebrated.current=true;sound('complete');setSummary(true)}},[completed,sound])
  useEffect(()=>{const update=()=>setIsFullscreen(Boolean(document.fullscreenElement));document.addEventListener('fullscreenchange',update);return()=>document.removeEventListener('fullscreenchange',update)},[])
  const toggleFullscreen=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen?.()}catch{}}
  const setDirection=(direction,value)=>{dpad.current={...dpad.current,[direction]:value}}
  const activeNpc=active===null?null:modules[active]
  const progress=completed.length
  const activeHint=near===null?null:modules[near]
  return (
    <main className="app-shell">
    <section className="game-area">
      <div className="world-frame"><GameCanvas completed={completed} onNearby={nearby} onInteract={interact} onPosition={positionUpdate} dpad={dpad} sound={sound} paused={activeNpc!==null}/>
        <div className="world-top-left"><Minimap position={position} completed={completed}/><div className="quest-card"><div className="quest-icon"><Sparkles size={15}/></div><div className="quest-copy"><b>Village visits</b><span>Meet your six guides</span><div className="quest-progress"><i style={{width:`${progress/6*100}%`}}/></div><small>{String(progress).padStart(2,'0')} <span>/</span> 06 MODULES COMPLETED</small></div></div></div>
        <div className="game-toolbar"><button className="audio-button" onClick={()=>setMuted(!muted)} aria-label={muted?'Turn sound on':'Mute sound'} title={muted?'Turn sound on':'Mute sound'}>{muted?<VolumeX size={15}/>:<Volume2 size={15}/>}<span>{muted?'SOUND OFF':'SOUND ON'}</span></button><button className="journal-button" onClick={()=>setJournal(true)} aria-label="Open field journal" title="Field journal"><BookOpen size={16}/><span>Field journal</span><b>{new Set(saved.map(s=>s.split(':')[0])).size}</b></button><button className="audio-button fullscreen-button" onClick={toggleFullscreen} aria-label={isFullscreen?'Exit fullscreen':'Enter fullscreen'} title={isFullscreen?'Exit fullscreen':'Enter fullscreen'}>{isFullscreen?<Minimize2 size={16}/>:<Maximize2 size={16}/>}</button></div>
        <div className="controls-hint"><kbd>WASD</kbd> / <kbd>↑ ↓ ← →</kbd> MOVE <span>·</span> <kbd>E</kbd> CHAT</div>
        {activeNpc&&<DialogueBox npc={activeNpc} completed={completed} saved={saved} onSave={save} onComplete={complete} onClose={()=>setActive(null)} sound={sound}/>}
        {activeHint&&!activeNpc&&<button className="interact-prompt" onClick={()=>interact(near)}><kbd>E</kbd><span>CHAT WITH {activeHint.name.toUpperCase()}</span><b>↗</b></button>}
        {!activeNpc&&<Dpad setDpad={setDirection}/>}
      </div>
    </section>
    {journal&&<FieldJournal saved={saved} completed={completed} onClose={()=>setJournal(false)}/>}
    {summary&&<Summary completed={completed} saved={saved} onClose={()=>{setSummary(false);setActive(null)}} onJournal={()=>{setSummary(false);setActive(null);setJournal(true)}}/>}
    </main>
  )
}
