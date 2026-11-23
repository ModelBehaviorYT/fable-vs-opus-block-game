// Block & item definitions, procedural 16x16 pixel-art textures, icons.
export const B = {
  AIR:0, GRASS:1, DIRT:2, STONE:3, COBBLE:4, BEDROCK:5, SAND:6, GRAVEL:7, LOG:8, LEAVES:9, PLANKS:10,
  WATER:11, LAVA:12, COAL_ORE:13, IRON_ORE:14, GOLD_ORE:15, DIAMOND_ORE:16, GLASS:17, CRAFTING:18,
  FURNACE:19, TORCH:20, SNOW_GRASS:21, SNOW:22, CACTUS:23, ROSE:24, DANDELION:25, TALLGRASS:26,
  SANDSTONE:27, BRICKS:28, WOOL:29, STONEBRICK:30, ICE:31, SPRUCE_LOG:32, SPRUCE_LEAVES:33,
  FURNACE_LIT:34, DEADBUSH:35, OBSIDIAN:36, BIRCH_LOG:37, BIRCH_LEAVES:38, CHEST:39, BED:40, SAPLING:41, FARMLAND:42, WHEAT:43, DOOR:44, DOOR_OPEN:45, LADDER:46, CANE:47, NETHERRACK:48, SOUL_SAND:49, GLOWSTONE:50, PORTAL:51, QUARTZ_ORE:52, NETHER_BRICK:53, PATH:54, MOSSY:55, CLAY:56, RED_SAND:57, TERRACOTTA:58, TERRA_WHITE:59, TERRA_RED:60, TERRA_BROWN:61, TERRA_YELLOW:62, LILY:63, SWAMP_GRASS:64, LAPIS_ORE:65, REDSTONE_ORE:66, LAPIS_BLOCK:67, IRON_BLOCK:68, GOLD_BLOCK:69, DIAMOND_BLOCK:70, JUNGLE_LOG:71, JUNGLE_LEAVES:72, SPAWNER:73, STONE_SLAB:74, PLANK_SLAB:75, COBBLE_SLAB:76, FENCE:77, PUMPKIN:78, JACK:79, SNOW_LAYER:80, BOOKSHELF:81, HAY:82, LANTERN:83, EMERALD_ORE:84, COBBLE_STAIRS:85, PLANK_STAIRS:86, ENCHANT_TABLE:87,
  BLOSSOM_LOG:88, BLOSSOM_LEAVES:89, BLOSSOM_PLANKS:90, PETALS:91, SPORE_TURF:92, CAP_BLOCK:93, MUSHROOM_STEM:94, RED_MUSHROOM:95, GLOWCAP:96, PACKED_ICE:97, FROST_BRICKS:98
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
  GHELM:326, GCHEST:327, GLEGS:328, GBOOTS:329, DHELM:330, DCHEST:331, DLEGS:332, DBOOTS:333, EMERALD:334, COMPASS:335, CLOCK:336,
  FROST_SHARD:337, VENISON:338, COOKED_VENISON:339, ROAST_MUSHROOM:340
};

// ---------- tiles ----------
const TILE_NAMES = ['grass_top','grass_side','dirt','stone','cobble','bedrock','sand','gravel','log_side','log_top',
 'leaves','planks','water','lava','coal_ore','iron_ore','gold_ore','diamond_ore','glass','ct_top','ct_side','ct_front',
 'furnace_front','furnace_side','furnace_top','torch','snow_side','snow','cactus_side','cactus_top','rose','dandelion',
 'tallgrass','sandstone_side','sandstone_top','bricks','wool','stonebrick','ice','spruce_log','spruce_leaves',
 'furnace_lit','deadbush','obsidian','birch_log','birch_leaves','sandstone_bottom','water_flow','chest_top','chest_side','chest_front','bed_top','bed_side','sapling','farmland','wheat0','wheat1','wheat2','wheat3','door_top','door_bot','ladder','cane','netherrack','soul_sand','glowstone','portal','quartz_ore','nether_brick','path_top','mossy','clay','red_sand','terracotta','terra_white','terra_red','terra_brown','terra_yellow','lily','swamp_top','swamp_side','lapis_ore','redstone_ore','lapis_block','iron_block','gold_block','diamond_block','jungle_log','jungle_leaves','spawner','slab_top','slab_side','pumpkin_top','pumpkin_side','pumpkin_face','jack_face','bookshelf','hay_top','hay_side','lantern','emerald_ore','ench_top','ench_side',
 'blossom_log','blossom_log_top','blossom_leaves','blossom_planks','petals','spore_top','spore_side','cap_red','mushroom_stem','red_mushroom','glowcap','packed_ice','frost_brick'];
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
def(B.BLOSSOM_LOG,{name:'Blossom Log',tex:['blossom_log_top','blossom_log_top','blossom_log'],hardness:2,tool:'axe',snd:'wood',fuel:15});
def(B.BLOSSOM_LEAVES,{name:'Blossom Leaves',tex:['blossom_leaves'],hardness:0.2,opaque:false,atten:1,drop:0,snd:'grass',leaves:true});
def(B.BLOSSOM_PLANKS,{name:'Blossom Planks',tex:['blossom_planks'],hardness:2,tool:'axe',snd:'wood',fuel:15});
def(B.PETALS,{name:'Fallen Petals',tex:['petals'],solid:false,opaque:false,hardness:0,render:'lily',replace:true,snd:'grass',plant:true});
def(B.SPORE_TURF,{name:'Spore Turf',tex:['spore_top','dirt','spore_side'],hardness:0.6,tool:'shovel',drop:B.DIRT,snd:'grass'});
def(B.CAP_BLOCK,{name:'Red Cap Block',tex:['cap_red'],hardness:0.2,tool:'axe',snd:'wool',drop:B.RED_MUSHROOM});
def(B.MUSHROOM_STEM,{name:'Mushroom Stem',tex:['mushroom_stem'],hardness:0.2,tool:'axe',snd:'wool'});
def(B.RED_MUSHROOM,{name:'Red Mushroom',tex:['red_mushroom'],solid:false,opaque:false,hardness:0,render:'cross',snd:'grass',plant:true,mush:true});
def(B.GLOWCAP,{name:'Glowcap',tex:['glowcap'],solid:false,opaque:false,hardness:0,render:'cross',light:9,snd:'grass',plant:true,mush:true});
def(B.PACKED_ICE,{name:'Packed Ice',tex:['packed_ice'],hardness:0.5,tool:'pick',snd:'glass'});
def(B.FROST_BRICKS,{name:'Frost Bricks',tex:['frost_brick'],hardness:1.5,tool:'pick',tier:1,snd:'stone'});
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
item(I.FROST_SHARD,{name:'Frost Shard',icon:'shard'});
item(I.VENISON,{name:'Raw Venison',icon:'meat',col:['#c8504a','#7e2420'],food:3,sat:1.8});
item(I.COOKED_VENISON,{name:'Cooked Venison',icon:'meat',col:['#a0623a','#5a3216'],food:8,sat:12});
item(I.ROAST_MUSHROOM,{name:'Roasted Mushroom',icon:'mushroom',food:5,sat:6});
export const ITEMS = IT;

export function info(id){ return id < 256 ? D[id] : IT[id]; }
export function itemName(id){ const d = info(id); return d ? d.name : '?'; }
export function maxStack(id){ return id < 256 ? 64 : IT[id].stack; }
export const SMELT = { [B.SAND]:B.GLASS, [B.COBBLE]:B.STONE, [B.IRON_ORE]:I.IRON, [B.GOLD_ORE]:I.GOLD, [B.LOG]:I.COAL, [B.SPRUCE_LOG]:I.COAL, [B.BIRCH_LOG]:I.COAL,
  [I.PORK]:I.COOKED_PORK, [I.BEEF]:I.STEAK, [I.CHICKEN]:I.COOKED_CHICKEN, [B.STONE]:B.STONEBRICK,
  [B.BLOSSOM_LOG]:I.COAL, [B.JUNGLE_LOG]:I.COAL, [I.VENISON]:I.COOKED_VENISON, [B.RED_MUSHROOM]:I.ROAST_MUSHROOM, [B.SNOW]:B.ICE };
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
  const G = (x,y)=>{ const i=(((y%16)+16)%16*16+((x%16)+16)%16)*4; return [d[i],d[i+1],d[i+2],d[i+3]]; };
  fn(P, r, G);
  tiles[name] = img;
  const idx = T[name]; actx.putImageData(img, (idx%16)*16, Math.floor(idx/16)*16);
}
const mul = (c,f)=>[c[0]*f,c[1]*f,c[2]*f];
function copyTile(P, name){ const t=tiles[name].data; for(let i=0;i<256;i++) P(i%16,i>>4,[t[i*4],t[i*4+1],t[i*4+2]],t[i*4+3]); }

// pixel-art helpers: tileable value noise, limited palettes, bevels and rim light
const H = s => { const n=parseInt(s.slice(1),16); return [(n>>16)&255,(n>>8)&255,n&255]; };
const pal = (...a) => a.map(H);
const pick = (p, v) => p[v<=0 ? 0 : v>=1 ? p.length-1 : (v*p.length)|0];
const wrap = v => ((v%16)+16)%16;
function vnoise(r, cell) { const n = Math.max(1, (16/cell)|0); const g = []; for (let i=0;i<n*n;i++) g.push(r());
  const at = (i,j) => g[((j%n)+n)%n*n + ((i%n)+n)%n];
  return (x,y) => { const fx=x/cell, fy=y/cell, x0=Math.floor(fx), y0=Math.floor(fy), tx=fx-x0, ty=fy-y0, sx=tx*tx*(3-2*tx), sy=ty*ty*(3-2*ty);
    const a=at(x0,y0)+(at(x0+1,y0)-at(x0,y0))*sx, b=at(x0,y0+1)+(at(x0+1,y0+1)-at(x0,y0+1))*sx; return a+(b-a)*sy; }; }
function field(r, spec, jit=0.3) { const ns = spec.map(([c,w])=>[vnoise(r,c),w]); const tw = spec.reduce((s,[,w])=>s+w,0)+jit;
  const J = new Float32Array(256); for (let i=0;i<256;i++) J[i]=r();
  return (x,y) => { let s=0; for (const [n,w] of ns) s+=n(x,y)*w; return (s + J[wrap(y)*16+wrap(x)]*jit)/tw; }; }
const contrast = (v,k=2) => Math.max(0, Math.min(0.999, (v-0.5)*k+0.5));
function fillPal(P, f, p, k=2) { for (let y=0;y<16;y++) for (let x=0;x<16;x++) P(x,y,pick(p, contrast(f(x,y),k))); }
const shade = (P,G,x,y,f) => { x=wrap(x); y=wrap(y); const c=G(x,y); P(x,y,mul(c,f),c[3]); };
function bevel(P,G,x0,y0,x1,y1,hi=1.16,lo=0.72) { for (let x=x0;x<=x1;x++){ shade(P,G,x,y0,hi); shade(P,G,x,y1,lo); } for (let y=y0+1;y<y1;y++){ shade(P,G,x0,y,hi); shade(P,G,x1,y,lo); } }
const clearT = P => { for (let i=0;i<256;i++) P(i%16,i>>4,[0,0,0],0); };
// light the top/left side of opaque shapes on a transparent tile and shade the bottom/right side
function rimLight(P,G,hi=1.2,lo=0.7) { const a=[]; for (let i=0;i<256;i++) a.push(G(i%16,i>>4)[3]>0);
  const A=(x,y)=> x>=0&&y>=0&&x<16&&y<16 && a[y*16+x];
  for (let y=0;y<16;y++) for (let x=0;x<16;x++) { if (!A(x,y)) continue; if (!A(x,y-1)||!A(x-1,y)) shade(P,G,x,y,hi); else if (!A(x,y+1)||!A(x+1,y)) shade(P,G,x,y,lo); } }
// grass-like cap on a side face: copies the top tile into the upper rows with ragged drips and a soft shadow below
function capSide(P,r,G,top,base='dirt',deep=2) { copyTile(P,base); const t=tiles[top].data; const n=vnoise(r,4);
  for (let x=0;x<16;x++) { let d = deep + Math.round(n(x,0)*2.2); if (r()<0.22) d += 1 + (r()*2|0);
    for (let y=0;y<d;y++) { const i=((y+5)%16*16+x)*4; let c=[t[i],t[i+1],t[i+2]]; c = mul(c, y===0?1.08 : y===d-1?0.8 : 1-y*0.025); P(x,y,c); }
    shade(P,G,x,d,0.6); shade(P,G,x,d+1,0.82); }
}

const STONE_P = pal('#545454','#626262','#6e6e6e','#797979','#838383','#8e8e8e','#9a9a9a');
paint('stone',(P,r,G)=>{ fillPal(P, field(r,[[8,0.3],[4,0.4],[2,0.3]],0.45), STONE_P, 2.1);
  for (let k=0;k<4;k++){ let x=r()*16|0, y=r()*16|0; const dx=r()<0.5?1:-1; const len=3+(r()*4|0);
    for (let j=0;j<len;j++){ P(wrap(x),wrap(y),H('#474747')); shade(P,G,x,y+1,1.14); x+=dx; if (r()<0.45) y += r()<0.5?1:-1; } } });
const DIRT_P = pal('#4c321f','#5a3d26','#68482d','#765335','#835e3d','#906a47');
paint('dirt',(P,r,G)=>{ fillPal(P, field(r,[[4,0.5],[2,0.3]],0.55), DIRT_P, 2.1);
  for (let k=0;k<8;k++){ const x=r()*16|0, y=r()*16|0; const c = r()<0.5 ? H('#a28d75') : H('#8a7864'); P(x,y,c); if (r()<0.6) P(wrap(x+1),y,mul(c,0.86)); P(x,wrap(y+1),H('#3b2616')); } });
const GRASS_P = pal('#336a1e','#3d7a24','#478a2a','#529831','#5ea639','#6bb342','#7cc150');
function grassTop(P,r,G,p,blades=26){ fillPal(P, field(r,[[8,0.3],[4,0.35],[2,0.35]],0.7), p, 2.0);
  for (let k=0;k<blades;k++){ const x=r()*16|0, y=r()*16|0; P(x,y,p[p.length-1]); P(x,wrap(y+1),p[1]); } }
paint('grass_top',(P,r,G)=>grassTop(P,r,G,GRASS_P));
paint('grass_side',(P,r,G)=>capSide(P,r,G,'grass_top'));
const SNOW_P = pal('#d4dee8','#dfe7ef','#e8eef4','#f0f4f8','#f7f9fb','#ffffff');
paint('snow',(P,r,G)=>{ fillPal(P, field(r,[[8,0.4],[4,0.4]],0.4), SNOW_P, 1.8); for (let k=0;k<10;k++){ const x=r()*16|0, y=r()*16|0; P(x,y,H('#ffffff')); P(wrap(x+1),wrap(y+1),H('#c8d4e2')); } });
paint('snow_side',(P,r,G)=>capSide(P,r,G,'snow','dirt',3));
function cobbleTile(P,r,G,p,mort,n=10,pts){ pts = pts || []; if (!pts.length) for (let i=0;i<n;i++) pts.push([r()*16,r()*16,r()]);
  const id=new Int8Array(256), edge=new Uint8Array(256), dd=new Float32Array(256), oy=new Float32Array(256), ox=new Float32Array(256);
  for (let y=0;y<16;y++) for (let x=0;x<16;x++){ let d1=99,d2=99,c=0,ex=0,ey=0; for (let i=0;i<pts.length;i++){ const p=pts[i]; for (const sx of [-16,0,16]) for (const sy of [-16,0,16]){ const ax=x+0.5-p[0]-sx, ay=y+0.5-p[1]-sy, d=Math.hypot(ax,ay); if(d<d1){d2=d1;d1=d;c=i;ex=ax;ey=ay;} else if(d<d2)d2=d; } }
    const k=y*16+x; id[k]=c; edge[k] = d2-d1 < 1.0 ? 1 : 0; dd[k]=d1; ox[k]=ex; oy[k]=ey; }
  const E=(x,y)=>edge[wrap(y)*16+wrap(x)]; const f=field(r,[[2,1]],0.7);
  for (let y=0;y<16;y++) for (let x=0;x<16;x++){ const k=y*16+x;
    if (E(x,y)) { P(x,y,pick(mort, f(x,y))); continue; }
    // rounded stones: brighter toward the middle and the upper-left, darker toward the lower-right rim
    let v = 0.34 + pts[id[k]][2]*0.3 + Math.max(0, 1 - dd[k]/4.5)*0.25 - (oy[k]+ox[k]*0.6)*0.045 + (f(x,y)-0.5)*0.3;
    if (E(x,y+1) || E(x+1,y)) v -= 0.22; else if (E(x,y-1) || E(x-1,y)) v += 0.12;
    P(x,y,pick(p,v)); } }
const COBBLE_P = pal('#505050','#5e5e5e','#6c6c6c','#7a7a7a','#888888','#979797','#a8a8a8');
paint('cobble',(P,r,G)=>cobbleTile(P,r,G,COBBLE_P,pal('#2e2e2e','#363636','#3e3e3e')));
paint('bedrock',(P,r,G)=>{ const f=field(r,[[4,0.6],[2,0.4]],0.6); fillPal(P,f,pal('#1e1e1e','#353535','#4f4f4f','#6a6a6a','#8a8a8a','#a8a8a8'),2.6); rimLight(P,G,1,1); });
const SAND_P = pal('#c5b27a','#cfbd86','#d8c792','#ded09e','#e6d9ab','#eee3ba');
function sandTile(P,r,G,p){ const f=field(r,[[8,0.25],[2,0.3]],0.7); for (let y=0;y<16;y++) for (let x=0;x<16;x++){ const rip = Math.sin((y + Math.sin(x*Math.PI/8)*1.2)*Math.PI/4)*0.08; P(x,y,pick(p, contrast(f(x,y)+rip,1.8))); }
  for (let k=0;k<6;k++){ const x=r()*16|0, y=r()*16|0; P(x,y,mul(p[1],0.8)); P(wrap(x+1),y,mul(p[p.length-1],1.04)); } }
paint('sand',(P,r,G)=>sandTile(P,r,G,SAND_P));
const SANDSTONE_P = pal('#b9a46c','#c6b179','#d0bc85','#d9c690','#e2d09c','#eadaa9');
paint('sandstone_top',(P,r,G)=>{ fillPal(P, field(r,[[8,0.4],[4,0.3]],0.4), SANDSTONE_P, 1.6); bevel(P,G,0,0,15,15,1.06,0.86); });
paint('sandstone_bottom',(P,r,G)=>{ fillPal(P, field(r,[[4,0.4],[2,0.3]],0.5), SANDSTONE_P, 1.8); for (let k=0;k<3;k++){ let x=r()*16|0, y=r()*16|0; for (let j=0;j<4;j++){ P(wrap(x),wrap(y),SANDSTONE_P[0]); x++; if (r()<0.4) y++; } } });
paint('sandstone_side',(P,r,G)=>{ const f=field(r,[[8,0.3],[2,0.3]],0.5); const strata = vnoise(r,4);
  for (let y=0;y<16;y++) for (let x=0;x<16;x++){ let v = f(x,y)*0.5 + strata(0,y)*0.5; if (y<3) v += 0.15; if (y>12) v -= 0.08; P(x,y,pick(SANDSTONE_P, contrast(v,1.7))); }
  for (let x=0;x<16;x++){ P(x,3,SANDSTONE_P[0]); shade(P,G,x,2,1.08); P(x,12,mul(SANDSTONE_P[0],0.95)); shade(P,G,x,13,1.06); } });
paint('gravel',(P,r,G)=>{ fillPal(P, field(r,[[2,1]],0.6), pal('#4a4542','#56514d','#625c58'), 1.4);
  const ps = pal('#78726d','#8a847e','#9c968f','#827a71','#aca7a1','#746a61','#6a6663'); for (let k=0;k<40;k++){ const x=r()*16|0, y=r()*16|0, w=2+(r()<0.4?1:0), h=1+(r()<0.6?1:0); const c=ps[r()*ps.length|0];
    for (let j=0;j<h;j++) for (let i=0;i<w;i++) P(wrap(x+i),wrap(y+j), i===0&&j===0 ? mul(c,1.2) : (i===w-1&&j===h-1) ? mul(c,0.78) : c); for (let i=0;i<w;i++) shade(P,G,x+i,y+h,0.7); } });

// wood
function bark(P,r,G,p,knots=1){ const f=field(r,[[4,0.3],[2,0.35]],0.6); const tone=[]; for (let x=0;x<16;x++) tone.push((r()-0.5)*0.22);
  for (let y=0;y<16;y++) for (let x=0;x<16;x++) P(x,y,pick(p, 0.32 + f(x,y)*0.5 + tone[x]));
  // broken vertical furrows: dark streaks with a lit ridge on their right
  for (let x=0;x<16;x++) { if (r() < 0.4) continue; let y = r()*16|0, xx = x; let left = 16;
    while (left > 0) { const seg = 3 + (r()*5|0), gap = 1 + (r()*3|0);
      for (let j=0;j<seg && left>0;j++,left--) { P(wrap(xx),wrap(y),pick(p, 0.02 + r()*0.12)); const rt=G(xx+1,y); if (rt[0]+rt[1]+rt[2] > (p[1][0]+p[1][1]+p[1][2])) shade(P,G,xx+1,y,1.14); y++; }
      y += gap; left -= gap; if (r() < 0.3) xx += r()<0.5 ? -1 : 1; } }
  for (let k=0;k<knots;k++){ const x=2+(r()*11|0), y=2+(r()*11|0); P(x,y,p[0]); P(x+1,y,p[0]); P(x,y-1,mul(p[p.length-1],1.05)); P(x+1,y-1,p[p.length-2]); P(x-1,y,p[1]); P(x+2,y,p[1]); P(x,y+1,mul(p[0],1.2)); P(x+1,y+1,p[1]); } }
const OAK_BARK = pal('#3a2a15','#4b371c','#5b4423','#6a502a','#795d31','#88693a');
paint('log_side',(P,r,G)=>bark(P,r,G,OAK_BARK));
paint('spruce_log',(P,r,G)=>bark(P,r,G,pal('#24180c','#30210f','#3c2914','#483219','#553b1e','#614424')));
paint('jungle_log',(P,r,G)=>{ bark(P,r,G,pal('#3f3010','#4e3d16','#5d4a1c','#6c5723','#7b632a','#8a7032'),0); const m=vnoise(r,4);
  for (let y=0;y<16;y++) for (let x=0;x<16;x++) if (m(x,y) > 0.68 && r()<0.6) P(x,y, r()<0.5 ? H('#4f7a24') : H('#3d6a1c')); });
paint('birch_log',(P,r,G)=>{ fillPal(P, field(r,[[8,0.3],[2,0.3]],0.5), pal('#cbc6b6','#d6d2c3','#e0dccf','#e9e6db','#f2f0e8'), 1.6);
  for (let k=0;k<9;k++){ const x=r()*16|0, y=r()*16|0, l=2+(r()*4|0); for (let j=0;j<l;j++){ P(wrap(x+j),y, j===0||j===l-1 ? H('#5b554b') : H('#2c2924')); shade(P,G,x+j,y+1,0.88); } }
  for (let k=0;k<5;k++){ const x=r()*16|0, y=r()*16|0; P(x,y,H('#8c8576')); } });
paint('blossom_log',(P,r,G)=>bark(P,r,G,pal('#2e1a1f','#3b2228','#4a2b31','#58353a','#664044','#744b4e')));
function logTop(P,r,G,bk,wd){ const f=field(r,[[4,1]],0.4);
  for (let y=0;y<16;y++) for (let x=0;x<16;x++){ const dx=x-7.5, dy=y-7.5; const d=Math.max(Math.abs(dx),Math.abs(dy))*0.55 + Math.hypot(dx,dy)*0.45 + (f(x,y)-0.5)*1.4;
    if (x===0||y===0||x===15||y===15) { P(x,y,pick(bk, 0.25+r()*0.6)); continue; }
    let v = (Math.floor(d*0.95) % 2) ? 0.3 : 0.72; v += (r()-0.5)*0.22; if (d < 1.3) v = 0.12; P(x,y,pick(wd,v)); }
  for (let i=1;i<15;i++){ shade(P,G,i,1,0.8); shade(P,G,1,i,0.84); } }
const OAK_WOOD = pal('#8a6a3c','#9c7a46','#ae8a51','#be995c','#cba767','#d6b372');
paint('log_top',(P,r,G)=>logTop(P,r,G,OAK_BARK,OAK_WOOD));
paint('blossom_log_top',(P,r,G)=>logTop(P,r,G,pal('#2e1a1f','#4a2b31','#664044'),pal('#a8606a','#b86f78','#c67f87','#d39096','#dea0a5','#e8b0b4')));
function planksTile(P,r,G,p){ const g=field(r,[[8,0.3],[2,0.25]],0.35);
  for (let b=0;b<4;b++){ const tone=(r()-0.5)*0.2, seam=[3,11,7,14][b], ph=r()*6;
    for (let yy=0;yy<4;yy++){ const y=b*4+yy; for (let x=0;x<16;x++){
      let v = 0.56 + tone + Math.sin(x*Math.PI/8*2 + ph + Math.sin(yy*1.9+b)*1.1)*0.1 + (g(x,y)-0.5)*0.4;
      if (yy===0) v += 0.16; if (yy===2) v -= 0.06;
      if (yy===3) v = 0.02;
      else if (x===seam) v = 0.07; else if (x===wrap(seam+1)) v += 0.14;
      P(x,y,pick(p,v)); } }
    if (r()<0.7) { const nx = wrap(seam-2); P(nx,b*4+1,H('#4a3420')); } } }
const PLANK_P = pal('#56391c','#765630','#866237','#946e3f','#a27b48','#b08851','#be955c');
paint('planks',(P,r,G)=>planksTile(P,r,G,PLANK_P));
paint('blossom_planks',(P,r,G)=>planksTile(P,r,G,pal('#7a3f48','#b06a74','#bf7a83','#cc8a92','#d79aa1','#e2aab0','#ecbac0')));
function leafTile(P,r,G,p,holes=0.17,spark=22){ const f=field(r,[[4,0.45],[2,0.3]],0.7);
  for (let y=0;y<16;y++) for (let x=0;x<16;x++){ const v=contrast(f(x,y),2.3); if (v < holes) P(x,y,[0,0,0],0); else P(x,y,pick(p,(v-holes)/(1-holes))); }
  for (let k=0;k<spark;k++){ const x=r()*16|0, y=r()*16|0; if (!G(x,y)[3]) continue; P(x,y,mul(p[p.length-1],1.08)); if (G(x,y+1)[3]) P(x,wrap(y+1),p[0]); if (G(x+1,y)[3] && r()<0.5) P(wrap(x+1),y,p[p.length-2]); } }
paint('leaves',(P,r,G)=>leafTile(P,r,G,pal('#22491a','#2c5a1f','#376b24','#427c2a','#4e8d31','#5b9d39','#6aac43')));
paint('spruce_leaves',(P,r,G)=>leafTile(P,r,G,pal('#183020','#203c28','#284a30','#305738','#3a6542','#45734d'),0.15));
paint('birch_leaves',(P,r,G)=>leafTile(P,r,G,pal('#3f5e1e','#4b6c24','#58792b','#678934','#76993e','#88aa4a')));
paint('jungle_leaves',(P,r,G)=>leafTile(P,r,G,pal('#174f0e','#1f6214','#28741b','#318622','#3b982a','#47aa34'),0.12));
paint('blossom_leaves',(P,r,G)=>{ leafTile(P,r,G,pal('#b75884','#c76a95','#d67ea6','#e293b7','#eca8c7','#f5bfd7','#fdd8e8'),0.16,14); for (let k=0;k<3;k++){ const x=r()*16|0, y=r()*16|0; if (G(x,y)[3]) P(x,y,H('#fff0f6')); } });

// liquids (static fallbacks; animateLiquids repaints these)
paint('water',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ P(x,y,[44,86,205],180); } });
paint('water_flow',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const f=0.86+Math.sin(y*Math.PI/4)*0.06+r()*0.05; P(x,y,mul([46,90,208],f),185); } });
paint('lava',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ P(x,y,[230,110,20]); } });

// ores: lumps with a dark rim, a lit top-left pixel and a shaded bottom-right
function ore(P,r,G,c,base='stone',n){ copyTile(P,base); const [dk,md,lt,hi]=c.map(H); const N = n || 4+(r()*3|0); const taken=new Set();
  for (let k=0;k<N;k++){ let cx=1+(r()*13|0), cy=1+(r()*13|0), tries=0; while (tries++<20 && [...taken].some(s=>{ const [a,b]=s.split(',').map(Number); return Math.abs(a-cx)<3 && Math.abs(b-cy)<3; })) { cx=1+(r()*13|0); cy=1+(r()*13|0); }
    const set=[[0,0],[1,0],[0,1],[1,1]]; for (const e of [[-1,0],[2,0],[0,-1],[1,-1],[0,2],[1,2],[2,1],[-1,1]]) if (r()<0.3) set.push(e);
    const S=new Set(set.map(([a,b])=>a+','+b)); const has=(a,b)=>S.has(a+','+b);
    for (const [a,b] of set){ if (!has(a,b+1)) shade(P,G,cx+a,cy+b+1,0.62); if (!has(a+1,b)) shade(P,G,cx+a+1,cy+b,0.74); }
    for (const [a,b] of set){ let col = md; if (!has(a,b-1) && !has(a-1,b)) col = lt; else if (!has(a,b+1) || !has(a+1,b)) col = dk; P(wrap(cx+a),wrap(cy+b),col); }
    P(wrap(cx),wrap(cy),hi); taken.add(cx+','+cy); } }
paint('coal_ore',(P,r,G)=>ore(P,r,G,['#141414','#262626','#3a3a3a','#5c5c5c']));
paint('iron_ore',(P,r,G)=>ore(P,r,G,['#8a573a','#b98262','#d6a586','#f2d6c2']));
paint('gold_ore',(P,r,G)=>ore(P,r,G,['#a87a0c','#e0b01e','#f8d840','#fffbc8']));
paint('diamond_ore',(P,r,G)=>ore(P,r,G,['#0f7068','#26b5aa','#5ce8dc','#e0fffc']));
paint('lapis_ore',(P,r,G)=>ore(P,r,G,['#12247a','#1d3fb2','#3a64dc','#9ab4ff']));
paint('redstone_ore',(P,r,G)=>ore(P,r,G,['#6a0000','#ae0808','#e42222','#ff9a9a']));
paint('emerald_ore',(P,r,G)=>ore(P,r,G,['#0a6428','#159c40','#2ed062','#c8ffdc'],'stone',3));

paint('glass',(P,r,G)=>{ clearT(P); for (let i=0;i<16;i++){ P(i,0,H('#eef8fb'),255); P(0,i,H('#e2f1f6'),255); P(i,15,H('#8fb3bd'),255); P(15,i,H('#a2c4cd'),255); }
  P(1,1,H('#ffffff'),255); P(14,14,H('#7aa0aa'),255);
  for (const [x,y] of [[3,6],[4,5],[5,4],[6,3],[4,7],[5,6],[6,5],[7,4],[10,12],[11,11],[12,10]]) P(x,y,H('#ffffff'),150); });
// crafting table, furnace, chest
paint('ct_top',(P,r,G)=>{ copyTile(P,'planks'); const fr=H('#5a3e22'); for(let i=0;i<16;i++){ P(i,0,fr);P(i,15,mul(fr,0.8));P(0,i,fr);P(15,i,mul(fr,0.8)); } bevel(P,G,1,1,14,14,1.12,0.8);
  for(let i=3;i<13;i++){ P(i,5,H('#6a4a2a')); P(i,10,H('#6a4a2a')); P(5,i,H('#6a4a2a')); P(10,i,H('#6a4a2a')); shade(P,G,i,6,1.12); shade(P,G,6,i,1.1); } });
function ctSide(P,r,G,front){ copyTile(P,'planks'); for(let x=0;x<16;x++){ P(x,0,H('#5a3e22')); P(x,1,H('#9a7448')); P(x,2,H('#4a321a')); P(x,15,H('#3e2a16')); }
  if(front){ // saw and hammer hanging on the front
    for(let y=5;y<13;y++){ P(3,y,H('#7a7a7a')); P(4,y,H('#b0b0b0')); P(5,y,H('#8a8a8a')); } for(let y=6;y<13;y+=2) P(5,y,H('#5a5a5a')); for(let y=3;y<6;y++){ P(3,y,H('#6a4a2a')); P(4,y,H('#8a6236')); }
    for(let y=4;y<14;y++){ P(11,y,H('#7a5530')); P(12,y,H('#5a3e22')); } for(let x=9;x<15;x++){ P(x,4,H('#c8c8c8')); P(x,5,H('#8a8a8a')); P(x,6,H('#5e5e5e')); } }
  else { for(let y=4;y<13;y++){ P(4,y,H('#5a3e22')); P(11,y,H('#5a3e22')); shade(P,G,5,y,1.15); shade(P,G,12,y,1.15); } for(let x=4;x<12;x++){ P(x,8,H('#5a3e22')); shade(P,G,x,9,1.12); } } }
paint('ct_side',(P,r,G)=>ctSide(P,r,G,false));
paint('ct_front',(P,r,G)=>ctSide(P,r,G,true));
paint('furnace_top',(P,r,G)=>{ fillPal(P, field(r,[[4,0.4],[2,0.3]],0.5), pal('#5e5e5e','#6a6a6a','#767676','#828282','#8e8e8e'), 1.5); bevel(P,G,0,0,15,15,1.18,0.66); bevel(P,G,2,2,13,13,0.82,1.12); });
paint('furnace_side',(P,r,G)=>{ copyTile(P,'cobble'); for(let x=0;x<16;x++){ P(x,0,H('#7a7a7a')); P(x,1,H('#5a5a5a')); P(x,15,H('#3c3c3c')); } });
function furnaceFront(P,r,G,lit){ copyTile(P,'furnace_side'); for(let x=3;x<13;x++){ P(x,3,H('#3a3a3a')); P(x,4,H('#9a9a9a')); P(x,5,H('#3a3a3a')); }
  for(let y=8;y<14;y++)for(let x=3;x<13;x++){ const rim = y===8||x===3||x===12||y===13; let c;
    if (rim) c = (y===8||x===3) ? H('#2e2e2e') : H('#8a8a8a');
    else if (lit) { const t=(y-9)/4; c = t>0.6 ? (r()<0.5?H('#ffe46a'):H('#ffb830')) : t>0.2 ? H('#ff8a18') : H('#c84010'); }
    else c = y===9 ? H('#141414') : H('#202020');
    P(x,y,c); } }
paint('furnace_front',(P,r,G)=>furnaceFront(P,r,G,false));
paint('furnace_lit',(P,r,G)=>furnaceFront(P,r,G,true));
paint('torch',(P,r)=>{ clearT(P); for(let y=6;y<16;y++){ P(7,y,H('#9a7444')); P(8,y,H('#5e4424')); } P(7,15,H('#6e5230')); P(8,15,H('#3e2c16'));
  P(7,5,H('#fff8d0')); P(8,5,H('#ffe070')); P(7,6,H('#ffd040')); P(8,6,H('#ff9a10')); P(7,7,H('#ff8a10')); P(8,7,H('#c85008')); P(7,4,H('#fff2a8'),200); });
paint('cactus_side',(P,r,G)=>{ const f=field(r,[[4,0.4],[2,0.3]],0.5); const cp=pal('#24521c','#2e6424','#38762c','#438836','#509a40','#5eaa4c');
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){ if(x===0||x===15){ P(x,y,[0,0,0],0); continue; } const rib=x%4; let v = f(x,y)*0.5 + (rib===2?0.38: rib===1?0.15: rib===3?0.05:-0.1); P(x,y,pick(cp,contrast(v+0.2,1.6))); }
  for(let y=1;y<16;y+=5) for(let x=3;x<15;x+=4){ const yy=(y+(x>>2))%16; P(x,yy,H('#f0ecc0')); P(x,wrap(yy+1),H('#3a3418')); } });
paint('cactus_top',(P,r,G)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const d=Math.max(Math.abs(x-7.5),Math.abs(y-7.5)); const c = d>6.5 ? H('#2e6424') : d>5.5 ? H('#5eaa4c') : d<1.5 ? H('#a8c880') : (Math.floor(d)%2 ? H('#448a36') : H('#4f9a40')); P(x,y,mul(c,0.95+r()*0.1)); } });
function flower(P,r,G,pet,center){ clearT(P); const st=pal('#1f5a14','#2e7a1e','#3f9628'); for(let y=8;y<16;y++){ P(7,y,st[1]); P(8,y,st[0]); }
  for (const [x,y] of [[5,11],[6,11],[4,10],[9,12],[10,12],[11,11]]) P(x,y,st[2]); P(6,12,st[0]); P(9,13,st[0]);
  const pp = pal(...pet); for(const [dx,dy] of [[0,-1],[1,0],[-1,0],[0,1],[1,-1],[-1,-1],[1,1],[-1,1],[0,-2],[2,0],[-2,0],[1,-2],[-1,-2],[2,-1],[-2,-1],[0,2]]){ const v = 0.5 - dy*0.18 - dx*0.06 + (r()-0.5)*0.2; P(7+dx,6+dy,pick(pp,v)); P(8+dx,6+dy,pick(pp,v-0.12)); }
  P(7,6,H(center[0])); P(8,6,H(center[1])); P(7,5,H(center[1])); }
paint('rose',(P,r,G)=>flower(P,r,G,['#6a0a10','#a8141c','#d42630','#f04a4a','#ff7a70'],['#ff9a80','#801018']));
paint('dandelion',(P,r,G)=>flower(P,r,G,['#b07a08','#e0a810','#f8cc20','#ffe048','#fff090'],['#c87808','#ffd030']));
function blades(P,r,G,p,n=10){ clearT(P); for(let k=0;k<n;k++){ let x=1+(r()*14|0); const h=5+(r()*10|0); for(let i=0;i<h;i++){ const y=15-i; P(x,y,pick(p, i/h*0.9+0.1+(r()-0.5)*0.15)); if(r()<0.22) x+= r()<0.5?-1:1; x=Math.max(0,Math.min(15,x)); } } }
paint('tallgrass',(P,r,G)=>blades(P,r,G,pal('#2a5a18','#3a7422','#4a8c2c','#5ca238','#70b648','#86c85c')));
paint('deadbush',(P,r,G)=>{ clearT(P); const br=(x,y,dx)=>{ for(let i=0;i<7;i++){ P(x,y,H(i<3?'#5a3a1a':'#8a5a2a')); if (i>3) P(x+1,y,H('#a87038')); y--; if(r()<0.5) x+=dx; } }; br(7,15,-1); br(8,15,1); br(7,12,0); br(9,11,1); });
paint('bricks',(P,r,G)=>{ const bp=pal('#7a3424','#8c3f2c','#9a4932','#a8553a','#b46244','#c0704e'); const mp=pal('#9e958a','#b0a79c','#c2baae'); const f=field(r,[[2,1]],0.8);
  for (let row=0;row<4;row++){ const off=row%2?4:0; for (let b=0;b<2;b++){ const tone=r()*0.5-0.1; const x0=wrap(b*8+off);
    for (let yy=0;yy<4;yy++) for (let xx=0;xx<8;xx++){ const x=wrap(x0+xx), y=row*4+yy; if (yy===3||xx===7) { P(x,y,pick(mp, yy===3?0.2+f(x,y)*0.5:0.5+f(x,y)*0.5)); continue; }
      let v = 0.35+tone+(f(x,y)-0.5)*0.45; if (yy===0) v+=0.2; if (yy===2) v-=0.15; if (xx===0) v+=0.1; if (xx===6) v-=0.12; P(x,y,pick(bp,v)); } } } });
paint('wool',(P,r,G)=>{ const f=field(r,[[4,0.3],[2,0.5]],0.6); const wp=pal('#c8c8c8','#d4d4d4','#dedede','#e8e8e8','#f2f2f2','#fbfbfb'); for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const curl = ((x+y*2)%5===0 ? -0.15 : 0) + ((x*3+y)%7===0 ? 0.12 : 0); P(x,y,pick(wp,contrast(f(x,y)+curl,1.7))); } });
function blockBricks(P,r,G,p,mort,rows=[[0,8,0],[8,8,4]],crack=true){ const f=field(r,[[4,0.4],[2,0.4]],0.5);
  for (const [y0,h,off] of rows) { for (let b=0;b<2;b++){ const x0=b*8+off, tone=(r()-0.5)*0.25;
    for (let yy=0;yy<h;yy++) for (let xx=0;xx<8;xx++){ const x=wrap(x0+xx), y=y0+yy; if (yy===h-1||xx===7) { P(x,y,mort); continue; }
      let v = 0.5+tone+(f(x,y)-0.5)*0.5; if (yy===0||xx===0) v+=0.25; if (yy===h-2||xx===6) v-=0.25; P(x,y,pick(p,v)); }
    if (crack && r()<0.6) { let x=x0+2+(r()*3|0), y=y0+1+(r()*2|0); for (let j=0;j<4 && y<y0+h-1;j++){ P(wrap(x),y,mul(p[0],0.9)); shade(P,G,x+1,y,1.12); y++; if (r()<0.5) x++; } } } } }
paint('stonebrick',(P,r,G)=>blockBricks(P,r,G,STONE_P,H('#3e3e3e')));
paint('ice',(P,r,G)=>{ fillPal(P, field(r,[[8,0.4],[4,0.3]],0.3), pal('#78a2e4','#86aeea','#94baf0','#a2c6f4','#b2d2f8'), 1.6);
  for (let k=0;k<3;k++){ let x=r()*16|0, y=r()*16|0; const dx=r()<0.5?1:-1; for (let j=0;j<7;j++){ P(wrap(x),wrap(y),H('#e2f0ff')); shade(P,G,x,y+1,0.9); x+=dx; if (r()<0.5) y++; } }
  for (let k=0;k<6;k++) P(r()*16|0, r()*16|0, H('#ffffff')); });
paint('obsidian',(P,r,G)=>{ fillPal(P, field(r,[[4,0.5],[2,0.3]],0.5), pal('#0c0814','#130d1f','#1a122a','#221836','#2c2044','#3a2a58'), 2.2);
  for (let k=0;k<7;k++){ const x=r()*16|0, y=r()*16|0; P(x,y,H('#6a4ca8')); P(wrap(x+1),y,H('#4a3478')); P(x,wrap(y+1),H('#0a0610')); } });

function chestTile(P,r,G,face){ const f=field(r,[[8,0.3],[2,0.3]],0.4); const cp=pal('#6a4422','#7e5229','#8f5f31','#a06c3a','#b07a43');
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){ let v = f(x,y) + Math.sin(x*Math.PI/4+y*0.3)*0.05; P(x,y,pick(cp,contrast(v,1.6))); }
  for (let i=0;i<16;i++){ P(i,0,H('#3a2410')); P(0,i,H('#3a2410')); P(i,15,H('#2a1a0a')); P(15,i,H('#2a1a0a')); }
  bevel(P,G,1,1,14,14,1.15,0.78);
  if (face!=='top') { for (let x=1;x<15;x++){ P(x,5,H('#3a2410')); P(x,6,H('#4a2e14')); shade(P,G,x,7,1.15); } } }
paint('chest_top',(P,r,G)=>chestTile(P,r,G,'top'));
paint('chest_side',(P,r,G)=>chestTile(P,r,G,null));
paint('chest_front',(P,r,G)=>{ chestTile(P,r,G,null); for(let y=3;y<9;y++)for(let x=6;x<10;x++){ const e = y===3||y===8||x===6||x===9; P(x,y, e ? H('#2a2a2a') : (y===4||x===7) ? H('#f0f0f0') : H('#b8b8b8')); } P(7,6,H('#3a3a3a')); P(8,6,H('#3a3a3a')); });
paint('bed_top',(P,r,G)=>{ const f=field(r,[[2,1]],0.5); for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const pillow=y<5&&x>1&&x<14; P(x,y, pillow? mul([238,238,238],0.9+f(x,y)*0.12) : mul([176,32,38],0.8+f(x,y)*0.3)); }
  for (let x=2;x<14;x++){ shade(P,G,x,0,1.05); shade(P,G,x,4,0.82); P(x,5,H('#7a1218')); } for (let y=6;y<16;y+=3) for (let x=0;x<16;x++) if ((x+y)%4===0) shade(P,G,x,y,0.88); });
paint('bed_side',(P,r,G)=>{ copyTile(P,'planks'); for(let y=0;y<9;y++)for(let x=0;x<16;x++){ P(x,y, y<2&&x<5? mul([238,238,238],0.95): mul([176,32,38],0.85+r()*0.15)); } for (let x=0;x<16;x++){ shade(P,G,x,0,1.15); P(x,8,H('#6a1015')); } });
paint('sapling',(P,r,G)=>{ clearT(P); for(let y=9;y<16;y++){ P(7,y,H('#6a4a26')); P(8,y,H('#4a3218')); } const lp=pal('#22491a','#2f5f20','#3c7426','#4c8a2e','#5e9e38','#72b244');
  for(let k=0;k<46;k++){ const a=r()*6.28, d=Math.sqrt(r())*5.2; const x=7.5+Math.cos(a)*d|0, y=5.5+Math.sin(a)*d*0.8|0; P(x,y,pick(lp,0.75-(y-1)/10+(r()-0.5)*0.3)); } rimLight(P,G,1.15,0.8); });

paint('farmland',(P,r,G)=>{ const f=field(r,[[4,0.4],[2,0.4]],0.5); const fp=pal('#2e1d10','#3a2614','#47301a','#553a20','#634528','#704f2e');
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const ry=y%4; let v = f(x,y)*0.5 + (ry===0?0.45: ry===1?0.3: ry===2?0.1:-0.15); P(x,y,pick(fp,contrast(v+0.15,1.6))); } bevel(P,G,0,0,15,15,1.08,0.8); });
for (let s=0;s<4;s++) paint('wheat'+s,(P,r,G)=>{ clearT(P); const h=4+s*3.5|0; const gp = s<3 ? pal('#2e6a1c','#3f8a28','#52a234','#68b844') : pal('#8a7020','#a88a2a','#c8a838','#e0c458');
  for (const bx of [2,5,8,11,14]) { for(let y=15;y>15-h;y--) P(bx+(y%3===0?1:0),y, pick(gp, (15-y)/h*0.8+0.1));
    if (s>=2) for(let y=15-h;y<18-h;y++){ P(bx,y, s===3? H('#e8c25a') : H('#9ab84a')); P(bx+1,y, s===3? H('#b08a2a') : H('#6a9030')); } } });

function doorTile(P,r,G,top){ copyTile(P,'planks'); const fr=pal('#5a3e22','#7a5a34','#9a7648');
  for (let y=0;y<16;y++) for (let x=0;x<16;x++){ const frame = x<2||x>13||(top?y<2:y>13)||y===7||y===8; if (frame) P(x,y, pick(fr, (x<2||y<2||y===7) ? 0.95 : 0.2)); }
  if (top) for (let y=3;y<12;y++) for (let x=3;x<13;x++) if (!(x===7||x===8||y===7||y===8)) P(x,y,[0,0,0],0);
  if (top) { for (let x=3;x<13;x++){ if (G(x,2)[3]) shade(P,G,x,2,0.7); } }
  if(!top){ P(12,2,H('#2e2e2e')); P(12,3,H('#8a8a8a')); P(11,3,H('#5a5a5a')); bevel(P,G,3,1,12,12,1.12,0.8); } }
paint('ladder',(P,r,G)=>{ clearT(P); for(let y=0;y<16;y++){ for (const x of [2,12]){ P(x,y,H('#a8804a')); P(x+1,y,H('#7a5a30')); } if (y%4===1) for(let x=4;x<12;x++){ P(x,y,H('#9a7442')); P(x,y+1,H('#5e4424')); } } });
paint('cane',(P,r,G)=>{ clearT(P); for (const bx of [3,8,12]) for(let y=0;y<16;y++){ const node = (y+bx)%6===0; P(bx,y, node? H('#c8e098') : mul(H('#86c25a'),0.9+r()*0.15)); P(bx+1,y, node? H('#8ab060') : mul(H('#5e9a3c'),0.9+r()*0.15)); if (y%7===3) { P(bx+2,y,H('#6ab048')); P(bx+3,y-1,H('#7ac058')); } } });
paint('netherrack',(P,r,G)=>{ fillPal(P, field(r,[[4,0.4],[2,0.4]],0.6), pal('#4a1212','#5c1818','#6e2020','#7f2a28','#903430','#a2403a'), 2.2);
  for (let k=0;k<5;k++){ let x=r()*16|0, y=r()*16|0; for (let j=0;j<4;j++){ P(wrap(x),wrap(y),H('#3a0c0c')); x++; if (r()<0.5) y+= r()<0.5?1:-1; } } });
paint('soul_sand',(P,r,G)=>{ fillPal(P, field(r,[[4,0.4],[2,0.4]],0.6), pal('#3e2e22','#4a382a','#564232','#624c3a','#6e5644'), 1.8);
  for(let k=0;k<3;k++){ const cx=2+(r()*10|0), cy=3+(r()*9|0); for (const [a,b] of [[0,0],[2,0],[1,2],[0,2],[2,2]]) P(cx+a,cy+b,H('#1e140e')); P(cx,cy-1,H('#7a6450')); P(cx+2,cy-1,H('#7a6450')); } });
paint('glowstone',(P,r,G)=>{ fillPal(P, field(r,[[2,1]],0.6), pal('#6a4620','#82582a','#9a6a34'), 1.4); const gp=pal('#c88a3a','#e0aa50','#f2c86a','#ffe49a','#fff6d0');
  for (let k=0;k<14;k++){ const x=r()*16|0, y=r()*16|0; P(x,y,gp[4]); P(wrap(x+1),y,gp[3]); P(x,wrap(y+1),gp[2]); P(wrap(x+1),wrap(y+1),gp[1]); if (r()<0.5) P(wrap(x+2),wrap(y+1),gp[0]); } });
paint('portal',(P,r)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const w=Math.sin(x*0.8+Math.sin(y*0.5)*2)*0.5+0.5; P(x,y,[90+w*80, 20+w*30, 180+w*60], 200); } });
paint('quartz_ore',(P,r,G)=>ore(P,r,G,['#a89888','#d8ccc0','#ece4dc','#ffffff'],'netherrack',6));
paint('nether_brick',(P,r,G)=>{ const bp=pal('#2a1014','#3a161c','#481c24','#56222c','#642a34'); const f=field(r,[[2,1]],0.7);
  for (let row=0;row<4;row++){ const off=row%2?4:0; for (let b=0;b<2;b++){ const tone=r()*0.4-0.1; for (let yy=0;yy<4;yy++) for (let xx=0;xx<8;xx++){ const x=wrap(b*8+off+xx), y=row*4+yy;
    if (yy===3||xx===7) { P(x,y,H('#1a0a0c')); continue; } let v=0.35+tone+(f(x,y)-0.5)*0.4; if (yy===0) v+=0.25; if (yy===2) v-=0.15; P(x,y,pick(bp,v)); } } } });
paint('path_top',(P,r,G)=>{ fillPal(P, field(r,[[4,0.4],[2,0.4]],0.6), pal('#7a5c30','#866638','#927040','#9c7a48','#a88452','#b28e5c'), 1.9); for (let k=0;k<6;k++){ const x=r()*16|0,y=r()*16|0; P(x,y,H('#c0a070')); P(x,wrap(y+1),H('#5a4020')); } bevel(P,G,0,0,15,15,1.06,0.85); });
paint('mossy',(P,r,G)=>{ copyTile(P,'cobble'); const m=vnoise(r,4); const mp=pal('#2e5420','#3a6828','#4a7c32','#5a903c');
  for (let y=0;y<16;y++) for (let x=0;x<16;x++){ const v = m(x,y) + (8-y)*0.02; if (v > 0.55 && r()<0.85) { const g=G(x,y); P(x,y, pick(mp, (g[0]+g[1]+g[2])/600 + (r()-0.5)*0.2)); } } });
paint('clay',(P,r,G)=>{ fillPal(P, field(r,[[8,0.4],[4,0.3]],0.4), pal('#868b99','#9095a2','#9a9fac','#a4a9b5','#aeb3be'), 1.6); for (let k=0;k<5;k++) P(r()*16|0, r()*16|0, H('#7a7f8c')); });
paint('red_sand',(P,r,G)=>sandTile(P,r,G,pal('#a45224','#b05e2a','#bc6a32','#c6763a','#d08244','#da8e4e')));
const terra=(c)=>(P,r,G)=>{ const f=field(r,[[8,0.4],[4,0.3],[2,0.2]],0.3); const b=H(c); for(let y=0;y<16;y++)for(let x=0;x<16;x++) P(x,y,mul(b,0.9+contrast(f(x,y),1.6)*0.16)); for (let k=0;k<4;k++) P(r()*16|0, r()*16|0, mul(b,0.82)); };
paint('terracotta',terra('#a05a3e')); paint('terra_white',terra('#d0b2a0')); paint('terra_red',terra('#8e3c2e')); paint('terra_brown',terra('#4c3223')); paint('terra_yellow',terra('#ba8523'));
const metal=(c,hi,rivet=true)=>(P,r,G)=>{ const p=pal(...c); const f=field(r,[[8,0.5]],0.3);
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){ let v = 0.45 + (f(x,y)-0.5)*0.3 + ((x+y)<10 ? 0.12 : 0) - ((x+y)>22 ? 0.1 : 0); if ((x-y===3 || x-y===4) && x>3 && x<13) v += 0.3; P(x,y,pick(p,v)); }
  bevel(P,G,0,0,15,15,1.22,0.62); bevel(P,G,1,1,14,14,1.08,0.85); P(2,2,H(hi)); P(3,2,H(hi)); P(2,3,H(hi));
  if (rivet) for (const [x,y] of [[2,13],[13,2],[13,13]]) { P(x,y,mul(p[0],0.8)); P(x-1,y-1,H(hi)); } };
paint('lapis_block',metal(['#1a2e88','#22399e','#2c46b4','#3856c8','#4a6ad8'],'#9ab4ff',false)); paint('iron_block',metal(['#a8a8a8','#bcbcbc','#cecece','#dedede','#ececec'],'#ffffff'));
paint('gold_block',metal(['#c08e12','#d8a61c','#ecbe2a','#f8d440','#ffe46a'],'#fffad0')); paint('diamond_block',metal(['#2a9e96','#3cbcb2','#52d6cc','#6ee8de','#9af6ee'],'#e8fffc'));
paint('spawner',(P,r,G)=>{ clearT(P); for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const bar = x%5===0 || y%5===0 || x===15 || y===15; if (bar) P(x,y, (x%5===0&&y%5!==0) ? H('#3a4a62') : H('#26303e')); else if (Math.hypot(x-7.5,y-7.5)<4 && r()<0.55) P(x,y, r()<0.4?H('#ffd060'):H('#ff7a20'),255); }
  for (let i=0;i<16;i++) { if (G(i,0)[3]) P(i,0,H('#5a6e8c')); if (G(0,i)[3]) P(0,i,H('#4e6080')); } });
paint('slab_top',(P,r,G)=>{ fillPal(P, field(r,[[8,0.4],[4,0.3]],0.4), pal('#8c8c8c','#969696','#a0a0a0','#aaaaaa','#b4b4b4'), 1.4); bevel(P,G,0,0,15,15,1.12,0.68); });
paint('slab_side',(P,r,G)=>{ fillPal(P, field(r,[[8,0.4],[4,0.3]],0.4), pal('#8c8c8c','#969696','#a0a0a0','#aaaaaa','#b4b4b4'), 1.4); bevel(P,G,0,0,15,7,1.12,0.7); bevel(P,G,0,8,15,15,1.12,0.7); });
paint('ench_top',(P,r,G)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const e=x<2||y<2||x>13||y>13; P(x,y, e? mul([30,22,44],0.8+r()*0.4) : mul([170,30,40],0.82+r()*0.2)); } bevel(P,G,2,2,13,13,1.15,0.7);
  for(let x=4;x<12;x++){ P(x,6,H('#f2e8cc')); P(x,7,H('#cfc4a8')); P(x,9,H('#f2e8cc')); P(x,10,H('#cfc4a8')); } P(7,7,H('#5ac8ff')); P(8,9,H('#5ac8ff')); });
paint('ench_side',(P,r,G)=>{ copyTile(P,'obsidian'); for(let y=0;y<4;y++) for(let x=0;x<16;x++) P(x,y,mul([170,30,40],0.82+r()*0.2)); for(let x=0;x<16;x++){ P(x,4,H('#e0bc50')); P(x,5,H('#8a6a1a')); shade(P,G,x,0,1.15); } });
paint('bookshelf',(P,r,G)=>{ copyTile(P,'planks'); const cols=['#9a2a2a','#2a5a9a','#3a7a32','#a8862a','#6a3a8a','#3a3a3a','#8a4a1a'];
  for (const row of [1,9]) { for (let x=1;x<15;x++) for (let y=row;y<row+6;y++) P(x,y,H('#2a1a0c')); let x=1; while (x<15) { const w = 1 + (r()*2|0); const c = H(cols[r()*cols.length|0]); const h = 4 + (r()*3|0);
      for (let dx=0;dx<w&&x+dx<15;dx++) for (let y=row+6-h;y<row+6;y++) P(x+dx,y, mul(c, dx===0 ? 1.2 : dx===w-1 && w>1 ? 0.75 : 1)); if (h>4) for (let dx=0;dx<w&&x+dx<15;dx++) P(x+dx,row+6-h+1,H('#e0c870')); x += w; } } });
paint('hay_top',(P,r,G)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const d=Math.max(Math.abs(x-7.5),Math.abs(y-7.5)); const v = d>6.5 ? 0.15 : ((x*3+y*5)%7===0 ? 0.85 : 0.45+r()*0.3); P(x,y,pick(pal('#9a7a1a','#b8962a','#ccaa36','#dcbc44','#ecd060'),v)); } bevel(P,G,1,1,14,14,1.08,0.8); });
paint('hay_side',(P,r,G)=>{ const s=vnoise(r,2); for(let y=0;y<16;y++)for(let x=0;x<16;x++){ let v = s(x,0)*0.6 + r()*0.3 + (y%5===0?0.1:0); P(x,y,pick(pal('#a8861e','#bc9a2a','#ceae36','#dcbe44','#eed25a'),v)); }
  for (const y of [3,12]) for (let x=0;x<16;x++){ P(x,y,H('#7a3a1e')); P(x,y-1,H('#a85a30')); shade(P,G,x,y+1,0.75); } });
paint('lantern',(P,r,G)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const edge = x<2||x>13||y<2||y>13; const bar = x===7||x===8; const glow = 1 - Math.hypot(x-7.5,y-8)/10;
    P(x,y, edge? mul([58,62,72],0.85+r()*0.3) : bar ? [64,68,80] : [255, 160+glow*90, 50+glow*120]); } bevel(P,G,0,0,15,15,1.3,0.6); });
const PUMP = pal('#9a4a08','#b85a0c','#cf6f12','#e0821a','#ec9428','#f6aa3c');
const pumpkinBase=(P,r,G)=>{ const f=field(r,[[8,0.3],[2,0.3]],0.4); for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const rib=x%4; let v = 0.45 + (rib===0?-0.4: rib===2?0.22 : 0.05) + (f(x,y)-0.5)*0.3; if (y===0) v+=0.08; if (y===15) v-=0.12; P(x,y,pick(PUMP,v)); } };
paint('pumpkin_side',pumpkinBase);
paint('pumpkin_top',(P,r,G)=>{ for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const a=Math.atan2(y-7.5,x-7.5), d=Math.hypot(x-7.5,y-7.5); const rib = Math.cos(a*8); P(x,y,pick(PUMP, 0.5+rib*0.25-d*0.02+(r()-0.5)*0.1)); }
  for (const [x,y,c] of [[7,7,'#4a5a1a'],[8,7,'#6a7a28'],[7,8,'#3a4a12'],[8,8,'#4a5a1a'],[8,6,'#7a8a30']]) P(x,y,H(c)); });
const face=(lit)=>(P,r,G)=>{ pumpkinBase(P,r,G); const holes=[[3,4],[4,4],[4,5],[3,5],[11,4],[12,4],[11,5],[12,5],[3,9],[4,10],[5,10],[6,10],[7,10],[8,10],[9,10],[10,10],[11,10],[12,9],[6,11],[9,11],[5,11],[10,11]];
  for (const [x,y] of holes) P(x,y, lit ? (y<8 ? H('#ffe070') : H('#ffc040')) : H('#3a1a05'));
  for (const [x,y] of holes) if (!holes.some(([a,b])=>a===x&&b===y-1)) P(x,y, lit ? H('#fff6b0') : H('#1e0c02')); };
paint('pumpkin_face',face(false)); paint('jack_face',face(true));
paint('swamp_top',(P,r,G)=>grassTop(P,r,G,pal('#3a4a22','#445628','#4e622e','#586e34','#647a3a','#708642')));
paint('swamp_side',(P,r,G)=>capSide(P,r,G,'swamp_top'));
paint('lily',(P,r,G)=>{ const lp=pal('#1e5a14','#28701c','#348424','#40962c'); for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const d=Math.hypot(x-7.5,y-7.5); const notch = x>9 && Math.abs(y-7.5)<x-8.5; const vein = Math.abs(Math.atan2(y-7.5,x-7.5)*4/Math.PI % 1) < 0.12 && d>2;
    P(x,y, vein ? lp[3] : pick(lp, 0.6 - d*0.05 + (r()-0.5)*0.25), d<7.5 && !notch ? 255 : 0); } rimLight(P,G,1.2,0.7); });
paint('door_top',(P,r,G)=>doorTile(P,r,G,true));
paint('door_bot',(P,r,G)=>doorTile(P,r,G,false));

// ---- new blocks: blossom grove, fungal meadow, frost spires ----
paint('petals',(P,r,G)=>{ clearT(P); const pp=pal('#d06a98','#e084ae','#ee9ec4','#f8bad8','#ffd8ea');
  for (let k=0;k<13;k++){ const x=1+(r()*13|0), y=1+(r()*13|0); for (const [a,b] of [[0,0],[1,0],[0,1],[1,1]]) if (r()<0.85) P(x+a,y+b,pick(pp, 0.75-b*0.3-a*0.1+(r()-0.5)*0.2)); if (r()<0.5) P(x,y,H('#ffffff')); } });
paint('spore_top',(P,r,G)=>{ fillPal(P, field(r,[[4,0.4],[2,0.4]],0.7), pal('#4e3f52','#5a4a5e','#66546a','#725f76','#7e6a82','#8c7890'), 2.0);
  for (let k=0;k<18;k++){ const x=r()*16|0, y=r()*16|0; P(x,y, r()<0.5 ? H('#a898ac') : H('#b8a0c0')); P(x,wrap(y+1),H('#3e3042')); } });
paint('spore_side',(P,r,G)=>capSide(P,r,G,'spore_top','dirt',2));
paint('cap_red',(P,r,G)=>{ fillPal(P, field(r,[[8,0.4],[4,0.3]],0.4), pal('#8a1414','#a01a1a','#b42020','#c42828','#d23232'), 1.6);
  const spots=[]; for (let k=0;k<6;k++){ let x,y,t=0; do { x=1+(r()*12|0); y=1+(r()*12|0); } while (t++<30 && spots.some(([a,b])=>Math.abs(a-x)<4&&Math.abs(b-y)<4)); spots.push([x,y]);
    const big=r()<0.5; for (const [a,b] of big?[[0,0],[1,0],[0,1],[1,1],[2,1],[1,2]]:[[0,0],[1,0],[0,1],[1,1]]) P(x+a,y+b,H('#f4ece4')); P(x,y,H('#ffffff')); P(x+1,y+(big?2:1)+ (big?0:1),H('#d0c4b8')); } });
paint('mushroom_stem',(P,r,G)=>{ const f=field(r,[[8,0.3],[2,0.4]],0.5); const sp=pal('#bcb2a0','#c8bea8','#d4cab4','#dfd6c2','#e8e0ce');
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){ const fib = Math.sin(x*Math.PI/4*1.5+Math.sin(y*0.4)*0.6)*0.12; P(x,y,pick(sp,contrast(f(x,y)+fib,1.5))); } });
paint('red_mushroom',(P,r,G)=>{ clearT(P); for(let y=9;y<16;y++){ P(7,y,H('#e8e0ce')); P(8,y,H('#bcb2a0')); }
  for(let y=4;y<9;y++) for(let x=3;x<13;x++){ const d=Math.hypot((x-7.5)/5,(y-8.5)/4.3); if (d<1) P(x,y, y===8 ? H('#7a1010') : (y<6&&x<8) ? H('#e03a3a') : H('#c42222')); }
  for (const [x,y] of [[5,6],[9,5],[10,7],[7,4]]) P(x,y,H('#fff4e8')); });
paint('glowcap',(P,r,G)=>{ clearT(P); for(let y=10;y<16;y++){ P(7,y,H('#a8e8f0')); P(8,y,H('#6ab4c8')); }
  for(let y=6;y<10;y++) for(let x=4;x<12;x++){ const d=Math.hypot((x-7.5)/4,(y-9.5)/3.6); if (d<1) P(x,y, y===9 ? H('#1a6a8a') : (y<8&&x<8) ? H('#9af4ff') : H('#3ac8e8')); }
  for (const [x,y] of [[6,7],[9,8],[8,6]]) P(x,y,H('#ffffff')); P(3,4,H('#bff8ff'),180); P(12,5,H('#bff8ff'),180); P(10,2,H('#e0fcff'),160); });
paint('packed_ice',(P,r,G)=>{ fillPal(P, field(r,[[4,0.4],[2,0.3]],0.4), pal('#5c86ce','#6a93d6','#79a0de','#88aee6','#98bcee'), 1.7);
  for (let k=0;k<5;k++){ let x=r()*16|0, y=r()*16|0; for (let j=0;j<5;j++){ P(wrap(x),wrap(y),H('#c8e0ff')); x++; if (r()<0.5) y+= r()<0.5?1:-1; } } for (let k=0;k<8;k++) P(r()*16|0, r()*16|0, H('#e8f4ff')); });
paint('frost_brick',(P,r,G)=>blockBricks(P,r,G,pal('#6a94d8','#78a2e0','#88b0e8','#98bef0','#aacbf6'),H('#4268a8'),[[0,4,0],[4,4,4],[8,4,0],[12,4,4]],false));

// animated liquids: repaint water & lava tiles each frame step (periodic so the tiles stay seamless)
export function animateLiquids(t) {
  const draw = (name, fn) => { const idx = T[name]; const img = actx.createImageData(16,16); const d = img.data;
    for (let y=0;y<16;y++) for (let x=0;x<16;x++) { const c = fn(x,y); const i=(y*16+x)*4; d[i]=clamp(c[0]); d[i+1]=clamp(c[1]); d[i+2]=clamp(c[2]); d[i+3]=c[3]===undefined?255:c[3]; }
    actx.putImageData(img, (idx%16)*16, Math.floor(idx/16)*16); };
  const K = Math.PI/8;
  draw('water', (x,y) => { const w = Math.sin((x + t*1.5)*K*2 + Math.sin(y*K + t)*1.2) + Math.sin(y*K*2 - t*1.2 + x*K); const f = 0.84 + w*0.06 + ((x*7+y*13)%5)*0.012;
    const hl = w > 1.6 ? 1 : 0; return hl ? [150, 190, 250, 215] : [44*f, 88*f, 210*f, 182]; });
  draw('portal', (x,y) => { const w = Math.sin(x*0.8 + Math.sin(y*0.5 + t*1.3)*2 + t*2)*0.5+0.5; const v = Math.sin((x+y)*0.4 - t*3)*0.15; return [90+w*90+v*60, 20+w*30, 190+w*60, 175 + w*50]; });
  draw('lava', (x,y) => { const w = Math.sin(x*K*2 + Math.sin(y*K + t*0.5)*2 + t*0.3) + Math.cos(y*K*2 + x*K - t*0.4); const q = (w+2)/4;
    if (q < 0.22) return [120+q*200, 30+q*80, 8]; return [215+q*40, 70+q*140, 10+q*60*(q>0.8?2.5:1)]; });
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
 shard:["................","..........##....",".........#hw#...","........#hwd#...",".......#hwdd#...","......#hwddk#...",".....#hwddk#....","....#hwddk#.....","...#wddkk#......","...#ddkk#.......","..#dkk##........","..#k##..........","...#............","................","................","................"],
 mushroom:["................","................","................",".....######.....","....#rhrrrr#....","...#rhhrrwrr#...","..#rrrrrrrrrr#..","..#rwrrrrrwrr#..","..############..","......#ww#......","......#ww#......","......#wwk#.....",".....#wwwk#.....",".....######.....","................","................"],
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
  if (name==='shard'){ main=[120,180,250]; dark=[50,96,180]; pal.h=[240,250,255]; pal.w=[180,220,255]; pal.k=[60,110,200]; }
  if (name==='mushroom'){ pal.r=[176,60,30]; pal.h=[230,140,80]; pal.w=[226,214,190]; pal.k=[160,146,120]; dark=[110,40,20]; }
  // draw, then light the inside edge that faces up/left and shade the edge that faces down/right
  const kind = new Uint8Array(256); // 0 empty, 1 outline, 2 fill
  const img = x.createImageData(16,16), px = img.data;
  for (let yy=0;yy<16;yy++) for (let xx=0;xx<16;xx++){ const ch = map[yy][xx]; let cc=null;
    if (ch==='#') cc = dark ? mul(dark,0.55) : [30,30,30]; else if (ch==='d') cc = main || [150,150,150]; else if (pal[ch]) cc = pal[ch];
    if (cc){ const i=(yy*16+xx)*4; px[i]=clamp(cc[0]); px[i+1]=clamp(cc[1]); px[i+2]=clamp(cc[2]); px[i+3]=255; kind[yy*16+xx] = ch==='#' ? 1 : 2; } }
  const K=(a,b)=> a<0||b<0||a>15||b>15 ? 0 : kind[b*16+a];
  for (let yy=0;yy<16;yy++) for (let xx=0;xx<16;xx++){ if (K(xx,yy)!==2) continue; let f=1;
    if (K(xx,yy-1)!==2 || K(xx-1,yy)!==2) f = 1.2; else if (K(xx,yy+1)!==2 || K(xx+1,yy)!==2) f = 0.78;
    if (f!==1) { const i=(yy*16+xx)*4; px[i]=clamp(px[i]*f+(f>1?8:0)); px[i+1]=clamp(px[i+1]*f+(f>1?8:0)); px[i+2]=clamp(px[i+2]*f+(f>1?8:0)); } }
  x.putImageData(img,0,0);
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
  B.SANDSTONE,B.BRICKS,B.WOOL,B.STONEBRICK,B.OBSIDIAN,B.CHEST,B.BED,B.SAPLING,B.FARMLAND,B.DOOR,B.LADDER,B.CANE,B.NETHERRACK,B.SOUL_SAND,B.GLOWSTONE,B.QUARTZ_ORE,B.NETHER_BRICK,B.MOSSY,B.CLAY,B.PATH,B.RED_SAND,B.TERRACOTTA,B.TERRA_WHITE,B.TERRA_RED,B.TERRA_BROWN,B.TERRA_YELLOW,B.LILY,B.LAPIS_ORE,B.REDSTONE_ORE,B.LAPIS_BLOCK,B.IRON_BLOCK,B.GOLD_BLOCK,B.DIAMOND_BLOCK,B.JUNGLE_LOG,B.JUNGLE_LEAVES,B.STONE_SLAB,B.PLANK_SLAB,B.COBBLE_SLAB,B.SPAWNER,B.FENCE,B.PUMPKIN,B.JACK,B.BOOKSHELF,B.HAY,B.LANTERN,B.SNOW_LAYER,B.EMERALD_ORE,B.COBBLE_STAIRS,B.PLANK_STAIRS,B.ENCHANT_TABLE,
  B.BLOSSOM_LOG,B.BLOSSOM_LEAVES,B.BLOSSOM_PLANKS,B.PETALS,B.SPORE_TURF,B.CAP_BLOCK,B.MUSHROOM_STEM,B.RED_MUSHROOM,B.GLOWCAP,B.PACKED_ICE,B.FROST_BRICKS,B.WATER,B.LAVA,
  ...Object.values(I)];
