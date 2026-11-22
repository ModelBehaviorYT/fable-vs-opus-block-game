'use strict';
const $=id=>document.getElementById(id);
function rng32(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0;}
function hash2(x,z,s){let h=Math.imul(x,374761393)^Math.imul(z,668265263)^Math.imul(s|0,2246822519);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296;}
const clamp=(v,a,b)=>v<a?a:v>b?b:v;

// ================= ATLAS =================
const atlas=document.createElement('canvas');atlas.width=atlas.height=256;
const actx=atlas.getContext('2d',{willReadFrequently:true});
const TILE={};let nTiles=0;const tileAvg=[];
function sh(c,f){return(Math.min(255,((c>>16)&255)*f)|0)<<16|(Math.min(255,((c>>8)&255)*f)|0)<<8|(Math.min(255,(c&255)*f)|0);}
function tile(name,fn){
  const id=nTiles++;TILE[name]=id;const img=actx.createImageData(16,16),d=img.data;const r=rng32(hashStr(name));
  const set=(x,y,c,a)=>{if(x<0||y<0||x>15||y>15)return;const i=(y*16+x)*4;d[i]=(c>>16)&255;d[i+1]=(c>>8)&255;d[i+2]=c&255;d[i+3]=a===undefined?255:a;};
  fn(set,r);actx.putImageData(img,(id%16)*16,((id/16)|0)*16);
  let R=0,G=0,B=0,n=0;for(let i=0;i<1024;i+=4)if(d[i+3]>100){R+=d[i];G+=d[i+1];B+=d[i+2];n++;}
  n=n||1;tileAvg[id]=[R/n/255,G/n/255,B/n/255];
}
function speck(set,r,pal,a){for(let y=0;y<16;y++)for(let x=0;x<16;x++)set(x,y,pal[(r()*pal.length)|0],a);}
const pDirt=(s,r)=>{speck(s,r,[0x8a5a3a,0x7a4e30,0x966544,0x6b432a,0x8a5a3a,0x855636]);for(let i=0;i<5;i++)s((r()*16)|0,(r()*16)|0,0xa87a58);};
const pGrass=(s,r)=>speck(s,r,[0x5fa83c,0x55993a,0x6ab845,0x4c8c33,0x5fa83c,0x64ae40]);
const pStone=(s,r)=>{speck(s,r,[0x8c8c8c,0x878787,0x929292,0x818181]);for(let i=0;i<7;i++){const x=(r()*13)|0,y=(r()*15)|0,l=2+((r()*4)|0);for(let k=0;k<l;k++){s(x+k,y,0x747474);s(x+k,y+1,0x9a9a9a);}}};
function pVor(s,r,n,pal,edge){const pts=[];for(let i=0;i<n;i++)pts.push([r()*16,r()*16,(r()*pal.length)|0]);
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){let d1=99,d2=99,c=0;for(const p of pts){let dx=Math.abs(x-p[0]),dy=Math.abs(y-p[1]);if(dx>8)dx=16-dx;if(dy>8)dy=16-dy;const d=Math.sqrt(dx*dx+dy*dy);if(d<d1){d2=d1;d1=d;c=p[2];}else if(d<d2)d2=d;}
    s(x,y,d2-d1<1.1?edge:sh(pal[c],0.95+r()*0.1));}}
const pCobble=(s,r)=>pVor(s,r,11,[0x9a9a9a,0x8b8b8b,0xa8a8a8,0x7d7d7d],0x565656);
const pPlanks=(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const b=y>>2;let c=sh(0xb58d52,0.93+r()*0.12+(b%2)*0.04);if(y%4===3)c=0x7d5f33;else if(x===(b*7+3)%16)c=0x8a6a3a;s(x,y,c);}};
const pLog=(pal)=>(s,r)=>{for(let x=0;x<16;x++){let c=pal[(r()*pal.length)|0];for(let y=0;y<16;y++){if(r()<0.22)c=pal[(r()*pal.length)|0];s(x,y,c);}}};
const pLogTop=(bark,a,b)=>(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const d=Math.max(Math.abs(x-7.5),Math.abs(y-7.5));s(x,y,d>7?bark:sh((d|0)%2?a:b,0.96+r()*0.08));}};
const pLeaves=(c)=>(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const v=r();if(v<0.13)s(x,y,0,0);else s(x,y,sh(c,v<0.35?0.72:v<0.6?0.88:v<0.85?1:1.16));}};
const pOre=(c)=>(s,r)=>{pStone(s,r);for(let i=0;i<6;i++){const x=1+((r()*13)|0),y=1+((r()*13)|0);s(x,y,c);s(x+1,y,sh(c,1.25));s(x,y+1,sh(c,0.8));if(r()<0.6)s(x+1,y+1,c);s(x+2,y+1,0x6a6a6a);s(x+1,y+2,0x6a6a6a);}};
const pTopOn=(base,top)=>(s,r)=>{base(s,r);for(let x=0;x<16;x++){const d=2+((r()*3)|0);for(let y=0;y<d;y++)s(x,y,top[(r()*top.length)|0]);}};
const GREENS=[0x5fa83c,0x55993a,0x6ab845,0x4c8c33],SNOWS=[0xf4f8fc,0xe8eef6,0xffffff,0xeef3fa];
function pFlower(pc,cc){return(s,r)=>{for(let y=9;y<16;y++)s(7,y,0x3e8a2e);s(6,12,0x4c9c38);s(5,11,0x4c9c38);s(8,13,0x4c9c38);s(9,12,0x4c9c38);
  for(let y=4;y<9;y++)for(let x=5;x<10;x++){const d=Math.abs(x-7)+Math.abs(y-6);if(d<=2)s(x,y,d===0?cc:sh(pc,0.9+r()*0.2));}s(5,4,pc);s(9,4,pc);s(5,8,pc);s(9,8,pc);};}
tile('grass_top',pGrass);tile('dirt',pDirt);tile('grass_side',pTopOn(pDirt,GREENS));tile('stone',pStone);tile('cobble',pCobble);
tile('sand',(s,r)=>speck(s,r,[0xe3d6a0,0xdccf96,0xeadfae,0xd6c88c,0xe3d6a0]));
tile('water',(s,r)=>{speck(s,r,[0x2f62d4,0x3568d8,0x2c5ccc,0x3a70de],170);for(let i=0;i<5;i++){const x=(r()*12)|0,y=(r()*16)|0;for(let k=0;k<4;k++)s(x+k,y,0x6f9cf0,185);}});
tile('log_side',pLog([0x6b5030,0x5c4428,0x77593a,0x4f3a22]));tile('log_top',pLogTop(0x5c4428,0xb8945a,0x9c7a45));
tile('leaves',pLeaves(0x3f8f2c));tile('planks',pPlanks);
tile('bedrock',(s,r)=>speck(s,r,[0x555555,0x333333,0x777777,0x222222,0x444444]));
tile('coal_ore',pOre(0x2a2a2a));tile('iron_ore',pOre(0xd8a882));tile('gold_ore',pOre(0xf4d43c));tile('diamond_ore',pOre(0x58e8e0));
tile('snow',(s,r)=>speck(s,r,SNOWS));tile('snow_side',pTopOn(pDirt,SNOWS));
tile('sandstone_side',(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){let c=0xd9c98e;if(y===0||y===8)c=0xe8dba6;if(y===4||y===5||y===12)c=0xcbb97a;if(y===15||y===7)c=0xb8a468;s(x,y,sh(c,0.96+r()*0.08));}});
tile('sandstone_top',(s,r)=>speck(s,r,[0xdccf96,0xd6c88c,0xe3d6a0]));
tile('gravel',(s,r)=>pVor(s,r,26,[0x8e8782,0x7b7572,0xa09a95,0x6d6763,0x968a80],0x625c58));
tile('glass',(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++)s(x,y,0,0);for(let i=0;i<16;i++){s(i,0,0xd4eef6);s(i,15,0xa8ccd8);s(0,i,0xd4eef6);s(15,i,0xa8ccd8);}
  [[3,4],[4,3],[5,2],[3,6],[4,5],[5,4],[6,3],[11,12],[12,11],[10,13]].forEach(p=>s(p[0],p[1],0xffffff));});
tile('craft_top',(s,r)=>{pPlanks(s,r);for(let i=0;i<16;i++){s(i,0,0x5e4020);s(i,15,0x5e4020);s(0,i,0x5e4020);s(15,i,0x5e4020);if(i>0&&i<15){s(i,5,0x7a5a30);s(i,10,0x7a5a30);s(5,i,0x7a5a30);s(10,i,0x7a5a30);}}});
tile('craft_side',(s,r)=>{pPlanks(s,r);for(let i=0;i<16;i++){s(i,0,0x5e4020);s(i,1,0x6e4c28);s(0,i,0x5e4020);s(15,i,0x5e4020);}
  for(let y=4;y<12;y++)s(4,y,0x4a3418);for(let x=2;x<7;x++){s(x,4,0x9a9a9a);s(x,5,0x7c7c7c);}
  for(let y=4;y<13;y++)s(11,y,0x4a3418);s(10,4,0xb0b0b0);s(12,4,0xb0b0b0);s(10,5,0x8a8a8a);s(12,5,0x8a8a8a);s(11,3,0xb0b0b0);});
const pFurn=(s,r)=>{pVor(s,r,9,[0x8a8a8a,0x7c7c7c,0x969696],0x505050);for(let i=0;i<16;i++){s(i,0,0x5a5a5a);s(i,15,0x4a4a4a);}};
tile('furnace_side',pFurn);tile('furnace_top',(s,r)=>{speck(s,r,[0x707070,0x686868,0x787878]);for(let i=0;i<16;i++){s(i,0,0x505050);s(i,15,0x505050);s(0,i,0x505050);s(15,i,0x505050);}});
const pFront=(lit)=>(s,r)=>{pFurn(s,r);for(let x=3;x<13;x++){s(x,3,0x2a2a2a);s(x,4,0x1c1c1c);}
  for(let y=8;y<14;y++)for(let x=3;x<13;x++){if(y===8&&(x===3||x===12))continue;let c=0x161616;if(lit&&y>9){const v=r();c=y>11?(v<0.5?0xffd23a:0xff9a1a):(v<0.4?0xff7a10:v<0.7?0xe84a0c:0x3a1408);}s(x,y,c);}
  for(let x=3;x<13;x++)s(x,14,0x3c3c3c);};
tile('furnace_front',pFront(false));tile('furnace_lit',pFront(true));
tile('torch',(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++)s(x,y,0,0);for(let y=7;y<16;y++){s(7,y,0x8b6b3d);s(8,y,0x6b4f2a);}s(7,5,0xffe066);s(8,5,0xffc830);s(7,6,0xffc830);s(8,6,0xff9a1a);s(7,4,0xfff6c0);s(8,4,0xffe066);s(7,3,0xffb020);});
tile('lava',(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const v=Math.sin(x*0.8+Math.sin(y*0.8)*2.2)+Math.cos(y*0.75+x*0.3)+r()*0.5;s(x,y,v>1.2?0xffd84a:v>0.4?0xf89422:v>-0.6?0xe8601c:0xc23c10);}});
tile('flower_red',pFlower(0xd8302a,0xf8d030));tile('flower_yellow',pFlower(0xf2d024,0xe08a18));tile('flower_blue',pFlower(0x4a6ee8,0xf4f0c0));
tile('tallgrass',(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++)s(x,y,0,0);for(let i=0;i<9;i++){let x=1+((r()*14)|0);const h=5+((r()*9)|0),c=GREENS[(r()*4)|0];for(let y=15;y>15-h;y--){s(x,y,sh(c,0.8+(15-y)*0.03));if(r()<0.2)x+=r()<0.5?-1:1;}}});
tile('deadbush',(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++)s(x,y,0,0);for(let i=0;i<6;i++){let x=7.5,y=15;const dx=(r()-0.5)*1.4;const h=5+r()*8;for(let k=0;k<h;k++){s(x|0,y|0,r()<0.5?0x8a6a3a:0x6e5028);x+=dx;y-=1;}}});
tile('cactus_side',(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){let c=x%4===1?0x3c7e2c:0x4f9a3a;if(x%4===3&&(y+x)%5===0)c=0xd8e8b0;s(x,y,sh(c,0.95+r()*0.1));}});
tile('cactus_top',(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const d=Math.max(Math.abs(x-7.5),Math.abs(y-7.5));s(x,y,d>6?0x3c7e2c:d>4?0x5aa844:0x4f9a3a);}});
tile('ice',(s,r)=>{speck(s,r,[0xa8cdf5,0x9cc4f0,0xb6d8fa]);for(let i=0;i<6;i++){const x=(r()*12)|0,y=(r()*12)|0;for(let k=0;k<4;k++)s(x+k,y+k,0xd8ecff);}});
tile('bricks',(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const row=y>>2;let c=sh(0x8e8e8e,0.9+r()*0.15);if(y%4===3||(x+(row%2)*4)%8===7)c=0x5c5c5c;else if(y%4===0)c=sh(c,1.12);s(x,y,c);}});
tile('birch_side',(s,r)=>{pLog([0xe4e2d8,0xd8d6cc,0xeeece2])(s,r);for(let i=0;i<9;i++){const x=(r()*13)|0,y=(r()*16)|0;for(let k=0;k<2+((r()*3)|0);k++)s(x+k,y,0x3a3a34);}});
tile('birch_top',pLogTop(0xd8d6cc,0xd8c08a,0xc4aa72));tile('birch_leaves',pLeaves(0x6aa83c));
tile('spruce_side',pLog([0x4a341e,0x3e2a16,0x543c24]));tile('spruce_top',pLogTop(0x3e2a16,0x9a7848,0x80603a));tile('spruce_leaves',pLeaves(0x2c5e3a));
tile('obsidian',(s,r)=>speck(s,r,[0x1a1226,0x241a35,0x120c1c,0x2e2244,0x1a1226]));
tile('wool',(s,r)=>{speck(s,r,[0xf2f2f2,0xe6e6e6,0xfafafa,0xdcdcdc]);});
tile('lumen',(s,r)=>{pVor(s,r,8,[0xffe890,0xffd860,0xfff4c0],0xd89a30);});

const pChest=front=>(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){let c=sh(0x9a6a2c,0.92+r()*0.14);if(x===0||y===0||x===15||y===15)c=0x4a3010;else if(y===5)c=0x5e3e16;else if(x===1||y===1)c=sh(c,1.15);s(x,y,c);}if(front)for(let y=4;y<8;y++)for(let x=7;x<9;x++)s(x,y,y<5?0xe8e8e8:0xb0b0b0);};
tile('chest_side',pChest(false));tile('chest_front',pChest(true));
tile('chest_top',(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){let c=sh(0x9a6a2c,0.92+r()*0.14);if(x===0||y===0||x===15||y===15)c=0x4a3010;else if(x===1||y===1)c=sh(c,1.15);s(x,y,c);}});
const pMetal=c=>(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){let k=sh(c,0.95+r()*0.08);if(x===0||y===0)k=sh(c,1.2);else if(x===15||y===15)k=sh(c,0.68);else if((x+y)%7===0)k=sh(c,1.12);s(x,y,k);}};
tile('iron_block',pMetal(0xd0d0d0));tile('gold_block',pMetal(0xf0c832));tile('diamond_block',pMetal(0x58dcd4));
tile('mossy',(s,r)=>{pCobble(s,r);for(let i=0;i<60;i++)s((r()*16)|0,(r()*16)|0,r()<0.5?0x4c8c33:0x3e7a2a);});
tile('bed_top',(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++)s(x,y,y<5?(x>1&&x<14&&y>0?0xf4f4f0:0xd8d8d0):sh(y===5?0x8a1c1c:0xb82a2a,0.94+r()*0.1));});
tile('bed_side',(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++)s(x,y,y<11?sh(0xb82a2a,0.9+r()*0.1):(y>12&&x>2&&x<13?0x000000:sh(0x9c7a45,0.9+r()*0.1)),y>12&&x>2&&x<13?0:255);});

tile('charge_side',(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){let c=sh(0xc8402a,0.92+r()*0.12);if(y>5&&y<10)c=(y===6||y===9)?0x1a1616:((x+y)%4<2?0xffd23a:0x2a2222);else if(x%4===0)c=sh(c,0.75);s(x,y,c);}});
tile('charge_top',(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const d=Math.hypot(x-7.5,y-7.5);s(x,y,d<1.6?0x2a2222:d<3?0xffd23a:sh(0xc8402a,0.9+r()*0.12+(x%4===0||y%4===0?-0.2:0)));}});
tile('sapling',(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++)s(x,y,0,0);for(let y=9;y<16;y++){s(7,y,0x6b5030);s(8,y,0x5c4428);}for(let y=2;y<11;y++)for(let x=3;x<13;x++){const d=Math.hypot(x-7.5,(y-6)*1.2);if(d<4.6&&r()<0.82)s(x,y,sh(0x3f8f2c,r()<0.3?0.75:r()<0.5?1.2:1));}});

[['wool_r',0xc83a34],['wool_y',0xe8c82c],['wool_b',0x3a5cd0],['wool_g',0x4a9a3a],['wool_k',0x2c2c32]].forEach(w=>tile(w[0],(s,r)=>speck(s,r,[w[1],sh(w[1],0.92),sh(w[1],1.08),sh(w[1],0.85)])));
tile('bookshelf',(s,r)=>{pPlanks(s,r);const cols=[0xb83a2a,0x2a6ab8,0x3a9a4a,0xd8b030,0x7a3a9a,0x8a5a30];for(const y0 of[2,9]){for(let x=1;x<15;x++){const c=cols[(r()*cols.length)|0],hgt=4+((r()*2)|0);for(let y=0;y<6;y++)s(x,y0+y,y<6-hgt?0x3a2a14:(y===6-hgt+1?sh(c,1.3):sh(c,x%2?1:0.85)));}}});
tile('redbrick',(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const row=y>>2;let c=sh(0xa8503c,0.88+r()*0.2);if(y%4===3||(x+(row%2)*4)%8===7)c=0xcfc6b8;s(x,y,c);}});

const pEmber=(s,r)=>{speck(s,r,[0x5a1e1e,0x6a2626,0x4c1818,0x722c2a,0x5a1e1e]);for(let i=0;i<8;i++){const x=(r()*14)|0,y=(r()*14)|0;s(x,y,0x3a1010);s(x+1,y,0x3a1010);s(x,y+1,0x84342e);}};
tile('emberstone',pEmber);
tile('ashsand',(s,r)=>speck(s,r,[0x4a3e3a,0x54463f,0x403632,0x5c4e46]));
tile('emberquartz',(s,r)=>{pEmber(s,r);for(let i=0;i<6;i++){const x=1+((r()*13)|0),y=1+((r()*13)|0);s(x,y,0xfff0d0);s(x+1,y,0xffc860);s(x,y+1,0xff9a30);if(r()<0.5)s(x+1,y+1,0xfff0d0);}});
tile('rift',(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const v=Math.sin(x*0.9+Math.sin(y*0.8)*2.4)+Math.cos(y*0.8-x*0.35)+r()*0.6;s(x,y,v>1.1?0xb8fff0:v>0.3?0x2ee0b8:v>-0.5?0x14a890:0x0c6a70,v>1.1?230:185);}});
tile('redsand',(s,r)=>speck(s,r,[0xc0683a,0xb85e34,0xca7444,0xae562e]));
[['clay_a',0xb5603c],['clay_b',0xd8a070],['clay_c',0x8a4a36],['clay_d',0xe0c8a0]].forEach(w=>tile(w[0],(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++)s(x,y,sh(w[1],0.95+r()*0.08+(y===15?-0.08:0)));}));

const OLIVE=[0x4f7a34,0x466e30,0x587f3a,0x3e642a];
tile('sgrass_top',(s,r)=>speck(s,r,OLIVE));tile('sgrass_side',pTopOn(pDirt,OLIVE));
const pMush=(cap,dot)=>(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++)s(x,y,0,0);for(let y=10;y<16;y++){s(7,y,0xe8e0d0);s(8,y,0xcfc6b4);}for(let y=5;y<11;y++)for(let x=3;x<13;x++){const dx=(x-7.5)/5,dy=(y-10)/5.5;if(dx*dx+dy*dy<1)s(x,y,y===10?sh(cap,0.7):((x*3+y*5)%7===0?dot:cap));}};
tile('mush_r',pMush(0xc83028,0xffffff));tile('mush_b',pMush(0x9a7450,0xb48a62));

tile('farmland',(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++)s(x,y,sh(y%4<2?0x5a3a22:0x4a2e1a,0.92+r()*0.14));});
[0,1,2,3].forEach(st=>tile('crop'+st,(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++)s(x,y,0,0);const hgt=4+st*3.6;for(let i=0;i<7;i++){const x=1+i*2+((r()*2)|0);for(let k=0;k<hgt;k++){const y=15-k;const top=k>hgt-4&&st===3;s(x,y,top?(r()<0.5?0xe8c040:0xc89a28):st===3?0xa8a030:sh(0x4aa838,0.8+k*0.03));if(top&&r()<0.6)s(x+(r()<0.5?-1:1),y,0xd8b030);}}}));

tile('door',(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){let c=sh(0x8a6a38,0.93+r()*0.1);if(x===0||x===15||y===0||y===15)c=0x4a3418;else if((x>2&&x<7||x>8&&x<13)&&(y>2&&y<7||y>8&&y<13))c=sh(0x6e5028,0.95+r()*0.08);s(x,y,c);}s(12,8,0xd8d8d8);s(13,8,0xb0b0b0);});

tile('ladder',(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const rail=x===2||x===3||x===12||x===13,rung=y%4===1&&x>1&&x<14;s(x,y,rail?(x%2?0x6b4f2a:0x8b6b3d):0x9c7a45,rail||rung?255:0);}});

tile('cage',(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const bar=x%4===0||y%4===0||x===15||y===15;s(x,y,bar?((x+y)%2?0x2a3440:0x3a4656):0x101418,bar?255:0);}s(7,7,0xff7a1a);s(8,7,0xffd23a);s(7,8,0xffd23a);s(8,8,0xff7a1a);});
tile('reeds',(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++)s(x,y,0,0);for(const x of[3,7,11]){for(let y=0;y<16;y++){s(x,y,y%5===0?0x6a9a3a:0x8ac850);s(x+1,y,y%5===0?0x5a8a30:0x74b040);}s(x+2,4+x%3,0x8ac850);s(x-1,10-x%4,0x8ac850);}});

// ================= BLOCKS =================
const BL=[];const SOLID=new Uint8Array(256),OPAQUE=new Uint8Array(256),OPAC=new Uint8Array(256),LIGHT=new Uint8Array(256),SHAPE=new Uint8Array(256),REPL=new Uint8Array(256);
REPL[0]=1;
function blk(id,name,tex,o){const t=typeof tex==='string'?[tex,tex,tex]:tex;
  const b=BL[id]=Object.assign({id,name,tex:t.map(n=>TILE[n]),hard:1,tool:null,tier:0,snd:'stone',shape:1,drop:id,dropN:1},o||{});
  SHAPE[id]=b.shape;if(b.shape===1){SOLID[id]=1;OPAQUE[id]=b.trans?0:1;OPAC[id]=b.trans?(b.opac||0):15;}
  else if(b.shape===2){REPL[id]=b.keep?0:1;}else{REPL[id]=1;OPAC[id]=b.opac||0;}
  LIGHT[id]=b.light||0;return id;}
const B={AIR:0,GRASS:1,DIRT:2,STONE:3,COBBLE:4,SAND:5,WATER:6,LOG:7,LEAVES:8,PLANKS:9,BEDROCK:10,COAL_ORE:11,IRON_ORE:12,GOLD_ORE:13,DIAMOND_ORE:14,SNOW:15,SNOWGRASS:16,SANDSTONE:17,GRAVEL:18,GLASS:19,TABLE:20,FURNACE:21,TORCH:22,LAVA:23,FLOWER_R:24,FLOWER_Y:25,TALLGRASS:26,CACTUS:27,ICE:28,BRICKS:29,BIRCH_LOG:30,BIRCH_LEAVES:31,SPRUCE_LOG:32,SPRUCE_LEAVES:33,FURNACE_LIT:34,OBSIDIAN:35,WOOL:36,DEADBUSH:37,FLOWER_B:38,LUMEN:39};
blk(1,'Grass Block',['grass_top','dirt','grass_side'],{hard:0.6,tool:'shovel',snd:'grass',drop:2});
blk(2,'Dirt','dirt',{hard:0.5,tool:'shovel',snd:'gravel'});
blk(3,'Stone','stone',{hard:1.5,tool:'pick',tier:1,drop:4});
blk(4,'Cobblestone','cobble',{hard:2,tool:'pick',tier:1});
blk(5,'Sand','sand',{hard:0.5,tool:'shovel',snd:'sand',falls:1});
blk(6,'Water','water',{shape:3,opac:2,hard:100,drop:0});
blk(7,'Oak Log',['log_top','log_top','log_side'],{hard:2,tool:'axe',snd:'wood'});
blk(8,'Oak Leaves','leaves',{hard:0.2,trans:1,opac:1,snd:'grass',drop:0,leaf:1});
blk(9,'Planks','planks',{hard:2,tool:'axe',snd:'wood'});
blk(10,'Bedrock','bedrock',{hard:-1,drop:0});
blk(11,'Coal Ore','coal_ore',{hard:3,tool:'pick',tier:1,drop:257});
blk(12,'Iron Ore','iron_ore',{hard:3,tool:'pick',tier:2});
blk(13,'Gold Ore','gold_ore',{hard:3,tool:'pick',tier:3});
blk(14,'Diamond Ore','diamond_ore',{hard:3,tool:'pick',tier:3,drop:260});
blk(15,'Snow Block','snow',{hard:0.3,tool:'shovel',snd:'snow'});
blk(16,'Snowy Grass',['snow','dirt','snow_side'],{hard:0.6,tool:'shovel',snd:'snow',drop:2});
blk(17,'Sandstone',['sandstone_top','sandstone_top','sandstone_side'],{hard:0.8,tool:'pick',tier:1});
blk(18,'Gravel','gravel',{hard:0.6,tool:'shovel',snd:'gravel',falls:1});
blk(19,'Glass','glass',{hard:0.3,trans:1,snd:'glass',drop:0});
blk(20,'Crafting Table',['craft_top','planks','craft_side'],{hard:2.5,tool:'axe',snd:'wood'});
blk(21,'Furnace',['furnace_top','furnace_top','furnace_side','furnace_front'],{hard:3.5,tool:'pick',tier:1});
blk(22,'Torch','torch',{shape:2,hard:0,light:14,snd:'wood',keep:1});
blk(23,'Lava','lava',{shape:3,opac:15,light:15,hard:100,drop:0});
blk(24,'Red Flower','flower_red',{shape:2,hard:0,snd:'grass'});
blk(25,'Yellow Flower','flower_yellow',{shape:2,hard:0,snd:'grass'});
blk(26,'Tall Grass','tallgrass',{shape:2,hard:0,snd:'grass',drop:0});
blk(27,'Cactus',['cactus_top','cactus_top','cactus_side'],{hard:0.4,snd:'cloth',hurts:1});
blk(28,'Ice','ice',{hard:0.5,tool:'pick',snd:'glass',drop:0});
blk(29,'Stone Bricks','bricks',{hard:1.5,tool:'pick',tier:1});
blk(30,'Birch Log',['birch_top','birch_top','birch_side'],{hard:2,tool:'axe',snd:'wood'});
blk(31,'Birch Leaves','birch_leaves',{hard:0.2,trans:1,opac:1,snd:'grass',drop:0,leaf:1});
blk(32,'Spruce Log',['spruce_top','spruce_top','spruce_side'],{hard:2,tool:'axe',snd:'wood'});
blk(33,'Spruce Leaves','spruce_leaves',{hard:0.2,trans:1,opac:1,snd:'grass',drop:0,leaf:1});
blk(34,'Furnace',['furnace_top','furnace_top','furnace_side','furnace_lit'],{hard:3.5,tool:'pick',tier:1,light:13,drop:21});
blk(35,'Obsidian','obsidian',{hard:50,tool:'pick',tier:4});
blk(36,'Wool','wool',{hard:0.8,snd:'cloth'});
blk(37,'Dead Bush','deadbush',{shape:2,hard:0,snd:'grass',drop:256});
blk(38,'Blue Flower','flower_blue',{shape:2,hard:0,snd:'grass'});
blk(39,'Lumen Block','lumen',{hard:0.3,light:15,snd:'glass'});
blk(40,'Chest',['chest_top','chest_top','chest_side','chest_front'],{hard:2.5,tool:'axe',snd:'wood'});
blk(41,'Block of Iron','iron_block',{hard:5,tool:'pick',tier:2});
blk(42,'Block of Gold','gold_block',{hard:3,tool:'pick',tier:3});
blk(43,'Block of Diamond','diamond_block',{hard:5,tool:'pick',tier:3});
blk(44,'Mossy Cobblestone','mossy',{hard:2,tool:'pick',tier:1});
blk(45,'Bed',['bed_top','planks','bed_side'],{hard:0.2,snd:'cloth',trans:1,h:0.5625});
blk(46,'Blast Charge',['charge_top','charge_top','charge_side'],{hard:0.1,snd:'grass'});
blk(47,'Sapling','sapling',{shape:2,hard:0,snd:'grass',keep:1});
blk(48,'Stone Slab','stone',{hard:1.5,tool:'pick',tier:1,trans:1,h:0.5});
blk(49,'Plank Slab','planks',{hard:1.5,tool:'axe',snd:'wood',trans:1,h:0.5});
blk(50,'Red Wool','wool_r',{hard:0.8,snd:'cloth'});blk(51,'Yellow Wool','wool_y',{hard:0.8,snd:'cloth'});blk(52,'Blue Wool','wool_b',{hard:0.8,snd:'cloth'});blk(53,'Green Wool','wool_g',{hard:0.8,snd:'cloth'});blk(54,'Black Wool','wool_k',{hard:0.8,snd:'cloth'});
blk(55,'Bookshelf',['planks','planks','bookshelf'],{hard:1.5,tool:'axe',snd:'wood'});
blk(56,'Bricks','redbrick',{hard:2,tool:'pick',tier:1});
blk(57,'Emberstone','emberstone',{hard:0.5,tool:'pick',tier:1});
blk(58,'Ash Sand','ashsand',{hard:0.5,tool:'shovel',snd:'sand'});
blk(59,'Ember Quartz Ore','emberquartz',{hard:2.5,tool:'pick',tier:1,drop:274,dropN:2,light:6});
blk(60,'Rift Gate','rift',{shape:4,hard:0.4,light:12,drop:0,snd:'glass'});REPL[60]=0;
blk(61,'Red Sand','redsand',{hard:0.5,tool:'shovel',snd:'sand',falls:1});
blk(62,'Red Clay','clay_a',{hard:1.2,tool:'pick',tier:1});blk(63,'Pale Clay','clay_b',{hard:1.2,tool:'pick',tier:1});blk(64,'Dark Clay','clay_c',{hard:1.2,tool:'pick',tier:1});blk(65,'White Clay','clay_d',{hard:1.2,tool:'pick',tier:1});
blk(66,'Swamp Grass',['sgrass_top','dirt','sgrass_side'],{hard:0.6,tool:'shovel',snd:'grass',drop:2});
blk(67,'Red Mushroom','mush_r',{shape:2,hard:0,snd:'grass'});blk(68,'Brown Mushroom','mush_b',{shape:2,hard:0,snd:'grass'});
blk(69,'Farmland',['farmland','dirt','dirt'],{hard:0.6,tool:'shovel',snd:'gravel',drop:2,trans:1,h:0.9375});
[0,1,2,3].forEach(st=>blk(70+st,'Wheat Crop','crop'+st,{shape:2,hard:0,snd:'grass',keep:1,drop:st<3?281:282}));
blk(74,'Door','door',{shape:5,hard:1.5,tool:'axe',snd:'wood'});blk(75,'Door','door',{shape:5,hard:1.5,tool:'axe',snd:'wood',drop:74});REPL[74]=REPL[75]=0;SOLID[74]=1;
blk(76,'Ladder','ladder',{shape:5,hard:0.4,tool:'axe',snd:'wood'});REPL[76]=0;
blk(77,'Monster Cage','cage',{hard:4,tool:'pick',tier:1,trans:1,drop:0,light:4});
blk(78,'Reeds','reeds',{shape:2,hard:0,snd:'grass',keep:1});
[[79,'Plank Stairs','planks','axe','wood'],[80,'Cobblestone Stairs','cobble','pick','stone'],[81,'Brick Stairs','redbrick','pick','stone']].forEach(s=>{blk(s[0],s[1],s[2],{shape:6,hard:1.5,tool:s[3],snd:s[4],tier:s[3]==='pick'?1:0});SOLID[s[0]]=1;REPL[s[0]]=0;OPAC[s[0]]=0;});
blk(82,'Fence','planks',{shape:7,hard:1.5,tool:'axe',snd:'wood'});SOLID[82]=1;REPL[82]=0;OPAC[82]=0;
Object.assign(B,{FENCE:82,CAGE:77,REEDS:78,LADDER:76,DOOR:74,DOOR_O:75,FARMLAND:69,CROP:70,SGRASS:66,EMBERSTONE:57,ASH:58,EQUARTZ:59,RIFT:60,REDSAND:61,
CHARGE:46,SAPLING:47,CHEST:40,IRON_BLOCK:41,GOLD_BLOCK:42,DIAMOND_BLOCK:43,MOSSY:44,BED:45});
const LOGS=[7,30,32];

// ================= ITEMS =================
const IT={};
for(const b of BL)if(b)IT[b.id]={name:b.name,stack:64,block:true};
const iconPaint={};
function item(id,name,paint,o){IT[id]=Object.assign({name,stack:64},o||{});iconPaint[id]=paint;}
function blob(col,rx,ry,extra){return(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const dx=(x-7.5)/rx,dy=(y-8)/ry,d=dx*dx+dy*dy;if(d<1)s(x,y,sh(col,(dx+dy<-0.5?1.25:dx+dy>0.6?0.72:1)*(0.95+r()*0.1)));}if(extra)extra(s,r);};}
const MATS=[{n:'Wooden',c:0x9c7a45,tier:1,sp:2,dur:60,dmg:4},{n:'Stone',c:0x8c8c8c,tier:2,sp:4,dur:132,dmg:5},{n:'Iron',c:0xdcdcdc,tier:3,sp:6,dur:251,dmg:6},{n:'Golden',c:0xf2d13a,tier:1,sp:12,dur:33,dmg:4},{n:'Diamond',c:0x4fe0d8,tier:4,sp:8,dur:1562,dmg:7}];
const TTYPES=['pick','axe','shovel','sword'],TNAMES=['Pickaxe','Axe','Shovel','Sword'];
function toolPaint(type,c){return(s,r)=>{const hc=0x7a5a30,hd=0x5a4020;
  if(type!==3)for(let i=0;i<10;i++){s(3+i,13-i,hc);s(4+i,13-i,hd);}
  if(type===0){for(let y=0;y<16;y++)for(let x=0;x<16;x++){const dx=x-2,dy=y-14,d=Math.sqrt(dx*dx+dy*dy),a=Math.atan2(-dy,dx);if(d>11.2&&d<14&&a>0.12&&a<1.45)s(x,y,d>13?sh(c,0.7):d<12?sh(c,1.2):c);}}
  else if(type===1){for(let y=1;y<8;y++)for(let x=7;x<14;x++){if((x===7&&y<3)||(x===13&&y>5)||(x<9&&y>5))continue;s(x,y,x+y<12?sh(c,1.2):x+y>17?sh(c,0.7):c);}}
  else if(type===2){for(let y=1;y<6;y++)for(let x=10;x<15;x++){if((x===10&&y===1)||(x===14&&y===5)||(x===10&&y===5))continue;s(x,y,x-y>10?sh(c,1.2):c);}s(14,1,sh(c,1.2));}
  else{for(let i=0;i<9;i++){s(5+i,10-i,c);s(6+i,10-i,sh(c,0.75));s(5+i,9-i,sh(c,1.25));}s(14,1,sh(c,1.25));for(let i=0;i<5;i++){s(3+i,8+i,0x4a3a2a);}s(3,12,hc);s(2,13,hd);s(4,11,hc);}};}
item(256,'Stick',(s,r)=>{for(let i=0;i<11;i++){s(3+i,13-i,0x8b6b3d);s(4+i,13-i,0x6b4f2a);}});
item(257,'Coal',blob(0x2e2e2e,5.5,5,(s,r)=>{s(6,6,0x5a5a5a);s(7,5,0x5a5a5a);s(9,9,0x161616);}),{fuel:80});
const ingot=c=>(s,r)=>{for(let y=6;y<12;y++)for(let x=2;x<14;x++){const xx=x-(11-y)*0.6;if(xx>1&&xx<11)s(x,y,y<8?sh(c,1.25):y>9?sh(c,0.7):c);}};
item(258,'Iron Ingot',ingot(0xd0d0d0));item(259,'Gold Ingot',ingot(0xf2c832));
item(260,'Diamond',(s,r)=>{for(let y=3;y<14;y++)for(let x=2;x<14;x++){const w=y<6?(y-3)*1.5+3:(13-y)*0.8+0.5;if(Math.abs(x-7.5)<w)s(x,y,x<6?0xa8fff8:x>9?0x2cb0a8:(y<6?0x8cf4ee:0x4fe0d8));}});
const meat=(c,f)=>blob(c,6,4.5,(s,r)=>{for(let i=0;i<4;i++)s(4+i*2,7+(i%2),f);s(12,11,0xf0ead8);s(13,12,0xf0ead8);s(13,11,0xf0ead8);});
item(261,'Raw Beef',meat(0xc83c3c,0xf0b0a0),{food:3});item(262,'Steak',meat(0x7a4426,0x5a2e18),{food:8});
item(263,'Raw Porkchop',meat(0xf08a8a,0xfad0c8),{food:3});item(264,'Cooked Porkchop',meat(0xc89a5a,0x9a6e3a),{food:8});
item(265,'Raw Chicken',meat(0xf2c8b4,0xfae4d8),{food:2});item(266,'Cooked Chicken',meat(0xc88a48,0xa06830),{food:6});
item(267,'Raw Mutton',meat(0xd85a5a,0xf4c0b0),{food:2});item(268,'Cooked Mutton',meat(0x8a5030,0x6a3a20),{food:6});
item(269,'Apple',blob(0xd82a2a,5,5,(s,r)=>{s(7,2,0x6b4f2a);s(8,1,0x6b4f2a);s(9,2,0x4c9c38);s(10,2,0x4c9c38);s(5,6,0xff8a8a);}),{food:4});
item(270,'Rotten Flesh',meat(0x8a6a3a,0x5a7a3a),{food:4});
item(271,'Bone',(s,r)=>{for(let i=0;i<9;i++){s(4+i,12-i,0xeeeedd);s(5+i,12-i,0xc8c8b4);}s(3,12,0xeeeedd);s(4,13,0xeeeedd);s(3,13,0xeeeedd);s(12,3,0xeeeedd);s(13,4,0xeeeedd);s(13,3,0xeeeedd);s(2,11,0xeeeedd);s(14,5,0xc8c8b4);});
item(272,'String',(s,r)=>{let x=3;for(let y=2;y<14;y++){s(x,y,0xf0f0f0);s(x+1,y,0xc8c8c8);x+=y%3===0?2:y%3===1?1:-1;}});
item(273,'Feather',(s,r)=>{for(let i=0;i<10;i++){s(3+i,12-i,0xc8c8c8);if(i>2){s(4+i,12-i,0xffffff);s(3+i,11-i,0xffffff);s(5+i,12-i,0xe8e8e8);}}});
item(274,'Ember Dust',(s,r)=>{for(let i=0;i<26;i++){const x=3+((r()*10)|0),y=6+((r()*7)|0);s(x,y,r()<0.5?0xff8a1a:r()<0.5?0xffd23a:0x4a3a3a);}});
item(275,'Leather',blob(0x9a5a2a,6,5,(s,r)=>{s(3,4,0x9a5a2a);s(12,4,0x9a5a2a);s(3,12,0x7a4420);s(12,12,0x7a4420);}));
const bucket=fill=>(s,r)=>{for(let y=4;y<14;y++){const w=6-(y-4)*0.22;for(let x=2;x<14;x++)if(Math.abs(x-7.5)<w)s(x,y,x<6?0xe0e0e0:x>10?0x8a8a8a:0xb8b8b8);}for(let x=3;x<13;x++)s(x,4,fill||0x5a5a5a);if(fill)for(let x=4;x<12;x++)s(x,5,sh(fill,0.85));};
item(276,'Bucket',bucket(0),{stack:1});item(277,'Water Bucket',bucket(0x3568d8),{stack:1});item(278,'Lava Bucket',bucket(0xf08a24),{stack:1,fuel:200});
item(281,'Wheat Seeds',(s,r)=>{for(let i=0;i<9;i++){const x=3+((r()*9)|0),y=4+((r()*8)|0);s(x,y,0x7aa838);s(x+1,y,0x4a7a28);s(x,y+1,0x5a8a30);}});
item(282,'Wheat',(s,r)=>{for(let k=-1;k<=1;k++)for(let i=0;i<10;i++){s(3+i+k,12-i+k,i>5?(r()<0.5?0xe8c040:0xc89a28):0xb8a040);if(i>5)s(4+i+k,12-i+k-1,0xd8b030);}s(6,10,0x7a5a30);s(7,9,0x7a5a30);});
item(283,'Bread',blob(0xc08a48,6.5,3.6,(s,r)=>{for(let i=0;i<3;i++){s(5+i*3,6,0x8a5a28);s(6+i*3,7,0x8a5a28);}}),{food:5});
item(284,'Hoe',(s,r)=>{for(let i=0;i<10;i++){s(3+i,13-i,0x7a5a30);s(4+i,13-i,0x5a4020);}for(let x=8;x<14;x++){s(x,2,0xb0b0b0);s(x,3,0x8a8a8a);}s(8,4,0x8a8a8a);s(8,5,0x8a8a8a);},{stack:1});
const fishP=(c)=>(s,r)=>{for(let y=4;y<12;y++)for(let x=2;x<11;x++){const dx=(x-6.5)/4.6,dy=(y-8)/3;if(dx*dx+dy*dy<1)s(x,y,y<7?sh(c,1.15):y>9?0xe8ecf0:c);}for(let i=0;i<4;i++){s(11+i,8-i,sh(c,0.8));s(11+i,8+i,sh(c,0.8));s(11+i,8,sh(c,0.9));}s(4,7,0x111111);};
item(285,'Raw Fish',fishP(0x4a8ac8),{food:2});item(286,'Cooked Fish',fishP(0xc8884a),{food:6});
const armorP=c=>(s,r)=>{for(let y=2;y<14;y++)for(let x=2;x<14;x++){const arm=(x<5||x>10)&&y<7,body=x>=4&&x<=11&&y>=3,neck=y<4&&x>5&&x<10;if((arm||body)&&!neck)s(x,y,x<6?sh(c,1.2):x>9?sh(c,0.75):c);}};
item(287,'Leather Tunic',armorP(0x9a5a2a),{stack:1,armor:0.2});item(288,'Iron Armor',armorP(0xc8c8c8),{stack:1,armor:0.4});item(289,'Diamond Armor',armorP(0x4fe0d8),{stack:1,armor:0.6});
const EGGS=[['cow','Cow',0x4a3526,0xe8e4dc],['pig','Pig',0xe8a0a0,0x9a5a5a],['sheep','Sheep',0xf0f0ec,0xd8bca0],['chicken','Chicken',0xf8f8f8,0xd82a2a],['warden','Ember Warden',0x2e2a2a,0xffd84a],['wolf','Wolf',0xc8c8c4,0xa8a8a2],['settler','Settler',0x6a4a2e,0xb89a4a],['sentinel','Sentinel',0x8a8a84,0x4ad8ff],['fish','Fish',0x4a8ac8,0xd8e8f0],['zombie','Zombie',0x6f9a5a,0x6a4a8a],['skeleton','Skeleton',0xd4d4c8,0x55554c],['spider','Spider',0x2a2422,0xd82020],['ember','Emberling',0x2e2a2a,0xff7a1a],['wisp','Cinder Wisp',0xff8a1a,0xfff4c0]];
EGGS.forEach((e,i)=>item(330+i,'Spawn '+e[1],blob(e[2],4.4,5.6,(s,r)=>{for(let k=0;k<7;k++){const x=5+((r()*6)|0),y=4+((r()*8)|0);s(x,y,e[3]);if(r()<0.5)s(x+1,y,e[3]);}})));
item(350,'Shears',(s,r)=>{for(let i=0;i<7;i++){s(4+i,3+i,0xd0d0d0);s(11-i,3+i,0xb0b0b0);}for(const c of[[4,11],[10,11]]){s(c[0],c[1],0x8a3a2a);s(c[0]+1,c[1],0x8a3a2a);s(c[0],c[1]+2,0x8a3a2a);s(c[0]+1,c[1]+2,0x8a3a2a);s(c[0]-1,c[1]+1,0x8a3a2a);s(c[0]+2,c[1]+1,0x8a3a2a);}},{stack:1});
item(351,'Paper',(s,r)=>{for(let y=3;y<13;y++)for(let x=4;x<12;x++)s(x,y,y%3===1&&x>5&&x<10?0xb8b8b0:0xf4f0e4);});
item(352,'Sugar',blob(0xf8f8f8,4,3.4));
item(353,'Boat',(s,r)=>{for(let y=7;y<13;y++)for(let x=1;x<15;x++){const in_=x>=1+(y-7)*0.6&&x<=14-(y-7)*0.6;if(in_)s(x,y,y===7?0x7d5f33:(y<9&&x>2&&x<13?0x5e4020:sh(0xb58d52,0.9+r()*0.15)));}},{stack:1});
item(354,'Fishing Rod',(s,r)=>{for(let i=0;i<12;i++){s(2+i,13-i,0x8b6b3d);if(i<11)s(3+i,13-i,0x6b4f2a);}for(let y=2;y<10;y++)s(14,y,0xe8e8e8);s(14,10,0xd82a2a);s(13,10,0xd82a2a);s(14,11,0xf0f0f0);},{stack:1});
item(355,'Milk Bucket',bucket(0xf8f8f8),{stack:1,food:1});item(356,'Egg',blob(0xf0e4cc,3.6,4.8),{food:1});item(357,'Cake',(s,r)=>{for(let y=5;y<13;y++)for(let x=2;x<14;x++)s(x,y,y<7?0xfafafa:y===9?0xf4d8a0:0xb8703a);for(const x of[4,8,11])s(x,4,0xd82a2a);},{food:10});
item(279,'Arrow',(s,r)=>{for(let i=0;i<10;i++)s(3+i,12-i,0x8b6b3d);s(13,2,0xd0d0d0);s(12,2,0xb0b0b0);s(13,3,0xb0b0b0);s(11,2,0x9a9a9a);s(13,4,0x9a9a9a);s(2,13,0xf0f0f0);s(2,12,0xe0e0e0);s(3,13,0xe0e0e0);s(4,13,0xf0f0f0);s(2,11,0xf0f0f0);});
item(280,'Bow',(s,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const d=Math.hypot(x-2,y-13);if(d>10.3&&d<12.3&&x>2&&y<13)s(x,y,d>11.3?0x6b4f2a:0x8b6b3d);}for(let i=0;i<10;i++)s(3+i,2+i,0xe8e8e8);},{stack:1});
IT[350].tool={type:'shears',tier:1,sp:1,dur:238,dmg:1};
MATS.forEach((m,mi)=>TTYPES.forEach((t,ti)=>item(300+mi*4+ti,m.n+' '+TNAMES[ti],toolPaint(ti,m.c),{stack:1,tool:{type:t,tier:m.tier,sp:m.sp,dur:m.dur,dmg:ti===3?m.dmg:ti===1?m.dmg-1:2}})));
IT[9].fuel=15;IT[7].fuel=15;IT[30].fuel=15;IT[32].fuel=15;IT[256].fuel=5;IT[20].fuel=15;
const SMELT={285:286,12:258,13:259,5:19,4:3,7:257,30:257,32:257,261:262,263:264,265:266,267:268,11:257,14:260};

// icons
const iconCache={},iconUrlCache={};
function iconCanvas(id){if(iconCache[id])return iconCache[id];const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
  if(id<256){const b=BL[id];if(!b)return c;const dt=(t,a,bb,cc,d,e,f,dark)=>{x.setTransform(a,bb,cc,d,e,f);x.drawImage(atlas,(t%16)*16,((t/16)|0)*16,16,16,0,0,16,16);if(dark){x.globalCompositeOperation='source-atop';x.fillStyle='rgba(0,0,0,'+dark+')';x.fillRect(0,0,16,16);x.globalCompositeOperation='source-over';}};
    if(b.shape===1){const hh=b.h||1,o=16*(1-hh);dt(b.tex[2],1,0.5,0,hh,0,8+o,0.22);dt(b.tex[3]!==undefined?b.tex[3]:b.tex[2],1,-0.5,0,hh,16,16+o,0.42);dt(b.tex[0],1,0.5,-1,0.5,16,o,0);}
    else dt(b.tex[0],2,0,0,2,0,0,0);
  }else{const p=iconPaint[id];const t=document.createElement('canvas');t.width=t.height=16;const tx=t.getContext('2d');const img=tx.createImageData(16,16),d=img.data;
    const set=(px,py,col,a)=>{if(px<0||py<0||px>15||py>15)return;const i=(py*16+px)*4;d[i]=(col>>16)&255;d[i+1]=(col>>8)&255;d[i+2]=col&255;d[i+3]=a===undefined?255:a;};
    p(set,rng32(id*77));const o=new Uint8Array(256);for(let i=0;i<256;i++)o[i]=d[i*4+3]>0?1:0;
    for(let yy=0;yy<16;yy++)for(let xx=0;xx<16;xx++){if(o[yy*16+xx])continue;if((xx>0&&o[yy*16+xx-1])||(xx<15&&o[yy*16+xx+1])||(yy>0&&o[yy*16+xx-16])||(yy<15&&o[yy*16+xx+16]))set(xx,yy,0x1c1410,230);}
    tx.putImageData(img,0,0);x.drawImage(t,0,0,32,32);}
  x.setTransform(1,0,0,1,0,0);return iconCache[id]=c;}
function iconURL(id){return iconUrlCache[id]||(iconUrlCache[id]=iconCanvas(id).toDataURL());}

// ================= RECIPES =================
const RECIPES=[];
function rec(pat,key,out,n){RECIPES.push({pat,key,out:[out,n||1]});}
rec(['L'],{L:LOGS},9,4);rec(['P','P'],{P:9},256,4);rec(['PP','PP'],{P:9},20);rec(['CCC','C C','CCC'],{C:4},21);
rec(['c','s'],{c:257,s:256},22,4);rec(['SS','SS'],{S:5},17);rec(['SS','SS'],{S:3},29,4);rec(['SS','SS'],{S:272},36);rec(['EE','EE'],{E:274},39);
[[24,50],[25,51],[38,52],[27,53],[257,54]].forEach(p=>{rec(['WD'],{W:36,D:p[0]},p[1]);rec(['W','D'],{W:36,D:p[0]},p[1]);});
rec(['PPP','LLL','PPP'],{P:9,L:[275,256]},55);rec(['CD','DC'],{C:4,D:2},56,4);rec(['WWW','PPP'],{W:[36,50,51,52,53,54],P:9},45);
[[275,287],[258,288],[260,289]].forEach(p=>rec(['A A','AAA','AAA'],{A:p[0]},p[1]));rec(['s s','sss','s s'],{s:256},76,3);rec(['PP','PP','PP'],{P:9},74);[[9,79],[4,80],[56,81]].forEach(p=>rec(['S  ','SS ','SSS'],{S:p[0]},p[1],4));rec(['MMM','SES','WWW'],{M:355,S:352,E:356,W:282},357);rec(['  s',' sS','s S'],{s:256,S:272},354);rec(['PsP','PsP'],{P:9,s:256},82,3);rec(['P P','PPP'],{P:9},353);rec([' I','I '],{I:258},350);rec(['RRR'],{R:78},351,3);rec(['R'],{R:78},352);rec(['PPP','LLL','PPP'],{P:9,L:351},55);rec(['WWW'],{W:282},283);rec(['MM',' s',' s'],{M:[9,4,258],s:256},284);
rec(['SSS'],{S:3},48,6);rec(['SSS'],{S:9},49,6);rec([' sS','s S',' sS'],{s:256,S:272},280);rec(['c','s','f'],{c:4,s:256,f:273},279,4);rec(['ESE','SES','ESE'],{E:274,S:5},46);rec(['PPP','P P','PPP'],{P:9},40);rec(['I I',' I '],{I:258},276);rec(['WWW','PPP'],{W:36,P:9},45);rec(['CC','CC'],{C:4},44,4);
[[258,41],[259,42],[260,43]].forEach(p=>{rec(['III','III','III'],{I:p[0]},p[1]);rec(['B'],{B:p[1]},p[0],9);});
[9,4,258,259,260].forEach((m,mi)=>{const k={M:m,s:256};rec(['MMM',' s ',' s '],k,300+mi*4);rec(['MM','Ms',' s'],k,301+mi*4);rec(['M','s','s'],k,302+mi*4);rec(['M','M','s'],k,303+mi*4);});
function matchRecipe(grid,w){let x0=w,y0=w,x1=-1,y1=-1;for(let y=0;y<w;y++)for(let x=0;x<w;x++)if(grid[y*w+x]){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
  if(x1<0)return null;const gw=x1-x0+1,gh=y1-y0+1;
  for(const rc of RECIPES){if(rc.pat.length!==gh||rc.pat[0].length!==gw)continue;
    for(let flip=0;flip<2;flip++){let ok=true;for(let y=0;y<gh&&ok;y++)for(let x=0;x<gw;x++){const ch=rc.pat[y][flip?gw-1-x:x],s=grid[(y0+y)*w+x0+x],want=ch===' '?null:rc.key[ch];
        if(!want){if(s){ok=false;break;}}else if(!s||(Array.isArray(want)?!want.includes(s.id):want!==s.id)){ok=false;break;}}
      if(ok)return{id:rc.out[0],n:rc.out[1]};}}
  return null;}
const CREATIVE_ITEMS=[1,2,3,4,29,5,17,18,7,30,32,9,8,31,33,19,20,21,40,45,74,76,82,79,80,81,48,49,56,55,57,58,59,61,62,63,64,65,66,67,68,50,51,52,53,54,46,47,22,39,41,42,43,44,11,12,13,14,15,16,28,35,36,27,24,25,38,26,37,10,6,23,256,257,258,259,260,269,262,264,266,268,271,272,273,274,275,276,277,278,280,279,287,288,289,353,354,355,356,357,350,351,352,78,77,284,281,282,283,285,286,69].concat(Array.from({length:20},(_,i)=>300+i)).concat(EGGS.map((_,i)=>330+i));
