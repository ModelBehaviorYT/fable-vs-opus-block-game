'use strict';
THREE.ColorManagement.enabled=false;
const Q=new URLSearchParams(location.search),AUTO=Q.get('autoplay')==='1';
const G={state:'menu',mode:0,time:0.1,dayF:1,shake:0,view:0,paused:false,world:null,temp:false,debug:false,cloudT:0,needY:false,menuT:0,mx:0,mz:0,my:80,playT:0};
const P={x:0,y:80,z:0,vx:0,vy:0,vz:0,hw:0.3,h:1.8,yaw:0,pitch:0,onGround:false,hp:20,food:20,sat:5,exh:0,air:10,inv:new Array(36).fill(null),sel:0,flying:false,sneak:false,sprint:false,fallY:0,dead:false,spawn:null,hurtT:0,walkD:0,stepD:0,regenT:0,dmgT:0,edge:false,step:true};
const input={fwd:false,back:false,left:false,right:false,jump:false,sneak:false,lmb:false,rmb:false,lmbEdge:false};
const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:false,powerPreference:'high-performance'});
renderer.outputColorSpace=THREE.LinearSRGBColorSpace;renderer.setPixelRatio(1);
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(70,1,0.06,1600);camera.rotation.order='YXZ';scene.add(camera);
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}window.addEventListener('resize',resize);resize();
atlasTex=new THREE.CanvasTexture(atlas);atlasTex.magFilter=atlasTex.minFilter=THREE.NearestFilter;atlasTex.generateMipmaps=false;
const U={map:{value:atlasTex},dayL:{value:1},skyTint:{value:new THREE.Color(1,1,1)},fogColor:{value:new THREE.Color(0.7,0.8,1)},fogNear:{value:60},fogFar:{value:120},heldL:{value:0},amb:{value:0.045},flick:{value:1}};
const VS='attribute vec3 light;varying vec3 vL;varying vec2 vUv;varying float vD;void main(){vUv=uv;vL=light;vec4 mv=modelViewMatrix*vec4(position,1.0);vD=length(mv.xyz);gl_Position=projectionMatrix*mv;}';
const FS='uniform sampler2D map;uniform float dayL;uniform vec3 skyTint;uniform vec3 fogColor;uniform float fogNear;uniform float fogFar;uniform float heldL;uniform float amb;uniform float flick;varying vec3 vL;varying vec2 vUv;varying float vD;void main(){vec4 c=texture2D(map,vUv);\n#ifdef CUT\nif(c.a<0.5)discard;\n#endif\nfloat s=vL.x*dayL;s=s/(3.2-2.2*s);float b=max(vL.y*(vL.y<0.99?flick:1.0),heldL*clamp(1.0-vD/12.0,0.0,1.0));b=b/(2.5-1.5*b);vec3 l=max(vec3(s)*skyTint,vec3(b)*vec3(1.0,0.92,0.78));l=l*(1.0-amb)+amb;vec3 col=c.rgb*l*vL.z;float f=smoothstep(fogNear,fogFar,vD);gl_FragColor=vec4(mix(col,fogColor,f),c.a);}';
const matOpaque=new THREE.ShaderMaterial({uniforms:U,vertexShader:VS,fragmentShader:FS,defines:{CUT:1}});
U.time={value:0};const VSW='attribute vec3 light;uniform float time;varying vec3 vL;varying vec2 vUv;varying float vD;void main(){vUv=uv;vL=light;vec3 p=position;if(fract(p.y)>0.5){vec4 w=modelMatrix*vec4(p,1.0);p.y+=sin(w.x*0.9+time*1.7)*0.03+cos(w.z*0.8+time*1.3)*0.03-0.03;}vec4 mv=modelViewMatrix*vec4(p,1.0);vD=length(mv.xyz);gl_Position=projectionMatrix*mv;}';
const matWater=new THREE.ShaderMaterial({uniforms:U,vertexShader:VSW,fragmentShader:FS,transparent:true,depthWrite:false});
const animT=['water','lava','rift'].map(n=>{const t=TILE[n],x=(t%16)*16,y=((t/16)|0)*16;return{x,y,img:actx.getImageData(x,y,16,16)};});let animF=0,animAcc=0;
function animTiles(dt){animAcc+=dt;if(animAcc<0.16)return;animAcc=0;animF=(animF+1)%32;animT.forEach((a,i)=>{const s=i?(animF>>1)%16:animF%16;actx.putImageData(a.img,a.x,a.y+s,0,0,16,16-s);if(s)actx.putImageData(a.img,a.x,a.y+s-16,0,16-s,16,s);});atlasTex.needsUpdate=true;}
// ---------- sky ----------
const skyU={top:{value:new THREE.Color()},hor:{value:new THREE.Color()}};
const skyDome=new THREE.Mesh(new THREE.SphereGeometry(900,24,12),new THREE.ShaderMaterial({uniforms:skyU,side:THREE.BackSide,depthWrite:false,depthTest:false,vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform vec3 top;uniform vec3 hor;varying vec3 vP;void main(){float h=normalize(vP).y;gl_FragColor=vec4(mix(hor,top,pow(clamp(h*1.4+0.05,0.0,1.0),0.6)),1.0);}'}));
skyDome.renderOrder=-10;skyDome.frustumCulled=false;scene.add(skyDome);
const skyG=new THREE.Group();scene.add(skyG);
function pixTex(n,fn){const c=document.createElement('canvas');c.width=c.height=n;const x=c.getContext('2d');const im=x.createImageData(n,n);for(let y=0;y<n;y++)for(let xx=0;xx<n;xx++){const v=fn(xx,y);if(v){const i=(y*n+xx)*4;im.data[i]=v[0];im.data[i+1]=v[1];im.data[i+2]=v[2];im.data[i+3]=v[3]===undefined?255:v[3];}}x.putImageData(im,0,0);const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;return t;}
const sunTex=pixTex(32,(x,y)=>{const dx=Math.abs(x-15.5),dy=Math.abs(y-15.5),d=Math.max(dx,dy),r=Math.hypot(dx,dy);if(r<8)return[255,250,205+(r<5?40:0)];if(d<10&&r<11)return[255,226,120];if((dx<1.5||dy<1.5||Math.abs(dx-dy)<1.2)&&r<15&&r>11.5)return[255,214,96,200];return null;});
const moonTex=pixTex(32,(x,y)=>{const r=Math.hypot(x-15.5,y-15.5);if(r>9)return null;const cr=Math.hypot(x-12,y-13)<2.2||Math.hypot(x-19,y-18)<2.8||Math.hypot(x-17,y-11)<1.5;const sh=Math.hypot(x-20,y-13)<8.5;return sh?(cr?[200,206,224]:[226,232,244]):(cr?[120,128,150]:[150,158,182]);});
const sun=new THREE.Mesh(new THREE.PlaneGeometry(190,190),new THREE.MeshBasicMaterial({map:sunTex,transparent:true,depthWrite:false,fog:false}));sun.position.set(800,0,0);sun.rotation.y=-Math.PI/2;skyG.add(sun);
const moon=new THREE.Mesh(new THREE.PlaneGeometry(130,130),new THREE.MeshBasicMaterial({map:moonTex,transparent:true,depthWrite:false,fog:false}));moon.position.set(-800,0,0);moon.rotation.y=Math.PI/2;skyG.add(moon);
const starGeo=new THREE.BufferGeometry();{const a=[],r=rng32(99);for(let i=0;i<900;i++){const u=r()*2-1,t=r()*6.283,s=Math.sqrt(1-u*u);a.push(s*Math.cos(t)*850,u*850,s*Math.sin(t)*850);}starGeo.setAttribute('position',new THREE.Float32BufferAttribute(a,3));}
const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xffffff,size:2.2,sizeAttenuation:false,transparent:true,depthWrite:false,fog:false}));stars.frustumCulled=false;skyG.add(stars);
const CLT=12,CLN=128;const cloudNoise=makeNoise(4242);
const cloudTex=pixTex(CLN,(x,y)=>{const n=(u,v)=>cloudNoise.fbm(u/14,v/14,3);const fx=x/CLN,fy=y/CLN;const v=n(x,y)*(1-fx)*(1-fy)+n(x-CLN,y)*fx*(1-fy)+n(x,y-CLN)*(1-fx)*fy+n(x-CLN,y-CLN)*fx*fy;return v>0.06?[255,255,255,v>0.12?235:205]:null;});
cloudTex.wrapS=cloudTex.wrapT=THREE.RepeatWrapping;const CLS=4800;cloudTex.repeat.set(CLS/(CLN*CLT),CLS/(CLN*CLT));
const clouds=new THREE.Mesh(new THREE.PlaneGeometry(CLS,CLS),new THREE.MeshBasicMaterial({map:cloudTex,transparent:true,depthWrite:false,side:THREE.DoubleSide,opacity:0.9}));clouds.rotation.x=-Math.PI/2;clouds.renderOrder=3;scene.add(clouds);
const cDay=[0.34,0.56,0.98],cNight=[0.008,0.012,0.04],hDay=[0.66,0.8,1.0],hNight=[0.03,0.04,0.09];
function updateSky(dt,cx,cy,cz,caveF,inWater,inLava){const a=G.time*Math.PI*2,sh=Math.sin(a);const f=clamp((sh+0.12)/0.3,0,1);G.dayF=f*f*(3-2*f);const d=G.dayF;
  const ss=Math.max(0,1-Math.abs(sh)/0.3)*0.75;const L=(p,q,t)=>p+(q-p)*t;
  let tr=L(cNight[0],cDay[0],d),tg=L(cNight[1],cDay[1],d),tb=L(cNight[2],cDay[2],d);let hr=L(hNight[0],hDay[0],d),hg=L(hNight[1],hDay[1],d),hb=L(hNight[2],hDay[2],d);
  hr=L(hr,0.98,ss);hg=L(hg,0.5,ss);hb=L(hb,0.22,ss*0.9);tr=L(tr,0.4,ss*0.3);
  const rn=G.state==='play'?(G.rain||0):0;const k=(1-caveF*0.93)*(1-0.42*rn);skyU.top.value.setRGB(tr*k,tg*k,tb*k);skyU.hor.value.setRGB(hr*k,hg*k,hb*k);
  let fn=opts.rd*16*0.55,ff=opts.rd*16-10;if(G.state==='menu'){fn=50;ff=92;}
  if(inWater){U.fogColor.value.setRGB(0.05*d+0.01,0.16*d+0.02,0.45*d+0.05);fn=1;ff=26;}else if(inLava){U.fogColor.value.setRGB(0.9,0.3,0.05);fn=0.2;ff=2.5;}else U.fogColor.value.setRGB(hr*k,hg*k,hb*k);
  U.fogNear.value=fn;U.fogFar.value=ff;U.dayL.value=0.27+0.73*d*(1-0.28*rn);U.skyTint.value.setRGB(L(0.5,1,d),L(0.62,1,d),L(1,1,d));
  if(G.flash>0){G.flash-=dt;const fl=Math.max(0,G.flash)*2.4*(caveF<0.5?1:0);skyU.top.value.offsetHSL(0,0,fl*0.6);skyU.hor.value.offsetHSL(0,0,fl*0.6);U.dayL.value=Math.min(1,U.dayL.value+fl);}
  const und=W.dim===1&&G.state!=='menu';skyG.visible=!und;U.amb.value=und?0.34:0.045;
  if(und){skyU.top.value.setRGB(0.13,0.025,0.02);skyU.hor.value.setRGB(0.2,0.05,0.03);if(!inWater&&!inLava){U.fogColor.value.setRGB(0.2,0.05,0.03);U.fogNear.value=24;U.fogFar.value=Math.min(ff,120);}}
  skyDome.position.set(cx,cy,cz);skyG.position.set(cx,cy,cz);skyG.rotation.z=a;skyG.rotation.x=0.25;stars.material.opacity=(1-d)*k;sun.material.opacity=k;moon.material.opacity=k;
  G.cloudT+=dt;U.time.value=G.cloudT;U.flick.value=0.955+Math.sin(G.cloudT*11)*0.02+Math.sin(G.cloudT*23.7)*0.015+Math.sin(G.cloudT*5.3)*0.01;clouds.position.set(cx,122,cz);cloudTex.offset.set((cx+G.cloudT*1.2)/(CLN*CLT),-cz/(CLN*CLT));const cb=0.2+0.8*d;clouds.material.color.setRGB(L(cb,1,ss*0.4)*k,cb*k,L(cb,0.8,ss*0.3)*k);clouds.visible=!inWater&&!und;}
const RN=500,rainPos=new Float32Array(RN*6),rainD=[];for(let i=0;i<RN;i++)rainD.push({x:0,y:-999,z:0,g:0});
const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPos,3));
const rainMesh=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:0x9ab4e8,transparent:true,opacity:0.5,depthWrite:false}));rainMesh.frustumCulled=false;rainMesh.visible=false;rainMesh.renderOrder=6;scene.add(rainMesh);
function updateRain(dt,cx,cy,cz){if(W.dim===1){rainMesh.visible=false;return;}G.wT=(G.wT===undefined?200+Math.random()*300:G.wT)-dt;if(G.wT<=0){G.rainOn=!G.rainOn;G.wT=G.rainOn?80+Math.random()*120:240+Math.random()*400;}
  G.rain=(G.rain||0)+((G.rainOn?1:0)-(G.rain||0))*Math.min(1,dt*0.4);if(G.rain<0.02){rainMesh.visible=false;return;}rainMesh.visible=true;rainMesh.material.opacity=0.5*G.rain;
  if(!G.snow&&G.rain>0.6){G.thT=(G.thT===undefined?12:G.thT)-dt;if(G.thT<=0){G.thT=14+Math.random()*30;G.flash=0.35;sfx.ambient('thunder');}}
  G.snT=(G.snT||0)-dt;if(G.snT<=0){G.snT=1;colInfo(Math.floor(cx),Math.floor(cz));G.snow=CI_b===BIO.SNOWY||(CI_b===BIO.MOUNT&&cy>SEA+40);rainMesh.material.color.setHex(G.snow?0xffffff:0x9ab4e8);}
  const rs=G.snow?3.5:24,rl=G.snow?0.16:0.75;if(G.snow)rainMesh.material.opacity=0.95*G.rain;
  for(let i=0;i<RN;i++){const d=rainD[i];d.y-=rs*dt;if(G.snow)d.x+=Math.sin(d.y*1.3+i)*dt*0.6;if(d.y<d.g||d.y<cy-12||Math.abs(d.x-cx)>14||Math.abs(d.z-cz)>14){d.x=cx+(Math.random()-0.5)*26;d.z=cz+(Math.random()-0.5)*26;d.y=cy+3+Math.random()*13;d.g=topSolid(Math.floor(d.x),Math.floor(d.z))+1;}
    const y=d.y<d.g?-999:d.y,k=i*6;rainPos[k]=rainPos[k+3]=d.x;rainPos[k+2]=rainPos[k+5]=d.z;rainPos[k+1]=y;rainPos[k+4]=y+rl;}
  rainGeo.attributes.position.needsUpdate=true;}
// ---------- selection / crack / hand ----------
const selBox=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.004,1.004,1.004)),new THREE.LineBasicMaterial({color:0x000000,transparent:true,opacity:0.7}));selBox.visible=false;scene.add(selBox);
const crackTex=[];{const r=rng32(7);const pts=[];for(let w=0;w<9;w++){let x=8,y=8;const a=r()*6.28;for(let i=0;i<10;i++){pts.push([w,i,x|0,y|0]);x+=Math.cos(a)+(r()-0.5)*1.6;y+=Math.sin(a)+(r()-0.5)*1.6;}}
  for(let s=0;s<10;s++)crackTex.push(pixTex(16,(x,y)=>{for(const p of pts)if(p[2]===x&&p[3]===y&&p[1]<=s+1&&(p[0]<=s))return[10,10,10,190];return null;}));}
const crackMesh=new THREE.Mesh(new THREE.BoxGeometry(1.008,1.008,1.008),new THREE.MeshBasicMaterial({map:crackTex[0],transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));crackMesh.visible=false;scene.add(crackMesh);
const handG=new THREE.Group();camera.add(handG);let handKey=-2,handMesh=null,swing=0;
function setHand(){const s=P.inv[P.sel];const k=s?s.id:-1;if(k===handKey)return;handKey=k;if(handMesh){handG.remove(handMesh);handMesh.material.dispose();}
  if(!s){handMesh=new THREE.Mesh(new THREE.BoxGeometry(0.15,0.15,0.55),new THREE.MeshBasicMaterial({map:mobTex([0xe0ac7e,0xd8a274]),depthTest:false,transparent:true}));handMesh.position.set(0.72,-0.6,-1.0);handMesh.rotation.set(0.7,0.3,-0.05);}
  else{handMesh=itemMesh(s.id,true);if(s.id<256&&SHAPE[s.id]===1){handMesh.scale.setScalar(0.36);handMesh.position.set(0.56,-0.44,-0.85);handMesh.rotation.set(0.1,0.7,0);}else{handMesh.scale.setScalar(0.5);handMesh.position.set(0.62,-0.36,-0.95);handMesh.rotation.set(0,-1.15,0.1);}}
  handMesh.renderOrder=999;handG.add(handMesh);}
initParticles();
const pModel=buildModel('player');scene.add(pModel.g);pModel.g.visible=false;
// ---------- player ----------
const eyeH=()=>P.sneak?1.5:1.62;
function lookDir(){const cp=Math.cos(P.pitch);return[-Math.sin(P.yaw)*cp,Math.sin(P.pitch),-Math.cos(P.yaw)*cp];}
function blockAt(dy){return getBlock(Math.floor(P.x),Math.floor(P.y+dy),Math.floor(P.z));}
function damagePlayer(n,msg){if(G.mode===1||P.dead||G.state!=='play'||n<=0)return;const ar=P.arm&&P.arm[0];if(ar&&!/drown|starv|world/.test(msg||'')){n=Math.max(1,Math.round(n*(1-IT[ar.id].armor)));}P.hp-=n;P.hurtT=0.5;sfx.hurt();P.exh+=0.1;G.shake=Math.max(G.shake,0.25);$('vig').style.opacity=0.9;if(P.hp<=0){P.hp=0;die(msg||'died');}}
function die(msg){P.dead=true;P.boat=null;spawnXP(P.x,P.y+1,P.z,Math.min(12,Math.floor((P.xp||0)/3)));P.xp=0;if(P.arm&&P.arm[0]){spawnDrop(P.x,P.y+1,P.z,P.arm[0],1,4,1,2);P.arm[0]=null;}for(let i=0;i<36;i++){if(P.inv[i])spawnDrop(P.x,P.y+1,P.z,P.inv[i],(Math.random()-0.5)*5,4,(Math.random()-0.5)*5,2);P.inv[i]=null;}refreshHUD();if(gui.open){gui.open=false;}
  $('deathmsg').textContent='You '+msg.replace(/^was /,'were ');show('died');if(document.pointerLockElement)document.exitPointerLock();}
function respawn(silent){P.dead=false;P.hp=20;P.food=20;P.sat=5;P.air=10;P.vx=P.vy=P.vz=0;const s=P.spawn||{x:0.5,y:80,z:0.5};P.x=s.x;P.y=s.y;P.z=s.z;P.fallY=P.y;hudKey='';if(!silent){show(null);lockPointer();}if(W.dim===1){if(silent){W.dim=0;W.mods=W.modsD[0];W.tiles=W.tilesD[0];}else{const sp={x:s.x,y:s.y,z:s.z};switchDim();W.portalOW=sp;}}}
function updatePlayer(dt){if(P.dead)return;if(P.boat){P.inW=false;P.inL=false;P.sprint=false;return;}const f=(input.fwd?1:0)-(input.back?1:0),s=(input.right?1:0)-(input.left?1:0);
  P.sneak=input.sneak&&!P.flying;if(f<=0||P.sneak||(G.mode===0&&P.food<=6))P.sprint=false;
  const feet=blockAt(0.2),head=blockAt(eyeH());const inW=feet===B.WATER||head===B.WATER,inL=feet===B.LAVA;
  let sp=P.flying?(P.sprint?22:11):P.sneak?1.31:P.sprint?5.61:4.32;if((inW||inL)&&!P.flying)sp*=inL?0.3:0.55;
  const len=Math.hypot(f,s)||1;const wx=(-Math.sin(P.yaw)*f+Math.cos(P.yaw)*s)/len*sp,wz=(-Math.cos(P.yaw)*f-Math.sin(P.yaw)*s)/len*sp;
  const k=1-Math.exp(-(P.onGround||P.flying?13:inW?5:2.5)*dt);P.vx+=(wx-P.vx)*k;P.vz+=(wz-P.vz)*k;
  if(P.flying){const ty=((input.jump?1:0)-(input.sneak?1:0))*9;P.vy+=(ty-P.vy)*Math.min(1,dt*10);}
  else if(feet===B.LADDER||head===B.LADDER){P.vy=(input.jump||(f>0&&P.hitWall))?3.2:input.sneak?0:-2.2;P.fallY=P.y;if(Math.abs(P.vy)>1){P.stepD+=dt*2;if(P.stepD>1.2){P.stepD=0;sfx.step('wood');}}}
  else if(inW||inL){P.vy-=9*dt;if(P.vy<-3)P.vy+=(-3-P.vy)*Math.min(1,dt*6);if(input.jump)P.vy=Math.min(3.6,P.vy+26*dt);}
  else{P.vy-=31*dt;if(P.vy<-70)P.vy=-70;if(input.jump&&P.onGround){P.vy=8.7;P.exh+=P.sprint?0.2:0.05;P.onGround=false;}}
  const wasG=P.onGround,ox=P.x,oz=P.z;P.edge=P.sneak;moveEnt(P,P.vx*dt,P.vy*dt,P.vz*dt);
  if(P.flying&&P.onGround&&G.mode===1&&input.sneak)P.flying=false;
  if(inW||inL||P.flying){P.fallY=P.y;}else if(P.onGround){const d=P.fallY-P.y;if(d>3.4&&!wasG){damagePlayer(Math.floor(d-3),'fell from a high place');sfx.fall();}else if(d>1.2&&!wasG)sfx.step(stepMat());P.fallY=P.y;}else if(P.y>P.fallY)P.fallY=P.y;
  const md=Math.hypot(P.x-ox,P.z-oz);if(P.onGround){P.walkD+=md;P.stepD+=md;if(P.stepD>(P.sprint?2.6:2.1)){P.stepD=0;sfx.step(stepMat());if(P.sprint){const sb=getBlock(Math.floor(P.x),Math.floor(P.y-0.2),Math.floor(P.z));if(sb&&SHAPE[sb]===1)blockPuff(P.x-0.5,P.y-0.4,P.z-0.5,sb,4);}}}if(P.sprint)P.exh+=md*0.1;
  if(inW&&!P.wasW&&P.vy<-4){sfx.splash();puff(P.x,P.y+0.6,P.z,0x6f9cf0,24,0.7,4.5,12,0.7);}P.wasW=inW;P.inW=head===B.WATER;P.inL=head===B.LAVA||inL;
  // survival
  if(G.mode===1)return;P.dmgT-=dt;P.regenT+=dt;
  if(P.inW){P.air-=dt*0.67;if(P.air<=0&&P.dmgT<=0){P.dmgT=1;damagePlayer(2,'drowned');}}else P.air=Math.min(10,P.air+dt*4);
  if(P.inL&&P.dmgT<=0){P.dmgT=0.5;damagePlayer(4,'tried to swim in lava');}
  if(P.dmgT<=0){const x0=Math.floor(P.x-0.36),x1=Math.floor(P.x+0.36),z0=Math.floor(P.z-0.36),z1=Math.floor(P.z+0.36);out:for(let y=Math.floor(P.y-0.1);y<=Math.floor(P.y+1.8);y++)for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++)if(getBlock(x,y,z)===B.CACTUS){P.dmgT=0.6;damagePlayer(1,'was pricked to death');break out;}}
  if(P.y<-12&&P.dmgT<=0){P.dmgT=0.5;damagePlayer(4,'fell out of the world');}
  if(P.exh>=4){P.exh-=4;if(P.sat>0)P.sat--;else if(P.food>0)P.food--;}
  if(P.food>=18&&P.hp<20&&P.regenT>=(P.food>=20&&P.sat>0?1:4)){P.hp=Math.min(20,P.hp+1);P.exh+=3;P.regenT=0;}
  if(P.food<=0&&P.regenT>=4){P.regenT=0;if(P.hp>1)damagePlayer(1,'starved to death');}
  if(P.hp>=20||P.food<18)P.regenT=Math.min(P.regenT,4);}
function stepMat(){const b=getBlock(Math.floor(P.x),Math.floor(P.y-0.2),Math.floor(P.z));return b?BL[b].snd:'stone';}
// ---------- interaction ----------
let mining={x:0,y:-1,z:0,p:0},useCD=0,breakCD=0,hitT=0,tgt=null;
function rayBox(ox,oy,oz,d,x0,y0,z0,x1,y1,z1){let t0=0,t1=99;const o=[ox,oy,oz],lo=[x0,y0,z0],hi=[x1,y1,z1];for(let i=0;i<3;i++){if(Math.abs(d[i])<1e-8){if(o[i]<lo[i]||o[i]>hi[i])return null;}else{let a=(lo[i]-o[i])/d[i],b=(hi[i]-o[i])/d[i];if(a>b){const t=a;a=b;b=t;}if(a>t0)t0=a;if(b<t1)t1=b;if(t0>t1)return null;}}return t0;}
function breakInfo(id,held){const b=BL[id];if(b.hard<0)return{t:Infinity,can:false};const tool=held&&IT[held.id].tool;let sp=1,can=!b.tier;if(tool&&tool.type===b.tool){sp=tool.sp*(held.e?1.6:1);if(tool.tier>=b.tier)can=true;}let t=b.hard*(can?1.5:5)/sp;if(P.inW)t*=5;return{t,can};}
function useTool(){const s=P.inv[P.sel];if(!s||!IT[s.id].tool||G.mode===1)return;s.d=(s.d||0)+1;if(s.d>=IT[s.id].tool.dur){P.inv[P.sel]=null;sfx.dig('wood');toast('Your '+IT[s.id].name+' broke!');}refreshHUD();}
function doBreak(t,surv,can){const id=t.id,def=BL[id];const key=t.x+','+t.y+','+t.z;const tl=W.tiles[key];if(tl){if(tl.s)for(const s of tl.s)if(s)spawnDrop(t.x+0.5,t.y+0.5,t.z+0.5,s);delete W.tiles[key];}
  setBlock(t.x,t.y,t.z,0);if(id===B.DOOR||id===B.DOOR_O)for(const yy of[t.y-1,t.y+1])if(getBlock(t.x,yy,t.z)===id)setBlock(t.x,yy,t.z,0);sfx.dig(def.snd,t.x,t.y,t.z);blockPuff(t.x,t.y,t.z,id,22);if(LOGS.includes(id))queueDecay(t.x,t.y,t.z);
  if(surv){if(can){let d=def.drop;if(def.leaf){d=Math.random()<0.06&&id===B.LEAVES?269:Math.random()<0.08?256:Math.random()<0.1?B.SAPLING:0;}{const xo={11:1,14:5,59:2,13:0,12:0}[id];if(xo)spawnXP(t.x+0.5,t.y+0.3,t.z+0.5,xo);}if(id===B.TALLGRASS&&Math.random()<0.25)d=281;if(id===73)spawnDrop(t.x+0.5,t.y+0.4,t.z+0.5,{id:281,n:1+((Math.random()*2)|0)});if(d)spawnDrop(t.x+0.5,t.y+0.4,t.z+0.5,{id:d,n:def.dropN});}useTool();P.exh+=0.005;}}
let bobber=null;const lineGeo=new THREE.BufferGeometry();lineGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3));const fishLine=new THREE.Line(lineGeo,new THREE.LineBasicMaterial({color:0xe8e8e8}));fishLine.frustumCulled=false;fishLine.visible=false;scene.add(fishLine);
function reelIn(){if(!bobber)return;scene.remove(bobber.m);fishLine.visible=false;if(bobber.bite>0){const r=Math.random();const loot=r<0.8?285:r<0.9?271:r<0.96?272:259;spawnDrop(bobber.x,bobber.y+0.3,bobber.z,{id:loot,n:1},(P.x-bobber.x)*0.9,6,(P.z-bobber.z)*0.9,0.2);spawnXP(P.x,P.y+0.5,P.z,2);sfx.splash();toast('You caught: '+IT[loot].name);useTool();}bobber=null;}
function updateBobber(dt){if(!bobber)return;const b=bobber,h=P.inv[P.sel];if(!h||h.id!==354||P.dead||Math.hypot(b.x-P.x,b.z-P.z)>24){b.bite=0;reelIn();return;}
  if(!b.inW){b.vy-=18*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;const id=getBlock(Math.floor(b.x),Math.floor(b.y),Math.floor(b.z));if(id===B.WATER){b.inW=true;b.wait=3+Math.random()*7;let sy=Math.floor(b.y);while(getBlock(Math.floor(b.x),sy+1,Math.floor(b.z))===B.WATER)sy++;b.y=sy+0.86;sfx.splash();puff(b.x,b.y,b.z,0xa8c8f8,10,0.3,2.5,9,0.5);}else if(SOLID[id]){b.bite=0;reelIn();toast('The bobber must land in water');return;}}
  else{b.wait-=dt;if(b.bite>0){b.bite-=dt;if(b.bite<=0){b.wait=3+Math.random()*7;}}else if(b.wait<=0){b.bite=1.6;sfx.splash();puff(b.x,b.y,b.z,0xffffff,14,0.4,3,9,0.5);toast('A bite! Right-click to reel in');}}
  b.m.position.set(b.x,b.y+(b.bite>0?-0.14+Math.sin(performance.now()/60)*0.05:Math.sin(performance.now()/400)*0.02),b.z);const d=lookDir(),a=lineGeo.attributes.position.array;a[0]=P.x+Math.cos(P.yaw)*0.35+d[0]*0.6;a[1]=P.y+eyeH()-0.25;a[2]=P.z-Math.sin(P.yaw)*0.35+d[2]*0.6;a[3]=b.m.position.x;a[4]=b.m.position.y;a[5]=b.m.position.z;lineGeo.attributes.position.needsUpdate=true;fishLine.visible=true;}
const boats=[];
function spawnBoat(x,y,z,yaw){const g=new THREE.Group();const mk=(w,h,d,px,py,pz,c)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({map:mobTex(c)}));m.position.set(px,py,pz);g.add(m);};const pl=[0xb58d52,0xa8824a,0xc09858],dk=[0x8a6a3a,0x7d5f33];
  mk(0.9,0.12,1.5,0,0.06,0,dk);mk(0.12,0.4,1.5,-0.45,0.26,0,pl);mk(0.12,0.4,1.5,0.45,0.26,0,pl);mk(0.9,0.4,0.12,0,0.26,0.75,pl);mk(0.9,0.4,0.12,0,0.26,-0.75,pl);mk(0.7,0.08,0.25,0,0.3,-0.2,dk);
  scene.add(g);const b={x,y,z,vx:0,vy:0,vz:0,hw:0.5,h:0.45,yaw:yaw||0,sp:0,g};boats.push(b);return b;}
function removeBoat(b){scene.remove(b.g);const i=boats.indexOf(b);if(i>=0)boats.splice(i,1);if(P.boat===b)P.boat=null;}
function updateBoats(dt){for(const b of boats){if(!isLoaded(Math.floor(b.x),Math.floor(b.z)))continue;const rid=P.boat===b&&!P.dead;
    if(rid){b.yaw+=((input.left?1:0)-(input.right?1:0))*1.9*dt;const th=(input.fwd?1:0)-(input.back?0.5:0);b.sp+=(th*6.5-b.sp)*Math.min(1,dt*1.6);}else b.sp*=Math.max(0,1-dt*1.5);
    const inW=getBlock(Math.floor(b.x),Math.floor(b.y+0.22),Math.floor(b.z))===B.WATER;let sp=b.sp;if(!inW)sp*=0.25;b.vx=-Math.sin(b.yaw)*sp;b.vz=-Math.cos(b.yaw)*sp;
    if(inW)b.vy+=(2.2-b.vy)*Math.min(1,dt*6);else b.vy-=20*dt;moveEnt(b,b.vx*dt,b.vy*dt,b.vz*dt);if(b.hitWall)b.sp*=0.5;
    const bob=inW?Math.sin(performance.now()/500+b.x)*0.03:0;b.g.position.set(b.x,b.y+bob,b.z);b.g.rotation.y=b.yaw;b.g.rotation.z=inW?Math.sin(performance.now()/700)*0.03:0;const l=entLight(b.x,b.y+1,b.z);b.g.children.forEach(m=>m.material.color.setScalar(l));
    if(rid){P.x=b.x;P.y=b.y+0.2;P.z=b.z;P.vx=P.vy=P.vz=0;P.fallY=P.y;P.onGround=true;P.walkD=0;if(input.sneak){P.boat=null;P.y=b.y+0.7;input.sneak=false;toast('Left the boat');}
      if(Math.abs(b.sp)>2&&Math.random()<dt*14)puff(b.x+Math.sin(b.yaw)*0.8,b.y+0.3,b.z+Math.cos(b.yaw)*0.8,0xa8c8f8,2,0.6,1.5,6,0.5);}}}
function growTree(x,y,z){const th=5+((Math.random()*3)|0),tp=y+th-1;for(let ly=tp-2;ly<=tp+1;ly++){const r=ly<tp?2:1;for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){if(Math.abs(dx)===r&&Math.abs(dz)===r&&(ly===tp+1||Math.random()<0.5))continue;if(REPL[getBlock(x+dx,ly,z+dz)])setBlock(x+dx,ly,z+dz,B.LEAVES);}}for(let i=0;i<th;i++)setBlock(x,y+i,z,B.LOG);}
const charges=[];
function ignite(x,y,z,t){if(getBlock(x,y,z)!==B.CHARGE)return;setBlock(x,y,z,0);const m=itemMesh(B.CHARGE);m.position.set(x+0.5,y+0.5,z+0.5);scene.add(m);charges.push({x,y,z,t,m});if(t>1)sfx.fuse();}
function updateCharges(dt){for(let i=charges.length-1;i>=0;i--){const c=charges[i];c.t-=dt;const f=Math.sin(c.t*14)>0;c.m.material.color.setScalar(f?1.8:0.9);c.m.scale.setScalar(1+(c.t<0.6?(0.6-c.t)*0.25:0));if(Math.random()<dt*25)puff(c.x+0.5,c.y+1.05,c.z+0.5,0xdddddd,1,0.2,1,-2,0.6);
    if(c.t<=0){scene.remove(c.m);c.m.material.dispose();charges.splice(i,1);explode(c.x+0.5,c.y+0.5,c.z+0.5,4);}}}
const decayQ=[];
function nearLog(x,y,z){for(let dy=-3;dy<=3;dy++)for(let dz=-3;dz<=3;dz++)for(let dx=-3;dx<=3;dx++){const b=getBlock(x+dx,y+dy,z+dz);if(b===7||b===30||b===32)return true;}return false;}
function queueDecay(x,y,z){for(let dy=-5;dy<=5;dy++)for(let dz=-5;dz<=5;dz++)for(let dx=-5;dx<=5;dx++){const b=getBlock(x+dx,y+dy,z+dz);if(b&&BL[b].leaf&&!nearLog(x+dx,y+dy,z+dz))decayQ.push({x:x+dx,y:y+dy,z:z+dz,t:0.8+Math.random()*7});}}
function updateDecay(dt){for(let i=decayQ.length-1;i>=0;i--){const d=decayQ[i];d.t-=dt;if(d.t>0)continue;decayQ.splice(i,1);const b=getBlock(d.x,d.y,d.z);if(b&&BL[b].leaf&&!nearLog(d.x,d.y,d.z)){setBlock(d.x,d.y,d.z,0);blockPuff(d.x,d.y,d.z,b,5);
      if(G.mode===0){const r=Math.random();if(r<0.05&&b===B.LEAVES)spawnDrop(d.x+0.5,d.y+0.4,d.z+0.5,{id:269,n:1});else if(r<0.1)spawnDrop(d.x+0.5,d.y+0.4,d.z+0.5,{id:256,n:1});else if(r<0.2)spawnDrop(d.x+0.5,d.y+0.4,d.z+0.5,{id:B.SAPLING,n:1});}}}}
function interact(dt){useCD-=dt;breakCD-=dt;const d=lookDir(),ex=P.x,ey=P.y+eyeH(),ez=P.z;tgt=P.dead?null:raycast(ex,ey,ez,d[0],d[1],d[2],G.mode?5.5:4.5);
  let mt=null,mtT=Math.min(tgt?tgt.t:9,3.6);for(const m of mobs){if(m.dead)continue;const t=rayBox(ex,ey,ez,d,m.x-m.hw,m.y,m.z-m.hw,m.x+m.hw,m.y+m.h,m.z+m.hw);if(t!==null&&t<mtT){mtT=t;mt=m;}}
  const held=P.inv[P.sel];
  let bt=null;for(const b of boats){if(b===P.boat)continue;const t=rayBox(ex,ey,ez,d,b.x-0.6,b.y,b.z-0.6,b.x+0.6,b.y+0.5,b.z+0.6);if(t!==null&&t<Math.min(mtT,4)){bt=b;}}
  if(bt&&!mt){if(input.lmbEdge){input.lmbEdge=false;swing=1;spawnDrop(bt.x,bt.y+0.5,bt.z,{id:353,n:1});sfx.dig('wood',bt.x,bt.y,bt.z);removeBoat(bt);}else if(input.rmb&&useCD<=0){input.rmb=false;useCD=0.4;P.boat=bt;P.flying=false;toast('Sailing: W/S thrust, A/D steer, Shift to leave');}}
  if(input.lmbEdge){swing=1;if(mt){const tool=held&&IT[held.id].tool;const hl=Math.hypot(d[0],d[2])||1;mt.byP=true;hurtMob(mt,(tool?tool.dmg:1)+(held&&held.e?3:0),d[0]/hl,d[2]/hl);puff(mt.x,mt.y+mt.h*0.6,mt.z,0xcc2222,6,0.4,2);useTool();P.exh+=0.1;}}
  input.lmbEdge=false;
  if(input.lmb&&tgt&&!mt&&!P.dead){if(mining.x!==tgt.x||mining.y!==tgt.y||mining.z!==tgt.z)mining={x:tgt.x,y:tgt.y,z:tgt.z,p:0};
    if(G.mode===1){if(breakCD<=0){doBreak(tgt,false);breakCD=0.22;swing=1;}}
    else{const bi=breakInfo(tgt.id,held);if(bi.t!==Infinity&&breakCD<=0){mining.p+=dt/Math.max(bi.t,0.04);hitT-=dt;if(swing<=0.1)swing=1;if(hitT<=0){hitT=0.22;sfx.hit(BL[tgt.id].snd);blockPuff(tgt.x+tgt.nx*0.5,tgt.y+tgt.ny*0.5,tgt.z+tgt.nz*0.5,tgt.id,2);}
        if(mining.p>=1){doBreak(tgt,true,bi.can);mining.p=0;mining.y=-1;breakCD=0.12;}}}}
  else{mining.p=0;mining.y=-1;}
  if(!input.rmb||!P.eating)P.eatT=0;P.eating=false;
  if(input.rmb&&useCD<=0&&!P.dead){
    if(mt&&held&&(held.id===282||held.id===281)&&['cow','pig','sheep','chicken'].includes(mt.type)&&!mt.baby){input.rmb=false;useCD=0.5;swing=1;
      if((mt.fedT||0)>0)toast('This animal was fed recently');else{mt.fedT=60;if(G.mode===0){if(--held.n<=0)P.inv[P.sel]=null;refreshHUD();}const bb=spawnMob(mt.type,mt.x+0.4,mt.y,mt.z+0.4);bb.baby=90;bb.M.g.scale.setScalar(0.5);puff(mt.x,mt.y+mt.h+0.3,mt.z,0xff5a7a,10,0.6,1.5,-1,1);sfx.pop();sfx.mob(mt.type,mt.x,mt.y,mt.z);}}
    else if(mt&&mt.type==='cow'&&held&&held.id===276&&!mt.baby){input.rmb=false;useCD=0.5;swing=1;held.id=355;refreshHUD();handKey=-2;sfx.splash();sfx.mob('cow',mt.x,mt.y,mt.z);}
    else if(mt&&mt.type==='wolf'&&!mt.tame&&held&&held.id===271){input.rmb=false;useCD=0.4;swing=1;if(G.mode===0){if(--held.n<=0)P.inv[P.sel]=null;refreshHUD();}
      if(Math.random()<0.45||Q.get('ui')==='wolf'){mt.tame=true;mt.M.collar.visible=true;mt.hp=12;puff(mt.x,mt.y+1.1,mt.z,0xff5a7a,12,0.6,1.5,-1,1);sfx.levelup();toast('The wolf is now your companion');}else{puff(mt.x,mt.y+1.1,mt.z,0x555555,8,0.5,1,-1,0.8);sfx.mob('wolf',mt.x,mt.y,mt.z);}}
    else if(mt&&mt.type==='sheep'&&held&&held.id===350&&!mt.baby){input.rmb=false;useCD=0.5;swing=1;if(mt.shorn>0)toast('This sheep has no wool yet');else{mt.shorn=90;mt.M.g.children[0].scale.set(0.8,0.72,0.92);spawnDrop(mt.x,mt.y+1,mt.z,{id:36,n:1+((Math.random()*3)|0)});sfx.dig('cloth',mt.x,mt.y,mt.z);useTool();}}
    else if(mt&&mt.type==='settler'){input.rmb=false;useCD=0.5;swing=1;sfx.mob('settler',mt.x,mt.y,mt.z);mt.yaw=Math.atan2(P.x-mt.x,P.z-mt.z);mt.moving=false;mt.aiT=3;
      const T={258:[279,8],259:[262,4],260:[42,1],257:[22,8],256:[9,2],4:[258,1]};const tr=held&&T[held.id];
      if(tr){if(--held.n<=0)P.inv[P.sel]=null;spawnDrop(mt.x,mt.y+1.2,mt.z,{id:tr[0],n:tr[1]},(P.x-mt.x)*1.2,3,(P.z-mt.z)*1.2,0.3);refreshHUD();adv('trade');toast('Settler: A fair trade! Here, '+tr[1]+' x '+IT[tr[0]].name+'.');}
      else toast('Settler: '+['Good day, traveler!','Bring me iron, gold, coal or diamonds and we can trade.','Mind the Emberlings after dark.','They say obsidian gates lead somewhere... warm.'][(Math.random()*4)|0]);}
    else if(tgt&&!input.sneak&&tgt.id===B.TABLE){input.rmb=input.lmb=false;openGui('table');useCD=0.3;}
    else if(tgt&&!input.sneak&&(tgt.id===B.FURNACE||tgt.id===B.FURNACE_LIT)){input.rmb=input.lmb=false;openGui('furnace',tgt.x+','+tgt.y+','+tgt.z);useCD=0.3;}
    else if(tgt&&held&&held.id===274&&tgt.id===B.OBSIDIAN){useCD=0.5;swing=1;if(lightPortal(tgt.x+tgt.nx,tgt.y+tgt.ny,tgt.z+tgt.nz)||lightPortal(tgt.x,tgt.y+1,tgt.z)||lightPortal(tgt.x,tgt.y-1,tgt.z)||lightPortal(tgt.x+1,tgt.y,tgt.z)||lightPortal(tgt.x-1,tgt.y,tgt.z)||lightPortal(tgt.x,tgt.y,tgt.z+1)||lightPortal(tgt.x,tgt.y,tgt.z-1)){sfx.fuse();if(G.mode===0){if(--held.n<=0)P.inv[P.sel]=null;refreshHUD();}toast('The Rift Gate opens...');}else toast('The obsidian frame is not complete');}
    else if(tgt&&!input.sneak&&tgt.id===55&&held&&IT[held.id].tool){input.rmb=false;useCD=0.5;swing=1;if(held.e)toast('This tool is already enchanted');else if(G.mode===0&&xpLevel(P.xp||0).l<3)toast('Enchanting needs 3 experience levels');
      else{if(G.mode===0)P.xp=Math.max(0,P.xp-33);held.e=1;hudKey='';refreshHUD();sfx.levelup();puff(tgt.x+0.5,tgt.y+1.2,tgt.z+0.5,0xc060ff,30,1,3,-2,1.2);toast('Enchanted '+IT[held.id].name+': faster and sharper');}}
    else if(tgt&&!input.sneak&&tgt.id===B.CHARGE){input.rmb=false;useCD=0.3;swing=1;ignite(tgt.x,tgt.y,tgt.z,3);}
    else if(tgt&&!input.sneak&&(tgt.id===B.DOOR||tgt.id===B.DOOR_O)){input.rmb=false;useCD=0.3;swing=1;const nid=tgt.id===B.DOOR?B.DOOR_O:B.DOOR;
      if(nid===B.DOOR&&Math.abs(P.x-tgt.x-0.5)<0.8&&Math.abs(P.z-tgt.z-0.5)<0.8){}else{for(const yy of[tgt.y-1,tgt.y,tgt.y+1])if(getBlock(tgt.x,yy,tgt.z)===tgt.id)setBlock(tgt.x,yy,tgt.z,nid,getMeta(tgt.x,yy,tgt.z));sfx.place('wood');}}
    else if(tgt&&!input.sneak&&tgt.id===B.CHEST){input.rmb=input.lmb=false;openGui('chest',tgt.x+','+tgt.y+','+tgt.z);sfx.place('wood');useCD=0.3;}
    else if(tgt&&!input.sneak&&tgt.id===B.BED){input.rmb=false;useCD=0.5;P.spawn={x:tgt.x+0.5,y:tgt.y+0.6,z:tgt.z+0.5};if(G.dayF<0.35){G.time=0.02;G.day=(G.day||1)+1;for(const m of mobs.slice())if(m.d.hostile)removeMob(m);toast('You slept through the night. Spawn point set.');adv('sleep');}else toast('Spawn point set. You can only sleep at night.');}
    else if(held&&held.id>=276&&held.id<=278){useCD=0.3;swing=1;
      if(held.id===276){for(let t=0;t<4.6;t+=0.1){const x=Math.floor(ex+d[0]*t),y=Math.floor(ey+d[1]*t),z=Math.floor(ez+d[2]*t),b=getBlock(x,y,z);if(SOLID[b])break;if((b===B.WATER||b===B.LAVA)&&getMeta(x,y,z)===0){setBlock(x,y,z,0);held.id=b===B.WATER?277:278;sfx.splash();break;}}}
      else if(tgt){let x=tgt.x,y=tgt.y,z=tgt.z;if(!REPL[tgt.id]){x+=tgt.nx;y+=tgt.ny;z+=tgt.nz;}if(REPL[getBlock(x,y,z)]){setBlock(x,y,z,held.id===277?B.WATER:B.LAVA,0);sfx.splash();if(G.mode===0)held.id=276;}}
      refreshHUD();}
    else if(held&&held.id===280){let ai=-1;for(let i=0;i<36;i++)if(P.inv[i]&&P.inv[i].id===279){ai=i;break;}
      if(ai>=0||G.mode===1){useCD=0.55;swing=1;const a={x:ex+d[0]*0.5,y:ey-0.1+d[1]*0.5,z:ez+d[2]*0.5,vx:d[0]*34,vy:d[1]*34+1.5,vz:d[2]*34,life:8,stuck:false,own:true};a.mesh=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.06,0.7),new THREE.MeshBasicMaterial({color:0xc8b890}));scene.add(a.mesh);arrows.push(a);sfx.bow();
        if(G.mode===0&&ai>=0){if(--P.inv[ai].n<=0)P.inv[ai]=null;refreshHUD();}}else{useCD=0.5;toast('You need arrows to use the bow');}}
    else if(held&&held.id>=330&&held.id<330+EGGS.length&&tgt){useCD=0.35;swing=1;const sm=spawnMob(EGGS[held.id-330][0],tgt.x+tgt.nx+0.5,tgt.y+tgt.ny+(tgt.ny<0?-1:0),tgt.z+tgt.nz+0.5);sfx.pop();sfx.mob(sm.type,sm.x,sm.y,sm.z);if(G.mode===0){if(--held.n<=0)P.inv[P.sel]=null;refreshHUD();}}
    else if(held&&held.id===354){input.rmb=false;useCD=0.5;swing=1;if(bobber)reelIn();else{const m=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.16,0.16),new THREE.MeshBasicMaterial({color:0xe83a2a}));scene.add(m);bobber={x:ex+d[0]*0.6,y:ey+d[1]*0.6,z:ez+d[2]*0.6,vx:d[0]*13,vy:d[1]*13+4,vz:d[2]*13,m,inW:false,bite:0,wait:0};sfx.bow();}}
    else if(held&&held.id===353){useCD=0.4;swing=1;for(let t=0.6;t<5;t+=0.1){const x=ex+d[0]*t,y=ey+d[1]*t,z=ez+d[2]*t,b=getBlock(Math.floor(x),Math.floor(y),Math.floor(z));if(SOLID[b])break;if(b===B.WATER){let sy=Math.floor(y);while(getBlock(Math.floor(x),sy+1,Math.floor(z))===B.WATER)sy++;spawnBoat(x,sy+0.6,z,P.yaw);sfx.splash();if(G.mode===0){P.inv[P.sel]=null;refreshHUD();}break;}}}
    else if(held&&held.id===284&&tgt&&(tgt.id===B.GRASS||tgt.id===B.DIRT||tgt.id===B.SGRASS)&&REPL[getBlock(tgt.x,tgt.y+1,tgt.z)]&&getBlock(tgt.x,tgt.y+1,tgt.z)!==B.WATER){useCD=0.3;swing=1;setBlock(tgt.x,tgt.y+1,tgt.z,0);setBlock(tgt.x,tgt.y,tgt.z,B.FARMLAND);sfx.dig('gravel',tgt.x,tgt.y,tgt.z);}
    else if(held&&held.id===281&&tgt&&tgt.id===B.FARMLAND&&!getBlock(tgt.x,tgt.y+1,tgt.z)){useCD=0.25;swing=1;setBlock(tgt.x,tgt.y+1,tgt.z,B.CROP);W.tiles[tgt.x+','+(tgt.y+1)+','+tgt.z]={g:14+Math.random()*22};sfx.place('grass');if(G.mode===0){if(--held.n<=0)P.inv[P.sel]=null;refreshHUD();}}
    else if(held&&IT[held.id].food&&G.mode===0&&P.food<20&&(P.eatT=(P.eatT||0)+dt)<1.4){P.eating=true;P.eatS=(P.eatS||0)-dt;if(P.eatS<=0){P.eatS=0.22;sfx.hit('cloth');swing=0.6;}}
    else if(held&&held.id===355){input.rmb=false;useCD=0.6;held.id=276;P.hp=Math.min(20,P.hp+4);P.food=Math.min(20,P.food+1);hudKey='';refreshHUD();handKey=-2;sfx.eat();toast('You drank the milk');}
    else if(held&&IT[held.id].food&&G.mode===0){P.eatT=0;if(P.food<20){P.food=Math.min(20,P.food+IT[held.id].food);P.sat=Math.min(P.food,P.sat+IT[held.id].food*0.6);if(--held.n<=0)P.inv[P.sel]=null;sfx.eat();refreshHUD();useCD=1;swing=1;}}
    else if(held&&held.id<256&&tgt){let x=tgt.x,y=tgt.y,z=tgt.z;if(!REPL[tgt.id]){x+=tgt.nx;y+=tgt.ny;z+=tgt.nz;}const id=held.id;let ok=REPL[getBlock(x,y,z)]&&y>0&&y<127&&getBlock(x,y,z)!==id;
      if(ok&&SOLID[id]){if(x+1>P.x-P.hw&&x<P.x+P.hw&&y+1>P.y&&y<P.y+P.h&&z+1>P.z-P.hw&&z<P.z+P.hw)ok=false;for(const m of mobs)if(x+1>m.x-m.hw&&x<m.x+m.hw&&y+1>m.y&&y<m.y+m.h&&z+1>m.z-m.hw&&z<m.z+m.hw)ok=false;}
      if(ok&&(SHAPE[id]===2||id===B.CACTUS)&&!SOLID[getBlock(x,y-1,z)])ok=false;
      if(ok){let meta=0;if(id===B.FURNACE||id===B.CHEST)meta=Math.abs(d[0])>Math.abs(d[2])?(d[0]>0?3:1):(d[2]>0?2:0);if(id===B.LADDER){const nx=tgt.nx||(Math.abs(d[0])>Math.abs(d[2])?(d[0]>0?-1:1):0),nz=nx?0:(tgt.nz||(d[2]>0?-1:1));meta=nx?(nx>0?2:0):(nz>0?3:1);}
        if(SHAPE[id]===6)meta=Math.abs(d[0])>Math.abs(d[2])?(d[0]>0?1:3):(d[2]>0?0:2);
        if(id===B.DOOR){meta=Math.abs(d[0])>Math.abs(d[2])?0:1;if(!getBlock(x,y+1,z))setBlock(x,y+1,z,id,meta);}setBlock(x,y,z,id,meta);if(id===B.SAPLING)W.tiles[x+','+y+','+z]={g:45+Math.random()*60};sfx.place(BL[id].snd);swing=1;useCD=0.24;if(G.mode===0){if(--held.n<=0)P.inv[P.sel]=null;refreshHUD();}}}}
  if(tgt&&G.state==='play'){selBox.visible=true;selBox.position.set(tgt.x+0.5,tgt.y+0.5,tgt.z+0.5);}else selBox.visible=false;
  if(mining.p>0&&tgt){crackMesh.visible=true;crackMesh.position.set(tgt.x+0.5,tgt.y+0.5,tgt.z+0.5);crackMesh.material.map=crackTex[Math.min(9,(mining.p*10)|0)];}else crackMesh.visible=false;}
// ---------- world lifecycle ----------
function findSpawn(){if(AUTO&&Q.get('village')){for(let rz=-6;rz<=6;rz++)for(let rx=-6;rx<=6;rx++){const v=villageAt(rx,rz);if(v&&(!Q.get('vb')||BIO[Q.get('vb').toUpperCase()]===v.b))return[v.x+4,v.z+6,colInfo(v.x+4,v.z+6)];}}
  const want=AUTO&&Q.get('biome')?BIO[Q.get('biome').toUpperCase()]:undefined;for(let i=0;i<(want!==undefined?6000:600);i++){const a=i*0.7,r=i*5;const x=Math.round(Math.cos(a)*r),z=Math.round(Math.sin(a)*r);const h=colInfo(x,z);if(want!==undefined?CI_b===want:((CI_b===BIO.PLAINS||CI_b===BIO.FOREST)&&h>SEA+1))return[x,z,h];}return[0,0,colInfo(0,0)];}
function setSeed(seed){const sd=String(seed);W.seed=/^-?\d+$/.test(sd)?(parseInt(sd)|0):hashStr(sd);W.noise=makeNoise(W.seed);}
function startWorld(w,temp){if(bobber){bobber.bite=0;reelIn();}while(boats.length)removeBoat(boats[0]);P.boat=null;G.arrive=false;$('loadtxt').textContent='Building terrain...';$('riftov').style.opacity=0;decayQ.length=0;for(const c of charges)scene.remove(c.m);charges.length=0;G.world=w;G.temp=!!temp;clearWorld();clearEntities();setSeed(w.seed);G.mode=w.mode|0;G.day=1;G.time=0.06;G.view=0;G.playT=0;
  Object.assign(P,{vx:0,vy:0,vz:0,yaw:0,pitch:0,hp:20,food:20,sat:5,exh:0,air:10,sel:0,flying:false,dead:false,sprint:false,hurtT:0});P.inv=new Array(36).fill(null);P.arm=[null];P.xp=0;P.adv={};advQ=[];
  let data=null;if(!temp){try{data=JSON.parse(localStorage.getItem('ll_w_'+w.id));}catch(e){}}
  if(data){for(const k in data.mods){const m=new Map(),a=data.mods[k];for(let i=0;i<a.length;i+=2)m.set(a[i],a[i+1]);W.modsD[0].set(+k,m);}for(const k in (data.mods1||{})){const m=new Map(),a=data.mods1[k];for(let i=0;i<a.length;i+=2)m.set(a[i],a[i+1]);W.modsD[1].set(+k,m);}
    W.tilesD[0]=data.tiles||{};W.tilesD[1]=data.tiles1||{};W.dim=data.dim|0;W.mods=W.modsD[W.dim];W.tiles=W.tilesD[W.dim];W.portalOW=data.portalOW||null;Object.assign(P,data.p);G.pets=data.pets|0;if(!Array.isArray(P.arm))P.arm=[null];G.day=data.day||1;G.time=data.time;G.mode=data.mode|0;G.needY=false;}
  else{const s=findSpawn();P.x=s[0]+0.5;P.z=s[1]+0.5;P.y=s[2]+2;G.needY=true;P.spawn=null;}
  P.fallY=P.y;G.state='loading';G.paused=false;show('loading');handKey=-2;}
function saveWorld(){if(!G.world||G.temp||G.state!=='play')return;const ser=M=>{const o={};M.forEach((m,k)=>{const a=[];m.forEach((v,i)=>a.push(i,v));o[k]=a;});return o;};const mods=ser(W.modsD[0]),mods1=ser(W.modsD[1]);
  const data={p:{x:P.x,y:P.y,z:P.z,yaw:P.yaw,pitch:P.pitch,hp:P.hp,food:P.food,sat:P.sat,air:P.air,inv:P.inv,arm:P.arm,adv:P.adv||{},xp:P.xp||0,sel:P.sel,spawn:P.spawn,flying:P.flying},time:G.time,day:G.day,pets:mobs.filter(m=>m.tame&&!m.dead).length,mode:G.mode,mods,mods1,tiles:W.tilesD[0],tiles1:W.tilesD[1],dim:W.dim,portalOW:W.portalOW};
  try{localStorage.setItem('ll_w_'+G.world.id,JSON.stringify(data));const l=getWorlds();const e=l.find(x=>x.id===G.world.id);if(e){e.last=Date.now();e.mode=G.mode;putWorlds(l);}}catch(e){toast('Could not save: browser storage is full');}}
function startMenuWorld(){U.heldL.value=0;G.rain=0;G.rainOn=false;G.wT=undefined;rainMesh.visible=false;clearWorld();clearEntities();setSeed('loamlands-title-3');const s=findSpawn();G.mx=s[0];G.mz=s[1];G.my=s[2]+13;G.state='menu';G.time=0.19;selBox.visible=crackMesh.visible=false;pModel.g.visible=false;handG.visible=false;}
function quitToTitle(){saveWorld();G.arrive=false;$('riftov').style.opacity=0;G.world=null;G.paused=false;startMenuWorld();show('title');if(document.pointerLockElement)document.exitPointerLock();}
function setMode(m){G.mode=m;if(m===0)P.flying=false;if(G.world)G.world.mode=m;$('pmode').textContent='Game Mode: '+(m?'Creative':'Survival');hudKey='';P.fallY=P.y;}
function pauseGame(){if(G.state!=='play'||G.paused)return;G.paused=true;G.pauseAt=performance.now();$('pmode').textContent='Game Mode: '+(G.mode?'Creative':'Survival');show('pause');saveWorld();if(document.pointerLockElement)document.exitPointerLock();}
function resumeGame(){G.paused=false;show(null);lockPointer();}
function lockPointer(){if(AUTO)return;try{const p=$('c').requestPointerLock();if(p&&p.catch)p.catch(()=>{});}catch(e){}}
function switchDim(){while(boats.length)removeBoat(boats[0]);P.boat=null;const to=1-W.dim;if(W.dim===0)W.portalOW={x:P.x,y:P.y,z:P.z};W.chunks.forEach(disposeChunk);W.chunks.clear();W.ticks=new Map();clearEntities();decayQ.length=0;W.dim=to;W.mods=W.modsD[to];W.tiles=W.tilesD[to];
  P.portalT=0;P.portalCD=6;P.vx=P.vy=P.vz=0;G.arrive=true;G.state='loading';$('loadtxt').textContent=to?'Descending into the Emberdeep...':'Returning to the surface...';show('loading');}
function lightPortal(x,y,z){for(const ax of[0,1]){const cells=[],seen=new Set(),st=[[x,y,z]];let ok=true;while(st.length&&ok){const c=st.pop(),k=c.join();if(seen.has(k))continue;const b=getBlock(c[0],c[1],c[2]);if(b===B.OBSIDIAN)continue;if(b!==0){ok=false;break;}seen.add(k);cells.push(c);if(cells.length>21){ok=false;break;}
      st.push([c[0],c[1]+1,c[2]],[c[0],c[1]-1,c[2]],ax?[c[0],c[1],c[2]+1]:[c[0]+1,c[1],c[2]],ax?[c[0],c[1],c[2]-1]:[c[0]-1,c[1],c[2]]);}
    if(ok&&cells.length>=4){for(const c of cells)setBlock(c[0],c[1],c[2],B.RIFT,ax,true);return true;}}return false;}
function buildGate(x,y,z){for(let u=-1;u<=2;u++)for(let v=-1;v<=3;v++)setBlock(x+u,y+v,z,(u===-1||u===2||v===-1||v===3)?B.OBSIDIAN:B.RIFT,0,true);}
function portalTick(dt){P.portalCD=(P.portalCD||0)-dt;const inR=blockAt(0.5)===B.RIFT||blockAt(1.2)===B.RIFT;if(inR&&P.portalCD<=0&&!P.dead){if(!P.portalT)sfx.fuse();P.portalT=(P.portalT||0)+dt;if(P.portalT>2.4)switchDim();}else P.portalT=Math.max(0,(P.portalT||0)-dt*2);
  $('riftov').style.opacity=Math.min(0.85,(P.portalT||0)/2.4);}
function arrive(){G.arrive=false;let px=Math.floor(P.x),pz=Math.floor(P.z);
  if(W.dim===1){let sy=-1;const ox=px,oz=pz;find:for(let r=0;r<=14;r+=2)for(let dz=-r;dz<=r;dz+=2)for(let dx=-r;dx<=r;dx+=2){if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;const x=ox+dx,z=oz+dz;
        for(let y=80;y>27;y--){if(SOLID[getBlock(x,y-1,z)]&&!getBlock(x,y,z)&&!getBlock(x,y+1,z)&&!getBlock(x,y+2,z)&&!getBlock(x,y+3,z)){sy=y;px=x;pz=z;break find;}}}
    if(sy<0)sy=60;
    let has=false;for(let dy=-3;dy<=5&&!has;dy++)for(let dz=-4;dz<=4&&!has;dz++)for(let dx=-4;dx<=4;dx++)if(getBlock(px+dx,sy+dy,pz+dz)===B.RIFT){has=true;break;}
    for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=3;dx++){if(!SOLID[getBlock(px+dx,sy-1,pz+dz)])setBlock(px+dx,sy-1,pz+dz,B.EMBERSTONE,0,true);for(let h=0;h<4;h++){const b=getBlock(px+dx,sy+h,pz+dz);if(b&&b!==B.OBSIDIAN&&b!==B.RIFT)setBlock(px+dx,sy+h,pz+dz,0,0,true);}}
    if(!has)buildGate(px,sy,pz-2);P.x=px+0.5;P.y=sy+0.01;P.z=pz+0.5;P.yaw=Math.PI;if(AUTO&&Q.get('back')){P.yaw=0;P.pitch=0;bot.walk=true;}}
  else{const o=W.portalOW;if(o){P.x=o.x;P.y=o.y;P.z=o.z;}else{P.y=topSolid(px,pz)+1.01;}}
  if(G.keepTP){G.keepTP=false;const pcx=px>>4,pcz=pz>>4;kp:for(let r=0;r<30;r++)for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;if(hash2(pcx+dx,pcz+dz,W.seed+777+41)<0.07){P.x=(pcx+dx)*16-6.5;P.z=(pcz+dz)*16+8.5;P.y=72;P.flying=true;P.yaw=-Math.PI/2;P.pitch=-0.35;break kp;}}}
  P.fallY=P.y;$('loadtxt').textContent='Building terrain...';G.state='play';show(null);toast(W.dim?'The Emberdeep':'The Overworld');}
function finishLoading(){if(G.arrive){arrive();return;}if(G.needY){const y=topSolid(Math.floor(P.x),Math.floor(P.z));P.y=(y<0?90:y)+1.01;G.needY=false;P.fallY=P.y;if(!P.spawn)P.spawn={x:P.x,y:P.y,z:P.z};}
  for(let i=0;i<(G.pets||0)&&i<6;i++){const w=spawnMob('wolf',P.x+1+i*0.6,P.y+0.2,P.z+1);w.tame=true;w.M.collar.visible=true;}G.pets=0;
  G.state='play';show(null);refreshHUD();hudKey='';handG.visible=true;lockPointer();if(AUTO)autoSetup();else{toast(G.world.name+' - '+(G.mode?'Creative':'Survival')+' Mode  (E: inventory, Esc: menu and controls)');for(let i=0;i<6;i++)spawnTick();}}
const ADV={wood:['First Timber',7],table:['A Place to Work',20],pick:['Breaking Ground',300],furnace:['Stoking the Fire',21],iron:['Iron in Hand',258],diamond:['Deep Sparkle',260],bread:['Daily Loaf',283],hunter:['Night Watch',303],trade:['A Fair Trade',259],rift:['Into the Emberdeep',35],sleep:['Rested',45],tame:['Loyal Companion',271],enchant:['Touched by Lore',55],sail:['Cast Off',353],warden:['Warden Slayer',43]};
let advQ=[],advBusy=false;
function adv(k){if(!G.world||G.state!=='play'||!ADV[k])return;P.adv=P.adv||{};if(P.adv[k])return;P.adv[k]=1;advQ.push(k);if(!advBusy)advNext();}
function advNext(){const k=advQ.shift();if(!k){advBusy=false;return;}advBusy=true;$('advic').style.backgroundImage='url('+iconURL(ADV[k][1])+')';$('advtx').textContent=ADV[k][0];$('adv').style.right='14px';sfx.levelup();say('Advancement made: ['+ADV[k][0]+']');setTimeout(()=>{$('adv').style.right='-360px';setTimeout(advNext,500);},3200);}
function advScan(){const has=id=>P.inv.some(s=>s&&s.id===id);if(LOGS.some(has))adv('wood');if(has(20))adv('table');if(has(300)||has(304)||has(308))adv('pick');if(has(21))adv('furnace');if(has(258))adv('iron');if(has(260))adv('diamond');if(has(283))adv('bread');if(W.dim===1)adv('rift');if(P.boat)adv('sail');if(mobs.some(m=>m.tame))adv('tame');if(P.inv.some(s=>s&&s.e))adv('enchant');}
const chatLines=[];let chatT=null;
function say(t){chatLines.push(t);while(chatLines.length>6)chatLines.shift();const e=$('chatlog');e.textContent=chatLines.join('\n');e.style.opacity=1;clearTimeout(chatT);chatT=setTimeout(()=>{e.style.opacity=0;chatLines.length=0;},7000);}
function runCommand(s){s=s.trim();if(!s)return;if(s[0]!=='/'){say('<You> '+s);return;}const a=s.slice(1).split(/\s+/),c=a[0].toLowerCase();
  if(c==='help')say('Commands: /time day|night|noon|<0-24>, /gamemode survival|creative, /tp x y z,\n/give <item name or id> [count], /weather clear|rain, /seed, /heal, /spawn <mob>, /kill');
  else if(c==='time'){const v=a[2]||a[1];const h=v==='day'?7:v==='noon'?12:v==='night'?19:v==='midnight'?0:parseFloat(v);if(isNaN(h))say('Usage: /time day|noon|night|<hour>');else{G.time=((h-6+24)%24)/24;say('Time set to '+h+':00');}}
  else if(c==='gamemode'){const m=/^(c|1)/.test(a[1]||'')?1:0;setMode(m);say('Game mode: '+(m?'Creative':'Survival'));}
  else if(c==='tp'){const x=parseFloat(a[1]),y=parseFloat(a[2]),z=parseFloat(a[3]);if(isNaN(x)||isNaN(y)||isNaN(z))say('Usage: /tp x y z');else{P.x=x;P.y=y;P.z=z;P.vy=0;P.fallY=y;say('Teleported to '+x+' '+y+' '+z);}}
  else if(c==='give'){let n=parseInt(a[a.length-1]);const hasN=!isNaN(n)&&a.length>2;const nm=a.slice(1,hasN?-1:undefined).join(' ').toLowerCase();if(!hasN)n=1;let id=parseInt(nm);if(isNaN(id)||!IT[id]){id=-1;for(const k in IT)if(IT[k].name.toLowerCase()===nm){id=+k;break;}if(id<0)for(const k in IT)if(IT[k].name.toLowerCase().includes(nm)&&nm){id=+k;break;}}
    if(id<0||!IT[id])say('Unknown item: '+nm);else{n=clamp(n,1,640);addItem({id,n});say('Gave '+n+' x '+IT[id].name);}}
  else if(c==='weather'){G.rainOn=/rain|snow|storm/.test(a[1]||'');G.wT=300;say('Weather: '+(G.rainOn?'rain':'clear'));}
  else if(c==='seed')say('Seed: '+(G.world?G.world.seed:'?'));
  else if(c==='heal'){P.hp=20;P.food=20;hudKey='';say('Healed');}
  else if(c==='kill')damagePlayer(999,'fell out of the world');
  else if(c==='spawn'){const t=(a[1]||'').toLowerCase();if(!MOBS[t])say('Mobs: '+Object.keys(MOBS).join(', '));else{const d=lookDir();spawnMob(t,P.x+d[0]*3,P.y+1,P.z+d[2]*3);say('Spawned '+t);}}
  else say('Unknown command. Try /help');}
function openChat(pre){const c=$('chat');c.style.display='block';c.value=pre||'';for(const k in input)input[k]=false;if(document.pointerLockElement)G.chatUnlock=true,document.exitPointerLock();setTimeout(()=>c.focus(),0);}
function closeChat(run){const c=$('chat');if(c.style.display==='none')return;const v=c.value;c.style.display='none';c.blur();if(run)runCommand(v);lockPointer();}
// ---------- input ----------
let lastW=0,lastSpace=0;
const KEY={KeyW:'fwd',KeyS:'back',KeyA:'left',KeyD:'right',Space:'jump',ShiftLeft:'sneak',ShiftRight:'sneak',ArrowUp:'fwd',ArrowDown:'back',ArrowLeft:'left',ArrowRight:'right'};
window.addEventListener('keydown',e=>{if(e.target.id==='chat'){if(e.code==='Enter'){closeChat(true);e.preventDefault();}else if(e.code==='Escape'){closeChat(false);e.preventDefault();}e.stopPropagation();return;}
  if(e.target.tagName==='INPUT'){if(e.code==='Enter'&&curScreen==='create')$('wcreate').click();return;}sfx.init();
  if(G.state==='play'&&!G.paused&&!P.dead&&!gui.open&&(e.code==='KeyT'||e.code==='Slash')){e.preventDefault();openChat(e.code==='Slash'?'/':'');return;}
  if(G.state==='play'&&(e.code==='F5'||e.code==='F3'||e.code==='Tab'||e.code==='F1'))e.preventDefault();
  if(e.code==='Escape'){if(gui.open)closeGui();else if(G.state==='play'&&!P.dead){if(G.paused){if(performance.now()-G.pauseAt>350)resumeGame();}else pauseGame();}else if(curScreen&&curScreen!=='title'&&G.state==='menu')show('title');return;}
  if(G.state!=='play'||G.paused||P.dead)return;
  if(e.code==='KeyE'){if(gui.open)closeGui();else{input.lmb=input.rmb=false;openGui(G.mode?'creative':'inv');}return;}
  if(gui.open)return;if(e.ctrlKey&&e.code!=='ControlLeft')e.preventDefault();
  const k=KEY[e.code];if(k){if(!e.repeat){const now=performance.now();if(e.code==='KeyW'){if(now-lastW<280||e.ctrlKey||input.ctrl)P.sprint=true;lastW=now;}
      if(e.code==='Space'){if(G.mode===1&&now-lastSpace<300){P.flying=!P.flying;P.vy=0;lastSpace=0;}else lastSpace=now;}}input[k]=true;e.preventDefault();}
  else if(e.code==='ControlLeft'||e.code==='ControlRight'){if(input.fwd)P.sprint=true;input.ctrl=true;}
  else if(e.code.startsWith('Digit')){const n=+e.code[5];if(n>=1&&n<=9){P.sel=n-1;refreshHUD();showItemName();}}
  else if(e.code==='F5'){G.view=(G.view+1)%3;}
  else if(e.code==='KeyR'){if(input.fwd)P.sprint=true;}
  else if(e.code==='F1'){G.hideHud=!G.hideHud;$('hud').style.opacity=G.hideHud?0:1;}
  else if(e.code==='F3'){G.debug=!G.debug;$('debug').style.display=G.debug?'block':'none';}
  else if(e.code==='KeyQ'){const s=P.inv[P.sel];if(s){const d=lookDir();spawnDrop(P.x+d[0]*0.4,P.y+1.4,P.z+d[2]*0.4,{id:s.id,n:1,d:s.d},d[0]*6,d[1]*6+1.5,d[2]*6,1.2);if(--s.n<=0)P.inv[P.sel]=null;refreshHUD();}}});
window.addEventListener('keyup',e=>{const k=KEY[e.code];if(k)input[k]=false;if(e.code==='ControlLeft')input.ctrl=false;});
window.addEventListener('blur',()=>{for(const k in input)input[k]=false;});
document.addEventListener('mousemove',e=>{if(document.pointerLockElement!==$('c')||G.state!=='play'||G.paused)return;const s=0.0023*opts.sens/100;P.yaw-=e.movementX*s;P.pitch=clamp(P.pitch-e.movementY*s,-1.57,1.57);});
$('c').addEventListener('mousedown',e=>{sfx.init();if(G.state!=='play'||G.paused||P.dead||gui.open)return;if(!document.pointerLockElement&&!AUTO){lockPointer();return;}
  if(e.button===0){input.lmb=true;input.lmbEdge=true;}else if(e.button===2){input.rmb=true;useCD=0;}
  else if(e.button===1&&tgt){e.preventDefault();let f=-1;for(let i=0;i<9;i++)if(P.inv[i]&&P.inv[i].id===tgt.id)f=i;if(f>=0)P.sel=f;else if(G.mode===1){P.inv[P.sel]={id:tgt.id===B.FURNACE_LIT?B.FURNACE:tgt.id,n:1};}refreshHUD();showItemName();}});
window.addEventListener('mouseup',e=>{if(e.button===0)input.lmb=false;else if(e.button===2)input.rmb=false;});
window.addEventListener('contextmenu',e=>e.preventDefault());
window.addEventListener('wheel',e=>{if(G.state!=='play'||G.paused||gui.open)return;P.sel=(P.sel+(e.deltaY>0?1:8))%9;refreshHUD();showItemName();},{passive:true});
document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement&&G.chatUnlock){G.chatUnlock=false;return;}if(!document.pointerLockElement&&$('chat').style.display!=='block'&&G.state==='play'&&!gui.open&&!G.paused&&!P.dead&&!AUTO)pauseGame();});
window.addEventListener('beforeunload',saveWorld);
// ---------- autoplay bot ----------
const bot={t:0,on:Q.get('bot')!=='0',uiT:0.35,ui:Q.get('ui')};
function autoGive(){const give=[[301,1],[9,48],[22,32],[4,64],[300,1],[262,8],[20,1],[21,1],[19,16]];give.forEach((g,i)=>P.inv[i]={id:g[0],n:g[1]});P.inv[9]={id:7,n:12};P.inv[10]={id:257,n:9};P.inv[11]={id:258,n:5};P.inv[12]={id:256,n:14};P.inv[13]={id:5,n:20};P.inv[14]={id:260,n:3};P.inv[20]={id:303,n:1};refreshHUD();}
function autoSetup(){autoGive();if(!Q.get('adv'))P.adv={wood:1,table:1,pick:1,furnace:1,iron:1,diamond:1};if(Q.get('snd'))sfx.init();
  if(Q.get('mode')==='creative')setMode(1);const t=Q.get('time');if(t)G.time=t==='night'?0.75:t==='noon'?0.25:t==='sunset'?0.485:t==='sunrise'?0.01:parseFloat(t)||0.25;
  if(Q.get('f5'))G.view=+Q.get('f5')||1;if(Q.get('hp')){P.hp=+Q.get('hp');P.food=13;}
  if(Q.get('cave')){let best=null,bs=-1;const px=Math.floor(P.x),pz=Math.floor(P.z);for(let x=px-40;x<=px+40;x+=2)for(let z=pz-40;z<=pz+40;z+=2){const top=topSolid(x,z);for(let y=10;y<Math.min(44,top-8);y++){if(getBlock(x,y,z)||getBlock(x,y+1,z)||!SOLID[getBlock(x,y-1,z)])continue;let sc=0;for(let dy=0;dy<3;dy++)for(let dz=-3;dz<=3;dz++)for(let dx=-3;dx<=3;dx++)if(!getBlock(x+dx,y+dy,z+dz))sc++;if(sc>bs){bs=sc;best=[x,y,z];}}}
    if(best){P.x=best[0]+0.5;P.y=best[1]+0.01;P.z=best[2]+0.5;P.fallY=P.y;bot.on=false;bot.cave=true;P.sel=2;let n=0;for(let r=2;r<7&&n<2;r++)for(let a=0;a<8&&n<2;a++){const x=best[0]+Math.round(Math.cos(a*0.8+r)*r),z=best[2]+Math.round(Math.sin(a*0.8+r)*r);for(let y=best[1]-2;y<best[1]+3;y++)if(!getBlock(x,y,z)&&SOLID[getBlock(x,y-1,z)]){setBlock(x,y,z,B.TORCH);P.yaw=Math.atan2(-(x+0.5-P.x),-(z+0.5-P.z));n++;break;}}}}
  if(Q.get('mobs')){bot.on=false;G.mode=Q.get('mode')==='survival'?0:1;const ty=Q.get('mobs')==='night'?['zombie','skeleton','spider','ember']:Q.get('mobs')==='new'?['settler','wisp','fish','settler']:['cow','pig','sheep','chicken','zombie','skeleton','spider','ember'];ty.forEach((t,i)=>{const a=P.yaw+(i-(ty.length-1)/2)*0.28;const x=P.x-Math.sin(a)*6.5,z=P.z-Math.cos(a)*6.5;let y=Math.floor(P.y)+5;while(y>2&&!(SOLID[getBlock(Math.floor(x),y,Math.floor(z))]&&!BL[getBlock(Math.floor(x),y,Math.floor(z))].leaf))y--;const m=spawnMob(t,x,y+1,z);m.yaw=Math.atan2(P.x-x,P.z-z);m.M.g.rotation.y=m.yaw;m.aiT=99;});P.pitch=-0.12;}
  else for(let i=0;i<8;i++)spawnTick();
  if(Q.get('flow')){bot.on=false;const x=Math.floor(P.x),z=Math.floor(P.z)-6,y=Math.floor(P.y);for(let i=0;i<3;i++){setBlock(x-3,y+i,z,B.COBBLE);setBlock(x+3,y+i,z,B.COBBLE);}setBlock(x-3,y+3,z,B.WATER);setBlock(x+3,y+3,z,B.LAVA);}
  if(Q.get('xp')){P.xp=+Q.get('xp');spawnXP(P.x-Math.sin(P.yaw)*3,P.y+1,P.z-Math.cos(P.yaw)*3,8);}
  if(Q.get('armor')){P.arm[0]={id:288,n:1};P.inv[15]={id:289,n:1};hudKey='';}
  if(Q.get('rain')){G.rainOn=true;G.rain=1;G.wT=9999;if(Q.get('rain')==='2')G.thT=0.6;}
  if(Q.get('empty')){P.inv[0]=null;refreshHUD();}
  if(Q.get('yaw'))P.yaw=+Q.get('yaw');if(Q.get('pitch'))P.pitch=+Q.get('pitch');
  refreshHUD();hudKey='';}
function botUpdate(dt){bot.t+=dt;
  if(bot.ui&&bot.t>bot.uiT){const u=bot.ui;bot.ui=null;bot.on=false;for(const k in input)input[k]=false;
    if(u==='inventory')openGui('inv');else if(u==='creative'){setMode(1);openGui('creative');}
    else if(u==='crafting'){openGui('table');gui.craft[0]={id:9,n:3};gui.craft[1]={id:9,n:3};gui.craft[2]={id:9,n:3};gui.craft[4]={id:256,n:2};gui.craft[7]={id:256,n:2};refreshGui();}
    else if(u==='furnace'){const k='0,1,0';W.tiles[k]={s:[{id:12,n:7},{id:257,n:4},{id:258,n:3}],burn:52,burnMax:80,cook:6.2};openGui('furnace',k);}
    else if(u==='clicktest'){openGui('table');slotClick('inv',9,0,false);slotClick('craft',4,2,false);slotClick('inv',9,0,false);slotClick('res',0,0,true);slotClick('inv',1,2,false);slotClick('craft',0,2,false);slotClick('craft',3,2,false);$('cursor').style.left='700px';$('cursor').style.top='300px';}
    else if(u==='chest'){const k='0,1,0';W.tiles[k]={c:1,s:new Array(27).fill(null)};[[258,12],[260,4],[41,2],[42,1],[43,1],[44,20],[45,1],[276,1],[277,1],[278,1],[40,3],[269,5]].forEach((g,i)=>W.tiles[k].s[i*2]={id:g[0],n:g[1]});openGui('chest',k);}
    else if(u==='build'){const x=Math.floor(P.x),y=Math.floor(P.y),z=Math.floor(P.z)-4;[B.CHEST,B.BED,48,56,55,50,52,54].forEach((b,i)=>{for(let h=0;h<3;h++)setBlock(x-4+i,y+h,z,h?0:b,0);});P.yaw=0;P.pitch=-0.25;if(Q.get('walk')){P.x=x-2+0.5;P.pitch=-0.5;bot.walk=true;G.view=1;}if(Q.get('onbed')){P.x=x-2+0.5;P.y=y+2;P.z=z+0.5;P.fallY=P.y;G.view=1;P.pitch=-0.5;}}
    else if(u==='blast'){const x=Math.floor(P.x),y=Math.floor(P.y),z=Math.floor(P.z);setBlock(x-3,y,z-4,B.SAPLING);W.tiles[(x-3)+','+y+','+(z-4)]={g:0.3};setBlock(x+2,y,z-7,B.CHARGE);setBlock(x+3,y,z-7,B.CHARGE);ignite(x+2,y,z-7,+Q.get('fuse')||1.2);P.yaw=0;P.pitch=-0.15;}
    else if(u==='bow'){P.inv[0]={id:280,n:1};P.inv[30]={id:279,n:20};refreshHUD();const m=spawnMob('zombie',P.x,P.y,P.z-6);m.aiT=99;P.yaw=0;P.pitch=0.02;G.mode=0;bot.shoot=true;}
    else if(u==='under'){switchDim();bot.on=Q.get('bot')==='1';}
    else if(u==='gate'){const x=Math.floor(P.x),y=Math.floor(P.y),z=Math.floor(P.z)-5;for(let u2=-1;u2<=2;u2++)for(let v=-1;v<=3;v++){const fr=(u2===-1||u2===2||v===-1||v===3);setBlock(x+u2,y+v,z,fr?B.OBSIDIAN:0);}toast(lightPortal(x,y,z)?'lit':'FAILED');P.yaw=0;P.pitch=0;if(Q.get('enter')){P.x=x+0.5;P.z=z+0.5;}}
    else if(u==='farm'){const x=Math.floor(P.x),y=Math.floor(P.y)-1,z=Math.floor(P.z)-3;for(let i=-2;i<=2;i++){setBlock(x+i,y+1,z,0);setBlock(x+i,y,z,B.FARMLAND);setBlock(x+i,y+1,z,B.CROP);W.tiles[(x+i)+','+(y+1)+','+z]={g:1+i+2};}P.yaw=0;P.pitch=-0.5;}
    else if(u==='door'){const x=Math.floor(P.x),y=Math.floor(P.y),z=Math.floor(P.z)-3;for(let i=-2;i<=2;i++)for(let h=0;h<3;h++)setBlock(x+i,y+h,z,(h<2&&(i===-1||i===1))?(i<0?B.DOOR:B.DOOR_O):B.PLANKS,(h<2&&(i===-1||i===1))?1:0);P.yaw=0;P.pitch=0;}
    else if(u==='loot'){const v=nearestVillage(P.x,P.z);let k=null;if(v)for(let dz=-26;dz<=26&&!k;dz++)for(let dx=-26;dx<=26&&!k;dx++)for(let dy=-8;dy<=12;dy++)if(getBlock(v.x+dx,v.h+dy,v.z+dz)===B.CHEST){k=(v.x+dx)+','+(v.h+dy)+','+(v.z+dz);break;}if(k)openGui('chest',k);else toast('no chest found');}
    else if(u==='ladder'){const x=Math.floor(P.x),y=Math.floor(P.y),z=Math.floor(P.z)-2;for(let h=0;h<6;h++){for(let i=-1;i<=1;i++)setBlock(x+i,y+h,z,B.COBBLE);setBlock(x,y+h,z+1,B.LADDER,3);}P.yaw=0;P.pitch=0.3;P.z=z+3.5;if(Q.get('climb')){bot.walk=true;}}
    else if(u==='eggs'){openGui('creative');const g=$('cregrid');g.scrollTop=g.scrollHeight;}
    else if(u==='recipes'){pauseGame();renderRecipes();show('recipes');}
    else if(u==='breed'){P.inv[0]={id:282,n:5};refreshHUD();const m=spawnMob('cow',P.x,P.y,P.z-2.6);m.aiT=99;m.moving=false;P.yaw=0;P.pitch=-0.25;G.mode=0;bot.shoot=true;}
    else if(u==='trade'){P.inv[0]={id:258,n:5};refreshHUD();const m=spawnMob('settler',P.x,P.y,P.z-2.4);m.aiT=99;m.moving=false;m.yaw=0;P.yaw=0;P.pitch=-0.05;bot.shoot=true;}
    else if(u==='hoe'){P.inv[0]={id:284,n:1};refreshHUD();const x=Math.floor(P.x),y=Math.floor(P.y),z=Math.floor(P.z);for(let dz=-3;dz<=0;dz++)for(let dx=-1;dx<=1;dx++){setBlock(x+dx,y,z+dz,0);setBlock(x+dx,y-1,z+dz,B.GRASS);}P.yaw=0;P.pitch=-0.75;bot.shoot=true;}
    else if(u==='light'){P.inv[0]={id:274,n:3};refreshHUD();const x=Math.floor(P.x),y=Math.floor(P.y),z=Math.floor(P.z)-3;for(let u2=-1;u2<=2;u2++)for(let v=-1;v<=3;v++)setBlock(x+u2,y+v,z,(u2===-1||u2===2||v===-1||v===3)?B.OBSIDIAN:0);P.yaw=0;P.pitch=-0.55;bot.shoot=true;}
    else if(u==='plant'){P.inv[0]={id:281,n:6};refreshHUD();const x=Math.floor(P.x),y=Math.floor(P.y),z=Math.floor(P.z);for(let dz=-3;dz<=0;dz++)for(let dx=-1;dx<=1;dx++){setBlock(x+dx,y,z+dz,0);setBlock(x+dx,y-1,z+dz,dz<0?B.FARMLAND:B.GRASS);}P.yaw=0;P.pitch=-0.75;bot.shoot=true;}
    else if(u==='cmd'){['/help','/time night','/give diamond sword','/give bread 5','/weather rain','/spawn pig','/seed','/bogus'].forEach(runCommand);P.sel=0;$('chat').style.display='block';$('chat').value='/gamemode creative';}
    else if(u==='crypt'){let f=null;const pcx=Math.floor(P.x)>>4,pcz=Math.floor(P.z)>>4;for(let r=0;r<40&&!f;r++)for(let dz=-r;dz<=r&&!f;dz++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;const cx=pcx+dx,cz=pcz+dz;if(hash2(cx,cz,W.seed+71)<0.09){const fy=12+((hash2(cx,cz,W.seed+72)*22)|0);colInfo(cx*16+8,cz*16+8);if(CI_h>fy+9){f=[cx*16+9.5,fy+1.01,cz*16+9.5];break;}}}
      if(f){P.x=f[0];P.y=f[1];P.z=f[2];P.fallY=P.y;P.yaw=0.8;P.pitch=-0.1;P.sel=2;bot.on=false;G.mode=Q.get('mode')==='survival'?0:1;say('crypt at '+f.join(' '));}}
    else if(u==='shear'){P.inv[0]={id:350,n:1};refreshHUD();const m=spawnMob('sheep',P.x,P.y,P.z-2.4);m.aiT=99;m.moving=false;m.yaw=1.6;m.M.g.rotation.y=1.6;P.yaw=0;P.pitch=-0.3;bot.shoot=true;}
    else if(u==='enchant'){P.xp=60;P.sel=4;const x=Math.floor(P.x),y=Math.floor(P.y),z=Math.floor(P.z)-2;setBlock(x,y,z,55);setBlock(x,y+1,z,0);P.yaw=0;P.pitch=-0.5;bot.shoot=true;bot.keepSel=true;}
    else if(u==='keep'){switchDim();G.keepTP=true;G.mode=1;}
    else if(u==='boat'){let f=null;const px=Math.floor(P.x),pz=Math.floor(P.z);for(let r=2;r<40&&!f;r++)for(let a=0;a<16;a++){const x=px+Math.round(Math.cos(a*0.39)*r),z=pz+Math.round(Math.sin(a*0.39)*r);if(getBlock(x,SEA,z)===B.WATER&&getBlock(x,SEA-1,z)===B.WATER&&!getBlock(x,SEA+1,z)){f=[x,z];break;}}
      if(f){const b=spawnBoat(f[0]+0.5,SEA+0.6,f[1]+0.5,0.6);P.boat=b;G.view=+Q.get('f5')||1;P.pitch=-0.35;P.yaw=0.6;bot.sail=true;}}
    else if(u==='stairs'){const x=Math.floor(P.x),y=Math.floor(P.y),z=Math.floor(P.z);for(let k=0;k<5;k++)for(let dx=-1;dx<=1;dx++){for(let h=0;h<8;h++)setBlock(x+dx,y+h,z-2-k,h<k?B.COBBLE:h===k?(dx<0?79:dx>0?81:80):0,h===k?2:0);}for(let h=0;h<4;h++)setBlock(x,y+h,z-1,0);P.yaw=0;P.pitch=-0.1;if(Q.get('climb'))bot.walk=true;G.view=+Q.get('f5')||0;}
    else if(u==='guard'){G.mode=1;const s=spawnMob('sentinel',P.x-1.5,P.y,P.z-5);for(let i=0;i<3;i++)spawnMob('zombie',P.x+3+i,P.y,P.z-6-i);P.yaw=0;P.pitch=-0.05;G.time=0.75;}
    else if(u==='wolf'){P.inv[0]={id:271,n:4};refreshHUD();const m=spawnMob('wolf',P.x,P.y,P.z-2.2);m.aiT=99;m.moving=false;m.yaw=1.2;m.M.g.rotation.y=1.2;P.yaw=0;P.pitch=-0.4;bot.shoot=true;if(Q.get('fight')){G.time=0.75;setTimeout(()=>{},0);bot.wolfFight=1.5;}}
    else if(u==='eat'){P.food=9;P.sel=5;hudKey='';bot.shoot=true;bot.keepSel=true;P.pitch=0.3;}
    else if(u==='boss'){const m=spawnMob('warden',P.x,P.y,P.z-9);m.yaw=0;P.yaw=0;P.pitch=0.1;P.arm[0]={id:289,n:1};P.inv[0]={id:319,n:1,e:1};G.time=0.5;hudKey='';refreshHUD();if(Q.get('fight')){bot.atk=true;}else G.mode=1;adv('diamond');}
    else if(u==='punch'){P.inv.fill(null);P.adv={};refreshHUD();const x=Math.floor(P.x),y=Math.floor(P.y),z=Math.floor(P.z)-(+Q.get('far')||1);for(let k=1;k<z-Math.floor(P.z)*-1&&k<3;k++){}setBlock(x,y,z,B.LOG);setBlock(x,y+1,z,B.LOG);for(let k=Math.floor(P.z)-1;k>z;k--){setBlock(x,y,k,0);setBlock(x,y+1,k,0);}P.yaw=0;P.pitch=0.1;bot.punch=true;}
    else if(u==='fish'){P.inv[0]={id:354,n:1};refreshHUD();let f=null;const px=Math.floor(P.x),pz=Math.floor(P.z);for(let r=2;r<40&&!f;r++)for(let a=0;a<16;a++){const x=px+Math.round(Math.cos(a*0.39)*r),z=pz+Math.round(Math.sin(a*0.39)*r);if(getBlock(x,SEA,z)===B.WATER&&getBlock(x,SEA-1,z)===B.WATER){f=[x,z];break;}}
      if(f){P.yaw=Math.atan2(-(f[0]+0.5-P.x),-(f[1]+0.5-P.z));P.pitch=0.15;bot.fish=true;bot.ft=0;}}
    else if(u==='milk'){P.inv[0]={id:276,n:1};P.hp=10;hudKey='';refreshHUD();const m=spawnMob('cow',P.x,P.y,P.z-2.6);m.aiT=99;m.moving=false;P.yaw=0;P.pitch=-0.25;G.mode=0;bot.shoot=true;}
    else if(u==='misc'){G.mode=0;const x=Math.floor(P.x),y=Math.floor(P.y),z=Math.floor(P.z);setBlock(x,y,z-2,0);setBlock(x,y-1,z-2,B.FARMLAND);setBlock(x,y,z-2,73);setBlock(x+1,y,z-2,B.FURNACE,0);W.tiles[(x+1)+','+y+','+(z-2)]={s:[{id:285,n:2},{id:257,n:1},null],burn:0,burnMax:0,cook:0};
      P.inv.fill(null);P.inv[0]={id:300,n:1};P.inv[1]={id:331,n:2};refreshHUD();P.yaw=0;P.pitch=-0.62;bot.misc=0;}
    else if(u==='pause')pauseGame();else if(u==='death'){damagePlayer(99,'was slain by a Zombie');}return;}
  if(bot.misc!==undefined){bot.misc+=dt;if(bot.misc<3){P.sel=0;if(bot.misc<0.4){if(!input.lmb){input.lmb=true;input.lmbEdge=true;}}else input.lmb=false;}else if(bot.misc<4.5){input.lmb=false;P.sel=1;input.rmb=bot.misc<3.3;}else if(bot.misc>24&&!bot.said){bot.said=true;const t=W.tiles[(Math.floor(P.x)+1)+','+Math.floor(P.y)+','+(Math.floor(P.z)-2)];say('furnace out: '+(t&&t.s[2]?IT[t.s[2].id].name+' x'+t.s[2].n:'nothing')+' | inv: '+P.inv.filter(s=>s).map(s=>IT[s.id].name+' x'+s.n).join(', '));}return;}
  if(bot.fish){P.sel=0;bot.ft+=dt;if(!bobber&&bot.ft>0.3&&!bot.cast){bot.cast=true;input.rmb=true;}else if(bobber&&bobber.bite>0&&bobber.bite<1.2){input.rmb=true;bot.cast=false;bot.ft=-3;}return;}
  if(bot.punch){if(!input.lmb){input.lmb=true;input.lmbEdge=true;}P.sel=0;P.pitch=P.inv[0]&&P.inv[0].n>=1&&bot.t>5?-0.4:0.1;return;}
  if(bot.atk){const b=G.bossM;if(b){P.yaw=Math.atan2(-(b.x-P.x),-(b.z-P.z));P.pitch=0.25;}P.sel=0;bot.aT=(bot.aT||0)-dt;if(bot.aT<=0){bot.aT=0.35;input.lmbEdge=true;}if(P.hp<10)P.hp=20;return;}
  if(bot.wolfFight>0){bot.wolfFight-=dt;if(bot.wolfFight<=0){G.mode=1;for(let i=0;i<2;i++)spawnMob('zombie',P.x+4+i,P.y,P.z-5);}}
  if(bot.shoot){input.rmb=true;if(!bot.keepSel)P.sel=0;return;}
  if(bot.walk){input.fwd=true;return;}
  if(bot.sail){input.fwd=true;if(P.boat)P.yaw=P.boat.yaw;return;}
  if(bot.cave){P.yaw+=dt*0.15;P.pitch=-0.1;return;}
  if(P.dead&&bot.on){bot.deadT=(bot.deadT||0)+dt;if(bot.deadT>4){bot.deadT=0;respawn();autoGive();}return;}
  if(!bot.on||gui.open||G.paused||P.dead)return;
  const ph=bot.t%9;P.yaw+=(Math.sin(bot.t*0.35)*0.35+0.06)*dt;
  if(ph<4.5){input.fwd=true;input.lmb=false;input.rmb=false;P.pitch+=(-0.12+Math.sin(bot.t*0.8)*0.12-P.pitch)*dt*3;input.jump=(P.hitWall&&P.onGround)||blockAt(0.4)===B.WATER;P.sprint=ph>2;}
  else if(ph<7.3){input.fwd=false;input.jump=false;P.pitch+=(-0.75-P.pitch)*dt*4;if(!input.lmb){input.lmb=true;input.lmbEdge=true;}P.sel=tgt&&BL[tgt.id].tool==='pick'?4:0;}
  else if(ph<8.2){input.lmb=false;P.sel=ph<7.8?1:2;input.rmb=true;}
  else{input.rmb=false;input.fwd=true;P.sel=0;}
  if(handKey!==(P.inv[P.sel]?P.inv[P.sel].id:-1))refreshHUD();}
// ---------- main loop ----------
let last=performance.now(),tickAcc=0,spawnAcc=0,saveAcc=0,fpsN=0,fpsT=0,fps=0,camFov=70;
let lastFrameAt=0;setInterval(()=>{if(document.visibilityState==='visible'&&performance.now()-lastFrameAt>500&&G.state==='loading')frame(true);},250);
function frame(fromTimer){if(fromTimer!==true)requestAnimationFrame(frame);const now=performance.now();lastFrameAt=now;let dt=(now-last)/1000;last=now;const rawDt=dt;if(dt>0.05)dt=0.05;if(dt<=0)dt=0.001;fpsN++;fpsT+=dt;if(fpsT>=0.5){fps=Math.round(fpsN/fpsT);fpsN=0;fpsT=0;}
  const hud=$('hud');animTiles(dt);
  if(G.state==='menu'){hud.style.display='none';G.menuT+=dt;updateChunks(G.mx,G.mz,6,AUTO||Q.get('screen')?40:9);camera.position.set(G.mx+0.5,G.my,G.mz+0.5);camera.rotation.set(-0.2,G.menuT*0.035+0.6,0);camera.fov=70;camera.updateProjectionMatrix();updateSky(dt,camera.position.x,camera.position.y,camera.position.z,0,false,false);renderer.render(scene,camera);return;}
  if(G.state==='loading'){hud.style.display='none';if($('loading').style.display!=='flex')show('loading');
    if(!isFinite(P.x)||!isFinite(P.z)||P.x===null||P.z===null){const s=findSpawn();P.x=s[0]+0.5;P.z=s[1]+0.5;P.y=s[2]+2;G.needY=true;}
    G.loadN=(G.loadN||0)+1;if(G.loadN>1500){G.loadN=0;G.world=null;G.paused=false;startMenuWorld();show('title');return;}
    const pend=updateChunks(P.x,P.z,Math.min(opts.rd,3),30);if(pend===0)G.loadN=0;$('loadbar').firstChild.style.width=Math.round((1-pend/29)*100)+'%';if(pend===0)finishLoading();return;}
  hud.style.display='block';
  let nSim=AUTO?clamp(Math.round(rawDt/0.05),1,8):1;if(G.ff>0){nSim=Math.min(G.ff,600);G.ff-=nSim;dt=0.05;}
  for(let si=0;si<nSim;si++){if(G.state!=='play'){if(AUTO&&nSim>8)G.ff+=nSim-si;break;}if(!G.paused){G.playT+=dt;if(AUTO)botUpdate(dt);
    if(!gui.open){}else{input.fwd=input.back=input.left=input.right=input.jump=false;}
    if(isLoaded(Math.floor(P.x),Math.floor(P.z))){updatePlayer(dt);portalTick(dt);if(G.state!=='play'){if(AUTO&&nSim>8)G.ff+=nSim-si-1;break;}}
    interact(dt);tickAcc+=dt;while(tickAcc>=0.05){tickAcc-=0.05;worldTick();}
    if(W.dim===1&&Math.random()<dt*14)puff(P.x+(Math.random()-0.5)*22,P.y+Math.random()*7-1,P.z+(Math.random()-0.5)*22,Math.random()<0.5?0xff8a1a:0xffd23a,1,0.2,0.5,-1.6,2.2);
    updateBoats(dt);updateBobber(dt);if(P.hurtT>0)P.hurtT-=dt;tickFurnaces(dt);updateDecay(dt);updateCharges(dt);updateMobs(dt);updateDrops(dt);updateOrbs(dt);updateParticles(dt);G.musT=(G.musT===undefined?25:G.musT)-dt;if(G.musT<=0){G.musT=70+Math.random()*90;sfx.music();}
    G.ambT=(G.ambT===undefined?5:G.ambT)-dt;if(G.ambT<=0){G.ambT=5+Math.random()*9;sfx.ambient(G.caveF>0.5||W.dim?'cave':P.inW||blockAt(-0.5)===B.WATER?'water':G.dayF>0.6?'bird':'night');}
    spawnAcc+=dt;if(spawnAcc>1.2){spawnAcc=0;advScan();if(!Q.get('mobs'))spawnTick();}
    {const ot=G.time;G.time=(G.time+dt/1200)%1;if(G.time<ot){G.day=(G.day||1)+1;toast('Day '+G.day);}}saveAcc+=dt;if(saveAcc>30){saveAcc=0;saveWorld();}
    if(si===nSim-1||si%8===7)updateChunks(P.x,P.z,opts.rd,AUTO?14:7);}}
  // camera
  const d=lookDir(),ey=P.y+eyeH();const hs=Math.hypot(P.vx,P.vz);let bobY=0,bobX=0;if(P.onGround&&hs>0.5&&G.view===0){bobY=Math.abs(Math.sin(P.walkD*1.9))*0.06;bobX=Math.sin(P.walkD*1.9)*0.03;}
  if(G.view===0){camera.position.set(P.x+Math.cos(P.yaw)*bobX,ey+bobY,P.z-Math.sin(P.yaw)*bobX);camera.rotation.set(P.pitch,P.yaw,0);}
  else{const s=G.view===1?-1:1;let dist=4;for(let t=0.3;t<=4;t+=0.2){if(SOLID[getBlock(Math.floor(P.x+d[0]*s*t),Math.floor(ey+d[1]*s*t),Math.floor(P.z+d[2]*s*t))]){dist=t-0.25;break;}}
    camera.position.set(P.x+d[0]*s*dist,ey+d[1]*s*dist,P.z+d[2]*s*dist);camera.rotation.set(G.view===1?P.pitch:-P.pitch,G.view===1?P.yaw:P.yaw+Math.PI,0);}
  if(G.shake>0){G.shake-=dt;camera.rotation.z=(Math.random()-0.5)*G.shake*0.25;camera.position.y+=(Math.random()-0.5)*G.shake*0.3;}
  const tf=opts.fov+(P.sprint&&hs>4.5?9:0)+(P.flying&&P.sprint?6:0);camFov+=(tf-camFov)*Math.min(1,dt*9);if(Math.abs(camera.fov-camFov)>0.01){camera.fov=camFov;camera.updateProjectionMatrix();}
  // player model + hand
  G.plT=(G.plT||0)-dt;if(G.plT<=0){G.plT=0.25;let best=0;const bx=Math.floor(P.x),by=Math.floor(P.y+1),bz=Math.floor(P.z);for(let dy=-4;dy<=4;dy++)for(let dz=-6;dz<=6;dz++)for(let dx=-6;dx<=6;dx++){const e=LIGHT[getBlock(bx+dx,by+dy,bz+dz)];if(e){const v=(e-Math.abs(dx)-Math.abs(dy)-Math.abs(dz))/14;if(v>best)best=v;}}G.plB=Math.min(1,best);}
  {const hs_=P.inv[P.sel];const hv=G.state==='play'&&!P.dead&&hs_?(hs_.id<256?LIGHT[hs_.id]/15:hs_.id===278?1:0):0;U.heldL.value+=(hv*0.93-U.heldL.value)*Math.min(1,dt*8);}
  const pl=Math.max(entLight(P.x,P.y+1.7,P.z),G.plB||0,U.heldL.value,W.dim?0.65:0);pModel.g.visible=G.view>0&&!P.dead;
  if(pModel.g.visible){pModel.g.position.set(P.x,P.y,P.z);pModel.g.rotation.y=P.yaw+Math.PI;pModel.head.rotation.x=-P.pitch;const sw=Math.sin(P.walkD*2.2)*Math.min(1,hs/3)*0.8;pModel.legs[0].rotation.x=P.boat?-1.5:sw;pModel.legs[1].rotation.x=P.boat?-1.5:-sw;if(P.boat)pModel.g.position.y-=0.5;pModel.arms[0].rotation.x=-sw;pModel.arms[1].rotation.x=sw-(swing>0?Math.sin(swing*Math.PI)*1.6:0);
    const hr=P.hurtT>0;for(const m of pModel.mats)m.color.setRGB(pl,hr?pl*0.4:pl,hr?pl*0.4:pl);}
  setHand();handG.visible=G.view===0&&!P.dead&&!G.hideHud;if(swing>0)swing-=dt*4;const sv=swing>0?Math.sin(swing*Math.PI):0;handG.position.set(-sv*0.1+bobX*0.6,-sv*0.03-bobY*0.5+(P.vy>0?-0.01:0.01)*Math.min(4,Math.abs(P.vy)),-sv*0.16);handG.rotation.set(-sv*0.15,sv*0.26,sv*0.08);
  if(handMesh){const tl=tgt&&false;let hl=Math.max(pl,P.y<60&&!skyExposed(P.x,P.y+1,P.z)?0.35:0);const s=P.inv[P.sel];if(s&&s.id<256&&LIGHT[s.id])hl=1;handMesh.material.color.setScalar(hl);}
  if(P.hurtT>0){$('vig').style.opacity=Math.max(0,P.hurtT*1.6);}else if(G.mode===0&&P.hp<=6)$('vig').style.opacity=0.25+Math.sin(now/300)*0.1;else $('vig').style.opacity=0;
  const camB=getBlock(Math.floor(camera.position.x),Math.floor(camera.position.y+0.05),Math.floor(camera.position.z));const cw=camB===B.WATER,cl=camB===B.LAVA;$('water').style.display=cw?'block':'none';$('lavaov').style.display=cl?'block':'none';
  let caveF=0;if(P.y<SEA+6&&!skyExposed(P.x,P.y+1.6,P.z)){const top=topSolid(Math.floor(P.x),Math.floor(P.z));caveF=clamp((top-P.y-5)/9,0,1);}G.caveF=(G.caveF||0)+(caveF-(G.caveF||0))*Math.min(1,dt*2);
  if(!G.paused){updateRain(dt,camera.position.x,camera.position.y,camera.position.z);if(cw)rainMesh.visible=false;G.rainS=(G.rainS||0)-dt;if(G.rain>0.15&&!G.snow&&G.rainS<=0&&G.caveF<0.5){G.rainS=0.9;sfx.ambient('rain');}}
  updateSky(G.paused?0:dt,camera.position.x,camera.position.y,camera.position.z,G.caveF,cw,cl);
  {const bm=G.bossM;const show_=bm&&!bm.dead&&Math.hypot(bm.x-P.x,bm.z-P.z)<40;$('boss').style.display=show_?'block':'none';if(show_)$('bossf').style.width=Math.max(0,bm.hp/bm.d.hp*100)+'%';}
  refreshBars();$('hint').style.display=(!document.pointerLockElement&&!AUTO&&!gui.open&&!G.paused&&!P.dead)?'block':'none';$('cross').style.display=G.view===0?'block':'none';
  if(G.debug){colInfo(Math.floor(P.x),Math.floor(P.z));$('debug').textContent='Loamlands 1.2  Day '+(G.day||1)+'  '+fps+' fps\nXYZ: '+P.x.toFixed(2)+' / '+P.y.toFixed(2)+' / '+P.z.toFixed(2)+'\nBiome: '+(W.dim?'The Emberdeep':BIONAME[CI_b])+'\nChunks: '+W.chunks.size+'  Mobs: '+mobs.length+'  Drops: '+drops.length+'\nTime: '+((G.time*24+6)%24).toFixed(1)+'h  Seed: '+(G.world?G.world.seed:'')+(AUTO?'\ngen '+(W.tGen/W.nGen).toFixed(1)+'ms mesh '+(W.tMesh/W.nMesh).toFixed(1)+'ms\nbot t='+bot.t.toFixed(2)+' playT='+G.playT.toFixed(2)+' on='+bot.on+' fwd='+input.fwd+' v='+P.vx.toFixed(2)+','+P.vz.toFixed(2)+' g='+P.onGround:'')+'\nLooking at: '+(tgt?BL[tgt.id].name+' '+tgt.x+','+tgt.y+','+tgt.z:'-');}
  renderer.render(scene,camera);}
// ---------- boot ----------
initUI();
if(AUTO){const aw={id:'auto',name:'Autoplay World',seed:Q.get('seed')||'loamlands',mode:Q.get('mode')==='creative'?1:0,last:Date.now()};if(Q.get('persist')){const l=getWorlds();if(!l.find(w=>w.id==='auto')){l.push(aw);putWorlds(l);}}startWorld(aw,!Q.get('persist'));G.ff=+Q.get('ff')||0;if(Q.get('rd'))opts.rd=+Q.get('rd');else opts.rd=Math.min(opts.rd,7);if(Q.get('debug')){G.debug=true;$('debug').style.display='block';}}
else{startMenuWorld();const s=Q.get('screen');show(s&&SCREENS.includes(s)?s:'title');if(s==='worlds')renderWorlds();if(s==='options')syncOpts();}
if(Q.get('test')==='menu'){if(Q.get('rd'))opts.rd=+Q.get('rd');{const mk=document.createElement('div');mk.style.cssText='position:fixed;right:4px;bottom:4px;z-index:99;color:#ff0;font:14px monospace;background:#000';document.body.appendChild(mk);let n=0;setInterval(()=>{mk.textContent='state='+G.state+' screen='+curScreen+' tick='+(n++)+' P='+P.x+','+P.y+','+P.z+' ch='+W.chunks.size+' ld='+(G.loadN||0)+' disp='+$('loading').style.display;},100);}const ck=s=>{const e=document.querySelector(s);if(e)e.click();};setTimeout(()=>ck('#title [data-go=worlds]'),500);setTimeout(()=>ck('#worlds [data-go=create]'),900);setTimeout(()=>{$('wname').value='Menu Test';$('wseed').value='menu-seed';ck('#wcreate');},1300);
  if(Q.get('quit'))setTimeout(()=>{pauseGame();ck('#pquit');setTimeout(()=>ck('#title [data-go=worlds]'),400);if(Q.get('quit')==='2')setTimeout(()=>ck('#wplay'),800);},+Q.get('at')||6000);}
frame();
