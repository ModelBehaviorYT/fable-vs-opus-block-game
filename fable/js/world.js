'use strict';
// ================= NOISE =================
function makeNoise(seed){const p=new Uint8Array(512),r=rng32(seed);const a=new Uint8Array(256);for(let i=0;i<256;i++)a[i]=i;
  for(let i=255;i>0;i--){const j=(r()*(i+1))|0;const t=a[i];a[i]=a[j];a[j]=t;}for(let i=0;i<512;i++)p[i]=a[i&255];
  const fade=t=>t*t*t*(t*(t*6-15)+10);
  const g2=(h,x,y)=>{switch(h&7){case 0:return x+y;case 1:return x-y;case 2:return-x+y;case 3:return-x-y;case 4:return x;case 5:return-x;case 6:return y;default:return-y;}};
  const g3=(h,x,y,z)=>{h&=15;const u=h<8?x:y,v=h<4?y:(h===12||h===14)?x:z;return((h&1)?-u:u)+((h&2)?-v:v);};
  function n2(x,y){const X=Math.floor(x),Y=Math.floor(y);x-=X;y-=Y;const xi=X&255,yi=Y&255;const u=fade(x),v=fade(y);
    const aa=p[p[xi]+yi],ab=p[p[xi]+yi+1],ba=p[p[xi+1]+yi],bb=p[p[xi+1]+yi+1];
    const l1=g2(aa,x,y)+(g2(ba,x-1,y)-g2(aa,x,y))*u,l2=g2(ab,x,y-1)+(g2(bb,x-1,y-1)-g2(ab,x,y-1))*u;return(l1+(l2-l1)*v)*0.7;}
  function n3(x,y,z){const X=Math.floor(x),Y=Math.floor(y),Z=Math.floor(z);x-=X;y-=Y;z-=Z;const xi=X&255,yi=Y&255,zi=Z&255;const u=fade(x),v=fade(y),w=fade(z);
    const A=p[xi]+yi,AA=p[A]+zi,AB=p[A+1]+zi,Bq=p[xi+1]+yi,BA=p[Bq]+zi,BB=p[Bq+1]+zi;
    const L=(a,b,t)=>a+(b-a)*t;
    return L(L(L(g3(p[AA],x,y,z),g3(p[BA],x-1,y,z),u),L(g3(p[AB],x,y-1,z),g3(p[BB],x-1,y-1,z),u),v),
             L(L(g3(p[AA+1],x,y,z-1),g3(p[BA+1],x-1,y,z-1),u),L(g3(p[AB+1],x,y-1,z-1),g3(p[BB+1],x-1,y-1,z-1),u),v),w);}
  function fbm(x,y,o){let s=0,a=1,t=0;for(let i=0;i<o;i++){s+=n2(x,y)*a;t+=a;a*=0.5;x=x*2+17.3;y=y*2-9.1;}return s/t;}
  return{n2,n3,fbm};}

// ================= WORLD =================
const SEA=50,WH=128;
const BIO={OCEAN:0,RIVER:1,BEACH:2,PLAINS:3,FOREST:4,DESERT:5,SNOWY:6,MOUNT:7,REDLANDS:8,SWAMP:9,TAIGA:10};
const BIONAME=['Ocean','River','Beach','Plains','Forest','Desert','Snowy Tundra','Mountains','Redlands','Swamp','Taiga'];
const W={seed:0,noise:null,chunks:new Map(),mods:new Map(),tiles:{},ticks:new Map(),tickN:0};
let CI_h=0,CI_b=0;
function colInfo(x,z){const N=W.noise;
  const cont=N.fbm(x/380,z/380,4)*1.9+0.08,mnt=N.fbm(x/240+300,z/240-200,3)*1.9;
  const temp=N.fbm(x/480-90,z/480+40,2)*2.0,moist=N.fbm(x/400+700,z/400+900,2)*2.0,det=N.fbm(x/48,z/48,3);
  let h,land=cont>=-0.18;
  if(!land)h=SEA-2+(cont+0.18)*75+det*5;
  else{const k=Math.min(1,(cont+0.18)*4);h=SEA+1.5+k*4+det*7+(cont+0.18)*8;const m=Math.max(0,mnt-0.04);h+=m*m*300*Math.min(1,(cont+0.18)*3);}
  let river=false;
  if(land){const rv=Math.abs(N.n2(x/230+det*0.15,z/230+50));if(rv<0.05&&h<SEA+24){const t=rv/0.05,tg=SEA-4;h=tg+(h-tg)*t*t;if(h<SEA)river=true;}}
  h=Math.max(6,Math.min(118,Math.floor(h)));let b;
  if(h<SEA)b=land?BIO.RIVER:BIO.OCEAN;else if(h<=SEA+1)b=BIO.BEACH;else if(h>SEA+36)b=BIO.MOUNT;else if(temp<-0.3)b=BIO.SNOWY;else if(temp>0.25&&moist<0.2)b=(temp>0.48&&moist<0.02)?8:BIO.DESERT;else if(moist>0.1)b=BIO.FOREST;else b=BIO.PLAINS;
  if(b===BIO.BEACH&&temp<-0.3)b=BIO.SNOWY;
  if((b===BIO.PLAINS||b===BIO.FOREST)&&moist>0.4&&temp>-0.1&&h<SEA+13){const f=Math.min(1,(moist-0.4)/0.1)*Math.min(1,(SEA+13-h)/6)*Math.min(1,(temp+0.1)/0.1);const tg=SEA+(det>0.03?1:det>-0.1?0:-1);h=Math.round(h+(tg-h)*f);if(f>0.7)b=9;}
  if((b===BIO.PLAINS||b===BIO.FOREST)&&temp<-0.1)b=10;
  if(b===8){const q=N.fbm(x/60+40,z/60,2)*1.9;h+=q>0.2?17:q>-0.05?8:0;}
  CI_h=h;CI_b=b;return h;}
function isCave(x,y,z,h){if(y<2||y>h)return false;if(h<=SEA+2&&y>h-8)return false;const N=W.noise;
  const a=N.n3(x/36,y/22,z/36),b=N.n3(x/36+71.3,y/22+13.7,z/36-40.1);if(a*a+b*b<0.0075)return true;
  if(y<40){const c=N.n3(x/52+200,y/30,z/52+100);if(c>0.38)return true;}return false;}
const ckey=(cx,cz)=>(cx+32768)*65536+(cz+32768);
function getChunk(cx,cz){return W.chunks.get(ckey(cx,cz));}
const VR=128,VH=[[-11,-9],[10,-10],[-12,9],[11,10],[0,-19],[1,18],[-22,0],[22,1]];
function villageAt(rx,rz){const N=W.noise;if(!N.vc)N.vc=new Map();const k=rx+','+rz;if(N.vc.has(k))return N.vc.get(k);let v=null;
  if(hash2(rx,rz,W.seed+91)<0.6){for(let t=0;t<4&&!v;t++){const x=rx*VR+30+((hash2(rx+t*7,rz,W.seed+92)*(VR-60))|0),z=rz*VR+30+((hash2(rx,rz+t*7,W.seed+93)*(VR-60))|0);const h=colInfo(x,z);
      if((CI_b===BIO.PLAINS||CI_b===BIO.DESERT||CI_b===BIO.SNOWY)&&h>SEA+1&&h<SEA+20)v={x,z,h,b:CI_b};}}
  N.vc.set(k,v);return v;}
function nearestVillage(x,z){let best=null,bd=1e9;const rx=Math.floor(x/VR),rz=Math.floor(z/VR);for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++){const v=villageAt(rx+dx,rz+dz);if(v){const d=Math.hypot(v.x-x,v.z-z);if(d<bd){bd=d;best=v;}}}return best;}
function genUnder(cx,cz){const b=new Uint8Array(32768),m=new Uint8Array(32768);const c={cx,cz,b,m,maxY:0,mesh:null,meshT:null,dirty:true,urgent:false};const N=W.noise,x0=cx*16,z0=cz*16,seed=W.seed+777;
  for(let z=0;z<16;z++)for(let x=0;x<16;x++){const wx=x0+x,wz=z0+z,ci=(z<<4)|x;const fl=30+N.fbm(wx/70+500,wz/70,3)*34,ce=90+N.fbm(wx/55-300,wz/55+90,3)*28,an=N.n2(wx/13,wz/13);
    for(let y=0;y<=110;y++){let id=B.EMBERSTONE;if(y===0||y>=109||((y<3||y>106)&&hash2(wx*3+y,wz,seed)<0.5))id=B.BEDROCK;
      else{const d3=N.n3(wx/30,y/20,wz/30+900);if(Math.max(fl-y,y-ce)/10+d3*2.3<0)id=y<=24?B.LAVA:0;}
      b[(y<<8)|ci]=id;}
    for(let y=4;y<106;y++){const i=(y<<8)|ci;if(b[i]!==B.EMBERSTONE)continue;if(b[i+256]===0&&an>0.12){b[i]=B.ASH;const mh=hash2(wx+y*3,wz,seed+5);if(mh<0.035&&y>25)b[i+256]=mh<0.018?67:68;}
      else if(b[i-256]===0&&hash2(wx,wz+y*7,seed)<0.018){b[i-256]=B.LUMEN;if(hash2(wx+y,wz,seed)<0.5&&b[i-512]===0)b[i-512]=B.LUMEN;}}}
  const r=rng32(hashStr('u'+cx+','+cz)^seed);
  for(let i=0;i<10;i++){let x=(r()*16)|0,y=8+((r()*95)|0),z=(r()*16)|0;for(let k=0;k<8;k++){if(x>=0&&x<16&&z>=0&&z<16&&y>3&&y<106){const j=(y<<8)|(z<<4)|x;if(b[j]===B.EMBERSTONE)b[j]=B.EQUARTZ;}const d=(r()*6)|0;if(d===0)x++;else if(d===1)x--;else if(d===2)y++;else if(d===3)y--;else if(d===4)z++;else z--;}}
  if(hash2(cx,cz,seed+41)<0.07){let fy=-1;for(let y=70;y>27;y--){const i=(y<<8)|(8<<4)|8;if(b[i]===0&&b[i-256]!==0&&b[i-256]!==B.LAVA){fy=y;break;}}
    if(fy>0)for(let dy=-1;dy<=6;dy++)for(let dz=4;dz<=12;dz++)for(let dx=4;dx<=12;dx++){const ex=dx===4||dx===12,ez=dz===4||dz===12,edge=ex||ez,corner=ex&&ez,i=((fy+dy)<<8)|(dz<<4)|dx;let id=0;
        if(dy===-1)id=56;else if(corner)id=dy<6?B.OBSIDIAN:B.LUMEN;else if(edge)id=dy<1?56:(dy<4&&((dx+dz)%2===0)?0:(dy===4?56:(dy===5&&(dx+dz)%2?56:0)));
        if(dy<=-1){for(let k=fy-2;k>fy-14&&b[(k<<8)|(dz<<4)|dx]===0;k--)if(corner)b[(k<<8)|(dz<<4)|dx]=B.OBSIDIAN;}
        b[i]=id;m[i]=0;if(dy===0&&dx===8&&dz===8)b[i]=B.CAGE;if(dy===0&&((dx===6&&dz===6)||(dx===10&&dz===10)))b[i]=B.CHEST;if(dy===0&&dx===10&&dz===6)b[i]=B.DIAMOND_BLOCK;}}
  const md=W.mods.get(ckey(cx,cz));if(md)md.forEach((v,i)=>{b[i]=v&255;m[i]=v>>8;});
  c.maxY=110;W.chunks.set(ckey(cx,cz),c);return c;}
function genChunk(cx,cz){if(W.dim===1)return genUnder(cx,cz);
  const b=new Uint8Array(32768),m=new Uint8Array(32768);const c={cx,cz,b,m,maxY:0,mesh:null,meshT:null,dirty:true,urgent:false};
  const x0=cx*16,z0=cz*16,seed=W.seed,N=W.noise;const hs=new Uint8Array(256),bs=new Uint8Array(256);
  for(let z=0;z<16;z++)for(let x=0;x<16;x++){const wx=x0+x,wz=z0+z;const h=colInfo(wx,wz),bio=CI_b;hs[z*16+x]=h;bs[z*16+x]=bio;const ci=(z<<4)|x;
    const dn=N.n2(wx/9,wz/9);
    for(let y=0;y<=h;y++){let id=B.STONE;const d=h-y;
      if(y===0||(y<3&&hash2(wx*3+y,wz,seed)<0.5))id=B.BEDROCK;
      else{if(isCave(wx,y,wz,h)){if(y<=7)b[(y<<8)|ci]=B.LAVA;continue;}
        if(bio===BIO.OCEAN||bio===BIO.RIVER){if(d<3)id=h>SEA-7?B.SAND:(dn>0.1?B.GRAVEL:dn<-0.2?B.DIRT:B.SAND);}
        else if(bio===BIO.BEACH){if(d<3)id=B.SAND;else if(d<5)id=B.SANDSTONE;}
        else if(bio===BIO.DESERT){if(d<4)id=B.SAND;else if(d<7)id=B.SANDSTONE;}
        else if(bio===10){if(d===0)id=dn>0.22?B.GRAVEL:dn<-0.25?B.MOSSY:B.SGRASS;else if(d<4)id=B.DIRT;}
        else if(bio===9){if(d===0)id=h<SEA?B.DIRT:B.SGRASS;else if(d<4)id=B.DIRT;}
        else if(bio===8){if(d<1)id=B.REDSAND;else if(d<28)id=[62,63,64,62,65,62,64,63][y&7];}
        else if(bio===BIO.MOUNT){if(h>SEA+46+dn*6){if(d<2)id=B.SNOW;}else if(dn>0.05&&h<SEA+44){if(d===0)id=B.GRASS;else if(d<3)id=B.DIRT;}else if(dn<-0.3&&d<2)id=B.GRAVEL;}
        else if(bio===BIO.SNOWY){if(d===0)id=B.SNOWGRASS;else if(d<4)id=B.DIRT;}
        else{if(d===0)id=B.GRASS;else if(d<4)id=B.DIRT;}}
      b[(y<<8)|ci]=id;}
    for(let y=h+1;y<=SEA;y++)b[(y<<8)|ci]=(y===SEA&&N.fbm(wx/480-90,wz/480+40,2)*2.0<-0.3)?B.ICE:B.WATER;
    // plants
    const top=b[(h<<8)|ci];if(h>=SEA&&h<120){const r=hash2(wx,wz,seed+11);const ai=((h+1)<<8)|ci;
      if(top===B.GRASS){const fl=N.n2(wx/20+50,wz/20);if(r<(bio===BIO.PLAINS?0.1:0.06))b[ai]=B.TALLGRASS;else if(r<0.2+(fl>0.25?0.08:0)&&r>0.19)b[ai]=fl>0.4?B.FLOWER_B:(hash2(wx,wz,seed+5)<0.5?B.FLOWER_R:B.FLOWER_Y);}
      else if(top===B.SGRASS&&bio===10){if(r<0.14)b[ai]=B.TALLGRASS;else if(r<0.17)b[ai]=68;else if(r<0.19)b[ai]=B.DEADBUSH;}
      else if(top===B.SGRASS){if(r<0.2)b[ai]=B.TALLGRASS;else if(r<0.25)b[ai]=r<0.225?67:68;}
      else if((top===B.SAND||top===B.REDSAND)&&(bio===BIO.DESERT||bio===8)&&r<0.008)b[ai]=B.DEADBUSH;}
  }
  // ores
  const r=rng32(hashStr(cx+','+cz)^seed);
  const vein=(id,n,ymin,ymax,size)=>{for(let i=0;i<n;i++){let x=(r()*16)|0,y=ymin+((r()*(ymax-ymin))|0),z=(r()*16)|0;for(let k=0;k<size;k++){if(x>=0&&x<16&&z>=0&&z<16&&y>0&&y<120){const i2=(y<<8)|(z<<4)|x;if(b[i2]===B.STONE)b[i2]=id;}const d=(r()*6)|0;if(d===0)x++;else if(d===1)x--;else if(d===2)y++;else if(d===3)y--;else if(d===4)z++;else z--;}}};
  vein(B.DIRT,5,20,70,24);vein(B.GRAVEL,4,5,60,22);vein(B.COAL_ORE,16,5,100,9);vein(B.IRON_ORE,10,4,58,7);vein(B.GOLD_ORE,3,4,30,6);vein(B.DIAMOND_ORE,2,2,15,4);
  // trees
  const put=(wx,y,wz,id,soft,mt)=>{const lx=wx-x0,lz=wz-z0;if(lx<0||lx>15||lz<0||lz>15||y<1||y>125)return;const i=(y<<8)|(lz<<4)|lx;if(soft&&b[i]!==0&&SHAPE[b[i]]!==2)return;b[i]=id;m[i]=mt||0;};
  const CS=4;
  for(let gz=Math.floor((z0-3)/CS);gz<=Math.floor((z0+18)/CS);gz++)for(let gx=Math.floor((x0-3)/CS);gx<=Math.floor((x0+18)/CS);gx++){
    const tx=gx*CS+((hash2(gx,gz,seed+1)*CS)|0),tz=gz*CS+((hash2(gx,gz,seed+2)*CS)|0);const pr=hash2(gx,gz,seed+3);
    const h=colInfo(tx,tz),bio=CI_b;if(h<SEA)continue;
    const dens=bio===BIO.FOREST?0.5:bio===BIO.PLAINS?0.035:bio===BIO.SNOWY?0.1:bio===BIO.DESERT?0.05:bio===8?0.035:bio===9?0.24:bio===10?0.34:bio===BIO.MOUNT?(h<SEA+44?0.06:0):0;
    if(pr>=dens||isCave(tx,h,tz,h))continue;const r2=hash2(gx,gz,seed+4);
    if(bio===BIO.DESERT||bio===8){const ch=1+((r2*3)|0);for(let i=1;i<=ch;i++)put(tx,h+i,tz,B.CACTUS);continue;}
    if(bio===BIO.MOUNT&&N.n2(tx/9,tz/9)<=0.05)continue;
    if(bio===BIO.SNOWY||bio===10||(bio===BIO.MOUNT&&r2<0.5)){const th=6+((r2*4)|0);for(let i=1;i<=th;i++)put(tx,h+i,tz,B.SPRUCE_LOG);
      for(let ly=h+3;ly<=h+th+1;ly++){const k=h+th+1-ly;const rad=k===0?0:k===1?1:(k%2===0?2:1)+(k>4?1:0);for(let dz=-rad;dz<=rad;dz++)for(let dx=-rad;dx<=rad;dx++){if((dx||dz||ly>h+th)&&!(rad>1&&Math.abs(dx)===rad&&Math.abs(dz)===rad))put(tx+dx,ly,tz+dz,B.SPRUCE_LEAVES,1);}}
      put(tx,h+th+2,tz,B.SPRUCE_LEAVES,1);continue;}
    const birch=bio===BIO.FOREST&&r2<0.3;const th=(birch?6:5)+((hash2(gx,gz,seed+6)*3)|0),lg=birch?B.BIRCH_LOG:B.LOG,lf=birch?B.BIRCH_LEAVES:B.LEAVES,tp=h+th;
    for(let ly=tp-2;ly<=tp+1;ly++){const rad=ly<tp?2:1;for(let dz=-rad;dz<=rad;dz++)for(let dx=-rad;dx<=rad;dx++){if(Math.abs(dx)===rad&&Math.abs(dz)===rad&&(ly===tp+1||ly===tp-1&&false||hash2(tx+dx*7+ly,tz+dz*13,seed)<0.55))continue;put(tx+dx,ly,tz+dz,lf,1);}}
    for(let i=1;i<=th;i++)put(tx,h+i,tz,lg);
    if(b[((h)<<8)|(((tz-z0)&15)<<4)|((tx-x0)&15)]===B.GRASS&&tx>=x0&&tx<x0+16&&tz>=z0&&tz<z0+16)b[(h<<8)|((tz-z0)<<4)|(tx-x0)]=B.DIRT;
  }
  // reeds at the waterline
  for(let z=1;z<15;z++)for(let x=1;x<15;x++){const h=hs[z*16+x];if(h!==SEA||hash2(x0+x,z0+z,seed+31)>0.16)continue;const i=(h<<8)|(z<<4)|x,t=b[i];if(t!==B.SAND&&t!==B.GRASS&&t!==B.SGRASS&&t!==B.DIRT)continue;if(b[i+256])continue;
    if(b[i+1]===B.WATER||b[i-1]===B.WATER||b[i+16]===B.WATER||b[i-16]===B.WATER){const n=1+((hash2(x0+x,z0+z,seed+32)*3)|0);for(let k=1;k<=n;k++)b[i+256*k]=B.REEDS;}}
  // crypts
  if(hash2(cx,cz,seed+71)<0.09){const fy=12+((hash2(cx,cz,seed+72)*22)|0);if(hs[8*16+8]>fy+9){for(let dy=0;dy<=5;dy++)for(let dz=4;dz<=11;dz++)for(let dx=4;dx<=11;dx++){const wall=dx===4||dx===11||dz===4||dz===11||dy===0||dy===5;const i=((fy+dy)<<8)|(dz<<4)|dx;b[i]=wall?(hash2(x0+dx+dy*5,z0+dz,seed+73)<0.45?B.MOSSY:B.COBBLE):0;m[i]=0;}
      b[((fy+1)<<8)|(7<<4)|7]=B.CAGE;b[((fy+1)<<8)|(5<<4)|5]=B.CHEST;b[((fy+1)<<8)|(10<<4)|10]=B.CHEST;}}
  // villages
  for(let rz=Math.floor((z0-40)/VR);rz<=Math.floor((z0+56)/VR);rz++)for(let rx=Math.floor((x0-40)/VR);rx<=Math.floor((x0+56)/VR);rx++){const v=villageAt(rx,rz);if(!v||v.x<x0-40||v.x>x0+56||v.z<z0-40||v.z>z0+56)continue;
    const wall=v.b===BIO.DESERT?B.SANDSTONE:B.PLANKS,post=v.b===BIO.DESERT?B.SANDSTONE:B.LOG;
    VH.forEach((o,hi)=>{if(hash2(v.x+hi,v.z,seed+95)>0.85)return;const hx=v.x+o[0],hz=v.z+o[1];
      // path
      for(let t=0;t<=1;t+=0.04){const px=Math.round(v.x+o[0]*t),pz=Math.round(v.z+o[1]*t);if(px<x0-1||px>x0+16||pz<z0-1||pz>z0+16)continue;const ph=colInfo(px,pz);for(let d=0;d<2;d++){const lx=px+d-x0,lz=pz-z0;if(lx<0||lx>15||lz<0||lz>15)continue;const i=(ph<<8)|(lz<<4)|lx;if(b[i]===B.GRASS||b[i]===B.SAND||b[i]===B.SNOWGRASS){b[i]=B.GRAVEL;if(SHAPE[b[i+256]]===2)b[i+256]=0;}}}
      if(hx<x0-5||hx>x0+20||hz<z0-5||hz>z0+20)return;const gh=colInfo(hx,hz);if(gh<SEA+1)return;const dxs=Math.abs(o[0])>Math.abs(o[1]);
      for(let dz=-3;dz<=3;dz++)for(let dx=-3;dx<=3;dx++){const ax=Math.abs(dx),az=Math.abs(dz),e=Math.max(ax,az);
        if(e<=2){for(let d=1;d<=5;d++)put(hx+dx,gh-d,hz+dz,B.COBBLE);put(hx+dx,gh,hz+dz,e===2?B.COBBLE:B.PLANKS);
          for(let h=1;h<=3;h++){let id=0;if(e===2){id=(ax===2&&az===2)?post:wall;if(h===2&&((ax===2&&dz===0)||(az===2&&dx===0)))id=B.GLASS;
              const door=dxs?(dx===(o[0]>0?-2:2)&&dz===0):(dz===(o[1]>0?-2:2)&&dx===0);if(door)id=h<3?B.DOOR:wall;}put(hx+dx,gh+h,hz+dz,id,0,id===B.DOOR?(dxs?0:1):0);}
          put(hx+dx,gh+5,hz+dz,e<=1?49:0);}
        put(hx+dx,gh+4,hz+dz,e===3?49:B.PLANKS);if(e===3)for(let h=1;h<=3;h++)put(hx+dx,gh+h,hz+dz,0);}
      put(hx+1,gh+1,hz+1,B.TORCH);const fu=[B.TABLE,B.CHEST,B.FURNACE,55][hi%4];put(hx-1,gh+1,hz-1,B.BED);put(hx+1,gh+1,hz-1,fu);});
    // well
    for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const c0=dx===0&&dz===0;for(let d=1;d<=4;d++)put(v.x+dx,v.h-d,v.z+dz,c0&&d<3?B.WATER:B.COBBLE);put(v.x+dx,v.h,v.z+dz,c0?B.WATER:B.COBBLE);put(v.x+dx,v.h+1,v.z+dz,c0?0:(dx&&dz?post:48));put(v.x+dx,v.h+2,v.z+dz,dx&&dz?post:0);put(v.x+dx,v.h+3,v.z+dz,49);}
    put(v.x,v.h+2,v.z,0);
    for(let dz=-7;dz<=-3;dz++)for(let dx=4;dx<=10;dx++){const edge=dz===-7||dz===-3||dx===4||dx===10,wat=dx===7&&!edge;for(let d=1;d<=3;d++)put(v.x+dx,v.h-d,v.z+dz,B.DIRT);put(v.x+dx,v.h,v.z+dz,edge?B.LOG:wat?B.WATER:B.FARMLAND);put(v.x+dx,v.h+1,v.z+dz,edge?(dx===7&&dz===-3?0:82):wat?0:70+((hash2(v.x+dx,v.z+dz,seed)*4)|0));put(v.x+dx,v.h+2,v.z+dz,0);put(v.x+dx,v.h+3,v.z+dz,0);}}
  const md=W.mods.get(ckey(cx,cz));if(md)md.forEach((v,i)=>{b[i]=v&255;m[i]=v>>8;});
  let my=0;for(let i=32767;i>=0;i--)if(b[i]){my=i>>8;break;}c.maxY=my;
  W.chunks.set(ckey(cx,cz),c);return c;}

function getBlock(x,y,z){if(y<0)return B.BEDROCK;if(y>127)return 0;const c=W.chunks.get(ckey(x>>4,z>>4));return c?c.b[(y<<8)|((z&15)<<4)|(x&15)]:0;}
function getMeta(x,y,z){if(y<0||y>127)return 0;const c=W.chunks.get(ckey(x>>4,z>>4));return c?c.m[(y<<8)|((z&15)<<4)|(x&15)]:0;}
function isLoaded(x,z){return W.chunks.has(ckey(x>>4,z>>4));}
function setBlock(x,y,z,id,meta,noTick){if(y<1||y>126)return false;const cx=x>>4,cz=z>>4,c=W.chunks.get(ckey(cx,cz));if(!c)return false;
  const i=(y<<8)|((z&15)<<4)|(x&15);meta=meta||0;if(c.b[i]===id&&c.m[i]===meta)return false;c.b[i]=id;c.m[i]=meta;if(y>c.maxY)c.maxY=y;
  const k=ckey(cx,cz);let md=W.mods.get(k);if(!md)W.mods.set(k,md=new Map());md.set(i,id|(meta<<8));
  for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const n=W.chunks.get(ckey(cx+dx,cz+dz));if(n){n.dirty=true;const lx=x&15,lz=z&15;if((dx===0&&dz===0)||((dx===0||(dx<0?lx===0:lx===15))&&(dz===0||(dz<0?lz===0:lz===15))))n.urgent=true;}}
  if(!noTick){schedTick(x,y,z,2);schedTick(x+1,y,z,2);schedTick(x-1,y,z,2);schedTick(x,y+1,z,2);schedTick(x,y-1,z,2);schedTick(x,y,z+1,2);schedTick(x,y,z-1,2);}
  return true;}
function topSolid(x,z){const c=W.chunks.get(ckey(x>>4,z>>4));if(!c)return-1;const ci=((z&15)<<4)|(x&15);for(let y=c.maxY;y>0;y--)if(SOLID[c.b[(y<<8)|ci]])return y;return-1;}
function skyExposed(x,y,z){x=Math.floor(x);z=Math.floor(z);for(let yy=Math.floor(y)+1;yy<128;yy++){const b=getBlock(x,yy,z);if(OPAQUE[b]||b===B.WATER||BL[b]&&BL[b].leaf)return false;}return true;}

// ================= TICKS (fluids, falling, support) =================
function schedTick(x,y,z,d){const id=getBlock(x,y,z);if(!id)return;const b=BL[id];if(!(b.shape===3||b.shape===2||b.falls||id===B.CACTUS))return;
  const k=x+','+y+','+z;if(!W.ticks.has(k))W.ticks.set(k,{x,y,z,t:W.tickN+(id===B.WATER?5:id===B.LAVA?12:d)});}
const feff=m=>m===8?0:m;
function blockTick(x,y,z){const id=getBlock(x,y,z);if(!id)return;const b=BL[id];
  if(b.falls){const u=getBlock(x,y-1,z);if(y>1&&(REPL[u]))  {setBlock(x,y,z,0);setBlock(x,y-1,z,id);}return;}
  if(b.shape===2||id===B.CACTUS){const u=getBlock(x,y-1,z);if(!SOLID[u]){setBlock(x,y,z,0);if(b.drop&&typeof spawnDrop==='function')spawnDrop(x+0.5,y+0.3,z+0.5,{id:b.drop,n:1});}return;}
  if(b.shape!==3)return;
  const other=id===B.WATER?B.LAVA:B.WATER,maxL=id===B.WATER?7:3;let m=getMeta(x,y,z);
  const D=[[1,0],[-1,0],[0,1],[0,-1]];
  if(m>0){let nm=99;if(getBlock(x,y+1,z)===id)nm=8;else{let src=0;for(const d of D){if(getBlock(x+d[0],y,z+d[1])===id){const e=getMeta(x+d[0],y,z+d[1]);if(e===0)src++;if(feff(e)+1<nm)nm=feff(e)+1;}}
      if(id===B.WATER&&src>=2&&(SOLID[getBlock(x,y-1,z)]||(getBlock(x,y-1,z)===id&&getMeta(x,y-1,z)===0)))nm=0;}
    if(nm!==8&&nm>maxL){setBlock(x,y,z,0);return;}
    if(nm!==m){setBlock(x,y,z,id,nm);m=nm;}}
  const u=getBlock(x,y-1,z);
  if(u===other){setBlock(x,y-1,z,id===B.WATER?(getMeta(x,y-1,z)===0?B.OBSIDIAN:B.COBBLE):B.STONE);if(typeof sfx!=='undefined')sfx.fizz(x,y,z);return;}
  if(y>1&&REPL[u]&&u!==id){if(u&&SHAPE[u]===2&&BL[u].drop&&typeof spawnDrop==='function')spawnDrop(x+0.5,y-0.7,z+0.5,{id:BL[u].drop,n:1});setBlock(x,y-1,z,id,8);return;}
  if(u===id)return;
  const e=feff(m);if(e>=maxL)return;
  for(const d of D){const nx=x+d[0],nz=z+d[1];if(!isLoaded(nx,nz))continue;const n=getBlock(nx,y,nz);
    if(n===other){setBlock(nx,y,nz,(id===B.WATER?getMeta(nx,y,nz)===0:false)?B.OBSIDIAN:B.COBBLE);if(typeof sfx!=='undefined')sfx.fizz(nx,y,nz);}
    else if(n===id){const nm=getMeta(nx,y,nz);if(nm!==0&&nm!==8&&nm>e+1)setBlock(nx,y,nz,id,e+1);}
    else if(REPL[n]){if(n&&BL[n].drop&&typeof spawnDrop==='function')spawnDrop(nx+0.5,y+0.3,nz+0.5,{id:BL[n].drop,n:1});setBlock(nx,y,nz,id,e+1);}}
}
function worldTick(){W.tickN++;if(!W.ticks.size)return;const due=[];let n=0;W.ticks.forEach((t,k)=>{if(t.t<=W.tickN&&n<400){due.push(t);W.ticks.delete(k);n++;}});for(const t of due)blockTick(t.x,t.y,t.z);}

// ================= MESHER =================
const MG=14,RW=16+2*MG,RA=RW*RW;
const RB=new Uint8Array(RA*130),RM=new Uint8Array(RA*130),SL=new Uint8Array(RA*130),BLG=new Uint8Array(RA*130);
const LQ=new Int32Array(1<<21),LQM=(1<<21)-1;const colTop=new Int16Array(RA);
const FOFF=[1,-1,RA,-RA,RW,-RW];
const FC=[[[1,0,1],[1,0,0],[1,1,0],[1,1,1]],[[0,0,0],[0,0,1],[0,1,1],[0,1,0]],[[0,1,1],[1,1,1],[1,1,0],[0,1,0]],[[0,0,0],[1,0,0],[1,0,1],[0,0,1]],[[0,0,1],[1,0,1],[1,1,1],[0,1,1]],[[1,0,0],[0,0,0],[0,1,0],[1,1,0]]];
const FUV=[[0,0],[1,0],[1,1],[0,1]],FSH=[0.62,0.62,1,0.5,0.82,0.82],AOM=[0.42,0.6,0.8,1];
const AOO=FC.map((cs,f)=>cs.map(c=>{const ax=f>>1;const o=[];for(let a=0;a<3;a++)if(a!==ax)o.push((c[a]*2-1)*(a===0?1:a===1?RA:RW));return o;}));
function mkBuf(n){return{p:new Float32Array(n*3),u:new Float32Array(n*2),l:new Float32Array(n*3),ix:new Uint32Array(n*1.5),nv:0,ni:0};}
const BO=mkBuf(400000),BT=mkBuf(120000);
const FACEDIR=[4,0,5,1];// meta facing -> face index
let YT=0;
function fillRegion(c){let yt=0;for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const n=getChunk(c.cx+dx,c.cz+dz);if(n.maxY>yt)yt=n.maxY;}
  YT=Math.min(127,yt+2);
  for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const n=getChunk(c.cx+dx,c.cz+dz),nb=n.b;const lx0=Math.max(0,-dx*16-MG),lx1=Math.min(15,RW-1-MG-dx*16),lz0=Math.max(0,-dz*16-MG),lz1=Math.min(15,RW-1-MG-dz*16);
    for(let y=0;y<=YT;y++)for(let lz=lz0;lz<=lz1;lz++){const src=(y<<8)|(lz<<4),dst=(y*RW+dz*16+lz+MG)*RW+dx*16+MG;
      for(let lx=lx0;lx<=lx1;lx++)RB[dst+lx]=nb[src+lx];
      if(dx===0&&dz===0)for(let lx=0;lx<16;lx++)RM[dst+lx]=n.m[src+lx];}}
  RB.fill(0,RA*(YT+1),RA*(YT+2));}
function computeLight(){const tot=RA*(YT+1);SL.fill(0,0,tot+RA);BLG.fill(0,0,tot+RA);SL.fill(15,tot,tot+RA);let qh=0,qt=0;
  for(let c=0;c<RA;c++){let l=15,y=YT;for(;y>=0;y--){const i=y*RA+c;const op=OPAC[RB[i]];if(op>=15)break;l-=op;if(l<=0)break;SL[i]=l;}
    let t=YT+1;for(let yy=YT;yy>=0;yy--){if(SL[yy*RA+c]===15)t=yy;else break;}colTop[c]=t;}
  for(let z=0;z<RW;z++)for(let x=0;x<RW;x++){const c=z*RW+x;let mx=0;if(x>0&&colTop[c-1]>mx)mx=colTop[c-1];if(x<RW-1&&colTop[c+1]>mx)mx=colTop[c+1];if(z>0&&colTop[c-RW]>mx)mx=colTop[c-RW];if(z<RW-1&&colTop[c+RW]>mx)mx=colTop[c+RW];
    if(mx>YT)mx=YT;for(let y=mx;y>=0;y--){const i=y*RA+c;if(SL[i]>1){LQ[qt++]=i;}else if(y<colTop[c])break;}}
  const prop=(A)=>{while(qh<qt){const i=LQ[qh++&LQM];const l=A[i];if(l<=1)continue;const x=i%RW,z=((i/RW)|0)%RW,y=(i/RA)|0;
      for(let f=0;f<6;f++){if(f===0){if(x===RW-1)continue;}else if(f===1){if(x===0)continue;}else if(f===2){if(y>=YT)continue;}else if(f===3){if(y===0)continue;}else if(f===4){if(z===RW-1)continue;}else if(z===0)continue;
        const j=i+FOFF[f];const op=OPAC[RB[j]];if(op>=15)continue;const nl=l-1-op;if(nl>A[j]){A[j]=nl;if(nl>1){LQ[qt++&LQM]=j;}}}}};
  prop(SL);qh=qt=0;
  for(let i=0;i<tot;i++){const e=LIGHT[RB[i]];if(e){BLG[i]=e;LQ[qt++]=i;}}
  prop(BLG);}
function tileUV(t){return[(t%16)/16+0.0006,1-(((t/16)|0)+1)/16+0.0006];}
const TUV=[];for(let i=0;i<256;i++)TUV.push(tileUV(i));const TU=1/16-0.0012;
function buildChunkMesh(c){fillRegion(c);computeLight();const O=BO,T=BT;O.nv=O.ni=T.nv=T.ni=0;const my=Math.min(c.maxY,126);
  const lv=[0,0,0,0],sv=[0,0,0,0],av=[0,0,0,0];
  for(let y=1;y<=my;y++)for(let z=0;z<16;z++)for(let x=0;x<16;x++){const i=(y*RW+z+MG)*RW+x+MG;const id=RB[i];if(!id)continue;const shp=SHAPE[id],def=BL[id];
    if(shp===1){for(let f=0;f<6;f++){const j=i+FOFF[f];const nid=RB[j];if(OPAQUE[nid]&&!(f===2&&def.h))continue;if(nid===id&&!def.leaf&&!(def.h&&(f===2||f===3)))continue;
        const t=f===2?def.tex[0]:f===3?def.tex[1]:(def.tex[3]!==undefined&&FACEDIR[RM[i]&3]===f?def.tex[3]:def.tex[2]);const uv=TUV[t],cs=FC[f],oo=AOO[f];
        for(let v=0;v<4;v++){const o1=oo[v][0],o2=oo[v][1];const oa=OPAQUE[RB[j+o1]],ob=OPAQUE[RB[j+o2]],od=OPAQUE[RB[j+o1+o2]];
          let s=SL[j],bl=BLG[j],n=1;if(!oa){s+=SL[j+o1];bl+=BLG[j+o1];n++;}if(!ob){s+=SL[j+o2];bl+=BLG[j+o2];n++;}if(!od&&!(oa&&ob)){s+=SL[j+o1+o2];bl+=BLG[j+o1+o2];n++;}
          av[v]=(oa&&ob)?0:3-oa-ob-od;sv[v]=s/n/15;lv[v]=bl/n/15;}
        const hh=def.h||1,vh=f===2||f===3?1:hh;
        const b0=O.nv;for(let v=0;v<4;v++){const k=O.nv++,cc=cs[v];O.p[k*3]=x+cc[0];O.p[k*3+1]=y+cc[1]*hh;O.p[k*3+2]=z+cc[2];O.u[k*2]=uv[0]+FUV[v][0]*TU;O.u[k*2+1]=uv[1]+FUV[v][1]*TU*vh;O.l[k*3]=sv[v];O.l[k*3+1]=lv[v];O.l[k*3+2]=FSH[f]*AOM[av[v]];}
        if(av[0]+av[2]<av[1]+av[3]){O.ix[O.ni++]=b0+1;O.ix[O.ni++]=b0+2;O.ix[O.ni++]=b0+3;O.ix[O.ni++]=b0+1;O.ix[O.ni++]=b0+3;O.ix[O.ni++]=b0;}
        else{O.ix[O.ni++]=b0;O.ix[O.ni++]=b0+1;O.ix[O.ni++]=b0+2;O.ix[O.ni++]=b0;O.ix[O.ni++]=b0+2;O.ix[O.ni++]=b0+3;}}}
    else if(shp===2){const uv=TUV[def.tex[0]];const s=id===B.TORCH?1:SL[i]/15,bl=id===B.TORCH?1:BLG[i]/15;const a=id===B.TORCH?0:0.12;
      const Q=[[a,a,1-a,1-a],[1-a,1-a,a,a],[a,1-a,1-a,a],[1-a,a,a,1-a]];
      for(const q of Q){const b0=O.nv;for(let v=0;v<4;v++){const k=O.nv++;const fx=v===0||v===3?q[0]:q[2],fz=v===0||v===3?q[1]:q[3];O.p[k*3]=x+fx;O.p[k*3+1]=y+(v>1?1:0);O.p[k*3+2]=z+fz;O.u[k*2]=uv[0]+FUV[v][0]*TU;O.u[k*2+1]=uv[1]+FUV[v][1]*TU;O.l[k*3]=s;O.l[k*3+1]=bl;O.l[k*3+2]=1;}
        O.ix[O.ni++]=b0;O.ix[O.ni++]=b0+1;O.ix[O.ni++]=b0+2;O.ix[O.ni++]=b0;O.ix[O.ni++]=b0+2;O.ix[O.ni++]=b0+3;}}
    else if(shp===5){const uv=TUV[def.tex[0]],open=id===75,lad=id===76,ax=lad?(RM[i]&1):(RM[i]&1)^(open?1:0),off=lad?((RM[i]&2)?0.06:0.94):open?0.07:0.5,s=SL[i]/15,bl=BLG[i]/15;
      for(let w=0;w<2;w++){const b0=O.nv;for(let v=0;v<4;v++){const k=O.nv++,t=(v===0||v===3)?0:1;O.p[k*3]=ax?x+t:x+off;O.p[k*3+1]=y+(v>1?1:0);O.p[k*3+2]=ax?z+off:z+t;O.u[k*2]=uv[0]+t*TU;O.u[k*2+1]=uv[1]+(v>1?1:0)*TU;O.l[k*3]=s;O.l[k*3+1]=bl;O.l[k*3+2]=0.9;}
        if(w){O.ix[O.ni++]=b0;O.ix[O.ni++]=b0+1;O.ix[O.ni++]=b0+2;O.ix[O.ni++]=b0;O.ix[O.ni++]=b0+2;O.ix[O.ni++]=b0+3;}else{O.ix[O.ni++]=b0;O.ix[O.ni++]=b0+2;O.ix[O.ni++]=b0+1;O.ix[O.ni++]=b0;O.ix[O.ni++]=b0+3;O.ix[O.ni++]=b0+2;}}}
    else if(shp===6||shp===7){const uv=TUV[def.tex[0]],mt=RM[i]&3,s=Math.max(SL[i],SL[i+RA])/15,bl=Math.max(BLG[i],BLG[i+RA])/15;
      let bx;if(shp===6)bx=[[0,0,0,1,0.5,1],mt===0?[0,0.5,0.5,1,1,1]:mt===2?[0,0.5,0,1,1,0.5]:mt===1?[0.5,0.5,0,1,1,1]:[0,0.5,0,0.5,1,1]];
      else{bx=[[0.375,0,0.375,0.625,1,0.625]];const cn=o=>{const n=RB[i+o];return n===id||(OPAQUE[n]&&n!==0);};for(const yy of[0.375,0.75]){if(cn(1))bx.push([0.625,yy,0.44,1,yy+0.19,0.56]);if(cn(-1))bx.push([0,yy,0.44,0.375,yy+0.19,0.56]);if(cn(RW))bx.push([0.44,yy,0.625,0.56,yy+0.19,1]);if(cn(-RW))bx.push([0.44,yy,0,0.56,yy+0.19,0.375]);}}
      for(const q of bx)for(let f=0;f<6;f++){const cs=FC[f],b0=O.nv;for(let v=0;v<4;v++){const k=O.nv++,cc=cs[v];const px=q[0]+cc[0]*(q[3]-q[0]),py=q[1]+cc[1]*(q[4]-q[1]),pz=q[2]+cc[2]*(q[5]-q[2]);O.p[k*3]=x+px;O.p[k*3+1]=y+py;O.p[k*3+2]=z+pz;
          const uu=f<2?pz:px,vv=f===2||f===3?pz:py;O.u[k*2]=uv[0]+uu*TU;O.u[k*2+1]=uv[1]+vv*TU;O.l[k*3]=s;O.l[k*3+1]=bl;O.l[k*3+2]=FSH[f];}
        O.ix[O.ni++]=b0;O.ix[O.ni++]=b0+1;O.ix[O.ni++]=b0+2;O.ix[O.ni++]=b0;O.ix[O.ni++]=b0+2;O.ix[O.ni++]=b0+3;}}
    else if(shp===4){const uv=TUV[def.tex[0]];for(let f=0;f<6;f++){const nid=RB[i+FOFF[f]];if(nid===id||OPAQUE[nid])continue;const cs=FC[f],b0=T.nv;
        for(let v=0;v<4;v++){const k=T.nv++,cc=cs[v];T.p[k*3]=x+cc[0];T.p[k*3+1]=y+cc[1];T.p[k*3+2]=z+cc[2];T.u[k*2]=uv[0]+FUV[v][0]*TU;T.u[k*2+1]=uv[1]+FUV[v][1]*TU;T.l[k*3]=1;T.l[k*3+1]=1;T.l[k*3+2]=1;}
        T.ix[T.ni++]=b0;T.ix[T.ni++]=b0+1;T.ix[T.ni++]=b0+2;T.ix[T.ni++]=b0;T.ix[T.ni++]=b0+2;T.ix[T.ni++]=b0+3;}}
    else{const lava=id===B.LAVA,Bf=lava?O:T,uv=TUV[def.tex[0]];const m=RM[i];let h=RB[i+RA]===id?1:(m===0||m===8)?0.875:Math.max(0.12,0.875-m*(lava?0.24:0.105));
      for(let f=0;f<6;f++){const j=i+FOFF[f];const nid=RB[j];if(nid===id)continue;if(OPAQUE[nid]&&!(f===2&&h<1))continue;const cs=FC[f];
        const s=lava?1:Math.max(SL[j],SL[i])/15,bl=lava?1:Math.max(BLG[j],BLG[i])/15;const b0=Bf.nv;
        for(let v=0;v<4;v++){const k=Bf.nv++,cc=cs[v];Bf.p[k*3]=x+cc[0];Bf.p[k*3+1]=y+cc[1]*h;Bf.p[k*3+2]=z+cc[2];Bf.u[k*2]=uv[0]+FUV[v][0]*TU;Bf.u[k*2+1]=uv[1]+FUV[v][1]*TU*(f<2||f>3?h:1);Bf.l[k*3]=s;Bf.l[k*3+1]=bl;Bf.l[k*3+2]=FSH[f];}
        Bf.ix[Bf.ni++]=b0;Bf.ix[Bf.ni++]=b0+1;Bf.ix[Bf.ni++]=b0+2;Bf.ix[Bf.ni++]=b0;Bf.ix[Bf.ni++]=b0+2;Bf.ix[Bf.ni++]=b0+3;
        if(f===2&&!lava){Bf.ix[Bf.ni++]=b0;Bf.ix[Bf.ni++]=b0+2;Bf.ix[Bf.ni++]=b0+1;Bf.ix[Bf.ni++]=b0;Bf.ix[Bf.ni++]=b0+3;Bf.ix[Bf.ni++]=b0+2;}}}
  }
  const mk=(Bf,old,mat,ro)=>{if(old){scene.remove(old);old.geometry.dispose();}if(!Bf.nv)return null;const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(Bf.p.slice(0,Bf.nv*3),3));g.setAttribute('uv',new THREE.BufferAttribute(Bf.u.slice(0,Bf.nv*2),2));g.setAttribute('light',new THREE.BufferAttribute(Bf.l.slice(0,Bf.nv*3),3));
    g.setIndex(new THREE.BufferAttribute(Bf.ix.slice(0,Bf.ni),1));g.boundingSphere=new THREE.Sphere(new THREE.Vector3(8,YT/2,8),Math.sqrt(128+YT*YT/4)+2);
    const me=new THREE.Mesh(g,mat);me.position.set(c.cx*16,0,c.cz*16);me.renderOrder=ro;me.matrixAutoUpdate=false;me.updateMatrix();scene.add(me);return me;};
  c.mesh=mk(O,c.mesh,matOpaque,0);c.meshT=mk(T,c.meshT,matWater,5);c.dirty=false;c.urgent=false;}
function disposeChunk(c){if(c.mesh){scene.remove(c.mesh);c.mesh.geometry.dispose();}if(c.meshT){scene.remove(c.meshT);c.meshT.geometry.dispose();}}
function clearWorld(){W.chunks.forEach(disposeChunk);W.chunks.clear();W.modsD=[new Map(),new Map()];W.tilesD=[{},{}];W.dim=0;W.portalOW=null;W.mods=W.modsD[0];W.tiles=W.tilesD[0];W.ticks=new Map();}
let spiral=[],spiralR=-1;
function updateChunks(px,pz,R,budget){if(spiralR!==R){spiral=[];for(let dz=-R;dz<=R;dz++)for(let dx=-R;dx<=R;dx++)if(dx*dx+dz*dz<=(R+0.5)*(R+0.5))spiral.push([dx,dz,dx*dx+dz*dz]);spiral.sort((a,b)=>a[2]-b[2]);spiralR=R;}
  const pcx=Math.floor(px)>>4,pcz=Math.floor(pz)>>4;const t0=performance.now();let urg=0;
  W.chunks.forEach(c=>{if(c.urgent&&c.mesh!==undefined&&urg<5&&c.meshed){let ok=true;for(let dz=-1;dz<=1&&ok;dz++)for(let dx=-1;dx<=1;dx++)if(!getChunk(c.cx+dx,c.cz+dz)){ok=false;break;}if(ok){buildChunkMesh(c);urg++;}}});
  let pending=0;
  for(const o of spiral){const cx=pcx+o[0],cz=pcz+o[1];let c=getChunk(cx,cz);if(c&&c.meshed&&!c.dirty)continue;pending++;if(performance.now()-t0>budget)continue;
    const ta=performance.now();for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++)if(!getChunk(cx+dx,cz+dz)){genChunk(cx+dx,cz+dz);W.nGen=(W.nGen||0)+1;}
    const tb=performance.now();c=getChunk(cx,cz);buildChunkMesh(c);c.meshed=true;pending--;W.tGen=(W.tGen||0)+tb-ta;W.tMesh=(W.tMesh||0)+performance.now()-tb;W.nMesh=(W.nMesh||0)+1;}
  if((W.tickN&63)===0)W.chunks.forEach((c,k)=>{if(Math.abs(c.cx-pcx)>R+3||Math.abs(c.cz-pcz)>R+3){disposeChunk(c);W.chunks.delete(k);}});
  return pending;}
