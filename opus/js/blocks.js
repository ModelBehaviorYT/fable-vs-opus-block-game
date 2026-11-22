// Block & item definitions, procedural 16x16 pixel-art textures, icons.
export const B = {
  AIR:0, GRASS:1, DIRT:2, STONE:3, COBBLE:4, BEDROCK:5, SAND:6, GRAVEL:7, LOG:8, LEAVES:9, PLANKS:10,
  WATER:11, LAVA:12, COAL_ORE:13, IRON_ORE:14, GOLD_ORE:15, DIAMOND_ORE:16, GLASS:17, CRAFTING:18,
  FURNACE:19, TORCH:20, SNOW_GRASS:21, SNOW:22, CACTUS:23, ROSE:24, DANDELION:25, TALLGRASS:26,
  SANDSTONE:27, BRICKS:28, WOOL:29, STONEBRICK:30, ICE:31, SPRUCE_LOG:32, SPRUCE_LEAVES:33,
  FURNACE_LIT:34, DEADBUSH:35, OBSIDIAN:36, BIRCH_LOG:37, BIRCH_LEAVES:38, CHEST:39, BED:40, SAPLING:41, FARMLAND:42, WHEAT:43, DOOR:44, DOOR_OPEN:45, LADDER:46, CANE:47, NETHERRACK:48, SOUL_SAND:49, GLOWSTONE:50, PORTAL:51, QUARTZ_ORE:52, NETHER_BRICK:53, PATH:54, MOSSY:55, CLAY:56, RED_SAND:57, TERRACOTTA:58, TERRA_WHITE:59, TERRA_RED:60, TERRA_BROWN:61, TERRA_YELLOW:62, LILY:63, SWAMP_GRASS:64, LAPIS_ORE:65, REDSTONE_ORE:66, LAPIS_BLOCK:67, IRON_BLOCK:68, GOLD_BLOCK:69, DIAMOND_BLOCK:70, JUNGLE_LOG:71, JUNGLE_LEAVES:72, SPAWNER:73, STONE_SLAB:74, PLANK_SLAB:75, COBBLE_SLAB:76, FENCE:77, PUMPKIN:78, JACK:79, SNOW_LAYER:80, BOOKSHELF:81, HAY:82, LANTERN:83, EMERALD_ORE:84, COBBLE_STAIRS:85, PLANK_STAIRS:86, ENCHANT_TABLE:87
};
export const I = {
  STICK:256, COAL:257, IRON:258, GOLD:259, DIAMOND:260,
  WPICK:261, WAXE:262, WSHOVEL:263, WSWORD:264,
  SPICK:265, SAXE:266, SSHOVEL:267, SSWORD:268,
  IPICK:269, IAXE:270, ISHOVEL:271, ISWORD:272,
  DPICK:273, DAXE:274, DSHOVEL:275, DSWORD:276,
  PORK:277, COOKED_PORK:278, BEEF:279, STEAK:280, CHICKEN:281, COOKED_CHICKEN:282,
  APPLE:283, ROTTEN:284, BONE:285, STRING:286, FEATHER:287, GUNPOWDER:288, LEATHER:289, ARROW:290,
  GPICK:291, GAXE:292, GSHOVEL:293, GSWORD:294, BOW:295, SEEDS:296, WHEAT:297, BREAD:298, WHOE:299, SHOE:300, IHOE:301, DHOE:302, GHOE:303, FLINT:304, PAPER:305, SUGAR:306, FLINT_STEEL:307, LAPIS:308, REDSTONE:309, BUCKET:310, WATER_BUCKET:311, LAVA_BUCKET:312, SHEARS:313, MILK_BUCKET:314, CAKE_ITEM:315, EGG:316, BONE_MEAL:317,
  LHELM:318, LCHEST:319, LLEGS:320, LBOOTS:321, IHELM:322, ICHEST:323, ILEGS:324, IBOOTS:325,
  GHELM:326, GCHEST:327, GLEGS:328, GBOOTS:329, DHELM:330, DCHEST:331, DLEGS:332, DBOOTS:333, EMERALD:334, COMPASS:335, CLOCK:336
};

// ---------- tiles ----------
const TILE_NAMES = ['grass_top','grass_side','dirt','stone','cobble','bedrock','sand','gravel','log_side','log_top',
 'leaves','planks','water','lava','coal_ore','iron_ore','gold_ore','diamond_ore','glass','ct_top','ct_side','ct_front',
 'furnace_front','furnace_side','furnace_top','torch','snow_side','snow','cactus_side','cactus_top','rose','dandelion',
 'tallgrass','sandstone_side','sandstone_top','bricks','wool','stonebrick','ice','spruce_log','spruce_leaves',
 'furnace_lit','deadbush','obsidian','birch_log','birch_leaves','sandstone_bottom','water_flow','chest_top','chest_side','chest_front','bed_top','bed_side','sapling','farmland','wheat0','wheat1','wheat2','wheat3','door_top','door_bot','ladder','cane','netherrack','soul_sand','glowstone','portal','quartz_ore','nether_brick','path_top','mossy','clay','red_sand','terracotta','terra_white','terra_red','terra_brown','terra_yellow','lily','swamp_top','swamp_side','lapis_ore','redstone_ore','lapis_block','iron_block','gold_block','diamond_block','jungle_log','jungle_leaves','spawner','slab_top','slab_side','pumpkin_top','pumpkin_side','pumpkin_face','jack_face','bookshelf','hay_top','hay_side','lantern','emerald_ore','ench_top','ench_side'];
export const T = {}; TILE_NAMES.forEach((n,i)=>T[n]=i);

// block defs: tex [top,bottom,side] (tile names), hardness, tool, etc.
const D = [];
function def(id, o){ D[id] = Object.assign({id, name:'?', solid:true, opaque:true, hardness:1, tool:null, tier:0, drop:id, light:0, atten:0, render:'cube', liquid:false, replace:false, target:true}, o); }
def(B.AIR,{name:'Air',solid:false,opaque:false,render:'none',target:false,replace:true});
def(B.GRASS,{name:'Grass Block',tex:['grass_top','dirt','grass_side'],hardness:0.6,tool:'shovel',drop:B.DIRT,snd:'grass'});
def(B.DIRT,{name:'Dirt',tex:['dirt'],hardness:0.5,tool:'shovel',snd:'grass'});
def(B.STONE,{name:'Stone',tex:['stone'],hardness:1.5,tool:'pick',tier:1,drop:B.COBBLE,snd:'stone'});
def(B.COBBLE,{name:'Cobblestone',tex:['cobble'],hardness:2,tool:'pick',tier:1,snd:'stone'});
def(B.BEDROCK,{name:'Bedrock',tex:['bedrock'],hardness:-1,snd:'stone'});
def(B.SAND,{name:'Sand',tex:['sand'],hardness:0.5,tool:'shovel',snd:'sand',gravity:true});
def(B.GRAVEL,{name:'Gravel',tex:['gravel'],hardness:0.6,tool:'shovel',snd:'sand',gravity:true});
def(B.LOG,{name:'Oak Log',tex:['log_top','log_top','log_side'],hardness:2,tool:'axe',snd:'wood',fuel:15});
def(B.LEAVES,{name:'Oak Leaves',tex:['leaves'],hardness:0.2,opaque:false,atten:1,drop:0,snd:'grass',leaves:true});
def(B.PLANKS,{name:'Oak Planks',tex:['planks'],hardness:2,tool:'axe',snd:'wood',fuel:15});
def(B.WATER,{name:'Water',tex:['water'],solid:false,opaque:false,atten:2,render:'liquid',liquid:true,replace:true,target:false,hardness:-1});
def(B.LAVA,{name:'Lava',tex:['lava'],solid:false,opaque:false,render:'liquid',liquid:true,replace:true,target:false,light:15,hardness:-1});
def(B.COAL_ORE,{name:'Coal Ore',tex:['coal_ore'],hardness:3,tool:'pick',tier:1,drop:I.COAL,snd:'stone'});
def(B.IRON_ORE,{name:'Iron Ore',tex:['iron_ore'],hardness:3,tool:'pick',tier:2,snd:'stone'});
def(B.GOLD_ORE,{name:'Gold Ore',tex:['gold_ore'],hardness:3,tool:'pick',tier:3,snd:'stone'});
def(B.DIAMOND_ORE,{name:'Diamond Ore',tex:['diamond_ore'],hardness:3,tool:'pick',tier:3,drop:I.DIAMOND,snd:'stone'});
def(B.GLASS,{name:'Glass',tex:['glass'],hardness:0.3,opaque:false,drop:0,snd:'glass',glass:true});
def(B.CRAFTING,{name:'Crafting Table',tex:['ct_top','planks','ct_side','ct_front'],hardness:2.5,tool:'axe',snd:'wood',fuel:15});
def(B.FURNACE,{name:'Furnace',tex:['furnace_top','furnace_top','furnace_side','furnace_front'],hardness:3.5,tool:'pick',tier:1,snd:'stone'});
def(B.FURNACE_LIT,{name:'Furnace',tex:['furnace_top','furnace_top','furnace_side','furnace_lit'],hardness:3.5,tool:'pick',tier:1,drop:B.FURNACE,light:13,snd:'stone'});
def(B.TORCH,{name:'Torch',tex:['torch'],solid:false,opaque:false,hardness:0,render:'torch',light:14,snd:'wood'});
def(B.SNOW_GRASS,{name:'Snowy Grass',tex:['snow','dirt','snow_side'],hardness:0.6,tool:'shovel',drop:B.DIRT,snd:'snow'});
def(B.SNOW,{name:'Snow Block',tex:['snow'],hardness:0.2,tool:'shovel',snd:'snow'});
def(B.CACTUS,{name:'Cactus',tex:['cactus_top','cactus_top','cactus_side'],hardness:0.4,opaque:false,render:'cactus',snd:'wool'});
def(B.ROSE,{name:'Rose',tex:['rose'],solid:false,opaque:false,hardness:0,render:'cross',replace:false,snd:'grass',plant:true});
def(B.DANDELION,{name:'Dandelion',tex:['dandelion'],solid:false,opaque:false,hardness:0,render:'cross',snd:'grass',plant:true});
def(B.TALLGRASS,{name:'Tall Grass',tex:['tallgrass'],solid:false,opaque:false,hardness:0,render:'cross',replace:true,drop:0,snd:'grass',plant:true});
def(B.DEADBUSH,{name:'Dead Bush',tex:['deadbush'],solid:false,opaque:false,hardness:0,render:'cross',replace:true,drop:I.STICK,snd:'grass',plant:true});
def(B.SANDSTONE,{name:'Sandstone',tex:['sandstone_top','sandstone_bottom','sandstone_side'],hardness:0.8,tool:'pick',tier:1,snd:'stone'});
def(B.BRICKS,{name:'Bricks',tex:['bricks'],hardness:2,tool:'pick',tier:1,snd:'stone'});
def(B.WOOL,{name:'White Wool',tex:['wool'],hardness:0.8,snd:'wool'});
def(B.STONEBRICK,{name:'Stone Bricks',tex:['stonebrick'],hardness:1.5,tool:'pick',tier:1,snd:'stone'});
def(B.ICE,{name:'Ice',tex:['ice'],hardness:0.5,tool:'pick',drop:0,snd:'glass'});
def(B.SPRUCE_LOG,{name:'Spruce Log',tex:['log_top','log_top','spruce_log'],hardness:2,tool:'axe',snd:'wood',fuel:15});
def(B.SPRUCE_LEAVES,{name:'Spruce Leaves',tex:['spruce_leaves'],hardness:0.2,opaque:false,atten:1,drop:0,snd:'grass',leaves:true});
def(B.BIRCH_LOG,{name:'Birch Log',tex:['log_top','log_top','birch_log'],hardness:2,tool:'axe',snd:'wood',fuel:15});
def(B.BIRCH_LEAVES,{name:'Birch Leaves',tex:['birch_leaves'],hardness:0.2,opaque:false,atten:1,drop:0,snd:'grass',leaves:true});
def(B.OBSIDIAN,{name:'Obsidian',tex:['obsidian'],hardness:50,tool:'pick',tier:4,snd:'stone'});
def(B.CHEST,{name:'Chest',tex:['chest_top','chest_top','chest_side','chest_front'],hardness:2.5,tool:'axe',snd:'wood',fuel:15});
def(B.BED,{name:'Bed',tex:['bed_top','planks','bed_side'],hardness:0.2,opaque:false,render:'bed',snd:'wool'});
def(B.FARMLAND,{name:'Farmland',tex:['farmland','dirt','dirt'],hardness:0.6,tool:'shovel',opaque:false,render:'bed',drop:B.DIRT,snd:'grass'});
def(B.WHEAT,{name:'Wheat Crops',tex:['wheat0'],solid:false,opaque:false,hardness:0,render:'cross',drop:I.SEEDS,snd:'grass',plant:true});
def(B.DOOR,{name:'Oak Door',tex:['door_bot'],opaque:false,render:'door',hardness:3,tool:'axe',snd:'wood'});
def(B.DOOR_OPEN,{name:'Oak Door',tex:['door_bot'],solid:false,opaque:false,render:'door',hardness:3,tool:'axe',drop:B.DOOR,snd:'wood'});
def(B.LADDER,{name:'Ladder',tex:['ladder'],solid:false,opaque:false,render:'ladder',hardness:0.4,tool:'axe',snd:'wood',fuel:5});
def(B.CANE,{name:'Sugar Cane',tex:['cane'],solid:false,opaque:false,hardness:0,render:'cross',snd:'grass'});
def(B.NETHERRACK,{name:'Netherrack',tex:['netherrack'],hardness:0.4,tool:'pick',tier:1,snd:'stone'});
def(B.SOUL_SAND,{name:'Soul Sand',tex:['soul_sand'],hardness:0.5,tool:'shovel',snd:'sand'});
def(B.GLOWSTONE,{name:'Glowstone',tex:['glowstone'],hardness:0.3,light:15,snd:'glass'});
def(B.PORTAL,{name:'Nether Portal',tex:['portal'],solid:false,opaque:false,hardness:-1,light:11,drop:0,target:false,portal:true,snd:'glass'});
def(B.QUARTZ_ORE,{name:'Nether Quartz Ore',tex:['quartz_ore'],hardness:3,tool:'pick',tier:1,snd:'stone'});
def(B.NETHER_BRICK,{name:'Nether Bricks',tex:['nether_brick'],hardness:2,tool:'pick',tier:1,snd:'stone'});
def(B.PATH,{name:'Dirt Path',tex:['path_top','dirt','dirt'],hardness:0.6,tool:'shovel',drop:B.DIRT,opaque:false,render:'bed',snd:'grass'});
def(B.MOSSY,{name:'Mossy Cobblestone',tex:['mossy'],hardness:2,tool:'pick',tier:1,snd:'stone'});
def(B.CLAY,{name:'Clay',tex:['clay'],hardness:0.6,tool:'shovel',snd:'grass'});
def(B.RED_SAND,{name:'Red Sand',tex:['red_sand'],hardness:0.5,tool:'shovel',snd:'sand',gravity:true});
def(B.TERRACOTTA,{name:'Terracotta',tex:['terracotta'],hardness:1.25,tool:'pick',tier:1,snd:'stone'});
def(B.TERRA_WHITE,{name:'White Terracotta',tex:['terra_white'],hardness:1.25,tool:'pick',tier:1,snd:'stone'});
def(B.TERRA_RED,{name:'Red Terracotta',tex:['terra_red'],hardness:1.25,tool:'pick',tier:1,snd:'stone'});
def(B.TERRA_BROWN,{name:'Brown Terracotta',tex:['terra_brown'],hardness:1.25,tool:'pick',tier:1,snd:'stone'});
def(B.TERRA_YELLOW,{name:'Yellow Terracotta',tex:['terra_yellow'],hardness:1.25,tool:'pick',tier:1,snd:'stone'});
def(B.LAPIS_ORE,{name:'Lapis Lazuli Ore',tex:['lapis_ore'],hardness:3,tool:'pick',tier:2,drop:308,snd:'stone'});
def(B.REDSTONE_ORE,{name:'Redstone Ore',tex:['redstone_ore'],hardness:3,tool:'pick',tier:3,drop:309,snd:'stone'});
def(B.LAPIS_BLOCK,{name:'Block of Lapis',tex:['lapis_block'],hardness:3,tool:'pick',tier:2,snd:'stone'});
def(B.IRON_BLOCK,{name:'Block of Iron',tex:['iron_block'],hardness:5,tool:'pick',tier:2,snd:'stone'});
def(B.GOLD_BLOCK,{name:'Block of Gold',tex:['gold_block'],hardness:3,tool:'pick',tier:3,snd:'stone'});
def(B.DIAMOND_BLOCK,{name:'Block of Diamond',tex:['diamond_block'],hardness:5,tool:'pick',tier:3,snd:'stone'});
def(B.JUNGLE_LOG,{name:'Jungle Log',tex:['log_top','log_top','jungle_log'],hardness:2,tool:'axe',snd:'wood',fuel:15});
def(B.JUNGLE_LEAVES,{name:'Jungle Leaves',tex:['jungle_leaves'],hardness:0.2,opaque:false,atten:1,drop:0,snd:'grass',leaves:true});
def(B.SPAWNER,{name:'Monster Spawner',tex:['spawner'],hardness:5,tool:'pick',tier:1,opaque:false,drop:0,snd:'stone',glass:true});
def(B.STONE_SLAB,{name:'Stone Slab',tex:['slab_top','slab_top','slab_side'],hardness:2,tool:'pick',tier:1,opaque:false,render:'slab',hgt:0.5,snd:'stone'});
def(B.PLANK_SLAB,{name:'Oak Slab',tex:['planks'],hardness:2,tool:'axe',opaque:false,render:'slab',hgt:0.5,snd:'wood',fuel:7});
def(B.COBBLE_SLAB,{name:'Cobblestone Slab',tex:['cobble'],hardness:2,tool:'pick',tier:1,opaque:false,render:'slab',hgt:0.5,snd:'stone'});
def(B.SNOW_LAYER,{name:'Snow',tex:['snow'],hardness:0.1,tool:'shovel',opaque:false,solid:false,render:'slab',hgt:0.125,replace:true,drop:B.SNOW,snd:'snow'});
def(B.EMERALD_ORE,{name:'Emerald Ore',tex:['emerald_ore'],hardness:3,tool:'pick',tier:3,drop:334,snd:'stone'});
def(B.COBBLE_STAIRS,{name:'Cobblestone Stairs',tex:['cobble'],hardness:2,tool:'pick',tier:1,opaque:false,render:'stairs',hgt:0.5,snd:'stone'});
def(B.PLANK_STAIRS,{name:'Oak Stairs',tex:['planks'],hardness:2,tool:'axe',opaque:false,render:'stairs',hgt:0.5,snd:'wood',fuel:15});
def(B.ENCHANT_TABLE,{name:'Enchanting Table',tex:['ench_top','obsidian','ench_side'],hardness:5,tool:'pick',tier:1,opaque:false,render:'slab',hgt:0.75,light:7,snd:'stone'});
def(B.BOOKSHELF,{name:'Bookshelf',tex:['planks','planks','bookshelf'],hardness:1.5,tool:'axe',snd:'wood',fuel:15});
def(B.HAY,{name:'Hay Bale',tex:['hay_top','hay_top','hay_side'],hardness:0.5,snd:'grass'});
def(B.LANTERN,{name:'Lantern',tex:['lantern'],hardness:3.5,tool:'pick',opaque:false,solid:false,render:'torch',light:15,snd:'stone'});
def(B.FENCE,{name:'Oak Fence',tex:['planks'],hardness:2,tool:'axe',opaque:false,render:'fence',snd:'wood',fuel:15});
def(B.PUMPKIN,{name:'Pumpkin',tex:['pumpkin_top','pumpkin_top','pumpkin_side','pumpkin_face'],hardness:1,tool:'axe',snd:'wood'});
def(B.JACK,{name:"Jack o'Lantern",tex:['pumpkin_top','pumpkin_top','pumpkin_side','jack_face'],hardness:1,tool:'axe',light:15,snd:'wood'});
def(B.SWAMP_GRASS,{name:'Grass Block',tex:['swamp_top','dirt','swamp_side'],hardness:0.6,tool:'shovel',drop:B.DIRT,snd:'grass'});
def(B.LILY,{name:'Lily Pad',tex:['lily'],solid:false,opaque:false,hardness:0,render:'lily',snd:'grass'});
def(B.SAPLING,{name:'Oak Sapling',tex:['sapling'],solid:false,opaque:false,hardness:0,render:'cross',snd:'grass',plant:true,fuel:5});
export const BLOCKS = D;
export const NUM_BLOCKS = D.length;
export const OPAQUE = new Uint8Array(256), SOLID = new Uint8Array(256), ATTEN = new Uint8Array(256), LIGHT = new Uint8Array(256);
for (const d of D) if (d) { OPAQUE[d.id] = d.opaque && d.render==='cube' ? 1:0; SOLID[d.id]=d.solid?1:0; ATTEN[d.id]=d.atten; LIGHT[d.id]=d.light; }

// face index: 0 +X,1 -X,2 +Y,3 -Y,4 +Z,5 -Z ; meta for furnace = front face index
export function blockTile(id, face, meta) {
  const t = D[id].tex; if (!t) return 0;
  if (id === B.WHEAT) return T['wheat' + Math.min(3, (meta||0)>>1)];
  if (t.length === 1) return T[t[0]];
  if (face === 2) return T[t[0]];
  if (face === 3) return T[t[1]];
  if (t.length === 4) {
    if (id === B.CRAFTING) return T[(face===4||face===5) ? t[3] : t[2]];
    const front = meta || 4;
    return T[face === front ? t[3] : t[2]];
  }
  return T[t[2]];
}

// ---------- items ----------
const IT = [];
function item(id, o){ IT[id] = Object.assign({id, stack:64}, o); }
item(I.STICK,{name:'Stick',icon:'stick',fuel:5});
item(I.COAL,{name:'Coal',icon:'coal',fuel:80});
item(I.IRON,{name:'Iron Ingot',icon:'ingot',col:'#d8d8d8'});
item(I.GOLD,{name:'Gold Ingot',icon:'ingot',col:'#f5d43a'});
item(I.DIAMOND,{name:'Diamond',icon:'gem'});
const MATS = {W:{n:'Wooden',tier:1,speed:2,dur:59,c:['#9a7442','#5e4524'],dmg:0},S:{n:'Stone',tier:2,speed:4,dur:131,c:['#8f8f8f','#545454'],dmg:1},
  I:{n:'Iron',tier:3,speed:6,dur:250,c:['#e6e6e6','#9a9a9a'],dmg:2},D:{n:'Diamond',tier:4,speed:8,dur:1561,c:['#62ecdf','#1f8f86'],dmg:3},G:{n:'Golden',tier:1,speed:12,dur:32,c:['#ffe34d','#c49a12'],dmg:0}};
for (const m of 'WSIDG') {
  const M = MATS[m];
  item(I[m+'PICK'],{name:M.n+' Pickaxe',icon:'pick',col:M.c,stack:1,tool:'pick',tier:M.tier,speed:M.speed,dur:M.dur,dmg:2+M.dmg,fuel:m==='W'?10:0});
  item(I[m+'AXE'],{name:M.n+' Axe',icon:'axe',col:M.c,stack:1,tool:'axe',tier:M.tier,speed:M.speed,dur:M.dur,dmg:3+M.dmg,fuel:m==='W'?10:0});
  item(I[m+'SHOVEL'],{name:M.n+' Shovel',icon:'shovel',col:M.c,stack:1,tool:'shovel',tier:M.tier,speed:M.speed,dur:M.dur,dmg:1+M.dmg,fuel:m==='W'?10:0});
  item(I[m+'SWORD'],{name:M.n+' Sword',icon:'sword',col:M.c,stack:1,tool:'sword',tier:M.tier,speed:1.5,dur:M.dur,dmg:4+M.dmg,fuel:m==='W'?10:0});
}
item(I.PORK,{name:'Raw Porkchop',icon:'meat',col:['#f19b9b','#c96464'],food:3,sat:1.8});
item(I.COOKED_PORK,{name:'Cooked Porkchop',icon:'meat',col:['#c98a4f','#7d4f22'],food:8,sat:12.8});
item(I.BEEF,{name:'Raw Beef',icon:'meat',col:['#d9443c','#8e231e'],food:3,sat:1.8});
item(I.STEAK,{name:'Steak',icon:'meat',col:['#8c5428','#4c2a12'],food:8,sat:12.8});
item(I.CHICKEN,{name:'Raw Chicken',icon:'drum',col:['#f6c6b0','#c99580'],food:2,sat:1.2});
item(I.COOKED_CHICKEN,{name:'Cooked Chicken',icon:'drum',col:['#d79a52','#8a5520'],food:6,sat:7.2});
item(I.APPLE,{name:'Apple',icon:'apple',food:4,sat:2.4});
item(I.ROTTEN,{name:'Rotten Flesh',icon:'meat',col:['#a26a45','#5f7a35'],food:4,sat:0.8});
item(I.BONE,{name:'Bone',icon:'bone'});
item(I.STRING,{name:'String',icon:'string'});
item(I.FEATHER,{name:'Feather',icon:'feather'});
item(I.GUNPOWDER,{name:'Gunpowder',icon:'powder'});
item(I.LEATHER,{name:'Leather',icon:'leather'});
item(I.ARROW,{name:'Arrow',icon:'arrow'});
item(I.FLINT,{name:'Flint',icon:'coal',col:['#5a5a60','#2a2a30']});
item(I.PAPER,{name:'Paper',icon:'paper'});
{ const AM = { L:{n:'Leather',c:['#a0643a','#5e3a1e'],pts:[1,3,2,1],dur:80}, I:{n:'Iron',c:['#e2e2e2','#8a8a8a'],pts:[2,6,5,2],dur:240}, G:{n:'Golden',c:['#ffe04a','#b88a10'],pts:[2,5,3,1],dur:110}, D:{n:'Diamond',c:['#62ecdf','#1f8f86'],pts:[3,8,6,3],dur:530} };
  const parts = [['HELM','Helmet','helm'],['CHEST','Chestplate','chest'],['LEGS','Leggings','legs'],['BOOTS','Boots','boots']];
  for (const m in AM) parts.forEach(([k,nm,ic],slot) => item(I[m+k], { name: AM[m].n==='Leather' ? (['Leather Cap','Leather Tunic','Leather Pants','Leather Boots'][slot]) : AM[m].n+' '+nm, icon:ic, col:AM[m].c, stack:1, armor:slot, pts:AM[m].pts[slot], dur:AM[m].dur*(slot===1?1.5:slot===2?1.4:1)|0 })); }
item(I.COMPASS,{name:'Compass',icon:'compass',stack:1});
item(I.CLOCK,{name:'Clock',icon:'clock',stack:1});
item(I.EMERALD,{name:'Emerald',icon:'gem',col:['#30d060','#127a30']});
item(I.BONE_MEAL,{name:'Bone Meal',icon:'powder',col:['#f0f0e8','#c8c8c0']});
item(I.EGG,{name:'Egg',icon:'egg',stack:16});
item(I.MILK_BUCKET,{name:'Milk Bucket',icon:'bucket',col:'#f4f4f0',stack:1,food:1,sat:0});
item(I.CAKE_ITEM,{name:'Cake',icon:'bread',col:['#f8f0e8','#c84040'],stack:1,food:14,sat:2.8});
item(I.SHEARS,{name:'Shears',icon:'shears',stack:1,dur:238});
item(I.BUCKET,{name:'Bucket',icon:'bucket',stack:16});
item(I.WATER_BUCKET,{name:'Water Bucket',icon:'bucket',col:'#3a64d8',stack:1});
item(I.LAVA_BUCKET,{name:'Lava Bucket',icon:'bucket',col:'#ff7a10',stack:1,fuel:1000});
item(I.LAPIS,{name:'Lapis Lazuli',icon:'gem',col:['#3050d0','#1a2a80']});
item(I.REDSTONE,{name:'Redstone Dust',icon:'powder',col:['#d01010','#800808']});
item(I.FLINT_STEEL,{name:'Flint and Steel',icon:'fns',stack:1,dur:64});
item(I.SUGAR,{name:'Sugar',icon:'powder',col:['#f4f4f4','#c8c8c8']});
item(I.SEEDS,{name:'Wheat Seeds',icon:'seeds'});
item(I.WHEAT,{name:'Wheat',icon:'wheat'});
item(I.BREAD,{name:'Bread',icon:'bread',col:['#c88a3a','#7a4a1a'],food:5,sat:6});
for (const m of 'WSIDG') { const M = MATS[m]; item(I[m+'HOE'],{name:M.n+' Hoe',icon:'hoe',col:M.c,stack:1,tool:'hoe',tier:M.tier,speed:1,dur:M.dur,dmg:1,fuel:m==='W'?10:0}); }
item(I.BOW,{name:'Bow',icon:'bow',stack:1,dur:384,fuel:10});
export const ITEMS = IT;

export function info(id){ return id < 256 ? D[id] : IT[id]; }
export function itemName(id){ const d = info(id); return d ? d.name : '?'; }
export function maxStack(id){ return id < 256 ? 64 : IT[id].stack; }
export const SMELT = { [B.SAND]:B.GLASS, [B.COBBLE]:B.STONE, [B.IRON_ORE]:I.IRON, [B.GOLD_ORE]:I.GOLD, [B.LOG]:I.COAL, [B.SPRUCE_LOG]:I.COAL, [B.BIRCH_LOG]:I.COAL,
  [I.PORK]:I.COOKED_PORK, [I.BEEF]:I.STEAK, [I.CHICKEN]:I.COOKED_CHICKEN, [B.STONE]:B.STONEBRICK };
export function fuelValue(id){ const d = info(id); return d && d.fuel || 0; }

// ---------- texture painting ----------
function rng(seed){ let a = seed>>>0; return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const clamp = v => v<0?0:v>255?255:v|0;
export const atlas = document.createElement('canvas'); atlas.width = atlas.height = 256;
const actx = atlas.getContext('2d');
const tiles = {}; // name -> ImageData

function paint(name, fn) {
  const img = actx.createImageData(16,16); const d = img.data;
  const r = rng(name.split('').reduce((a,c)=>a*31+c.charCodeAt(0),7));
  const P = (x,y,c,a=255)=>{ if(x<0||y<0||x>15||y>15)return; const i=(y*16+x)*4; d[i]=clamp(c[0]);d[i+1]=clamp(c[1]);d[i+2]=clamp(c[2]);d[i+3]=a; };
  const G = (x,y)=>{ const i=(y*16+x)*4; return [d[i],d[i+1],d[i+2],d[i+3]]; };
  fn(P, r, G);
  tiles[name] = img;
  const idx = T[name]; actx.putImageData(img, (idx%16)*16, Math.floor(idx/16)*16);
}
const mul = (c,f)=>[c[0]*f,c[1]*f,c[2]*f];
function noiseFill(P,r,base,v,a=255){ for(let y=0;y<16;y++)for(let x=0;x<16;x++) P(x,y,mul(base,1-v/2+r()*v),a); }
function copyTile(P, name){ const t=tiles[name].data; for(let i=0;i<256;i++) P(i%16,i>>4,[t[i*4],t[i*4+1],t[i*4+2]],t[i*4+3]); }

const STONE=[125,125,125];
paint('stone',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ let f=0.88+r()*0.18; if(r()<0.08) f=0.72; P(x,y,mul(STONE,f)); }
  for(let k=0;k<5;k++){ let x=r()*16|0,y=r()*16|0; for(let j=0;j<3;j++){ P(x+j,y,mul(STONE,0.75)); } } });
paint('dirt',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ let f=0.85+r()*0.25; const q=r(); if(q<0.1) f=0.68; else if(q<0.16) f=1.18; P(x,y,mul([134,96,67],f)); } });
paint('grass_top',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ let f=0.8+r()*0.3; if(r()<0.1) f=0.68; P(x,y,mul([100,168,58],f)); } });
paint('grass_side',(P,r)=>{ copyTile(P,'dirt'); for(let x=0;x<16;x++){ const d=3+(r()<0.6?1:0)+(r()<0.3?1:0); for(let y=0;y<d;y++) P(x,y,mul([100,168,58],0.78+r()*0.3)); if(r()<0.4) P(x,d,mul([80,140,45],0.9)); } });
paint('snow',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++) P(x,y,mul([242,250,252],0.9+r()*0.1)); });
paint('snow_side',(P,r)=>{ copyTile(P,'dirt'); for(let x=0;x<16;x++){ const d=3+(r()<0.5?1:0)+(r()<0.3?2:0); for(let y=0;y<d;y++) P(x,y,mul([240,248,252],0.9+r()*0.1)); } });
paint('cobble',(P,r)=>{ const pts=[]; for(let i=0;i<11;i++) pts.push([r()*16,r()*16,0.75+r()*0.35]);
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){ let d1=99,d2=99,c=0; for(const p of pts){ for(const ox of [-16,0,16])for(const oy of [-16,0,16]){ const d=Math.hypot(x+0.5-p[0]-ox,y+0.5-p[1]-oy); if(d<d1){d2=d1;d1=d;c=p;} else if(d<d2)d2=d; } }
   const edge=d2-d1<1.1; P(x,y, edge?mul(STONE,0.48+r()*0.1):mul(STONE,c[2]*(0.92+r()*0.14)*(d1<1.5?1.08:1))); } });
paint('bedrock',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const q=r(); P(x,y, mul([110,110,110], q<0.3?0.35:q<0.6?0.6:q<0.85?0.85:1.1)); } });
paint('sand',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ let f=0.92+r()*0.1; if(r()<0.06) f=0.82; P(x,y,mul([222,211,160],f)); } });
paint('sandstone_top',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++) P(x,y,mul([216,203,150],0.94+r()*0.08)); });
paint('sandstone_bottom',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++) P(x,y,mul([206,192,140],0.92+r()*0.1)); });
paint('sandstone_side',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ let f=0.93+r()*0.08; if(y<3) f*=1.04; if(y===3||y===10) f*=0.85; if(y>12) f*=0.95; P(x,y,mul([216,203,150],f)); } });
paint('gravel',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const q=r(); const c=q<0.3?[150,140,135]:q<0.6?[120,115,112]:q<0.8?[95,88,85]:[170,165,160]; P(x,y,mul(c,0.9+r()*0.15)); } });
const BARK=[105,82,50];
paint('log_side',(P,r)=>{ const cols=[]; for(let x=0;x<16;x++) cols.push(0.75+r()*0.35); for(let y=0;y<16;y++)for(let x=0;x<16;x++){ let f=cols[x]*(0.92+r()*0.12); if(r()<0.05) f*=0.7; P(x,y,mul(BARK,f)); } });
paint('spruce_log',(P,r)=>{ const cols=[]; for(let x=0;x<16;x++) cols.push(0.75+r()*0.3); for(let y=0;y<16;y++)for(let x=0;x<16;x++) P(x,y,mul([72,52,32],cols[x]*(0.9+r()*0.15))); });
paint('birch_log',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++) P(x,y,mul([222,220,212],0.9+r()*0.1));
  for(let k=0;k<9;k++){ const x=r()*14|0,y=r()*16|0,l=2+r()*4|0; for(let j=0;j<l;j++) P(x+j,y,mul([50,48,44],0.8+r()*0.4)); } });
paint('log_top',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const d=Math.max(Math.abs(x-7.5),Math.abs(y-7.5)); let c;
  if(d>6.6) c=mul(BARK,0.8+r()*0.2); else { const ring=Math.floor(d)%2; c=mul([176,143,88], (ring?0.88:1)*(0.95+r()*0.08)); } P(x,y,c); } });
function leaves(P,r,base,holes){ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ if(r()<holes){ P(x,y,[0,0,0],0); continue;} let f=0.7+r()*0.45; P(x,y,mul(base,f)); } }
paint('leaves',(P,r)=>leaves(P,r,[62,128,38],0.22));
paint('spruce_leaves',(P,r)=>leaves(P,r,[48,92,58],0.2));
paint('birch_leaves',(P,r)=>leaves(P,r,[110,150,62],0.22));
paint('planks',(P,r)=>{ for(let y=0;y<16;y++){ const board=y>>2; const off=[3,11,7,14][board]; for(let x=0;x<16;x++){ let f=0.9+r()*0.1+(Math.sin((x+board*5)*0.9)*0.04); if((y&3)===3) f=0.62; if(x===off&&(y&3)!==3) f=0.68; P(x,y,mul([166,134,80],f)); } } });
paint('water',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const w=Math.sin((x+y*0.5)*0.8)+Math.sin(y*1.3-x*0.4); let f=0.86+w*0.05+r()*0.06; P(x,y,mul([52,94,214],f),185); } });
paint('water_flow',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ let f=0.88+Math.sin(y*1.1)*0.06+r()*0.06; P(x,y,mul([52,94,214],f),185); } });
paint('lava',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const w=Math.sin(x*0.7+Math.sin(y*0.6)*2)+Math.cos(y*0.8+x*0.3); const t=(w+2)/4; P(x,y,[215+t*40, 70+t*120+r()*20, 10+t*40]); } });
function ore(P,r,col,hi){ copyTile(P,'stone'); const n=4+r()*2|0; for(let k=0;k<n;k++){ const cx=2+r()*12|0, cy=2+r()*12|0; const pix=[[0,0],[1,0],[0,1],[1,1],[-1,0],[0,-1]]; for(const [dx,dy] of pix){ if(r()<0.75) P(cx+dx,cy+dy, mul(col,0.8+r()*0.3)); } P(cx,cy,hi); } }
paint('coal_ore',(P,r)=>ore(P,r,[40,40,40],[70,70,70]));
paint('iron_ore',(P,r)=>ore(P,r,[200,160,130],[230,200,175]));
paint('gold_ore',(P,r)=>ore(P,r,[240,205,50],[255,250,160]));
paint('diamond_ore',(P,r)=>ore(P,r,[80,220,210],[200,255,250]));
paint('glass',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const edge=x===0||y===0||x===15||y===15; if(edge) P(x,y,[200,225,232],255); else if((x-y===4||x-y===5)&&x<9 || (x-y===-6&&x>4&&x<10)) P(x,y,[240,250,255],220); else P(x,y,[0,0,0],0); } });
paint('ct_top',(P,r)=>{ copyTile(P,'planks'); for(let i=0;i<16;i++){ P(i,0,[90,62,35]);P(i,15,[90,62,35]);P(0,i,[90,62,35]);P(15,i,[90,62,35]); } for(let i=2;i<14;i++){ P(i,5,[110,80,48]); P(i,10,[110,80,48]); P(5,i,[110,80,48]); P(10,i,[110,80,48]); } });
function ctSide(P,r,front){ copyTile(P,'planks'); for(let x=0;x<16;x++){ P(x,0,[90,62,35]); P(x,1,[120,90,55]); P(x,2,[90,62,35]); }
  if(front){ for(let y=5;y<13;y++){ P(3,y,[110,110,110]); P(4,y,[140,140,140]); } for(let x=2;x<7;x++) P(x,5,[150,150,150]); for(let y=4;y<14;y++){ P(11,y,[95,70,40]); } for(let x=9;x<14;x++){ P(x,4,[160,160,160]); P(x,5,[120,120,120]); } }
  else { for(let y=4;y<13;y++){ P(4,y,[95,70,40]); P(11,y,[95,70,40]); } for(let x=4;x<12;x++){ P(x,8,[95,70,40]); } } }
paint('ct_side',(P,r)=>ctSide(P,r,false));
paint('ct_front',(P,r)=>ctSide(P,r,true));
paint('furnace_top',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const e=x===0||y===0||x===15||y===15; P(x,y,mul([120,120,120],(e?0.75:0.95)+r()*0.08)); } });
paint('furnace_side',(P,r)=>{ copyTile(P,'cobble'); for(let x=0;x<16;x++){ P(x,0,[95,95,95]); P(x,15,[80,80,80]); } });
function furnaceFront(P,r,lit){ copyTile(P,'furnace_side'); for(let x=3;x<13;x++){ P(x,3,[70,70,70]); P(x,5,[70,70,70]); } for(let y=8;y<14;y++)for(let x=3;x<13;x++){ const edge=y===8||x===3||x===12; P(x,y, edge?[60,60,60]: lit? (y>10? [255,150+r()*80,30]:[200,80,20]) : [25,25,25]); } }
paint('furnace_front',(P,r)=>furnaceFront(P,r,false));
paint('furnace_lit',(P,r)=>furnaceFront(P,r,true));
paint('torch',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++) P(x,y,[0,0,0],0); for(let y=6;y<16;y++){ P(7,y,[120,90,50]); P(8,y,[90,66,36]); } P(7,6,[255,240,140]); P(8,6,[255,200,60]); P(7,7,[255,170,40]); P(8,7,[230,120,20]); P(7,5,[255,255,200]); P(8,5,[255,220,90]); });
paint('cactus_side',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ let f=0.85+r()*0.15; if(x===0||x===15) {P(x,y,[0,0,0],0); continue;} if(x%4===1) f*=0.75; P(x,y,mul([70,140,50],f)); if(x%4===3&&y%5===2) P(x,y,[220,220,170]); } });
paint('cactus_top',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const d=Math.max(Math.abs(x-7.5),Math.abs(y-7.5)); P(x,y,mul([95,160,65],(d>6?0.7:d<3?1.1:0.95)+r()*0.08)); } });
function flower(P,r,petal,center){ for(let y=0;y<16;y++)for(let x=0;x<16;x++) P(x,y,[0,0,0],0); for(let y=8;y<16;y++) P(7,y,[50,120,30]); P(6,11,[60,140,40]); P(5,10,[60,140,40]); P(8,12,[60,140,40]); P(9,11,[60,140,40]);
  for(const [dx,dy] of [[0,-1],[1,0],[-1,0],[0,1],[1,-1],[-1,-1],[1,1],[-1,1],[0,-2],[2,0],[-2,0]]) P(7+dx,6+dy,mul(petal,0.85+r()*0.3)); P(7,6,center); }
paint('rose',(P,r)=>flower(P,r,[210,30,30],[120,10,10]));
paint('dandelion',(P,r)=>flower(P,r,[250,220,40],[240,160,20]));
paint('tallgrass',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++) P(x,y,[0,0,0],0); for(let k=0;k<9;k++){ let x=1+r()*14|0; const h=5+r()*10|0; for(let y=15;y>15-h;y--){ P(x,y,mul([95,160,55],0.7+r()*0.4)); if(r()<0.25) x+= r()<0.5?-1:1; } } });
paint('deadbush',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++) P(x,y,[0,0,0],0); const br=(x,y,dx)=>{ for(let i=0;i<7;i++){ P(x,y,[120,85,45]); y--; if(r()<0.5) x+=dx; } }; br(7,15,-1); br(8,15,1); br(7,12,0); });
paint('bricks',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const row=y>>2; const off=row%2?4:0; const mort=(y&3)===3 || ((x+off)&7)===7; P(x,y, mort? mul([180,170,160],0.9+r()*0.1) : mul([150,70,55],0.85+r()*0.25)); } });
paint('wool',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++) P(x,y,mul([235,235,235],0.88+r()*0.12+((x+y)%3===0?-0.04:0))); });
paint('stonebrick',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const row=y>>3; const off=row?4:0; const mort=(y&7)===7 || ((x+off)&15)===15 || ((x+off)&15)===7&&false; P(x,y, mort? mul(STONE,0.55) : mul(STONE,(0.9+r()*0.12)*((y&7)===0?1.1:1))); } });
paint('ice',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ let f=0.9+r()*0.1; if((x+y*2)%11===0) f=1.1; P(x,y,mul([160,200,250],f)); } });
paint('obsidian',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const q=r(); P(x,y, q<0.1?[70,40,110]:mul([22,16,34],0.8+r()*0.5)); } });

function chestTile(P,r,face){ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const edge=x===0||y===0||x===15||y===15; let f=0.88+r()*0.12; if(!face && (y===5||y===6)) f*=0.6; P(x,y, edge?[70,48,24]:mul([160,112,52],f)); } if(face==='front'){ for(let y=4;y<9;y++)for(let x=6;x<10;x++) P(x,y,(y===4||y===8||x===6||x===9)?[40,40,40]:[200,200,200]); P(7,6,[60,60,60]); P(8,6,[60,60,60]); } }
paint('chest_top',(P,r)=>chestTile(P,r,'top'));
paint('chest_side',(P,r)=>chestTile(P,r,null));
paint('chest_front',(P,r)=>{ chestTile(P,r,null); for(let y=4;y<9;y++)for(let x=6;x<10;x++) P(x,y,(y===4||y===8||x===6||x===9)?[40,40,40]:[205,205,205]); P(7,6,[50,50,50]); P(8,6,[50,50,50]); });
paint('bed_top',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const pillow=y<5&&x>1&&x<14; P(x,y, pillow? mul([235,235,235],0.92+r()*0.08) : mul([170,30,35],0.85+r()*0.2)); if(y===5&&x>0&&x<15) P(x,y,[120,20,25]); } });
paint('bed_side',(P,r)=>{ copyTile(P,'planks'); for(let y=0;y<16;y++)for(let x=0;x<16;x++){ if(y<9) P(x,y, y<2&&x<5? mul([235,235,235],0.95): mul([170,30,35],0.85+r()*0.2)); } });
paint('sapling',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++) P(x,y,[0,0,0],0); for(let y=9;y<16;y++) P(7,y,[100,75,40]); for(let k=0;k<40;k++){ const a=r()*6.28, d=r()*5; const x=7.5+Math.cos(a)*d|0, y=5.5+Math.sin(a)*d*0.8|0; P(x,y,mul([62,128,38],0.7+r()*0.5)); } });

paint('farmland',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const furrow=(y%4)===0; P(x,y, mul([96,64,40], (furrow?0.7:1)*(0.85+r()*0.25))); } });
for (let s=0;s<4;s++) paint('wheat'+s,(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++) P(x,y,[0,0,0],0); const h=4+s*3.5|0;
  for (const bx of [2,5,8,11,14]) { for(let y=15;y>15-h;y--) P(bx+(y%3===0?1:0),y, s<3? mul([80,150,50],0.8+r()*0.3) : mul([170,160,60],0.85+r()*0.2)); if (s>=2) for(let y=15-h;y<18-h;y++) P(bx,y, s===3? mul([220,185,80],0.85+r()*0.2) : mul([150,170,60],0.9)); } });

function doorTile(P,r,top){ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const frame = x<2||x>13||(top?y<2:y>13)||y===7||y===8; let c = mul([150,112,62], (frame?0.8:0.95)+r()*0.1); if (top && x>=3&&x<=12&&y>=3&&y<=11 && !(x===7||x===8||y===7||y===8)) c=[0,0,0]; P(x,y,c, (c[0]===0&&top&&!frame)?0:255); } if(!top){ P(12,2,[60,60,60]); P(12,3,[60,60,60]); } }
paint('ladder',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const rail = x===2||x===3||x===12||x===13; const rung = (y%4===1) && x>3 && x<12; if (rail||rung) P(x,y,mul([140,104,58],(x===3||x===13?0.8:1)*(0.85+r()*0.2))); else P(x,y,[0,0,0],0); } });
paint('cane',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++) P(x,y,[0,0,0],0); for (const bx of [3,8,12]) for(let y=0;y<16;y++){ const node = (y+bx)%6===0; P(bx,y, node? [150,190,100] : mul([110,170,70],0.85+r()*0.2)); P(bx+1,y, node? [120,160,80] : mul([90,145,55],0.85+r()*0.2)); if (y%7===3) P(bx+2,y,[100,160,60]); } });
paint('netherrack',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const q=r(); P(x,y, mul([110,42,40], q<0.15?0.7:q<0.3?1.2:0.9+r()*0.15)); } });
paint('soul_sand',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++) P(x,y,mul([84,64,50],0.8+r()*0.3)); for(let k=0;k<3;k++){ const cx=2+r()*10|0, cy=3+r()*9|0; P(cx,cy,[40,28,22]); P(cx+2,cy,[40,28,22]); P(cx+1,cy+2,[40,28,22]); } });
paint('glowstone',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const q=r(); P(x,y, q<0.2?[255,240,170]: q<0.5?[230,180,90]:[170,120,60]); } });
paint('portal',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const w=Math.sin(x*0.8+Math.sin(y*0.5)*2)*0.5+0.5; P(x,y,[90+w*80, 20+w*30, 180+w*60], 200); } });
paint('quartz_ore',(P,r)=>{ copyTile(P,'netherrack'); for(let k=0;k<6;k++){ const cx=1+r()*13|0, cy=1+r()*13|0; P(cx,cy,[235,225,215]); P(cx+1,cy,[210,200,190]); } });
paint('nether_brick',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const row=y>>2; const off=row%2?4:0; const mort=(y&3)===3 || ((x+off)&7)===7; P(x,y, mort? [30,14,18] : mul([70,32,38],0.85+r()*0.25)); } });
paint('path_top',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++) P(x,y,mul([148,120,70],0.85+r()*0.2)); });
paint('mossy',(P,r)=>{ copyTile(P,'cobble'); for(let k=0;k<40;k++){ P(r()*16|0, r()*16|0, mul([70,110,50],0.8+r()*0.3)); } });
paint('clay',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++) P(x,y,mul([160,166,178],0.92+r()*0.1)); });
paint('red_sand',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++) P(x,y,mul([190,102,50],0.9+r()*0.15)); });
const terra=(c)=>(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++) P(x,y,mul(c,0.93+r()*0.09)); };
paint('terracotta',terra([160,90,62])); paint('terra_white',terra([208,178,160])); paint('terra_red',terra([142,60,46])); paint('terra_brown',terra([76,50,35])); paint('terra_yellow',terra([186,133,35]));
paint('lapis_ore',(P,r)=>ore(P,r,[30,60,170],[90,130,230]));
paint('redstone_ore',(P,r)=>ore(P,r,[180,10,10],[255,80,80]));
const metal=(c,hi)=>(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const e=x===0||y===0||x===15||y===15; const h=(x<2||y<2)?1.15:(x>13||y>13)?0.8:1; P(x,y, mul(c,(e?0.75:h)*(0.95+r()*0.08))); } P(3,3,hi); P(4,3,hi); P(3,4,hi); };
paint('lapis_block',metal([40,70,170],[120,150,240])); paint('iron_block',metal([210,210,210],[255,255,255])); paint('gold_block',metal([240,200,50],[255,250,170])); paint('diamond_block',metal([90,220,210],[210,255,250]));
paint('spawner',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const bar = x%4===0 || y%4===0 || x===15 || y===15; if (bar) P(x,y, mul([40,52,70],0.8+r()*0.4)); else if (Math.hypot(x-7.5,y-7.5)<3.5 && r()<0.5) P(x,y,[255,120+r()*80,40],255); else P(x,y,[0,0,0],0); } });
paint('slab_top',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const e=x===0||y===0||x===15||y===15; P(x,y,mul([160,160,160],(e?0.78:0.95)+r()*0.07)); } });
paint('slab_side',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const e=y===0||y===7||y===8||y===15; P(x,y,mul([160,160,160],(e?0.75:0.94)+r()*0.07)); } });
paint('ench_top',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const e=x<2||y<2||x>13||y>13; P(x,y, e? mul([30,22,44],0.8+r()*0.4) : mul([170,30,40],0.85+r()*0.2)); } for(let x=4;x<12;x++){ P(x,6,[240,230,200]); P(x,9,[240,230,200]); } P(7,7,[90,200,255]); P(8,8,[90,200,255]); });
paint('ench_side',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const top = y<4; P(x,y, top ? mul([170,30,40],0.85+r()*0.2) : (r()<0.08 ? [70,40,110] : mul([22,16,34],0.8+r()*0.5))); } for(let x=0;x<16;x++) P(x,4,[210,180,60]); });
paint('emerald_ore',(P,r)=>ore(P,r,[40,200,90],[160,255,190]));
paint('bookshelf',(P,r)=>{ copyTile(P,'planks'); const cols=[[150,40,40],[40,80,150],[60,120,50],[160,130,50],[110,60,130],[50,50,50]];
  for (const row of [1,9]) { let x=1; while (x<15) { const w = 1 + (r()*2|0); const c = cols[r()*cols.length|0]; const h = 5 + (r()*2|0); for (let dx=0;dx<w&&x+dx<15;dx++) for (let y=row+6-h;y<row+6;y++) P(x+dx,y,mul(c,0.8+r()*0.3)); x += w; } } });
paint('hay_top',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const d=Math.max(Math.abs(x-7.5),Math.abs(y-7.5)); P(x,y,mul([200,170,50],(d>6.5?0.75:0.9)+r()*0.15)); } });
paint('hay_side',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ let f = 0.85 + r()*0.2; if (y===3||y===12) { P(x,y,[150,60,40]); continue; } if (x%3===0) f*=0.85; P(x,y,mul([205,175,55],f)); } });
paint('lantern',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const edge = x<2||x>13||y<2||y>13; const bar = x===7||x===8; const glow = 1 - Math.hypot(x-7.5,y-8)/12; P(x,y, edge? mul([58,62,72],0.85+r()*0.3) : bar ? [70,74,84] : [255, 170+glow*70, 60+glow*60]); } });
const pumpkinBase=(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ let f=0.88+r()*0.12; if (x%4===0) f*=0.8; P(x,y,mul([220,130,30],f)); } };
paint('pumpkin_side',pumpkinBase);
paint('pumpkin_top',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const d=Math.max(Math.abs(x-7.5),Math.abs(y-7.5)); P(x,y,mul([210,125,30],(d<2?0.7:0.9)+r()*0.1)); } P(7,7,[90,110,40]); P(8,7,[90,110,40]); P(7,8,[90,110,40]); });
const face=(lit)=>(P,r)=>{ pumpkinBase(P,r); const c = lit ? [255,220,80] : [70,40,10]; for (const [x,y] of [[3,4],[4,4],[4,5],[11,4],[12,4],[11,5],[3,9],[4,10],[5,10],[6,10],[7,10],[8,10],[9,10],[10,10],[11,10],[12,9],[6,11],[9,11]]) P(x,y,c); };
paint('pumpkin_face',face(false)); paint('jack_face',face(true));
paint('jungle_log',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ let f=0.8+r()*0.25; if ((x+y*3)%7===0) f*=0.7; P(x,y,mul([88,68,32],f)); } for (let k=0;k<6;k++) P(r()*16|0, r()*16|0, [70,110,40]); });
paint('jungle_leaves',(P,r)=>leaves(P,r,[48,150,30],0.18));
paint('swamp_top',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ let f=0.8+r()*0.3; P(x,y,mul([88,110,52],f)); } });
paint('swamp_side',(P,r)=>{ copyTile(P,'dirt'); for(let x=0;x<16;x++){ const d=3+(r()<0.6?1:0); for(let y=0;y<d;y++) P(x,y,mul([88,110,52],0.8+r()*0.3)); } });
paint('lily',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const d=Math.hypot(x-7.5,y-7.5); const notch = x>7 && Math.abs(y-7.5)<x-7.5 && x>9; P(x,y, mul([40,110,30],0.8+r()*0.3), d<7.5 && !notch ? 255 : 0); } });
paint('door_top',(P,r)=>doorTile(P,r,true));
paint('door_bot',(P,r)=>doorTile(P,r,false));

// animated liquids: repaint water & lava tiles each frame step
export function animateLiquids(t) {
  const draw = (name, fn) => { const idx = T[name]; const img = actx.createImageData(16,16); const d = img.data;
    for (let y=0;y<16;y++) for (let x=0;x<16;x++) { const c = fn(x,y); const i=(y*16+x)*4; d[i]=clamp(c[0]); d[i+1]=clamp(c[1]); d[i+2]=clamp(c[2]); d[i+3]=c[3]===undefined?255:c[3]; }
    actx.putImageData(img, (idx%16)*16, Math.floor(idx/16)*16); };
  draw('water', (x,y) => { const w = Math.sin((x + t*1.5)*0.8 + Math.sin(y*0.7 + t)*1.2) + Math.sin(y*1.1 - t*1.2 + x*0.3); const f = 0.86 + w*0.06 + ((x*7+y*13)%5)*0.012; return [52*f, 94*f, 214*f, 185]; });
  draw('portal', (x,y) => { const w = Math.sin(x*0.8 + Math.sin(y*0.5 + t*1.3)*2 + t*2)*0.5+0.5; const v = Math.sin((x+y)*0.4 - t*3)*0.15; return [90+w*90+v*60, 20+w*30, 190+w*60, 175 + w*50]; });
  draw('lava', (x,y) => { const w = Math.sin(x*0.7 + Math.sin(y*0.6 + t*0.5)*2 + t*0.3) + Math.cos(y*0.8 + x*0.3 - t*0.4); const q = (w+2)/4; return [215+q*40, 70+q*130, 10+q*45]; });
}

// cracks
export const crackCanvases = [];
{ const r = rng(1234); const segs=[]; for(let k=0;k<7;k++){ let x=8,y=8; const a=k/7*Math.PI*2+r()*0.5; let dx=Math.cos(a),dy=Math.sin(a); const s=[]; for(let i=0;i<9;i++){ x+=dx; y+=dy; dx+=(r()-0.5)*0.8; dy+=(r()-0.5)*0.8; const l=Math.hypot(dx,dy); dx/=l; dy/=l; s.push([x|0,y|0]); } segs.push(s); }
  for(let st=0;st<10;st++){ const c=document.createElement('canvas'); c.width=c.height=16; const x=c.getContext('2d'); x.fillStyle='rgba(20,20,20,0.6)';
    const len=Math.ceil((st+1)/10*9); for(const s of segs) for(let i=0;i<len;i++){ x.fillRect(s[i][0],s[i][1],1,1); }
    crackCanvases.push(c); } }

// ---------- icons ----------
const ICON_MAPS = {
 compass:["................","................",".....######.....","....#hhhhhh#....","...#hwwwwwwk#...","..#hww.r.wwwk#..","..#hww.r.wwwk#..","..#hwww.r.wwk#..","..#hwwwk.wwwk#..","..#hwwwk.wwwk#..","..#hwwwwwwwwk#..","...#kwwwwwwk#...","....#kkkkkk#....",".....######.....","................","................"],
 clock:["................","................",".....######.....","....#hhhhhh#....","...#hggggggk#...","..#hgggrggggk#..","..#hgggrggggk#..","..#hgggrrrggk#..","..#hkkkkkkkkk#..","..#hkkkkkkkkk#..","..#hkkkkkkkkk#..","...#kkkkkkkk#...","....#kkkkkk#....",".....######.....","................","................"],
 helm:["................","................","................","....########....","...#hddddddd#...","..#hddddddddd#..","..#hdddddddddk#.","..#dd######dk#..","..#d#......#k#..","..#d#......#k#..","..###......###..","................","................","................","................","................"],
 chest:["................","..###......###..",".#hd#......#dk#.",".#hdd######ddk#.",".#hddddddddddk#.","..##hdddddddk##.","....#hdddddk#...","....#hdddddk#...","....#hdddddk#...","....#hdddddk#...","....#ddddddk#...","....#########...","................","................","................","................"],
 legs:["................","................","...##########...","...#hddddddk#...","...#hddddddk#...","...#hddk#hddk#..","...#hdk##hddk#..","...#hdk#.#hdk#..","...#hdk#.#hdk#..","...#hdk#.#hdk#..","...#hdk#.#hdk#..","...#ddk#.#ddk#..","...#####.#####..","................","................","................"],
 boots:["................","................","................","................","................","...###....###...","...#hd#...#hd#..","...#hd#...#hd#..","...#hd#...#hd#..","..#hdd#..#hdd#..",".#hddd#.#hddd#..",".#dddkk.#dddkk..",".#######.######.","................","................","................"],
 egg:["................","................","................","......####......",".....#hwww#.....","....#hwwwww#....","....#wwwwww#....","...#wwwwwwwk#...","...#wwwwwwwk#...","...#wwwwwwkk#...","....#wwwwkk#....",".....#kkkk#.....","......####......","................","................","................"],
 shears:["................","................","..........##....",".........#hw#...","........#hw#....",".......#hw#.....","......#hw#......","...##.#w#.......","..#kk#.#........","..#k.k#hw#......","..#kk#.#hw#.....","...##...#hw#....",".........#hw#...","..........##....","................","................"],
 bucket:["................","................","................","...##########...","..#hddddddddh#..","..#hddddddddh#..","..#wwhhhhhhww#..","...#wwwwwwww#...","...#wwwwwwkw#...","....#wwwwwkw#...","....#wwwwkw#....","....#wwwwkw#....",".....######.....","................","................","................"],
 fns:["................","................","....###.........","...#www#........","..#w#..#w#......","..#w#...#w#.....","...#.....#w#....","..........##....","........###.....",".......#kkk#....","......#kkkkk#...","......#kkhkk#...",".......#kkk#....","........###.....","................","................"],
 paper:["................","................","...##########...","...#wwwwwwww#...","...#wkkkkkww#...","...#wwwwwwww#...","...#wkkkkkkw#...","...#wwwwwwww#...","...#wkkkkwww#...","...#wwwwwwww#...","...#wkkkkkkw#...","...#wwwwwwww#...","...##########...","................","................","................"],
 hoe:["................","........####....",".......#dddd#...","........##sd#...",".........#s#....","........#s#.....",".......#s#......","......#s#.......",".....#s#........","....#s#.........","...#s#..........","..#s#...........","...#............","................","................","................"],
 seeds:["................","................","................","................","......g...g.....","....g...g...g...","......g.g..g....","...g..g...g.....",".....g..g...g...","...g...g..g.....",".....g...g......","................","................","................","................","................"],
 wheat:["................","..........ww....",".........wwkw...","........wwkw....",".......wwkw.....","......wkw.......",".....kgk........","....gg..........","...gg...........","..gg............",".gg.............","................","................","................","................","................"],
 bread:["................","................","................","................","....#######.....","...#hhhhhhh#....","..#hddhddhdd#...","..#dddddddddd#..","..#dddddddddd#..","..#kddddddddk#..","...#kkkkkkkk#...","....########....","................","................","................","................"],
 bow:["................","......###.......","....##sss#......","...#ss##..#.....","..#s#......#....","..#s#.......#...",".#s#.........#..",".#s#.........#..",".#s#.........#..",".#s#........#...","..#s#......#....","..#s#.....#.....","...#ss##.#......","....##sss#......","......###.......","................"],
 stick:["................","................","................","................","................","................","................","................","..........#.....",".........#s.....","........#s......",".......#s.......","......#s........",".....#s.........","................","................"],
 pick:["................","....######......","...#dddddd##....","....##..#sdd#...","........#s.#d#..",".......#s...#d#.","......#s....#d#.",".....#s......##.","....#s..........","...#s...........","..#s............",".#s.............","................","................","................","................"],
 axe:["................","........###.....",".......#ddd#....","......#dddd#....",".......#ss#d#...","......#s#..##...",".....#s#........","....#s#.........","...#s#..........","..#s#...........",".#s#............","................","................","................","................","................"],
 shovel:["................","...........###..","..........#ddd#.","..........#ddd#.","..........#dd#..",".........#s##...","........#s#.....",".......#s#......","......#s#.......",".....#s#........","....#s#.........","...#s#..........","................","................","................","................"],
 sword:["............###.","...........#dd#.","..........#dd#..",".........#dd#...","........#dd#....",".......#dd#.....","..##..#dd#......","..#d##dd#.......","...#dd#.........","....#s##........","...#s#.#d#......","..#s#...##......",".##.............","................","................","................"],
 coal:["................","................","................","......####......","....##kkkk#.....","...#kkhkkkk#....","...#khkkkkk#....","..#kkkkkkkkk#...","..#kkkkkkhkk#...","...#kkkkkkk#....","....#kkkkk#.....",".....#####......","................","................","................","................"],
 ingot:["................","................","................","................","................","......#######...",".....#hhhhhh#...","....#dddddd##...","...#dddddd#d#...","..#########d#...","..#ddddddd#.....","..#########.....","................","................","................","................"],
 gem:["................","................","................",".....######.....","....#hhdddd#....","...#hhdddddd#...","..#hdddddddkd#..","..#dddddddddk#..","...#ddddddkk#...","....#dddddk#....",".....#ddkk#.....","......#dk#......",".......##.......","................","................","................"],
 meat:["................","................","................","......####......","....##dddd#.....","...#ddhhddd#....","..#ddhhddddd#...","..#dddddddddk#..","..#ddddddddkk#..","...#ddddddkk#...","....#dkkkkk#....",".....#####......","................","................","................","................"],
 drum:["................","................","................",".....#####......","....#hdddd#.....","...#hddddd#.....","...#ddddddk#....","...#dddddkk#....","....#dddkk#.....",".....####w#.....","........#ww#....",".........#ww#...","..........##....","................","................","................"],
 apple:["................","........#.......",".......#g##.....","......#.#gg#....","....###.###.....","...#hrrrrrr#....","..#hrrrrrrrr#...","..#rrrrrrrrr#...","..#rrrrrrrrk#...","..#rrrrrrrkk#...","...#rrrrrkk#....","....#rr#rk#.....",".....##.##......","................","................","................"],
 bone:["................","...........##...","..........#ww#..","...........ww#..",".........#w##...","........#w#.....",".......#w#......","......#w#.......",".....#w#........","...##w#.........","..#ww...........","..#ww#..........","...##...........","................","................","................"],
 string:["................","............#...","...........#....","..........#.....",".........#......","........##......","........#.......",".......#........","......##........",".....#..........","....#...........","...#............","..#.............","................","................","................"],
 feather:["................","...........##...","..........#ww#..",".........#www#..","........#wwww#..",".......#wwwk#...","......#wwwk#....",".....#wwwk#.....","....#wwwk#......","....#wwk#.......","...#kk#.........","..#k............",".#..............","................","................","................"],
 powder:["................","................","................","................","................","......###.......",".....#kgk#......","....#gkgkg#.....","...#kgkgkgk#....","..#gkgkgkgkg#...","..#kgkgkgkgk#...","...#########....","................","................","................","................"],
 leather:["................","................","....###.###.....","...#ddd#ddd#....","...#ddddddd#....","....#ddddd#.....","....#dddddk#....","....#ddddkd#....","....#dddddd#....","...#dddddkdd#...","...#ddddddkd#...","....##.##.##....","................","................","................","................"],
 arrow:["................","...........###..","..........#ww#..","..........#w##..",".........#s.....","........#s......",".......#s.......","......#s........",".....#s.........","....#s..........","..#ss...........",".#k#k...........","..#k............","................","................","................"],
};
function hex(c){ const n=parseInt(c.slice(1),16); return [(n>>16)&255,(n>>8)&255,n&255]; }
const iconCache = {};
function drawPixelIcon(name, col) {
  const c = document.createElement('canvas'); c.width = c.height = 16; const x = c.getContext('2d');
  const map = ICON_MAPS[name]; let main = col ? (Array.isArray(col)? hex(col[0]) : hex(col)) : null; let dark = col && Array.isArray(col) ? hex(col[1]) : main ? mul(main,0.6) : null;
  const pal = { s:[120,88,48], k:[40,40,40], h:[255,255,255], w:[235,232,220], g:[60,150,50], r:[200,30,30] };
  if (name==='coal'){ pal.k= main ? main : [35,35,35]; pal.h= main ? mul(main,1.6) : [90,90,90]; }
  if (name==='gem' && !col){ main=[100,235,225]; dark=[30,150,140]; pal.h=[220,255,252]; pal.k=[20,110,104]; }
  if (name==='powder'){ pal.k= main ? main : [70,70,70]; pal.g= main ? mul(main,0.85) : [120,120,120]; }
  if (name==='paper'){ pal.k=[190,190,180]; }
  if (name==='helm'||name==='chest'||name==='legs'||name==='boots'){ pal.h=mul(main,1.2); pal.k=mul(main,0.7); }
  if (name==='compass'){ pal.h=[230,230,235]; pal.k=[120,120,128]; pal.w=[200,200,190]; pal.r=[220,30,30]; }
  if (name==='clock'){ pal.h=[255,240,120]; pal.k=[40,40,90]; pal.g=[120,190,255]; pal.r=[250,220,60]; }
  if (name==='egg'){ pal.w=[236,222,190]; pal.k=[200,180,150]; pal.h=[255,250,235]; }
  if (name==='bucket'){ pal.w=[200,200,205]; pal.k=[150,150,155]; pal.h=[230,230,235]; if (!main) { main=[90,90,95]; dark=[60,60,64]; } }
  if (name==='leather'){ main=[150,85,45]; pal.k=[100,55,25]; }
  if (name==='meat'||name==='drum'){ pal.h=mul(main,1.15); pal.k=dark; }
  if (name==='ingot'){ pal.h=mul(main,1.12); }
  if (name==='bread'){ pal.h=[230,180,100]; pal.k=dark; }
  if (name==='wheat'){ pal.w=[225,195,85]; pal.k=[160,120,40]; pal.g=[120,140,50]; }
  if (name==='seeds'){ pal.g=[110,150,50]; }
  if (name==='feather'){ pal.k=[180,180,180]; }
  for (let yy=0;yy<16;yy++) for (let xx=0;xx<16;xx++){ const ch = map[yy][xx]; let cc=null;
    if (ch==='#') cc = dark ? mul(dark,0.55) : [30,30,30]; else if (ch==='d') cc = main || [150,150,150]; else if (pal[ch]) cc = pal[ch];
    if (cc){ x.fillStyle = `rgb(${clamp(cc[0])},${clamp(cc[1])},${clamp(cc[2])})`; x.fillRect(xx,yy,1,1);} }
  return c;
}
function tileCanvas(t){ const c=document.createElement('canvas'); c.width=c.height=16; c.getContext('2d').drawImage(atlas,(t%16)*16,Math.floor(t/16)*16,16,16,0,0,16,16); return c; }
function drawBlockIcon(id) {
  const d = D[id]; const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  if (d.render !== 'cube' && d.render !== 'cactus' && d.render!=='liquid' && d.render!=='bed' && d.render!=='slab' && d.render!=='stairs') { x.drawImage(tileCanvas(blockTile(id,4,4)),0,0,64,64); return c; }
  const top = tileCanvas(blockTile(id,2,4)), left = tileCanvas(blockTile(id,4,4)), right = tileCanvas(blockTile(id,0,4));
  // isometric: top
  x.save(); x.setTransform(1.6,0.8,-1.6,0.8,32,4); x.drawImage(top,0,0,16,16); x.restore();
  x.save(); x.setTransform(1.6,0.8,0,1.8,6.4,16.8); x.drawImage(left,0,0,16,16); x.fillStyle='rgba(0,0,0,0.25)'; x.fillRect(0,0,16,16); x.restore();
  x.save(); x.setTransform(1.6,-0.8,0,1.8,32,29.6); x.drawImage(right,0,0,16,16); x.fillStyle='rgba(0,0,0,0.45)'; x.fillRect(0,0,16,16); x.restore();
  return c;
}
export function iconURL(id) {
  if (iconCache[id]) return iconCache[id];
  let c; if (id < 256) c = drawBlockIcon(id); else { const it = IT[id]; c = drawPixelIcon(it.icon, it.col); }
  return iconCache[id] = c.toDataURL();
}
export function iconCanvas(id){ if (id<256) return tileCanvas(blockTile(id,4,4)); const it=IT[id]; return drawPixelIcon(it.icon,it.col); }
export const ALL_CREATIVE = [B.GRASS,B.DIRT,B.STONE,B.COBBLE,B.BEDROCK,B.SAND,B.GRAVEL,B.LOG,B.SPRUCE_LOG,B.BIRCH_LOG,B.PLANKS,B.LEAVES,B.SPRUCE_LEAVES,B.BIRCH_LEAVES,
  B.COAL_ORE,B.IRON_ORE,B.GOLD_ORE,B.DIAMOND_ORE,B.GLASS,B.CRAFTING,B.FURNACE,B.TORCH,B.SNOW_GRASS,B.SNOW,B.ICE,B.CACTUS,B.ROSE,B.DANDELION,B.TALLGRASS,B.DEADBUSH,
  B.SANDSTONE,B.BRICKS,B.WOOL,B.STONEBRICK,B.OBSIDIAN,B.CHEST,B.BED,B.SAPLING,B.FARMLAND,B.DOOR,B.LADDER,B.CANE,B.NETHERRACK,B.SOUL_SAND,B.GLOWSTONE,B.QUARTZ_ORE,B.NETHER_BRICK,B.MOSSY,B.CLAY,B.PATH,B.RED_SAND,B.TERRACOTTA,B.TERRA_WHITE,B.TERRA_RED,B.TERRA_BROWN,B.TERRA_YELLOW,B.LILY,B.LAPIS_ORE,B.REDSTONE_ORE,B.LAPIS_BLOCK,B.IRON_BLOCK,B.GOLD_BLOCK,B.DIAMOND_BLOCK,B.JUNGLE_LOG,B.JUNGLE_LEAVES,B.STONE_SLAB,B.PLANK_SLAB,B.COBBLE_SLAB,B.SPAWNER,B.FENCE,B.PUMPKIN,B.JACK,B.BOOKSHELF,B.HAY,B.LANTERN,B.SNOW_LAYER,B.EMERALD_ORE,B.COBBLE_STAIRS,B.PLANK_STAIRS,B.ENCHANT_TABLE,B.WATER,B.LAVA,
  ...Object.values(I)];
