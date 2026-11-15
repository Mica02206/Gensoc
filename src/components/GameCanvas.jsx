import { useEffect, useRef, useState } from 'react'
import { modules } from '../data/modulesData'

const W = 960, H = 600
const paths = [
  [0, 282, 960, 346, '#d8bd8c'], [447, 0, 510, 600, '#d8bd8c'],
  [0, 283, 960, 8, '#ead8b4'], [0, 337, 960, 8, '#c9aa78'],
  [462, 0, 10, 600, '#ead8b4'], [505, 0, 10, 600, '#c9aa78'],
]
const buildings = [
  { x: 74, y: 62, w: 198, h: 126, a: '#a65f4d', b: '#f0d6a7', label: 'WILLOW LIBRARY', door: '#795141' },
  { x: 354, y: 42, w: 220, h: 124, a: '#bf8251', b: '#f2dbad', label: 'TOWN SQUARE', door: '#76513d' },
  { x: 680, y: 64, w: 203, h: 126, a: '#719584', b: '#efdbb4', label: 'SAMPAGUITA CLINIC', door: '#4d685b' },
  { x: 84, y: 414, w: 195, h: 122, a: '#a88052', b: '#f3dfb9', label: 'NEWSSTAND', door: '#73543a' },
  { x: 378, y: 426, w: 194, h: 112, a: '#8d9d60', b: '#e4d19c', label: 'COMMUNITY GARDEN', door: '#637149' },
  { x: 685, y: 414, w: 198, h: 122, a: '#718394', b: '#e9d8b6', label: 'TOWN HALL', door: '#526270' },
]
const treePositions = [[28,220],[321,216],[644,214],[915,225],[35,380],[324,376],[646,376],[924,385],[304,38],[634,53],[317,559],[640,566],[48,565],[914,560],[592,220],[356,378]]
const flowerPositions = Array.from({ length: 45 }, (_, i) => [14 + (i * 79 % 926), 202 + (i * 47 % 195), i % 3])

function rounded(ctx, x, y, w, h, r, fill) {
  ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill()
}
function drawTree(ctx, x, y, s = 1) {
  ctx.fillStyle = '#906044'; ctx.fillRect(x - 4*s, y + 10*s, 9*s, 17*s)
  ctx.fillStyle = '#53724b'; ctx.fillRect(x - 14*s, y + 2*s, 28*s, 16*s)
  ctx.fillStyle = '#70905a'; ctx.fillRect(x - 10*s, y - 4*s, 20*s, 19*s)
  ctx.fillStyle = '#88a96c'; ctx.fillRect(x - 5*s, y - 5*s, 9*s, 7*s)
  ctx.fillStyle = '#445f43'; ctx.fillRect(x - 14*s, y + 14*s, 28*s, 4*s)
}
function drawPerson(ctx, x, y, outfit, skin, hair, scale = 1, frame = 0, direction = 'down') {
  const s = scale; const bob = frame ? 1 : 0
  ctx.fillStyle = 'rgba(75,64,44,.18)'; ctx.fillRect(x - 10*s, y + 9*s, 20*s, 5*s)
  ctx.fillStyle = '#473b39'; ctx.fillRect(x - 5*s, y + 7*s + bob, 4*s, 5*s); ctx.fillRect(x + 2*s, y + 7*s + bob, 4*s, 5*s)
  ctx.fillStyle = outfit; ctx.fillRect(x - 9*s, y - 2*s, 18*s, 13*s); ctx.fillRect(x - 12*s, y, 4*s, 8*s); ctx.fillRect(x + 8*s, y, 4*s, 8*s)
  ctx.fillStyle = skin; ctx.fillRect(x - 8*s, y - 17*s, 16*s, 16*s)
  ctx.fillStyle = hair; ctx.fillRect(x - 9*s, y - 19*s, 18*s, 7*s); ctx.fillRect(x - 9*s, y - 15*s, 3*s, 7*s)
  if (direction === 'down') { ctx.fillStyle = '#382d2b'; ctx.fillRect(x - 4*s, y - 10*s, 2*s, 2*s); ctx.fillRect(x + 3*s, y - 10*s, 2*s, 2*s) }
  else if (direction === 'up') { ctx.fillStyle = hair; ctx.fillRect(x - 8*s, y - 15*s, 16*s, 11*s) }
  else { ctx.fillStyle = '#382d2b'; ctx.fillRect(x + (direction === 'right' ? 3 : -5)*s, y - 10*s, 2*s, 2*s) }
}
function drawBuilding(ctx, b) {
  ctx.fillStyle = 'rgba(60,49,38,.14)'; ctx.fillRect(b.x + 9, b.y + 11, b.w, b.h)
  ctx.fillStyle = b.a; ctx.fillRect(b.x - 8, b.y + 16, b.w + 16, 23)
  ctx.fillStyle = b.b; ctx.fillRect(b.x, b.y + 34, b.w, b.h - 34)
  ctx.fillStyle = '#f5e6c9'; ctx.fillRect(b.x + 8, b.y + 39, b.w - 16, 4)
  ctx.fillStyle = '#e8cd9d'; ctx.fillRect(b.x + 12, b.y + 53, b.w - 24, 2)
  ctx.fillStyle = '#f8e7c6'; ctx.fillRect(b.x + 14, b.y + 15, b.w - 28, 15)
  ctx.fillStyle = '#72503f'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'; ctx.fillText(b.label, b.x + b.w/2, b.y + 26)
  ctx.fillStyle = b.door; ctx.fillRect(b.x + b.w/2 - 12, b.y + b.h - 33, 24, 33)
  ctx.fillStyle = '#e6b86f'; ctx.fillRect(b.x + b.w/2 + 6, b.y + b.h - 17, 3, 3)
  ctx.fillStyle = '#8eaa91'; ctx.fillRect(b.x + 19, b.y + 55, 28, 22); ctx.fillRect(b.x + b.w - 47, b.y + 55, 28, 22)
  ctx.fillStyle = '#e7ca8e'; ctx.fillRect(b.x + 31, b.y + 55, 3, 22); ctx.fillRect(b.x + 19, b.y + 64, 28, 3); ctx.fillRect(b.x + b.w - 35, b.y + 55, 3, 22); ctx.fillRect(b.x + b.w - 47, b.y + 64, 28, 3)
}

export default function GameCanvas({ completed, onNearby, onInteract, onPosition, dpad, sound, paused }) {
  const canvasRef = useRef(null), player = useRef({ x: 480, y: 330 }), keys = useRef({}), frame = useRef(0), raf = useRef(0), lastInteract = useRef(false)
  const [near, setNear] = useState(null)
  const nearRef = useRef(null)
  useEffect(() => { nearRef.current = near; onNearby(near) }, [near, onNearby])
  useEffect(() => {
    const keydown = e => { const k = e.key.toLowerCase(); if (['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)) e.preventDefault(); keys.current[k] = true }
    const keyup = e => { keys.current[e.key.toLowerCase()] = false }
    const blur = () => { keys.current = {} }
    window.addEventListener('keydown', keydown); window.addEventListener('keyup', keyup); window.addEventListener('blur', blur)
    return () => { window.removeEventListener('keydown', keydown); window.removeEventListener('keyup', keyup); window.removeEventListener('blur', blur) }
  }, [])
  useEffect(() => {
    const canvas = canvasRef.current, ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    let previous = performance.now(), walk = 0, footstep = 0, lastPositionSent = 0
    const draw = now => {
      const dt = Math.min((now - previous) / 16.67, 2); previous = now
      const k = keys.current, pad = dpad.current || {}
      const dx = paused ? 0 : Number(Boolean(k.d || k.arrowright || pad.right)) - Number(Boolean(k.a || k.arrowleft || pad.left))
      const dy = paused ? 0 : Number(Boolean(k.s || k.arrowdown || pad.down)) - Number(Boolean(k.w || k.arrowup || pad.up))
      const mag = Math.hypot(dx,dy) || 1, speed = (k.shift ? 3.4 : 2.4) * dt
      const p = player.current
      let nx = Math.max(28, Math.min(W - 28, p.x + dx/mag*speed)), ny = Math.max(24, Math.min(H - 22, p.y + dy/mag*speed))
      const blocked = buildings.some(b => nx > b.x - 15 && nx < b.x + b.w + 15 && ny > b.y + 29 && ny < b.y + b.h - 8)
        || treePositions.some(([tx,ty]) => Math.abs(nx-tx)<18 && ny>ty-7 && ny<ty+23)
        || (nx>383&&nx<453&&ny>448&&ny<487) || (nx>490&&nx<560&&ny>448&&ny<487)
        || (nx>464&&nx<495&&ny>294&&ny<326)
      if (!blocked) { p.x = nx; p.y = ny }
      if (dx || dy) { walk += dt; footstep += dt; frame.current = Math.floor(walk / 8) % 2; if (footstep > 22) { sound('step'); footstep = 0 } } else footstep = 0
      const closest = modules.reduce((best, m) => Math.hypot(m.x/100*W-p.x, m.y/100*H-p.y) < best.dist ? { id:m.id, dist:Math.hypot(m.x/100*W-p.x,m.y/100*H-p.y) } : best, { id:null, dist: Infinity })
      const nextNear = closest.dist < 74 ? closest.id : null
      if (nextNear !== nearRef.current) { nearRef.current = nextNear; setNear(nextNear); onNearby(nextNear) }
      const interact = Boolean(k[' '] || k.enter || k.e)
      if (!paused && interact && !lastInteract.current && nextNear !== null) onInteract(nextNear)
      lastInteract.current = interact
      if (now - lastPositionSent > 100) { onPosition({ x:p.x/W, y:p.y/H }); lastPositionSent = now }

      ctx.clearRect(0,0,W,H); ctx.fillStyle = '#c7d1a3'; ctx.fillRect(0,0,W,H)
      ctx.fillStyle = '#c0ce9e'; ctx.fillRect(0, 0, W, H)
      for (let i=0;i<100;i++){ const x=(i*113+19)%W, y=(i*71+43)%H; ctx.fillStyle=i%2?'#b6c790':'#d0d4a5'; ctx.fillRect(x,y,2,2) }
      for (const [x,y] of treePositions) drawTree(ctx,x,y, x % 2 ? 1 : .9)
      for (const [x,y,c] of flowerPositions) { if (y < 205 || y > 405) continue; ctx.fillStyle=['#ead795','#e3a48d','#f0ead0'][c]; ctx.fillRect(x,y,4,4); ctx.fillStyle='#738c59';ctx.fillRect(x+1,y+4,2,4) }
      for(const [x,y,w,h,color] of paths) { ctx.fillStyle=color;ctx.fillRect(x,y,w,h) }
      for(let x=5;x<W;x+=38){ctx.fillStyle='rgba(110,83,52,.12)';ctx.fillRect(x,321,2,3);ctx.fillRect(x+17,290,2,3)}
      buildings.forEach(b=>drawBuilding(ctx,b))
      // Garden beds and a little fountain make the shared square feel lived in.
      ctx.fillStyle='#876c4b';ctx.fillRect(394,454,54,29);ctx.fillRect(501,454,54,29);ctx.fillStyle='#607c4a';ctx.fillRect(399,459,44,19);ctx.fillRect(506,459,44,19)
      for(let i=0;i<7;i++){ctx.fillStyle=['#e1a28f','#e9d396','#cc9da7'][i%3];ctx.fillRect(402+i*6,464+(i%2)*5,4,4)}
      ctx.fillStyle='#b4c8b2';ctx.fillRect(471,300,19,19);ctx.fillStyle='#e4d9b9';ctx.fillRect(474,303,13,13);ctx.fillStyle='#88a9a2';ctx.fillRect(478,306,5,8)
      // Draw characters in depth order.
      const actors = modules.map(m=>({ y:m.y/100*H, m })).concat([{ y:player.current.y, player:true }]).sort((a,b)=>a.y-b.y)
      actors.forEach(actor=>{
        if (actor.player) drawPerson(ctx,p.x,p.y,'#d28154','#e6b48b','#53433e',1.14,frame.current, dx ? (dx>0?'right':'left') : dy<0?'up':'down')
        else { const m=actor.m, x=m.x/100*W, y=m.y/100*H; drawPerson(ctx,x,y,m.outfit,m.skin,m.hair,1,0)
          const done=completed.includes(m.id), pulse=Math.sin(now/220 + m.id)*2
          rounded(ctx,x-10,y-49+pulse,20,19,6,done?'#718d66':'#f7f0dc');ctx.fillStyle=done?'#f8f1df':'#c67957';ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.fillText(done?'✓':'!',x,y-35+pulse)
          ctx.fillStyle='#53654e';ctx.font='9px monospace';ctx.fillText(m.name,x,y+27)
        }
      })
      raf.current = requestAnimationFrame(draw)
    }
    raf.current=requestAnimationFrame(draw)
    return ()=>cancelAnimationFrame(raf.current)
  }, [completed, dpad, onInteract, onNearby, onPosition, paused, sound])
  const handleClick = e => {
    const rect = canvasRef.current.getBoundingClientRect(), x = (e.clientX-rect.left)/rect.width*W, y=(e.clientY-rect.top)/rect.height*H
    const m = modules.find(n=>Math.hypot(n.x/100*W-x,n.y/100*H-y)<44)
    if (m) { const p=player.current; p.x=Math.max(28,Math.min(W-28,x));p.y=Math.max(24,Math.min(H-22,y)); onInteract(m.id) }
  }
  return <canvas ref={canvasRef} width={W} height={H} onClick={handleClick} className="game-canvas" aria-label="Pixel-art village. Use WASD or arrow keys to move; E, Enter, or Space to interact." />
}
