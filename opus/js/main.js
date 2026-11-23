import * as THREE from 'three';
import { animateLiquids } from './blocks.js';
import { B, I, BLOCKS, ITEMS, SOLID, OPAQUE, info, itemName, maxStack, SMELT, fuelValue, atlas, crackCanvases, iconURL, iconCanvas, blockTile, ALL_CREATIVE } from './blocks.js';
import { World, CS, CH, SEA, BIOME_NAMES } from './world.js';
import { Sound } from './audio.js';
import { Mobs } from './mobs.js';

const Q = new URLSearchParams(location.search);
if (Q.get('errors')) { const show = m => { const d=document.createElement('div'); d.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99;background:#a00;color:#fff;font:14px monospace;padding:4px'; d.textContent=m; document.body.appendChild(d); };
  addEventListener('error', e => show(e.message + ' @' + (e.filename||'').split('/').pop() + ':' + e.lineno)); addEventListener('unhandledrejection', e => show('rej ' + e.reason)); const ce = console.error; console.error = (...a) => { show(String(a.join(' ')).slice(0,300)); ce(...a); }; }
const AUTO = Q.get('autoplay') === '1';
const $ = id => document.getElementById(id);

// ---------- options ----------
const OPT = Object.assign({ render: 6, fov: 70, sens: 100, vol: 70 }, JSON.parse(localStorage.getItem('bh_opts') || '{}'));
if (AUTO || Q.get('rd')) OPT.render = +(Q.get('rd') || 4);
Sound.vol = OPT.vol/100;

// ---------- renderer ----------
THREE.ColorManagement.enabled = false;
const canvas = $('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(OPT.fov, 1, 0.05, 1200);
scene.add(camera);
function resize(){ const w=innerWidth,h=innerHeight; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

const atlasTex = new THREE.CanvasTexture(atlas); atlasTex.magFilter = THREE.NearestFilter; atlasTex.minFilter = THREE.NearestFilter; atlasTex.generateMipmaps = false; atlasTex.flipY = true;
const VS = `attribute vec3 lt; varying vec2 vUv; varying vec3 vLt; varying float vDist;
void main(){ vUv=uv; vLt=lt; vec4 mv=modelViewMatrix*vec4(position,1.0); vDist=length(mv.xyz); gl_Position=projectionMatrix*mv; }`;
const FS = `uniform sampler2D map; uniform float sun; uniform vec3 fogColor; uniform float fogNear; uniform float fogFar; uniform float isWater; uniform vec3 skyTint; uniform vec3 ambient;
varying vec2 vUv; varying vec3 vLt; varying float vDist;
void main(){ vec4 c=texture2D(map,vUv); if(isWater<0.5 && c.a<0.5) discard;
 float s=vLt.x*sun; float b=vLt.y;
 float sl=pow(0.83,(1.0-s)*15.0); float bl=pow(0.82,(1.0-b)*15.0);
 vec3 light=max(sl*skyTint, vec3(bl*1.05,bl*0.92,bl*0.75)); light=max(light,ambient);
 vec3 col=c.rgb*light*vLt.z;
 float f=smoothstep(fogNear,fogFar,vDist);
 gl_FragColor=vec4(mix(col,fogColor,f), isWater>0.5 ? c.a*0.92 : 1.0); }`;
const uniforms = { map:{value:atlasTex}, sun:{value:1}, fogColor:{value:new THREE.Color(0.6,0.75,1)}, fogNear:{value:50}, fogFar:{value:90}, isWater:{value:0}, skyTint:{value:new THREE.Vector3(1,1,1)}, ambient:{value:new THREE.Vector3(0.05,0.05,0.05)} };
const chunkMat = new THREE.ShaderMaterial({ uniforms, vertexShader:VS, fragmentShader:FS });
const waterMat = new THREE.ShaderMaterial({ uniforms: Object.assign({}, uniforms, { isWater:{value:1} }), vertexShader:VS, fragmentShader:FS, transparent:true, side: THREE.DoubleSide });

// ---------- sky ----------
function makeCanvasTex(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d')); const t=new THREE.CanvasTexture(c); t.magFilter=THREE.NearestFilter; t.minFilter=THREE.NearestFilter; return t; }
const sunTex = makeCanvasTex(32,32,x=>{ x.fillStyle='rgba(255,240,150,0.25)'; x.fillRect(0,0,32,32); x.fillStyle='#fff6c0'; x.fillRect(6,6,20,20); x.fillStyle='#ffffe8'; x.fillRect(9,9,14,14); });
const moonTex = makeCanvasTex(32,32,x=>{ x.fillStyle='#d8dce8'; x.fillRect(8,8,16,16); x.fillStyle='#aab0c0'; x.fillRect(11,11,4,4); x.fillRect(18,16,3,4); x.fillRect(13,19,3,2); });
const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map:sunTex, transparent:true, depthWrite:false, fog:false })); sun.scale.set(80,80,1);
const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map:moonTex, transparent:true, depthWrite:false, fog:false })); moon.scale.set(60,60,1);
scene.add(sun, moon);
const glowTex = makeCanvasTex(64,64,x=>{ const g=x.createRadialGradient(32,32,0,32,32,32); g.addColorStop(0,'rgba(255,150,60,0.95)'); g.addColorStop(0.45,'rgba(255,110,50,0.5)'); g.addColorStop(1,'rgba(255,90,40,0)'); x.fillStyle=g; x.fillRect(0,0,64,64); });
glowTex.magFilter = glowTex.minFilter = THREE.LinearFilter;
const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowTex, transparent:true, depthWrite:false, fog:false })); sunGlow.scale.set(900,380,1); scene.add(sunGlow);
const starGeo = new THREE.BufferGeometry(); { const p=[]; for(let i=0;i<1200;i++){ const v=new THREE.Vector3(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize().multiplyScalar(500); p.push(v.x,v.y,v.z);} starGeo.setAttribute('position',new THREE.Float32BufferAttribute(p,3)); }
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color:0xffffff, size:1.6, sizeAttenuation:false, transparent:true, depthWrite:false }));
scene.add(stars);
const cloudTex = (()=>{ const c=document.createElement('canvas'); c.width=c.height=64; const x=c.getContext('2d'); let s=7; const r=()=>(s=(s*16807)%2147483647)/2147483647;
  const g=[]; for(let i=0;i<64*64;i++) g.push(r()<0.47?1:0); for(let it=0;it<3;it++){ const n=g.slice(); for(let y=0;y<64;y++)for(let xx=0;xx<64;xx++){ let k=0; for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++) k+=g[((y+dy+64)%64)*64+((xx+dx+64)%64)]; n[y*64+xx]=k>=5?1:0; } g.splice(0,g.length,...n); }
  x.fillStyle='#fff'; for(let k=0;k<26;k++){ const cx=r()*64|0, cy=r()*64|0, w=3+r()*9|0, h=2+r()*6|0; for (let dx=0;dx<w;dx++) for (let dy=0;dy<h;dy++) x.fillRect((cx+dx)%64,(cy+dy)%64,1,1); if (r()<0.6) for (let dx=1;dx<w-1;dx++) x.fillRect((cx+dx)%64,(cy+h)%64,1,1); } const t=new THREE.CanvasTexture(c); t.magFilter=THREE.NearestFilter; t.minFilter=THREE.NearestFilter; t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; })();
cloudTex.repeat.set(1400/768, 1400/768);
const cloudMat = new THREE.MeshBasicMaterial({ map:cloudTex, transparent:true, opacity:0.8, depthWrite:false, side:THREE.DoubleSide, alphaTest:0.3 });
cloudMat.uniforms = { off:{value:new THREE.Vector2()}, col:{value:cloudMat.color}, far:{value:0} };
const clouds = new THREE.Group(); scene.add(clouds);
const cloudMat3 = new THREE.MeshBasicMaterial({ vertexColors:true, transparent:true, opacity:0.85 });
{ const img = cloudTex.image.getContext('2d').getImageData(0,0,64,64).data; const filled=(i,j)=>img[(((j+64)%64)*64+((i+64)%64))*4+3]>128;
  const pos=[], col=[], idx=[]; const S=12, H=4;
  const quad=(a,b,c,d,sh)=>{ const base=pos.length/3; pos.push(...a,...b,...c,...d); for(let k=0;k<4;k++) col.push(sh,sh,sh); idx.push(base,base+1,base+2,base,base+2,base+3); };
  for (let j=0;j<64;j++) for (let i=0;i<64;i++) { if (!filled(i,j)) continue; const x0=i*S, x1=x0+S, z0=j*S, z1=z0+S;
    quad([x0,H,z1],[x1,H,z1],[x1,H,z0],[x0,H,z0],1.0); quad([x0,0,z0],[x1,0,z0],[x1,0,z1],[x0,0,z1],0.72);
    if (!filled(i+1,j)) quad([x1,0,z1],[x1,0,z0],[x1,H,z0],[x1,H,z1],0.86); if (!filled(i-1,j)) quad([x0,0,z0],[x0,0,z1],[x0,H,z1],[x0,H,z0],0.86);
    if (!filled(i,j+1)) quad([x0,0,z1],[x1,0,z1],[x1,H,z1],[x0,H,z1],0.92); if (!filled(i,j-1)) quad([x1,0,z0],[x0,0,z0],[x0,H,z0],[x1,H,z0],0.92); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col,3)); g.setIndex(idx); g.computeBoundingSphere();
  for (let a=0;a<3;a++) for (let b=0;b<3;b++) { const m = new THREE.Mesh(g, cloudMat3); m.position.set(a*768, 0, b*768); clouds.add(m); } }

// weather
const RAIN_N = 1800;
const rainGeo = new THREE.BufferGeometry(); const rainPos = new Float32Array(RAIN_N*6); rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos,3));
const rainMat = new THREE.LineBasicMaterial({ color:0x9fb4d8, transparent:true, opacity:0.55, depthWrite:false });
const rain = new THREE.LineSegments(rainGeo, rainMat); rain.frustumCulled = false; scene.add(rain); rain.visible = false;
const rainSeed = []; for (let i=0;i<RAIN_N;i++) rainSeed.push([Math.random()*48-24, Math.random()*36, Math.random()*48-24, 0.8+Math.random()*0.4]);
let weather = { raining:false, t: 300 + Math.random()*400, amt:0, snd:0 };
const bolt = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color:0xe8eeff, transparent:true, opacity:0.9, side:THREE.DoubleSide, depthWrite:false }));
bolt.visible = false; bolt.frustumCulled = false; scene.add(bolt);
function strikeLightning(cp, fixedA) {
  const a = fixedA ?? Math.random()*6.28, d = fixedA !== undefined ? 30 : 20 + Math.random()*50; const x = cp.x + Math.cos(a)*d, z = cp.z + Math.sin(a)*d;
  let y = 120; while (y > 1 && !SOLID[world.getBlock(Math.floor(x),y,Math.floor(z))] && !BLOCKS[world.getBlock(Math.floor(x),y,Math.floor(z))].liquid) y--;
  const pts = []; let px = x, pz = z; for (let yy = 140; yy > y+1; yy -= 6) { const nx = px + (Math.random()-0.5)*3, nz = pz + (Math.random()-0.5)*3; const w = 0.35;
    pts.push(px-w,yy,pz, px+w,yy,pz, nx+w,yy-6,nz, px-w,yy,pz, nx+w,yy-6,nz, nx-w,yy-6,nz); px = nx; pz = nz; }
  bolt.geometry.dispose(); bolt.geometry = new THREE.BufferGeometry(); bolt.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts,3));
  bolt.visible = true; bolt.userData.t = 0.25; weather.flash = 0.3;
  const dist = Math.hypot(x-cp.x, z-cp.z); setTimeout(() => { Sound.noise(2.5, 'lowpass', 400, 0.7, Math.max(0.15, 0.9 - dist/120), 0, 40); Sound.tone('sine', 60, 30, 2, 0.3); }, dist * 12);
  if (world.getBlock(Math.floor(x),y+1,Math.floor(z))===B.AIR && Math.random() < 0.3) particles(x, y+1, z, null, 15, 0xffcc40, true);
  for (const m of mobs.list) if (Math.hypot(m.pos.x-x, m.pos.z-z) < 3) mobs.hurt(m, 5, new THREE.Vector3(x,y,z));
  if (Math.hypot(P.pos.x-x, P.pos.z-z) < 3) hurtPlayer(5, new THREE.Vector3(x,y,z), 'was struck by lightning');
}
function updateWeather(dt) {
  if (weather.flash > 0) weather.flash -= dt;
  if (bolt.visible) { bolt.userData.t -= dt; if (bolt.userData.t <= 0) bolt.visible = false; }
  weather.t -= dt; if (weather.t <= 0) { weather.storm = !weather.raining && Math.random() < 0.4; weather.raining = !weather.raining; weather.t = weather.raining ? 120+Math.random()*240 : 300+Math.random()*600; }
  weather.amt += ((weather.raining?1:0) - weather.amt) * Math.min(1, dt*0.3);
  const cp = camera.getWorldPosition(new THREE.Vector3());
  const c = world.col(Math.floor(cp.x), Math.floor(cp.z)); const snow = c.biome===3 || c.biome===13 || (c.biome===6 && c.h>90); const dry = c.biome===2 || world.dim==='nether';
  const covered = world.getSky(Math.floor(cp.x), Math.floor(cp.y), Math.floor(cp.z)) < 12;
  rain.visible = weather.amt > 0.05 && !dry && !covered && !titleMode;
  if (!rain.visible) return;
  rainMat.color.setHex(snow ? 0xffffff : 0x9fb4d8); rainMat.opacity = (snow?1:0.65)*weather.amt;
  const t = performance.now()/1000; const speed = snow ? 3 : 22, len = snow ? 0.22 : 0.9;
  for (let i=0;i<RAIN_N;i++) { const s = rainSeed[i]; let y = ((s[1] - t*speed*s[3]) % 36 + 36) % 36 - 18;
    const x = cp.x + s[0] + (snow? Math.sin(t+i)*0.5:0), z = cp.z + s[2], yy = cp.y + y; const j=i*6;
    rainPos[j]=x; rainPos[j+1]=yy; rainPos[j+2]=z; rainPos[j+3]=x+(snow?0.22:0); rainPos[j+4]=yy+len; rainPos[j+5]=z; }
  rainGeo.attributes.position.needsUpdate = true;
  // thunderstorms: occasional lightning bolt, sky flash and thunder
  if (!snow && weather.amt > 0.8 && weather.storm) { weather.boltT = (weather.boltT ?? 6) - dt; if (weather.boltT <= 0) { weather.boltT = 6 + Math.random()*14; strikeLightning(cp); } }
  if (!snow && P.alive) { weather.snd -= dt; if (weather.snd <= 0) { weather.snd = 0.35; Sound.noise(0.5, 'highpass', 2500 + Math.random()*1500, 0.4, 0.05*weather.amt); } }
}
// selection + crack
const selBox = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.004,1.004,1.004)), new THREE.LineBasicMaterial({ color:0x000000, transparent:true, opacity:0.55 }));
scene.add(selBox); selBox.visible = false;
const crackTex = crackCanvases.map(c=>{ const t=new THREE.CanvasTexture(c); t.magFilter=t.minFilter=THREE.NearestFilter; return t; });
const crackMesh = new THREE.Mesh(new THREE.BoxGeometry(1.006,1.006,1.006), new THREE.MeshBasicMaterial({ map:crackTex[0], transparent:true, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-1 }));
scene.add(crackMesh); crackMesh.visible=false;

// ---------- game state ----------
let world = null, mobs = null;
const chunkMeshes = new Map();
const P = { pos:new THREE.Vector3(0,80,0), vel:new THREE.Vector3(), yaw:0, pitch:0, hw:0.3, h:1.8, onGround:false, health:20, food:20, sat:5, exh:0, air:300,
  inv:new Array(36).fill(null), armor:[null,null,null,null], sel:0, mode:'survival', flying:false, sneak:false, sprint:false, fallStart:null, hurtT:0, alive:true, spawn:null, regenT:0, starveT:0, drownT:0, lavaT:0, walkDist:0, stepDist:0, inWater:false, swing:0, eatT:0 };
let state = 'title'; // title, loading, play, pause, inv, dead
let timeOfDay = 0.05, worldId = null, worldName = '', view = 0, debug = false;
const drops = [], parts = [], fallingBlocks = [];
const keys = {};
let mouseL = false, mouseR = false, breakT = 0, breakTarget = null, placeCD = 0, lastWTap = 0, lastSpaceTap = 0;
let locked = false;

const G = {
  get world(){ return world; }, scene, player:P, sound:Sound, get peaceful(){ return state!=='play' && state!=='inv' && !AUTO; },
  heldId: () => (P.inv[P.sel] ? P.inv[P.sel].id : 0),
  spawnXP: (x,y,z,n) => spawnXP(x,y,z,n),
  daylight, physics, hurtPlayer, spawnDrop, particles, explode, brightnessAt, canSee,
};

function daylight(){ const a = timeOfDay*Math.PI*2; return Math.max(0, Math.min(1, Math.sin(a)*2.2 + 0.35)); }
function lightCurve(l){ return Math.max(0.05, Math.pow(0.8, (1-l)*15)); }
function brightnessAt(x,y,z){ const fx=Math.floor(x), fy=Math.floor(y), fz=Math.floor(z); const s=world.getSky(fx,fy,fz)/15*uniforms.sun.value, b=world.getBl(fx,fy,fz)/15; return Math.max(lightCurve(s), lightCurve(b)); }

// ---------- physics ----------
function solidAt(x,y,z){ return SOLID[world.getBlock(x,y,z)]; }
function physics(e, dt) {
  const res = { hitH:false };
  const W = world;
  // liquid check
  const id = W.getBlock(Math.floor(e.pos.x), Math.floor(e.pos.y+0.3), Math.floor(e.pos.z));
  e.inWater = id===B.WATER; e.inLava = id===B.LAVA;
  if (!e.flying) {
    if (e.inWater || e.inLava) { e.vel.y -= 9*dt; e.vel.y *= Math.pow(0.1, dt); e.vel.x *= Math.pow(0.15,dt); e.vel.z *= Math.pow(0.15,dt); }
    else e.vel.y -= 30*dt;
    if (e.vel.y < -60) e.vel.y = -60;
  }
  const steps = Math.ceil(Math.max(Math.abs(e.vel.x),Math.abs(e.vel.y),Math.abs(e.vel.z))*dt/0.4) || 1;
  const sdt = dt/steps; const wasGround = e.onGround; e.onGround = false;
  for (let s=0;s<steps;s++) for (const ax of [1,0,2]) {
    const d = (ax===0?e.vel.x:ax===1?e.vel.y:e.vel.z)*sdt; if (!d) continue;
    const p = e.pos; const old = ax===0?p.x:ax===1?p.y:p.z;
    if (ax===0) p.x += d; else if (ax===1) p.y += d; else p.z += d;
    // sneak edge guard
    if (e.sneak && wasGround && ax!==1 && !e.flying) { if (!groundUnder(e)) { if (ax===0) p.x = old; else p.z = old; if(ax===0) e.vel.x=0; else e.vel.z=0; continue; } }
    const x0=Math.floor(p.x-e.hw), x1=Math.floor(p.x+e.hw-1e-6), y0=Math.floor(p.y), y1=Math.floor(p.y+e.h-1e-6), z0=Math.floor(p.z-e.hw), z1=Math.floor(p.z+e.hw-1e-6);
    let hit = false, stepTop = -1; const moved = ax===0 ? p.x : ax===1 ? p.y : p.z;
    for (let y=y0;y<=y1;y++) for (let z=z0;z<=z1;z++) for (let x=x0;x<=x1;x++) {
      const b = W.getBlock(x,y,z); if (!SOLID[b]) continue;
      const hg = BLOCKS[b].hgt || 1; if (hg < 1 && p.y >= y + hg - 1e-4) continue;
      hit = true; stepTop = Math.max(stepTop, y + hg);
      if (ax===0) p.x = d>0 ? Math.min(p.x, x - e.hw - 1e-4) : Math.max(p.x, x+1+e.hw+1e-4);
      else if (ax===1) { p.y = d>0 ? Math.min(p.y, y - e.h - 1e-4) : Math.max(p.y, y+hg+1e-5); }
      else p.z = d>0 ? Math.min(p.z, z - e.hw - 1e-4) : Math.max(p.z, z+1+e.hw+1e-4);
    }
    // step up onto half-height blocks (slabs) like the real game
    if (hit && ax!==1 && wasGround && !e.flying && stepTop - p.y > 0 && stepTop - p.y <= 0.55) {
      const sx = ax===0 ? moved : p.x, sz = ax===2 ? moved : p.z, sy = stepTop + 1e-4; let free = true;
      for (let y=Math.floor(sy); y<=Math.floor(sy+e.h-1e-6) && free; y++) for (let z=Math.floor(sz-e.hw); z<=Math.floor(sz+e.hw-1e-6) && free; z++) for (let x=Math.floor(sx-e.hw); x<=Math.floor(sx+e.hw-1e-6); x++) { const b=W.getBlock(x,y,z); if (SOLID[b] && !((BLOCKS[b].hgt||1) < 1 && sy >= y+(BLOCKS[b].hgt||1)-1e-4)) { free=false; break; } }
      if (free) { p.x = sx; p.z = sz; p.y = sy; hit = false; }
    }
    if (hit) { if (ax===1) { if (d<0) e.onGround = true; e.vel.y = 0; } else { res.hitH = true; if (ax===0) e.vel.x=0; else e.vel.z=0; } }
  }
  if (!e.onGround && e.vel.y===0 && groundUnder(e)) e.onGround = true;
  return res;
}
function groundUnder(e){ const y=Math.floor(e.pos.y-0.05); for (const [dx,dz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) if (solidAt(Math.floor(e.pos.x+dx*e.hw*0.98), y, Math.floor(e.pos.z+dz*e.hw*0.98))) return true; return false; }

// ---------- raycast ----------
function raycast(o, d, maxD, solidOnly) {
  let x=Math.floor(o.x), y=Math.floor(o.y), z=Math.floor(o.z);
  const sx=Math.sign(d.x), sy=Math.sign(d.y), sz=Math.sign(d.z);
  const tdx=Math.abs(1/d.x), tdy=Math.abs(1/d.y), tdz=Math.abs(1/d.z);
  let tx = d.x>0 ? (x+1-o.x)*tdx : (o.x-x)*tdx, ty = d.y>0 ? (y+1-o.y)*tdy : (o.y-y)*tdy, tz = d.z>0 ? (z+1-o.z)*tdz : (o.z-z)*tdz;
  let n=[0,0,0], t=0;
  for (let i=0;i<200 && t<=maxD;i++) {
    const id = world.getBlock(x,y,z);
    if (id && BLOCKS[id].target && (!solidOnly || SOLID[id])) return { x,y,z,id,n,dist:t };
    if (tx<ty && tx<tz) { x+=sx; t=tx; tx+=tdx; n=[-sx,0,0]; } else if (ty<tz) { y+=sy; t=ty; ty+=tdy; n=[0,-sy,0]; } else { z+=sz; t=tz; tz+=tdz; n=[0,0,-sz]; }
  }
  return null;
}
function raycastFluid(o, d, maxD) {
  for (let t=0; t<=maxD; t+=0.05) { const x=Math.floor(o.x+d.x*t), y=Math.floor(o.y+d.y*t), z=Math.floor(o.z+d.z*t); const id = world.getBlock(x,y,z);
    if (BLOCKS[id].liquid && world.getMeta(x,y,z)===0) return { x,y,z,id }; if (id && BLOCKS[id].target && SOLID[id]) return null; }
  return null;
}
function canSee(x,y,z){ const o=new THREE.Vector3(x,y,z); const t=P.pos.clone(); t.y+=1.5; const d=t.clone().sub(o); const l=d.length(); d.normalize(); const h=raycast(o,d,l); return !h || !OPAQUE[h.id]; }

// ---------- inventory helpers ----------
function addItem(id, count, dur) {
  const ms = maxStack(id);
  for (const order of [[0,9],[9,36]]) for (let i=order[0];i<order[1];i++) { const s=P.inv[i]; if (s && s.id===id && s.count<ms && dur===undefined) { const a=Math.min(ms-s.count,count); s.count+=a; count-=a; if(!count){ refreshHUD(); return 0; } } }
  for (const order of [[0,9],[9,36]]) for (let i=order[0];i<order[1];i++) if (!P.inv[i]) { const a=Math.min(ms,count); P.inv[i]={id,count:a}; if (ITEMS[id] && ITEMS[id].dur) P.inv[i].dur = dur!==undefined?dur:ITEMS[id].dur; count-=a; if(!count){ refreshHUD(); return 0; } }
  refreshHUD(); return count;
}
function held(){ return P.inv[P.sel]; }

// ---------- drops & particles ----------
const tileTexCache = {}; function tileTex(t){ if(tileTexCache[t]) return tileTexCache[t]; const c=document.createElement('canvas'); c.width=c.height=16; c.getContext('2d').drawImage(atlas,(t%16)*16,Math.floor(t/16)*16,16,16,0,0,16,16); const tx=new THREE.CanvasTexture(c); tx.magFilter=tx.minFilter=THREE.NearestFilter; return tileTexCache[t]=tx; }
const itemTexCache = {}; function itemTex(id){ if(itemTexCache[id]) return itemTexCache[id]; const t=new THREE.CanvasTexture(iconCanvas(id)); t.magFilter=t.minFilter=THREE.NearestFilter; return itemTexCache[id]=t; }
function makeItemMesh(id, size) {
  if (id < 256 && (BLOCKS[id].render==='cube' || BLOCKS[id].render==='cactus' || BLOCKS[id].render==='bed' || BLOCKS[id].render==='slab' || BLOCKS[id].render==='stairs' || BLOCKS[id].liquid)) {
    const mats = [0,1,2,3,4,5].map(f=>new THREE.MeshBasicMaterial({ map:tileTex(blockTile(id,f,4)), transparent: !OPAQUE[id], alphaTest:0.5 }));
    return new THREE.Mesh(new THREE.BoxGeometry(size,size,size), mats);
  }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size*1.6,size*1.6), new THREE.MeshBasicMaterial({ map:itemTex(id), transparent:true, alphaTest:0.5, side:THREE.DoubleSide }));
  return m;
}
function spawnDrop(id, count, x, y, z, vel) {
  if (!id) return; const mesh = makeItemMesh(id, 0.25); scene.add(mesh);
  const d = { id, count, pos:new THREE.Vector3(x,y,z), vel: vel || new THREE.Vector3((Math.random()-0.5)*3, 4, (Math.random()-0.5)*3), hw:0.12, h:0.25, mesh, t:0, delay: vel?1.2:0.4, onGround:false };
  if (typeof count === 'object') { d.count = 1; d.dur = count.dur; }
  drops.push(d);
}
function particles(x,y,z,id,n=8,color,up) {
  for (let i=0;i<n;i++) {
    const mat = id ? new THREE.SpriteMaterial({ map: tileTex(blockTile(id,4,4)) }) : new THREE.SpriteMaterial({ color });
    const s = new THREE.Sprite(mat); const sc = 0.08+Math.random()*0.08; s.scale.set(sc,sc,sc);
    s.position.set(x+(Math.random()-0.5)*0.8, y+(Math.random()-0.5)*0.8, z+(Math.random()-0.5)*0.8); scene.add(s);
    if (id) { const l = brightnessAt(x,y+0.5,z); mat.color.setRGB(l,l,l); mat.map = mat.map.clone(); mat.map.repeat.set(0.25,0.25); mat.map.offset.set(Math.random()*0.75, Math.random()*0.75); mat.map.needsUpdate=true; }
    parts.push({ s, vel:new THREE.Vector3((Math.random()-0.5)*4, up?2:Math.random()*4, (Math.random()-0.5)*4), t: 0.5+Math.random()*0.5, grav: up?-2:18 });
  }
}
// ---------- experience ----------
const orbs = [];
const orbTex = makeCanvasTex(16,16,x=>{ x.fillStyle='#3a6a10'; x.fillRect(4,4,8,8); x.fillStyle='#b8ff40'; x.fillRect(5,5,6,6); x.fillStyle='#f0ff90'; x.fillRect(6,6,2,2); });
function spawnXP(x,y,z,n) { while (n > 0) { const v = Math.min(n, 3); n -= v; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map:orbTex, transparent:true })); s.scale.set(0.25,0.25,0.25); scene.add(s);
  orbs.push({ s, v, pos:new THREE.Vector3(x+(Math.random()-0.5)*0.5, y, z+(Math.random()-0.5)*0.5), vel:new THREE.Vector3((Math.random()-0.5)*3, 4, (Math.random()-0.5)*3), hw:0.1, h:0.2, t:0 }); } }
function xpNeeded(l){ return l < 16 ? 2*l+7 : l < 31 ? 5*l-38 : 9*l-158; }
function addXP(v) { P.xp = (P.xp||0) + v; P.xpLevel = P.xpLevel||0; while (P.xp >= xpNeeded(P.xpLevel)) { P.xp -= xpNeeded(P.xpLevel); P.xpLevel++; if (P.xpLevel % 5 === 0) Sound.play('levelup'); else Sound.tone('sine', 660, 990, 0.4, 0.15); } refreshXP(); }
function refreshXP() { $('xpbar').style.display = P.mode==='survival' ? 'block' : 'none'; $('xpfill').style.width = ((P.xp||0)/xpNeeded(P.xpLevel||0)*100)+'%'; $('xplvl').textContent = P.xpLevel ? P.xpLevel : ''; }
function updateOrbs(dt) {
  for (let i=orbs.length-1;i>=0;i--) { const o = orbs[i]; o.t += dt; const dx=P.pos.x-o.pos.x, dy=P.pos.y+0.8-o.pos.y, dz=P.pos.z-o.pos.z, d=Math.hypot(dx,dy,dz);
    if (P.alive && o.t > 0.5 && d < 6) { o.pos.x += dx/d*dt*8; o.pos.y += dy/d*dt*8; o.pos.z += dz/d*dt*8; if (d < 0.8) { addXP(o.v); Sound.tone('sine', 1200+Math.random()*600, 1600, 0.08, 0.08); scene.remove(o.s); orbs.splice(i,1); continue; } }
    else physics(o, dt);
    o.s.position.set(o.pos.x, o.pos.y+0.15+Math.sin(o.t*4)*0.04, o.pos.z); const p = 0.7+0.3*Math.sin(o.t*6); o.s.material.color.setRGB(p,1,p*0.6);
    if (o.t > 300) { scene.remove(o.s); orbs.splice(i,1); } }
}
function particlesAt(x,y,z,color,life) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ color })); const sc = 0.06+Math.random()*0.04; s.scale.set(sc,sc,sc); s.position.set(x+(Math.random()-0.5)*0.06, y, z+(Math.random()-0.5)*0.06); scene.add(s);
  parts.push({ s, vel:new THREE.Vector3((Math.random()-0.5)*0.1, 0.5+Math.random()*0.3, (Math.random()-0.5)*0.1), t: life, grav: 0 });
}
function updateDrops(dt) {
  for (let i=drops.length-1;i>=0;i--) { const d = drops[i]; d.t += dt; d.delay -= dt;
    const dx=P.pos.x-d.pos.x, dy=(P.pos.y+0.8)-d.pos.y, dz=P.pos.z-d.pos.z; const dist=Math.hypot(dx,dy,dz);
    if (P.alive && d.delay<=0 && dist < 1.8) { d.pos.x += dx*dt*10; d.pos.y += dy*dt*10; d.pos.z += dz*dt*10;
      if (dist < 0.6) { const left = d.dur!==undefined ? addItem(d.id,1,d.dur) : addItem(d.id, d.count); if (left===0) { scene.remove(d.mesh); drops.splice(i,1); Sound.play('pop'); continue; } else d.count = left; } }
    else physics(d, dt);
    if (d.onGround) { d.vel.x *= 0.85; d.vel.z *= 0.85; }
    d.mesh.position.set(d.pos.x, d.pos.y + 0.15 + Math.sin(d.t*2.5)*0.06, d.pos.z); d.mesh.rotation.y = d.t*1.5;
    const l = brightnessAt(d.pos.x,d.pos.y+0.2,d.pos.z); (Array.isArray(d.mesh.material)?d.mesh.material:[d.mesh.material]).forEach(m=>m.color.setRGB(l,l,l));
    if (d.t > 300) { scene.remove(d.mesh); drops.splice(i,1); }
  }
  for (let i=parts.length-1;i>=0;i--) { const p=parts[i]; p.t-=dt; p.vel.y -= p.grav*dt; p.s.position.addScaledVector(p.vel, dt); if (p.t<=0) { scene.remove(p.s); if (p.s.material.map && p.s.material.map !== tileTexCache[p.s.material.map.userData.k]) p.s.material.map.dispose(); p.s.material.dispose(); parts.splice(i,1); } }
  for (let i=fallingBlocks.length-1;i>=0;i--) { const f=fallingBlocks[i]; physics(f, dt); f.mesh.position.set(f.pos.x, f.pos.y+0.5, f.pos.z);
    if (f.onGround || f.t++>600) { const x=Math.floor(f.pos.x), y=Math.floor(f.pos.y+0.1), z=Math.floor(f.pos.z); scene.remove(f.mesh); fallingBlocks.splice(i,1);
      if (BLOCKS[world.getBlock(x,y,z)].replace) world.setBlock(x,y,z,f.id); else spawnDrop(f.id,1,x+0.5,y+0.5,z+0.5); } }
}

// ---------- damage & survival ----------
const overlay = $('overlay');
function hurtPlayer(dmg, from, cause) {
  if (P.mode !== 'survival' || !P.alive || P.hurtT > 0) return;
  if (!/fell|drown|starv|out of the world/.test(cause||'')) { const pts = armorPoints(); if (pts) { dmg = Math.max(1, Math.round(dmg * (1 - Math.min(20, pts) * 0.04))); P.armor.forEach((a,i)=>{ if (a) { a.dur = (a.dur ?? ITEMS[a.id].dur) - 1; if (a.dur <= 0) { P.armor[i] = null; Sound.mat('wood','break'); } } }); } }
  P.health -= dmg; P.hurtT = 0.5; Sound.play('hurt'); P.lastCause = cause || (from ? 'was slain' : 'died');
  if (from) { const dx=P.pos.x-from.x, dz=P.pos.z-from.z; const l=Math.hypot(dx,dz)||1; P.vel.x += dx/l*6; P.vel.z += dz/l*6; P.vel.y = Math.max(P.vel.y, 5); }
  P.exh += 0.1;
  if (P.health <= 0) die();
  refreshHUD();
}
function armorPoints(){ return (P.armor||[]).reduce((s,a)=> s + (a && ITEMS[a.id] ? ITEMS[a.id].pts + (a.ench||0) : 0), 0); }
function die() {
  (P.armor||[]).forEach((a,i)=>{ if (a) { spawnDrop(a.id, {dur:a.dur}, P.pos.x, P.pos.y+1, P.pos.z); P.armor[i]=null; } });
  P.health = 0; P.alive = false; Sound.play('death');
  let totalXP = P.xp||0; for (let l=0;l<(P.xpLevel||0);l++) totalXP += xpNeeded(l); P.score = totalXP;
  const lostXP = Math.min(100, (P.xpLevel||0)*7); if (lostXP) spawnXP(P.pos.x, P.pos.y+1, P.pos.z, lostXP); P.xp = 0; P.xpLevel = 0;
  $('deathmsg').dataset.score = '';
  for (let i=0;i<36;i++) if (P.inv[i]) { spawnDrop(P.inv[i].id, P.inv[i].dur!==undefined ? {dur:P.inv[i].dur} : P.inv[i].count, P.pos.x, P.pos.y+1, P.pos.z); P.inv[i]=null; }
  $('deathmsg').innerHTML = 'Player ' + (P.lastCause || 'died') + `<br><span style="font-size:24px">Score: <span style="color:#ffff55">${P.score||0}</span></span>`; refreshHUD();
  setState('dead');
}
function respawn() {
  P.health=20; P.food=20; P.sat=5; P.air=300; P.alive=true; P.vel.set(0,0,0); P.fallStart=null;
  if (world.dim === 'nether' && worlds.over) { for (const k of [...chunkMeshes.keys()]) removeChunkMesh(k); mobs.clear(); world = worlds.over; for (const ch of world.chunks.values()) ch.dirty = true; }
  P.pos.copy(P.spawn); P.needSpawn = true; for (const m of mobs.list) { if (m.d.hostile && m.pos.distanceTo(P.pos) < 24) { scene.remove(m.model.g); m.deadT = 99; } } mobs.list = mobs.list.filter(m=>m.deadT!==99);
  setState('loading'); refreshHUD();
}
function explode(x,y,z,r) {
  Sound.play('explode'); particles(x,y,z,null,30,0x888888,true);
  for (let dx=-r;dx<=r;dx++) for (let dy=-r;dy<=r;dy++) for (let dz=-r;dz<=r;dz++) { if (dx*dx+dy*dy+dz*dz > r*r+Math.random()*2) continue;
    const bx=Math.floor(x+dx), by=Math.floor(y+dy), bz=Math.floor(z+dz); const id=world.getBlock(bx,by,bz); if (!id || id===B.BEDROCK || BLOCKS[id].liquid || id===B.OBSIDIAN) continue;
    world.setBlock(bx,by,bz,B.AIR,0,true); if (Math.random()<0.3) { const d=BLOCKS[id].drop; if (d) spawnDrop(d,1,bx+0.5,by+0.5,bz+0.5); } }
  world.relightAround(Math.floor(x)>>4, Math.floor(z)>>4);
  for (const cx2 of [-1,0,1]) for (const cz2 of [-1,0,1]) { const ch = world.getChunk((Math.floor(x)>>4)+cx2, (Math.floor(z)>>4)+cz2); if (ch) ch.dirty = true; }
  // big smoke puff and a white flash
  particles(x,y,z,null,25,0xeeeeee,true); particles(x,y,z,null,15,0x333333,true); weather.flash = Math.max(weather.flash||0, 0.15);
  const dist = P.pos.distanceTo(new THREE.Vector3(x,y,z));
  if (dist < r*2.2) { hurtPlayer(Math.round((1-dist/(r*2.2))*22), new THREE.Vector3(x,y,z), 'blew up'); const k = (1-dist/(r*2.2))*14; const dx2 = P.pos.x-x, dz2 = P.pos.z-z, l = Math.hypot(dx2,dz2)||1; P.vel.x += dx2/l*k; P.vel.z += dz2/l*k; P.vel.y += k*0.6; }
  if (dist < 24) P.shake = Math.max(P.shake||0, (1 - dist/24) * 0.6);
  for (const m of mobs.list) { const dd=m.pos.distanceTo(new THREE.Vector3(x,y,z)); if (dd<r*2) mobs.hurt(m, Math.round((1-dd/(r*2))*15), new THREE.Vector3(x,y,z)); }
}

// ---------- chunk management ----------
let genQueue = [];
function updateChunks(budgetMs) {
  const t0 = performance.now();
  const pcx = Math.floor(P.pos.x/16), pcz = Math.floor(P.pos.z/16); const R = OPT.render;
  // generate missing within R+1
  const need = [];
  for (let dz=-R-2; dz<=R+2; dz++) for (let dx=-R-2; dx<=R+2; dx++) { if (dx*dx+dz*dz > (R+2)*(R+2)) continue; const cx=pcx+dx, cz=pcz+dz; if (!world.chunks.has(cx+','+cz)) need.push([dx*dx+dz*dz,cx,cz]); }
  need.sort((a,b)=>a[0]-b[0]);
  for (const [,cx,cz] of need) { world.generate(cx,cz); if (performance.now()-t0 > budgetMs*0.5) break; }
  // mesh
  const cand = [];
  for (const ch of world.chunks.values()) {
    const dx=ch.cx-pcx, dz=ch.cz-pcz; const d2 = dx*dx+dz*dz;
    if (d2 > (R+0.5)*(R+0.5)) continue;
    if (!ch.dirty && !ch.relightSoon) continue;
    let ok = true; for (let a=-1;a<=1&&ok;a++) for (let b=-1;b<=1;b++) if (!world.chunks.has((ch.cx+a)+','+(ch.cz+b))) { ok=false; break; }
    if (ok) cand.push([d2, ch]);
  }
  cand.sort((a,b)=>a[0]-b[0]);
  for (const [,ch] of cand) {
    if (performance.now()-t0 > budgetMs) break;
    for (let a=-1;a<=1;a++) for (let b=-1;b<=1;b++) { const n = world.chunks.get((ch.cx+a)+','+(ch.cz+b)); if (n && !n.lit) world.light(n); }
    if (ch.relightSoon) { ch.relightSoon=false; world.relightAround(ch.cx, ch.cz); }
    buildChunkMesh(ch);
  }
  // unload far
  for (const [k,ch] of world.chunks) { const dx=ch.cx-pcx, dz=ch.cz-pcz; if (dx*dx+dz*dz > (R+4)*(R+4)) { removeChunkMesh(k); if (ch.modified) world.saved[k] = { b: ch.b, m: ch.m }; world.chunks.delete(k); } }
  for (const [k,o] of chunkMeshes) { const ch=world.chunks.get(k); if (ch) { const dx=ch.cx-pcx, dz=ch.cz-pcz; const vis = dx*dx+dz*dz <= (R+0.5)*(R+0.5); if (o.o) o.o.visible=vis; if (o.w) o.w.visible=vis; } }
}
function buildChunkMesh(ch) {
  const k = ch.cx+','+ch.cz; removeChunkMesh(k);
  const g = world.buildMesh(ch); const o = {};
  if (g.opaque) { o.o = new THREE.Mesh(g.opaque, chunkMat); scene.add(o.o); }
  if (g.water) { o.w = new THREE.Mesh(g.water, waterMat); o.w.renderOrder = 1; scene.add(o.w); }
  chunkMeshes.set(k, o); ch.dirty = false;
}
function rebuildNow(x,z){ const ch = world.getChunk(x>>4, z>>4); if (ch && chunkMeshes.has(ch.cx+','+ch.cz)) buildChunkMesh(ch); }
function removeChunkMesh(k){ const o = chunkMeshes.get(k); if (!o) return; if (o.o){ scene.remove(o.o); o.o.geometry.dispose(); } if (o.w){ scene.remove(o.w); o.w.geometry.dispose(); } chunkMeshes.delete(k); }
function clearWorld(){ for (const k of [...chunkMeshes.keys()]) removeChunkMesh(k); if (mobs) mobs.clear(); for (const d of drops) scene.remove(d.mesh); drops.length=0; for (const p of parts) scene.remove(p.s); parts.length=0; for (const o of orbs) scene.remove(o.s); orbs.length=0; }

// ---------- saving ----------
function rle(arr){ const out=[]; let i=0; while(i<arr.length){ const v=arr[i]; let n=1; while(i+n<arr.length && arr[i+n]===v && n<255) n++; out.push(v,n); i+=n; } let s=''; for (let j=0;j<out.length;j+=8192) s+=String.fromCharCode.apply(null,out.slice(j,j+8192)); return btoa(s); }
function unrle(str, len){ const s=atob(str); const a=new Uint8Array(len); let p=0; for (let i=0;i<s.length;i+=2){ const v=s.charCodeAt(i), n=s.charCodeAt(i+1); a.fill(v,p,p+n); p+=n; } return a; }
function worldList(){ return JSON.parse(localStorage.getItem('bh_worlds') || '[]'); }
function saveWorld() {
  if (!world || !worldId || AUTO) return;
  const chunks = {}, dims = {};
  for (const dn of ['over','nether']) { const w = worlds[dn]; if (!w) continue; const pre = dn==='nether' ? 'n:' : '';
    for (const [k,ch] of w.chunks) if (ch.modified) w.saved[k] = { b: ch.b, m: ch.m };
    for (const k in w.saved) chunks[pre+k] = [rle(w.saved[k].b), rle(w.saved[k].m)];
    dims[dn] = { furnaces: w.furnaces, chests: w.chests || {}, growing: w.growing ? [...w.growing] : [], torches: w.torches ? [...w.torches] : [] }; }
  const meta = { armor: P.armor, xp: P.xp||0, xpLevel: P.xpLevel||0, dim: world.dim, dims, seed: world.seedStr, pos:[P.pos.x,P.pos.y,P.pos.z], yaw:P.yaw, pitch:P.pitch, inv:P.inv, sel:P.sel, health:P.health, food:P.food, mode:P.mode, time:timeOfDay, spawn:[P.spawn.x,P.spawn.y,P.spawn.z], furnaces: world.furnaces, chests: world.chests || {}, growing: world.growing ? [...world.growing] : [], torches: world.torches ? [...world.torches] : [], flying:P.flying };
  try { localStorage.setItem('bh_w_'+worldId, JSON.stringify({ meta, chunks })); } catch(e) { showMsg('Could not save: storage full'); }
  const list = worldList(); const w = list.find(w=>w.id===worldId); if (w) { w.last = Date.now(); w.mode = P.mode; localStorage.setItem('bh_worlds', JSON.stringify(list)); }
}

// ---------- starting worlds ----------
let worlds = { over: null, nether: null };
function makeWorld(seed, dim) {
  const w = new World(seed, dim);
  w.decayQ = [];
  w.onChange = (x,y,z,old,id) => { if ((old===B.LOG||old===B.SPRUCE_LOG||old===B.BIRCH_LOG||old===B.JUNGLE_LOG||old===B.BLOSSOM_LOG) && id!==old) {
    for (let dx=-4;dx<=4;dx++) for (let dy=-3;dy<=6;dy++) for (let dz=-4;dz<=4;dz++) if (BLOCKS[w.getBlock(x+dx,y+dy,z+dz)].leaves) w.decayQ.push([x+dx,y+dy,z+dz, performance.now()/1000 + 2 + Math.random()*10]); } };
  w.onFall = (x,y,z,id) => { w.setBlock(x,y,z,B.AIR); const mesh = makeItemMesh(id, 1); scene.add(mesh); fallingBlocks.push({ id, pos:new THREE.Vector3(x+0.5,y,z+0.5), vel:new THREE.Vector3(), hw:0.49, h:0.98, mesh, t:0 }); };
  return w;
}
// ---------- nether portals ----------
function tryLightPortal(x, y, z) {
  // x,y,z is an air cell inside a frame; try both vertical planes
  for (const ax of [[1,0],[0,1]]) {
    const seen = new Set([x+','+y+','+z]); const q = [[x,y,z]]; let ok = true;
    while (q.length && ok) { const [cx,cy,cz] = q.pop();
      for (const [dx,dy,dz] of [[ax[0],0,ax[1]],[-ax[0],0,-ax[1]],[0,1,0],[0,-1,0]]) { const nx=cx+dx, ny=cy+dy, nz=cz+dz; const id = world.getBlock(nx,ny,nz);
        if (id===B.OBSIDIAN) continue; if (id!==B.AIR) { ok=false; break; } const k=nx+','+ny+','+nz; if (!seen.has(k)) { seen.add(k); q.push([nx,ny,nz]); if (seen.size > 80) { ok=false; break; } } } }
    if (ok && seen.size >= 2) { for (const k of seen) { const [px,py,pz]=k.split(',').map(Number); world.setBlock(px,py,pz,B.PORTAL,ax[0]?0:1,true); } world.relightAround(x>>4,z>>4); rebuildNow(x,z); Sound.play('fizz'); return true; }
  }
  return false;
}
function buildPortal(x, y, z) {
  // clear a room and build a 4x5 obsidian frame along x, with floor
  for (let dx=-2;dx<=5;dx++) for (let dz=-2;dz<=2;dz++) { for (let dy=0;dy<5;dy++) world.setBlock(x+dx,y+dy,z+dz,B.AIR,0,true); const f = world.getBlock(x+dx,y-1,z+dz); if (!SOLID[f]) world.setBlock(x+dx,y-1,z+dz, world.dim==='nether'?B.NETHERRACK:B.COBBLE,0,true); }
  for (let dx=0;dx<4;dx++) for (let dy=0;dy<5;dy++) { const edge = dx===0||dx===3||dy===0||dy===4; world.setBlock(x+dx,y-1+dy,z, edge?B.OBSIDIAN:B.PORTAL, 0, true); }
  world.relightAround(x>>4, z>>4); world.relightAround((x+4)>>4, z>>4);
}
function travel() {
  const toNether = world.dim !== 'nether';
  const target = toNether ? 'nether' : 'over';
  if (!worlds[target]) worlds[target] = makeWorld(world.seedStr, target);
  for (const k of [...chunkMeshes.keys()]) removeChunkMesh(k); mobs.clear(); for (const d of drops) scene.remove(d.mesh); drops.length = 0;
  const sx = toNether ? Math.floor(P.pos.x/8) : Math.floor(P.pos.x*8), sz = toNether ? Math.floor(P.pos.z/8) : Math.floor(P.pos.z*8);
  world = worlds[target]; for (const ch of world.chunks.values()) ch.dirty = true;
  P.pos.set(sx+0.5, 70, sz+0.5); P.vel.set(0,0,0); P.portalCD = 5; P.portalT = 0; P.fallStart = null;
  setState('loading'); $('loadmsg').textContent = toNether ? 'Entering the Nether' : 'Leaving the Nether';
  afterLoadHook = () => {
    $('loadmsg').textContent = 'Generating world';
    // look for existing portal nearby
    for (let dx=-12;dx<=12;dx++) for (let dz=-12;dz<=12;dz++) for (let y=4;y<120;y++) if (world.getBlock(sx+dx,y,sz+dz)===B.PORTAL) { P.pos.set(sx+dx+0.5, y, sz+dz+1.5); while (world.getBlock(sx+dx,y-1,sz+dz)===B.PORTAL) { y--; P.pos.y = y; } return; }
    let y;
    if (toNether) { y = 0; for (let yy=34; yy<100; yy++) if (!SOLID[world.getBlock(sx,yy,sz)] && !SOLID[world.getBlock(sx,yy+1,sz)] && SOLID[world.getBlock(sx,yy-1,sz)]) { y = yy; break; } if (!y) y = 40; }
    else { y = world.col(sx, sz).h + 1; if (y < SEA+1) y = SEA+1; }
    buildPortal(sx-1, y, sz); for (const ch of world.chunks.values()) ch.dirty = true;
    P.pos.set(sx+0.5, y, sz+1.5); P.yaw = Math.PI; P.pitch = 0;
  };
}
function startWorld(seed, mode, saved) {
  clearWorld();
  worlds = { over: makeWorld(seed, 'over'), nether: null }; world = worlds.over; mobs = new Mobs(G); P.portalT = 0; P.portalCD = 0;
  P.inv = new Array(36).fill(null); P.health=20; P.food=20; P.sat=5; P.air=300; P.alive=true; P.mode=mode; P.flying=false; P.vel.set(0,0,0); P.sel=0; P.fallStart=null; P.xp=0; P.xpLevel=0; P.armor=[null,null,null,null];
  if (saved) {
    const m = saved.meta; if (Object.keys(saved.chunks).some(k=>k.startsWith('n:')) || m.dim==='nether') worlds.nether = makeWorld(saved.meta.seed || seed, 'nether');
    for (const k in saved.chunks) { const [b,mm] = saved.chunks[k]; const w = k.startsWith('n:') ? worlds.nether : worlds.over; w.saved[k.startsWith('n:') ? k.slice(2) : k] = { b: unrle(b, 16*16*CH), m: unrle(mm, 16*16*CH) }; }
    if (m.dims) for (const dn in m.dims) { const w = worlds[dn]; if (!w) continue; const d = m.dims[dn]; w.furnaces=d.furnaces||{}; w.chests=d.chests||{}; w.growing=new Set(d.growing||[]); w.torches=new Set(d.torches||[]); }
    if (m.dim==='nether' && worlds.nether) world = worlds.nether;
    P.xp = m.xp||0; P.xpLevel = m.xpLevel||0; P.armor = m.armor || [null,null,null,null];
    P.pos.set(...m.pos); P.yaw=m.yaw; P.pitch=m.pitch; P.inv=m.inv; P.sel=m.sel; P.health=m.health; P.food=m.food; P.mode=m.mode; timeOfDay=m.time; P.spawn=new THREE.Vector3(...m.spawn); if (!m.dims) { world.furnaces=m.furnaces||{}; world.chests=m.chests||{}; world.growing=new Set(m.growing||[]); world.torches=new Set(m.torches||[]); } P.flying=!!m.flying;
  } else {
    timeOfDay = 0.07;
    // find spawn on land
    let sx=0, sz=0; for (let i=0;i<400;i++){ const c=world.col(sx,sz); if (c.h>SEA+1 && c.biome!==7 && c.biome!==4) break; sx += 16*((i%7)-3); sz += 23*(i%5); }
    const c = world.col(sx,sz); P.pos.set(sx+0.5, c.h+2, sz+0.5); P.spawn = P.pos.clone(); P.yaw = 0; P.pitch = -0.1; P.needSpawn = true;
    if (mode==='creative') { [B.GRASS,B.STONE,B.COBBLE,B.PLANKS,B.LOG,B.GLASS,B.BRICKS,B.TORCH,B.STONEBRICK].forEach((id,i)=>P.inv[i]={id,count:64}); }
  }
  setState('loading');
}
function ensureSafeSpawn(){ const x=Math.floor(P.pos.x), z=Math.floor(P.pos.z); let y=CH-2; while (y>1 && !SOLID[world.getBlock(x,y,z)] && !BLOCKS[world.getBlock(x,y,z)].liquid) y--; P.pos.y = y+1.01; }

// ---------- HUD ----------
const hudIcons = (()=>{ const mk=(draw)=>{ const c=document.createElement('canvas'); c.width=c.height=9; const x=c.getContext('2d'); draw(x); return c.toDataURL(); };
  const heart=[".##...##.","#rr#.#rr#","#rwrrrrr#","#rrrrrrr#",".#rrrrr#.","..#rrr#..","...#r#...","....#....","........."];
  const drum=["......##.",".....#bw#","....#bbw#","..##bbb#.",".#mmm##..","#mmmmm#..","#mmmm#...",".#mm#....","..##....."];
  const arm=["##.....##","#w#...#a#","#aa###aa#","#aaaaaaa#",".#aaaaa#.",".#aaaaa#.",".#aaaaa#.",".#aaaaa#.","..#####.."];
  const bub=["..###....",".#wbb#...","#wbbbb#..","#bbbbb#..","#bbbbb#..",".#bbb#...","..###....",".........","........."];
  const draw=(map,pal,half)=>mk(x=>{ for(let y=0;y<9;y++)for(let i=0;i<9;i++){ const ch=map[y][i]; if(ch==='.')continue; let c=pal[ch]; if(half&&i>4&&ch!=='#') c=pal.e; if(c){ x.fillStyle=c; x.fillRect(i,y,1,1);} } });
  return { hf:draw(heart,{'#':'#1a0000',r:'#e01818',w:'#ffb0b0'}), hh:draw(heart,{'#':'#1a0000',r:'#e01818',w:'#ffb0b0',e:'#3a1010'},true), he:draw(heart,{'#':'#1a0000',r:'#3a1010',w:'#3a1010'}),
    ff:draw(drum,{'#':'#1a0e00',m:'#b06a2a',b:'#e8e0d0',w:'#fff'}), fh:draw(drum,{'#':'#1a0e00',m:'#b06a2a',b:'#e8e0d0',w:'#fff',e:'#2a1a0a'},true), fe:draw(drum,{'#':'#1a0e00',m:'#2a1a0a',b:'#2a1a0a',w:'#2a1a0a'}),
    bb:draw(bub,{'#':'#1a3a8a',b:'#5a8aff',w:'#fff'}),
    af:draw(arm,{'#':'#202020',a:'#d8d8d8',w:'#fff'}), ah:draw(arm,{'#':'#202020',a:'#d8d8d8',w:'#fff',e:'#3a3a3a'},true), ae:draw(arm,{'#':'#202020',a:'#3a3a3a',w:'#3a3a3a'}) }; })();
function slotHTML(s){ if (!s) return ''; let h = `<img src="${iconURL(s.id)}"${s.ench?' class="glint"':''}>`; if (s.count>1) h += `<span class="cnt">${s.count}</span>`; if (s.dur!==undefined && ITEMS[s.id] && s.dur < ITEMS[s.id].dur) { const f=s.dur/ITEMS[s.id].dur; h += `<div class="dur"><i style="width:${f*100}%;background:hsl(${f*120},100%,45%)"></i></div>`; } return h; }
let hudSig = '';
function refreshHUD() {
  let h=''; for (let i=0;i<9;i++) h += `<div class="hs ${i===P.sel?'sel':''}">${slotHTML(P.inv[i])}</div>`; $('hotbar').innerHTML = h;
  const surv = P.mode==='survival'; $('bars').style.display = surv ? 'block':'none';
  if (surv) {
    let hh=''; for (let i=0;i<10;i++){ const v=P.health-i*2; hh+=`<img src="${v>=2?hudIcons.hf:v===1?hudIcons.hh:hudIcons.he}">`; } $('hearts').innerHTML=hh;
    let ff=''; for (let i=0;i<10;i++){ const v=Math.ceil(P.food)-i*2; ff+=`<img src="${v>=2?hudIcons.ff:v===1?hudIcons.fh:hudIcons.fe}">`; } $('food').innerHTML=ff;
    const ap = armorPoints(); let ar=''; if (ap) for (let i=0;i<10;i++){ const v=ap-i*2; ar+=`<img src="${v>=2?hudIcons.af:v===1?hudIcons.ah:hudIcons.ae}">`; } $('armorbar').innerHTML=ar;
    let aa=''; if (P.air<300) for (let i=0;i<Math.ceil(P.air/30);i++) aa+=`<img src="${hudIcons.bb}">`; $('air').innerHTML=aa;
  }
  $('modeTag').textContent = P.mode==='creative' ? 'Creative Mode' : '';
  refreshXP();
}
let nameT = 0; function showItemName(){ const s=held(); $('itemname').textContent = s ? itemName(s.id) : ''; $('itemname').style.opacity = 1; nameT = 2; }
let msgT = 0; function showMsg(t){ $('msg').textContent=t; msgT=3; }

// ---------- crafting ----------
const LOGS=[B.LOG,B.SPRUCE_LOG,B.BIRCH_LOG,B.JUNGLE_LOG], PL=[B.PLANKS,B.BLOSSOM_PLANKS];
const RECIPES = [];
function R(pat, key, out, n=1){ RECIPES.push({pat, key, out, n}); }
R(['L'],{L:LOGS},B.PLANKS,4); R(['L'],{L:[B.BLOSSOM_LOG]},B.BLOSSOM_PLANKS,4);
R(['II','II'],{I:[B.PACKED_ICE]},B.FROST_BRICKS,4); R(['SS','SS'],{S:[I.FROST_SHARD]},B.PACKED_ICE,1); R(['RR','RR'],{R:[B.RED_MUSHROOM]},B.CAP_BLOCK,1); R(['G','s'],{G:[B.GLOWCAP],s:[I.STICK]},B.TORCH,2);
R(['P','P'],{P:PL},I.STICK,4);
R(['PP','PP'],{P:PL},B.CRAFTING,1);
R(['CCC','C C','CCC'],{C:[B.COBBLE]},B.FURNACE,1);
R(['c','s'],{c:[I.COAL],s:[I.STICK]},B.TORCH,4);
R(['SS','SS'],{S:[B.SAND]},B.SANDSTONE,1);
R(['SS','SS'],{S:[B.STONE]},B.STONEBRICK,4);
R(['SS','SS'],{S:[I.STRING]},B.WOOL,1);
R(['GG','GG'],{G:[B.GLASS]},B.GLASS,4);
R(['PPP','P P','PPP'],{P:PL},B.CHEST,1);
R(['WWW'],{W:[I.WHEAT]},I.BREAD,1);
R(['PP','PP','PP'],{P:PL},B.DOOR,3);
R(['S S','SSS','S S'],{S:[I.STICK]},B.LADDER,3);
R(['CCC'],{C:[B.CANE]},I.PAPER,3);
R(['I I',' I '],{I:[I.IRON]},I.BUCKET,1);
R([' I ','IRI',' I '],{I:[I.IRON],R:[I.REDSTONE]},I.COMPASS,1); R([' G ','GRG',' G '],{G:[I.GOLD],R:[I.REDSTONE]},I.CLOCK,1);
R(['PSP','PSP'],{P:PL,S:[I.STICK]},B.FENCE,3);
R(['PPP','BBB','PPP'],{P:PL,B:[I.PAPER]},B.BOOKSHELF,1);
R([' B ','DOD','OOO'],{B:[B.BOOKSHELF],D:[I.DIAMOND],O:[B.OBSIDIAN]},B.ENCHANT_TABLE,1);
R(['WWW','WWW','WWW'],{W:[I.WHEAT]},B.HAY,1); R(['H'],{H:[B.HAY]},I.WHEAT,9);
R(['III','ITI','III'],{I:[I.IRON],T:[B.TORCH]},B.LANTERN,1);
for (const [m,mat] of [['L',I.LEATHER],['I',I.IRON],['G',I.GOLD],['D',I.DIAMOND]]) { const k={X:[mat]};
  R(['XXX','X X'],k,I[m+'HELM']); R(['X X','XXX','XXX'],k,I[m+'CHEST']); R(['XXX','X X','X X'],k,I[m+'LEGS']); R(['X X','X X'],k,I[m+'BOOTS']); }
R(['P','T'],{P:[B.PUMPKIN],T:[B.TORCH]},B.JACK,1);
R(['X  ','XX ','XXX'],{X:[B.COBBLE]},B.COBBLE_STAIRS,4); R(['X  ','XX ','XXX'],{X:PL},B.PLANK_STAIRS,4);
R(['SSS'],{S:[B.STONE]},B.STONE_SLAB,6); R(['SSS'],{S:PL},B.PLANK_SLAB,6); R(['SSS'],{S:[B.COBBLE]},B.COBBLE_SLAB,6);
R(['B'],{B:[I.BONE]},I.BONE_MEAL,3);
R([' I','I '],{I:[I.IRON]},I.SHEARS,1);
R(['MMM','SES','WWW'],{M:[I.MILK_BUCKET],S:[I.SUGAR],E:[I.EGG,I.APPLE],W:[I.WHEAT]},I.CAKE_ITEM,1);
for (const [it, bl] of [[I.IRON,B.IRON_BLOCK],[I.GOLD,B.GOLD_BLOCK],[I.DIAMOND,B.DIAMOND_BLOCK],[I.LAPIS,B.LAPIS_BLOCK]]) { R(['XXX','XXX','XXX'],{X:[it]},bl,1); R(['X'],{X:[bl]},it,9); }
R(['I ',' F'],{I:[I.IRON],F:[I.FLINT]},I.FLINT_STEEL,1);
R(['GG','GG'],{G:[B.GLOWSTONE]},B.GLOWSTONE,1);
R(['NN','NN'],{N:[B.NETHERRACK]},B.NETHER_BRICK,1);
R(['C'],{C:[B.CANE]},I.SUGAR,1);
for (const [m,mat] of [['W',PL],['S',[B.COBBLE]],['I',[I.IRON]],['G',[I.GOLD]],['D',[I.DIAMOND]]]) R(['XX',' s',' s'],{X:mat,s:[I.STICK]},I[m+'HOE']);
R([' sS','s S',' sS'],{s:[I.STICK],S:[I.STRING]},I.BOW,1);
R(['f','s','F'],{f:[I.FLINT,I.COAL],s:[I.STICK],F:[I.FEATHER]},I.ARROW,4);
R(['WWW','PPP'],{W:[B.WOOL],P:PL},B.BED,1);
for (const [m,mat] of [['W',PL],['S',[B.COBBLE]],['I',[I.IRON]],['G',[I.GOLD]],['D',[I.DIAMOND]]]) {
  R(['XXX',' s ',' s '],{X:mat,s:[I.STICK]},I[m+'PICK']); R(['XX','Xs',' s'],{X:mat,s:[I.STICK]},I[m+'AXE']); R(['X','s','s'],{X:mat,s:[I.STICK]},I[m+'SHOVEL']); R(['X','X','s'],{X:mat,s:[I.STICK]},I[m+'SWORD']);
}
function matchRecipe(grid, size) {
  let minx=9,miny=9,maxx=-1,maxy=-1;
  for (let y=0;y<size;y++) for (let x=0;x<size;x++) if (grid[y*size+x]) { minx=Math.min(minx,x); maxx=Math.max(maxx,x); miny=Math.min(miny,y); maxy=Math.max(maxy,y); }
  if (maxx<0) return null; const w=maxx-minx+1, h=maxy-miny+1;
  for (const r of RECIPES) { if (r.pat.length!==h) continue; const pw = Math.max(...r.pat.map(s=>s.length)); if (pw!==w) continue;
    for (const mir of [false,true]) { let ok = true;
      for (let y=0;y<h&&ok;y++) for (let x=0;x<w;x++) { const ch = (r.pat[y][mir? w-1-x : x]) || ' '; const s = grid[(y+miny)*size+(x+minx)];
        if (ch===' ') { if (s) { ok=false; break; } } else if (!s || !r.key[ch].includes(s.id)) { ok=false; break; } }
      if (ok) return { id:r.out, count:r.n }; } }
  return null;
}

// ---------- inventory UI ----------
let ui = null; // {type:'inv'|'table'|'furnace'|'creative', grid:[], size, furnace}
let cursor = null;
const invPanel = $('invPanel');
let decayBoost = 0;
function decayLeaf(x,y,z) {
  const id = world.getBlock(x,y,z); if (!BLOCKS[id].leaves) return;
  if (!(world.isLoaded(x-5,z-5) && world.isLoaded(x+5,z+5) && world.isLoaded(x-5,z+5) && world.isLoaded(x+5,z-5))) return;
  for (let dx=-4;dx<=4;dx++) for (let dy=-4;dy<=4;dy++) for (let dz=-4;dz<=4;dz++) { const b=world.getBlock(x+dx,y+dy,z+dz); if (b===B.LOG||b===B.SPRUCE_LOG||b===B.BIRCH_LOG||b===B.JUNGLE_LOG||b===B.BLOSSOM_LOG) return; }
  world.setBlock(x,y,z,B.AIR,0,true); const ch = world.getChunk(x>>4,z>>4); ch.needLight=false; ch.relightSoon=true;
  if (parts.length < 120) particles(x+0.5,y+0.5,z+0.5,id,3);
  const r=Math.random(); if (r<0.05) spawnDrop(id===B.JUNGLE_LEAVES?B.SAPLING:B.SAPLING,1,x+0.5,y+0.5,z+0.5); else if (r<0.07 && id===B.LEAVES) spawnDrop(I.APPLE,1,x+0.5,y+0.5,z+0.5);
}
// random block ticks near the player: saplings grow, grass spreads onto lit dirt
let rtT = 0;
function randomTicks(dt) {
  rtT += dt; if (rtT < 0.1) return; rtT = 0;
  if (world.decayQ && world.decayQ.length) { const now = performance.now()/1000 + (decayBoost||0); for (let i=world.decayQ.length-1;i>=0;i--) { const [x,y,z,t] = world.decayQ[i]; if (t > now) continue; world.decayQ.splice(i,1); decayLeaf(x,y,z); } }
  if (world.spawners) for (const k of world.spawners) { const [sx,sy,sz] = k.split(',').map(Number); if (Math.abs(sx-P.pos.x) > 16 || Math.abs(sy-P.pos.y) > 16 || Math.abs(sz-P.pos.z) > 16) continue;
    if (world.getBlock(sx,sy,sz) !== B.SPAWNER) { world.spawners.delete(k); continue; }
    if (Math.random() < 0.6) particlesAt(sx+0.2+Math.random()*0.6, sy+0.3+Math.random()*0.4, sz+0.2+Math.random()*0.6, Math.random()<0.5?0xff8020:0x404040, 0.6);
    if (Math.random() < 0.012 && mobs.list.filter(m=>m.d.hostile && m.pos.distanceTo(new THREE.Vector3(sx,sy,sz)) < 9).length < 4) {
      const t = ['zombie','skeleton','spider'][(sx*7+sz*3)&1 ? 0 : ((sx+sz)&1 ? 1 : 2)]; const ox = sx + (Math.random()*4-2|0), oz = sz + (Math.random()*4-2|0);
      if (!SOLID[world.getBlock(ox,sy,oz)] && !SOLID[world.getBlock(ox,sy+1,oz)]) { mobs.spawn(t, ox+0.5, sy, oz+0.5); particles(ox+0.5,sy+0.5,oz+0.5,null,10,0x777777,true); } } }
  { const e = eyePos(); if (world.dim !== 'nether' && world.getSky(Math.floor(e.x),Math.floor(e.y),Math.floor(e.z)) < 3 && world.getBl(Math.floor(e.x),Math.floor(e.y),Math.floor(e.z)) < 6 && Math.random() < 0.0025) Sound.play('cave'); }
  if (world.torches && Math.random() < 0.5) for (const k of [...world.torches]) { const [x,y,z] = k.split(',').map(Number);
    if (Math.abs(x-P.pos.x) > 20 || Math.abs(z-P.pos.z) > 20 || Math.abs(y-P.pos.y) > 20) continue;
    if (world.getBlock(x,y,z) !== B.TORCH) { world.torches.delete(k); continue; }
    if (parts.length < 150 && Math.random() < 0.35) { const fl = Math.random() < 0.5; particlesAt(x+0.5, y+0.75, z+0.5, fl ? 0xffb030 : 0x555555, fl ? 0.25 : 0.9); } }
  if (world.growing && Math.random() < 0.1) for (const k of [...world.growing]) { const [x,y,z] = k.split(',').map(Number); if (!world.isLoaded(x,z)) continue; const id = world.getBlock(x,y,z);
    if (id===B.WHEAT) { const m = world.getMeta(x,y,z); if (m >= 7) { world.growing.delete(k); continue; } if (Math.random() < 0.08) { world.setBlock(x,y,z,B.WHEAT,m+1,true); world.getChunk(x>>4,z>>4).needLight=false; } }
    else if (id===B.SAPLING) { if (Math.random() < 0.02) { let clear=true; for (let kk=1;kk<6;kk++) if (world.getBlock(x,y+kk,z)) clear=false; if (clear) { world.growing.delete(k); world.growTree(x,y,z); } } }
    else world.growing.delete(k); }
  const pcx = Math.floor(P.pos.x/16), pcz = Math.floor(P.pos.z/16);
  for (let n=0;n<40;n++) {
    const x = (pcx + Math.floor(Math.random()*9)-4)*16 + Math.floor(Math.random()*16), z = (pcz + Math.floor(Math.random()*9)-4)*16 + Math.floor(Math.random()*16), y = Math.floor(Math.random()*CH);
    const id = world.getBlock(x,y,z);
    if (id===B.SAPLING && Math.random()<0.25 && world.getSky(x,y,z)+world.getBl(x,y,z) >= 9) { let clear=true; for (let k=1;k<6;k++) if (world.getBlock(x,y+k,z)) clear=false; if (clear) { world.growTree(x,y,z); } }
    else if (id===B.DIRT && !OPAQUE[world.getBlock(x,y+1,z)] && !BLOCKS[world.getBlock(x,y+1,z)].liquid && world.getSky(x,y+1,z) >= 9) {
      for (const [dx,dy,dz] of [[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[1,1,0],[-1,-1,0],[0,1,1],[0,-1,-1]]) if (world.getBlock(x+dx,y+dy,z+dz)===B.GRASS) { world.setBlock(x,y,z,B.GRASS,0,true); world.getChunk(x>>4,z>>4).needLight=false; break; } }
    else if ((id===B.CANE || id===B.CACTUS) && world.getBlock(x,y+1,z)===B.AIR && Math.random() < 0.3) { let h=1; while (h<4 && world.getBlock(x,y-h,z)===id) h++; if (h < 3) { world.setBlock(x,y+1,z,id,0,true); world.getChunk(x>>4,z>>4).needLight=false; } }
    else if (BLOCKS[id].leaves) decayLeaf(x,y,z);
    else if (id===B.GRASS && OPAQUE[world.getBlock(x,y+1,z)]) { world.setBlock(x,y,z,B.DIRT,0,true); world.getChunk(x>>4,z>>4).needLight=false; }
  }
}
// ---------- villager trading ----------
const TRADE_SETS = {
  Farmer: [[[I.WHEAT,20],[I.EMERALD,1]], [[I.EMERALD,1],[I.BREAD,6]], [[I.EMERALD,1],[I.APPLE,4]], [[B.PUMPKIN,6],[I.EMERALD,1]], [[I.EMERALD,3],[I.CAKE_ITEM,1]], [[I.SEEDS,24],[I.EMERALD,1]], [[I.EMERALD,1],[B.SAPLING,3]], [[I.EMERALD,2],[I.ROAST_MUSHROOM,6]]],
  Librarian: [[[I.PAPER,24],[I.EMERALD,1]], [[I.EMERALD,9],[B.BOOKSHELF,1]], [[I.EMERALD,1],[B.GLASS,4]], [[I.EMERALD,5],[B.LANTERN,1]], [[I.EMERALD,4],[I.COMPASS,1]], [[I.EMERALD,4],[I.CLOCK,1]], [[I.EMERALD,2],[I.LAPIS,6]]],
  Smith: [[[I.COAL,15],[I.EMERALD,1]], [[I.IRON,4],[I.EMERALD,1]], [[I.EMERALD,3],[I.IPICK,1]], [[I.EMERALD,7],[I.ICHEST,1]], [[I.EMERALD,12],[I.DSWORD,1]], [[I.EMERALD,2],[I.ISWORD,1]], [[I.EMERALD,4],[I.IHELM,1]], [[I.EMERALD,1],[I.SHEARS,1]]],
  Butcher: [[[I.CHICKEN,14],[I.EMERALD,1]], [[I.PORK,7],[I.EMERALD,1]], [[I.EMERALD,1],[I.COOKED_PORK,5]], [[I.EMERALD,1],[I.STEAK,3]], [[I.VENISON,8],[I.EMERALD,1]], [[I.EMERALD,1],[I.COOKED_VENISON,4]], [[I.LEATHER,6],[I.EMERALD,1]]],
  Mason: [[[B.COBBLE,24],[I.EMERALD,1]], [[I.EMERALD,1],[B.STONEBRICK,8]], [[I.EMERALD,1],[B.BRICKS,8]], [[I.EMERALD,2],[B.FROST_BRICKS,8]], [[I.FROST_SHARD,10],[I.EMERALD,1]], [[I.EMERALD,1],[B.TERRA_RED,8]], [[I.EMERALD,3],[B.GLOWSTONE,4]]],
};
const JOB_ICON = { Farmer:I.WHEAT, Librarian:B.BOOKSHELF, Smith:I.IPICK, Butcher:I.STEAK, Mason:B.STONEBRICK };
function countItem(id){ return P.inv.reduce((n,s)=> n + (s && s.id===id ? s.count : 0), 0); }
function takeItem(id, n){ for (let i=0;i<36&&n;i++){ const s=P.inv[i]; if (s && s.id===id){ const a=Math.min(n,s.count); s.count-=a; n-=a; if(!s.count) P.inv[i]=null; } } }
function openTrade(v) {
  if (!v || v.deadT >= 0) return;
  if (!v.job) { const jobs = Object.keys(TRADE_SETS); v.job = jobs[(Math.random()*jobs.length)|0]; }
  for (const k in keys) keys[k] = false; mouseL = mouseR = false; P.eating = false; P.drawing = false;
  v.ai.t = 6; v.ai.dir = null; v.vel.x = v.vel.z = 0; v.yaw = Math.atan2(P.pos.x - v.pos.x, P.pos.z - v.pos.z); // the villager stops and faces you
  ui = { type:'trade', villager:v, grid:[], size:0 }; setState('inv'); renderUI();
}
function tradeHTML() {
  const v = ui.villager; const em = countItem(I.EMERALD);
  let h = `<div class="tradeHead"><img src="${iconURL(JOB_ICON[v.job]||I.EMERALD)}"><div><div class="tn">${v.job}</div><div class="ts">Give the items on the left to get the item on the right</div></div><div class="tem"><img src="${iconURL(I.EMERALD)}"><span>${em}</span></div></div><div class="tradeList">`;
  TRADE_SETS[v.job].forEach(([[gi,gn],[ri,rn]],k) => { const have = countItem(gi), ok = have >= gn;
    h += `<div class="trade ${ok?'ok':'no'}" data-t="${k}" title="${itemName(gi)} x${gn} for ${itemName(ri)}${rn>1?' x'+rn:''}">
      <div class="side"><div class="slot">${slotHTML({id:gi,count:gn})}</div><div class="nm">${itemName(gi)}<br><span class="${ok?'hv':'nv'}">have ${have}</span></div></div>
      <div class="tarr"></div>
      <div class="side"><div class="slot">${slotHTML({id:ri,count:rn})}</div><div class="nm">${itemName(ri)}</div></div></div>`; });
  return h + `</div>`;
}
function nearestVillager(maxD) { if (!mobs) return null; let best = null, bd = maxD;
  for (const m of mobs.list) { if (m.type !== 'villager' || m.deadT >= 0) continue; const d = Math.hypot(m.pos.x-P.pos.x, (m.pos.y-P.pos.y)*1.5, m.pos.z-P.pos.z); if (d < bd) { bd = d; best = m; } }
  return best; }
// on-screen Trade button: shown in play whenever a villager is within ~4 blocks
const tradeBtn = $('tradeBtn'); tradeBtn.style.setProperty('--em', `url(${iconURL(I.EMERALD)})`);
function updateTradeBtn() { const v = state==='play' && P.alive && !titleMode ? nearestVillager(4) : null; tradeBtn.classList.toggle('on', !!v); return v; }
function tradeNearest() { if (state !== 'play') return false; const v = nearestVillager(4.5); if (!v) return false; Sound.play('villager'); openTrade(v); return true; }
tradeBtn.addEventListener('mousedown', e => { e.stopPropagation(); e.preventDefault(); });
tradeBtn.addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); Sound.init(); tradeNearest(); });
invPanel.addEventListener('click', e => { const el = e.target.closest('.trade'); if (!el || !ui || ui.type!=='trade') return;
  const [[gi,gn],[ri,rn]] = TRADE_SETS[ui.villager.job][+el.dataset.t]; if (countItem(gi) < gn) { Sound.play('villager'); return; }
  takeItem(gi, gn); const it = ITEMS[ri]; const left = addItem(ri, rn, it && it.dur ? it.dur : undefined); if (left) spawnDrop(ri, left, P.pos.x, P.pos.y+1, P.pos.z);
  Sound.play('pop'); spawnXP(ui.villager.pos.x, ui.villager.pos.y+1, ui.villager.pos.z, 3); particles(ui.villager.pos.x, ui.villager.pos.y+2, ui.villager.pos.z, null, 6, 0x40e060, true); renderUI(); refreshHUD(); });
// ---------- enchanting ----------
const ENCH_NAMES = { pick:'Efficiency', axe:'Efficiency', shovel:'Efficiency', hoe:'Efficiency', sword:'Sharpness' };
const ARMOR_ENCH = 'Protection';
const ROMAN = ['','I','II','III','IV','V'];
function enchName(s){ const it = ITEMS[s.id]; if (!s.ench) return ''; return (it && it.armor!==undefined ? ARMOR_ENCH : it && it.tool ? ENCH_NAMES[it.tool] : (s.id===I.BOW?'Power':'Unbreaking'))+' '+ROMAN[s.ench]; }
function enchantHTML(){ const s = ui.ench[0]; let h = `<div class="t">Enchant</div><div style="display:flex;gap:16px;align-items:flex-start;margin:6px 0 12px"><div style="display:flex;gap:4px">${slotEl(ui.ench,0,'en')}${slotEl(ui.ench,1,'en')}</div><div style="display:flex;flex-direction:column;gap:4px">`;
  const lapis = ui.ench[1] && ui.ench[1].id===I.LAPIS ? ui.ench[1].count : 0;
  for (let k=1;k<=3;k++) { const cost = [0,1,5,15][k]; const ok = s && ITEMS[s.id] && (ITEMS[s.id].tool || ITEMS[s.id].armor!==undefined || s.id===I.BOW) && !s.ench && (P.xpLevel||0) >= cost && lapis >= k || (P.mode==='creative' && s && !s.ench);
    h += `<div class="ench" data-k="${k}" style="width:310px;white-space:nowrap;padding:6px 10px;background:${ok?'#c6a8e8':'#8f8f8f'};border:2px solid;border-color:#fff #373737 #373737 #fff;cursor:${ok?'pointer':'default'};display:flex;justify-content:space-between;font-size:22px;color:${ok?'#3a1a5a':'#555'}"><span>${s && ITEMS[s.id] ? (ITEMS[s.id].armor!==undefined?ARMOR_ENCH:ITEMS[s.id].tool?ENCH_NAMES[ITEMS[s.id].tool]:'Power')+' '+ROMAN[k] : '· · ·'}</span><span style="color:${ok?'#2a8a10':'#555'}">${cost} lvl · ${k} lapis</span></div>`; }
  return h + `</div></div>`; }
invPanel.addEventListener('click', e => { const el = e.target.closest('.ench'); if (!el || !ui || ui.type!=='enchant') return; const k = +el.dataset.k, cost = [0,1,5,15][k]; const s = ui.ench[0];
  if (!s || s.ench) return; const lapis = ui.ench[1] && ui.ench[1].id===I.LAPIS ? ui.ench[1].count : 0;
  if (P.mode!=='creative' && ((P.xpLevel||0) < cost || lapis < k)) return;
  if (P.mode!=='creative') { P.xpLevel -= k; ui.ench[1].count -= k; if (!ui.ench[1].count) ui.ench[1] = null; }
  s.ench = k; Sound.tone('sine', 520, 1040, 0.6, 0.15); Sound.tone('triangle', 780, 1560, 0.5, 0.08, 0.1); renderUI(); refreshHUD(); });
function sleep() {
  setState('sleeping'); $('loading').classList.add('on'); $('loadmsg').textContent = 'Sleeping...'; $('loadbar').style.width='100%';
  setTimeout(() => { timeOfDay = 0.02; $('loadmsg').textContent = 'Generating world'; for (const m of [...mobs.list]) if (m.d.hostile) { scene.remove(m.model.g); } mobs.list = mobs.list.filter(m=>!m.d.hostile); setState('play'); showMsg('Good morning! Respawn point set'); if (!AUTO) canvas.requestPointerLock(); }, 1500);
}
function openUI(type, extra, chest) {
  if (P.mode==='creative' && type==='inv') type = 'creative';
  for (const k in keys) keys[k] = false; mouseL = mouseR = false; P.eating = false;
  ui = { type, size: type==='table'?3:2, grid: new Array(type==='table'?9:4).fill(null), furnace: extra, chest, scroll:0, ench:[null,null] };
  setState('inv'); renderUI();
}
function closeUI() {
  if (!ui) return;
  for (const s of ui.grid) if (s) { const left = addItem(s.id, s.count, s.dur); if (left) spawnDrop(s.id, left, P.pos.x, P.pos.y+1.4, P.pos.z, dirVec().multiplyScalar(4)); }
  for (const s of (ui.ench||[])) if (s) { const i = P.inv.findIndex(x=>!x); if (i>=0) P.inv[i] = s; else spawnDrop(s.id, s.dur!==undefined?{dur:s.dur}:s.count, P.pos.x, P.pos.y+1.4, P.pos.z); }
  if (cursor) { const left = addItem(cursor.id, cursor.count, cursor.dur); if (left) spawnDrop(cursor.id, left, P.pos.x, P.pos.y+1.4, P.pos.z, dirVec().multiplyScalar(4)); cursor=null; }
  ui = null; $('cursorItem').style.display='none'; $('tooltip').style.display='none';
  setState('play'); if (!AUTO) canvas.requestPointerLock();
}
function slotEl(arr, i, kind, extraClass='') { return `<div class="slot ${extraClass}" data-k="${kind}" data-i="${i}">${slotHTML(arr[i])}</div>`; }
function renderUI() {
  if (!ui) return; let h = '';
  const invRows = () => { let s = `<div class="grid" style="grid-template-columns:repeat(9,50px);margin-top:8px">`; for (let i=9;i<36;i++) s+=slotEl(P.inv,i,'inv'); s += `</div><div class="grid" style="grid-template-columns:repeat(9,50px);margin-top:12px">`; for (let i=0;i<9;i++) s+=slotEl(P.inv,i,'inv'); return s+'</div>'; };
  if (ui.type==='creative') {
    h += `<div class="t">Creative Inventory — click an item to pick up a stack</div><div class="grid creativeGrid" style="grid-template-columns:repeat(9,50px)">`;
    ALL_CREATIVE.forEach((id,i)=>{ h += `<div class="slot" data-k="cr" data-i="${i}"><img src="${iconURL(id)}"></div>`; });
    h += `</div><div class="t">Hotbar</div><div class="grid" style="grid-template-columns:repeat(9,50px)">`; for (let i=0;i<9;i++) h+=slotEl(P.inv,i,'inv'); h += `</div><div class="t" style="font-size:20px;margin-top:6px">Click outside or drop on the trash slot to delete: </div><div class="slot" data-k="trash" style="background:#a05050"></div>`;
  } else if (ui.type==='enchant') {
    h += enchantHTML() + `<div class="t">Inventory</div>` + invRows();
  } else if (ui.type==='trade') {
    h += tradeHTML() + `<div class="t">Inventory</div>` + invRows();
  } else if (ui.type==='chest') {
    h += `<div class="t">Chest</div><div class="grid" style="grid-template-columns:repeat(9,50px)">`; for (let i=0;i<27;i++) h += slotEl(ui.chest.items,i,'ch'); h += `</div><div class="t" style="margin-top:10px">Inventory</div>` + invRows();
  } else if (ui.type==='furnace') {
    const f = ui.furnace;
    h += `<div class="t">Furnace</div><div class="craftrow" style="gap:30px"><div style="display:flex;flex-direction:column;align-items:center;gap:6px">${slotEl(f,'in','fu')}<div class="flame"><div class="fill" style="height:${f.burnMax? f.burn/f.burnMax*100:0}%"></div></div>${slotEl(f,'fuel','fu')}</div>
      <div class="arrow"><div class="fill" style="width:${f.cook/10*40}px"></div></div>${slotEl(f,'out','fu','big')}</div><div class="t">Inventory</div>` + invRows();
  } else {
    const n = ui.size; const res = matchRecipe(ui.grid, n); ui.result = res;
    h += `<div class="t">${ui.type==='table'?'Crafting':'Crafting'}</div><div class="craftrow">`;
    if (ui.type==='inv') { h += `<div class="grid" style="grid-template-columns:50px;margin-right:6px">`; for (let i=0;i<4;i++) h += slotEl(P.armor,i,'ar', P.armor[i] ? '' : 'armorslot a'+i); h += `</div>`; }
    if (ui.type==='inv') h += `<div id="playerPreview" style="width:110px;height:150px;background:#000;border:2px solid;border-color:#373737 #fff #fff #373737;margin-right:40px;display:flex;align-items:center;justify-content:center;color:#888;font-size:18px"><img src="${playerIcon()}" style="height:140px;image-rendering:pixelated"></div>`;
    h += `<div class="grid" style="grid-template-columns:repeat(${n},50px)">`; for (let i=0;i<n*n;i++) h += slotEl(ui.grid,i,'cg'); h += `</div><div class="arrow"></div>`;
    h += `<div class="slot big" data-k="res" data-i="0">${slotHTML(res)}</div></div><div class="t">Inventory</div>` + invRows();
  }
  invPanel.innerHTML = h; updateCursor();
}
let mouseX=0, mouseY=0;
function updateCursor(){ const c=$('cursorItem'); if (!cursor) { c.style.display='none'; return; } c.style.display='block'; c.querySelector('img').src=iconURL(cursor.id); c.querySelector('.cnt').textContent = cursor.count>1?cursor.count:''; c.style.left=(mouseX-23)+'px'; c.style.top=(mouseY-23)+'px'; }
function getArr(k){ return k==='en'?ui.ench: k==='ar'?P.armor: k==='inv'?P.inv: k==='cg'?ui.grid : k==='fu'?ui.furnace : k==='ch'?ui.chest.items : null; }
function chestAt(x,y,z){ world.chests = world.chests || {}; const k=x+','+y+','+z; if (world.chests[k]) return world.chests[k];
  const c = world.chests[k] = { items: new Array(27).fill(null) };
  if (world.loot && world.loot.has(k)) { world.loot.delete(k); const pool = [[I.BREAD,1,3],[I.IRON,1,4],[I.GOLD,1,3],[I.COAL,2,8],[I.STRING,1,4],[I.BONE,1,5],[I.GUNPOWDER,1,4],[I.ROTTEN,1,4],[I.WHEAT,1,4],[I.APPLE,1,3],[I.DIAMOND,1,2],[I.BUCKET,1,1],[I.REDSTONE,2,6],[I.SEEDS,2,5],[I.IHELM,1,1],[I.ICHEST,1,1],[I.LBOOTS,1,1],[I.GLEGS,1,1],[I.EMERALD,1,4]];
    const n = 3 + (Math.random()*5|0); for (let j=0;j<n;j++) { const [id,a,bb] = pool[Math.random()*pool.length|0]; if (id===I.DIAMOND && Math.random()<0.6) continue; const it = { id, count: a + (Math.random()*(bb-a+1)|0) }; if (ITEMS[id] && ITEMS[id].dur) it.dur = ITEMS[id].dur; c.items[Math.random()*27|0] = it; } }
  return c; }
invPanel.addEventListener('mousedown', e => {
  const el = e.target.closest('.slot'); if (!el || !ui) return; e.preventDefault(); Sound.play('click');
  const k = el.dataset.k; let i = el.dataset.i; if (k!=='fu') i = +i; const btn = e.button; const shift = e.shiftKey;
  if (k==='cr') { const id = ALL_CREATIVE[i]; cursor = { id, count: shift? maxStack(id) : (btn===2?1:maxStack(id)) }; if (ITEMS[id]&&ITEMS[id].dur) cursor.dur=ITEMS[id].dur; renderUI(); return; }
  if (k==='trash') { cursor = null; renderUI(); return; }
  if (k==='res') { const r = ui.result; if (!r) return;
    const doCraft = () => { for (let j=0;j<ui.grid.length;j++) if (ui.grid[j]) { ui.grid[j].count--; if (!ui.grid[j].count) ui.grid[j]=null; } Sound.play('craft'); };
    const mk = () => { const o={id:r.id,count:r.count}; if (ITEMS[r.id]&&ITEMS[r.id].dur) o.dur=ITEMS[r.id].dur; return o; };
    if (shift) { let g=0; while (g++<64) { const rr = matchRecipe(ui.grid, ui.size); if (!rr || rr.id!==r.id) break; if (addItem(rr.id, rr.count, ITEMS[rr.id]&&ITEMS[rr.id].dur?ITEMS[rr.id].dur:undefined)) break; doCraft(); } }
    else if (!cursor) { cursor = mk(); doCraft(); }
    else if (cursor.id===r.id && cursor.count + r.count <= maxStack(r.id)) { cursor.count += r.count; doCraft(); }
    renderUI(); refreshHUD(); return; }
  const arr = getArr(k); const s = arr[i];
  if (k==='ar') { // armor slots only accept the matching armor piece
    if (shift && s) { if (!addItem(s.id, 1, s.dur)) arr[i] = null; }
    else if (cursor && ITEMS[cursor.id] && ITEMS[cursor.id].armor === i) { arr[i] = cursor; cursor = s || null; Sound.mat('wool','place'); }
    else if (!cursor && s) { cursor = s; arr[i] = null; }
    renderUI(); refreshHUD(); return; }
  if (shift && s && k==='inv' && ui.type==='inv' && ITEMS[s.id] && ITEMS[s.id].armor !== undefined && !P.armor[ITEMS[s.id].armor]) { P.armor[ITEMS[s.id].armor] = s; arr[i] = null; Sound.mat('wool','place'); renderUI(); refreshHUD(); return; }
  if (shift && s) {
    if (k==='inv' && ui.type==='chest') { const c=ui.chest.items; let n=s.count; for (let j=0;j<27&&n;j++){ const t=c[j]; if (t&&t.id===s.id&&t.count<maxStack(s.id)&&s.dur===undefined){ const a=Math.min(maxStack(s.id)-t.count,n); t.count+=a; n-=a; } } for (let j=0;j<27&&n;j++) if(!c[j]){ c[j]={...s,count:n}; n=0; } if (n) s.count=n; else arr[i]=null; }
    else if (k==='inv') { if (ui.type==='furnace' && (SMELT[s.id]!==undefined || fuelValue(s.id))) { const slot = SMELT[s.id]!==undefined ? 'in':'fuel'; const f=ui.furnace; if (!f[slot]) { f[slot]=s; arr[i]=null; } else if (f[slot].id===s.id) { const a=Math.min(64-f[slot].count, s.count); f[slot].count+=a; s.count-=a; if(!s.count) arr[i]=null; } }
      else { const range = i<9?[9,36]:[0,9]; arr[i]=null; let c=s.count; for (let j=range[0];j<range[1]&&c;j++){ const t=P.inv[j]; if (t&&t.id===s.id&&t.count<maxStack(s.id)&&s.dur===undefined){ const a=Math.min(maxStack(s.id)-t.count,c); t.count+=a; c-=a; } } for (let j=range[0];j<range[1]&&c;j++) if(!P.inv[j]){ P.inv[j]={...s,count:c}; c=0; } if (c) arr[i]={...s,count:c}; } }
    else { arr[i] = null; const left = addItem(s.id, s.count, s.dur); if (left) arr[i] = {...s, count:left}; }
    renderUI(); refreshHUD(); return;
  }
  if (k==='fu' && i==='out') { if (!s) return; if (!cursor) { cursor=s; arr[i]=null; } else if (cursor.id===s.id && cursor.count+s.count<=64) { cursor.count+=s.count; arr[i]=null; } renderUI(); return; }
  if (btn===0) {
    if (!cursor) { if (s) { cursor = s; arr[i] = null; } }
    else if (!s) { arr[i] = cursor; cursor = null; }
    else if (s.id===cursor.id && s.dur===undefined && cursor.dur===undefined) { const a=Math.min(maxStack(s.id)-s.count, cursor.count); s.count+=a; cursor.count-=a; if(!cursor.count) cursor=null; }
    else { arr[i] = cursor; cursor = s; }
  } else if (btn===2) {
    if (!cursor && s) { const half=Math.ceil(s.count/2); cursor={...s,count:half}; s.count-=half; if(!s.count) arr[i]=null; }
    else if (cursor && (!s || (s.id===cursor.id && s.count<maxStack(s.id) && s.dur===undefined))) { if (!s) arr[i]={...cursor,count:1}; else s.count++; cursor.count--; if(!cursor.count) cursor=null; }
  }
  renderUI(); refreshHUD();
});
invPanel.addEventListener('contextmenu', e=>e.preventDefault());
invPanel.addEventListener('mousemove', e => { const el=e.target.closest('.slot'); const tt=$('tooltip'); if (el && ui && !cursor) { let s=null; const k=el.dataset.k; if(k==='cr') s={id:ALL_CREATIVE[+el.dataset.i]}; else if (k==='res') s=ui.result; else if (k!=='trash') { const arr=getArr(k); s=arr&&arr[k==='fu'?el.dataset.i:+el.dataset.i]; } if (s){ tt.innerHTML=itemName(s.id) + (s.ench ? `<br><span style="color:#a0a0ff">${enchName(s)}</span>` : ''); tt.style.display='block'; tt.style.left=(e.clientX+14)+'px'; tt.style.top=(e.clientY-30)+'px'; return; } } tt.style.display='none'; });
$('inv').addEventListener('mousedown', e => { if (e.target.id==='inv' && cursor) { spawnDrop(cursor.id, cursor.dur!==undefined?{dur:cursor.dur}:cursor.count, P.pos.x, P.pos.y+1.4, P.pos.z, dirVec().multiplyScalar(5)); cursor=null; renderUI(); } });
addEventListener('mousemove', e => { mouseX=e.clientX; mouseY=e.clientY; if (cursor) updateCursor(); });
function playerIcon(){ const c=document.createElement('canvas'); c.width=16; c.height=32; const x=c.getContext('2d'); const f=(col,a,b,w,h)=>{x.fillStyle=col;x.fillRect(a,b,w,h);};
  f('#d8a838',4,0,8,3); f('#c8946a',4,2,8,6); f('#d8a838',4,2,8,1); f('#fff',5,4,2,1); f('#fff',9,4,2,1); f('#3a7a3a',6,4,1,1); f('#3a7a3a',9,4,1,1); f('#8a5a3a',6,6,4,1);
  f('#c4572e',4,8,8,12); f('#c4572e',0,8,4,8); f('#c4572e',12,8,4,8); f('#c8946a',0,16,4,4); f('#c8946a',12,16,4,4); f('#4a4f57',4,20,8,10); f('#333',4,30,8,2); return c.toDataURL(); }

// ---------- furnaces ----------
function furnaceAt(x,y,z){ const k=x+','+y+','+z; return world.furnaces[k] || (world.furnaces[k] = { in:null, fuel:null, out:null, burn:0, burnMax:0, cook:0 }); }
let furnaceUIT = 0;
function updateFurnaces(dt) {
  for (const k in world.furnaces) { const f = world.furnaces[k]; const [x,y,z] = k.split(',').map(Number);
    if (!world.isLoaded(x,z)) continue; const id = world.getBlock(x,y,z); if (id!==B.FURNACE && id!==B.FURNACE_LIT) { delete world.furnaces[k]; continue; }
    const out = f.in ? SMELT[f.in.id] : undefined; const canSmelt = out!==undefined && (!f.out || (f.out.id===out && f.out.count<maxStack(out)));
    if (f.burn <= 0 && canSmelt && f.fuel) { const fv = fuelValue(f.fuel.id); if (fv) { f.burn = f.burnMax = fv/1.5*1.5; f.fuel.count--; if (!f.fuel.count) f.fuel=null; } }
    if (f.burn > 0) { f.burn -= dt; if (canSmelt) { f.cook += dt; if (f.cook >= 10) { f.cook = 0; f.in.count--; if (!f.in.count) f.in=null; if (f.out) f.out.count++; else f.out={id:out,count:1}; } } else f.cook = 0; } else f.cook = Math.max(0, f.cook - dt*2);
    const lit = f.burn > 0; if (lit && id===B.FURNACE) world.setBlock(x,y,z,B.FURNACE_LIT, world.getMeta(x,y,z)); else if (!lit && id===B.FURNACE_LIT) world.setBlock(x,y,z,B.FURNACE, world.getMeta(x,y,z));
  }
  if (ui && ui.type==='furnace') { furnaceUIT -= dt; if (furnaceUIT<=0) { furnaceUIT=0.25; renderUI(); } }
}

// ---------- player model (third person) & hand ----------
function skinTex(draw,w=8,h=8){ return makeCanvasTex(w,h,draw); }
const pm = (()=>{ const g=new THREE.Group(); const mk=(w,h,d,mats,y,ox=0,oy=0)=>{ const geo=new THREE.BoxGeometry(w,h,d); geo.translate(0,oy,0); const m=new THREE.Mesh(geo, mats); m.position.set(ox,y,0); g.add(m); return m; };
  const skin=[200,148,106]; const fill=(x,c,a,b,w,h)=>{x.fillStyle=c;x.fillRect(a,b,w,h);};
  const face=skinTex(x=>{ fill(x,'#c8946a',0,0,8,8); fill(x,'#d8a838',0,0,8,2); fill(x,'#fff',1,4,2,1); fill(x,'#fff',5,4,2,1); fill(x,'#3a7a3a',2,4,1,1); fill(x,'#3a7a3a',5,4,1,1); fill(x,'#8a5a3a',3,6,2,1); });
  const hair=skinTex(x=>{ fill(x,'#d8a838',0,0,8,8); }); const headSide=skinTex(x=>{ fill(x,'#c8946a',0,0,8,8); fill(x,'#d8a838',0,0,8,3); });
  const shirt=skinTex(x=>{ fill(x,'#c4572e',0,0,8,8); fill(x,'#a8471f',0,6,8,2); }); const arm=skinTex(x=>{ fill(x,'#c4572e',0,0,8,3); fill(x,'#c8946a',0,3,8,5); }); const pants=skinTex(x=>{ fill(x,'#4a4f57',0,0,8,7); fill(x,'#444',0,7,8,1); });
  const M=t=>new THREE.MeshBasicMaterial({map:t});
  const head = mk(0.5,0.5,0.5,[M(headSide),M(headSide),M(hair),M(headSide),M(face),M(hair)],1.5,0,0.25);
  mk(0.5,0.75,0.25,M(shirt),0.75,0,0.375);
  const la = mk(0.25,0.75,0.25,M(arm),1.5,-0.375,-0.33), ra = mk(0.25,0.75,0.25,M(arm),1.5,0.375,-0.33);
  const ll = mk(0.25,0.75,0.25,M(pants),0.75,-0.125,-0.375), rl = mk(0.25,0.75,0.25,M(pants),0.75,0.125,-0.375);
  // armor overlays (shown when worn)
  const AMat = () => new THREE.MeshBasicMaterial({ color:0xffffff });
  const ov = (parent, w,h,d, oy) => { const geo = new THREE.BoxGeometry(w,h,d); geo.translate(0,oy,0); const m = new THREE.Mesh(geo, AMat()); m.visible = false; parent.add(m); return m; };
  const armor = [ [ov(head,0.58,0.3,0.58,0.37)], [ov(g.children[1],0.56,0.8,0.31,0.375), ov(la,0.3,0.4,0.3,-0.15), ov(ra,0.3,0.4,0.3,-0.15)], [ov(ll,0.29,0.55,0.29,-0.3), ov(rl,0.29,0.55,0.29,-0.3)], [ov(ll,0.3,0.2,0.3,-0.65), ov(rl,0.3,0.2,0.3,-0.65)] ];
  scene.add(g); g.visible=false; return { g, head, la, ra, ll, rl, armor }; })();
const ARMOR_COL = { L:0x8a5530, I:0xd0d0d0, G:0xf0c830, D:0x40d8c8 };
const handGroup = new THREE.Group(); camera.add(handGroup);
let handItemId = -1, handMesh = null;
function updateHand() {
  const s = held(); const id = s ? s.id : 0;
  if (id !== handItemId) { handItemId = id; if (handMesh) handGroup.remove(handMesh);
    if (!id) { handMesh = new THREE.Mesh(new THREE.BoxGeometry(0.17,0.17,0.6), new THREE.MeshBasicMaterial({ map: skinTex(x=>{x.fillStyle='#c8946a';x.fillRect(0,0,8,8);x.fillStyle='#b8845a';x.fillRect(0,0,8,1);}) })); handMesh.position.set(0.5,-0.45,-0.55); handMesh.rotation.set(0.1,0.15,0); }
    else if (id<256 && BLOCKS[id].render==='cube') { handMesh = makeItemMesh(id, 0.26); handMesh.position.set(0.48,-0.4,-0.8); handMesh.rotation.set(0,0.75,0); }
    else { handMesh = makeItemMesh(id, 0.3); handMesh.position.set(0.5,-0.33,-0.78); handMesh.rotation.set(0, -1.0, 0.15); }
    handGroup.add(handMesh); }
  const l = brightnessAt(P.pos.x, P.pos.y+1.6, P.pos.z); (Array.isArray(handMesh.material)?handMesh.material:[handMesh.material]).forEach(m=>m.color.setRGB(l,l,l));
  const sw = P.swing>0 ? Math.sin((1-P.swing/0.3)*Math.PI) : 0;
  const bob = Math.sin(P.walkDist*1.8)*0.03*(P.onGround?1:0);
  handGroup.position.set(-sw*0.15 + bob, -sw*0.15 - Math.abs(bob)*0.8 - (P.eatT>0?Math.abs(Math.sin(P.eatT*20))*0.05:0), sw*0.1);
  handGroup.rotation.x = -sw*0.6; if (P.drawing) { const d=Math.min(1,P.drawT); handGroup.position.x -= d*0.25; handGroup.position.z += d*0.12; handGroup.rotation.z = d*0.4; } else handGroup.rotation.z = 0; handGroup.visible = view===0 && !handGroup.userData.hidden;
}
function dirVec(){ return new THREE.Vector3(-Math.sin(P.yaw)*Math.cos(P.pitch), Math.sin(P.pitch), -Math.cos(P.yaw)*Math.cos(P.pitch)); }

// ---------- interaction ----------
function breakTime(id) {
  const d = BLOCKS[id]; if (d.hardness < 0) return Infinity; if (P.mode==='creative') return 0;
  const s = held(); const it = s && s.id>=256 ? ITEMS[s.id] : null;
  let speed = 1; const toolOk = it && it.tool === d.tool;
  if (toolOk) speed = it.speed; if (it && it.tool==='sword' && d.leaves) speed = 1.5;
  const canHarvest = !d.tool || d.tier===0 && d.tool!=='pick' || (toolOk && it.tier >= d.tier) || (d.tool!=='pick');
  if (toolOk && s.ench) speed += s.ench*s.ench + 1;
  let t = d.hardness * (canHarvest ? 1.5 : 5) / speed;
  if (P.inWater) t *= 5; if (!P.onGround && !P.flying) t *= 5;
  return Math.max(0.05, t);
}
function harvestable(id) { const d=BLOCKS[id]; if (d.tool!=='pick') return true; const s=held(); const it=s&&s.id>=256?ITEMS[s.id]:null; return it && it.tool==='pick' && it.tier>=d.tier; }
function useTool(){ const s=held(); if (!s || s.dur===undefined || P.mode==='creative') return; s.dur--; if (s.dur<=0) { P.inv[P.sel]=null; Sound.play('glass'); Sound.mat('wood','break'); } refreshHUD(); }
function finishBreak(t) {
  const id = t.id, d = BLOCKS[id]; t.meta = world.getMeta(t.x,t.y,t.z);
  Sound.mat(d.snd, 'break'); particles(t.x+0.5,t.y+0.5,t.z+0.5,id,14);
  if (id===B.CHEST && world.chests) { const k=t.x+','+t.y+','+t.z; const c=world.chests[k]; if (c) { for (const s of c.items) if (s) spawnDrop(s.id, s.dur!==undefined?{dur:s.dur}:s.count, t.x+0.5,t.y+0.5,t.z+0.5); delete world.chests[k]; } }
  if (id===B.FURNACE || id===B.FURNACE_LIT) { const f = world.furnaces[t.x+','+t.y+','+t.z]; if (f) { for (const s of [f.in,f.fuel,f.out]) if (s) spawnDrop(s.id,s.count,t.x+0.5,t.y+0.5,t.z+0.5); delete world.furnaces[t.x+','+t.y+','+t.z]; } }
  world.setBlock(t.x,t.y,t.z,B.AIR); rebuildNow(t.x,t.z);
  if (id===B.DOOR || id===B.DOOR_OPEN) { const oy = (t.meta&4) ? -1 : 1; const o = world.getBlock(t.x,t.y+oy,t.z); if (o===B.DOOR || o===B.DOOR_OPEN) world.setBlock(t.x,t.y+oy,t.z,B.AIR); if (t.meta&4) t.id = -1; }
  if (P.mode==='survival') {
    if (harvestable(id)) { let drop = d.drop; if (d.leaves) { const r=Math.random(); drop = r<0.05 ? I.APPLE : r<0.1 ? I.STICK : r<0.18 ? B.SAPLING : 0; }
      if (id===B.TALLGRASS && Math.random()<0.15) drop = I.SEEDS;
      if (id===B.GRAVEL && Math.random()<0.12) drop = I.FLINT;
      const xpv = {[B.COAL_ORE]:1,[B.DIAMOND_ORE]:5,[B.LAPIS_ORE]:3,[B.REDSTONE_ORE]:2,[B.QUARTZ_ORE]:3}[id]; if (xpv) spawnXP(t.x+0.5,t.y+0.5,t.z+0.5,xpv);
      if (id===B.WHEAT) { if (t.meta>=7) { spawnDrop(I.WHEAT,1,t.x+0.5,t.y+0.5,t.z+0.5); drop = I.SEEDS; spawnDrop(I.SEEDS, 1+(Math.random()*2|0), t.x+0.5,t.y+0.5,t.z+0.5); } else drop = I.SEEDS; } if (drop) spawnDrop(drop, 1, t.x+0.5, t.y+0.5, t.z+0.5); }
    const s=held(); if (s && ITEMS[s.id] && ITEMS[s.id].tool && d.hardness>0) useTool();
    P.exh += 0.005;
  }
}
function interact() {
  const o = camera.getWorldPosition(new THREE.Vector3()); const d = dirVec();
  const hit = raycast(eyePos(), d, P.mode==='creative'?6:5);
  const s = held();
  { const mh = mobs.raycast(eyePos(), d, 3.5); if (mh && !raycastSolid(eyePos(), d, mh.dist)) {
      const fr = s ? mobs.feed(mh.mob, s.id) : false; if (fr === 'tool') { useTool(); P.swing=0.3; return true; }
      if (fr === 'milk') { if (P.mode==='survival') { if (s.count===1) P.inv[P.sel] = {id:I.MILK_BUCKET,count:1}; else { s.count--; if (addItem(I.MILK_BUCKET,1)) spawnDrop(I.MILK_BUCKET,1,P.pos.x,P.pos.y+1,P.pos.z); } } refreshHUD(); P.swing=0.3; return true; }
      if (fr) { if (P.mode==='survival') { s.count--; if (!s.count) P.inv[P.sel]=null; refreshHUD(); } P.swing=0.3; return true; }
      if (mh.mob.type==='villager') { Sound.play('villager'); openTrade(mh.mob); return true; } } }
  if (hit) {
    if ((hit.id===B.CRAFTING) && !P.sneak) { openUI('table'); return true; }
    if ((hit.id===B.FURNACE || hit.id===B.FURNACE_LIT) && !P.sneak) { openUI('furnace', furnaceAt(hit.x,hit.y,hit.z)); return true; }
    if ((hit.id===B.DOOR || hit.id===B.DOOR_OPEN) && !P.sneak) { const m = world.getMeta(hit.x,hit.y,hit.z); const oy = (m&4) ? -1 : 1; const nid = hit.id===B.DOOR ? B.DOOR_OPEN : B.DOOR;
      world.setBlock(hit.x,hit.y,hit.z,nid,m); if (world.getBlock(hit.x,hit.y+oy,hit.z)===hit.id) world.setBlock(hit.x,hit.y+oy,hit.z,nid,world.getMeta(hit.x,hit.y+oy,hit.z)); rebuildNow(hit.x,hit.z); Sound.mat('wood','place'); P.swing=0.3; return true; }
    if (hit.id===B.ENCHANT_TABLE && !P.sneak) { openUI('enchant'); return true; }
    if (hit.id===B.CHEST && !P.sneak) { openUI('chest', null, chestAt(hit.x,hit.y,hit.z)); Sound.play('chest'); return true; }
    if (hit.id===B.BED && !P.sneak) { P.spawn = new THREE.Vector3(hit.x+0.5, hit.y+1.01, hit.z+0.5);
      if (daylight() < 0.4) { const near = mobs.list.some(m=>m.d.hostile && m.deadT<0 && m.pos.distanceTo(P.pos)<8); if (near && P.mode==='survival') showMsg('You may not rest now; there are monsters nearby'); else sleep(); }
      else showMsg('Respawn point set. You can only sleep at night'); return true; }
  }
  if (hit && s && ITEMS[s.id] && ITEMS[s.id].tool==='hoe' && (hit.id===B.GRASS || hit.id===B.DIRT) && !world.getBlock(hit.x,hit.y+1,hit.z) ) {
    world.setBlock(hit.x,hit.y,hit.z,B.FARMLAND); rebuildNow(hit.x,hit.z); Sound.mat('grass','place'); useTool(); P.swing=0.3; return true; }
  if (hit && s && ITEMS[s.id] && ITEMS[s.id].tool==='shovel' && (hit.id===B.GRASS || hit.id===B.SWAMP_GRASS || hit.id===B.SNOW_GRASS) && !SOLID[world.getBlock(hit.x,hit.y+1,hit.z)]) {
    if (BLOCKS[world.getBlock(hit.x,hit.y+1,hit.z)].plant) world.setBlock(hit.x,hit.y+1,hit.z,B.AIR);
    world.setBlock(hit.x,hit.y,hit.z,B.PATH); rebuildNow(hit.x,hit.z); Sound.mat('grass','place'); useTool(); P.swing=0.3; return true; }
  if (hit && s && s.id===I.BONE_MEAL && (hit.id===B.WHEAT || hit.id===B.SAPLING || hit.id===B.GRASS)) {
    if (hit.id===B.WHEAT) { const m = world.getMeta(hit.x,hit.y,hit.z); if (m >= 7) return false; world.setBlock(hit.x,hit.y,hit.z,B.WHEAT,Math.min(7,m+2+(Math.random()*3|0))); }
    else if (hit.id===B.SAPLING) { if (Math.random() < 0.45) world.growTree(hit.x,hit.y,hit.z); }
    else { for (let k=0;k<12;k++) { const gx=hit.x+(Math.random()*7-3|0), gz=hit.z+(Math.random()*7-3|0); for (let gy=hit.y+2; gy>=hit.y-2; gy--) if (world.getBlock(gx,gy,gz)===B.GRASS && world.getBlock(gx,gy+1,gz)===B.AIR) { world.setBlock(gx,gy+1,gz, Math.random()<0.8?B.TALLGRASS:(Math.random()<0.5?B.ROSE:B.DANDELION),0,true); break; } } }
    rebuildNow(hit.x,hit.z); particles(hit.x+0.5,hit.y+1,hit.z+0.5,null,8,0x60e060,true); Sound.mat('grass','place');
    if (P.mode==='survival') { s.count--; if (!s.count) P.inv[P.sel]=null; refreshHUD(); } P.swing=0.3; return true; }
  if (hit && s && s.id===I.SEEDS && hit.id===B.FARMLAND && hit.n[1]===1 && !world.getBlock(hit.x,hit.y+1,hit.z)) {
    world.setBlock(hit.x,hit.y+1,hit.z,B.WHEAT,0); rebuildNow(hit.x,hit.z); Sound.mat('grass','place'); if (P.mode==='survival') { s.count--; if (!s.count) P.inv[P.sel]=null; refreshHUD(); } P.swing=0.3; return true; }
  if (s && (s.id===I.BUCKET || s.id===I.WATER_BUCKET || s.id===I.LAVA_BUCKET)) {
    P.swing = 0.3;
    if (s.id===I.BUCKET) { const fh = raycastFluid(eyePos(), d, 5); if (fh) { const filled = fh.id===B.WATER ? I.WATER_BUCKET : I.LAVA_BUCKET; world.setBlock(fh.x,fh.y,fh.z,B.AIR); rebuildNow(fh.x,fh.z); Sound.play('splash');
        if (P.mode==='survival') { if (s.count===1) P.inv[P.sel] = {id:filled,count:1}; else { s.count--; if (addItem(filled,1)) spawnDrop(filled,1,P.pos.x,P.pos.y+1,P.pos.z); } } refreshHUD(); return true; } return false; }
    if (hit) { let tx=hit.x, ty=hit.y, tz=hit.z; if (!BLOCKS[hit.id].replace) { tx+=hit.n[0]; ty+=hit.n[1]; tz+=hit.n[2]; }
      if (BLOCKS[world.getBlock(tx,ty,tz)].replace) { world.setBlock(tx,ty,tz, s.id===I.WATER_BUCKET?B.WATER:B.LAVA, 0); rebuildNow(tx,tz); Sound.play(s.id===I.WATER_BUCKET?'splash':'lava'); if (P.mode==='survival') P.inv[P.sel] = {id:I.BUCKET,count:1}; refreshHUD(); return true; } }
    return false; }
  if (hit && s && s.id===I.FLINT_STEEL) { P.swing=0.3; Sound.noise(0.15,'highpass',3000,1,0.4); useTool();
    const tx=hit.x+hit.n[0], ty=hit.y+hit.n[1], tz=hit.z+hit.n[2]; if (world.getBlock(tx,ty,tz)===B.AIR) { if (!tryLightPortal(tx,ty,tz)) showMsg('Build an obsidian frame (4 wide, 5 tall) to make a portal'); } return true; }
  if (s && ITEMS[s.id] && ITEMS[s.id].armor !== undefined) { const sl = ITEMS[s.id].armor; const old = P.armor[sl]; P.armor[sl] = s; P.inv[P.sel] = old; Sound.mat('wool','place'); refreshHUD(); return true; }
  if (s && s.id===I.BOW) { if (P.mode==='creative' || P.inv.some(x=>x&&x.id===I.ARROW)) { P.drawing = true; P.drawT = 0; } return false; }
  if (s && ITEMS[s.id] && ITEMS[s.id].food) { if (P.food < 20 || P.mode==='creative') { P.eating = true; } return false; }
  if (!hit || !s || s.id >= 256) return false;
  let tx=hit.x, ty=hit.y, tz=hit.z;
  if (!BLOCKS[hit.id].replace || hit.id===s.id) { tx+=hit.n[0]; ty+=hit.n[1]; tz+=hit.n[2]; }
  const cur = world.getBlock(tx,ty,tz); if (!BLOCKS[cur].replace || ty<0 || ty>=CH) return false;
  const bd = BLOCKS[s.id];
  if (bd.solid) { // check entity overlap
    const ov = (e)=> e.pos.x+e.hw > tx && e.pos.x-e.hw < tx+1 && e.pos.y+e.h > ty && e.pos.y < ty+1 && e.pos.z+e.hw > tz && e.pos.z-e.hw < tz+1;
    if (ov(P) || mobs.list.some(ov)) return false; }
  let torchMeta = 0;
  if (s.id===B.TORCH && hit.n[1]===0 && SOLID[hit.id]) torchMeta = hit.n[0]===1 ? 1 : hit.n[0]===-1 ? 2 : hit.n[2]===1 ? 3 : 4;
  else if ((bd.plant || s.id===B.TORCH) ) { const below = world.getBlock(tx,ty-1,tz); if (!SOLID[below]) return false; if (bd.plant && s.id!==B.DEADBUSH && !bd.mush && below!==B.GRASS && below!==B.DIRT && below!==B.SNOW_GRASS && below!==B.SPORE_TURF) return false; }
  if (s.id===B.CACTUS) { const below=world.getBlock(tx,ty-1,tz); if (below!==B.SAND && below!==B.CACTUS) return false; }
  let meta = 0; if (s.id===B.FURNACE || s.id===B.CHEST || s.id===B.PUMPKIN || s.id===B.JACK) { const a = Math.round(P.yaw/(Math.PI/2)) & 3; meta = [4,0,5,1][a]; }
  if (s.id===B.TORCH) meta = torchMeta;
  if (BLOCKS[s.id].render==='stairs') { const a = Math.round(P.yaw/(Math.PI/2)) & 3; meta = [2,1,0,3][a]; }
  if (s.id===B.CANE) { const below = world.getBlock(tx,ty-1,tz); if (![B.CANE,B.SAND,B.GRASS,B.DIRT].includes(below)) return false; }
  if (s.id===B.LADDER) { if (hit.n[1]!==0 || !SOLID[hit.id]) return false; meta = hit.n[0]===1 ? 0 : hit.n[0]===-1 ? 1 : hit.n[2]===1 ? 2 : 3; }
  if (s.id===B.DOOR) { if (!BLOCKS[world.getBlock(tx,ty+1,tz)].replace || !SOLID[world.getBlock(tx,ty-1,tz)]) return false; const a = Math.round(P.yaw/(Math.PI/2)) & 3; meta = [2,1,0,3][a]; world.setBlock(tx,ty+1,tz,B.DOOR,meta|4); }
  world.setBlock(tx,ty,tz,s.id,meta); rebuildNow(tx,tz);
  Sound.mat(bd.snd || 'stone', 'place');
  if (P.mode==='survival') { s.count--; if (!s.count) P.inv[P.sel]=null; refreshHUD(); }
  P.swing = 0.3; return true;
}
function eyePos(){ return new THREE.Vector3(P.pos.x, P.pos.y + (P.sneak?1.27:1.62), P.pos.z); }
// the mob in melee reach under the crosshair, unless a solid block is closer. Grass, flowers, torches and
// other walk-through blocks do not shield a mob (before, tall grass in front of a pig or spider ate the hit).
function aimedMob() {
  if (!mobs || !world) return null;
  const e = eyePos(), d = dirVec(); const hit = mobs.raycast(e, d, 3.5); if (!hit) return null;
  const bh = raycastSolid(e, d, hit.dist); return bh && bh.dist < hit.dist ? null : hit;
}
function raycastSolid(o, d, maxD) { return raycast(o, d, maxD, true); }
function attack() {
  P.swing = 0.3; P.atkCD = 0.45;
  const hit = aimedMob();
  if (hit) { const s=held(); const it=s&&s.id>=256?ITEMS[s.id]:null; let dmg = it&&it.dmg ? it.dmg : 1; if (s && s.ench && it && it.tool==='sword') dmg += Math.ceil(s.ench*1.25); const crit = !P.onGround && P.vel.y<0; if (crit) dmg = Math.floor(dmg*1.5); mobs.hurt(hit.mob, dmg, P.pos);
    particles(hit.mob.pos.x, hit.mob.pos.y + hit.mob.h*0.6, hit.mob.pos.z, null, crit ? 8 : 4, crit ? 0xffe060 : 0xffffff, true);
    if (it && it.tool) useTool(); P.exh += 0.1; breakT = 0; breakTarget = null; return true; }
  return false;
}
// touch.js asks this on a quick tap: true means the tap should be a left-click attack (villagers stay right-click so tapping one trades)
window.__tcAimMob = () => { try { if (state !== 'play' || !P.alive) return false; const h = aimedMob(); return !!(h && h.mob.deadT < 0 && h.mob.type !== 'villager'); } catch (e) { return false; } };
function pickBlock(){ const h=raycast(eyePos(),dirVec(),6); if (!h) return; const id = h.id===B.FURNACE_LIT?B.FURNACE:h.id; const idx=P.inv.slice(0,9).findIndex(s=>s&&s.id===id); if (idx>=0) P.sel=idx; else if (P.mode==='creative') P.inv[P.sel]={id,count:64}; refreshHUD(); showItemName(); }

// ---------- input ----------
addEventListener('keydown', e => {
  if (e.target.tagName==='INPUT') return;
  Sound.init();
  const k = e.code;
  if (k==='F5' || k==='F3' || k==='Tab') e.preventDefault();
  if (state==='inv') { if (k==='KeyE' || k==='Escape' || (k==='KeyT' && ui && ui.type==='trade')) closeUI(); return; }
  if (state!=='play') { if (k==='Escape' && state==='pause') resume(); return; }
  if (!keys[k]) {
    if (k==='KeyW') { const now=performance.now(); if (now-lastWTap<300) P.sprint=true; lastWTap=now; }
    if (k==='Space' && P.mode==='creative') { const now=performance.now(); if (now-lastSpaceTap<300) { P.flying=!P.flying; P.vel.y=0; } lastSpaceTap=now; }
    if (k.startsWith('Digit')) { const n=+k.slice(5); if (n>=1&&n<=9){ P.sel=n-1; refreshHUD(); showItemName(); } }
    if (k==='KeyE') { openUI('inv'); document.exitPointerLock && document.exitPointerLock(); }
    if (k==='KeyT' && tradeNearest()) { keys[k] = false; return; }
    if (k==='F5') view=(view+1)%3;
    if (k==='F1') { e.preventDefault(); const hud=$('hud'); hud.style.visibility = hud.style.visibility==='hidden' ? '' : 'hidden'; handGroup.userData.hidden = hud.style.visibility==='hidden'; }
    if (k==='F2') { e.preventDefault(); renderer.render(scene, camera); const a=document.createElement('a'); a.href=canvas.toDataURL('image/png'); a.download='blockhaven-'+new Date().toISOString().replace(/[:.]/g,'-')+'.png'; a.click(); showMsg('Saved screenshot'); Sound.play('click'); }
    if (k==='F3') { debug=!debug; $('debug').style.display=debug?'block':'none'; }
    if (k==='KeyQ') { const s=held(); if (s) { const all = e.ctrlKey; const n = all? s.count:1; spawnDrop(s.id, s.dur!==undefined?{dur:s.dur}:n, P.pos.x, P.pos.y+1.4, P.pos.z, dirVec().multiplyScalar(5)); s.count-=n; if (s.count<=0) P.inv[P.sel]=null; refreshHUD(); } }
  }
  keys[k] = true;
  if (k==='ControlLeft' && keys.KeyW) P.sprint = true;
  if (['Space','ArrowUp','ArrowDown'].includes(k)) e.preventDefault();
});
addEventListener('keyup', e => { keys[e.code] = false; if (e.code==='KeyW') P.sprint=false; });
addEventListener('blur', ()=>{ for (const k in keys) keys[k]=false; mouseL=mouseR=false; });
canvas.addEventListener('mousedown', e => {
  Sound.init();
  if (state==='play' && !locked && !AUTO) { canvas.requestPointerLock(); return; }
  if (state!=='play') return;
  if (e.button===0) { mouseL = true; if (!attack()) {} }
  if (e.button===2) { mouseR = true; placeCD = 0.25; interact(); }
  if (e.button===1) pickBlock();
});
addEventListener('mouseup', e => { if (e.button===0) { mouseL=false; breakT=0; breakTarget=null; } if (e.button===2) { mouseR=false; P.eating=false; P.eatT=0; if (P.drawing) releaseBow(); } });
function releaseBow() {
  P.drawing = false; const power = Math.min(1, P.drawT/1.0); if (power < 0.1 || !mobs) return;
  if (P.mode==='survival') { const i = P.inv.findIndex(x=>x&&x.id===I.ARROW); if (i<0) return; P.inv[i].count--; if (!P.inv[i].count) P.inv[i]=null; useTool(); }
  const d = dirVec(); const from = eyePos().addScaledVector(d, 0.5); mobs.playerShoot(from, d.multiplyScalar(8 + power*42)); refreshHUD();
}
addEventListener('contextmenu', e => e.preventDefault());
addEventListener('wheel', e => { if (state!=='play') return; P.sel = (P.sel + (e.deltaY>0?1:-1) + 9) % 9; refreshHUD(); showItemName(); }, { passive:true });
addEventListener('mousemove', e => { if (state==='play' && locked) { const s = 0.0022*OPT.sens/100; P.yaw -= e.movementX*s; P.pitch -= e.movementY*s; P.pitch = Math.max(-1.55, Math.min(1.55, P.pitch)); } });
document.addEventListener('pointerlockchange', () => { locked = document.pointerLockElement === canvas; if (!locked && state==='play') setState('pause'); });

// ---------- menus ----------
const screens = ['title','worlds','create','options','pause','death','loading','quit'];
let prevScreen = 'title';
function setState(s) {
  state = s;
  const scr = s==='dead'?'death': s==='play'||s==='inv'? null : s;
  for (const n of screens) $(n).classList.toggle('on', n===scr);
  $('hud').classList.toggle('on', s==='play'||s==='inv'||s==='pause'||s==='dead');
  $('inv').classList.toggle('on', s==='inv');
  if (s!=='play' && locked) document.exitPointerLock();
  if (s==='pause') $('pmode').textContent = 'Game Mode: ' + (P.mode==='creative'?'Creative':'Survival');
  if (s==='title' || s==='worlds' || s==='create') document.body.style.cursor='default';
  if (s==='play' || s==='inv') refreshHUD();
}
function resume(){ setState('play'); if (!AUTO) canvas.requestPointerLock(); }
let selWorld = null, createMode = 'survival';
function renderWorlds(){ const list = worldList().sort((a,b)=>b.last-a.last); $('worldlist').innerHTML = list.length ? list.map(w=>`<div class="world ${w.id===selWorld?'sel':''}" data-id="${w.id}"><div class="n">${w.name.replace(/</g,'&lt;')}</div><div class="d">Seed: ${String(w.seed).replace(/</g,'&lt;')} · ${w.mode==='creative'?'Creative':'Survival'} · ${new Date(w.last).toLocaleString()}</div></div>`).join('') : '<div style="padding:20px;color:#aaa;font-size:24px;text-align:center">No worlds yet. Create one!</div>'; }
$('worldlist').addEventListener('click', e => { const el=e.target.closest('.world'); if (el) { if (selWorld===el.dataset.id) { act('playsel'); return; } selWorld=el.dataset.id; renderWorlds(); } });
function playWorld(id){ const w = worldList().find(w=>w.id===id); if (!w) return; const data = JSON.parse(localStorage.getItem('bh_w_'+id) || 'null'); worldId=id; worldName=w.name; startWorld(w.seed, w.mode, data); }
function act(a) {
  Sound.init(); Sound.play('click');
  switch (a) {
    case 'singleplayer': case 'worlds': selWorld=null; renderWorlds(); setState('worlds'); break;
    case 'back': setState('title'); break;
    case 'create': $('wname').value = 'New World'; $('wseed').value=''; createMode='survival'; $('wmode').textContent='Game Mode: Survival'; setState('create'); break;
    case 'togglemode': createMode = createMode==='survival'?'creative':'survival'; $('wmode').textContent='Game Mode: '+(createMode==='creative'?'Creative':'Survival'); break;
    case 'docreate': { const name = $('wname').value.trim() || 'New World'; let seed = $('wseed').value.trim(); if (!seed) seed = String(Math.floor(Math.random()*1e9)); const id = 'w'+Date.now(); const list = worldList(); list.push({ id, name, seed, mode:createMode, last:Date.now() }); localStorage.setItem('bh_worlds', JSON.stringify(list)); worldId=id; worldName=name; startWorld(seed, createMode, null); break; }
    case 'playsel': if (selWorld) playWorld(selWorld); break;
    case 'delsel': if (selWorld && confirm('Delete this world forever?')) { localStorage.removeItem('bh_w_'+selWorld); localStorage.setItem('bh_worlds', JSON.stringify(worldList().filter(w=>w.id!==selWorld))); selWorld=null; renderWorlds(); } break;
    case 'options': prevScreen = state; renderOptions(); setState('options'); break;
    case 'optdone': localStorage.setItem('bh_opts', JSON.stringify(OPT)); setState(prevScreen==='pause'?'pause':'title'); break;
    case 'quit': setState('quit'); try { window.close(); } catch(e){} break;
    case 'resume': resume(); break;
    case 'pmode': P.mode = P.mode==='creative'?'survival':'creative'; if (P.mode==='survival') P.flying=false; $('pmode').textContent='Game Mode: '+(P.mode==='creative'?'Creative':'Survival'); refreshHUD(); break;
    case 'savequit': saveWorld(); clearWorld(); startTitle(); break;
    case 'respawn': respawn(); if (!AUTO) canvas.requestPointerLock(); break;
  }
}
document.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => act(b.dataset.act)));
const OPT_LABEL = { render: v=>`Render Distance: ${v} chunks`, fov: v=>`FOV: ${v===70?'Normal':v}`, sens: v=>`Sensitivity: ${v}%`, vol: v=>`Master Volume: ${v===0?'OFF':v+'%'}` };
function renderOptions(){ document.querySelectorAll('.slider').forEach(sl => { const k=sl.dataset.opt, inp=sl.querySelector('input'); inp.min=sl.dataset.min; inp.max=sl.dataset.max; inp.step=sl.dataset.step; inp.value=OPT[k];
  const upd=()=>{ const v=+inp.value; OPT[k]=v; sl.querySelector('.lab').textContent=OPT_LABEL[k](v); const f=(v-inp.min)/(inp.max-inp.min); sl.querySelector('.knob').style.left=`calc(${f*100}% - ${f*16}px)`;
    if (k==='fov') { camera.fov=v; camera.updateProjectionMatrix(); } if (k==='vol') Sound.setVol(v/100); }; inp.oninput=upd; upd(); }); }
const SPLASHES = ['Also try caves!','100% hand-drawn pixels!','Infinite-ish!','Now with lava!','Punch trees!','Sounds made in code!','Watch out at night!','Seeded!','Diamonds below!','Now with farming!','Sleep through the night!','Mind the Fuselings!','3D clouds!','Climb ladders!','Rain and snow!','Visit the Nether!','Find a village!','Tame a wolf!','Jungles and badlands!','Collect XP!','Trade with villagers!','Enchant your tools!','Raid a dungeon!','Thunderstorms!','Desert temples!','Now with armor!','Blossom groves!','Frost spires!','Mind the Frostlings!','Fungal meadows!'];
{ const logo = document.querySelector('h1.logo'); const c = iconCanvas(B.STONE); const big=document.createElement('canvas'); big.width=big.height=64; const bx=big.getContext('2d'); bx.imageSmoothingEnabled=false; bx.drawImage(c,0,0,64,64);
  Object.assign(logo.style, { backgroundImage:`url(${big.toDataURL()})`, backgroundSize:'64px 64px', webkitBackgroundClip:'text', backgroundClip:'text', color:'transparent', textShadow:'none', filter:'drop-shadow(3px 3px 0 #555) drop-shadow(3px 3px 0 #222) drop-shadow(0 0 2px #000)', imageRendering:'pixelated' });
  const dirt = iconCanvas(B.DIRT); const db=document.createElement('canvas'); db.width=db.height=64; const dx=db.getContext('2d'); dx.imageSmoothingEnabled=false; dx.drawImage(dirt,0,0,64,64); dx.fillStyle='rgba(0,0,0,0.6)'; dx.fillRect(0,0,64,64);
  document.querySelectorAll('.dirt-bg').forEach(el=>el.style.backgroundImage=`url(${db.toDataURL()})`); }
function startTitle() {
  worldId = null; rain.visible = false; weather.amt = 0; weather.raining = false; $('splash').textContent = SPLASHES[Math.random()*SPLASHES.length|0];
  clearWorld(); world = new World('blockhaven-title'); mobs = new Mobs(G); timeOfDay = 0.12;
  let sx=0, sz=0; for (let i=0;i<200;i++){ const c=world.col(sx,sz); if (c.h>SEA+3) break; sx+=37; sz+=11; }
  P.pos.set(sx, world.col(sx,sz).h + 6, sz); P.pitch = -0.05; P.alive = true; titleMode = true;
  setState('title');
}
let titleMode = true;

// ---------- main update ----------
const clock = new THREE.Clock(); let fpsT=0, frames=0, fps=0, autoT=0, saveT=0;
function updatePlayer(dt) {
  if (!chunkMeshes.has(Math.floor(P.pos.x/16)+','+Math.floor(P.pos.z/16))) { P.vel.set(0,0,0); return; }
  const fly = P.flying && P.mode==='creative';
  P.sneak = !!(keys.ShiftLeft || keys.ShiftRight) && !fly;
  let fx=0, fz=0; if (keys.KeyW) fz-=1; if (keys.KeyS) fz+=1; if (keys.KeyA) fx-=1; if (keys.KeyD) fx+=1;
  if (AUTO) { fz = autoplay.f; fx = 0; }
  if (fz>=0 || P.sneak || (P.food<=6 && P.mode==='survival')) P.sprint = false;
  if (keys.ControlLeft && fz<0 && !P.sneak) P.sprint = true;
  const len = Math.hypot(fx,fz)||1; fx/=len; fz/=len;
  const sy=Math.sin(P.yaw), cy=Math.cos(P.yaw);
  const wx = fx*cy + fz*sy, wz = -fx*sy + fz*cy;
  let speed = fly ? (P.sprint?21:10.9) : P.sneak ? 1.3 : P.sprint ? 5.6 : 4.3;
  if (P.inWater && !fly) speed *= 0.5;
  if (P.eating) speed *= 0.3;
  if (P.chillT > 0) { P.chillT -= dt; speed *= 0.55; } // a frostling's hit leaves you chilled and slow for a moment
  const acc = fly ? 6 : P.onGround ? 14 : 3;
  P.vel.x += (wx*speed - P.vel.x)*Math.min(1, dt*acc); P.vel.z += (wz*speed - P.vel.z)*Math.min(1, dt*acc);
  if (fly) { let vy=0; if (keys.Space) vy+=8; if (keys.ShiftLeft) vy-=8; P.vel.y += (vy-P.vel.y)*Math.min(1,dt*10); }
  else if (keys.Space || (AUTO && autoplay.jump)) {
    if (P.inWater || P.inLava) P.vel.y = Math.min(P.vel.y + 40*dt, 3.5);
    else if (P.onGround) { P.vel.y = 8.6; P.exh += P.sprint?0.2:0.05; if (P.sprint) { P.vel.x += -sy*2; P.vel.z += -cy*2; } }
  }
  P.h = P.sneak ? 1.5 : 1.8;
  { const inPortal = world.getBlock(Math.floor(P.pos.x),Math.floor(P.pos.y+0.2),Math.floor(P.pos.z))===B.PORTAL || world.getBlock(Math.floor(P.pos.x),Math.floor(P.pos.y+1.2),Math.floor(P.pos.z))===B.PORTAL;
    P.portalCD = (P.portalCD||0) - dt;
    if (inPortal && P.portalCD <= 0) { P.portalT = (P.portalT||0) + dt; if (Math.random()<0.1) Sound.noise(0.6,'bandpass',300+Math.random()*200,3,0.15); if (P.portalT > (P.mode==='creative'?0.6:3)) { travel(); return; } }
    else P.portalT = 0; }
  const onLadder = !fly && (world.getBlock(Math.floor(P.pos.x),Math.floor(P.pos.y),Math.floor(P.pos.z))===B.LADDER || world.getBlock(Math.floor(P.pos.x),Math.floor(P.pos.y+1),Math.floor(P.pos.z))===B.LADDER);
  if (onLadder) { P.fallStart = null; if (keys.Space || (keys.KeyW && !P.onGround) || (keys.KeyW && P.ladderPush)) P.vel.y = 3; else P.vel.y = Math.max(P.vel.y, P.sneak ? 0 : -2.5); if (P.sneak && P.vel.y < 0) P.vel.y = 0; }
  const prevY = P.pos.y; const wasGround = P.onGround;
  const savedFly = P.flying; P.flying = fly; const pres = physics(P, dt); P.flying = savedFly; P.ladderPush = pres.hitH;
  if (onLadder) P.fallStart = null;
  if (fly && P.onGround) P.flying = false;
  // fall damage
  if (!P.onGround && !fly && !P.inWater) { if (P.fallStart===null || P.pos.y > P.fallStart) P.fallStart = P.pos.y; }
  if (P.inWater || fly) P.fallStart = null;
  if (P.onGround) { if (P.fallStart!==null) { const d = P.fallStart - P.pos.y; if (d > 3.4) { hurtPlayer(Math.floor(d-3), null, 'fell from a high place'); Sound.mat('stone','step'); } P.fallStart = null; } }
  // steps
  const hs = Math.hypot(P.vel.x, P.vel.z);
  if (P.onGround) { P.walkDist += hs*dt; P.stepDist += hs*dt; if (P.stepDist > (P.sprint?2.2:1.7)) { P.stepDist=0; const below=world.getBlock(Math.floor(P.pos.x),Math.floor(P.pos.y-0.1),Math.floor(P.pos.z)); if (below) Sound.mat(BLOCKS[below].snd||'stone','step'); } }
  else if (P.inWater && hs>1) { P.stepDist += hs*dt; if (P.stepDist>2.5){ P.stepDist=0; Sound.play('swim'); } }
  if (P.inWater && !P.wasInWater && P.vel.y < -5) Sound.play('splash'); P.wasInWater = P.inWater;
  if (P.sprint) P.exh += hs*dt*0.1;
  // survival
  if (P.mode==='survival' && P.alive) {
    const headId = world.getBlock(Math.floor(P.pos.x), Math.floor(P.pos.y+1.62), Math.floor(P.pos.z));
    if (headId===B.WATER) { P.air -= dt*20; if (P.air <= 0) { P.air = 0; P.drownT -= dt; if (P.drownT<=0){ P.drownT=1; hurtPlayer(2,null,'drowned'); } } } else P.air = Math.min(300, P.air + dt*60);
    if (P.inLava) { P.lavaT -= dt; if (P.lavaT<=0) { P.lavaT=0.5; P.hurtT=0; hurtPlayer(4,null,'tried to swim in lava'); Sound.play('lava'); } }
    const feet = [world.getBlock(Math.floor(P.pos.x+0.35),Math.floor(P.pos.y+0.5),Math.floor(P.pos.z)), world.getBlock(Math.floor(P.pos.x-0.35),Math.floor(P.pos.y+0.5),Math.floor(P.pos.z)), world.getBlock(Math.floor(P.pos.x),Math.floor(P.pos.y+0.5),Math.floor(P.pos.z+0.35)), world.getBlock(Math.floor(P.pos.x),Math.floor(P.pos.y+0.5),Math.floor(P.pos.z-0.35))];
    if (feet.includes(B.CACTUS)) hurtPlayer(1, null, 'was pricked to death');
    if (P.exh >= 4) { P.exh -= 4; if (P.sat > 0) P.sat = Math.max(0, P.sat-1); else P.food = Math.max(0, P.food-1); refreshHUD(); }
    P.regenT += dt; if (P.regenT > 4) { P.regenT = 0; if (P.food >= 18 && P.health < 20) { P.health++; P.exh += 3; refreshHUD(); } else if (P.food <= 0 && P.health > 1) { P.hurtT=0; hurtPlayer(1,null,'starved to death'); } }
    if (P.pos.y < -20) { P.hurtT=0; hurtPlayer(4,null,'fell out of the world'); }
  } else if (P.pos.y < -30) { P.pos.y = 100; P.vel.set(0,0,0); }
  if (P.hurtT > 0) P.hurtT -= dt;
  // eating
  if (P.eating && mouseR || (P.eating && AUTO)) { P.eatT += dt; if (Math.floor(P.eatT*5) !== Math.floor((P.eatT-dt)*5)) Sound.play('eat');
    if (P.eatT > 1.6) { const s = held(); if (s && ITEMS[s.id] && ITEMS[s.id].food) { const it=ITEMS[s.id]; P.food=Math.min(20,P.food+it.food); P.sat=Math.min(P.food,P.sat+it.sat); if (P.mode==='survival'){ s.count--; if(!s.count) P.inv[P.sel] = s.id===I.MILK_BUCKET ? {id:I.BUCKET,count:1} : null; } Sound.play('burp'); refreshHUD(); } P.eating=false; P.eatT=0; } }
  else { P.eatT = 0; }
  if (P.swing > 0) P.swing -= dt;
  P.creativeCD = (P.creativeCD || 0) - dt; if (!mouseL && !(AUTO && autoplay.breaking)) P.creativeCD = 0;
  // breaking
  const target = raycast(eyePos(), dirVec(), P.mode==='creative'?6:5);
  if (target) { selBox.visible = true; selBox.position.set(target.x+0.5, target.y+0.5, target.z+0.5); const r=BLOCKS[target.id].render; const sh = r==='cross'||r==='torch'?0.7 : BLOCKS[target.id].hgt ? BLOCKS[target.id].hgt : r==='bed'?(target.id===B.FARMLAND?0.9375:0.5625) : 1; selBox.scale.set(1, sh, 1); selBox.position.y -= (1-sh)/2; } else selBox.visible = false;
  // holding the attack button on a mob keeps swinging at it (once per cooldown) instead of mining the block behind it
  P.atkCD = (P.atkCD || 0) - dt; const aimM = mouseL ? aimedMob() : null;
  if (aimM) { if (P.atkCD <= 0) attack(); crackMesh.visible = false; breakTarget = null; breakT = 0; }
  else if ((mouseL || (AUTO && autoplay.breaking)) && target) {
    const same = breakTarget && breakTarget.x===target.x && breakTarget.y===target.y && breakTarget.z===target.z;
    if (!same) { breakTarget = target; breakT = 0; }
    if (P.mode==='creative') { if (P.creativeCD <= 0) { finishBreak(target); P.creativeCD = 0.25; P.swing = 0.3; } }
    else {
      breakT += dt; const bt = breakTime(target.id); P.swing = P.swing>0?P.swing:0.3;
      if (Math.floor(breakT*4) !== Math.floor((breakT-dt)*4)) Sound.mat(BLOCKS[target.id].snd, 'hit');
      if (breakT >= bt) { finishBreak(target); breakT = 0; breakTarget = null; crackMesh.visible=false; }
      else { crackMesh.visible = true; crackMesh.position.set(target.x+0.5,target.y+0.5,target.z+0.5); crackMesh.material.map = crackTex[Math.min(9, Math.floor(breakT/bt*10))]; }
    }
  } else { crackMesh.visible = false; if (!mouseL) breakTarget = null; }
  if (!target) crackMesh.visible = false;
  if (P.drawing) { P.drawT += dt; if (!held() || held().id!==I.BOW) P.drawing = false; }
  if (mouseR && !P.eating && !P.drawing) { placeCD -= dt; if (placeCD <= 0) { placeCD = 0.22; interact(); } }
}
function updateSky(dt) {
  if (state==='play' || state==='inv' || state==='dead' || titleMode) timeOfDay = (timeOfDay + dt/1200) % 1;
  const a = timeOfDay*Math.PI*2; const dl = daylight();
  const sunDir = new THREE.Vector3(Math.cos(a), Math.sin(a), 0.25).normalize();
  const cp = camera.getWorldPosition(new THREE.Vector3());
  sun.position.copy(cp).addScaledVector(sunDir, 400); sun.lookAt(cp);
  moon.position.copy(cp).addScaledVector(sunDir, -400); moon.lookAt(cp);
  stars.position.copy(cp); stars.material.opacity = Math.max(0, 1-dl*1.6); stars.rotation.z = a;
  const day = new THREE.Color(0.47,0.66,1.0), night = new THREE.Color(0.01,0.015,0.04);
  const sky = night.clone().lerp(day, dl);
  sky.lerp(new THREE.Color(0.4,0.43,0.5).multiplyScalar(0.1+0.9*dl), weather.amt*0.7); sun.visible = weather.amt < 0.6 && Math.sin(a) > -0.12; moon.visible = weather.amt < 0.6 && Math.sin(a) < 0.12;
  const horizonGlow = Math.max(0, 1 - Math.abs(Math.sin(a))*4) * (Math.cos(a) > -2 ? 1 : 0);
  const fog = sky.clone().lerp(new THREE.Color(0.95,0.6,0.35), horizonGlow*0.3);
  { const hd = new THREE.Vector3(sunDir.x, 0, sunDir.z).normalize(); sunGlow.position.copy(cp).addScaledVector(hd, 480); sunGlow.position.y += 25; sunGlow.material.opacity = horizonGlow * (1-weather.amt) * 0.85; sunGlow.visible = horizonGlow > 0.02 && world && world.dim !== 'nether'; }
  let fogNear = OPT.render*16*0.55, fogFar = OPT.render*16 - 4;
  const eye = eyePos(); const headB = world ? world.getBlock(Math.floor(eye.x),Math.floor(eye.y),Math.floor(eye.z)) : 0;
  const eyeCh = world && world.getChunk(Math.floor(eye.x)>>4, Math.floor(eye.z)>>4);
  const nether = world && world.dim === 'nether';
  if (nether) { fog.setRGB(0.22,0.04,0.03); fogNear = 8; fogFar = Math.min(fogFar, 70); }
  sun.visible = sun.visible && !nether; moon.visible = moon.visible && !nether; stars.visible = !nether; clouds.visible = !nether;
  uniforms.ambient.value.set(nether?0.46:0.05, nether?0.3:0.05, nether?0.24:0.05);
  if (!nether && eyeCh && eyeCh.lit) { const sl = world.getSky(Math.floor(eye.x),Math.floor(eye.y),Math.floor(eye.z))/15; P.fogDark = P.fogDark===undefined ? sl : P.fogDark + (sl - P.fogDark)*Math.min(1, dt*3); fog.multiplyScalar(0.04 + 0.96*Math.pow(P.fogDark, 1.5)); }
  if (headB===B.WATER) { fog.setRGB(0.05,0.12,0.35).multiplyScalar(0.3+dl*0.7); fogNear=1; fogFar=22; }
  if (headB===B.LAVA) { fog.setRGB(0.8,0.25,0.02); fogNear=0; fogFar=3; }
  if (weather.flash > 0 && !nether) { const k = Math.min(1, weather.flash/0.3) * 0.7; fog.lerp(new THREE.Color(0.85,0.88,1), k); }
  scene.background = fog; uniforms.fogColor.value.copy(fog); uniforms.fogNear.value = fogNear; uniforms.fogFar.value = fogFar;
  waterMat.uniforms.fogNear.value = fogNear; waterMat.uniforms.fogFar.value = fogFar;
  uniforms.sun.value = (0.45 + 0.55*dl) * (1 - 0.22*weather.amt); uniforms.skyTint.value.set(0.7+0.3*dl, 0.78+0.22*dl, 1.0);
  { const X0 = performance.now()/1000*0.8; clouds.position.set(X0 + Math.floor((cp.x - X0)/768)*768 - 768, 128, Math.floor(cp.z/768)*768 - 768);
    const cb = (0.2+0.8*dl) * (1 - 0.35*weather.amt); cloudMat3.color.setRGB(cb, cb, cb*1.03+0.02); }
  // overlays
  let ov = '';
  if (P.hurtT > 0.3) ov = 'radial-gradient(ellipse at center, rgba(255,0,0,0.05) 40%, rgba(255,0,0,0.45))';
  else if (headB===B.WATER) ov = 'rgba(30,60,160,0.25)';
  else if (P.portalT > 0) ov = `rgba(140,40,220,${Math.min(0.7, P.portalT/3*0.7)})`;
  else if (P.inLava) ov = 'rgba(255,90,0,0.5)';
  else if (P.chillT > 0) ov = `radial-gradient(ellipse at center, rgba(180,220,255,0) 50%, rgba(170,215,255,${Math.min(0.5, P.chillT*0.18)}))`;
  overlay.style.background = ov;
}
function updateCamera() {
  const eye = eyePos();
  let bob = 0; if (view===0 && P.onGround && !titleMode) bob = Math.sin(P.walkDist*1.8)*0.05*Math.min(1, Math.hypot(P.vel.x,P.vel.z)/4);
  camera.rotation.order = 'YXZ'; camera.rotation.set(P.pitch, P.yaw, 0);
  if (P.hurtT > 0.2) camera.rotation.z = (P.hurtT-0.2)*0.3;
  if (P.shake > 0) { P.shake -= 1/60; camera.rotation.x += (Math.random()-0.5)*P.shake*0.15; camera.rotation.y += (Math.random()-0.5)*P.shake*0.15; }
  if (!P.alive) camera.rotation.z = 0.4;
  if (view===0) camera.position.set(eye.x, eye.y + Math.abs(bob), eye.z);
  else { const d = dirVec(); const back = view===1 ? -1 : 1; let dist = 4; const h = raycast(eye, d.clone().multiplyScalar(back), 4); if (h) dist = Math.max(0.5, h.dist-0.3);
    camera.position.copy(eye).addScaledVector(d, back*dist); if (view===2) camera.lookAt(eye); }
  const fovT = OPT.fov * (P.sprint ? 1.12 : 1) * (P.drawing ? 1 - 0.15*Math.min(1,P.drawT) : 1); camera.fov += (fovT - camera.fov)*0.2; camera.updateProjectionMatrix();
  // player model
  pm.g.visible = view!==0 && !titleMode;
  if (pm.g.visible) { pm.g.position.set(P.pos.x, P.pos.y, P.pos.z); pm.g.rotation.y = P.yaw + Math.PI; pm.head.rotation.x = -P.pitch;
    const sw = Math.sin(P.walkDist*2.2)*Math.min(1, Math.hypot(P.vel.x,P.vel.z)/4)*0.8; pm.ll.rotation.x = sw; pm.rl.rotation.x = -sw; pm.la.rotation.x = -sw - (P.swing>0?Math.sin(P.swing/0.3*Math.PI)*1.5:0); pm.ra.rotation.x = sw;
    const hid = held() ? held().id : 0; if (pm.heldId !== hid) { pm.heldId = hid; if (pm.heldMesh) pm.ra.remove(pm.heldMesh); pm.heldMesh = null;
      if (hid) { const blk = hid<256 && BLOCKS[hid].render==='cube'; pm.heldMesh = makeItemMesh(hid, blk?0.25:0.35); pm.heldMesh.position.set(0, -0.72, blk?0.14:0.2); if (!blk) pm.heldMesh.rotation.set(0, Math.PI/3, 0.3); pm.ra.add(pm.heldMesh); } }
    pm.armor.forEach((meshes, i) => { const a = P.armor[i]; const key = a ? Object.keys(I).find(k => I[k]===a.id) : null; meshes.forEach(m => { m.visible = !!a; if (a) m.material.userData.base = ARMOR_COL[key[0]]; }); });
    pm.g.position.y -= P.sneak?0.15:0; pm.g.children[1].rotation.x = P.sneak?0.4:0;
    const l = brightnessAt(P.pos.x,P.pos.y+1,P.pos.z); pm.g.traverse(o=>{ if(o.isMesh) (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{ if (m.userData.base !== undefined) m.color.setHex(m.userData.base).multiplyScalar(l); else m.color.setRGB(l,l,l); }); }); }
}
function updateDebug() {
  if (!debug) return; const c = world.col(Math.floor(P.pos.x), Math.floor(P.pos.z));
  const t = raycast(eyePos(), dirVec(), 6);
  $('debug').textContent = `Blockhaven 1.0 (${fps} fps)\nXYZ: ${P.pos.x.toFixed(2)} / ${P.pos.y.toFixed(2)} / ${P.pos.z.toFixed(2)}\nChunk: ${Math.floor(P.pos.x/16)} ${Math.floor(P.pos.z/16)}  loaded: ${world.chunks.size}  meshes: ${chunkMeshes.size}\nBiome: ${world.dim==='nether' ? 'Nether Wastes' : BIOME_NAMES[c.biome]}  Dimension: ${world.dim==='nether'?'Nether':'Overworld'}\nLight: sky ${world.getSky(Math.floor(P.pos.x),Math.floor(P.pos.y+1),Math.floor(P.pos.z))} block ${world.getBl(Math.floor(P.pos.x),Math.floor(P.pos.y+1),Math.floor(P.pos.z))}\nTime: ${(timeOfDay*24000|0)}  Mobs: ${mobs.list.length}\nSeed: ${world.seedStr}\n${t?'Looking at: '+BLOCKS[t.id].name+' '+t.x+','+t.y+','+t.z:''}`;
}
// ---------- autoplay bot ----------
const autoplay = { f:-1, jump:false, breaking:false, t:0, phase:0, yawT:0 };
function updateAuto(dt) {
  const a = autoplay; a.t += dt;
  a.yawT += dt; P.yaw += Math.sin(a.yawT*0.35)*dt*0.5;
  const ahead = new THREE.Vector3(P.pos.x - Math.sin(P.yaw)*0.8, P.pos.y+0.5, P.pos.z - Math.cos(P.yaw)*0.8);
  const blocked = SOLID[world.getBlock(Math.floor(ahead.x),Math.floor(ahead.y),Math.floor(ahead.z))];
  const blocked2 = SOLID[world.getBlock(Math.floor(ahead.x),Math.floor(ahead.y+1),Math.floor(ahead.z))];
  const aid = world.getBlock(Math.floor(ahead.x),Math.floor(ahead.y),Math.floor(ahead.z));
  const tree = BLOCKS[aid].leaves || aid===B.LOG || aid===B.BIRCH_LOG || aid===B.SPRUCE_LOG || BLOCKS[world.getBlock(Math.floor(ahead.x),Math.floor(ahead.y+1),Math.floor(ahead.z))].leaves;
  a.jump = (blocked && !blocked2 && !tree) || P.inWater; if ((blocked && blocked2) || tree) P.yaw += dt*3;
  const cyc = a.t % 9;
  if (cyc < 5.5) { a.f = -1; a.breaking=false; P.pitch += (-0.12 - P.pitch)*dt*2; }
  else if (cyc < 7.8) { a.f = 0; P.pitch += (-0.75 - P.pitch)*dt*3; a.breaking = cyc > 6.0; }
  else { a.f = 0; a.breaking=false; if (!a.placed) { a.placed = true; const s = held(); if (!s || s.id>=256) { const idx=P.inv.findIndex(s=>s&&s.id<256&&BLOCKS[s.id].solid); if (idx>=0&&idx<9) P.sel=idx; } interact(); } }
  if (cyc < 7.8) a.placed = false;
}

let loadProg = 0, liqT = 0;
function frame() {
  requestAnimationFrame(frame);
  let dt = Math.min(clock.getDelta(), 0.1);
  frames++; fpsT += dt; if (fpsT >= 1) { fps = frames; frames = 0; fpsT = 0; }
  if (!world) return;
  if (state==='loading') {
    updateChunks(40);
    const pcx=Math.floor(P.pos.x/16), pcz=Math.floor(P.pos.z/16); let ready=0, tot=0; const R=Math.min(OPT.render,3);
    for (let dz=-R;dz<=R;dz++) for (let dx=-R;dx<=R;dx++){ if (dx*dx+dz*dz>R*R) continue; tot++; if (chunkMeshes.has((pcx+dx)+','+(pcz+dz))) ready++; }
    $('loadbar').style.width = (ready/tot*100)+'%';
    if (ready >= tot) { titleMode = false;
      if (P.needSpawn) { P.needSpawn = false; const x0=Math.floor(P.pos.x), z0=Math.floor(P.pos.z);
        outer: for (let r=0;r<20;r++) for (let dx=-r;dx<=r;dx++) for (let dz=-r;dz<=r;dz++) { if (Math.max(Math.abs(dx),Math.abs(dz))!==r) continue; const x=x0+dx, z=z0+dz; const h=world.col(x,z).h;
          const g=world.getBlock(x,h,z); if ((g===B.GRASS||g===B.SAND||g===B.SNOW_GRASS) && !SOLID[world.getBlock(x,h+1,z)] && !SOLID[world.getBlock(x,h+2,z)]) { P.pos.set(x+0.5,h+1.01,z+0.5); P.spawn=P.pos.clone(); break outer; } } } const x=Math.floor(P.pos.x), z=Math.floor(P.pos.z); if (SOLID[world.getBlock(x,Math.floor(P.pos.y),z)] || SOLID[world.getBlock(x,Math.floor(P.pos.y+1),z)]) ensureSafeSpawn(); refreshHUD(); afterLoad(); }
    renderer.render(scene, camera); return;
  }
  if (titleMode) { P.yaw += dt*0.03; updateChunks(12); updateSky(dt); world.tickFluids(dt); updateCamera(); renderer.render(scene, camera); return; }
  if (state==='play' || state==='inv' || state==='dead' || (state==='pause' && AUTO)) {
    if (AUTO && state==='play' && !Q.get('noai')) updateAuto(dt); else if (AUTO) autoplay.f = 0;
    if ((state==='play' || state==='inv') && P.alive) updatePlayer(dt); else if (!P.alive) { /* dead */ }
    world.tickFluids(dt); mobs.update(dt); updateDrops(dt); updateFurnaces(dt); randomTicks(dt); updateWeather(dt); updateOrbs(dt); Sound.updateMusic(dt, daylight() < 0.35);
    saveT += dt; if (saveT > 30) { saveT = 0; saveWorld(); }
  }
  updateChunks(state==='play'?8:4); updateSky(dt); updateCamera(); updateHand(); updateDebug(); updateTradeBtn();
  liqT += dt; if (liqT > 0.12) { liqT = 0; animateLiquids(performance.now()/1000); atlasTex.needsUpdate = true; }
  { const s = held(); const el = $('itemname');
    if (s && s.id===I.COMPASS && state==='play') { const dx = P.spawn.x-P.pos.x, dz = P.spawn.z-P.pos.z; const ang = Math.atan2(-dx,-dz) - P.yaw; const dirs = ['↑','↖','←','↙','↓','↘','→','↗']; const k = ((Math.round(ang/(Math.PI/4))%8)+8)%8;
      el.textContent = `Compass ${dirs[k]}  spawn ${Math.round(Math.hypot(dx,dz))} blocks${world.dim==='nether'?' (spins wildly!)':''}`; el.style.opacity = 1; nameT = 0.2; }
    else if (s && s.id===I.CLOCK && state==='play') { const t = (timeOfDay*24 + 6) % 24; el.textContent = `Clock  ${String(Math.floor(t)).padStart(2,'0')}:${String(Math.floor((t%1)*60)).padStart(2,'0')}  ${daylight()>0.5?'☀ Day':'☾ Night'}`; el.style.opacity = 1; nameT = 0.2; } }
  if (nameT > 0) { nameT -= dt; if (nameT <= 0) $('itemname').style.opacity = 0; }
  if (msgT > 0) { msgT -= dt; if (msgT <= 0) $('msg').textContent=''; }
  if (P.alive && P.mode==='survival' && state==='play' && Math.random()<0.02) refreshHUD();
  renderer.render(scene, camera);
}

// ---------- after load & query modes ----------
let afterLoadHook = null;
function afterLoad() {
  setState('play'); showItemName(); P.fogDark = undefined;
  if (!AUTO) { showMsg('Click to play  ·  WASD move  ·  Space jump  ·  Shift sneak  ·  Ctrl sprint  ·  E inventory  ·  F5 camera  ·  Esc menu'); msgT = 8; }
  if (afterLoadHook) { const h = afterLoadHook; afterLoadHook = null; h(); }
}
function boot() {
  if (Q.get('testnethersave')) { startTitle(); setTimeout(() => { act('create'); $('wname').value='Nether Test'; $('wseed').value='nethertest'; act('docreate');
    afterLoadHook = () => { travel(); const h = afterLoadHook; afterLoadHook = () => { h(); saveWorld(); act('savequit'); setTimeout(()=>{ selWorld = worldList().sort((a,b)=>b.last-a.last)[0].id; act('playsel');
      afterLoadHook = () => setTimeout(()=>{ showMsg('reloaded in dim='+world.dim+' nether chunks saved='+(worlds.nether?Object.keys(worlds.nether.saved).length:0)); msgT=999; }, 1500); }, 300); }; }; }, 500); return; }
  if (Q.get('testflow')) { startTitle(); setTimeout(() => { act('singleplayer'); act('create'); $('wname').value='Test World'; $('wseed').value='flowtest'; act('docreate');
    afterLoadHook = () => { saveWorld(); const n = worldList().length; act('savequit'); act('singleplayer'); showMsg('worlds: '+n); setTimeout(()=>{ selWorld = worldList().sort((a,b)=>b.last-a.last)[0].id; act('playsel'); afterLoadHook = () => { setTimeout(()=>{ showMsg('reloaded ok, worlds: '+worldList().length+' pos '+P.pos.toArray().map(v=>v.toFixed(1))+' meshes '+chunkMeshes.size+' state '+state+' title '+titleMode+' view '+view+' fps '+fps); msgT=999; }, 2000); }; }, 300); }; }, 500); return; }
  if (Q.get('screen') || AUTO || Q.get('time') || Q.get('cave') || Q.get('inv') || Q.get('view') || Q.get('mode')) {
    const scr = Q.get('screen');
    if (scr==='title' || scr==='options' || scr==='worlds' || scr==='create') { startTitle(); if (scr==='options') { renderOptions(); setState('options'); } if (scr==='worlds') { renderWorlds(); setState('worlds'); } if (scr==='create') act('create'); return; }
    worldId = null; const mode = Q.get('mode')==='creative' ? 'creative' : 'survival';
    startWorld(Q.get('seed') || 'meadow', mode, null);
    P.inv[0]={id:I.SPICK,count:1,dur:131}; P.inv[1]={id:B.COBBLE,count:32}; P.inv[2]={id:B.PLANKS,count:24}; P.inv[3]={id:B.TORCH,count:16}; P.inv[4]={id:I.WSWORD,count:1,dur:59}; P.inv[5]={id:B.CRAFTING,count:1}; P.inv[6]={id:I.STEAK,count:5}; P.inv[7]={id:B.GLASS,count:12}; P.inv[8]={id:B.LOG,count:10};
    P.inv[9]={id:I.COAL,count:14}; P.inv[10]={id:I.IRON,count:6}; P.inv[12]={id:B.SAND,count:20}; P.inv[20]={id:I.APPLE,count:3}; P.inv[11]={id:I.BOW,count:1,dur:384}; P.inv[13]={id:I.ARROW,count:24}; P.inv[14]={id:B.CHEST,count:2}; P.inv[15]={id:B.BED,count:1}; P.inv[30]={id:B.FURNACE,count:1};
    if (mode==='creative') P.inv[1]={id:B.BRICKS,count:64};
    P.sel = 1;
    if (Q.get('time')==='night') timeOfDay = 0.62; else if (Q.get('time')==='sunset') timeOfDay = 0.47; else if (Q.get('time')) timeOfDay = +Q.get('time');
    if (Q.get('view')) view = +Q.get('view');
    if (Q.get('weather')) { weather.raining = true; weather.amt = 1; weather.t = 999; weather.storm = Q.get('weather')==='storm'; weather.boltT = 0.3; }
    if (Q.get('find')) { const want = +Q.get('find'); outer: for (let r=0;r<4000;r+=48) for (let a=0;a<6.28;a+=0.4) { const x=Math.round(Math.cos(a)*r), z=Math.round(Math.sin(a)*r); if (world.col(x,z).biome===want && (!Q.get('deep') || [[20,0],[-20,0],[0,20],[0,-20]].every(([a,b])=>world.col(x+a,z+b).biome===want))) { P.pos.set(x+0.5, world.col(x,z).h+1.01, z+0.5); P.needSpawn=true; break outer; } } }
    if (Q.get('village')) { let best=null; for (let r=0;r<6&&!best;r++) for (let rx=-r;rx<=r;rx++) for (let rz=-r;rz<=r;rz++) { const v=world.village(rx,rz); if (v && v.houses.length>=3 && !best) best=v; }
      if (best) { P.pos.set(best.x+0.5, best.h+1.01, best.z+7.5); P.needSpawn = true; P.yaw = 0; window.__vil = best; } }
    if (Q.get('fly')) { P.mode='creative'; P.flying=true; P.needSpawn=false; P.pos.y += +Q.get('fly'); }
    afterLoadHook = () => {
      if (Q.get('time')==='night') { for (let i=0;i<6;i++){ const a=i/6*6.28; mobs.spawn(['zombie','skeleton','spider','fuseling','slime','ember'][i], P.pos.x+Math.cos(a)*7, P.pos.y+1, P.pos.z+Math.sin(a)*7); } }
      else if (Q.get('mobshow')) { const types = Q.get('mobshow')==='2' ? ['cow','pig','sheep','chicken','rabbit','wolf','villager','squid'] : Q.get('mobshow')==='3' ? ['deer','capling','frostling','deer','capling','frostling'] : ['zombie','skeleton','spider','fuseling','villager','golem','wolf','slime']; types.forEach((t,i)=>{ let m; let tries=0; do { if (m) { scene.remove(m.model.g); mobs.list.pop(); } m = mobs.spawn(t, P.pos.x-5.5+i*1.6, P.pos.y+0.2, P.pos.z-5); } while (t==='zombie' && !m.armorPts && tries++<30); m.ai.t = 999; }); P.peace = true; }
      else if (Q.get('wolves')) { for (let i=0;i<3;i++) { const w = mobs.spawn('wolf', P.pos.x+2+i, P.pos.y+0.5, P.pos.z-4); if (i<2) { w.tamed = true; w.model.g.userData.collar.visible = true; } } }
      else { for (let i=0;i<4;i++){ const a=i/4*6.28+0.5; const x=P.pos.x+Math.cos(a)*6, z=P.pos.z-6+Math.sin(a)*3; const y=world.col(Math.floor(x),Math.floor(z)).h+1; mobs.spawn(['cow','pig','sheep','chicken'][i], x, y+0.5, z); } }
      if (Q.get('cave')) findCave();
      if (Q.get('inv')) { openUI(Q.get('inv')==='table'?'table':Q.get('inv')==='furnace'?'furnace':'inv', Q.get('inv')==='furnace'? {in:{id:B.IRON_ORE,count:5}, fuel:{id:I.COAL,count:3}, out:{id:I.IRON,count:2}, burn:40, burnMax:80, cook:6} : null);
        if (ui && ui.type!=='furnace' && ui.type!=='creative') { ui.grid[0]={id:B.PLANKS,count:3}; ui.grid[1]={id:B.PLANKS,count:3}; if (ui.size===3) { ui.grid[2]={id:B.PLANKS,count:3}; ui.grid[4]={id:I.STICK,count:2}; ui.grid[7]={id:I.STICK,count:2}; } else { ui.grid[2]={id:B.PLANKS,count:2}; ui.grid[3]={id:B.PLANKS,count:2}; } renderUI(); } }
      if (Q.get('screen')==='pause') setState('pause');
      if (Q.get('screen')==='death') { P.lastCause='was slain by Zombie'; die(); }
      if (Q.get('fluids')) { const x=Math.floor(P.pos.x), y=Math.floor(P.pos.y), z=Math.floor(P.pos.z); world.setBlock(x+3,y+1,z-4,B.COBBLE); world.setBlock(x+3,y+2,z-4,B.LAVA); world.setBlock(x-3,y+1,z-4,B.COBBLE); world.setBlock(x-3,y+2,z-4,B.WATER); world.setBlock(x,y,z-6,B.TORCH); for (let i=0;i<60;i++) world.tickFluids(0.26); }
      if (Q.get('testbreak')) { const out=[]; P.inv.fill(null); P.pitch=-1.5; P.yaw=0; const t=raycast(eyePos(),dirVec(),5); out.push('hit '+(t&&BLOCKS[t.id].name));
        out.push('bt '+breakTime(t.id).toFixed(2)); finishBreak(t); out.push('after '+world.getBlock(t.x,t.y,t.z)+' drops '+drops.length);
        for (let i=0;i<60;i++){ physics(P,0.05); updateDrops(0.05); } out.push('inv0 '+(P.inv[0]&&itemName(P.inv[0].id)+'x'+P.inv[0].count));
        P.sel=0; const ok=interact(); out.push('placed '+ok+' '+(t&&BLOCKS[world.getBlock(t.x,t.y,t.z)].name));
        out.push('craft '+JSON.stringify(matchRecipe([{id:B.PLANKS},{id:B.PLANKS},{id:B.PLANKS},null,{id:I.STICK},null,null,{id:I.STICK},null],3)));
        P.inv[3]={id:I.BOW,count:1,dur:384}; P.inv[4]={id:I.ARROW,count:5}; P.sel=3; interact(); P.drawT=1; releaseBow(); for (let i=0;i<10;i++) mobs.update(0.05); out.push('bow arrows left '+P.inv[4].count+' flying '+mobs.arrows.length+' bowdur '+P.inv[3].dur);
        const c = chestAt(1,2,3); c.items[0]={id:B.DIRT,count:1}; out.push('chest '+world.chests['1,2,3'].items[0].id);
        out.push('craft2 '+JSON.stringify(matchRecipe([null,{id:B.LOG},null,null],2))); showMsg(out.join(' | ')); msgT = 999; }
      if (Q.get('props')) { const x=Math.floor(P.pos.x), z=Math.floor(P.pos.z); const put=(dx,dz,id,meta=0)=>{ const h=world.col(x+dx,z+dz).h; let y=h+1; while(y<120 && world.getBlock(x+dx,y,z+dz)!==0 && !BLOCKS[world.getBlock(x+dx,y,z+dz)].replace) y++; world.setBlock(x+dx,y,z+dz,id,meta); };
        put(-2,-3,B.CHEST,4); put(-1,-3,B.CRAFTING); put(0,-3,B.FURNACE,4); put(1,-3,B.BED); put(2,-3,B.SAPLING); put(3,-3,B.TORCH); put(-3,-3,B.PUMPKIN,4); put(-4,-3,B.JACK,4); put(5,-3,B.BOOKSHELF); put(6,-3,B.HAY); put(4,-3,B.LANTERN);
        for (let k=-4;k<=4;k++) put(k,-8,B.FENCE); put(4,-7,B.FENCE); put(4,-6,B.FENCE); put(-4,-7,B.FENCE);
        { const h=world.col(x+1,z-1).h; world.setBlock(x+1,h+1,z-1,B.DOOR,0); world.setBlock(x+1,h+2,z-1,B.DOOR,4); const h2=world.col(x+2,z-1).h; world.setBlock(x+2,h2+1,z-1,B.DOOR_OPEN,0); world.setBlock(x+2,h2+2,z-1,B.DOOR_OPEN,4); }
        for (let i=0;i<5;i++) for (let j=0;j<2;j++) { const fx=x-2+i, fz=z-6-j; const h=world.col(fx,fz).h; world.setBlock(fx,h,fz,B.FARMLAND); world.setBlock(fx,h+1,fz,B.AIR); world.setBlock(fx,h+2,fz,B.AIR); world.setBlock(fx,h+1,fz,B.WHEAT,Math.min(7,i*2)); } }
      if (Q.get('inv')==='chest') { const c = { items: new Array(27).fill(null) }; c.items[0]={id:I.DIAMOND,count:3}; c.items[4]={id:B.SAPLING,count:5}; c.items[10]={id:I.BONE,count:7}; c.items[20]={id:B.BED,count:1}; c.items[13]={id:B.CHEST,count:2}; openUI('chest',null,c); }
      if (Q.get('testdoor')) { const out=[]; P.pitch=0; P.yaw=0; P.vel.set(0,0,0); const e=eyePos(); const dx=Math.floor(e.x), dy=Math.floor(e.y), dz=Math.floor(e.z)-2;
        world.setBlock(dx,dy-1,dz,B.DOOR,0); world.setBlock(dx,dy,dz,B.DOOR,4); P.sel=8; P.inv[8]=null;
        out.push('before '+world.getBlock(dx,dy,dz)+'/'+world.getBlock(dx,dy-1,dz)); const r1=interact(); out.push('toggle '+r1+' -> '+world.getBlock(dx,dy,dz)+'/'+world.getBlock(dx,dy-1,dz));
        interact(); out.push('again '+world.getBlock(dx,dy,dz)+'/'+world.getBlock(dx,dy-1,dz)); const t=raycast(eyePos(),dirVec(),5); finishBreak(t); out.push('broken '+world.getBlock(dx,dy,dz)+'/'+world.getBlock(dx,dy-1,dz)+' drops '+drops.length);
        showMsg(out.join(' | ')); msgT=999; }
      if (Q.get('testladder')) { const x=Math.floor(P.pos.x), y=Math.floor(P.pos.y), z=Math.floor(P.pos.z);
        for (let k=0;k<6;k++) { world.setBlock(x,y+k,z-1,B.COBBLE); world.setBlock(x,y+k,z,B.LADDER,2); } rebuildNow(x,z); const y0=P.pos.y; keys.Space=true; for (let i=0;i<20;i++) updatePlayer(0.05); keys.Space=false;
        const y1=P.pos.y; for (let i=0;i<10;i++) updatePlayer(0.05); showMsg('ladder climb '+y0.toFixed(1)+' -> '+y1.toFixed(1)+' then '+P.pos.y.toFixed(1)+' hp '+P.health); msgT=999; P.pitch=0.3; P.yaw=Math.PI; }
      if (Q.get('portal')) { const x=Math.floor(P.pos.x), z=Math.floor(P.pos.z)-5; const y=world.col(x,z).h+1; buildPortal(x-1,y,z); for (const ch of world.chunks.values()) ch.dirty = true; if (Q.get('inportal')) { P.pos.set(x+0.5, y, z+0.5); P.flying = false; rebuildNow(x,z); autoplay.f = 0; for (let i=0;i<30 && state==='play';i++) updatePlayer(0.05); } }
      if (Q.get('nether')) { travel(); if (Q.get('die')) { const h = afterLoadHook; afterLoadHook = () => { h(); die(); respawn(); afterLoadHook = () => { showMsg('respawned in '+world.dim+' alive='+P.alive); msgT=999; }; }; } return; }
      if (Q.get('testbucket')) { P.pitch = -1.2; P.yaw = 0; P.sel = 0; P.inv[0] = {id:I.WATER_BUCKET,count:1}; const out=[]; out.push('place '+interact()+' -> '+itemName(P.inv[0].id));
        const r1 = interact(); out.push('scoop '+r1+' -> '+itemName(P.inv[0].id)); P.inv[1]={id:I.BUCKET,count:1}; P.inv[2]={id:I.LAVA_BUCKET,count:1}; refreshHUD(); showMsg(out.join(' | ')); msgT=999; }
      if (Q.get('testshear')) { const sh = mobs.spawn('sheep', P.pos.x, P.pos.y, P.pos.z-2.5); P.yaw = 0; P.pitch = -0.25; P.sel = 0; P.inv[0] = {id:I.SHEARS,count:1,dur:238}; mobs.update(0.01); const r = interact(); showMsg('shear '+r+' sheared='+sh.sheared+' dur='+(P.inv[0]&&P.inv[0].dur)+' drops='+drops.length); msgT=999; }
      if (Q.get('vdebug')) setTimeout(()=>{ const v = world.villageAt(Math.floor(P.pos.x), Math.floor(P.pos.z)); showMsg('vil '+(v?v.x+','+v.z:'none')+' best '+(window.__vil?window.__vil.x+','+window.__vil.z:'-')+' types '+mobs.list.map(m=>m.type).join(',')); msgT=999; }, 1500);
      if (Q.get('testpath')) { P.inv[0] = {id:I.SSHOVEL,count:1,dur:131}; P.sel = 0; P.yaw = 0; const out=[]; for (const pt of [-1.0,-0.8,-0.65]) { P.pitch = pt; out.push(interact()); } refreshHUD(); showMsg('path '+out.join(',')+' dur '+P.inv[0].dur); msgT=999; P.pitch=-0.7; }
      if (Q.get('testbonemeal')) { P.inv[0] = {id:I.BONE_MEAL,count:10}; P.sel=0; P.yaw=0; P.pitch=-1.0; const t = raycast(eyePos(),dirVec(),5); const before = t && BLOCKS[t.id].name; const r = interact(); refreshHUD(); showMsg('bonemeal on '+before+': '+r+' left '+(P.inv[0]&&P.inv[0].count)); msgT=999; }
      if (Q.get('dungeon')) { let best=null, bd=1e9; for (const k of (world.spawners||[])) { const [sx,sy,sz]=k.split(',').map(Number); const d=Math.hypot(sx-P.pos.x,sz-P.pos.z); if (d<bd) { bd=d; best=[sx,sy,sz]; } }
        if (best) { P.pos.set(best[0]+2.5, best[1], best[2]-1.5); P.yaw = 2.3; P.pitch = -0.25; P.needSpawn=false; world.setBlock(best[0]-2,best[1]+2,best[2]-2,B.TORCH,1); world.setBlock(best[0]+2,best[1]+2,best[2]+2,B.TORCH,2); world.setBlock(best[0],best[1]+2,best[2]-2,B.TORCH,3); if (Q.get('dungeon')==='2') { const c = chestAt(best[0]-2,best[1],best[2]); openUI('chest',null,c); } } else showMsg('no dungeon loaded'); }
      if (Q.get('squid')) { let found = null; for (let r=2;r<40&&!found;r++) for (let a=0;a<6.28&&!found;a+=0.3) { const x=Math.floor(P.pos.x+Math.cos(a)*r), z=Math.floor(P.pos.z+Math.sin(a)*r); if (world.getBlock(x,59,z)===B.WATER && world.getBlock(x,57,z)===B.WATER) found=[x,z]; }
        if (found) { for (let i=0;i<4;i++) mobs.spawn('squid', found[0]+0.5+i%2*1.5, 59, found[1]+0.5+(i>>1)*1.5); P.pos.set(found[0]+0.5, 60.5, found[1]-2.5); P.yaw = Math.PI; P.pitch = -0.5; P.needSpawn=false; P.vel.set(0,0,0); } }
      if (Q.get('armor')) { P.armor = [{id:I.IHELM,count:1,dur:240},{id:I.DCHEST,count:1,dur:795},{id:I.ILEGS,count:1,dur:336},{id:I.GBOOTS,count:1,dur:110}]; P.inv[16]={id:I.LCHEST,count:1,dur:120}; P.inv[17]={id:I.DHELM,count:1,dur:530}; refreshHUD(); if (ui) renderUI();
        if (Q.get('armor')==='hit') { const h0=P.health; hurtPlayer(10, P.pos.clone().add(new THREE.Vector3(1,0,0))); showMsg('10 dmg with '+armorPoints()+' armor pts -> lost '+(h0-P.health)+' hp, helmet dur '+P.armor[0].dur); msgT=999; } }
      if (Q.get('testdecay')) { // chop the trunk of the nearest tree and fast-forward random ticks
        let tr=null; for (let r=1;r<12&&!tr;r++) for (let dx=-r;dx<=r&&!tr;dx++) for (let dz=-r;dz<=r;dz++) { const x=Math.floor(P.pos.x)+dx, z=Math.floor(P.pos.z)+dz; for (let y=60;y<90;y++) if (world.getBlock(x,y,z)===B.LOG && world.getBlock(x,y-1,z)!==B.LOG) { tr=[x,y,z]; break; } if (tr) break; }
        if (tr) { let y=tr[1]; let n=0; while (world.getBlock(tr[0],y,tr[2])===B.LOG) { world.setBlock(tr[0],y,tr[2],B.AIR,0,true); y++; n++; } world.relightAround(tr[0]>>4,tr[2]>>4);
          const cnt = () => { let c=0; for (let dx=-4;dx<=4;dx++) for (let dy=-2;dy<=8;dy++) for (let dz=-4;dz<=4;dz++) if (BLOCKS[world.getBlock(tr[0]+dx,tr[1]+dy,tr[2]+dz)].leaves) c++; return c; };
          const before = cnt(); decayBoost = 20; for (let i=0;i<5;i++) { rtT = 0.2; randomTicks(0.2); } decayBoost = 0; showMsg('chopped '+n+' logs; leaves nearby '+before+' -> '+cnt()); msgT=999; P.pos.set(tr[0]+0.5, tr[1], tr[2]+6.5); P.yaw=0; P.pitch=0.2; P.needSpawn=false; } }
      if (Q.get('trade')) { const v = mobs.spawn('villager', P.pos.x, P.pos.y, P.pos.z-3); v.job = Q.get('trade')==='1' ? 'Smith' : Q.get('trade'); P.inv[18]={id:I.EMERALD,count:9}; P.inv[19]={id:I.COAL,count:30}; openTrade(v);
        if (Q.get('tclick')) { const e0 = countItem(I.EMERALD), c0 = countItem(I.COAL); invPanel.querySelector('.trade[data-t="0"]').click(); invPanel.querySelector('.trade[data-t="2"]').click(); setTimeout(()=>{ showMsg('emeralds '+e0+'->'+countItem(I.EMERALD)+' coal '+c0+'->'+countItem(I.COAL)+' iron picks '+countItem(I.IPICK)); msgT=999; },100); } }
      if (Q.get('spawn')) { const [t, n] = Q.get('spawn').split(','); for (let i=0;i<(+n||3);i++) { const a = -0.9 + i*0.6, x = P.pos.x - Math.sin(P.yaw+a)*(5+i%2*2), z = P.pos.z - Math.cos(P.yaw+a)*(5+i%2*2); const m = mobs.spawn(t, x, world.col(Math.floor(x),Math.floor(z)).h+1.2, z); m.yaw = Math.atan2(P.pos.x-x, P.pos.z-z); m.ai.t = 999; } P.peace = true; }
      if (Q.get('tradebtn')) { const v = mobs.spawn('villager', P.pos.x+1.2, P.pos.y+0.2, P.pos.z-2.6); v.job = 'Mason'; v.ai.t = 999; P.inv[18]={id:I.EMERALD,count:12}; P.inv[19]={id:B.COBBLE,count:40}; P.inv[20]={id:I.FROST_SHARD,count:12}; P.yaw = -0.4; P.pitch = -0.15;
        if (Q.get('tradebtn')==='2') setTimeout(() => { tradeBtn.click(); setTimeout(() => { const ok = ui && ui.type==='trade'; closeUI(); showMsg('button opened trade: '+ok+' · after close state='+state+' btn shown='+tradeBtn.classList.contains('on')); msgT=999; }, 300); }, 400);
        if (Q.get('tradebtn')==='3') setTimeout(() => tradeBtn.click(), 400); }
      if (Q.get('testattack')) { const out=[]; P.vel.set(0,0,0); P.inv[0]={id:I.WSWORD,count:1,dur:59}; P.sel=0; P.mode='survival'; P.flying=false;
        const x=Math.floor(P.pos.x), z=Math.floor(P.pos.z), gy=Math.floor(P.pos.y);
        for (let k=1;k<=4;k++) { for (let yy=gy; yy<gy+3; yy++) world.setBlock(x,yy,z-k,B.AIR,0,true); world.setBlock(x,gy-1,z-k,B.GRASS,0,true); }
        world.setBlock(x,gy,z-1,B.TALLGRASS,0,true); world.setBlock(x,gy,z-2,B.TALLGRASS,0,true); world.relightAround(x>>4,z>>4); rebuildNow(x,z);
        const t = Q.get('testattack')==='2' ? 'villager' : 'pig'; const m = mobs.spawn(t, x+0.5, gy, z-2.4); m.ai.t = 999; P.pos.x = x+0.5; P.pos.z = z+0.5;
        const e = eyePos(); const dx=m.pos.x-e.x, dy=(m.pos.y+m.h*0.45)-e.y, dz=m.pos.z-e.z; P.yaw=Math.atan2(-dx,-dz); P.pitch=Math.atan2(dy, Math.hypot(dx,dz));
        out.push(t+' tcAimMob='+window.__tcAimMob()); const oldHit = (() => { const mh = mobs.raycast(e, dirVec(), 3.5), bh = raycast(e, dirVec(), 5); return !!(mh && (!bh || bh.dist > mh.dist)); })(); out.push('old test would hit='+oldHit);
        if (t==='pig') { const hp0=m.hp; const r1=attack(); out.push('click hit='+r1+' hp '+hp0+'->'+m.hp+' knock '+Math.hypot(m.vel.x,m.vel.z).toFixed(1)+' up '+m.vel.y.toFixed(1)+' red='+(m.hurtT>0));
          m.vel.set(0,0,0); mouseL = true; const hp1=m.hp, g0 = world.getBlock(x,gy,z-1); autoplay.f = 0; for (let i=0;i<20;i++) updatePlayer(0.05); mouseL = false; breakT = 0; breakTarget = null;
          out.push('held 1s hp '+hp1+'->'+m.hp+' grass kept='+(world.getBlock(x,gy,z-1)===g0)); }
        showMsg(out.join(' | ')); msgT = 999; }
      if (Q.get('compass')) { P.inv[0] = {id: Q.get('compass')==='clock' ? I.CLOCK : I.COMPASS, count:1}; P.sel = 0; P.spawn = P.pos.clone().add(new THREE.Vector3(-40,0,30)); refreshHUD(); }
      if (Q.get('enchant')) { addXP(400); openUI('enchant'); ui.ench[0] = {id:I.DPICK,count:1,dur:1561}; ui.ench[1] = {id:I.LAPIS,count:12}; P.inv[22] = {id:I.ISWORD,count:1,dur:250,ench:3}; P.inv[23] = {id:I.ICHEST,count:1,dur:360,ench:2};
        if (Q.get('enchant')==='2') { invPanel.querySelector('.ench[data-k="3"]').click(); }
        renderUI(); }
      if (Q.get('temple')) { let best=null; for (let r=0;r<10&&!best;r++) for (let rx=-r;rx<=r&&!best;rx++) for (let rz=-r;rz<=r;rz++) { const t=world.temple(rx,rz); if (t) { best=t; break; } }
        if (best) { P.pos.set(best.x+0.5, best.h+6, best.z+24.5); P.yaw = 0; P.pitch = -0.1; P.mode='creative'; P.flying=true; P.needSpawn=false; window.__tem = best;
          if (Q.get('temple')==='2') { P.pos.set(best.x+0.5, best.h-4.5, best.z-1.2); P.yaw = Math.PI; P.pitch = -0.5; world.setBlock(best.x-1,best.h-5,best.z+1,B.TORCH,0); world.setBlock(best.x+1,best.h-5,best.z+1,B.TORCH,0); world.setBlock(best.x-1,best.h-5,best.z-1,B.TORCH,0); world.relightAround(best.x>>4,best.z>>4); rebuildNow(best.x,best.z); } } else showMsg('no temple found'); }
      if (Q.get('torchtest')) { const x=Math.floor(P.pos.x), z=Math.floor(P.pos.z)-3; const y=world.col(x,z).h+1; world.setBlock(x,y,z,B.TORCH,0); world.setBlock(x+1,y,z,B.LANTERN,0); P.pitch=-0.5; P.yaw=0; rebuildNow(x,z); }
      if (Q.get('boom')) { const ex = P.pos.x, ez = P.pos.z - 6; const ey = world.col(Math.floor(ex),Math.floor(ez)).h + 1; P.mode = 'creative'; explode(ex, ey, ez, 3); P.yaw = 0; P.pitch = -0.4; P.vel.set(0,0,0); }
      if (Q.get('bolt')) { P.yaw = 0; P.pitch = 0.35; strikeLightning(P.pos.clone(), -Math.PI/2); bolt.userData.t = 999; weather.flash = 0.25; }
      if (Q.get('testslab')) { const x=Math.floor(P.pos.x), z=Math.floor(P.pos.z), y=Math.floor(P.pos.y); P.yaw=0; P.pos.x=x+0.5; P.pos.z=z+0.5;
        for (let k=1;k<=8;k++) for (let yy=y; yy<y+4; yy++) world.setBlock(x,yy,z-k,B.AIR,0,true);
        for (let k=1;k<=8;k++) world.setBlock(x,y-1,z-k,B.COBBLE,0,true);
        world.setBlock(x,y,z-2,Q.get('testslab')==='stairs'?B.COBBLE_STAIRS:B.STONE_SLAB,2,true); if (Q.get('testslab')==='stairs') { world.setBlock(x+1,y,z-2,B.PLANK_STAIRS,2,true); world.setBlock(x-1,y,z-2,B.COBBLE_STAIRS,2,true); } world.setBlock(x,y,z-3,B.COBBLE,0,true); world.setBlock(x,y,z-4,B.COBBLE,0,true); world.setBlock(x,y+1,z-4,B.PLANK_SLAB,0,true);
        world.relightAround(x>>4,z>>4); rebuildNow(x,z); rebuildNow(x,z-8);
        const y0 = P.pos.y; const ys=[]; keys.KeyW = true; for (let i=0;i<40;i++) { updatePlayer(0.05); if (i%8===7) ys.push(P.pos.y.toFixed(2)); } keys.KeyW = false;
        showMsg('slab walk from '+y0.toFixed(2)+': '+ys.join(' ')); msgT=999; P.yaw = Math.PI; P.pitch = -0.3;
        if (Q.get('testslab')==='stairs') { for (let yy=y; yy<y+3; yy++) for (let k=2;k<=4;k++) world.setBlock(x+k,yy,z-2,B.AIR,0,true); world.relightAround(x>>4,z>>4); rebuildNow(x,z); P.pos.set(x+3.5, y+1.5, z-2.5); P.yaw = Math.PI/2; P.pitch = -0.6; P.flying = true; P.mode='creative'; } }
      if (Q.get('xp')) { addXP(+Q.get('xp')); spawnXP(P.pos.x+1, P.pos.y+1, P.pos.z-3, 12); }
      if (Q.get('crack')) { P.pitch = -0.9; P.sel = 2; P.inv[2] = {id:B.PLANKS,count:24}; mouseL = true; for (let i=0;i<12;i++) updatePlayer(0.05); }
      if (Q.get('sel')) { P.sel = +Q.get('sel'); refreshHUD(); }
      if (Q.get('pitch')) P.pitch = +Q.get('pitch'); if (Q.get('yaw')) P.yaw = +Q.get('yaw');
      if (Q.get('debug')) { debug = true; $('debug').style.display='block'; }
    };
    return;
  }
  startTitle();
}
function findCave() {
  const x0=Math.floor(P.pos.x), z0=Math.floor(P.pos.z);
  for (let r=0;r<40;r++) for (let dx=-r;dx<=r;dx++) for (const dz of [-r,r]) { const x=x0+dx, z=z0+dz; if (!world.isLoaded(x,z)) continue;
    for (let y=12;y<45;y++) { let open = 0; for (let ax=-3;ax<=3;ax++) for (let az=-3;az<=3;az++) for (let ay=0;ay<3;ay++) if (world.getBlock(x+ax,y+ay,z+az)===0) open++;
      if (open > 110 && world.getBlock(x,y,z)===0 && SOLID[world.getBlock(x,y-1,z)] && world.getSky(x,y,z)===0) {
      P.pos.set(x+0.5,y,z+0.5); P.pitch=-0.1;
      // torches nearby
      let placed=0; for (let k=0;k<60 && placed<4;k++){ const tx=x+Math.round((Math.random()-0.5)*14), tz=z+Math.round((Math.random()-0.5)*14); for (let ty=y-4;ty<y+4;ty++){ if (world.getBlock(tx,ty,tz)===0 && SOLID[world.getBlock(tx,ty-1,tz)]) { world.setBlock(tx,ty,tz,B.TORCH); placed++; break; } } }
      return; } } }
}
addEventListener('beforeunload', () => { if (worldId && state!=='title') saveWorld(); });
boot();
frame();
window.__bh = { P, get world(){return world;}, act };
