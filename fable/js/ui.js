'use strict';
const opts=Object.assign({rd:10,fov:70,sens:100,volume:0.6},(()=>{try{return JSON.parse(localStorage.getItem('ll_opts')||'{}');}catch(e){return{};}})());
function renderRecipes(){const e=$('rlist');if(e._done)return;e._done=1;let h='';const seen={};for(const rc of RECIPES){const k=rc.out[0]+':'+JSON.stringify(rc.key);if(seen[k])continue;seen[k]=1;let g='';for(let y=0;y<3;y++)for(let x=0;x<3;x++){const ch=rc.pat[y]&&rc.pat[y][x];let id=ch&&ch!==' '?rc.key[ch]:null;if(Array.isArray(id))id=id[0];g+='<div style="width:24px;height:24px;background:#3b4551 '+(id?'url('+iconURL(id)+') center/20px 20px no-repeat':'')+';border:1px solid #1b2128;image-rendering:pixelated"></div>';}
    h+='<div style="display:flex;align-items:center;gap:6px;background:#262d36;border:2px solid #3a4550;padding:4px 6px"><div style="display:grid;grid-template-columns:repeat(3,24px)">'+g+'</div><span style="color:#93a1ae">&#10140;</span><div style="width:32px;height:32px;background:url('+iconURL(rc.out[0])+') center/32px 32px no-repeat;image-rendering:pixelated;flex:0 0 32px"></div><div style="font-size:18px;line-height:1">'+(rc.out[1]>1?rc.out[1]+' x ':'')+IT[rc.out[0]].name+'</div></div>';}
  e.innerHTML=h;}
const SCREENS=['recipes','title','worlds','create','options','quit','pause','died','loading','gui'];
let curScreen=null,optsBack='title';
function show(id){for(const s of SCREENS)$(s).style.display=s===id?'flex':'none';curScreen=id;$('hud').style.visibility=(id==='recipes'||id==='options')?'hidden':'visible';if(id!=='gui'){$('cursor').style.display='none';$('tip').style.display='none';}}
// ---------- HUD icons ----------
function patIcon(pat,fn){const h=pat.length,w=pat[0].length;const c=document.createElement('canvas');c.width=w+2;c.height=h+2;const x=c.getContext('2d');
  for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++)if(pat[y][xx]!=='.'){x.fillStyle='#16181c';x.fillRect(xx,y,3,3);}
  for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++)if(pat[y][xx]!=='.'){const col=fn(xx,y,pat[y][xx]);if(col){x.fillStyle=col;x.fillRect(xx+1,y+1,1,1);}}return c.toDataURL();}
const HEART=['.XX...XX.','XXXX.XXXX','XXXXXXXXX','XXXXXXXXX','.XXXXXXX.','..XXXXX..','...XXX...','....X....'];
const MEAT=['....XXX..','..XXXXXX.','.XXXXXXXX','.XXXXXXXX','.XXXXXXX.','..XXXXX..','.XX......','XX.......'];
const BUB=['..XXXX..','.X....X.','X..X...X','X.X....X','X......X','X......X','.X....X.','..XXXX..'];
const hcol=(x,y)=>(x<3&&y<3&&y>0&&x>0)?'#ff9a9a':y>4?'#b81818':'#e82828';
const mcol=(x,y)=>y>5&&x<3?'#f0ead8':(x+y<6?'#d89a5a':y>3?'#8a4a20':'#b8702e');
const ICON={h2:patIcon(HEART,hcol),h1:patIcon(HEART,(x,y)=>x<5?hcol(x,y):'#3a2226'),h0:patIcon(HEART,()=>'#3a2226'),
  f2:patIcon(MEAT,mcol),f1:patIcon(MEAT,(x,y)=>x>3?mcol(x,y):'#33291f'),f0:patIcon(MEAT,()=>'#33291f'),b:patIcon(BUB,(x,y)=>(x===3&&y===2)||(x===2&&y===3)?'#fff':'#7ac0ff')};
function stackHTML(s){if(!s)return'';const it=IT[s.id];let h='<div class="ic" style="background-image:url('+iconURL(s.id)+')'+(s.e?';filter:drop-shadow(0 0 3px #c060ff) drop-shadow(0 0 2px #e0a0ff)':'')+'"></div>';if(s.n>1)h+='<div class="cnt">'+s.n+'</div>';
  if(it.tool&&s.d){const f=1-s.d/it.tool.dur;h+='<div class="dur"><i style="width:'+(f*100)+'%;background:hsl('+(f*120)+',90%,50%)"></i></div>';}return h;}
let hudKey='';
function refreshHUD(){let h='';for(let i=0;i<9;i++)h+='<div class="hs'+(i===P.sel?' sel':'')+'">'+stackHTML(P.inv[i])+'</div>';$('hotbar').innerHTML=h;hudKey='';}
const SHIELD=patIcon(['XXXXXXX','XXXXXXX','XXXXXXX','XXXXXXX','.XXXXX.','..XXX..','...X...'],(x,y)=>x<3?'#e8e8e8':'#a8a8b0');
function refreshBars(){const av=P.arm&&P.arm[0]?IT[P.arm[0].id].armor:0;const k=G.mode+','+Math.ceil(P.hp)+','+P.food+','+Math.ceil(P.air)+','+av+','+(P.xp||0);{const xl=xpLevel(P.xp||0);if(G.lastLvl!==undefined&&xl.l>G.lastLvl&&G.state==='play')sfx.levelup();G.lastLvl=xl.l;$('xpfill').style.width=(xl.f*100)+'%';$('xplvl').textContent=xl.l>0?xl.l:'';}
  if(k!==hudKey){let ah='';for(let i=0;i<Math.round(av*10);i++)ah+='<img src="'+SHIELD+'">';$('armor').innerHTML=G.mode===1?'':ah;}if(k===hudKey)return;hudKey=k;if(G.mode===1){$('bars').style.display='none';return;}$('bars').style.display='block';
  let a='',b='',c='';const hp=Math.ceil(P.hp);for(let i=0;i<10;i++){a+='<img src="'+(hp>=i*2+2?ICON.h2:hp===i*2+1?ICON.h1:ICON.h0)+'">';b+='<img src="'+(P.food>=i*2+2?ICON.f2:P.food===i*2+1?ICON.f1:ICON.f0)+'">';}
  if(P.air<10)for(let i=0;i<Math.ceil(P.air);i++)c+='<img src="'+ICON.b+'">';$('hearts').innerHTML=a;$('food').innerHTML=b;$('air').innerHTML=c;}
let nameT=null;function showItemName(){const s=P.inv[P.sel];const e=$('itemname');if(!s){e.style.opacity=0;return;}e.textContent=(s.e?'Enchanted ':'')+IT[s.id].name;e.style.color=s.e?'#d8a0ff':'#fff';e.style.opacity=1;clearTimeout(nameT);nameT=setTimeout(()=>e.style.opacity=0,1800);}
let toastT=null;function toast(t){const e=$('toast');e.textContent=t;e.style.opacity=1;clearTimeout(toastT);toastT=setTimeout(()=>e.style.opacity=0,2500);}
// ---------- inventory ops ----------
function addItemRange(s,a,b){const mx=IT[s.id].stack;if(mx>1)for(let i=a;i<b&&s.n>0;i++){const t=P.inv[i];if(t&&t.id===s.id&&t.n<mx){const k=Math.min(mx-t.n,s.n);t.n+=k;s.n-=k;}}
  for(let i=a;i<b&&s.n>0;i++)if(!P.inv[i]){const k=Math.min(mx,s.n);P.inv[i]={id:s.id,n:k};if(s.d)P.inv[i].d=s.d;if(s.e)P.inv[i].e=s.e;s.n-=k;}return s.n<=0;}
function addItem(s){const r=addItemRange(s,0,36);refreshHUD();if(gui.open)refreshGui();return r;}
function canFit(s){const mx=IT[s.id].stack;for(let i=0;i<36;i++){const t=P.inv[i];if(!t||(t.id===s.id&&t.n<mx))return true;}return false;}
// ---------- GUI ----------
const gui={open:false,type:null,craft:new Array(9).fill(null),cw:2,cursor:null,furn:null,fkey:null};
const slotDiv=(k,i)=>'<div class="slot" data-k="'+k+'" data-i="'+i+'"></div>';
function openGui(type,key){gui.open=true;gui.type=type;gui.cw=type==='table'?3:2;gui.craft.fill(null);
  if(type==='furnace'){gui.fkey=key;gui.furn=W.tiles[key]||(W.tiles[key]={s:[null,null,null],burn:0,burnMax:0,cook:0});}
  let t='';const grid=(w)=>{let g='<div class="slots" style="grid-template-columns:repeat('+w+',48px)">';for(let i=0;i<w*w;i++)g+=slotDiv('craft',i);return g+'</div>';};
  if(type==='inv'){t='<div id="pmodel"><canvas id="pcv" width="24" height="34" class="px" style="width:72px;height:102px"></canvas></div><div><div class="gt">Armor</div>'+slotDiv('arm',0)+'</div><div><div class="gt">Crafting</div>'+grid(2)+'</div><div class="arrow">&#10140;</div>'+slotDiv('res',0);$('guiTitle').textContent='';}
  else if(type==='table'){t=grid(3)+'<div class="arrow">&#10140;</div>'+slotDiv('res',0);$('guiTitle').textContent='Crafting';}
  else if(type==='furnace'){t='<div>'+slotDiv('furn',0)+'<div class="flame"><i id="fflame"></i></div>'+slotDiv('furn',1)+'</div><div class="arrow">&#10140;<div class="prog" id="fprog">&#10140;</div></div>'+slotDiv('furn',2);$('guiTitle').textContent='Furnace';}
  else if(type==='chest'){if(!W.tiles[key]){const tl=W.tiles[key]={c:1,s:new Array(27).fill(null)};const p=key.split(',').map(Number),md=W.mods.get(ckey(p[0]>>4,p[2]>>4)),idx=(p[1]<<8)|((p[2]&15)<<4)|(p[0]&15);
      if(!(md&&md.has(idx))){const L=[[283,3],[281,6],[258,3],[279,8],[269,3],[47,2],[257,6],[22,6],[259,1],[276,1],[280,1],[260,1],[282,5]],r=rng32(hashStr(key)^W.seed),n=3+((r()*4)|0);for(let i=0;i<n;i++){const l=L[(r()*L.length)|0];tl.s[(r()*27)|0]={id:l[0],n:1+((r()*l[1])|0)};}}}
    gui.chest=W.tiles[key];t='<div class="slots">';for(let i=0;i<27;i++)t+=slotDiv('chest',i);t+='</div>';$('guiTitle').textContent='Chest';}
  else if(type==='trade'){t='<div id="tlist">';TRADES.forEach((tr,i)=>{t+='<div class="trow" data-t="'+i+'" title="Give '+tr[0][1]+' x '+IT[tr[0][0]].name+', get '+tr[1][1]+' x '+IT[tr[1][0]].name+'"><div class="tslot">'+stackHTML({id:tr[0][0],n:tr[0][1]})+'</div><div class="tarr">&#10140;</div><div class="tslot">'+stackHTML({id:tr[1][0],n:tr[1][1]})+'</div></div>';});t+='</div>';$('guiTitle').textContent='Settler Trades - click an offer to trade';}
  else{t='<div id="cregrid">';for(let i=0;i<CREATIVE_ITEMS.length;i++)t+=slotDiv('cre',i);t+='</div>';$('guiTitle').textContent='Creative Inventory - every block and item';}
  $('guiTop').innerHTML=t;let m='';for(let i=9;i<36;i++)m+=slotDiv('inv',i);$('guiMain').innerHTML=m;m='';for(let i=0;i<9;i++)m+=slotDiv('inv',i);$('guiHot').innerHTML=m;
  if(type==='inv'){const x=$('pcv').getContext('2d');const R=(c,a,b,w,h)=>{x.fillStyle=c;x.fillRect(a,b,w,h);};R('#e0ac7e',8,1,8,8);R('#26262e',8,0,8,3);R('#26262e',8,3,1,2);R('#26262e',15,3,1,2);R('#d9862b',8,3,8,1);R('#fff',9,5,2,1);R('#fff',13,5,2,1);R('#4a2a7a',10,5,1,1);R('#4a2a7a',13,5,1,1);R('#a8523a',11,7,2,1);
    R('#d9862b',8,9,8,12);R('#cc7a22',4,9,4,12);R('#cc7a22',16,9,4,12);R('#e0ac7e',4,18,4,3);R('#e0ac7e',16,18,4,3);R('#2c3a5a',8,21,4,12);R('#263350',12,21,4,12);}
  show('gui');refreshGui();if(document.pointerLockElement)document.exitPointerLock();}
function closeGui(){if(!gui.open)return;const back=s=>{if(s&&!addItemRange(s,0,36))spawnDrop(P.x,P.y+1.3,P.z,s,-Math.sin(P.yaw)*4,2,-Math.cos(P.yaw)*4,1.5);};
  for(let i=0;i<9;i++){back(gui.craft[i]);gui.craft[i]=null;}back(gui.cursor);gui.cursor=null;gui.open=false;gui.trader=null;show(null);refreshHUD();lockPointer();}
// ---------- settler trades: [[give id, n], [get id, n]] ----------
const TRADES=[[[257,2],[22,8]],[[258,1],[279,8]],[[259,1],[262,4]],[[4,16],[258,1]],[[282,10],[258,1]],[[270,5],[283,1]],[[259,3],[260,1]],[[260,1],[42,1]],[[258,6],[288,1]]];
const GREET=['Good day, traveler! Have a look at my wares.','Fresh goods, fair prices.','Mind the Emberlings after dark.','They say obsidian gates lead somewhere... warm.','Rimewalkers roam the Frost Spires. Bring a sword.'];
function countItem(id){let n=0;for(const s of P.inv)if(s&&s.id===id)n+=s.n;return n;}
function takeItem(id,n){for(let i=35;i>=0&&n>0;i--){const s=P.inv[i];if(s&&s.id===id){const k=Math.min(n,s.n);s.n-=k;n-=k;if(s.n<=0)P.inv[i]=null;}}}
function openTrade(m){if(!m||m.dead)return;m.yaw=Math.atan2(P.x-m.x,P.z-m.z);m.moving=false;m.aiT=4;sfx.mob('settler',m.x,m.y,m.z);for(const k in input)input[k]=false;openGui('trade');gui.trader=m;toast('Settler: '+GREET[(Math.random()*GREET.length)|0]);}
function doTrade(i){const tr=TRADES[i];if(!tr||!gui.open||gui.type!=='trade')return;const m=gui.trader;
  if(countItem(tr[0][0])<tr[0][1]){sfx.click();toast('Settler: You need '+tr[0][1]+' x '+IT[tr[0][0]].name+' for that.');return;}
  takeItem(tr[0][0],tr[0][1]);const out={id:tr[1][0],n:tr[1][1]};if(!addItemRange(out,0,36))spawnDrop(P.x,P.y+1.3,P.z,out,0,2,0,0.5);sfx.pop();
  if(m&&!m.dead){m.moving=false;m.aiT=4;sfx.mob('settler',m.x,m.y,m.z);puff(m.x,m.y+2.25,m.z,0x5ad85a,10,0.5,1.5,-1,0.9);}
  adv('trade');toast('Settler: A fair trade! Here, '+tr[1][1]+' x '+IT[tr[1][0]].name+'.');refreshGui();refreshHUD();}
function slotArr(k){return k==='inv'?P.inv:k==='arm'?P.arm:k==='craft'?gui.craft:k==='chest'?gui.chest.s:gui.furn.s;}
function addToArr(arr,s){const mx=IT[s.id].stack;if(mx>1)for(let i=0;i<arr.length&&s.n>0;i++){const t=arr[i];if(t&&t.id===s.id&&t.n<mx){const k=Math.min(mx-t.n,s.n);t.n+=k;s.n-=k;}}for(let i=0;i<arr.length&&s.n>0;i++)if(!arr[i]){arr[i]={id:s.id,n:s.n};if(s.d)arr[i].d=s.d;s.n=0;}return s.n<=0;}
function craftGrid(){if(gui.cw===3)return gui.craft;return gui.craft.slice(0,4);}
function refreshGui(){if(!gui.open)return;document.querySelectorAll('#gui .slot').forEach(e=>{const k=e.dataset.k,i=+e.dataset.i;let s;
    if(k==='res'){s=matchRecipe(craftGrid(),gui.cw);}else if(k==='cre'){s={id:CREATIVE_ITEMS[i],n:1};}else s=slotArr(k)[i];const h=stackHTML(s);if(e._h!==h){e.innerHTML=h;e._h=h;}});
  const c=$('cursor');if(gui.cursor){c.style.display='block';c.innerHTML=stackHTML(gui.cursor);}else c.style.display='none';
  if(gui.type==='trade')document.querySelectorAll('#gui .trow').forEach(e=>{const tr=TRADES[+e.dataset.t];e.classList.toggle('no',countItem(tr[0][0])<tr[0][1]);});
  if(gui.type==='furnace'){const f=gui.furn;$('fflame').style.height=(f.burn>0?f.burn/f.burnMax*100:0)+'%';$('fprog').style.width=(f.cook/10*100)+'%';}}
function slotClick(k,i,btn,shift){sfx.click();let c=gui.cursor;
  if(k==='cre'){const id=CREATIVE_ITEMS[i],mx=IT[id].stack;if(shift)addItemRange({id,n:mx},0,36);else if(c&&c.id===id&&btn===0&&c.n<mx)c.n++;else if(c)gui.cursor=null;else gui.cursor={id,n:btn===2?1:mx};}
  else if(k==='res'){let guard=0;do{const r=matchRecipe(craftGrid(),gui.cw);if(!r)break;const mx=IT[r.id].stack;
      if(shift){if(!canFit(r))break;addItemRange({id:r.id,n:r.n},0,36);}else if(!c)c=gui.cursor={id:r.id,n:r.n};else if(c.id===r.id&&c.n+r.n<=mx)c.n+=r.n;else break;
      for(let j=0;j<9;j++){const s=gui.craft[j];if(s&&--s.n<=0)gui.craft[j]=null;}}while(shift&&++guard<64);}
  else if(k==='arm'&&c&&!IT[c.id].armor){}
  else if(k==='inv'&&shift&&gui.type==='inv'&&P.inv[i]&&IT[P.inv[i].id].armor&&!P.arm[0]){P.arm[0]=P.inv[i];P.inv[i]=null;}
  else{const arr=slotArr(k);const s=arr[i];const isOut=k==='furn'&&i===2;const mx=s?IT[s.id].stack:c?IT[c.id].stack:64;
    if(shift){if(s){if(k==='inv'){if(gui.type==='chest'){if(addToArr(gui.chest.s,s))arr[i]=null;}else if(gui.type==='furnace'){const t=SMELT[s.id]?0:IT[s.id].fuel?1:-1;if(t>=0){const f=gui.furn.s;if(!f[t]){f[t]=s;arr[i]=null;}else if(f[t].id===s.id){const m=Math.min(mx-f[t].n,s.n);f[t].n+=m;s.n-=m;if(!s.n)arr[i]=null;}}}
          else{arr[i]=null;if(!(i<9?addItemRange(s,9,36):addItemRange(s,0,9)))arr[i]=s;}}else{arr[i]=null;if(!addItemRange(s,0,36))arr[i]=s;}}}
    else if(btn===0){if(!c){arr[i]=null;gui.cursor=s||null;}else if(isOut){if(s&&s.id===c.id&&c.n+s.n<=mx){c.n+=s.n;arr[i]=null;}}
      else if(s&&s.id===c.id&&mx>1){const m=Math.min(c.n,mx-s.n);s.n+=m;c.n-=m;if(!c.n)gui.cursor=null;}else{arr[i]=c;gui.cursor=s||null;}}
    else{if(!c){if(s){const h=Math.ceil(s.n/2);gui.cursor={id:s.id,n:h};if(s.d)gui.cursor.d=s.d;s.n-=h;if(!s.n)arr[i]=null;}}
      else if(!isOut){if(!s){arr[i]={id:c.id,n:1};if(c.d)arr[i].d=c.d;c.n--;}else if(s.id===c.id&&s.n<mx){s.n++;c.n--;}if(c.n<=0)gui.cursor=null;}}}
  refreshGui();refreshHUD();}
function tickFurnaces(dt){for(const key in W.tiles){const t=W.tiles[key],s=t.s;if(t.c)continue;
    if(t.g!==undefined){const p=key.split(',').map(Number);if(!isLoaded(p[0],p[2]))continue;t.g-=dt;if(t.g<=0){delete W.tiles[key];const gb=getBlock(p[0],p[1],p[2]);if(gb===B.SAPLING)growTree(p[0],p[1],p[2]);else if(gb>=70&&gb<73){setBlock(p[0],p[1],p[2],gb+1);if(gb+1<73)W.tiles[key]={g:14+Math.random()*22};}}continue;}const out=s[0]&&SMELT[s[0].id];const can=out&&(!s[2]||(s[2].id===out&&s[2].n<64));const was=t.burn>0;
    if(t.burn>0)t.burn-=dt;if(t.burn<=0&&can&&s[1]&&IT[s[1].id].fuel){t.burn=t.burnMax=IT[s[1].id].fuel;if(--s[1].n<=0)s[1]=null;}
    if(t.burn>0&&can){t.cook+=dt;if(t.cook>=10){t.cook=0;if(s[2])s[2].n++;else s[2]={id:out,n:1};if(--s[0].n<=0)s[0]=null;}}else t.cook=Math.max(0,t.cook-dt*2);
    if(was!==(t.burn>0)){const p=key.split(',').map(Number);const id=getBlock(p[0],p[1],p[2]);if(id===B.FURNACE||id===B.FURNACE_LIT)setBlock(p[0],p[1],p[2],t.burn>0?B.FURNACE_LIT:B.FURNACE,getMeta(p[0],p[1],p[2]),true);}}
  if(gui.open&&gui.type==='furnace')refreshGui();}
// ---------- worlds ----------
function getWorlds(){try{return JSON.parse(localStorage.getItem('ll_worlds')||'[]');}catch(e){return[];}}
function putWorlds(l){try{localStorage.setItem('ll_worlds',JSON.stringify(l));}catch(e){}}
let selWorld=null,newMode=0;
function renderWorlds(){const l=getWorlds().sort((a,b)=>b.last-a.last);if(!l.find(w=>w.id===selWorld))selWorld=l[0]?l[0].id:null;let h='';
  for(const w of l)h+='<div class="wrow'+(w.id===selWorld?' sel':'')+'" data-id="'+w.id+'"><div class="ic2" style="background-image:url('+iconURL(w.mode?39:1)+')"></div><div><b>'+w.name.replace(/</g,'&lt;')+'</b><small>'+(w.mode?'Creative':'Survival')+' Mode &middot; Seed: '+String(w.seed).replace(/</g,'&lt;')+' &middot; '+new Date(w.last).toLocaleString()+'</small></div></div>';
  $('wlist').innerHTML=h||'<div style="margin:auto;color:#7d8a96;text-align:center">No worlds yet.<br>Create a new world to begin your adventure!</div>';}
function initUI(){
  document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{sfx.init();sfx.click();const g=b.dataset.go;if(g==='options'){optsBack=curScreen;syncOpts();}show(g);if(g==='worlds')renderWorlds();if(g==='recipes')renderRecipes();if(g==='create'){$('wname').value='New World';$('wseed').value='';}if(g==='quit'){try{window.close();}catch(e){}}}));
  $('wlist').addEventListener('click',e=>{const r=e.target.closest('.wrow');if(r){selWorld=r.dataset.id;renderWorlds();sfx.click();}});
  $('wlist').addEventListener('dblclick',e=>{if(e.target.closest('.wrow'))$('wplay').click();});
  $('wplay').onclick=()=>{sfx.init();sfx.click();const w=getWorlds().find(w=>w.id===selWorld);if(w)startWorld(w);};
  $('wdel').onclick=()=>{sfx.click();if(!selWorld)return;if(!confirm('Delete this world forever?'))return;putWorlds(getWorlds().filter(w=>w.id!==selWorld));localStorage.removeItem('ll_w_'+selWorld);renderWorlds();};
  $('wmode').onclick=()=>{sfx.click();newMode=1-newMode;$('wmode').textContent='Game Mode: '+(newMode?'Creative':'Survival');};
  $('wcreate').onclick=()=>{sfx.init();sfx.click();const seed=$('wseed').value.trim()||String((Math.random()*1e9)|0);const w={id:Date.now().toString(36),name:$('wname').value.trim()||'New World',seed,mode:newMode,last:Date.now()};const l=getWorlds();l.push(w);putWorlds(l);selWorld=w.id;startWorld(w);};
  const O=[['rd','Render Distance',v=>v+' chunks'],['fov','Field of View',v=>v+'°'],['sens','Mouse Sensitivity',v=>v+'%'],['vol','Volume',v=>v+'%']];
  window.syncOpts=()=>{$('o_rd').value=opts.rd;$('o_fov').value=opts.fov;$('o_sens').value=opts.sens;$('o_vol').value=Math.round(opts.volume*100);for(const o of O)$('o_'+o[0]+'_l').textContent=o[1]+': '+o[2]($('o_'+o[0]).value);};
  for(const o of O)$('o_'+o[0]).addEventListener('input',()=>{opts.rd=+$('o_rd').value;opts.fov=+$('o_fov').value;opts.sens=+$('o_sens').value;opts.volume=$('o_vol').value/100;sfx.setVol(opts.volume);syncOpts();try{localStorage.setItem('ll_opts',JSON.stringify(opts));}catch(e){}});
  syncOpts();const dsync=()=>$('odiff').textContent='Difficulty: '+(opts.peaceful?'Peaceful (no monsters)':'Normal');dsync();
  $('odiff').onclick=()=>{sfx.click();opts.peaceful=!opts.peaceful;dsync();try{localStorage.setItem('ll_opts',JSON.stringify(opts));}catch(e){}};
  $('odone').onclick=()=>{sfx.click();show(optsBack);};
  $('presume').onclick=()=>{sfx.click();resumeGame();};
  $('pmode').onclick=()=>{sfx.click();setMode(1-G.mode);};
  $('pquit').onclick=()=>{sfx.click();quitToTitle();};
  $('respawn').onclick=()=>{sfx.click();respawn();};
  $('dquit').onclick=()=>{sfx.click();respawn(true);quitToTitle();};
  $('tradebtn').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();sfx.init();if(G.state==='play'&&!G.paused&&!P.dead&&!gui.open&&G.nearSettler)openTrade(G.nearSettler);});
  const g=$('gui');g.addEventListener('mousedown',e=>{const tw=e.target.closest('.trow');if(tw){e.preventDefault();if(!gui.cursor)doTrade(+tw.dataset.t);return;}const s=e.target.closest('.slot');e.preventDefault();if(s)slotClick(s.dataset.k,+s.dataset.i,e.button,e.shiftKey);
    else if(!e.target.closest('.panel')&&gui.cursor){spawnDrop(P.x,P.y+1.3,P.z,gui.cursor,-Math.sin(P.yaw)*5,2,-Math.cos(P.yaw)*5,1.5);gui.cursor=null;refreshGui();}});
  g.addEventListener('contextmenu',e=>e.preventDefault());
  window.addEventListener('mousemove',e=>{if(!gui.open)return;const c=$('cursor');c.style.left=e.clientX+'px';c.style.top=e.clientY+'px';const s=e.target.closest&&e.target.closest('.slot');const tip=$('tip');let st=null;
    if(s){const k=s.dataset.k,i=+s.dataset.i;st=k==='res'?matchRecipe(craftGrid(),gui.cw):k==='cre'?{id:CREATIVE_ITEMS[i]}:slotArr(k)[i];}
    if(st&&!gui.cursor){tip.style.display='block';tip.textContent=IT[st.id].name;tip.style.left=(e.clientX+16)+'px';tip.style.top=(e.clientY-30)+'px';}else tip.style.display='none';});
}
