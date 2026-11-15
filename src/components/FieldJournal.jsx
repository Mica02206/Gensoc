import { useState } from 'react'
import { X, BookOpen, Leaf, Check } from 'lucide-react'
import { modules } from '../data/modulesData'

export default function FieldJournal({ saved, completed, onClose }) {
  const [selected,setSelected]=useState(0)
  const npc=modules[selected]
  const hasFacts=saved.includes(`${npc.id}:facts`), hasContext=saved.includes(`${npc.id}:context`)
  return <div className="modal-scrim" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <section className="journal-modal" role="dialog" aria-modal="true" aria-label="Field journal">
      <header className="journal-heading"><div className="journal-icon"><BookOpen size={18}/></div><div><div className="chapter-kicker">YOUR POCKET COMPANION</div><h2>Field Journal</h2><p>Little things worth remembering.</p></div><button className="icon-close" onClick={onClose} aria-label="Close journal"><X size={18}/></button></header>
      <div className="journal-body"><nav className="journal-nav" aria-label="Journal modules">
        {modules.map((m,i)=><button key={m.id} className={selected===i?'active':''} onClick={()=>setSelected(i)}><span className="journal-nav-index">{m.chapter}</span><span className="journal-nav-label"><b>{m.title}</b><small>{m.name}</small></span>{completed.includes(m.id)&&<Check size={15} className="journal-check"/>}</button>)}
      </nav><article className="journal-content"><div className="journal-content-top"><span className="chapter-kicker">CHAPTER {npc.chapter} · {npc.zone.toUpperCase()}</span>{completed.includes(npc.id)&&<span className="passed-pill"><Check size={12}/> CHECK PASSED</span>}</div><h3>{npc.title}</h3><div className="journal-section"><h4><Leaf size={14}/> Important facts {hasFacts&&<span>COLLECTED</span>}</h4>{hasFacts?<p>{npc.facts}</p>:<div className="empty-note">Talk with {npc.name} and ask about important facts to add this page to your journal.</div>}</div><div className="journal-section"><h4><span className="context-symbol">◈</span> Real-world context {hasContext&&<span>COLLECTED</span>}</h4>{hasContext?<p>{npc.context}</p>:<div className="empty-note">This note is waiting for a conversation with {npc.name}.</div>}</div><div className="journal-page-number">GOODFOLK GROVE <span>✦</span> {npc.chapter} / 06</div></article></div>
      <footer className="journal-footer"><span>{saved.length?`${new Set(saved.map(s=>s.split(':')[0])).size} of 6 chapters explored`:'Your story starts with a hello.'}</span><button className="primary-button" onClick={onClose}>Back to village <span>→</span></button></footer>
    </section>
  </div>
}
