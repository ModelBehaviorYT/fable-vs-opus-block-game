import * as THREE from 'three';
import { B, I, BLOCKS, SOLID } from './blocks.js';

const texCache = {};
function rnd(s){ let a=s; return ()=>{ a=(a*16807)%2147483647; return a/2147483647; }; }
function makeTex(key, base, vary, draw, w=8, h=8) {
  const k = key; if (texCache[k]) return texCache[k];
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); const r = rnd(key.length*977+13);
  for (let j=0;j<h;j++) for (let i=0;i<w;i++){ const f = 1 - vary/2 + r()*vary; x.fillStyle = `rgb(${base[0]*f|0},${base[1]*f|0},${base[2]*f|0})`; x.fillRect(i,j,1,1); }
  if (draw) draw(x, r);
  const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter;  return texCache[k] = t;
}
// box with per-face textures: faces = {all, front, top, ...}
function part(w,h,d, faces, px,py,pz, ox=0, oy=0, oz=0) {
  const g = new THREE.BoxGeometry(w,h,d); g.translate(ox,oy,oz);
  const order = ['right','left','top','bottom','front','back'];
  const mats = order.map(n => new THREE.MeshBasicMaterial({ map: faces[n] || faces.all, transparent:false }));
  const m = new THREE.Mesh(g, mats); m.position.set(px,py,pz); return m;
}
const px = (x,c,i,j,w=1,h=1)=>{ x.fillStyle=c; x.fillRect(i,j,w,h); };

function eyes(col, pupil, y=3) { return (x)=>{ px(x,'#fff',1,y,2,1); px(x,'#fff',5,y,2,1); px(x,pupil,2,y,1,1); px(x,pupil,5,y,1,1); }; }

const LURE = { cow: I.WHEAT, sheep: I.WHEAT, pig: I.WHEAT, chicken: I.SEEDS };
export const MOB_DEFS = {
  cow: { hp:10, hw:0.45, h:1.3, speed:1.2, passive:true, sound:'cow', drops:[[I.BEEF,1,3],[I.LEATHER,0,2]] },
  pig: { hp:10, hw:0.45, h:0.9, speed:1.3, passive:true, sound:'pig', drops:[[I.PORK,1,3]] },
  sheep: { hp:8, hw:0.45, h:1.3, speed:1.2, passive:true, sound:'sheep', drops:[[B.WOOL,1,1]] },
  chicken: { hp:4, hw:0.25, h:0.7, speed:1.2, passive:true, sound:'chicken', drops:[[I.CHICKEN,1,1],[I.FEATHER,0,2]] },
  slime: { hp:12, hw:0.45, h:0.9, speed:2.2, hostile:true, hopper:true, sound:'slime', dmg:2, drops:[[I.STRING,0,1]] },
  ember: { hp:14, hw:0.45, h:0.9, speed:2.6, hostile:true, hopper:true, sound:'slime', dmg:4, fireproof:true, drops:[[I.COAL,0,2]] },
  rabbit: { hp:3, hw:0.2, h:0.5, speed:2.2, passive:true, sound:'pop', drops:[[I.LEATHER,0,1]] },
  squid: { hp:10, hw:0.4, h:0.9, speed:1.5, passive:true, aquatic:true, sound:'swim', drops:[[I.COAL,0,2]] },
  golem: { hp:100, hw:0.65, h:2.7, speed:1.3, sound:'golem', drops:[[I.IRON,3,5]] },
  wolf: { hp:8, hw:0.3, h:0.85, speed:2.8, sound:'wolf', dmg:3, drops:[] },
  villager: { hp:20, hw:0.3, h:1.95, speed:0.9, passive:true, sound:'villager', drops:[] },
  zombie: { hp:20, hw:0.3, h:1.9, speed:2.3, hostile:true, sound:'zombie', dmg:3, burns:true, drops:[[I.ROTTEN,0,2]] },
  skeleton: { hp:20, hw:0.3, h:1.9, speed:2.4, hostile:true, sound:'skeleton', dmg:3, burns:true, ranged:true, drops:[[I.BONE,0,2],[I.ARROW,0,2]] },
  spider: { hp:16, hw:0.7, h:0.9, speed:3.2, hostile:true, sound:'spider', dmg:2, drops:[[I.STRING,0,2]] },
  fuseling: { hp:20, hw:0.3, h:1.6, speed:2.2, hostile:true, sound:'fizz', explode:true, drops:[[I.GUNPOWDER,0,2]] },
};

function buildModel(type) {
  const g = new THREE.Group(); const legs = []; let head, arms=[];
  const T = (k,b,v,d)=>makeTex(type+k,b,v,d);
  if (type==='cow' || type==='pig' || type==='sheep') {
    const cow = type==='cow', pig = type==='pig';
    const bodyCol = cow ? [92,62,40] : pig ? [236,160,160] : [235,235,230];
    const bodyT = T('body', bodyCol, cow?0.15:0.12, cow ? (x,r)=>{ for(let k=0;k<5;k++) px(x,'#e8e4dc',r()*7|0,r()*7|0,2,2); } : null);
    const bw = type==='sheep'?0.95:0.85, bh = pig?0.6:0.75, bl = pig?1.05:1.25;
    const ly = pig?0.38:0.7;
    g.add(part(bw,bh,bl,{all:bodyT}, 0, ly+bh/2, 0));
    const headCol = cow ? [92,62,40] : pig ? [236,160,160] : [200,190,175];
    const faceT = T('face', headCol, 0.1, (x)=>{ if(pig){ px(x,'#fff',0,2,2,1); px(x,'#222',1,2); px(x,'#fff',6,2,2,1); px(x,'#222',6,2); px(x,'#d98888',2,4,4,3); px(x,'#8a4a4a',3,5); px(x,'#8a4a4a',4,5);} else if(cow){ px(x,'#fff',0,2,2,2); px(x,'#111',0,3); px(x,'#fff',6,2,2,2); px(x,'#111',7,3); px(x,'#d8b8a0',2,5,4,3); px(x,'#333',2,6); px(x,'#333',5,6);} else { px(x,'#fff',1,3,2,1); px(x,'#222',2,3); px(x,'#fff',5,3,2,1); px(x,'#222',5,3); px(x,'#e8b0b0',3,6,2,1);} });
    const hs = pig?0.5:0.5;
    head = part(hs, hs, hs*0.8, {all:T('head',headCol,0.1), front:faceT}, 0, ly+bh*0.8, bl/2+0.1, 0,0,hs*0.3);
    if (cow) { head.add(part(0.08,0.15,0.08,{all:T('horn',[220,220,200],0.1)}, 0.2,0.3,0.2)); head.add(part(0.08,0.15,0.08,{all:T('horn',[220,220,200],0.1)}, -0.2,0.3,0.2)); }
    g.add(head);
    const legT = T('leg', cow?[70,48,30]: pig?[220,145,145]:[200,190,175], 0.15);
    for (const [lx,lz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) { const L = part(0.25,ly,0.25,{all:legT}, lx*(bw/2-0.14), ly, lz*(bl/2-0.15), 0,-ly/2,0); legs.push(L); g.add(L); }
  } else if (type==='chicken') {
    const wt = T('body',[245,245,245],0.08);
    g.add(part(0.4,0.4,0.5,{all:wt},0,0.5,0));
    head = part(0.28,0.4,0.22,{all:wt, front:T('face',[245,245,245],0.05,(x)=>{ px(x,'#111',1,2); px(x,'#111',6,2); px(x,'#f0a020',2,4,4,2); px(x,'#d02020',3,6,2,2); })},0,0.75,0.25,0,0.1,0.05);
    g.add(head);
    for (const s of [-1,1]) { const wg=part(0.06,0.3,0.4,{all:wt},s*0.23,0.55,0); g.add(wg); arms.push(wg); }
    const lt = T('leg',[230,160,40],0.1);
    for (const s of [-1,1]) { const L=part(0.07,0.3,0.07,{all:lt},s*0.1,0.3,0,0,-0.15,0); legs.push(L); g.add(L); }
  } else if (type==='zombie' || type==='skeleton') {
    const sk = type==='skeleton';
    const skin = sk ? [200,200,195] : [90,140,70];
    const headT = T('head', skin, 0.12);
    const faceT = T('face', skin, 0.12, sk ? (x)=>{ px(x,'#222',1,3,2,2); px(x,'#222',5,3,2,2); px(x,'#333',3,5,2,1); px(x,'#444',1,6,6,1); } : (x)=>{ px(x,'#111',1,3,2,1); px(x,'#111',5,3,2,1); px(x,'#2f4a25',2,6,4,1); px(x,'#4a7a3a',0,0,8,1); });
    head = part(0.5,0.5,0.5,{all:headT, front:faceT}, 0,1.65,0, 0,0.0,0); g.add(head);
    const shirt = sk ? T('body',[200,200,195],0.2,(x)=>{ for(let j=0;j<8;j+=2) px(x,'#555',0,j,8,1);}) : T('body',[112,92,70],0.25,(x)=>{ px(x,'#5a4630',2,5,2,2); px(x,'#5a4630',6,1,1,3); });
    const bw = sk?0.4:0.5;
    g.add(part(bw,0.75,sk?0.18:0.26,{all:shirt},0,1.03,0));
    const armT = sk? T('arm',[200,200,195],0.15) : T('arm',[90,140,70],0.12,(x)=>{px(x,'#705c46',0,0,8,3);});
    const lw = sk?0.13:0.25;
    for (const s of [-1,1]) { const A=part(lw,0.75,lw,{all:armT}, s*(bw/2+lw/2),1.38,0, 0,-0.32,0); A.rotation.x=-Math.PI/2*(sk?0.5:1); arms.push(A); g.add(A); }
    const legT = sk? T('leg',[200,200,195],0.15) : T('leg',[72,70,82],0.15);
    for (const s of [-1,1]) { const L=part(lw,0.75,lw,{all:legT}, s*(sk?0.1:0.125),0.75,0, 0,-0.375,0); legs.push(L); g.add(L); }
    if (sk) { const bow = part(0.04,0.7,0.04,{all:T('bow',[110,80,40],0.1)}, 0, -0.6, 0.08); arms[1].add(bow); }
  } else if (type==='slime' || type==='ember') {
    const em = type==='ember';
    const skin = em ? T('body',[60,20,10],0.3,(x,r)=>{ for(let k=0;k<14;k++) px(x, r()<0.5?'#ff7a10':'#ffb030', r()*8|0, r()*8|0); }) : T('body',[110,190,90],0.15);
    const face = em ? T('face',[60,20,10],0.3,(x)=>{ px(x,'#ffcc30',1,2,2,2); px(x,'#ffcc30',5,2,2,2); px(x,'#ff6a00',2,5,4,1); }) : T('face',[110,190,90],0.15,(x)=>{ px(x,'#1f3a1a',1,2,2,2); px(x,'#1f3a1a',5,2,2,2); px(x,'#1f3a1a',3,5,2,1); });
    const body = part(0.9,0.9,0.9,{all:skin, front:face},0,0.45,0); body.material.forEach(mt=>{ if(!em){ mt.transparent = true; mt.opacity = 0.85; } }); g.add(body); head = body;
    if (!em) g.add(part(0.5,0.5,0.5,{all:T('core',[70,140,60],0.1)},0,0.4,0));
  } else if (type==='rabbit') {
    const fur = T('body',[176,140,104],0.15);
    g.add(part(0.3,0.28,0.42,{all:fur},0,0.24,0));
    head = part(0.26,0.24,0.24,{all:fur, front:T('face',[176,140,104],0.1,(x)=>{ px(x,'#111',1,3); px(x,'#111',6,3); px(x,'#e8a0a0',3,5,2,1); })},0,0.42,0.22); g.add(head);
    head.add(part(0.06,0.24,0.04,{all:T('ear',[190,150,115],0.1)},-0.06,0.22,-0.02)); head.add(part(0.06,0.24,0.04,{all:T('ear',[190,150,115],0.1)},0.06,0.22,-0.02));
    g.add(part(0.12,0.12,0.1,{all:T('tail',[240,240,235],0.05)},0,0.3,-0.24));
    const lt = T('leg',[160,125,92],0.1);
    for (const [lx,lz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) { const L = part(0.08,0.14,0.14,{all:lt},lx*0.1,0.12,lz*0.13,0,-0.06,0); legs.push(L); g.add(L); }
  } else if (type==='squid') {
    const sk = T('body',[38,58,92],0.25,(x,r)=>{ for(let k=0;k<6;k++) px(x,'#4a6ea8',r()*8|0,r()*8|0); });
    head = part(0.75,0.95,0.75,{all:sk, front:T('face',[38,58,92],0.2,(x)=>{ px(x,'#fff',0,4,2,2); px(x,'#111',1,5); px(x,'#fff',6,4,2,2); px(x,'#111',6,5); })},0,0.95,0); g.add(head);
    const tt = T('tent',[52,74,110],0.2);
    for (let i=0;i<8;i++) { const a = i/8*Math.PI*2; const L = part(0.12,0.75,0.12,{all:tt}, Math.cos(a)*0.28,0.5,Math.sin(a)*0.28, 0,-0.37,0); L.userData.a = a; legs.push(L); g.add(L); }
  } else if (type==='golem') {
    const iron = T('body',[200,195,185],0.12,(x,r)=>{ for(let k=0;k<5;k++) px(x,'#6a8a4a',r()*8|0,r()*8|0,1,2); });
    g.add(part(1.2,0.9,0.7,{all:iron},0,1.95,0)); g.add(part(0.8,0.5,0.5,{all:iron},0,1.35,0));
    head = part(0.55,0.6,0.55,{all:iron, front:T('face',[200,195,185],0.1,(x)=>{ px(x,'#6a3a20',1,3,2,1); px(x,'#6a3a20',5,3,2,1); px(x,'#a09a90',3,4,2,3); })},0,2.55,0.05); g.add(head);
    for (const s of [-1,1]) { const A=part(0.35,1.6,0.4,{all:iron}, s*0.78,2.35,0, 0,-0.75,0); arms.push(A); g.add(A); }
    for (const s of [-1,1]) { const L=part(0.4,1.1,0.42,{all:iron}, s*0.25,1.1,0, 0,-0.55,0); legs.push(L); g.add(L); }
  } else if (type==='wolf') {
    const fur = T('body',[205,200,195],0.15,(x)=>{ px(x,'#9a948e',0,0,8,2); });
    g.add(part(0.4,0.4,0.75,{all:fur},0,0.62,-0.05));
    g.add(part(0.48,0.42,0.35,{all:T('mane',[215,210,205],0.12)},0,0.66,0.3));
    head = part(0.38,0.36,0.32,{all:fur, front:T('face',[205,200,195],0.12,(x)=>{ px(x,'#222',1,2); px(x,'#222',6,2); px(x,'#8a847e',2,4,4,4); px(x,'#111',3,4,2,1); })},0,0.78,0.6); g.add(head);
    head.add(part(0.2,0.16,0.22,{all:T('snout',[160,154,148],0.1)},0,-0.07,0.25));
    head.add(part(0.1,0.12,0.06,{all:fur},-0.12,0.22,0)); head.add(part(0.1,0.12,0.06,{all:fur},0.12,0.22,0));
    const tail = part(0.12,0.12,0.45,{all:fur},0,0.75,-0.45,0,0,-0.2); tail.rotation.x = 0.6; g.add(tail); arms.push(tail);
    const collar = part(0.5,0.08,0.37,{all:T('collar',[200,30,30],0.05)},0,0.62,0.3); collar.visible = false; g.add(collar); g.userData.collar = collar;
    const legT = T('leg',[190,185,180],0.15);
    for (const [lx,lz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) { const L=part(0.13,0.42,0.13,{all:legT},lx*0.12,0.42,lz*0.25,0,-0.21,0); legs.push(L); g.add(L); }
  } else if (type==='villager') {
    const skin=[190,140,110]; const robe = T('robe',[120,82,52],0.15,(x)=>{ px(x,'#5a3a20',0,3,8,1); px(x,'#6a4a2a',3,0,2,8); });
    head = part(0.5,0.6,0.5,{all:T('head',skin,0.08,(x)=>{ px(x,'#3a2a1a',0,0,8,1); }), front:T('face',skin,0.08,(x)=>{ px(x,'#3a2a1a',0,0,8,1); px(x,'#3a2a1a',1,2,6,1); px(x,'#fff',1,3,2,1); px(x,'#2a6a2a',2,3); px(x,'#fff',5,3,2,1); px(x,'#2a6a2a',5,3); })}, 0,1.7,0, 0,0,0); g.add(head);
    head.add(part(0.13,0.25,0.13,{all:T('nose',[175,125,95],0.08)},0,-0.12,0.3));
    g.add(part(0.52,0.85,0.3,{all:robe},0,0.98,0));
    const arms3 = part(0.62,0.22,0.25,{all:T('arms',[110,75,48],0.15)},0,1.15,0.2); arms3.rotation.x = -0.4; g.add(arms3);
    const legT = T('leg',[80,60,40],0.15);
    for (const s of [-1,1]) { const L=part(0.24,0.6,0.24,{all:legT}, s*0.12,0.6,0, 0,-0.3,0); legs.push(L); g.add(L); }
  } else if (type==='spider') {
    const bt = T('body',[45,38,35],0.25);
    g.add(part(0.95,0.6,0.95,{all:bt},0,0.55,-0.45));
    g.add(part(0.45,0.4,0.4,{all:bt},0,0.5,0.15));
    head = part(0.55,0.5,0.45,{all:bt, front:T('face',[45,38,35],0.2,(x)=>{ px(x,'#e01010',1,2,2,1); px(x,'#e01010',5,2,2,1); px(x,'#ff3030',3,3,2,1); px(x,'#e01010',2,4); px(x,'#e01010',5,4); })},0,0.55,0.55); g.add(head);
    const lt = T('leg',[50,42,38],0.2);
    for (let i=0;i<4;i++) for (const s of [-1,1]) { const L = part(1.0,0.1,0.1,{all:lt}, s*0.25,0.6,0.25-i*0.22, s*0.5,0,0); L.rotation.order = 'YZX'; L.rotation.z = -s*0.55; L.rotation.y = s*(i-1.5)*0.35; L.userData.s=s; L.userData.ry = L.rotation.y; legs.push(L); g.add(L); }
  } else if (type==='fuseling') {
    const bc=[78,72,98];
    const bt = T('body',bc,0.25,(x,r)=>{ for(let k=0;k<6;k++) px(x,'#8a6ab0',r()*8|0,r()*8|0); });
    g.add(part(0.55,0.8,0.42,{all:bt},0,0.85,0));
    head = part(0.6,0.55,0.55,{all:bt, front:T('face',bc,0.2,(x)=>{ px(x,'#2a1a10',2,2,4,4); px(x,'#ff9a1a',3,3,2,2); px(x,'#ffe070',3,3); px(x,'#2a1a10',2,6,4,1); })},0,1.5,0); g.add(head);
    head.add(part(0.06,0.25,0.06,{all:T('fuse',[60,50,40],0.2)},0.12,0.38,0)); head.add(part(0.08,0.08,0.08,{all:T('spark',[255,190,60],0.1)},0.12,0.53,0));
    const lt = T('leg',[60,55,78],0.2);
    for (const [lx,lz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) { const L=part(0.2,0.45,0.2,{all:lt},lx*0.15,0.45,lz*0.13,0,-0.225,0); legs.push(L); g.add(L); }
  }
  g.traverse(o=>{ if (o.isMesh) o.material.forEach(m=>m.userData.base=true); });
  return { g, legs, head, arms };
}

export class Mobs {
  constructor(G) { this.G = G; this.list = []; this.arrows = []; this.spawnT = 0; }
  clear(){ for (const m of this.list) this.G.scene.remove(m.model.g); this.list = []; for (const a of this.arrows) this.G.scene.remove(a.mesh); this.arrows=[]; }
  spawn(type, x, y, z) {
    const d = MOB_DEFS[type]; const model = buildModel(type);
    const m = { type, d, pos: new THREE.Vector3(x,y,z), vel: new THREE.Vector3(), hw:d.hw, h:d.h, yaw: Math.random()*6.28, hp:d.hp, model, walk:0, ai:{t:0,dir:null}, hurtT:0, deadT:-1, atkT:0, fuse:-1, soundT: 3+Math.random()*8, onGround:false, burnT:0 };
    if ((type==='zombie' || type==='skeleton') && Math.random() < 0.25) { // some monsters spawn wearing a helmet
      const col = [0x8a5530,0xd0d0d0,0xf0c830][Math.random()*3|0]; const hm = new THREE.Mesh(new THREE.BoxGeometry(0.58,0.32,0.58), new THREE.MeshBasicMaterial({color:col})); hm.position.y = 0.17; hm.material.userData.base = col; model.head.add(hm); m.armorPts = 2; }
    this.G.scene.add(model.g); this.list.push(m); return m;
  }
  setTint(m, r, g, b) { m.model.g.traverse(o=>{ if (o.isMesh) for (const mt of (Array.isArray(o.material)?o.material:[o.material])) { if (mt.userData.base !== undefined && mt.userData.base !== true) mt.color.setHex(mt.userData.base).multiply(new THREE.Color(r,g,b)); else mt.color.setRGB(r,g,b); } }); }
  update(dt) {
    const G = this.G, P = G.player, W = G.world;
    // village population (checked every frame so villages are never empty)
    if (!G.peaceful && W.villageAt) { const vil = W.villageAt(Math.floor(P.pos.x), Math.floor(P.pos.z));
      if (vil) {
        if (!this.list.some(m=>m.type==='golem')) { const gx = vil.x + 4, gz = vil.z + 4; if (W.isLoaded(gx,gz)) { let gy = W.col(gx,gz).h + 3; while (gy > 1 && !SOLID[W.getBlock(gx,gy,gz)]) gy--; this.spawn('golem', gx+0.5, gy+1, gz+0.5); } }
        let tries = 0; while (this.list.filter(m=>m.type==='villager').length < 5 && tries++ < 8) { const hs = vil.houses[Math.random()*vil.houses.length|0] || vil; const vx = hs.x + (Math.random()*6-3|0), vz = hs.z + (Math.random()*6-3|0);
          if (!W.isLoaded(vx,vz)) continue; let vy = W.col(vx,vz).h + 2; while (vy > 1 && !SOLID[W.getBlock(vx,vy,vz)]) vy--; if (!SOLID[W.getBlock(vx,vy+1,vz)] && !SOLID[W.getBlock(vx,vy+2,vz)]) this.spawn('villager', vx+0.5, vy+1, vz+0.5); } } }
    // spawning
    this.spawnT -= dt;
    if (this.spawnT <= 0 && !G.peaceful) {
      this.spawnT = 0.5;
      const night = G.daylight() < 0.35 || W.dim === 'nether';
      const passive = this.list.filter(m=>m.d.passive).length, hostile = this.list.length - passive;
      const ang = Math.random()*Math.PI*2, dist = 22 + Math.random()*26;
      const x = Math.floor(P.pos.x + Math.cos(ang)*dist), z = Math.floor(P.pos.z + Math.sin(ang)*dist);
      if (W.isLoaded(x,z) && W.isLoaded(x+16,z) ) {
        // surface
        let y = W.dim === 'nether' ? Math.floor(P.pos.y) + 6 : 120; if (W.dim === 'nether') while (y > 1 && SOLID[W.getBlock(x,y,z)]) y--; while (y > 1 && !SOLID[W.getBlock(x,y,z)] && !BLOCKS[W.getBlock(x,y,z)].liquid) y--;
        const top = W.getBlock(x,y,z);
        if (SOLID[top] && W.getBlock(x,y+1,z)===0 && W.getBlock(x,y+2,z)===0) {
          const wb = W.col(x,z).biome;
          if (!night && (wb===2 || wb===3) && (top===B.SAND || top===B.SNOW_GRASS || top===B.SNOW) && Math.random() < 0.15 && this.list.filter(m=>m.type==='rabbit').length < 4) { this.spawn('rabbit', x+0.5, y+1, z+0.5); this.spawn('rabbit', x+1.5, y+1, z+1.5); }
          else if (!night && (wb===1 || wb===3) && (top===B.GRASS || top===B.SNOW_GRASS) && Math.random()<0.12 && this.list.filter(m=>m.type==='wolf').length < 4) { this.spawn('wolf', x+0.5, y+1, z+0.5); this.spawn('wolf', x+1.5, y+1, z+0.5); }
          else if (!night && passive < 10 && top===B.GRASS && Math.random()<0.5) {
            const types = ['cow','pig','sheep','chicken']; const t = types[Math.random()*4|0];
            for (let k=0;k<2+(Math.random()*2|0);k++) { const ox=x+(Math.random()*4-2|0), oz=z+(Math.random()*4-2|0); let yy=y+3; while(yy>1&&!SOLID[W.getBlock(ox,yy-1,oz)]) yy--; if(Math.abs(yy-y-1)<3) this.spawn(t, ox+0.5, yy, oz+0.5); }
          } else if (night && hostile < 14 && top!==B.WATER) {
            const types = W.dim==='nether' ? ['ember','ember','skeleton'] : wb===9 ? ['slime','slime','zombie'] : ['zombie','zombie','skeleton','spider','fuseling']; this.spawn(types[Math.random()*types.length|0], x+0.5, y+1, z+0.5);
          }
        }
        // squid in deep water
        if (W.dim !== 'nether' && W.getBlock(x, 58, z) === B.WATER && W.getBlock(x, 54, z) === B.WATER && this.list.filter(m=>m.type==='squid').length < 5 && Math.random() < 0.4) this.spawn('squid', x+0.5, 56, z+0.5);
        // villagers near villages
        const vil = null;
        if (vil && !this.list.some(m=>m.type==='golem')) { const gx = vil.x + 4, gz = vil.z + 4; if (W.isLoaded(gx,gz)) { let gy = W.col(gx,gz).h + 3; while (gy > 1 && !SOLID[W.getBlock(gx,gy,gz)]) gy--; this.spawn('golem', gx+0.5, gy+1, gz+0.5); } }
        for (let vv=0; vv<3; vv++) if (vil && this.list.filter(m=>m.type==='villager').length < 5) { const hs = vil.houses[Math.random()*vil.houses.length|0] || vil; const vx = hs.x + (Math.random()*6-3|0), vz = hs.z + (Math.random()*6-3|0);
          if (W.isLoaded(vx,vz)) { let vy = W.col(vx,vz).h + 2; while (vy > 1 && !SOLID[W.getBlock(vx,vy,vz)]) vy--; if (!SOLID[W.getBlock(vx,vy+1,vz)] && !SOLID[W.getBlock(vx,vy+2,vz)]) this.spawn('villager', vx+0.5, vy+1, vz+0.5); } }
        // cave spawn
        if (hostile < 14 && Math.random()<0.5) {
          const cy = 8 + Math.random()*50|0;
          if (W.getBlock(x,cy,z)===0 && W.getBlock(x,cy+1,z)===0 && SOLID[W.getBlock(x,cy-1,z)] && W.getSky(x,cy,z) < 4 && W.getBl(x,cy,z) < 6) {
            const types = W.dim==='nether' ? ['ember','ember','zombie','skeleton'] : ['zombie','skeleton','spider','fuseling','slime']; this.spawn(types[Math.random()*types.length|0], x+0.5, cy, z+0.5);
          }
        }
      }
    }
    const day = G.daylight();
    for (let i=this.list.length-1; i>=0; i--) {
      const m = this.list[i]; const d = m.d;
      const dx = P.pos.x - m.pos.x, dz = P.pos.z - m.pos.z, dy = P.pos.y - m.pos.y; const dist = Math.hypot(dx,dz);
      if (dist > 96 || (!W.isLoaded(m.pos.x|0, m.pos.z|0))) { G.scene.remove(m.model.g); this.list.splice(i,1); continue; }
      if (m.deadT >= 0) { m.deadT += dt; m.model.g.rotation.z = Math.min(Math.PI/2, m.deadT*4); this.setTint(m,1,0.3,0.3);
        if (m.deadT > 0.8) { G.scene.remove(m.model.g); this.list.splice(i,1); G.particles(m.pos.x, m.pos.y+0.5, m.pos.z, null, 12, 0xdddddd);
          if (G.spawnXP && m.type !== 'villager') G.spawnXP(m.pos.x, m.pos.y+0.5, m.pos.z, d.hostile ? 5 : 1 + (Math.random()*3|0));
          if (Math.random() < 0.04) { const rare = m.type==='zombie' ? I.IRON : m.type==='skeleton' ? I.BOW : m.type==='spider' ? I.STRING : 0; if (rare) G.spawnDrop(rare, rare===I.BOW ? {dur:200} : 1, m.pos.x, m.pos.y+0.5, m.pos.z); }
          for (const [id,a,b] of d.drops) { const n = a + Math.floor(Math.random()*(b-a+1)); if (n>0) G.spawnDrop(id, n, m.pos.x, m.pos.y+0.5, m.pos.z); } }
        continue; }
      let mx = 0, mz = 0, speed = d.speed, wantJump = false;
      const canTarget = !P.peace && P.alive && P.mode === 'survival' && dist < 18 && Math.abs(dy) < 10;
      const aggressive = d.hostile && canTarget && !(m.type==='spider' && day > 0.6 && !m.angry);
      m.ai.t -= dt;
      if (d.aquatic) {
        if (m.inWater) { m.ai.t -= dt; if (m.ai.t <= 0 || !m.swim) { m.ai.t = 1.5 + Math.random()*3; const a = Math.random()*6.28; m.swim = [Math.cos(a)*1.4, (Math.random()-0.5)*1.2, Math.sin(a)*1.4]; }
          if (W.getBlock(Math.floor(m.pos.x), Math.floor(m.pos.y+1.2), Math.floor(m.pos.z)) !== B.WATER) m.swim[1] = -Math.abs(m.swim[1]) - 0.3;
          m.pulse = (m.pulse||0) + dt*3; const p = 0.5 + 0.5*Math.max(0, Math.sin(m.pulse));
          m.vel.set(m.swim[0]*p, m.swim[1]*p, m.swim[2]*p); m.yaw = Math.atan2(m.swim[0], m.swim[2]); }
        else { m.vel.x *= 0.8; m.vel.z *= 0.8; m.airT = (m.airT||0) + dt; if (m.airT > 2) { m.airT = 0; this.hurt(m, 1, null); } }
        const res2 = G.physics(m, dt); if (m.inWater) { m.vel.y = m.swim ? m.swim[1] : 0; m.airT = 0; }
        m.walk += dt*4; m.model.legs.forEach(L => L.rotation.set(Math.sin(m.walk + L.userData.a)*0.4 * Math.cos(L.userData.a), 0, Math.sin(m.walk + L.userData.a)*0.4 * Math.sin(L.userData.a)));
        m.model.g.position.copy(m.pos); m.model.g.rotation.y = m.yaw;
        if (m.hurtT > 0) { m.hurtT -= dt; if (m.hurtT <= 0) this.setTint(m,1,1,1); } else { const l = G.brightnessAt(m.pos.x, m.pos.y+0.5, m.pos.z); if (Math.abs((m.lastL||0)-l) > 0.02) { m.lastL = l; this.setTint(m,l,l,l); } }
        continue;
      }
      if (m.panic > 0) { m.panic -= dt; speed *= 1.8; if (m.ai.t <= 0) { m.ai.t = 0.8; const a = Math.random()*6.28; m.ai.dir = [Math.cos(a), Math.sin(a)]; } mx = m.ai.dir[0]; mz = m.ai.dir[1]; }
      else if (aggressive) {
        const nx = dx/(dist||1), nz = dz/(dist||1);
        if (d.ranged) {
          if (dist > 9) { mx=nx; mz=nz; } else if (dist < 5) { mx=-nx; mz=-nz; }
          m.atkT -= dt; if (m.atkT <= 0 && dist < 14 && G.canSee(m.pos.x, m.pos.y+1.5, m.pos.z)) { m.atkT = 2 + Math.random(); this.shoot(m); }
        } else if (d.explode) {
          if (m.fuse >= 0) { m.fuse += dt; if (dist > 6) m.fuse = -1; else if (m.fuse > 1.5) { m.deadT = 99; G.explode(m.pos.x, m.pos.y+0.8, m.pos.z, 3); G.scene.remove(m.model.g); this.list.splice(i,1); continue; } }
          else if (dist < 2.8 && Math.abs(dy)<2.5) { m.fuse = 0; G.sound.play('fuse'); }
          if (m.fuse < 0) { mx = nx; mz = nz; }
        } else if (d.hopper) {
          m.atkT -= dt; if (m.onGround) { m.vel.x *= 0.5; m.vel.z *= 0.5; m.hopT = (m.hopT||0) - dt; if (m.hopT <= 0) { m.hopT = 0.8 + Math.random()*0.6; m.vel.y = 7.5; m.vel.x = nx*speed*1.6; m.vel.z = nz*speed*1.6; G.sound.play('slime'); } }
          if (dist < 1.2 + d.hw && Math.abs(dy) < 1.4 && m.atkT <= 0) { m.atkT = 1; G.hurtPlayer(d.dmg, m.pos); }
          m.yaw = Math.atan2(dx, dz); m.model.g.scale.y = m.onGround ? 0.85 : 1.1;        } else {
          mx = nx; mz = nz;
          m.atkT -= dt;
          if (dist < 1.3 + d.hw && Math.abs(dy) < 1.6 && m.atkT <= 0) { m.atkT = 1; G.hurtPlayer(d.dmg, m.pos); }
          if (m.type==='spider' && m.onGround && dist < 4 && dist > 2 && Math.random()<0.02) { m.vel.y = 7; }
        }
        m.yaw = Math.atan2(dx, dz);
      } else if (m.type==='golem' && (m.prey = (m.prey && m.prey.deadT<0 && m.prey.pos.distanceTo(m.pos)<20) ? m.prey : this.list.find(o => o.d.hostile && o.deadT<0 && o.pos.distanceTo(m.pos) < 14))) {
        const t = m.prey; const ddx=t.pos.x-m.pos.x, ddz=t.pos.z-m.pos.z, dd=Math.hypot(ddx,ddz)||1; mx=ddx/dd; mz=ddz/dd; m.yaw=Math.atan2(ddx,ddz);
        m.atkT -= dt; if (dd < 2.2 && m.atkT <= 0) { m.atkT = 1.2; m.swingT = 0.4; this.hurt(t, 10, m.pos); t.vel.y = 9; }
      } else if (m.type==='wolf' && (m.tamed || m.angry)) {
        let tgt = null;
        if (m.angry && !m.tamed) tgt = P.alive && P.mode==='survival' && dist < 20 ? 'player' : null;
        if (m.tamed) tgt = this.list.find(o => o.d.hostile && o.deadT<0 && o.pos.distanceTo(m.pos) < 12) || null;
        if (tgt === 'player') { mx = dx/(dist||1); mz = dz/(dist||1); m.yaw = Math.atan2(dx,dz); m.atkT -= dt; if (dist < 1.4 && m.atkT <= 0) { m.atkT = 1; G.hurtPlayer(3, m.pos); } }
        else if (tgt) { const ddx=tgt.pos.x-m.pos.x, ddz=tgt.pos.z-m.pos.z, dd=Math.hypot(ddx,ddz)||1; mx=ddx/dd; mz=ddz/dd; m.yaw=Math.atan2(ddx,ddz); m.atkT -= dt; if (dd < 1.5 && m.atkT <= 0) { m.atkT = 0.8; this.hurt(tgt, 4, m.pos); } speed *= 1.2; }
        else if (m.tamed) { if (dist > 18) { m.pos.set(P.pos.x - Math.sin(P.yaw)*-1.5, P.pos.y+0.5, P.pos.z); m.vel.set(0,0,0); } else if (dist > 3.5) { mx = dx/dist; mz = dz/dist; m.yaw = Math.atan2(dx,dz); speed *= dist > 8 ? 1.5 : 1; } }
        else m.angry = false;
      } else if (m.type==='zombie' && (m.prey = (m.prey && m.prey.deadT<0 && m.prey.pos.distanceTo(m.pos)<20) ? m.prey : this.list.find(o => o.type==='villager' && o.deadT<0 && o.pos.distanceTo(m.pos) < 16))) {
        const t = m.prey; const ddx=t.pos.x-m.pos.x, ddz=t.pos.z-m.pos.z, dd=Math.hypot(ddx,ddz)||1; mx=ddx/dd; mz=ddz/dd; m.yaw=Math.atan2(ddx,ddz);
        m.atkT -= dt; if (dd < 1.3 && m.atkT <= 0) { m.atkT = 1; this.hurt(t, 3, m.pos); }
        if (Math.random() < dt*0.5) { t.panic = 3; t.ai.t = 0; }
      } else if (d.passive && LURE[m.type] && G.heldId() === LURE[m.type] && dist < 9 && dist > 2 && P.alive) {
        mx = dx/dist; mz = dz/dist; speed *= 1.1;
      } else if (m.love > 0) {
        const mate = this.list.find(o => o!==m && o.type===m.type && o.love>0 && o.deadT<0 && o.pos.distanceTo(m.pos) < 10);
        if (mate) { const ddx = mate.pos.x-m.pos.x, ddz = mate.pos.z-m.pos.z, dd = Math.hypot(ddx,ddz)||1; mx = ddx/dd; mz = ddz/dd;
          if (dd < 1.4) { m.love = 0; mate.love = 0; m.breedCD = 60; mate.breedCD = 60; const baby = this.spawn(m.type, m.pos.x, m.pos.y+0.2, m.pos.z); baby.baby = 120; baby.model.g.scale.setScalar(0.55); G.particles(m.pos.x, m.pos.y+1, m.pos.z, null, 6, 0xff4070, true); } }
      } else {
        if (m.ai.t <= 0) { m.ai.t = 2 + Math.random()*5; if (Math.random() < 0.55) { const a = Math.random()*6.28; m.ai.dir = [Math.cos(a), Math.sin(a)]; } else m.ai.dir = null; }
        if (m.ai.dir) { mx = m.ai.dir[0]*0.6; mz = m.ai.dir[1]*0.6; }
      }
      if (m.love > 0) { m.love -= dt; if (Math.random() < dt*2) G.particles(m.pos.x, m.pos.y+m.h, m.pos.z, null, 1, 0xff4070, true); }
      if (m.breedCD > 0) m.breedCD -= dt;
      if (m.type === 'chicken' && !m.baby) { m.eggT = (m.eggT === undefined ? 60 + Math.random()*60 : m.eggT) - dt; if (m.eggT <= 0) { m.eggT = 60 + Math.random()*60; G.spawnDrop(I.EGG, 1, m.pos.x, m.pos.y+0.3, m.pos.z); G.sound.play('pop'); } }
      if (m.sheared) { m.regrow -= dt; if (m.regrow <= 0) { m.sheared = false; const body = m.model.g.children[0]; body.scale.set(1,1,1); body.material.forEach(mt => mt.map = makeTex('sheepbody',[235,235,230],0.12)); } }
      if (m.baby > 0) { m.baby -= dt; if (m.baby <= 0) m.model.g.scale.setScalar(1); }
      if (m.fuse >= 0) { const fl = Math.sin(m.fuse*20) > 0; this.setTint(m, fl?2.5:1, fl?2.5:1, fl?2.5:1); m.model.g.scale.setScalar(1 + m.fuse*0.08); }
      if (mx || mz) { const tyaw = Math.atan2(mx, mz); let dyaw = tyaw - m.yaw; while (dyaw > Math.PI) dyaw -= 6.283; while (dyaw < -Math.PI) dyaw += 6.283; m.yaw += dyaw*Math.min(1, dt*8); }
      const k = Math.min(1, dt*10);
      if (!(d.hopper && aggressive)) { m.vel.x += (mx*speed - m.vel.x)*k*(m.onGround?1:0.3); m.vel.z += (mz*speed - m.vel.z)*k*(m.onGround?1:0.3); }
      const res = G.physics(m, dt);
      if (m.type === 'rabbit' && m.onGround && (Math.abs(m.vel.x)+Math.abs(m.vel.z)) > 0.3) m.vel.y = 5.5; // rabbits hop
      if (res.hitH && m.onGround && (mx||mz)) {
        // zombies batter down wooden doors in their way
        const fx = Math.floor(m.pos.x + Math.sign(mx)*0.6), fz = Math.floor(m.pos.z + Math.sign(mz)*0.6), fy = Math.floor(m.pos.y);
        if (m.type==='zombie' && aggressive && (W.getBlock(fx,fy,fz)===B.DOOR || W.getBlock(fx,fy+1,fz)===B.DOOR)) { m.doorT = (m.doorT||0) + dt; if (Math.random()<dt*3) G.sound.mat('wood','hit');
          if (m.doorT > 4) { m.doorT = 0; for (const yy of [fy, fy+1]) if (W.getBlock(fx,yy,fz)===B.DOOR) W.setBlock(fx,yy,fz,B.AIR); G.sound.mat('wood','break'); G.particles(fx+0.5,fy+1,fz+0.5,B.PLANKS,10); } }
        else m.vel.y = 8.2; }
      if (m.inWater) { m.vel.y = Math.min(m.vel.y + 30*dt, 2.5); }
      // sounds
      m.soundT -= dt; if (m.soundT <= 0) { m.soundT = 6 + Math.random()*10; if (dist < 20) G.sound.play(d.sound); }
      // burning in daylight
      if (d.burns && day > 0.7 && W.getSky(Math.floor(m.pos.x), Math.floor(m.pos.y+1.6), Math.floor(m.pos.z)) >= 15) { m.burnT += dt; if (m.burnT > 1) { m.burnT = 0; this.hurt(m, 1, null); } if (Math.random()<0.3) G.particles(m.pos.x, m.pos.y+1, m.pos.z, null, 1, 0xff8a20, true); }
      if (m.hurtT > 0) { m.hurtT -= dt; if (m.hurtT <= 0 && m.fuse < 0) this.setTint(m,1,1,1); }
      // animate
      const hs = Math.hypot(m.vel.x, m.vel.z); m.walk += hs*dt*3;
      const sw = Math.sin(m.walk)*Math.min(1, hs)*0.7;
      m.model.legs.forEach((L,j)=>{ if (m.type==='spider') L.rotation.y = L.userData.ry + Math.sin(m.walk*1.5 + j*1.7)*0.25*Math.min(1,hs); else L.rotation.x = (j%2 === (j>1?1:0) ? sw : -sw); });
      if (m.type==='chicken') m.model.arms.forEach((a,j)=>a.rotation.z = m.onGround?0: Math.sin(performance.now()/40)*0.6*(j?1:-1));
      if (m.type==='golem') { m.swingT = (m.swingT||0) - dt; m.model.arms.forEach((a,j)=>a.rotation.x = m.swingT > 0 ? -1.6*Math.sin(m.swingT/0.4*Math.PI) : (j? sw : -sw)*0.6); }
      if (m.type==='zombie') m.model.arms.forEach((a,j)=>a.rotation.x = -Math.PI/2 + Math.sin(m.walk+j*3)*0.1);
      m.model.g.position.copy(m.pos); m.model.g.rotation.y = m.yaw;
      // lighting
      if (m.hurtT <= 0 && m.fuse < 0 && !d.fireproof) { const l = G.brightnessAt(m.pos.x, m.pos.y+0.5, m.pos.z); if (Math.abs((m.lastL||0)-l) > 0.02) { m.lastL = l; this.setTint(m, l, l, l); } }
    }
    // arrows
    for (let i=this.arrows.length-1;i>=0;i--) { const a = this.arrows[i]; a.t += dt;
      { const l = G.brightnessAt(a.pos.x, a.pos.y, a.pos.z); a.mesh.material.color.setRGB(0.54*l, 0.42*l, 0.25*l); }
      if (!a.stuck) { a.vel.y -= 20*dt; a.pos.addScaledVector(a.vel, dt); a.mesh.position.copy(a.pos); a.mesh.lookAt(a.pos.clone().add(a.vel));
        if (a.player) { const hit = this.list.find(m => m.deadT<0 && Math.abs(a.pos.x-m.pos.x)<m.hw+0.1 && Math.abs(a.pos.z-m.pos.z)<m.hw+0.1 && a.pos.y>m.pos.y && a.pos.y<m.pos.y+m.h);
          if (hit) { this.hurt(hit, Math.max(2, Math.round(a.vel.length()/5)), a.pos.clone().sub(a.vel)); G.scene.remove(a.mesh); this.arrows.splice(i,1); continue; } }
        const pp = P.pos; if (!a.player && P.alive && Math.abs(a.pos.x-pp.x)<0.45 && Math.abs(a.pos.z-pp.z)<0.45 && a.pos.y>pp.y && a.pos.y<pp.y+1.8) { G.hurtPlayer(3, a.pos.clone().sub(a.vel)); G.scene.remove(a.mesh); this.arrows.splice(i,1); continue; }
        if (SOLID[W.getBlock(Math.floor(a.pos.x), Math.floor(a.pos.y), Math.floor(a.pos.z))]) a.stuck = true; }
      if (a.t > 6) { G.scene.remove(a.mesh); this.arrows.splice(i,1); } }
  }
  shoot(m) {
    const G = this.G, P = G.player;
    const from = new THREE.Vector3(m.pos.x, m.pos.y+1.5, m.pos.z); const to = new THREE.Vector3(P.pos.x, P.pos.y+1.3, P.pos.z);
    const dir = to.clone().sub(from); const dist = dir.length(); dir.normalize(); const v = dir.multiplyScalar(22); v.y += dist*0.45;
    v.x += (Math.random()-0.5)*1.5; v.z += (Math.random()-0.5)*1.5;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.05,0.05,0.6), new THREE.MeshBasicMaterial({color:0x8a6a40})); mesh.position.copy(from); G.scene.add(mesh);
    this.arrows.push({ pos: from, vel: v, mesh, t:0 }); G.sound.play('bow');
  }
  feed(m, id) {
    if (m.type === 'cow' && id === I.BUCKET) { this.G.sound.play('cow'); return 'milk'; }
    if (m.type === 'sheep' && id === I.SHEARS && !m.sheared) { m.sheared = true; m.regrow = 90; const body = m.model.g.children[0]; body.scale.set(0.82, 0.85, 0.92); body.material.forEach(mt => mt.map = makeTex('sheepskin',[205,175,160],0.1));
      const n = 1 + (Math.random()*3|0); this.G.spawnDrop(B.WOOL, n, m.pos.x, m.pos.y+1, m.pos.z); this.G.sound.play('sheep'); return 'tool'; }
    if (m.type === 'wolf') {
      if (id === I.BONE && !m.tamed) { if (Math.random() < 0.4) { m.tamed = true; m.angry = false; m.model.g.userData.collar.visible = true; this.G.particles(m.pos.x, m.pos.y+1, m.pos.z, null, 7, 0xff4070, true); this.G.sound.play('wolf'); } else this.G.particles(m.pos.x, m.pos.y+1, m.pos.z, null, 5, 0x777777, true); return true; }
      if (m.tamed && (id === I.BEEF || id === I.STEAK || id === I.PORK || id === I.COOKED_PORK || id === I.ROTTEN) && m.hp < m.d.hp) { m.hp = Math.min(m.d.hp, m.hp + 4); this.G.particles(m.pos.x, m.pos.y+1, m.pos.z, null, 4, 0xff4070, true); return true; }
      return false;
    }
    if (LURE[m.type] !== id || m.baby > 0 || m.love > 0 || m.breedCD > 0) return false;
    m.love = 25; this.G.particles(m.pos.x, m.pos.y+m.h, m.pos.z, null, 5, 0xff4070, true); this.G.sound.play(m.d.sound); return true;
  }
  playerShoot(from, vel) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.05,0.05,0.6), new THREE.MeshBasicMaterial({color:0x8a6a40})); mesh.position.copy(from); this.G.scene.add(mesh);
    this.arrows.push({ pos: from.clone(), vel, mesh, t:0, player:true }); this.G.sound.play('bow');
  }
  hurt(m, dmg, fromPos) {
    if (m.deadT >= 0) return; if (m.armorPts) dmg = Math.max(1, dmg - 1); m.hp -= dmg; m.hurtT = 0.35; this.setTint(m, 1.4, 0.4, 0.4); this.G.sound.play('mobhurt');
    if (fromPos) { const dx = m.pos.x - fromPos.x, dz = m.pos.z - fromPos.z; const l = Math.hypot(dx,dz)||1; m.vel.x = dx/l*7; m.vel.z = dz/l*7; m.vel.y = 5; }
    if (m.d.passive) { m.panic = 4; m.ai.t = 0; }
    if (m.type==='spider') m.angry = true;
    if (m.type==='wolf' && !m.tamed && fromPos) { m.angry = true; for (const o of this.list) if (o.type==='wolf' && !o.tamed && o.pos.distanceTo(m.pos) < 12) o.angry = true; }
    if (m.hp <= 0) { m.deadT = 0; this.G.sound.play('death'); }
  }
  raycast(origin, dir, maxD) {
    let best = null, bd = maxD;
    for (const m of this.list) { if (m.deadT>=0) continue;
      const min = [m.pos.x-m.hw, m.pos.y, m.pos.z-m.hw], max = [m.pos.x+m.hw, m.pos.y+m.h, m.pos.z+m.hw];
      let t0 = 0, t1 = bd; const o=[origin.x,origin.y,origin.z], d=[dir.x,dir.y,dir.z]; let ok = true;
      for (let a=0;a<3;a++){ if (Math.abs(d[a])<1e-9){ if(o[a]<min[a]||o[a]>max[a]){ok=false;break;} continue; } let ta=(min[a]-o[a])/d[a], tb=(max[a]-o[a])/d[a]; if(ta>tb){const t=ta;ta=tb;tb=t;} t0=Math.max(t0,ta); t1=Math.min(t1,tb); if(t0>t1){ok=false;break;} }
      if (ok && t0 < bd) { bd = t0; best = m; } }
    return best ? { mob: best, dist: bd } : null;
  }
}
