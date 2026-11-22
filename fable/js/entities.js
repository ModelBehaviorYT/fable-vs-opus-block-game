'use strict';
// ================= SOUND =================
const sfx=(()=>{let ac=null,master=null,nb=null;
  function init(){if(ac){if(ac.state==='suspended')ac.resume();return;}try{ac=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
    master=ac.createGain();master.gain.value=opts.volume;master.connect(ac.destination);nb=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
  function setVol(v){if(master)master.gain.value=v;}
  function att(x,y,z){if(x===undefined||typeof P==='undefined')return 1;const d=Math.hypot(x-P.x,y-P.y,z-P.z);return clamp(1-d/24,0,1);}
  function noise(dur,freq,q,gain,type,delay){if(!ac||gain<=0)return;const t=ac.currentTime+(delay||0);const s=ac.createBufferSource();s.buffer=nb;s.loop=true;s.playbackRate.value=0.7+Math.random()*0.6;
    const f=ac.createBiquadFilter();f.type=type||'bandpass';f.frequency.value=freq;f.Q.value=q;const g=ac.createGain();g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    s.connect(f);f.connect(g);g.connect(master);s.start(t,Math.random()*0.5);s.stop(t+dur+0.02);}
  function tone(f0,f1,dur,gain,type,delay){if(!ac||gain<=0)return;const t=ac.currentTime+(delay||0);const o=ac.createOscillator();o.type=type||'square';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
    const g=ac.createGain();g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+0.02);}
  const MAT={grass:[700,0.8,'lowpass'],stone:[1700,1.5,'bandpass'],wood:[520,2.5,'bandpass'],sand:[3200,0.6,'bandpass'],gravel:[1100,0.7,'bandpass'],snow:[2400,0.5,'bandpass'],glass:[4200,4,'bandpass'],cloth:[380,0.8,'lowpass']};
  const mat=(m,dur,g,d)=>{const p=MAT[m]||MAT.stone;noise(dur,p[0]*(0.85+Math.random()*0.3),p[1],g,p[2],d);};
  return{init,setVol,
    step(m){mat(m,0.09,0.22);if(m==='gravel')mat(m,0.06,0.15,0.05);if(m==='wood')tone(160,110,0.05,0.05,'sine');},
    hit(m){mat(m,0.07,0.2);},
    dig(m,x,y,z){const a=att(x,y,z);mat(m,0.22,0.5*a);mat(m,0.12,0.3*a,0.07);if(m==='glass'){tone(2600,1800,0.15,0.1*a,'triangle');tone(3400,2400,0.2,0.07*a,'triangle',0.04);}if(m==='stone')tone(180,90,0.08,0.12*a,'sine');},
    place(m){mat(m,0.1,0.4);tone(200,120,0.07,0.15,'sine');},
    xp(){const f=1100+Math.random()*700;tone(f,f*1.5,0.09,0.05,'sine');},
    levelup(){[523,659,784,1047].forEach((f,i)=>tone(f,f,0.22,0.09,'triangle',i*0.09));},
    music(){const sc=[220,247,277,330,370,440,494,554,660],n=5+((Math.random()*5)|0);let t=0,k=(Math.random()*sc.length)|0;for(let i=0;i<n;i++){k=clamp(k+((Math.random()*5)|0)-2,0,sc.length-1);const f=sc[k]*(Math.random()<0.25?0.5:1);tone(f,f,2.6,0.035,'sine',t);tone(f*2,f*2,1.2,0.009,'triangle',t);if(Math.random()<0.4)tone(sc[clamp(k+2,0,8)],sc[clamp(k+2,0,8)],2.2,0.02,'sine',t+0.05);t+=0.7+Math.random()*1.3;}},
    pop(){tone(520+Math.random()*200,1100,0.09,0.12,'sine');},
    click(){tone(900,700,0.04,0.1,'square');},
    hurt(){tone(380,160,0.22,0.22,'sawtooth');noise(0.12,900,1,0.2);},
    eat(){for(let i=0;i<3;i++)noise(0.08,900+i*200,2,0.25,'bandpass',i*0.13);tone(300,200,0.1,0.08,'sine',0.42);},
    fall(){noise(0.2,300,0.7,0.5,'lowpass');tone(120,50,0.2,0.3,'sine');},
    splash(){noise(0.5,1400,0.6,0.3,'bandpass');},
    ambient(k){if(k==='bird'){const f=2200+Math.random()*1600,n=2+((Math.random()*4)|0);for(let i=0;i<n;i++)tone(f*(1+Math.random()*0.15),f*(0.8+Math.random()*0.5),0.07,0.035,'sine',i*0.11+Math.random()*0.03);}
      else if(k==='cave'){const f=55+Math.random()*40;tone(f,f*0.92,3.5,0.1,'sine');tone(f*1.5,f*1.46,3,0.04,'triangle',0.4);noise(3,180,1.5,0.05,'lowpass');if(Math.random()<0.6)tone(1400+Math.random()*600,700,0.08,0.05,'sine',1+Math.random()*2);}
      else if(k==='night'){for(let i=0;i<6;i++)tone(4200,4100,0.03,0.018,'square',i*0.09);}
      else if(k==='rain')noise(1.3,3200,0.5,0.055,'bandpass');
      else if(k==='thunder'){noise(2.6,90,0.6,0.9,'lowpass',0.25);noise(0.4,400,0.5,0.35,'lowpass',0.2);tone(60,30,1.8,0.3,'sine',0.3);}
      else noise(1.6,700,0.5,0.06,'bandpass');},
    fizz(x,y,z){noise(0.5,5000,0.8,0.25*att(x,y,z),'highpass');},
    explode(x,y,z){const a=att(x,y,z)*0.6+0.4;noise(1.2,160,0.5,1.2*a,'lowpass');tone(90,25,0.9,0.7*a,'sine');noise(0.3,1500,0.5,0.4*a,'bandpass');},
    fuse(){noise(0.9,6000,1.2,0.22,'highpass');tone(900,1400,0.9,0.04,'sawtooth');},
    bow(x,y,z){const a=att(x,y,z);tone(700,250,0.14,0.15*a,'triangle');noise(0.1,3000,1,0.1*a);},
    mob(t,x,y,z,hurt){const a=att(x,y,z)*(hurt?0.3:0.2);const p=hurt?1.3:1;
      if(t==='cow'){tone(140*p,95*p,0.6,a,'sawtooth');tone(210*p,150*p,0.5,a*0.5,'sawtooth');}
      else if(t==='wolf'){if(hurt){tone(900,500,0.25,a,'sawtooth');}else{tone(240,180,0.09,a*1.3,'sawtooth');tone(260,170,0.1,a*1.3,'sawtooth',0.16);}}
      else if(t==='sentinel'){noise(0.5,160,1.2,a*2,'lowpass');tone(70*p,48*p,0.5,a*1.5,'triangle');}
      else if(t==='settler'){tone(190*p,140*p,0.22,a,'sawtooth');tone(150*p,170*p,0.18,a*0.8,'sawtooth',0.25);}
      else if(t==='pig'){tone(260*p,180*p,0.13,a,'sawtooth');tone(230*p,170*p,0.15,a,'sawtooth',0.16);}
      else if(t==='sheep'){for(let i=0;i<5;i++)tone((420+(i%2)*45)*p,400*p,0.09,a,'sawtooth',i*0.08);}
      else if(t==='chicken'){tone(900*p,1300*p,0.07,a,'square');tone(1200*p,800*p,0.09,a,'square',0.09);}
      else if(t==='zombie'){tone(95*p,60*p,0.7,a*1.4,'sawtooth');noise(0.6,300,3,a,'bandpass');}
      else if(t==='skeleton'){for(let i=0;i<4;i++)tone(1500+Math.random()*900,1200,0.03,a,'square',i*0.07);}
      else if(t==='spider'){noise(0.35,5200,6,a*1.6,'bandpass');noise(0.2,3600,5,a,'bandpass',0.1);}
      else{noise(0.4,2500,2,a,'highpass');tone(300*p,220*p,0.25,a*0.6,'triangle');}}};})();

// ================= PHYSICS =================
function boxHits(x,y,z,hw,h){const x0=Math.floor(x-hw),x1=Math.floor(x+hw),y0=Math.floor(y),y1=Math.floor(y+h),z0=Math.floor(z-hw),z1=Math.floor(z+hw);
  for(let by=y0;by<=y1;by++)for(let bz=z0;bz<=z1;bz++)for(let bx=x0;bx<=x1;bx++){const b=getBlock(bx,by,bz);if(!SOLID[b])continue;if(SHAPE[b]===6){if(y<by+0.5||stUp(bx,by,bz,x,z,hw))return true;}else if(!BL[b].h||y<by+BL[b].h)return true;}return false;}
function stUp(bx,by,bz,x,z,hw){const m=getMeta(bx,by,bz)&3;return m===0?z+hw>bz+0.5:m===2?z-hw<bz+0.5:m===1?x+hw>bx+0.5:x-hw<bx+0.5;}
function layerTop(x,fy,z,hw){let mx=0;for(let bz=Math.floor(z-hw);bz<=Math.floor(z+hw);bz++)for(let bx=Math.floor(x-hw);bx<=Math.floor(x+hw);bx++){const b=getBlock(bx,fy,bz);if(SOLID[b]){const h=SHAPE[b]===6?(stUp(bx,fy,bz,x,z,hw)?1:0.5):(BL[b].h||1);if(h>mx)mx=h;}}return fy+(mx||1);}
function moveEnt(e,dx,dy,dz){e.hitWall=false;if(dy!==0)e.onGround=false;const hw=e.hw,h=e.h;const n=Math.ceil(Math.max(Math.abs(dx),Math.abs(dy),Math.abs(dz))/0.35)||1;dx/=n;dy/=n;dz/=n;
  for(let s=0;s<n;s++){
    if(dy){if(boxHits(e.x,e.y+dy,e.z,hw,h)){if(dy<0){e.y=layerTop(e.x,Math.floor(e.y+dy),e.z,hw);e.onGround=true;}else e.y=Math.floor(e.y+dy+h)-h-0.001;e.vy=0;dy=0;}else e.y+=dy;}
    if(dx){if(e.edge&&e.onGround&&!boxHits(e.x+dx,e.y-0.6,e.z,hw,0.5)){dx=0;e.vx=0;}else if(boxHits(e.x+dx,e.y,e.z,hw,h)){if(e.step&&e.onGround&&!boxHits(e.x+dx,e.y+0.5626,e.z,hw,h)){e.y+=0.5626;e.x+=dx;}else{e.x=dx>0?Math.floor(e.x+dx+hw)-hw-0.001:Math.floor(e.x+dx-hw)+1+hw+0.001;e.vx=0;e.hitWall=true;dx=0;}}else e.x+=dx;}
    if(dz){if(e.edge&&e.onGround&&!boxHits(e.x,e.y-0.6,e.z+dz,hw,0.5)){dz=0;e.vz=0;}else if(boxHits(e.x,e.y,e.z+dz,hw,h)){if(e.step&&e.onGround&&!boxHits(e.x,e.y+0.5626,e.z+dz,hw,h)){e.y+=0.5626;e.z+=dz;}else{e.z=dz>0?Math.floor(e.z+dz+hw)-hw-0.001:Math.floor(e.z+dz-hw)+1+hw+0.001;e.vz=0;e.hitWall=true;dz=0;}}else e.z+=dz;}}}
function raycast(ox,oy,oz,dx,dy,dz,max){let x=Math.floor(ox),y=Math.floor(oy),z=Math.floor(oz);const sx=dx>0?1:-1,sy=dy>0?1:-1,sz=dz>0?1:-1;
  const tdx=Math.abs(1/(dx||1e-9)),tdy=Math.abs(1/(dy||1e-9)),tdz=Math.abs(1/(dz||1e-9));
  let tx=(dx>0?x+1-ox:ox-x)*tdx,ty=(dy>0?y+1-oy:oy-y)*tdy,tz=(dz>0?z+1-oz:oz-z)*tdz;let nx=0,ny=0,nz=0,t=0;
  for(let i=0;i<64&&t<=max;i++){const id=getBlock(x,y,z);if(id&&SHAPE[id]!==3)return{x,y,z,id,nx,ny,nz,t};
    if(tx<ty&&tx<tz){t=tx;tx+=tdx;x+=sx;nx=-sx;ny=nz=0;}else if(ty<tz){t=ty;ty+=tdy;y+=sy;ny=-sy;nx=nz=0;}else{t=tz;tz+=tdz;z+=sz;nz=-sz;nx=ny=0;}}
  return null;}

// ================= ITEM MESHES / DROPS / PARTICLES =================
let atlasTex=null;const blockGeoCache={},iconTexCache={};let cubeMat=null;
function blockGeo(id){if(blockGeoCache[id])return blockGeoCache[id];const g=new THREE.BoxGeometry(1,1,1);const uv=g.attributes.uv,def=BL[id];const col=new Float32Array(72);
  const tf=[def.tex[2],def.tex[2],def.tex[0],def.tex[1],def.tex[3]!==undefined?def.tex[3]:def.tex[2],def.tex[2]],shd=[0.7,0.7,1,0.5,0.85,0.85];
  for(let f=0;f<6;f++)for(let v=0;v<4;v++){const k=f*4+v,t=TUV[tf[f]];uv.setXY(k,t[0]+uv.getX(k)*TU,t[1]+uv.getY(k)*TU);col[k*3]=col[k*3+1]=col[k*3+2]=shd[f];}
  g.setAttribute('color',new THREE.BufferAttribute(col,3));return blockGeoCache[id]=g;}
function iconTex(id){if(iconTexCache[id])return iconTexCache[id];const t=new THREE.CanvasTexture(iconCanvas(id));t.magFilter=t.minFilter=THREE.NearestFilter;return iconTexCache[id]=t;}
const planeGeo=new THREE.PlaneGeometry(1,1);
function itemMesh(id,overlay){const o=overlay?{depthTest:false,transparent:true}:{};
  if(id<256&&SHAPE[id]===1)return new THREE.Mesh(blockGeo(id),new THREE.MeshBasicMaterial(Object.assign({map:atlasTex,vertexColors:true,alphaTest:0.5},o)));
  return new THREE.Mesh(planeGeo,new THREE.MeshBasicMaterial(Object.assign({map:iconTex(id),alphaTest:0.5,side:THREE.DoubleSide},o)));}
const drops=[];
function spawnDrop(x,y,z,stack,vx,vy,vz,delay){if(!stack||!stack.id)return;const m=itemMesh(stack.id);const cube=stack.id<256&&SHAPE[stack.id]===1;m.scale.setScalar(cube?0.27:0.45);scene.add(m);
  drops.push({x,y,z,vx:vx!==undefined?vx:(Math.random()-0.5)*2,vy:vy!==undefined?vy:3.5,vz:vz!==undefined?vz:(Math.random()-0.5)*2,hw:0.125,h:0.25,stack,age:-(delay||0),mesh:m,cube,ph:Math.random()*6});}
function updateDrops(dt){for(let i=drops.length-1;i>=0;i--){const d=drops[i];d.age+=dt;
    if(isLoaded(Math.floor(d.x),Math.floor(d.z))){const b=getBlock(Math.floor(d.x),Math.floor(d.y+0.1),Math.floor(d.z));if(b===B.WATER){d.vy+=(1.5-d.vy)*Math.min(1,dt*4);}else d.vy-=22*dt;if(b===B.LAVA)d.age=999;
      if(!P.dead&&d.age>0.6){const dx=P.x-d.x,dy=P.y+0.8-d.y,dz=P.z-d.z,dd=Math.hypot(dx,dy,dz);if(dd<1.3){if(addItem(d.stack)){sfx.pop();d.age=1000;}}else if(dd<2.6&&canFit(d.stack)){d.vx+=dx/dd*30*dt;d.vy+=dy/dd*30*dt;d.vz+=dz/dd*30*dt;}}
      moveEnt(d,d.vx*dt,d.vy*dt,d.vz*dt);if(d.onGround){d.vx*=0.6;d.vz*=0.6;}}
    if(d.age>300||d.y<-10){scene.remove(d.mesh);d.mesh.material.dispose();drops.splice(i,1);continue;}
    d.mesh.position.set(d.x,d.y+0.22+Math.sin(d.age*2.5+d.ph)*0.07,d.z);d.mesh.rotation.y=d.age*1.6+d.ph;const br=entLight(d.x,d.y,d.z);d.mesh.material.color.setScalar(br);}}
function entLight(x,y,z){if(W.dim)return 0.65;return skyExposed(x,y,z)?0.25+0.75*G.dayF:0.4;}
const PN=500,pPos=new Float32Array(PN*3),pCol=new Float32Array(PN*3),pVel=new Float32Array(PN*3),pLife=new Float32Array(PN),pGrav=new Float32Array(PN);let pNext=0,pPoints=null;
function initParticles(){const g=new THREE.BufferGeometry();pPos.fill(-999);g.setAttribute('position',new THREE.BufferAttribute(pPos,3));g.setAttribute('color',new THREE.BufferAttribute(pCol,3));
  pPoints=new THREE.Points(g,new THREE.PointsMaterial({size:0.13,vertexColors:true,sizeAttenuation:true}));pPoints.frustumCulled=false;scene.add(pPoints);}
function puff(x,y,z,col,n,spread,speed,grav,life){const br=typeof col==='number'?[((col>>16)&255)/255,((col>>8)&255)/255,(col&255)/255]:col;
  for(let i=0;i<n;i++){const k=pNext;pNext=(pNext+1)%PN;pPos[k*3]=x+(Math.random()-0.5)*spread;pPos[k*3+1]=y+(Math.random()-0.5)*spread;pPos[k*3+2]=z+(Math.random()-0.5)*spread;
    const f=0.7+Math.random()*0.5;pCol[k*3]=br[0]*f;pCol[k*3+1]=br[1]*f;pCol[k*3+2]=br[2]*f;pVel[k*3]=(Math.random()-0.5)*speed;pVel[k*3+1]=Math.random()*speed;pVel[k*3+2]=(Math.random()-0.5)*speed;pLife[k]=(life||0.7)*(0.6+Math.random()*0.8);pGrav[k]=grav===undefined?14:grav;}}
function blockPuff(x,y,z,id,n){const c=tileAvg[BL[id].tex[2]]||[0.5,0.5,0.5];const l=entLight(x+0.5,y+1,z+0.5);puff(x+0.5,y+0.5,z+0.5,[c[0]*l,c[1]*l,c[2]*l],n||18,0.8,3);}
function updateParticles(dt){for(let k=0;k<PN;k++){if(pLife[k]<=0)continue;pLife[k]-=dt;if(pLife[k]<=0){pPos[k*3+1]=-999;continue;}pVel[k*3+1]-=pGrav[k]*dt;
    const nx=pPos[k*3]+pVel[k*3]*dt,ny=pPos[k*3+1]+pVel[k*3+1]*dt,nz=pPos[k*3+2]+pVel[k*3+2]*dt;if(SOLID[getBlock(Math.floor(nx),Math.floor(ny),Math.floor(nz))]){pVel[k*3]=pVel[k*3+2]=0;pVel[k*3+1]=0;continue;}pPos[k*3]=nx;pPos[k*3+1]=ny;pPos[k*3+2]=nz;}
  pPoints.geometry.attributes.position.needsUpdate=true;pPoints.geometry.attributes.color.needsUpdate=true;}

// ================= MOB MODELS =================
const mobTexCache={};
function mobTex(pal,face,key){const k=pal.join()+(key||'');if(mobTexCache[k])return mobTexCache[k];const c=document.createElement('canvas');c.width=c.height=8;const x=c.getContext('2d');const r=rng32(hashStr(k));
  for(let i=0;i<64;i++){const col=pal[(r()*pal.length)|0];x.fillStyle='#'+col.toString(16).padStart(6,'0');x.fillRect(i%8,(i/8)|0,1,1);}
  if(face)face((col,px,py,w,h)=>{x.fillStyle='#'+col.toString(16).padStart(6,'0');x.fillRect(px,py,w||1,h||1);});
  const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;return mobTexCache[k]=t;}
function mkM(M,pal,face,key){const m=new THREE.MeshBasicMaterial({map:mobTex(pal,face,key)});M.mats.push(m);return m;}
function part(M,w,h,d,pal,x,y,z,face,key,parent){const mat=mkM(M,pal);let mats=mat;if(face){const fm=mkM(M,pal,face,key);mats=[mat,mat,mat,mat,fm,mat];}const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mats);me.position.set(x,y,z);(parent||M.g).add(me);return me;}
function limb(M,w,h,d,pal,x,y,z){const g=new THREE.Group();g.position.set(x,y,z);const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mkM(M,pal));me.position.y=-h/2;g.add(me);M.g.add(g);return g;}
function buildModel(type){const M={g:new THREE.Group(),mats:[],legs:[],arms:[],head:null};const L=(...a)=>{const l=limb(M,...a);M.legs.push(l);return l;};
  if(type==='cow'){const p=[0x4a3526,0x54402e,0x4a3526,0xe8e4dc];part(M,0.75,0.65,1.25,p,0,0.98,0);M.head=part(M,0.5,0.5,0.4,p,0,1.2,0.78,f=>{f(0x4a3526,0,0,8,8);f(0xffffff,1,2,2,2);f(0xffffff,5,2,2,2);f(0x111111,1,3);f(0x111111,6,3);f(0xd8b0a0,2,5,4,3);f(0x5a3a3a,3,6);f(0x5a3a3a,5,6);f(0xe8e4dc,3,0,2,2);},'cow');
    part(M,0.1,0.12,0.1,[0xd8d8c8],-0.3,1.48,0.72);part(M,0.1,0.12,0.1,[0xd8d8c8],0.3,1.48,0.72);for(const sx of[-1,1])for(const sz of[-1,1])L(0.24,0.66,0.24,p,sx*0.24,0.66,sz*0.45);}
  else if(type==='pig'){const p=[0xe8a0a0,0xeaa8a6,0xe09494];part(M,0.7,0.55,1.05,p,0,0.65,0);M.head=part(M,0.52,0.5,0.45,p,0,0.8,0.7,f=>{f(0x111111,1,2);f(0xffffff,2,2);f(0x111111,6,2);f(0xffffff,5,2);f(0xf4b8b8,2,4,4,3);f(0x9a5a5a,3,5);f(0x9a5a5a,5,5);},'pig');
    for(const sx of[-1,1])for(const sz of[-1,1])L(0.22,0.4,0.22,p,sx*0.22,0.4,sz*0.36);}
  else if(type==='sheep'){const p=[0xf0f0ec,0xe4e4de,0xfafaf6],sk=[0xd8bca0,0xcfb294];part(M,0.85,0.75,1.15,p,0,0.98,0);M.head=part(M,0.42,0.42,0.45,sk,0,1.25,0.72,f=>{f(0xf0f0ec,0,0,8,2);f(0x111111,1,3);f(0xffffff,2,3);f(0x111111,6,3);f(0xffffff,5,3);f(0xe8a0a0,3,6,2,1);},'sheep');
    for(const sx of[-1,1])for(const sz of[-1,1])L(0.2,0.62,0.2,sk,sx*0.24,0.62,sz*0.4);}
  else if(type==='chicken'){const p=[0xf8f8f8,0xeeeeee];part(M,0.4,0.38,0.5,p,0,0.5,0);M.head=part(M,0.25,0.36,0.22,p,0,0.86,0.3,f=>{f(0x111111,1,2);f(0x111111,6,2);},'chk');part(M,0.24,0.1,0.14,[0xe8b020],0,0.84,0.46);part(M,0.1,0.12,0.08,[0xd82a2a],0,0.74,0.44);
    L(0.08,0.32,0.08,[0xe8b020],-0.1,0.32,0);L(0.08,0.32,0.08,[0xe8b020],0.1,0.32,0);}
  else if(type==='sentinel'){const st=[0x8a8a84,0x7c7c76,0x96968e,0x5a7a48],dk=[0x6a6a64,0x5e5e58];L(0.4,1.0,0.4,dk,-0.25,1.0,0);L(0.4,1.0,0.4,dk,0.25,1.0,0);part(M,1.1,1.0,0.6,st,0,1.5,0,f=>{f(0x5a7a48,1,1,2,3);f(0x5a7a48,5,5,2,2);f(0x4a4a46,3,3,2,2);},'sent');
    const a1=limb(M,0.34,1.3,0.34,st,-0.74,1.95,0),a2=limb(M,0.34,1.3,0.34,st,0.74,1.95,0);M.arms=[a1,a2];M.head=part(M,0.6,0.6,0.6,st,0,2.3,0,f=>{f(0x2a2a28,1,2,6,1);f(0x4ad8ff,1,3,2,1);f(0x4ad8ff,5,3,2,1);f(0x4a4a46,2,6,4,1);},'senth');}
  else if(type==='warden'){const p=[0x2e2a2a,0x383232,0x262222,0xff7a1a],hot=[0xff8a1a,0xffb030,0xe85a10],bn=[0x4a4040,0x3e3636];L(0.5,1.2,0.5,bn,-0.35,1.2,0);L(0.5,1.2,0.5,bn,0.35,1.2,0);part(M,1.4,1.3,0.8,p,0,1.85,0,f=>{f(0xff7a1a,2,2,4,1);f(0xffd84a,3,3,2,3);f(0xff7a1a,1,5);f(0xff7a1a,6,5);},'wardb');
    const a1=limb(M,0.42,1.5,0.42,p,-0.93,2.4,0),a2=limb(M,0.42,1.5,0.42,p,0.93,2.4,0);M.arms=[a1,a2];M.head=part(M,0.8,0.7,0.8,p,0,2.86,0,f=>{f(0xffd84a,1,2,2,2);f(0xffd84a,5,2,2,2);f(0xfff4c0,2,3);f(0xfff4c0,5,3);f(0xe84a10,2,6,4,1);},'wardh');part(M,0.2,0.4,0.2,hot,-0.3,3.4,0);part(M,0.2,0.4,0.2,hot,0.3,3.4,0);part(M,0.5,0.14,0.5,hot,0,3.24,0);}
  else if(type==='wolf'){const p=[0xc8c8c4,0xb8b8b4,0xd8d8d4,0xa8a8a2];part(M,0.42,0.42,0.85,p,0,0.62,-0.05);part(M,0.5,0.48,0.3,p,0,0.66,0.3);M.head=part(M,0.4,0.4,0.36,p,0,0.74,0.6,f=>{f(0x111111,1,3);f(0x111111,6,3);f(0xe8dcc8,2,5,4,3);f(0x222222,3,5,2,1);},'wolf');part(M,0.2,0.16,0.2,[0xe8dcc8],0,0.66,0.84);
    part(M,0.1,0.14,0.06,p,-0.13,1.0,0.6);part(M,0.1,0.14,0.06,p,0.13,1.0,0.6);const t=limb(M,0.12,0.45,0.12,p,0,0.75,-0.48);t.rotation.x=-1;M.tail=t;M.legs=[];for(const sx of[-1,1])for(const sz of[-1,1])M.legs.push(limb(M,0.13,0.42,0.13,p,sx*0.14,0.42,sz*0.3));M.collar=part(M,0.44,0.1,0.38,[0xc82a2a],0,0.72,0.42);M.collar.visible=false;}
  else if(type==='fish'){const p=[0x4a8ac8,0x3a78b8,0x5a9ad8,0xd8e8f0];M.head=part(M,0.18,0.22,0.5,p,0,0.2,0,f=>{f(0x111111,2,3);f(0x111111,5,3);},'fish');const t=limb(M,0.04,0.26,0.2,[0x3a78b8,0x2a5a98],0,0.33,-0.34);M.legs=[t];M.fish=true;}
  else if(type==='wisp'){const hot=[0xff8a1a,0xffb030,0xffd84a,0xff7a10];M.head=part(M,0.7,0.7,0.7,hot,0,0.75,0,f=>{f(0x2a1008,1,2,2,2);f(0x2a1008,5,2,2,2);f(0xfff4c0,2,2);f(0xfff4c0,5,2);f(0x5a1e08,2,5,4,1);f(0x5a1e08,1,4);f(0x5a1e08,6,4);},'wisp');part(M,0.4,0.12,0.4,[0xfff4c0,0xffd84a],0,1.16,0);
    for(const sx of[-1,1])for(const sz of[-1,1])L(0.1,0.42,0.1,[0xc8401a,0xe85a10],sx*0.2,0.4,sz*0.2);}
  else if(type==='settler'){const rb=[0x6a4a2e,0x5e4026,0x74522f],sk=[0xd8a878,0xcf9e6e];L(0.25,0.75,0.25,rb,-0.13,0.75,0);L(0.25,0.75,0.25,rb,0.13,0.75,0);part(M,0.52,0.8,0.3,rb,0,1.12,0,f=>{f(0x3a2a18,0,5,8,1);f(0xd8b030,3,5,2,1);},'robe');
    const a1=limb(M,0.22,0.7,0.22,rb,-0.37,1.5,0),a2=limb(M,0.22,0.7,0.22,rb,0.37,1.5,0);M.arms=[a1,a2];a1.rotation.x=a2.rotation.x=-0.7;
    M.head=part(M,0.5,0.56,0.5,sk,0,1.8,0,f=>{f(0x3a2a18,1,2,6,1);f(0xffffff,1,3,2,1);f(0xffffff,5,3,2,1);f(0x2a6a3a,2,3);f(0x2a6a3a,5,3);f(0xb88858,3,4,2,3);f(0x8a5a3a,2,7,4,1);},'settler');part(M,0.56,0.14,0.56,[0xb89a4a,0xa88a3e],0,2.12,0);part(M,0.8,0.05,0.8,[0xb89a4a,0xa88a3e],0,2.05,0);}
  else if(type==='zombie'||type==='skeleton'||type==='player'){const z=type==='zombie',s=type==='skeleton';const sk=z?[0x6f9a5a,0x64904f,0x7aa665]:s?[0xd4d4c8,0xc4c4b8,0xdedfd4]:[0xe0ac7e,0xd8a274],sh_=z?[0x6a4a8a,0x5e407c]:s?sk:[0xd9862b,0xcc7a22,0xe39338],pn=z?[0x3a3a4e,0x333346]:s?sk:[0x2c3a5a,0x263350];const lw=s?0.13:0.25;
    L(lw,0.75,lw,pn,-0.13,0.75,0);L(lw,0.75,lw,pn,0.13,0.75,0);part(M,s?0.4:0.5,0.75,s?0.16:0.25,sh_,0,1.125,0,s?f=>{f(0x55554c,0,1,8,1);f(0x55554c,0,3,8,1);f(0x55554c,0,5,8,1);f(0x55554c,3,0,2,8);}:null,'rib');
    const a1=limb(M,lw,0.75,lw,type==='player'?sh_:sk,-(s?0.29:0.375),1.5,0),a2=limb(M,lw,0.75,lw,type==='player'?sh_:sk,s?0.29:0.375,1.5,0);M.arms=[a1,a2];if(type!=='player'){a1.rotation.x=a2.rotation.x=-Math.PI/2;}
    M.head=part(M,0.5,0.5,0.5,sk,0,1.75,0,z?f=>{f(0x1a2a1a,1,3,2,1);f(0x1a2a1a,5,3,2,1);f(0x3e5a34,3,5,2,1);f(0x4e7040,0,0,8,1);}:s?f=>{f(0x2a2a2a,1,3,2,2);f(0x2a2a2a,5,3,2,2);f(0x55554c,3,5,2,1);f(0x55554c,1,6,6,1);}:f=>{f(0x26262e,0,0,8,2);f(0x26262e,0,2,1,2);f(0x26262e,7,2,1,2);f(0xffffff,1,4,2,1);f(0xffffff,5,4,2,1);f(0x4a2a7a,2,4);f(0x4a2a7a,5,4);f(0xd9862b,0,2,8,1);f(0xa8523a,3,6,2,1);f(0xa8523a,2,5);f(0xa8523a,5,5);},type);
    if(type==='player')part(M,0.52,0.2,0.52,[0x26262e,0x1e1e26],0,1.92,0);
    if(s){const bow=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.7,0.08),mkM(M,[0x7a5a30]));bow.position.set(0,-0.7,0);bow.rotation.x=Math.PI/2;a2.add(bow);}}
  else if(type==='spider'){const p=[0x2a2422,0x332b28,0x241e1c];part(M,0.9,0.6,0.95,p,0,0.55,-0.5);M.head=part(M,0.6,0.5,0.55,p,0,0.52,0.3,f=>{f(0xd82020,1,2,2,2);f(0xd82020,5,2,2,2);f(0xd82020,3,1);f(0xd82020,4,1);f(0xd82020,0,5);f(0xd82020,7,5);},'spd');
    for(const sx of[-1,1])for(let i=0;i<4;i++){const g=new THREE.Group();g.position.set(sx*0.25,0.5,0.25-i*0.18);const me=new THREE.Mesh(new THREE.BoxGeometry(1.0,0.1,0.1),mkM(M,p));me.position.x=sx*0.5;g.add(me);g.rotation.z=-sx*0.55;g.rotation.y=sx*(0.6-i*0.4);g.userData.by=g.rotation.y;M.g.add(g);M.legs.push(g);}M.spider=true;}
  else{const p=[0x2e2a2a,0x383232,0x262222,0x2e2a2a,0xff7a1a],hot=[0xff8a1a,0xffb030,0xe85a10];M.body=part(M,0.62,0.8,0.62,p,0,0.75,0,f=>{f(0xffd84a,1,1,2,2);f(0xffd84a,5,1,2,2);f(0xfff4c0,2,2);f(0xfff4c0,5,2);f(0xff7a1a,2,5,4,1);f(0xff7a1a,1,4);f(0xff7a1a,6,4);f(0xe84a10,3,6,2,1);},'emb');M.head=M.body;
    part(M,0.4,0.14,0.4,hot,0,1.22,0);part(M,0.1,0.22,0.1,[0x4a4040],0,1.38,0);part(M,0.14,0.1,0.14,[0xffd84a,0xfff4c0],0,1.52,0);L(0.2,0.36,0.24,p,-0.17,0.36,0);L(0.2,0.36,0.24,p,0.17,0.36,0);}
  return M;}

// ================= MOBS =================
const MOBS={warden:{hp:150,hw:0.7,h:3.4,sp:2.6,hostile:1,dmg:7,boss:1,drops:[[260,3,5],[274,6,10],[259,2,4]]},wolf:{hp:12,hw:0.3,h:0.85,sp:1.4,drops:[]},sentinel:{hp:60,hw:0.55,h:2.6,sp:1.2,drops:[[258,2,4],[24,0,1]]},fish:{hp:3,hw:0.2,h:0.35,sp:1.4,water:1,drops:[[285,1,1]]},wisp:{hp:10,hw:0.4,h:1.2,sp:1.8,hostile:1,ranged:1,fly:1,dmg:3,drops:[[274,1,3]]},settler:{hp:20,hw:0.3,h:1.95,sp:0.9,drops:[]},cow:{hp:10,hw:0.45,h:1.4,sp:1.1,drops:[[261,1,3],[275,0,2]]},pig:{hp:10,hw:0.42,h:0.95,sp:1.1,drops:[[263,1,3]]},sheep:{hp:8,hw:0.42,h:1.3,sp:1.1,drops:[[267,1,2],[36,1,1]]},chicken:{hp:4,hw:0.22,h:0.75,sp:1,drops:[[265,1,1],[273,0,2]]},
  zombie:{hp:20,hw:0.3,h:1.95,sp:2.4,hostile:1,dmg:3,burns:1,drops:[[270,0,2]]},skeleton:{hp:20,hw:0.3,h:1.95,sp:2.3,hostile:1,dmg:2,burns:1,ranged:1,drops:[[271,0,2],[279,0,2]]},
  spider:{hp:16,hw:0.6,h:0.9,sp:3.3,hostile:1,dmg:2,drops:[[272,0,2]]},ember:{hp:20,hw:0.32,h:1.5,sp:2.3,hostile:1,explodes:1,drops:[[274,1,2]]}};
const MOBNAME={warden:'the Ember Warden',wisp:'a Cinder Wisp',zombie:'a Zombie',skeleton:'a Skeleton',spider:'a Spider',ember:'an Emberling'};
const mobs=[],arrows=[];
function spawnMob(type,x,y,z){const d=MOBS[type];const M=buildModel(type);scene.add(M.g);const m={type,d,x,y,z,vx:0,vy:0,vz:0,hw:d.hw,h:d.h,hp:d.hp,yaw:Math.random()*6.28,M,walk:0,aiT:0,moving:false,hurtT:0,atkT:0,panic:0,fuse:0,sndT:3+Math.random()*8,lt:0,br:1,dead:false,deadT:0,onGround:false};mobs.push(m);return m;}
function removeMob(m){scene.remove(m.M.g);m.M.g.traverse(o=>{if(o.geometry)o.geometry.dispose();});m.M.mats.forEach(x=>x.dispose());const i=mobs.indexOf(m);if(i>=0)mobs.splice(i,1);}
const orbs=[];const orbGeo=new THREE.BoxGeometry(0.17,0.17,0.17);
function spawnXP(x,y,z,n){for(let i=0;i<n;i++){const m=new THREE.Mesh(orbGeo,new THREE.MeshBasicMaterial({color:0x9aff3a}));scene.add(m);orbs.push({x:x+(Math.random()-0.5)*0.6,y:y+0.3,z:z+(Math.random()-0.5)*0.6,vx:(Math.random()-0.5)*2.5,vy:3+Math.random()*2,vz:(Math.random()-0.5)*2.5,hw:0.08,h:0.16,age:Math.random()*0.3,mesh:m});}}
function xpLevel(xp){let l=0,need=8;while(xp>=need){xp-=need;l++;need=8+l*3;}return{l,f:xp/need};}
function updateOrbs(dt){for(let i=orbs.length-1;i>=0;i--){const o=orbs[i];o.age+=dt;const dx=P.x-o.x,dy=P.y+0.9-o.y,dz=P.z-o.z,dd=Math.hypot(dx,dy,dz)||1;
    if(!P.dead&&dd<7&&o.age>0.5){const a=26*dt;o.vx+=dx/dd*a;o.vy+=dy/dd*a+6*dt;o.vz+=dz/dd*a;o.vx*=0.97;o.vz*=0.97;}o.vy-=14*dt;
    moveEnt(o,o.vx*dt,o.vy*dt,o.vz*dt);if(o.onGround){o.vx*=0.8;o.vz*=0.8;}
    if((dd<1&&o.age>0.5&&!P.dead)||o.age>180||o.y<-10){if(dd<1){P.xp=(P.xp||0)+1;sfx.xp();}scene.remove(o.mesh);o.mesh.material.dispose();orbs.splice(i,1);continue;}
    o.mesh.position.set(o.x,o.y+0.12+Math.sin(o.age*5)*0.04,o.z);o.mesh.rotation.y=o.age*3;const p=0.75+Math.sin(o.age*9)*0.25;o.mesh.material.color.setRGB(0.55*p,1,0.2*p);}}
function clearEntities(){for(const o of orbs)scene.remove(o.mesh);orbs.length=0;while(mobs.length)removeMob(mobs[0]);for(const d of drops){scene.remove(d.mesh);}drops.length=0;for(const a of arrows)scene.remove(a.mesh);arrows.length=0;}
function hurtMob(m,dmg,kx,kz){if(m.dead)return;m.hp-=dmg;m.hurtT=0.35;m.vx+=kx*7;m.vz+=kz*7;m.vy=5.5;m.panic=5;sfx.mob(m.type,m.x,m.y,m.z,true);
  if(m.hp<=0){m.dead=true;m.deadT=0;}}
function explode(x,y,z,r){sfx.explode(x,y,z);puff(x,y,z,0xdddddd,60,r,9,2,1.2);puff(x,y,z,0xff9a2a,40,r*0.8,7,4,0.7);
  for(let dy=-r;dy<=r;dy++)for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){const d=Math.sqrt(dx*dx+dy*dy+dz*dz);if(d>r+Math.random()*0.8-0.4)continue;const bx=Math.floor(x)+dx,by=Math.floor(y)+dy,bz=Math.floor(z)+dz;const id=getBlock(bx,by,bz);
    if(!id||id===B.BEDROCK||id===B.OBSIDIAN||SHAPE[id]===3)continue;if(id===B.CHARGE){ignite(bx,by,bz,0.3+Math.random()*0.6);continue;}const def=BL[id];setBlock(bx,by,bz,0);if(W.tiles[bx+','+by+','+bz])delete W.tiles[bx+','+by+','+bz];if(def.drop&&Math.random()<0.3)spawnDrop(bx+0.5,by+0.5,bz+0.5,{id:def.drop,n:1});}
  const pd=Math.hypot(P.x-x,P.y+0.9-y,P.z-z);if(pd<r*2.2){const k=1-pd/(r*2.2);damagePlayer(Math.ceil(k*22),'was blown up by an Emberling');P.vx+=(P.x-x)/pd*12*k;P.vz+=(P.z-z)/pd*12*k;P.vy+=6*k;}
  for(const m of mobs.slice()){const d=Math.hypot(m.x-x,m.y-y,m.z-z);if(d<r*2&&d>0.1)hurtMob(m,Math.ceil((1-d/(r*2))*20),(m.x-x)/d,(m.z-z)/d);}
  G.shake=0.5;}
function updateMobs(dt){G.bossM=null;for(let i=mobs.length-1;i>=0;i--){const m=mobs[i],d=m.d,g=m.M.g;
    const dx=P.x-m.x,dz=P.z-m.z,dy=P.y-m.y,dist=Math.hypot(dx,dz);
    if(dist>96||m.y<-20||!isLoaded(Math.floor(m.x),Math.floor(m.z))){if(m.tame&&m.y>-20){m.x=P.x+1;m.y=P.y+0.3;m.z=P.z+1;continue;}if(dist>70||m.y<-20)removeMob(m);continue;}
    if(m.dead){m.deadT+=dt;g.rotation.z=Math.min(1,m.deadT*3)*Math.PI/2;m.vy-=28*dt;moveEnt(m,0,m.vy*dt,0);g.position.set(m.x,m.y,m.z);
      if(m.deadT>0.7){puff(m.x,m.y+0.5,m.z,0xdddddd,14,0.8,2,-1,0.8);for(const dr of d.drops){const n=dr[1]+((Math.random()*(dr[2]-dr[1]+1))|0);if(n>0)spawnDrop(m.x,m.y+0.4,m.z,{id:dr[0],n});}if(m.byP){spawnXP(m.x,m.y+0.4,m.z,d.boss?40:d.hostile?5:m.type==='settler'?0:2);if(d.hostile&&typeof adv==='function')adv(d.boss?'warden':'hunter');}removeMob(m);}continue;}
    if(m.shorn>0){m.shorn-=dt;if(m.shorn<=0)m.M.g.children[0].scale.set(1,1,1);}if(m.fedT>0)m.fedT-=dt;if(m.baby>0){m.baby-=dt;if(m.baby<=0)g.scale.setScalar(1);else if(m.baby<30)g.scale.setScalar(1-m.baby/60);}
    m.aiT-=dt;m.atkT-=dt;m.hurtT-=dt;m.panic-=dt;m.sndT-=dt;
    if(m.sndT<0){m.sndT=5+Math.random()*10;if(dist<24)sfx.mob(m.type,m.x,m.y,m.z);}
    let sp=d.sp;const chase=d.hostile&&G.mode===0&&!P.dead&&dist<18&&Math.abs(dy)<10;
    if(chase){m.yaw=Math.atan2(dx,dz);m.moving=true;
      if(d.ranged){if(dist<7)m.moving=false;if(dist<14&&m.atkT<0){m.atkT=2.2;const ax=m.x,ay=m.y+1.5,az=m.z;const T=dist/22;const a={x:ax,y:ay,z:az,vx:dx/dist*22,vy:(P.y+1.2-ay)/Math.max(T,0.1)+0.5*20*T,vz:dz/dist*22,life:6,stuck:false};a.mesh=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.06,0.7),new THREE.MeshBasicMaterial({color:0xc8b890}));scene.add(a.mesh);arrows.push(a);sfx.bow(m.x,m.y,m.z);a.by=m.type;if(d.fly){a.mesh.material.color.setHex(0xff7a1a);a.mesh.scale.set(4,4,0.6);}}}
      else if(d.explodes){if(dist<3&&Math.abs(dy)<3){if(m.fuse===0)sfx.fuse();m.fuse+=dt;m.moving=false;if(m.fuse>1.5){explode(m.x,m.y+0.6,m.z,3);removeMob(m);continue;}}else if(m.fuse>0){m.fuse=Math.max(0,m.fuse-dt*(dist>5?2:0.3));if(dist<5)m.moving=dist>2;}}
      else{if(m.type==='spider'&&dist<5&&dist>2&&m.onGround&&m.atkT<0.3){m.vy=6.5;m.vx=dx/dist*6;m.vz=dz/dist*6;}
        if(dist<m.hw+0.75&&dy<m.h&&dy>-1.9&&m.atkT<0){m.atkT=1;damagePlayer(d.dmg,'was slain by '+MOBNAME[m.type]);P.vx+=dx/(dist||1)*6;P.vz+=dz/(dist||1)*6;P.vy=Math.max(P.vy,4);}}}
    else if(!d.hostile&&m.type!=='settler'&&m.panic<=0&&dist<9&&P.inv[P.sel]&&(P.inv[P.sel].id===269||P.inv[P.sel].id===282||P.inv[P.sel].id===281)&&!P.dead){m.yaw=Math.atan2(dx,dz);m.moving=dist>2;}
    else if(m.aiT<0){m.aiT=2+Math.random()*5;m.moving=Math.random()<0.6||m.panic>0;m.yaw=Math.random()*6.28;}
    if(d.boss){G.bossM=m;m.bT=(m.bT||3)-dt;if(chase&&m.bT<=0){m.bT=4.5;if(dist<5.5){m.vy=9;m.slam=true;}else if(dist<16){for(let k=-1;k<=1;k++){const an=Math.atan2(dx,dz)+k*0.22;const a={x:m.x,y:m.y+2.4,z:m.z,vx:Math.sin(an)*17,vy:(P.y+1-m.y-2.4)/Math.max(dist/17,0.2)+10*dist/17,vz:Math.cos(an)*17,life:5,stuck:false,by:'wisp'};a.mesh=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.3,0.4),new THREE.MeshBasicMaterial({color:0xff7a1a}));scene.add(a.mesh);arrows.push(a);}sfx.bow(m.x,m.y,m.z);}}
      if(m.slam&&m.onGround&&m.vy<=0){m.slam=false;sfx.explode(m.x,m.y,m.z);puff(m.x,m.y+0.3,m.z,0xff8a1a,40,4,6,6,0.8);G.shake=0.4;if(dist<5&&!P.dead){damagePlayer(6,'was crushed by the Ember Warden');P.vy=8;}}
      m.M.arms[0].rotation.x=Math.sin(m.walk)*0.5;m.M.arms[1].rotation.x=-Math.sin(m.walk)*0.5;}
    if(m.type==='wolf'&&m.tame){m.panic=0;m.fT=(m.fT||0)-dt;if(m.fT<=0){m.fT=0.5;m.tg=null;let bd=12;for(const o of mobs)if(o.d.hostile&&!o.dead&&!o.d.fly&&!o.d.explodes){const dd=Math.hypot(o.x-m.x,o.z-m.z);if(dd<bd&&Math.abs(o.y-m.y)<4){bd=dd;m.tg=o;}}}
      const t=m.tg;if(t&&!t.dead&&mobs.includes(t)){const ax=t.x-m.x,az=t.z-m.z,td=Math.hypot(ax,az)||1;m.yaw=Math.atan2(ax,az);m.moving=td>1;sp=4.2;m.aiT=1;if(td<1.5&&m.atkT<0){m.atkT=0.8;t.byP=true;hurtMob(t,4,ax/td*0.6,az/td*0.6);if(m.onGround)m.vy=4;}}
      else if(dist>30&&isLoaded(Math.floor(P.x),Math.floor(P.z))&&P.onGround){m.x=P.x+1;m.y=P.y+0.2;m.z=P.z+1;}else if(dist>3.5){m.yaw=Math.atan2(dx,dz);m.moving=true;sp=dist>8?5:3;m.aiT=1;}else{m.moving=false;m.aiT=0.5;}
      if(m.hp<12)m.hp+=dt*0.3;m.M.tail.rotation.x=-1.6+Math.sin(m.walk*2+performance.now()/150)*0.25;}
    if(m.type==='sentinel'){m.fT=(m.fT||0)-dt;if(m.fT<=0){m.fT=0.5;m.tg=null;let bd=15;for(const o of mobs)if(o.d.hostile&&!o.dead&&!o.d.fly){const dd=Math.hypot(o.x-m.x,o.z-m.z);if(dd<bd&&Math.abs(o.y-m.y)<5){bd=dd;m.tg=o;}}}
      const t=m.tg;if(t&&!t.dead&&mobs.includes(t)){const tx_=t.x-m.x,tz_=t.z-m.z,td=Math.hypot(tx_,tz_)||1;m.yaw=Math.atan2(tx_,tz_);m.moving=td>1.5;sp=3.4;m.aiT=1;if(td<2&&m.atkT<0){m.atkT=1.1;m.swingT=0.4;hurtMob(t,9,tx_/td*1.4,tz_/td*1.4);t.vy=8;}}
      if(m.swingT>0){m.swingT-=dt;m.M.arms[0].rotation.x=m.M.arms[1].rotation.x=-2.4*Math.sin(m.swingT/0.4*Math.PI);}else{m.M.arms[0].rotation.x=Math.sin(m.walk)*0.3;m.M.arms[1].rotation.x=-Math.sin(m.walk)*0.3;}m.panic=0;}
    if(m.type==='settler'){m.fT=(m.fT||0)-dt;if(m.fT<=0){m.fT=0.6;for(const o of mobs)if(o.d.hostile&&!o.dead&&Math.hypot(o.x-m.x,o.z-m.z)<9){m.panic=3;m.yaw=Math.atan2(m.x-o.x,m.z-o.z);break;}}}
    if(d.ranged&&!d.fly&&chase&&dist<7){m.moving=true;m.yaw+=1.45*(m.x*7%2<1?1:-1);sp=1.3;}
    if(m.panic>0&&!d.hostile){sp=3.2;m.moving=true;}
    const inW=getBlock(Math.floor(m.x),Math.floor(m.y+0.3),Math.floor(m.z))===B.WATER,inL=getBlock(Math.floor(m.x),Math.floor(m.y+0.3),Math.floor(m.z))===B.LAVA;
    const tx=m.moving?Math.sin(m.yaw)*sp:0,tz=m.moving?Math.cos(m.yaw)*sp:0;const k=Math.min(1,dt*(m.onGround?10:2));m.vx+=(tx-m.vx)*k;m.vz+=(tz-m.vz)*k;
    if(d.fly){m.vy+=(clamp(P.y+2.5+Math.sin(m.walk*0.4+m.x)-m.y,-2,2)-m.vy)*Math.min(1,dt*3);m.onGround=true;}else if(d.water){if(inW){const up=getBlock(Math.floor(m.x),Math.floor(m.y+1.1),Math.floor(m.z))===B.WATER;m.vy+=((up?Math.sin(m.walk*0.6+m.x)*0.8:-0.9)-m.vy)*Math.min(1,dt*4);m.onGround=true;}else{m.vy-=28*dt;if(m.onGround&&Math.random()<dt*3)m.vy=4;}}else if(inW){m.vy+=(2-m.vy)*Math.min(1,dt*5);}else m.vy-=28*dt;if(inL){m.hp-=dt*8;m.hurtT=0.2;if(m.hp<=0)m.dead=true;}
    if(m.type==='chicken'&&m.vy<-2)m.vy=-2;
    const py=m.y;m.edge=!chase&&m.panic<=0&&!d.hostile&&false;moveEnt(m,m.vx*dt,m.vy*dt,m.vz*dt);
    if(m.type==='spider'&&m.hitWall&&chase){m.vy=3.4;}else if(m.hitWall&&m.onGround&&m.moving)m.vy=8.2;
    if(m.type==='chicken'&&!m.baby){m.eggT=(m.eggT===undefined?40+Math.random()*80:m.eggT)-dt;if(m.eggT<=0){m.eggT=60+Math.random()*90;if(dist<32){spawnDrop(m.x,m.y+0.2,m.z,{id:356,n:1},0,1,0);sfx.pop();}}}
    if(d.burns&&G.dayF>0.85&&!inW){m.lt-=dt;if(m.lt<0){m.lt=0.5;m.sky=skyExposed(m.x,m.y+1,m.z);}if(m.sky){m.hp-=dt*3;m.hurtT=0.1;if(Math.random()<dt*20)puff(m.x,m.y+1+Math.random(),m.z,0xff8a1a,2,0.5,1,-3,0.5);if(m.hp<=0){m.dead=true;m.deadT=0;}}}
    const hs=Math.hypot(m.vx,m.vz);m.walk+=hs*dt*3.2;const sw=Math.sin(m.walk)*Math.min(1,hs)*0.7;
    if(m.M.spider){m.M.legs.forEach((l,j)=>{l.rotation.y=l.userData.by+Math.sin(m.walk*1.5+j*1.3)*0.3*Math.min(1,hs);});}
    else m.M.legs.forEach((l,j)=>{l.rotation.x=(j%2?-sw:sw)*((j>>1)%2?-1:1);});
    if(m.type==='zombie'){m.M.arms[0].rotation.x=-Math.PI/2+sw*0.15;m.M.arms[1].rotation.x=-Math.PI/2-sw*0.15;}
    g.position.set(m.x,m.y,m.z);let yd=m.yaw-g.rotation.y;while(yd>Math.PI)yd-=Math.PI*2;while(yd<-Math.PI)yd+=Math.PI*2;g.rotation.y+=yd*Math.min(1,dt*10);
    if(d.explodes){const s=1+(m.fuse>0?Math.sin(m.fuse*18)*0.06+m.fuse*0.18:0);g.scale.set(s,1+(s-1)*0.6,s);}
    m.brT=(m.brT||0)-dt;if(m.brT<0){m.brT=0.4;m.br=entLight(m.x,m.y+m.h,m.z);}
    let br=m.br;if(d.fly)br=0.94+Math.sin(m.walk*2+m.x)*0.06;if(d.explodes&&m.fuse>0&&Math.sin(m.fuse*18)>0)br=1.6;const hurt=m.hurtT>0;
    for(const mt of m.M.mats)mt.color.setRGB(hurt?Math.max(br,0.6):br,hurt?br*0.35:br,hurt?br*0.35:br);}
  for(let i=arrows.length-1;i>=0;i--){const a=arrows[i];a.life-=dt;if(a.life<0){scene.remove(a.mesh);arrows.splice(i,1);continue;}
    if(!a.stuck){a.vy-=20*dt;a.x+=a.vx*dt;a.y+=a.vy*dt;a.z+=a.vz*dt;if(SOLID[getBlock(Math.floor(a.x),Math.floor(a.y),Math.floor(a.z))]){a.stuck=true;sfx.hit('wood');}
      else if(a.own){let hit=null;for(const m of mobs)if(!m.dead&&Math.abs(a.x-m.x)<m.hw+0.2&&Math.abs(a.z-m.z)<m.hw+0.2&&a.y>m.y-0.1&&a.y<m.y+m.h+0.1){hit=m;break;}
        if(hit){const sp=Math.hypot(a.vx,a.vz)||1;hit.byP=true;hurtMob(hit,6,a.vx/sp*0.7,a.vz/sp*0.7);puff(a.x,a.y,a.z,0xcc2222,6,0.3,2);scene.remove(a.mesh);arrows.splice(i,1);continue;}}
      else if(!P.dead&&Math.abs(a.x-P.x)<0.4&&Math.abs(a.z-P.z)<0.4&&a.y>P.y&&a.y<P.y+1.8){damagePlayer(3,a.by==='wisp'?'was scorched by a Cinder Wisp':'was shot by a Skeleton');P.vx+=a.vx*0.2;P.vz+=a.vz*0.2;scene.remove(a.mesh);arrows.splice(i,1);continue;}
      a.mesh.position.set(a.x,a.y,a.z);a.mesh.lookAt(a.x+a.vx,a.y+a.vy,a.z+a.vz);}}}
function spawnTick(){if(!isLoaded(Math.floor(P.x),Math.floor(P.z)))return;
  if(opts.peaceful){for(const m of mobs.slice())if(m.d.hostile)removeMob(m);if(G.mode===0&&P.hp<20&&!P.dead){P.hp=Math.min(20,P.hp+1);hudKey='';}}let pas=0,hos=0,set=0;let sen=0;for(const m of mobs){if(m.type==='sentinel')sen++;else if(m.type==='settler')set++;else if(m.d.hostile)hos++;else pas++;}
  if(!W.dim&&!sen&&set>=2){const v=nearestVillage(P.x,P.z);if(v&&Math.hypot(v.x-P.x,v.z-P.z)<60&&isLoaded(v.x+3,v.z+3)){let y=v.h+8;while(y>v.h-6&&!SOLID[getBlock(v.x+3,y,v.z+3)])y--;if(!getBlock(v.x+3,y+1,v.z+3)&&!getBlock(v.x+3,y+3,v.z+3))spawnMob('sentinel',v.x+3.5,y+1,v.z+3.5);}}
  if(!opts.peaceful&&hos<6&&G.mode===0&&Math.random()<0.3){const bx=Math.floor(P.x),by=Math.floor(P.y),bz=Math.floor(P.z);cg:for(let dy=-5;dy<=5;dy++)for(let dz=-11;dz<=11;dz++)for(let dx=-11;dx<=11;dx++)if(getBlock(bx+dx,by+dy,bz+dz)===B.CAGE){const sx=bx+dx+((Math.random()*5)|0)-2,sz=bz+dz+((Math.random()*5)|0)-2,sy=by+dy;if(!getBlock(sx,sy,sz)&&!getBlock(sx,sy+1,sz)){const cgk='w'+(bx+dx)+','+(sy)+','+(bz+dz);if(W.dim&&!W.tiles[cgk]&&!mobs.some(o=>o.d.boss)&&!getBlock(sx,sy+2,sz)&&!getBlock(sx,sy+3,sz)){W.tiles[cgk]={c:1,s:[]};spawnMob('warden',sx+0.5,sy,sz+0.5);if(typeof say==='function')say('The Ember Warden awakens...');sfx.explode(sx,sy,sz);}
          else spawnMob(W.dim?(Math.random()<0.5?'ember':'skeleton'):Math.random()<0.6?'zombie':'skeleton',sx+0.5,sy,sz+0.5);puff(bx+dx+0.5,sy+0.5,bz+dz+0.5,0xff7a1a,12,1,2,-1,0.8);}break cg;}}
  if(!W.dim&&set<5){const v=nearestVillage(P.x,P.z);if(v&&Math.hypot(v.x-P.x,v.z-P.z)<70){const x=v.x+((Math.random()*24)|0)-12,z=v.z+((Math.random()*24)|0)-12;if(isLoaded(x,z)){let y=v.h+8;while(y>v.h-6&&!SOLID[getBlock(x,y,z)])y--;const tb=getBlock(x,y,z);if((tb===B.GRASS||tb===B.GRAVEL||tb===B.SAND||tb===B.SNOWGRASS)&&!getBlock(x,y+1,z)&&!getBlock(x,y+2,z))spawnMob('settler',x+0.5,y+1,z+0.5);}}}
  const tryCol=(dmin,dmax)=>{const a=Math.random()*6.28,d=dmin+Math.random()*(dmax-dmin);const x=Math.floor(P.x+Math.cos(a)*d),z=Math.floor(P.z+Math.sin(a)*d);const y=topSolid(x,z);return y<0?null:{x,y,z,top:getBlock(x,y,z)};};
  let fishN=0,wolfN=0;for(const m of mobs){if(m.type==='fish')fishN++;if(m.type==='wolf')wolfN++;}pas-=fishN+wolfN;
  if(!W.dim&&wolfN<3&&Math.random()<0.3){const c=tryCol(14,40);if(c&&(c.top===B.SGRASS||c.top===B.SNOWGRASS||c.top===B.GRASS)&&!getBlock(c.x,c.y+1,c.z)){colInfo(c.x,c.z);if(CI_b===BIO.TAIGA||CI_b===BIO.SNOWY||CI_b===BIO.FOREST)for(let i=0;i<2;i++)spawnMob('wolf',c.x+0.5+i,c.y+1,c.z+0.5);}}
  if(!W.dim&&fishN<6){const c=tryCol(8,34);if(c&&getBlock(c.x,c.y+1,c.z)===B.WATER&&getBlock(c.x,c.y+3,c.z)===B.WATER)for(let i=0;i<3;i++)spawnMob('fish',c.x+0.5+i*0.6,c.y+1.5,c.z+0.5);}
  if(pas<14){for(let t=0;t<3;t++){const c=tryCol(10,44);if(!c||(c.top!==B.GRASS&&c.top!==B.SNOWGRASS&&c.top!==B.SGRASS)||getBlock(c.x,c.y+1,c.z)===B.WATER)continue;const ty=['cow','pig','sheep','chicken'][(Math.random()*4)|0];const n=2+((Math.random()*2)|0);
      for(let i=0;i<n;i++){const x=c.x+((Math.random()*5)|0)-2,z=c.z+((Math.random()*5)|0)-2,y=topSolid(x,z);if(y>0&&!SOLID[getBlock(x,y+1,z)]&&getBlock(x,y+1,z)!==B.WATER)spawnMob(ty,x+0.5,y+1,z+0.5);}break;}}
  if(!opts.peaceful&&(hos<10&&G.mode===0||hos<4)){const types=W.dim?['wisp','wisp','ember','skeleton','wisp']:['zombie','zombie','skeleton','spider','ember'];const ty=types[(Math.random()*types.length)|0];
    if(G.dayF<0.25&&!W.dim){const c=tryCol(16,40);if(c&&SOLID[c.top]&&getBlock(c.x,c.y+1,c.z)===0&&!BL[c.top].leaf)spawnMob(ty,c.x+0.5,c.y+1,c.z+0.5);}
    if(!skyExposed(P.x,P.y+1,P.z)&&P.y<topSolid(Math.floor(P.x),Math.floor(P.z))-4){for(let t=0;t<12;t++){const x=Math.floor(P.x+(Math.random()-0.5)*44),y=Math.floor(P.y+(Math.random()-0.5)*(W.dim?36:14)),z=Math.floor(P.z+(Math.random()-0.5)*44);
        if(Math.hypot(x-P.x,z-P.z)<9||y<2)continue;if(getBlock(x,y,z)!==0||getBlock(x,y+1,z)!==0||!SOLID[getBlock(x,y-1,z)]||skyExposed(x,y,z))continue;
        let lit=false;if(!W.dim)for(let dy=-3;dy<=3&&!lit;dy++)for(let dz=-6;dz<=6&&!lit;dz++)for(let dx=-6;dx<=6;dx++)if(LIGHT[getBlock(x+dx,y+dy,z+dz)]){lit=true;break;}
        if(!lit){spawnMob(ty,x+0.5,y,z+0.5);break;}}}}
  if(G.dayF>0.9)for(const m of mobs.slice())if(m.d.hostile&&!m.d.burns&&Math.hypot(m.x-P.x,m.z-P.z)>40&&Math.random()<0.1)removeMob(m);}
