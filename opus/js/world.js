import * as THREE from 'three';
import { B, BLOCKS, OPAQUE, SOLID, ATTEN, LIGHT, blockTile, T } from './blocks.js';

export const CS = 16, CH = 128, SEA = 62;
const AREA = CS*CS;

// ---------- noise ----------
function mulberry(a){ return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
export function hashStr(s){ let h=2166136261; for(const c of String(s)){ h^=c.charCodeAt(0); h=Math.imul(h,16777619);} return h>>>0; }
class Noise {
  constructor(seed){ const r=mulberry(seed); const p=new Uint8Array(256); for(let i=0;i<256;i++)p[i]=i; for(let i=255;i>0;i--){const j=r()*(i+1)|0; const t=p[i];p[i]=p[j];p[j]=t;} this.perm=new Uint8Array(512); for(let i=0;i<512;i++)this.perm[i]=p[i&255]; }
  n2(x,y){ const perm=this.perm; const F2=0.36602540378,G2=0.2113248654; const s=(x+y)*F2; const i=Math.floor(x+s), j=Math.floor(y+s); const t=(i+j)*G2; const x0=x-(i-t), y0=y-(j-t);
    const i1=x0>y0?1:0, j1=x0>y0?0:1; const x1=x0-i1+G2,y1=y0-j1+G2,x2=x0-1+2*G2,y2=y0-1+2*G2; const ii=i&255,jj=j&255; let n=0;
    const g=(h,x,y)=>{ h&=7; const u=h<4?x:y, v=h<4?y:x; return ((h&1)?-u:u)+((h&2)?-2*v:2*v); };
    let t0=0.5-x0*x0-y0*y0; if(t0>0){t0*=t0; n+=t0*t0*g(perm[ii+perm[jj]],x0,y0);} let t1=0.5-x1*x1-y1*y1; if(t1>0){t1*=t1; n+=t1*t1*g(perm[ii+i1+perm[jj+j1]],x1,y1);} let t2=0.5-x2*x2-y2*y2; if(t2>0){t2*=t2; n+=t2*t2*g(perm[ii+1+perm[jj+1]],x2,y2);} return 40*n; }
  n3(x,y,z){ const perm=this.perm; const F3=1/3,G3=1/6; const s=(x+y+z)*F3; const i=Math.floor(x+s),j=Math.floor(y+s),k=Math.floor(z+s); const t=(i+j+k)*G3; const x0=x-(i-t),y0=y-(j-t),z0=z-(k-t);
    let i1,j1,k1,i2,j2,k2; if(x0>=y0){ if(y0>=z0){i1=1;j1=0;k1=0;i2=1;j2=1;k2=0;} else if(x0>=z0){i1=1;j1=0;k1=0;i2=1;j2=0;k2=1;} else {i1=0;j1=0;k1=1;i2=1;j2=0;k2=1;} } else { if(y0<z0){i1=0;j1=0;k1=1;i2=0;j2=1;k2=1;} else if(x0<z0){i1=0;j1=1;k1=0;i2=0;j2=1;k2=1;} else {i1=0;j1=1;k1=0;i2=1;j2=1;k2=0;} }
    const x1=x0-i1+G3,y1=y0-j1+G3,z1=z0-k1+G3,x2=x0-i2+2*G3,y2=y0-j2+2*G3,z2=z0-k2+2*G3,x3=x0-1+0.5,y3=y0-1+0.5,z3=z0-1+0.5; const ii=i&255,jj=j&255,kk=k&255;
    const g=(h,x,y,z)=>{ h&=15; const u=h<8?x:y, v=h<4?y:(h===12||h===14)?x:z; return ((h&1)?-u:u)+((h&2)?-v:v); };
    let n=0,tt; tt=0.6-x0*x0-y0*y0-z0*z0; if(tt>0){tt*=tt; n+=tt*tt*g(perm[ii+perm[jj+perm[kk]]],x0,y0,z0);} tt=0.6-x1*x1-y1*y1-z1*z1; if(tt>0){tt*=tt; n+=tt*tt*g(perm[ii+i1+perm[jj+j1+perm[kk+k1]]],x1,y1,z1);}
    tt=0.6-x2*x2-y2*y2-z2*z2; if(tt>0){tt*=tt; n+=tt*tt*g(perm[ii+i2+perm[jj+j2+perm[kk+k2]]],x2,y2,z2);} tt=0.6-x3*x3-y3*y3-z3*z3; if(tt>0){tt*=tt; n+=tt*tt*g(perm[ii+1+perm[jj+1+perm[kk+1]]],x3,y3,z3);} return 32*n; }
  fbm(x,y,o){ let s=0,a=1,f=1,t=0; for(let i=0;i<o;i++){ s+=this.n2(x*f,y*f)*a; t+=a; a*=0.5; f*=2; } return s/t; }
}
const smooth=(a,b,x)=>{ const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); };
export const BIOME_NAMES = ['Plains','Forest','Desert','Snowy Tundra','Ocean','Beach','Mountains','River','Badlands','Swamp','Jungle'];

export class World {
  constructor(seed, dim='over') {
    this.dim = dim;
    this.seedStr = String(seed); this.seed = hashStr(seed) + (dim==='nether' ? 7777 : 0);
    this.nA = new Noise(this.seed); this.nB = new Noise(this.seed+1); this.nC = new Noise(this.seed+2); this.nD = new Noise(this.seed+3);
    this.chunks = new Map(); this.saved = {}; // key -> {b,m}
    this.fluid = new Set(); this.fluidT = 0; this.lavaT = 0;
    this.onChange = null; this.furnaces = {};
  }
  key(cx,cz){ return cx+','+cz; }
  getChunk(cx,cz){ return this.chunks.get(cx+','+cz); }
  col(wx,wz){
    const A=this.nA,Bn=this.nB;
    const c = A.fbm(wx*0.0022, wz*0.0022, 4)*1.4;
    const e = Bn.fbm(wx*0.004+100, wz*0.004, 2);
    let h = 64 + c*12;
    if (c < -0.2) h = 64 + (c+0.2)*12 + (c+0.2)*45;
    const hills = A.fbm(wx*0.013+50, wz*0.013, 3)*7*(0.6+0.5*e);
    const mAmt = smooth(0.12, 0.5, Bn.fbm(wx*0.0021+500, wz*0.0021, 3)) * smooth(-0.25,0.05,c);
    const ridge = 1-Math.abs(A.n2(wx*0.007+900, wz*0.007));
    h += hills*(c<-0.2?0.4:1) + mAmt*(18 + 42*ridge*ridge);
    const rv = Math.abs(this.nC.fbm(wx*0.0024+700, wz*0.0024, 2));
    let river = false;
    if (rv < 0.045 && h > SEA-3 && mAmt < 0.6) { const t = smooth(0, 0.045, rv); const nh = SEA-3 + (h-(SEA-3))*t; if (nh < SEA) river = true; h = nh; }
    h = Math.floor(h);
    const temp = this.nD.fbm(wx*0.0016, wz*0.0016, 2) - Math.max(0,(h-85)*0.02);
    const hum = this.nD.fbm(wx*0.0016+3000, wz*0.0016, 2);
    let biome;
    if (river) biome = 7;
    else if (h < SEA-1) biome = 4;
    else if (h <= SEA+1 && temp > -0.3) biome = 5;
    else if (mAmt > 0.45 && h > 88) biome = 6;
    else if (temp < -0.28) biome = 3;
    else if (temp > 0.4 && hum < -0.12) biome = 8;
    else if (hum > 0.28 && temp > -0.15 && h <= SEA+5) biome = 9;
    else if (hum > 0.22 && temp > 0.15) biome = 10;
    else if (temp > 0.3 && hum < 0.15) biome = 2;
    else if (hum > 0.02) biome = 1;
    else biome = 0;
    if (biome === 9) h = SEA - (this.nA.n2(wx*0.07, wz*0.07) > 0.15 ? 1 : 0);
    if (biome === 8) { const p = this.nB.n2(wx*0.02+40, wz*0.02); h += Math.round(smooth(0.0, 0.25, p) * 16); }
    return { h, biome, temp };
  }
  rand(x,z,s){ let h = Math.imul(x,374761393) ^ Math.imul(z,668265263) ^ Math.imul(s+this.seed,2246822519); h = Math.imul(h ^ (h>>>13), 1274126177); return ((h ^ (h>>>16))>>>0)/4294967296; }

  village(rx, rz) {
    this._vil = this._vil || new Map(); const key = rx+','+rz; if (this._vil.has(key)) return this._vil.get(key);
    let v = null;
    if (this.dim !== 'nether' && this.rand(rx, rz, 99) < 0.55) {
      const x = rx*128 + 40 + (this.rand(rx,rz,98)*48|0), z = rz*128 + 40 + (this.rand(rx,rz,97)*48|0); const c = this.col(x, z);
      if ((c.biome===0 || c.biome===2 || c.biome===1) && c.h > SEA+1 && c.h < 90) {
        const desert = c.biome===2; const houses = [];
        for (let i=0;i<7;i++) { const a = i/7*Math.PI*2 + this.rand(rx,rz,i)*0.4; const d = 13 + this.rand(rx,rz,i+20)*6;
          const hx = Math.round(x + Math.cos(a)*d), hz = Math.round(z + Math.sin(a)*d); const hc = this.col(hx,hz);
          if (hc.h > SEA && Math.abs(hc.h - c.h) <= 5 && hc.biome!==4 && hc.biome!==7) houses.push({ x:hx, z:hz, h:hc.h, big: this.rand(rx,rz,i+40)<0.3 }); }
        v = { x, z, h:c.h, desert, houses };
      }
    }
    this._vil.set(key, v); return v;
  }
  temple(rx, rz) {
    this._tem = this._tem || new Map(); const key = rx+','+rz; if (this._tem.has(key)) return this._tem.get(key);
    let t = null; if (this.dim !== 'nether' && this.rand(rx, rz, 199) < 0.6) { const x = rx*96 + 30 + (this.rand(rx,rz,198)*36|0), z = rz*96 + 30 + (this.rand(rx,rz,197)*36|0); const c = this.col(x,z);
      if (c.biome === 2 && c.h > SEA+1) t = { x, z, h: c.h }; }
    this._tem.set(key, t); return t;
  }
  placeTemple(b, cx, cz) {
    const t = this.temple(Math.floor(cx*16/96), Math.floor(cz*16/96)); if (!t) return;
    const ox = cx*16, oz = cz*16; if (Math.abs(t.x - (ox+8)) > 20 || Math.abs(t.z - (oz+8)) > 20) return;
    const set = (x,y,z,id) => { const lx=x-ox, lz=z-oz; if (lx<0||lx>15||lz<0||lz>15||y<1||y>=CH) return; b[(y*CS+lz)*CS+lx]=id; };
    const R = 9, H = t.h;
    // solid foundation, hollow pyramid with orange terracotta stripes
    for (let dx=-R;dx<=R;dx++) for (let dz=-R;dz<=R;dz++) for (let y=H-6;y<=H;y++) set(t.x+dx,y,t.z+dz,B.SANDSTONE);
    for (let k=0;k<=R;k++) { const r = R-k, y = H+1+k; for (let dx=-r;dx<=r;dx++) for (let dz=-r;dz<=r;dz++) { const edge = Math.abs(dx)===r || Math.abs(dz)===r; set(t.x+dx,y,t.z+dz, edge ? ((k%3===1) ? B.TERRA_YELLOW : B.SANDSTONE) : B.AIR); } }
    // entrance on the south side
    for (let dz=R-2;dz<=R;dz++) for (let y=H+1;y<=H+3;y++) set(t.x, y, t.z+dz, B.AIR);
    for (let dx=-1;dx<=1;dx++) set(t.x+dx, H+4, t.z+R-1, B.TERRA_RED);
    // floor pattern and hidden loot chamber
    for (let dx=-2;dx<=2;dx++) for (let dz=-2;dz<=2;dz++) set(t.x+dx, H, t.z+dz, (Math.abs(dx)+Math.abs(dz))%2 ? B.TERRA_YELLOW : B.TERRACOTTA);
    set(t.x, H, t.z, B.TERRA_RED);
    for (let dx=-2;dx<=2;dx++) for (let dz=-2;dz<=2;dz++) for (let y=H-5;y<=H-1;y++) set(t.x+dx, y, t.z+dz, B.AIR);
    this.loot = this.loot || new Set();
    for (const [dx,dz] of [[1,1],[-1,-1]]) set(t.x+dx, H-1, t.z+dz, B.GLOWSTONE);
    for (const [dx,dz] of [[2,0],[-2,0],[0,2],[0,-2]]) { set(t.x+dx, H-5, t.z+dz, B.CHEST); this.loot.add((t.x+dx)+','+(H-5)+','+(t.z+dz)); }
  }
  villageAt(wx, wz) { const v = this.village(Math.floor(wx/128), Math.floor(wz/128)); if (v && Math.abs(v.x-wx) < 32 && Math.abs(v.z-wz) < 32) return v; return null; }
  placeVillage(b, cx, cz) {
    const v = this.village(Math.floor(cx*16/128), Math.floor(cz*16/128)); if (!v) return;
    const ox = cx*16, oz = cz*16; if (Math.abs(v.x - (ox+8)) > 48 || Math.abs(v.z - (oz+8)) > 48) return;
    const set = (x,y,z,id,meta=0) => { const lx=x-ox, lz=z-oz; if (lx<0||lx>15||lz<0||lz>15||y<1||y>=CH) return; const i=(y*CS+lz)*CS+lx; b[i]=id; };
    const get = (x,y,z) => { const lx=x-ox, lz=z-oz; if (lx<0||lx>15||lz<0||lz>15) return -1; return b[(y*CS+lz)*CS+lx]; };
    const setM = (x,y,z,id,meta) => { const lx=x-ox, lz=z-oz; if (lx<0||lx>15||lz<0||lz>15||y<1||y>=CH) return; const i=(y*CS+lz)*CS+lx; b[i]=id; (this._meta||{})[i]=meta; if (this._mArr) this._mArr[i]=meta; };
    const wall = v.desert ? B.SANDSTONE : B.PLANKS, base = v.desert ? B.SANDSTONE : B.COBBLE, corner = v.desert ? B.SANDSTONE : B.LOG;
    // paths
    const path = (x0,z0,x1,z1) => { let x=x0, z=z0; for (let k=0;k<80;k++) { const h=this.col(x,z).h; const t=get(x,h,z); if (t===B.GRASS||t===B.DIRT||t===B.SAND||t===B.SNOW_GRASS) { set(x,h,z, v.desert?B.SANDSTONE:B.PATH); for (let yy=h+1; yy<h+3; yy++){ const a=get(x,yy,z); if (a===B.TALLGRASS||a===B.ROSE||a===B.DANDELION||a===B.DEADBUSH) set(x,yy,z,B.AIR); } } if (x===x1 && z===z1) break; if (x!==x1) x += Math.sign(x1-x); else z += Math.sign(z1-z); } };
    for (const hs of v.houses) path(v.x, v.z, hs.x, hs.z);
    // well
    for (let dx=-2;dx<=1;dx++) for (let dz=-2;dz<=1;dz++) { const edge = dx===-2||dx===1||dz===-2||dz===1; for (let y=v.h-3;y<=v.h;y++) set(v.x+dx,y,v.z+dz, edge?base:(y===v.h-3?base:B.WATER)); set(v.x+dx,v.h+1,v.z+dz, edge?base:B.AIR);
      for (let y=v.h+2;y<=v.h+4;y++) set(v.x+dx,y,v.z+dz,B.AIR);
      if ((dx===-2||dx===1)&&(dz===-2||dz===1)) { set(v.x+dx,v.h+2,v.z+dz, v.desert?B.SANDSTONE:B.PLANKS); set(v.x+dx,v.h+3,v.z+dz, v.desert?B.SANDSTONE:B.PLANKS); }
      set(v.x+dx,v.h+4,v.z+dz,base); }
    // houses
    for (const hs of v.houses) {
      const R = hs.big ? 3 : 2, H = hs.h, W = 3;
      const ddx = v.x - hs.x, ddz = v.z - hs.z; const doorX = Math.abs(ddx) > Math.abs(ddz) ? Math.sign(ddx)*R : 0, doorZ = doorX ? 0 : Math.sign(ddz||1)*R;
      for (let dx=-R-1;dx<=R+1;dx++) for (let dz=-R-1;dz<=R+1;dz++) for (let y=H+1;y<=H+W+R+3;y++) set(hs.x+dx,y,hs.z+dz,B.AIR);
      for (let dx=-R;dx<=R;dx++) for (let dz=-R;dz<=R;dz++) {
        for (let y=H-4;y<=H;y++) { const g=get(hs.x+dx,y,hs.z+dz); if (y===H || g===B.AIR || g===B.WATER || g===B.TALLGRASS) set(hs.x+dx,y,hs.z+dz, base); }
        const edgeX = Math.abs(dx)===R, edgeZ = Math.abs(dz)===R;
        for (let y=H+1;y<=H+W;y++) { if (edgeX&&edgeZ) set(hs.x+dx,y,hs.z+dz,corner); else if (edgeX||edgeZ) set(hs.x+dx,y,hs.z+dz, (y===H+2 && (dx===0||dz===0) && !(dx===doorX&&dz===doorZ)) ? B.GLASS : wall); }
      }
      // roof (stepped pyramid)
      for (let k=0;k<=R+1;k++) { const r = R+1-k; for (let dx=-r;dx<=r;dx++) for (let dz=-r;dz<=r;dz++) if (k===R+1 || Math.abs(dx)===r || Math.abs(dz)===r) set(hs.x+dx,H+W+1+k,hs.z+dz, v.desert? B.SANDSTONE : (k%2?B.SPRUCE_LOG:B.PLANKS)); }
      // door
      const dm = doorX>0 ? 1 : doorX<0 ? 3 : doorZ>0 ? 2 : 0;
      if (this._mArr) { setM(hs.x+doorX,H+1,hs.z+doorZ,B.DOOR,dm); setM(hs.x+doorX,H+2,hs.z+doorZ,B.DOOR,dm|4); }
      // interior
      set(hs.x-R+1, H+1, hs.z-R+1, B.CRAFTING); set(hs.x+R-1, H+1, hs.z+R-1, B.BED); set(hs.x+R-1, H+1, hs.z-R+1, B.TORCH);
      if (hs.big) { set(hs.x-R+1, H+1, hs.z+R-1, B.FURNACE); set(hs.x, H+1, hs.z-R+1, B.CHEST); set(hs.x-R+1, H+1, hs.z, B.BOOKSHELF); set(hs.x-R+1, H+2, hs.z, B.BOOKSHELF); }
      // hay bales and a lantern outside the door
      if (!v.desert) { const ox2 = hs.x + doorX + (doorZ ? 1 : 0), oz2 = hs.z + doorZ + (doorX ? 1 : 0); const hh = this.col(ox2, oz2).h; if (Math.abs(hh-H) <= 1 && get(ox2,hh+1,oz2)===B.AIR) set(ox2, hh+1, oz2, (hs.x+hs.z)%3===0 ? B.HAY : B.LANTERN); }
      // farm plot next to some houses
      if (!v.desert && !hs.big && (hs.x+hs.z)%2===0) { const fx = hs.x + (doorX? 0 : R+3), fz = hs.z + (doorX ? R+3 : 0);
        for (let dx=-2;dx<=2;dx++) for (let dz=-1;dz<=1;dz++) { const x=fx+dx, z=fz+dz; const h=this.col(x,z).h; if (Math.abs(h-H)>2) continue;
          if (dz===0) set(x,h,z,B.WATER); else { set(x,h,z,B.FARMLAND); setM(x,h+1,z,B.WHEAT, 3+((x*7+z*3)&3)); } }
        for (let dx=-3;dx<=3;dx++) for (let dz=-2;dz<=2;dz++) { if (Math.abs(dx)!==3 && Math.abs(dz)!==2) continue; if (dx===0) continue; const x=fx+dx, z=fz+dz; const h=this.col(x,z).h; if (Math.abs(h-H)>2) continue; if (get(x,h+1,z)===B.AIR || get(x,h+1,z)===B.TALLGRASS) set(x,h+1,z,B.FENCE); } }
    }
  }
  generateNether(cx, cz) {
    const ch = { cx, cz, b: new Uint8Array(AREA*CH), m: new Uint8Array(AREA*CH), sky: new Uint8Array(AREA*CH), bl: new Uint8Array(AREA*CH), mesh: null, dirty: true, lit: false, modified: false };
    const b = ch.b, ox=cx*CS, oz=cz*CS;
    for (let z=0; z<CS; z++) for (let x=0; x<CS; x++) { const wx=ox+x, wz=oz+z;
      const floorH = 28 + this.nA.fbm(wx*0.03, wz*0.03, 3)*8, ceilH = 98 + this.nB.fbm(wx*0.04, wz*0.04, 2)*10;
      for (let y=0; y<CH; y++) { const i=(y*CS+z)*CS+x; let id = 0;
        if (y===0 || y>=CH-1 || (y<4 && this.rand(wx*3+y,wz,5)<0.5) || (y>CH-5 && this.rand(wx,wz*3+y,6)<0.5)) id = B.BEDROCK;
        else {
          const n = this.nC.n3(wx*0.04, y*0.06, wz*0.04) + this.nD.n3(wx*0.09, y*0.12, wz*0.09)*0.4;
          let dens = n - 0.15; if (y < floorH) dens += (floorH - y)*0.12; if (y > ceilH) dens += (y - ceilH)*0.12;
          if (dens > 0) id = B.NETHERRACK; else if (y <= 31) id = B.LAVA;
        }
        b[i] = id; }
      // surface decoration
      for (let y=2; y<CH-2; y++) { const i=(y*CS+z)*CS+x;
        if (b[i]===B.NETHERRACK && b[i+AREA]===0 && y>31 && this.nA.n2(wx*0.05+300, wz*0.05) > 0.35) b[i] = B.SOUL_SAND;
        if (b[i]===B.NETHERRACK && b[i-AREA]===0 && y>60 && this.rand(wx,wz,y) < 0.015) { for (let k=0;k<1+(this.rand(wx,wz,y+1)*4|0);k++) { const j=i-AREA*k; if (b[j]===0 || k===0) b[j]=B.GLOWSTONE; } }
        if (b[i]===B.NETHERRACK && this.rand(wx*7,wz*5,y) < 0.006) b[i] = B.QUARTZ_ORE;
      }
    }
    // fortress bridges: continuous along a few x-rows and z-columns
    const fy = 58;
    for (const [axis, line] of [['x', Math.floor(cz/6)], ['z', Math.floor(cx/6)]]) {
      if (this.rand(line, axis==='x'?1:2, 77) > 0.5) continue;
      const lineC = (axis==='x' ? Math.floor(cz/6)*6 : Math.floor(cx/6)*6) + 2 + (this.rand(line,3,78)*2|0);
      if ((axis==='x' ? cz : cx) !== lineC) continue;
      for (let a=0;a<16;a++) for (let w=4; w<=10; w++) {
        const x = axis==='x' ? a : w, z = axis==='x' ? w : a; const wx = ox+x, wz = oz+z;
        const edge = w===4 || w===10;
        for (let y=fy; y<fy+5; y++) b[(y*CS+z)*CS+x] = 0;
        b[(fy*CS+z)*CS+x] = B.NETHER_BRICK;
        if (edge) { b[((fy+1)*CS+z)*CS+x] = B.NETHER_BRICK; if ((axis==='x'?wx:wz) % 4 === 0) b[((fy+2)*CS+z)*CS+x] = B.NETHER_BRICK; }
        if ((axis==='x'?wx:wz) % 8 === 0 && (w===5||w===9)) for (let y=fy-1; y>1 && (b[(y*CS+z)*CS+x]===0 || b[(y*CS+z)*CS+x]===B.LAVA); y--) b[(y*CS+z)*CS+x] = B.NETHER_BRICK;
      }
    }
    const s = this.saved[cx+','+cz]; if (s) { ch.b.set(s.b); ch.m.set(s.m); ch.modified = true; }
    this.chunks.set(cx+','+cz, ch); return ch;
  }
  generate(cx, cz) {
    if (this.dim === 'nether') return this.generateNether(cx, cz);
    const ch = { cx, cz, b: new Uint8Array(AREA*CH), m: new Uint8Array(AREA*CH), sky: new Uint8Array(AREA*CH), bl: new Uint8Array(AREA*CH), mesh: null, dirty: true, lit: false, modified: false, heights: null };
    const b = ch.b; const ox = cx*CS, oz = cz*CS;
    const cols = []; // 20x20 incl border 2
    for (let z=-3; z<CS+3; z++) for (let x=-3; x<CS+3; x++) cols.push(this.col(ox+x, oz+z));
    const C = (x,z)=>cols[(z+3)*(CS+6)+(x+3)];
    const n3 = this.nB, n3b = this.nC, n3c = this.nA;
    for (let z=0; z<CS; z++) for (let x=0; x<CS; x++) {
      const wx=ox+x, wz=oz+z; const {h, biome} = C(x,z);
      const top = Math.min(h, CH-3);
      const sandy = biome===2 || biome===5 || ((biome===4||biome===7) && h>=SEA-4);
      for (let y=0; y<=top; y++) {
        let id;
        if (y === 0 || (y < 4 && this.rand(wx*7+y, wz, 3) < 0.5)) id = B.BEDROCK;
        else if (y === top) {
          if (biome===6) id = h>97 ? B.SNOW : (h>90 ? B.STONE : (C(x,z).temp < -0.15 ? B.SNOW_GRASS : B.GRASS));
          else if (sandy) id = biome===4||biome===7 ? (h<SEA-4? B.GRAVEL : B.SAND) : B.SAND;
          else if (h < SEA) id = biome===4? B.GRAVEL : B.DIRT;
          else if (biome===3) id = B.SNOW_GRASS; else id = B.GRASS;
        } else if (y > top-4) {
          if (biome===2) id = y>top-3 ? B.SAND : B.SANDSTONE; else if (sandy) id = B.SAND; else if (biome===6 && h>92) id = B.STONE; else id = B.DIRT;
        } else id = B.STONE;
        b[(y*CS+z)*CS+x] = id;
      }
      if (biome === 8) { const bands = [B.TERRACOTTA,B.TERRA_WHITE,B.TERRA_RED,B.TERRACOTTA,B.TERRA_YELLOW,B.TERRA_BROWN,B.TERRACOTTA,B.TERRA_RED,B.TERRA_WHITE];
        for (let y=Math.max(1,top-18); y<=top; y++) { const i=(y*CS+z)*CS+x; if (b[i]===B.BEDROCK) continue; b[i] = y>=top-1 && top<SEA+12 ? B.RED_SAND : bands[(y + 900) % bands.length]; } }
      if (biome === 9 && h < SEA && this.rand(wx,wz,31) < 0.5) b[(top*CS+z)*CS+x] = B.CLAY;
      if (biome === 9 && b[(top*CS+z)*CS+x] === B.GRASS) b[(top*CS+z)*CS+x] = B.SWAMP_GRASS;
      // water
      for (let y=top+1; y<=SEA; y++) b[(y*CS+z)*CS+x] = (y===SEA && biome===3) ? B.ICE : B.WATER;
      // caves
      const underwater = h < SEA+1;
      const capTop = underwater ? h-4 : h;
      for (let y=1; y<=capTop; y++) {
        const i=(y*CS+z)*CS+x; if (b[i]===B.BEDROCK) continue;
        const a1 = n3.n3(wx*0.022, y*0.035, wz*0.022), a2 = n3b.n3(wx*0.022, y*0.035+40, wz*0.022);
        let cave = a1*a1 + a2*a2 < 0.0065 * (y < 20 ? 1.6 : 1);
        if (!cave && y < 45) { const ch2 = n3c.n3(wx*0.016, y*0.03, wz*0.016); cave = ch2 > 0.62 - (45-y)*0.002; }
        if (cave) b[i] = y <= 10 ? B.LAVA : B.AIR;
      }
      // grass under removed? If top removed by cave fine.
    }
    // ores
    const r = mulberry(this.seed ^ (cx*73856093) ^ (cz*19349663));
    const vein = (id, count, size, ymin, ymax) => { for (let k=0;k<count;k++){ let x=r()*CS|0, y=ymin+r()*(ymax-ymin)|0, z=r()*CS|0; for (let s=0;s<size;s++){ if(x>=0&&x<CS&&z>=0&&z<CS&&y>0&&y<CH){ const i=(y*CS+z)*CS+x; if(b[i]===B.STONE) b[i]=id; } const d=r()*6|0; if(d===0)x++; else if(d===1)x--; else if(d===2)y++; else if(d===3)y--; else if(d===4)z++; else z--; } } };
    vein(B.COAL_ORE, 18, 9, 5, 110); vein(B.IRON_ORE, 12, 7, 5, 64); vein(B.GOLD_ORE, 3, 6, 5, 32); vein(B.DIAMOND_ORE, 2, 5, 5, 16); vein(B.LAPIS_ORE, 2, 6, 5, 32); if (C(8,8).biome===6) vein(B.EMERALD_ORE, 4, 1, 5, 90); vein(B.REDSTONE_ORE, 5, 7, 5, 16); vein(B.GRAVEL, 4, 14, 10, 70); vein(B.DIRT, 4, 14, 10, 70);
    // trees & plants (include neighbors so trees cross borders)
    for (let z=-3; z<CS+3; z++) for (let x=-3; x<CS+3; x++) {
      const wx=ox+x, wz=oz+z; const {h, biome} = C(x,z);
      if (h < SEA+1 || h > 118) continue;
      const rv = this.rand(wx, wz, 11);
      let dens = [0.006, 0.045, 0, 0.012, 0, 0, 0.004, 0, 0, 0.025, 0.09][biome];
      if (biome === 9 && h < SEA && x>=0&&x<CS&&z>=0&&z<CS && rv > 0.9) { const li = ((SEA+1)*CS+z)*CS+x; if (b[li]===B.AIR) b[li] = B.LILY; continue; }
      if (rv < dens) {
        // only if ground was not carved: check generated top for own-chunk; for neighbors assume ok
        if (x>=0&&x<CS&&z>=0&&z<CS) { const g=b[(h*CS+z)*CS+x]; if (g!==B.GRASS && g!==B.SNOW_GRASS && g!==B.DIRT && g!==B.SWAMP_GRASS) continue; }
        const kind = biome===10 ? (this.rand(wx,wz,12)<0.35 ? 'jungle' : 'bush') : biome===3||biome===6 ? 'spruce' : (biome===1 && this.rand(wx,wz,12)<0.3 ? 'birch' : 'oak');
        this.tree(b, x, h+1, z, kind, wx, wz);
      } else if (x>=0&&x<CS&&z>=0&&z<CS) {
        const i = ((h+1)*CS+z)*CS+x; const g = b[(h*CS+z)*CS+x]; if (b[i]!==B.AIR) continue;
        const p = this.rand(wx,wz,13);
        if ((g===B.GRASS||g===B.SAND) && (h===SEA||h===SEA+1) && (C(x+1,z).h<SEA || C(x-1,z).h<SEA || C(x,z+1).h<SEA || C(x,z-1).h<SEA) && p < 0.18) {
          const ht = 1 + (this.rand(wx,wz,16)*3|0); for (let k=0;k<ht;k++) b[((h+1+k)*CS+z)*CS+x] = B.CANE; continue; }
        if (biome===8) { if (p < 0.02) b[i] = B.DEADBUSH; }
        else if (biome===3 || (biome===6 && h > 90)) { if (g===B.SNOW_GRASS || g===B.SNOW || g===B.STONE) b[i] = B.SNOW_LAYER; }
        else if (biome===2) { if (g===B.SAND) { if (p<0.006) { const ht=1+(this.rand(wx,wz,14)*3|0); for(let k=0;k<ht;k++) b[((h+1+k)*CS+z)*CS+x]=B.CACTUS; } else if (p<0.012) b[i]=B.DEADBUSH; } }
        else if (g===B.GRASS && this.rand(wx>>2,wz>>2,41) < 0.01 && p < 0.25) { b[i] = B.PUMPKIN; ch.m[i] = [0,1,4,5][(p*16|0)&3]; }
        else if (g===B.GRASS) { if (p < (biome===0?0.18:0.08)) b[i]=B.TALLGRASS; else if (p<(biome===0?0.2:0.09)) b[i]=B.ROSE; else if (p<(biome===0?0.22:0.1)) b[i]=B.DANDELION; }
      }
    }
    this._mArr = ch.m; this.placeVillage(b, cx, cz); this._mArr = null;
    this.placeTemple(b, cx, cz);
    // dungeon: mossy room with a monster spawner and loot chests
    if (r() < 0.22) {
      const dx = 4 + (r()*8|0), dz = 4 + (r()*8|0), dy = 12 + (r()*35|0);
      let stone = 0; for (let x=dx-3;x<=dx+3;x++) for (let z=dz-3;z<=dz+3;z++) if (b[(dy*CS+z)*CS+x]===B.STONE) stone++;
      if (stone > 30) {
        for (let x=dx-3;x<=dx+3;x++) for (let z=dz-3;z<=dz+3;z++) for (let y=dy-1;y<=dy+4;y++) {
          const edge = x===dx-3||x===dx+3||z===dz-3||z===dz+3||y===dy-1||y===dy+4; const i=(y*CS+z)*CS+x;
          if (edge) { if (b[i]!==B.AIR || y===dy-1) b[i] = (y===dy-1 && r()<0.6) ? B.MOSSY : (r()<0.3 ? B.MOSSY : B.COBBLE); } else b[i] = B.AIR; }
        b[(dy*CS+dz)*CS+dx] = B.SPAWNER;
        this.spawners = this.spawners || new Set(); this.spawners.add((cx*16+dx)+','+dy+','+(cz*16+dz));
        this.loot = this.loot || new Set();
        for (const [ox2,oz2] of [[-2,0],[2,1]]) { if (r()<0.75) { const i=(dy*CS+(dz+oz2))*CS+(dx+ox2); b[i]=B.CHEST; this.loot.add((cx*16+dx+ox2)+','+dy+','+(cz*16+dz+oz2)); } }
      }
    }
    // saved edits
    const s = this.saved[cx+','+cz]; if (s) { ch.b.set(s.b); ch.m.set(s.m); ch.modified = true; }
    this.chunks.set(cx+','+cz, ch);
    return ch;
  }
  tree(b, x, y, z, kind, wx, wz) {
    if (kind === 'bush' || kind === 'jungle') {
      const set2=(xx,yy,zz,id,force)=>{ if(xx<0||xx>=CS||zz<0||zz>=CS||yy<0||yy>=CH) return; const i=(yy*CS+zz)*CS+xx; if(force||b[i]===B.AIR||b[i]===B.TALLGRASS) b[i]=id; };
      if (kind === 'bush') { set2(x,y,z,B.JUNGLE_LOG,true); for (let dx=-2;dx<=2;dx++) for (let dz=-2;dz<=2;dz++) for (let dy=0;dy<=2;dy++) if (Math.abs(dx)+Math.abs(dz)+dy <= 3 && this.rand(wx+dx,wz+dz,y+dy)<0.85) set2(x+dx,y+dy,z+dz,B.JUNGLE_LEAVES); return; }
      const ht = 9 + (this.rand(wx,wz,15)*7|0);
      for (let yy=y+ht-3; yy<=y+ht+1; yy++) { const rad = yy>=y+ht ? 2 : 3; for (let dx=-rad;dx<=rad;dx++) for (let dz=-rad;dz<=rad;dz++) if (dx*dx+dz*dz <= rad*rad+1) set2(x+dx,yy,z+dz,B.JUNGLE_LEAVES); }
      for (let k=0;k<ht;k++) set2(x,y+k,z,B.JUNGLE_LOG,true);
      for (let k=2;k<ht-2;k++) for (const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]) if (this.rand(wx+dx*3,wz+dz*5,y+k) < 0.12) set2(x+dx,y+k,z+dz,B.JUNGLE_LEAVES);
      return;
    }
    const ht = 4 + (this.rand(wx,wz,15)*3|0) + (kind==='spruce'?2:0);
    const log = kind==='spruce'?B.SPRUCE_LOG: kind==='birch'?B.BIRCH_LOG:B.LOG;
    const lv = kind==='spruce'?B.SPRUCE_LEAVES: kind==='birch'?B.BIRCH_LEAVES:B.LEAVES;
    const set=(xx,yy,zz,id,force)=>{ if(xx<0||xx>=CS||zz<0||zz>=CS||yy<0||yy>=CH) return; const i=(yy*CS+zz)*CS+xx; if(force||b[i]===B.AIR||b[i]===B.TALLGRASS) b[i]=id; };
    if (kind==='spruce') {
      for (let k=2;k<ht;k++){ const yy=y+k; const rad = ht-k<=2 ? 1 : ((ht-k)%2===0 ? 1 : 2); for(let dx=-rad;dx<=rad;dx++)for(let dz=-rad;dz<=rad;dz++){ if(Math.abs(dx)+Math.abs(dz)>rad+(rad>1?1:0) || (dx===0&&dz===0)) continue; set(x+dx,yy,z+dz,lv); } }
      set(x,y+ht,z,lv); set(x,y+ht+1,z,lv);
    } else {
      for (let yy=y+ht-3; yy<=y+ht; yy++){ const top = yy>=y+ht-1; const rad = top?1:2; for(let dx=-rad;dx<=rad;dx++)for(let dz=-rad;dz<=rad;dz++){ if(Math.abs(dx)===rad&&Math.abs(dz)===rad && (top || this.rand(wx+dx,wz+dz,yy)<0.5)) continue; set(x+dx,yy,z+dz,lv); } }
      set(x,y+ht+1,z,lv); set(x+1,y+ht+1,z,lv); set(x-1,y+ht+1,z,lv); set(x,y+ht+1,z+1,lv); set(x,y+ht+1,z-1,lv);
    }
    for (let k=0;k<ht+(kind==='spruce'?0:0);k++) set(x,y+k,z,log,true);
    if (x>=0&&x<CS&&z>=0&&z<CS && b[(y*CS+z)*CS+x]===log) {} // trunk replaces any snow layer at its base
    if (x>=0&&x<CS&&z>=0&&z<CS&&y>0) { const i=((y-1)*CS+z)*CS+x; if(b[i]===B.GRASS||b[i]===B.SNOW_GRASS) b[i]=B.DIRT; }
  }

  growTree(x,y,z){
    const kind = 'oak';
    for (let dx=-1;dx<=1;dx++) for (let dz=-1;dz<=1;dz++) { const ch=this.chunks.get(((x>>4)+dx)+','+((z>>4)+dz)); if (!ch) continue;
      this.tree(ch.b, x-ch.cx*16, y, z-ch.cz*16, kind, x, z); ch.modified = true; ch.dirty = true; }
    this.relightAround(x>>4, z>>4);
  }
  getBlock(x,y,z){ if (y<0) return B.BEDROCK; if (y>=CH) return 0; const ch=this.chunks.get((x>>4)+','+(z>>4)); if(!ch) return 0; return ch.b[(y*CS+(z&15))*CS+(x&15)]; }
  getMeta(x,y,z){ if (y<0||y>=CH) return 0; const ch=this.chunks.get((x>>4)+','+(z>>4)); if(!ch) return 0; return ch.m[(y*CS+(z&15))*CS+(x&15)]; }
  getSky(x,y,z){ if (y>=CH) return 15; if(y<0) return 0; const ch=this.chunks.get((x>>4)+','+(z>>4)); if(!ch) return 15; return ch.sky[(y*CS+(z&15))*CS+(x&15)]; }
  getBl(x,y,z){ if (y>=CH||y<0) return 0; const ch=this.chunks.get((x>>4)+','+(z>>4)); if(!ch) return 0; return ch.bl[(y*CS+(z&15))*CS+(x&15)]; }
  isLoaded(x,z){ return this.chunks.has((x>>4)+','+(z>>4)); }

  setBlock(x,y,z,id,meta=0, noLight=false) {
    if (y<0||y>=CH) return; const cx=x>>4, cz=z>>4; const ch=this.chunks.get(cx+','+cz); if(!ch) return;
    const i=(y*CS+(z&15))*CS+(x&15); const old = ch.b[i];
    ch.b[i]=id; ch.m[i]=meta; ch.modified = true;
    if (id===B.TORCH) (this.torches || (this.torches = new Set())).add(x+','+y+','+z);
    if (id===B.SAPLING || id===B.WHEAT) (this.growing || (this.growing = new Set())).add(x+','+y+','+z);
    if (!noLight) this.relightAround(cx,cz); else ch.needLight = true;
    this.markDirty(x,y,z);
    // fluids
    for (const [dx,dy,dz] of N6) { const n=this.getBlock(x+dx,y+dy,z+dz); if (BLOCKS[n].liquid) this.fluid.add((x+dx)+','+(y+dy)+','+(z+dz)); }
    if (BLOCKS[id].liquid) this.fluid.add(x+','+y+','+z);
    // gravity blocks above
    const above = this.getBlock(x,y+1,z); if (id===B.AIR && BLOCKS[above].gravity && this.onFall) this.onFall(x,y+1,z,above);
    if (id===B.AIR && (BLOCKS[above].plant || above===B.CANE)) { this.setBlock(x,y+1,z,B.AIR); }
    if (this.onChange) this.onChange(x,y,z,old,id);
  }
  markDirty(x,y,z){ const cx=x>>4, cz=z>>4; const lx=x&15, lz=z&15;
    for (let dx=-1; dx<=1; dx++) for (let dz=-1; dz<=1; dz++){ if (dx && !((dx<0&&lx===0)||(dx>0&&lx===15))) continue; if (dz && !((dz<0&&lz===0)||(dz>0&&lz===15))) continue; const c=this.chunks.get((cx+dx)+','+(cz+dz)); if(c) c.dirty=true; } }

  // ---------- lighting ----------
  relightAround(cx,cz){
    const group=[]; for (const [dx,dz] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]){ const c=this.chunks.get((cx+dx)+','+(cz+dz)); if(c){ group.push(c); c.sky.fill(0); c.bl.fill(0); c.lit=false; } }
    const center = this.chunks.get(cx+','+cz);
    for (const c of group) if (c!==center) this.light(c);
    if (center) this.light(center);
    for (const c of group) if (c!==center) { this.light(c); c.dirty = true; }
  }
  light(ch) {
    const b=ch.b, sky=ch.sky, bl=ch.bl;
    const q = this._q || (this._q = new Int32Array(AREA*CH*4)); let qh=0, qt=0;
    // sky columns
    for (let z=0;z<CS;z++) for (let x=0;x<CS;x++){ let l=15; for (let y=CH-1;y>=0;y--){ const i=(y*CS+z)*CS+x; const id=b[i]; if (OPAQUE[id]) { l=0; break; } if (ATTEN[id]) l=Math.max(0,l-ATTEN[id]-0); if (sky[i]<l) sky[i]=l; if (l===0) break; } }
    for (let y=0;y<CH;y++) for (let z=0;z<CS;z++) for (let x=0;x<CS;x++){ const i=(y*CS+z)*CS+x; const l=sky[i]; if (l>1) {
      if ((x>0 && sky[i-1]<l-1 && !OPAQUE[b[i-1]]) || (x<15 && sky[i+1]<l-1 && !OPAQUE[b[i+1]]) || (z>0 && sky[i-CS]<l-1 && !OPAQUE[b[i-CS]]) || (z<15 && sky[i+CS]<l-1 && !OPAQUE[b[i+CS]]) || (y>0 && sky[i-AREA]<l-1 && !OPAQUE[b[i-AREA]])) q[qt++]=i; } }
    this.seedBorders(ch, sky, 'sky', q, ()=>qt, v=>qt=v);
    qt = this._qt; this.bfs(ch, sky, q, 0, qt);
    qt=0;
    for (let i=0;i<AREA*CH;i++){ const L=LIGHT[b[i]]; if (L){ bl[i]=L; q[qt++]=i; } }
    this.seedBorders(ch, bl, 'bl', q, ()=>qt, v=>qt=v); qt=this._qt;
    this.bfs(ch, bl, q, 0, qt);
    ch.lit = true;
  }
  seedBorders(ch, arr, name, q, getT){
    let qt = getT(); const b=ch.b;
    const sides = [[-1,0],[1,0],[0,-1],[0,1]];
    for (const [dx,dz] of sides) {
      const n = this.chunks.get((ch.cx+dx)+','+(ch.cz+dz)); if (!n || !n.lit) continue; const na = n[name];
      for (let y=0;y<CH;y++) for (let k=0;k<CS;k++){
        let x,z,nx,nz; if (dx){ x = dx<0?0:15; nx = dx<0?15:0; z=nz=k; } else { z = dz<0?0:15; nz = dz<0?15:0; x=nx=k; }
        const v = na[(y*CS+nz)*CS+nx]-1; const i=(y*CS+z)*CS+x; if (v>arr[i] && !OPAQUE[b[i]]) { arr[i]=v; q[qt++]=i; }
      }
    }
    this._qt = qt;
  }
  bfs(ch, arr, q, qh, qt){
    const b=ch.b; const cap=q.length;
    while (qh !== qt) { const i=q[qh]; qh=(qh+1)%cap; const l=arr[i]; if (l<=1) continue;
      const x=i&15, z=(i>>4)&15, y=i>>8;
      for (let d=0; d<6; d++){ let n;
        if (d===0){ if(x===15)continue; n=i+1;} else if(d===1){ if(x===0)continue; n=i-1;} else if(d===2){ if(z===15)continue; n=i+CS;} else if(d===3){ if(z===0)continue; n=i-CS;} else if(d===4){ if(y===CH-1)continue; n=i+AREA;} else { if(y===0)continue; n=i-AREA; }
        const id=b[n]; if (OPAQUE[id]) continue; const nl=l-1-ATTEN[id]; if (nl>arr[n]){ arr[n]=nl; q[qt]=n; qt=(qt+1)%cap; } }
    }
  }

  // ---------- meshing ----------
  buildMesh(ch) {
    const P = 18; const pb = this._pb || (this._pb = new Uint8Array(P*P*CH)), ps = this._ps || (this._ps=new Uint8Array(P*P*CH)), pl = this._pl || (this._pl=new Uint8Array(P*P*CH)), pm = this._pm || (this._pm=new Uint8Array(P*P*CH));
    const ox=ch.cx*CS, oz=ch.cz*CS;
    // fill padded
    for (let dz=-1; dz<=1; dz++) for (let dx=-1; dx<=1; dx++) {
      const c = this.chunks.get((ch.cx+dx)+','+(ch.cz+dz));
      const x0 = dx<0?15:0, x1 = dx>0?0:15, z0 = dz<0?15:0, z1 = dz>0?0:15;
      for (let y=0;y<CH;y++) for (let z=z0; z<=z1; z++) for (let x=x0; x<=x1; x++) {
        const px = x + dx*16 + 1, pz = z + dz*16 + 1; const pi=(y*P+pz)*P+px;
        if (c) { const i=(y*CS+z)*CS+x; pb[pi]=c.b[i]; ps[pi]=c.sky[i]; pl[pi]=c.bl[i]; pm[pi]=c.m[i]; } else { pb[pi]=B.STONE; ps[pi]=15; pl[pi]=0; pm[pi]=0; }
      }
    }
    const O = { pos:[], uv:[], lt:[], idx:[] }, W = { pos:[], uv:[], lt:[], idx:[] };
    const PA = P*P;
    const tu = 1/16;
    for (let y=0;y<CH;y++) for (let z=0;z<CS;z++) for (let x=0;x<CS;x++) {
      const pi = (y*P+z+1)*P+x+1; const id = pb[pi]; if (!id) continue;
      const d = BLOCKS[id]; const r = d.render;
      if (r === 'cross') {
        const t = blockTile(id,0,pm[pi]); const u0=(t%16)*tu, v0=1-(Math.floor(t/16)+1)*tu; const s=ps[pi]/15, l=pl[pi]/15;
        const quads = [[[0.15,0,0.15],[0.85,0,0.85],[0.85,1,0.85],[0.15,1,0.15]], [[0.85,0,0.15],[0.15,0,0.85],[0.15,1,0.85],[0.85,1,0.15]]];
        for (const qd of quads) for (const rev of [false,true]) { const base=O.pos.length/3; const order = rev?[1,0,3,2]:[0,1,2,3]; const uvs=[[0,0],[1,0],[1,1],[0,1]];
          for (const k of order){ const c=qd[k]; O.pos.push(ox+x+c[0], y+c[1], oz+z+c[2]); O.uv.push(u0+uvs[k][0]*tu, v0+uvs[k][1]*tu); O.lt.push(s,l,0.9); }
          O.idx.push(base,base+1,base+2,base,base+2,base+3); }
        continue;
      }
      if (r === 'door') { const m = pm[pi]; const f = ((m&3) + (id===B.DOOR_OPEN?1:0)) % 4; const th = 3/16;
        const bx = [[0,0,0,1,1,th],[1-th,0,0,1,1,1],[0,0,1-th,1,1,1],[0,0,0,th,1,1]][f];
        this.boxFull(O, ox+x, y, oz+z, bx, (m&4) ? T.door_top : T.door_bot, Math.max(ps[pi], 0)/15, pl[pi]/15); continue; }
      if (d.portal) { const bx = (pm[pi]&1) ? [0.375,0,0,0.625,1,1] : [0,0,0.375,1,1,0.625]; const skip = FACES.map(F => pb[pi + F.n[0] + F.n[2]*P + F.n[1]*PA] === id || OPAQUE[pb[pi + F.n[0] + F.n[2]*P + F.n[1]*PA]]); this.boxFull(W, ox+x, y, oz+z, bx, T.portal, ps[pi]/15, 1, skip); continue; }
      if (r === 'stairs') { const t = blockTile(id,0,0), s = ps[pi]/15, l = pl[pi]/15; const f = pm[pi] & 3;
        const skip = FACES.map(F => OPAQUE[pb[pi + F.n[0] + F.n[2]*P + F.n[1]*PA]] === 1);
        this.boxFull(O, ox+x, y, oz+z, [0,0,0,1,0.5,1], t, s, l, [skip[0],skip[1],false,skip[3],skip[4],skip[5]]);
        const back = [[0,0.5,0.5,1,1,1],[0,0.5,0,0.5,1,1],[0,0.5,0,1,1,0.5],[0.5,0.5,0,1,1,1]][f];
        this.boxFull(O, ox+x, y, oz+z, back, t, s, l); continue; }
      if (r === 'fence') { const s = ps[pi]/15, l = pl[pi]/15, a = 6/16, bb = 10/16;
        this.boxFull(O, ox+x, y, oz+z, [a,0,a,bb,1,bb], T.planks, s, l);
        const con = (n) => pb[n]===id || OPAQUE[pb[n]];
        for (const [h0,h1] of [[6/16,9/16],[12/16,15/16]]) {
          if (con(pi+1)) this.boxFull(O, ox+x, y, oz+z, [bb,h0,7/16,1,h1,9/16], T.planks, s, l);
          if (con(pi-1)) this.boxFull(O, ox+x, y, oz+z, [0,h0,7/16,a,h1,9/16], T.planks, s, l);
          if (con(pi+P)) this.boxFull(O, ox+x, y, oz+z, [7/16,h0,bb,9/16,h1,1], T.planks, s, l);
          if (con(pi-P)) this.boxFull(O, ox+x, y, oz+z, [7/16,h0,0,9/16,h1,a], T.planks, s, l); }
        continue; }
      if (r === 'lily') { this.boxFull(O, ox+x, y, oz+z, [0,0,0,1,0.02,1], T.lily, ps[pi]/15, pl[pi]/15); continue; }
      if (r === 'ladder') { const L = 1/16; const bx = [[0,0,0,L,1,1],[1-L,0,0,1,1,1],[0,0,0,1,1,L],[0,0,1-L,1,1,1]][pm[pi]&3];
        this.boxFull(O, ox+x, y, oz+z, bx, T.ladder, ps[pi]/15, pl[pi]/15); continue; }
      if (id === B.LANTERN) { this.boxFull(O, ox+x, y, oz+z, [5/16,0,5/16,11/16,9/16,11/16], T.lantern, ps[pi]/15, 1); continue; }
      if (r === 'torch') { const tm = pm[pi]; const s = ps[pi]/15, l = Math.max(pl[pi],14)/15, lo = 3/16, hi = 13/16;
        if (tm===1) this.box(O, ox+x, y, oz+z, 0,lo,7/16, 2/16,hi,9/16, T.torch, s, l);
        else if (tm===2) this.box(O, ox+x, y, oz+z, 14/16,lo,7/16, 1,hi,9/16, T.torch, s, l);
        else if (tm===3) this.box(O, ox+x, y, oz+z, 7/16,lo,0, 9/16,hi,2/16, T.torch, s, l);
        else if (tm===4) this.box(O, ox+x, y, oz+z, 7/16,lo,14/16, 9/16,hi,1, T.torch, s, l);
        else this.box(O, ox+x, y, oz+z, 7/16,0,7/16, 9/16,10/16,9/16, T.torch, s, l); continue; }
      const liquid = d.liquid; const tgt = (liquid && id===B.WATER) || d.portal ? W : O;
      let topH = 1; const bed = r==='bed' || r==='slab'; if (bed) topH = d.hgt || (id===B.FARMLAND ? 0.9375 : 0.5625);
      if (liquid) { const above = pb[pi+PA]; if (above !== id) { const lvl = pm[pi]; topH = lvl===0 ? 0.875 : lvl>=8 ? 0.875 : Math.max(0.125, (8-lvl)/9); } }
      for (let f=0; f<6; f++) {
        const F = FACES[f]; const npi = pi + F.n[0] + F.n[2]*P + F.n[1]*PA; const nid = pb[npi];
        if (liquid) { if (nid===id) continue; if (OPAQUE[nid] && f!==2) continue; if (f===2 && OPAQUE[nid]) continue; if (f!==2 && f!==3 && BLOCKS[nid].liquid) continue; }
        else if (OPAQUE[nid] && !(bed && f===2)) continue;
        else if (nid===id && (d.glass || d.portal || id===B.ICE)) continue;
        else if (nid===id && d.leaves && ((x+y+z)&1)) continue;
        const t = blockTile(id, f, pm[pi]); const u0=(t%16)*tu, v0=1-(Math.floor(t/16)+1)*tu;
        const shade = F.shade;
        const base = tgt.pos.length/3; const aos = [];
        const inset = r==='cactus' && f!==2 && f!==3 ? 1/16 : 0;
        for (let k=0;k<4;k++){
          const c = F.c[k];
          let py = c[1]; if ((liquid||bed) && py===1) py = topH;
          let px = c[0], pz = c[2];
          if (inset) { if (f===0) px-=inset; else if (f===1) px+=inset; else if (f===4) pz-=inset; else if (f===5) pz+=inset; }
          tgt.pos.push(ox+x+px, y+py, oz+z+pz);
          let vv = F.uv[k][1]; if (liquid && (f!==2&&f!==3) && vv===1) vv = topH; if (bed && f!==2 && f!==3) vv = vv*topH + (1-topH);
          tgt.uv.push(u0+F.uv[k][0]*tu*0.998+0.0001, v0+vv*tu*0.998+0.0001);
          // AO + smooth light
          const s1 = npi + F.ao[k][0], s2 = npi + F.ao[k][1], cc = npi + F.ao[k][0] + F.ao[k][1];
          const o1 = OPAQUE[pb[s1]], o2 = OPAQUE[pb[s2]], o3 = OPAQUE[pb[cc]];
          let ao = (o1&&o2) ? 0 : 3-(o1+o2+o3);
          if (liquid || d.leaves) ao = 3;
          let ss = ps[npi], ll = pl[npi], n = 1;
          if (OPAQUE[nid] || nid===id&&!liquid&&d.opaque) { ss = ps[pi]; ll = pl[pi]; }
          if (!o1){ ss+=ps[s1]; ll+=pl[s1]; n++; } if (!o2){ ss+=ps[s2]; ll+=pl[s2]; n++; } if (!o3 && !(o1&&o2)){ ss+=ps[cc]; ll+=pl[cc]; n++; }
          aos.push(ao);
          tgt.lt.push(ss/n/15, ll/n/15, AO_V[ao]*shade);
        }
        if (aos[0]+aos[2] < aos[1]+aos[3]) tgt.idx.push(base+1,base+2,base+3,base+1,base+3,base);
        else tgt.idx.push(base,base+1,base+2,base,base+2,base+3);
      }
    }
    const mk = (A)=>{ if (!A.idx.length) return null; const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(A.pos,3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(A.uv,2)); g.setAttribute('lt', new THREE.Float32BufferAttribute(A.lt,3)); g.setIndex(A.idx); g.computeBoundingSphere(); return g; };
    return { opaque: mk(O), water: mk(W) };
  }
  boxFull(A, x, y, z, b, t, s, l, skip) {
    const tu=1/16; const u0=(t%16)*tu, v0=1-(Math.floor(t/16)+1)*tu;
    for (let f=0; f<6; f++){ if (skip && skip[f] && !((b[0]>0||b[3]<1) && (f===0||f===1)) && !((b[2]>0||b[5]<1) && (f===4||f===5))) continue; const F=FACES[f]; const base=A.pos.length/3;
      for (let k=0;k<4;k++){ const c=F.c[k]; A.pos.push(x+(c[0]?b[3]:b[0]), y+(c[1]?b[4]:b[1]), z+(c[2]?b[5]:b[2]));
        A.uv.push(u0+(0.001+F.uv[k][0]*0.998)*tu, v0+(0.001+F.uv[k][1]*0.998)*tu); A.lt.push(s,l,F.shade); }
      A.idx.push(base,base+1,base+2,base,base+2,base+3); }
  }
  box(A, x, y, z, x0,y0,z0,x1,y1,z1, t, s, l) {
    const tu=1/16; const u0=(t%16)*tu, v0=1-(Math.floor(t/16)+1)*tu;
    for (let f=0; f<6; f++){ const F=FACES[f]; const base=A.pos.length/3;
      for (let k=0;k<4;k++){ const c=F.c[k]; const px=c[0]?x1:x0, py=c[1]?y1:y0, pz=c[2]?z1:z0; A.pos.push(x+px,y+py,z+pz);
        let uu, vv; if (f===2||f===3){ uu=7/16+F.uv[k][0]*2/16; vv= 8/16+F.uv[k][1]*2/16; } else { uu = 7/16+F.uv[k][0]*2/16; vv = F.uv[k][1]*10/16; }
        A.uv.push(u0+uu*tu, v0+vv*tu); A.lt.push(s,l,F.shade); }
      A.idx.push(base,base+1,base+2,base,base+2,base+3); }
  }

  // ---------- fluids ----------
  tickFluids(dt) {
    this.fluidT += dt; if (this.fluidT < 0.25) return; this.fluidT = 0;
    this.lavaT++; const lavaTick = this.lavaT % 4 === 0;
    const list = [...this.fluid]; this.fluid.clear(); let n=0;
    for (const k of list) {
      if (n++ > 400) { this.fluid.add(k); continue; }
      const [x,y,z] = k.split(',').map(Number);
      const id = this.getBlock(x,y,z); if (!BLOCKS[id].liquid) continue;
      if (id===B.LAVA && !lavaTick) { this.fluid.add(k); continue; }
      const lvl = this.getMeta(x,y,z); const maxL = id===B.WATER ? 7 : 3;
      // support check for flowing
      if (lvl !== 0) {
        let ok = false; let best = 99;
        if (this.getBlock(x,y+1,z)===id) { ok=true; best=0; }
        for (const [dx,dz] of H4) { if (this.getBlock(x+dx,y,z+dz)===id) { const m=this.getMeta(x+dx,y,z+dz); const ml = m>=8?0:m; if (ml < (lvl>=8?99:lvl)) { ok=true; best=Math.min(best,ml); } } }
        if (!ok) { this.setBlock(x,y,z,B.AIR,0,true); continue; }
        // infinite water: two adjacent sources over solid ground make a new source
        if (id===B.WATER && lvl < 8) { let src=0; for (const [dx,dz] of H4) if (this.getBlock(x+dx,y,z+dz)===B.WATER && this.getMeta(x+dx,y,z+dz)===0) src++;
          const bl2 = this.getBlock(x,y-1,z); if (src >= 2 && (SOLID[bl2] || (bl2===B.WATER && this.getMeta(x,y-1,z)===0))) { this.setBlock(x,y,z,B.WATER,0,true); continue; } }
      }
      // interactions
      for (const [dx,dy,dz] of N6) { const nb=this.getBlock(x+dx,y+dy,z+dz); if (id===B.LAVA && nb===B.WATER) { this.setBlock(x,y,z, lvl===0?B.OBSIDIAN:B.COBBLE); break; } }
      if (this.getBlock(x,y,z)!==id) continue;
      const below = this.getBlock(x,y-1,z);
      if (y>0 && (BLOCKS[below].replace && below!==id && !(BLOCKS[below].liquid))) { if (this.isLoaded(x,z)) this.setBlock(x,y-1,z,id,8,true); }
      else if (y>0 && below===B.WATER && id===B.LAVA) { this.setBlock(x,y-1,z,B.STONE); }
      else if (below !== id || lvl===0) {
        const el = lvl>=8 ? 1 : lvl+1;
        if (el <= maxL && (below!==id)) for (const [dx,dz] of H4) { const nx=x+dx, nz=z+dz; if (!this.isLoaded(nx,nz)) continue; const nb=this.getBlock(nx,y,nz);
          if (nb===B.AIR || (BLOCKS[nb].replace && !BLOCKS[nb].liquid)) this.setBlock(nx,y,nz,id,el,true);
          else if (nb===id) { const m=this.getMeta(nx,y,nz); if (m!==0 && m<8 && m>el) this.setBlock(nx,y,nz,id,el,true); }
          else if (id===B.WATER && nb===B.LAVA) this.setBlock(nx,y,nz, this.getMeta(nx,y,nz)===0?B.OBSIDIAN:B.COBBLE); }
      }
    }
    // relight chunks with lava changes lazily
    for (const ch of this.chunks.values()) if (ch.needLight) { ch.needLight=false; ch.relightSoon = true; }
  }
}
const N6 = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
const H4 = [[1,0],[-1,0],[0,1],[0,-1]];
const AO_V = [0.45, 0.62, 0.8, 1.0];
// faces: n, corners (CCW from outside), uv, shade; ao offsets in padded index space computed below
const FACES = [
  { n:[1,0,0], c:[[1,0,1],[1,0,0],[1,1,0],[1,1,1]], shade:0.6 },
  { n:[-1,0,0], c:[[0,0,0],[0,0,1],[0,1,1],[0,1,0]], shade:0.6 },
  { n:[0,1,0], c:[[0,1,1],[1,1,1],[1,1,0],[0,1,0]], shade:1.0 },
  { n:[0,-1,0], c:[[0,0,0],[1,0,0],[1,0,1],[0,0,1]], shade:0.5 },
  { n:[0,0,1], c:[[0,0,1],[1,0,1],[1,1,1],[0,1,1]], shade:0.8 },
  { n:[0,0,-1], c:[[1,0,0],[0,0,0],[0,1,0],[1,1,0]], shade:0.8 },
];
{ const P=18, PA=P*P; const st=[1,PA,P];
  for (const F of FACES) { F.uv=[[0,0],[1,0],[1,1],[0,1]]; F.ao=[]; const na = F.n[0]?0:F.n[1]?1:2; const axes=[0,1,2].filter(a=>a!==na);
    for (const c of F.c) { const off = axes.map(a => (c[a]?1:-1)*st[a]); F.ao.push(off); } } }
export { FACES };
