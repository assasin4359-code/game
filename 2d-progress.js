/* ---------- campaign: save data, growth, souls and stages ---------- */
const SAVE_KEY = 'bladesummoner_save';
// cls: the class index (see CLASSES). promoShown: the highest class whose promotion scene has played.
// tut: the first-chapter tutorial has been finished
// loadout: the skill in each skill slot (keys L I O H N). ult: which special a Blade God uses ('god' or 'storm')
// trait: the trait worn on each ability ('A' / 'B'); traitOwn: the traits bought ('bladeA': true)
const freshSave = () => ({lv: 200, exp: 0, gold: 0, clear: {}, best: {}, souls: [], upg: {}, seenNew: 0, opened: false, cls: 0, tut: false, promoShown: 0,
  loadout: ['blade', 'fury', 'peak', null, null], ult: 'god', trait: {}, traitOwn: {}});
let save = freshSave();
try {
  const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
  if (s && typeof s === 'object') {
    save = Object.assign(freshSave(), s);
    // saves from the first class version tracked a pending flag instead
    if (!('promoShown' in s)) save.promoShown = s.cls && !s.promoPending ? s.cls : 0;
    delete save.promoPending;
    save.fillLoadout = !('loadout' in s);
  }
} catch (e) {}
function writeSave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} }
function resetSave() { save = freshSave(); writeSave(); }
// a first clear jumps the level straight to the chapter's mark; replays level up slowly through EXP
const expNeed = lv => 40000000 + (lv - 200) * 400000;
const upgLv = k => save.upg[k] | 0;
const hasSoul = k => save.souls.includes(k);
/* growth: bought with gold on the world map */
const UPGRADES = [
  {k: 'atk', name: '공격 단련', max: 5, cost: [1000, 2000, 3500, 5500, 8000], icon: 'atk', desc: ['모든 공격 피해 +8%', '모든 공격 피해 +8%', '모든 공격 피해 +8%', '모든 공격 피해 +8%', '모든 공격 피해 +8%']},
  {k: 'hp', name: '체력 단련', max: 5, cost: [1000, 2000, 3500, 5500, 8000], icon: 'hp', desc: ['최대 HP +15', '최대 HP +15', '최대 HP +15', '최대 HP +15', '최대 HP +15']},
  {k: 'def', name: '방어 단련', max: 3, cost: [1500, 3000, 5000], icon: 'def', desc: ['받는 피해 -8%', '받는 피해 -8%', '받는 피해 -8%']},
  {k: 'crit', name: '치명 단련', max: 3, cost: [1500, 3000, 5000], icon: 'crit', desc: ['치명타 확률 +6%', '치명타 확률 +6%', '치명타 피해 2.5배 → 3배']},
  {k: 'combo', name: '연격 단련', max: 3, cost: [1500, 3000, 5000], icon: 'slash', desc: ['평타 · 공중 베기 피해 +15%', '평타 · 공중 베기 피해 +15%', '그랜드 슬램 충격파 +50%']},
  {k: 'dash', name: '대시 단련', max: 2, cost: [2000, 4000], icon: 'dash', desc: ['대시 재사용 대기시간 -30%', '팬텀 피어스 피해 +50%']},
  {k: 'just', name: '저스트 회피', max: 2, cost: [2000, 4000], icon: 'just', desc: ['저스트 판정 시간 +50%', '시간 감속 지속 +50%']},
  {k: 'drain', name: '투지', max: 2, cost: [3000, 6000], icon: 'drain', desc: ['치명타를 넣으면 HP 1 회복', '치명타 회복량 HP 2']},
  {k: 'adren', name: '아드레날린', max: 2, cost: [3000, 6000], icon: 'adren', desc: ['러시 지속시간 +30%', '부활할 때 HP 30% → 50%']},
  {k: 'fury', name: '검기 오연참', max: 2, cost: [2000, 4000], icon: 'fury', desc: ['검기 크기 · 피해 +25%', '검기 2발 추가 (칠연참)']},
  {k: 'peak', name: '검산', max: 2, cost: [2000, 4000], icon: 'peak', desc: ['솟구치는 대검 +4자루', '재사용 대기시간 -30%']},
  {k: 'blade', name: '천검 소환', max: 2, cost: [2000, 4000], icon: 'blades', desc: ['소환하는 검 +2자루', '일제 폭발 피해 +60%']},
  {k: 'sp', name: '필살기 충전', max: 2, cost: [2500, 5000], icon: 'special', desc: ['SP 획득량 +30%', '전투를 SP 40%로 시작']},
  {k: 'gold', name: '전리품', max: 2, cost: [2000, 5000], icon: 'gold', desc: ['획득 골드 +25%', '획득 골드 +25%']},
];
/* traits (특성): each ability has two, A and B, that change how it works. both can be bought with gold, but only
   one is worn at a time and it can be swapped freely in the skill screen (U on the ability). tier is the class;
   every trait costs the same 2000 gold (the user found the graded prices too steep) */
const TRAIT_COST = [2000, 2000, 2000, 2000];
const TRAITS = {
  combo: {tier: 0, A: {name: '질풍', desc: ['5연타가 35% 빨라지고', '잔상을 끌며 몰아친다.', '대신 한 타의 피해는 10% 줄어든다.']},
    B: {name: '중검', desc: ['5연타가 15% 느려지는 대신', '매 타격마다 불꽃 검기가 날아간다.']}},
  just: {tier: 0, A: {name: '잔상 반격', desc: ['회피한 자리에 남은 잔상이', '곧장 적에게 날아가 세 번 벤다.']},
    B: {name: '시간 정지', desc: ['시간이 느려지는 대신', '0.8초 동안 세상이 완전히 멈춘다.', '(저스트 회피 강화 2단계면 1.2초)']}},
  pierce: {tier: 0, A: {name: '연속 관통', desc: ['찌르기가 끝날 때 J를 누르면', '적 쪽으로 돌아서 다시 찌른다.', '세 번까지 연달아 관통한다.']},
    B: {name: '폭쇄', desc: ['관통이 끝나는 자리에서', '검기가 크게 폭발한다.']}},
  blade: {tier: 0, A: {name: '검무', desc: ['박힌 검들이 폭발하는 대신', '빠졌다 박히며 세 번 더 찌른다.']},
    B: {name: '대검', desc: ['검들 대신 거대한 대검 한 자루가', '적의 머리 위로 떨어져', '넓게 폭발한다.']}},
  fury: {tier: 0, A: {name: '회귀', desc: ['날아간 검기가 멈췄다가', '부메랑처럼 되돌아오며 다시 벤다.']},
    B: {name: '십자', desc: ['마지막 일격이 거대한', 'X자 검기가 되어 관통한다.']}},
  peak: {tier: 0, A: {name: '행진', desc: ['검산이 멈추지 않고', '화면 끝까지 파도처럼 솟는다.']},
    B: {name: '검의 숲', desc: ['솟은 대검이 3초 동안 남아', '닿는 적을 계속 벤다.']}},
  // Blade Master
  flash: {tier: 1, A: {name: '왕복', desc: ['별 모양 베기가 터진 뒤', '같은 길로 되돌아 다시 관통하고', '두 번 더 벤다.']},
    B: {name: '육성참', desc: ['별 모양 베기가 4번에서 6번으로,', '마지막 충격파도 30% 강해진다.']}},
  bloom: {tier: 1, A: {name: '질주 난무', desc: ['돌면서 좌우로 자유롭게 움직이고', '난무가 20% 더 오래 이어진다.']},
    B: {name: '만개', desc: ['마지막 일격 뒤에', '한 번 더 크게 피어나 벤다.']}},
  swallow: {tier: 1, A: {name: '오연', desc: ['적을 꿰뚫는 비행이', '3번에서 5번으로 늘어난다.']},
    B: {name: '낙뢰', desc: ['내려찍는 순간 양옆으로 검산이 솟고', '마지막 일격이 30% 강해진다.']}},
  // Blade Lord
  rain: {tier: 2, A: {name: '폭우', desc: ['검의 비가 좁게 모이는 대신', '두 배로 촘촘하게 쏟아진다.']},
    B: {name: '연쇄 폭발', desc: ['꽂힌 검들이 한꺼번에가 아니라', '한쪽 끝부터 차례로 터져 나간다.']}},
  reign: {tier: 2, A: {name: '쌍익', desc: ['날개의 검이 24자루로 늘고', '휘두를 때마다 두 자루씩 날아간다.']},
    B: {name: '귀환검', desc: ['적을 관통한 검이 사라지지 않고', '되돌아오며 한 번 더 벤다.']}},
  prison: {tier: 2, A: {name: '영겁의 감옥', desc: ['가두는 시간이 세 배로 길어지고', '그동안 검들이 계속 찌른다.']},
    B: {name: '폭검옥', desc: ['마지막에 검들이 바깥으로 터지며', '주변 적 모두에게 큰 피해를 준다.']}},
  march: {tier: 2, A: {name: '유성우', desc: ['작은 대검 12자루가', '빠르게 연달아 쏟아진 뒤', '마지막 대검이 떨어진다.']},
    B: {name: '천붕', desc: ['모든 대검이 하나로 합쳐진', '거대한 검 한 자루가 떨어진다.']}},
  // Blade God
  formless: {tier: 3, A: {name: '무한검', desc: ['무형검의 지속시간이', '5초에서 8초로 늘어난다.']},
    B: {name: '무아', desc: ['무형검이 이어지는 동안', '모든 스킬의 재사용 대기시간이', '두 배로 빨리 줄어든다.']}},
  domain: {tier: 3, A: {name: '확장', desc: ['검역이 1.5배 넓어지고 오래 간다.', '대신 한 번 베는 피해는', '조금 줄어든다.']},
    B: {name: '반격역', desc: ['검역에 들어온 적의 탄을', '베어 없애는 대신', '적에게 되돌려 쏜다.']}},
  resonance: {tier: 3, A: {name: '공명 증폭', desc: ['폭발 범위 1.5배, 피해 30% 증가,', '공명하는 검이 최대 32자루.']},
    B: {name: '재공명', desc: ['공명이 끝나면 내리꽂은 검 8자루가', '한 번 더 울리며 터진다.']}},
};
const traitOf = id => (save.trait && save.trait[id]) || null;
const traitOwned = (id, k) => !!(save.traitOwn && save.traitOwn[id + k]);
const traitCost = id => TRAIT_COST[TRAITS[id].tier];
// what the growth upgrades add up to
const critBonus = () => Math.min(2, upgLv('crit')) * 0.06;
const critMult = () => upgLv('crit') >= 3 ? 3 : 2.5;
const hurtMult = () => 1 - upgLv('def') * 0.08;
const comboMult = () => 1 + Math.min(2, upgLv('combo')) * 0.15;
const adrenMax = () => upgLv('adren') >= 1 ? 936 : 720;
const goldMult = () => 1 + upgLv('gold') * 0.25;
/* classes: each boss's level jump carries the hero up a rank - Blade Master at LV.300 (the Bowmaster),
   Blade Lord at LV.400 (the Gunner), Blade God at LV.500 (the Samurai). atk/hp are the totals over the base */
const CLASSES = [
  {name: '블레이드 서머너', en: 'BLADE SUMMONER', atk: 1, hp: 0},
  {name: '블레이드 마스터', en: 'BLADE MASTER', atk: 1.15, hp: 15, lv: 300},
  {name: '블레이드 로드', en: 'BLADE LORD', atk: 1.3, hp: 30, lv: 400},
  {name: '블레이드 갓', en: 'BLADE GOD', atk: 1.5, hp: 50, lv: 500},
];
const heroClass = () => CLASSES[save.cls | 0];
const isMaster = () => (save.cls | 0) >= 1;
const isLord = () => (save.cls | 0) >= 2;
const isGod = () => (save.cls | 0) >= 3;
const classForLv = lv => CLASSES.reduce((c, k, i) => k.lv && lv >= k.lv ? i : c, 0);
const levelAtk = (lv = save.lv) => 1 + (lv - 200) * 0.002;
const atkMult = () => levelAtk() * heroClass().atk * (1 + upgLv('atk') * 0.08);
const maxHpNow = () => 100 + Math.floor((save.lv - 200) * 0.15) + heroClass().hp + upgLv('hp') * 15;
// attack power as shown on the status screens
const atkPower = () => Math.round(10000 * atkMult());
const spMult = () => upgLv('sp') ? 1.3 : 1;
const justWin = () => upgLv('just') >= 1 ? 16 : 11;
const slowDur = () => upgLv('just') >= 2 ? 144 : 96;
/* souls: the defeated boss's power, granted on the first clear */
const SOULS = {
  bow: {name: '궁수의 혼', desc: ['저스트 회피에 성공하면 초록 영혼의 화살', '4발이 날아가 적을 추적해 꿰뚫는다.'], col: C.G2},
  gun: {name: '총잡이의 혼', desc: ['팬텀 피어스가 적중하면 황금 탄환 5발이', '뒤따라 날아가 적에게 박힌다.'], col: C.Y},
  sword: {name: '검객의 혼', desc: ['저스트 회피에 성공하면 적의 등 뒤로', '순간이동해 발도 일섬을 날린다.'], col: C.B},
  chain: {name: '군주의 혼', desc: ['필살기 천지 가르기의 마지막 일격이 두 배가 되고', '베인 적은 사슬에 묶여 더 오래 무너진다.'], col: C.R},
};
/* stages: the four regions of the chained Earth. sealed ones are the next chapters */
const STAGES = [
  {id: 1, key: 'bow', region: 'NORTH', area: '사슬의 묘지', chap: '제1장', boss: '래피드 파이어 보우마스터', en: 'RAPID FIRE BOWMASTER', lv: 400, rec: 200, lvTo: 300,
    hp: 14000000, reward: 1, soul: 'bow', col: C.G2, dark: C.G1, light: C.G3, ult: '신록의 심판', map: [330, 64]},
  {id: 2, key: 'gun', region: 'WEST', area: '황혼의 거리', chap: '제2장', boss: '불릿 헬 슈터', en: 'BULLET HELL SHOOTER', lv: 550, rec: 300, lvTo: 400,
    hp: 22000000, reward: 1.5, soul: 'gun', col: C.Y, dark: '#8a0a14', light: '#ffe98a', ult: '불릿 헬', map: [246, 150]},
  {id: 3, key: 'sword', region: 'EAST', area: '달빛 공원', chap: '제3장', boss: '월광 어쌔신', en: 'MOONLIGHT ASSASSIN', lv: 700, rec: 400, lvTo: 500,
    hp: 40000000, reward: 2, soul: 'sword', col: C.B, dark: '#10205e', light: '#8fa0e6', ult: '월하난참', map: [414, 146]},
  {id: 4, key: 'chain', region: 'SOUTH', area: '어둠의 망각', chap: '최종장', boss: '사슬의 군주', en: 'CHAIN SOVEREIGN', lv: 999, rec: 500, lvTo: 600,
    hp: 80000000, reward: 2.5, soul: 'chain', col: C.R, dark: '#5a0008', light: '#f5b5ba', ult: '천지 가르기', map: [330, 230], final: true},
  // hidden: appears at the centre of the Earth once all four are free - the Master of Chains, the hero's original.
  // three phases, no minions
  {id: 5, key: 'origin', region: '???', area: '???', chap: '히든', boss: '사슬의 주인', en: 'THE ORIGINAL', lv: '???', rec: 600, lvTo: 999,
    hp: 100000000, reward: 3, soul: null, col: C.P, dark: C.K, light: '#d8b8e8', ult: '일검무귀', map: [330, 146], hidden: true, noMini: true},
];
let stage = STAGES[0];
const MAIN_STAGES = STAGES.filter(s => !s.hidden);
const stageOpen = s => !s.sealed && (s.id === 1 || !!save.clear[s.id - 1]);
// the stages on the world map: the hidden one only once all four chains are broken
const mapStages = () => STAGES.filter(s => !s.hidden || save.clear[4]);
const clearedCount = () => MAIN_STAGES.filter(s => save.clear[s.id]).length;
/* skills: the active skills go into the skill slots (a Summoner has 3, a Master and Lord 4, a God 5); the techniques
   are always at hand. cls: the class that unlocks it */
const SLOT_KEYS = ['L', 'I', 'O', 'H', 'N'];
const SLOT_COUNT = [3, 4, 4, 5];
const slotCount = () => SLOT_COUNT[save.cls | 0];
const SKILLS = {
  blade: {name: '천검 소환', icon: 'blades', cls: 0, cd: 200, desc: ['붉은 마법진에서 검들을 불러내 적에게 날린다.', '마지막 검이 박히는 순간 모두 함께 폭발한다.']},
  fury: {name: '검기 오연참', icon: 'fury', cls: 0, cd: 150, desc: ['다섯 번 베며 초승달 검기를 날린다.', '대시 도중에도 곧바로 쓸 수 있다.']},
  peak: {name: '검산', icon: 'peak', cls: 0, cd: 420, desc: ['검을 땅에 꽂아 앞쪽으로', '대검의 산을 솟구치게 한다.']},
  rain: {name: '만검우', icon: 'rain', cls: 2, cd: 720, desc: ['적의 머리 위 하늘에 마법진을 열고', '검의 비를 쏟아부은 뒤 한꺼번에 터뜨린다.']},
  // Blade Master: the sword mastered - fast and dazzling
  flash: {name: '섬광일섬', icon: 'flash', cls: 1, cd: 300, desc: ['눈에 보이지 않는 속도로 적을 꿰뚫고 지나간다.', '잠시 뒤 잔상들이 같은 궤적을 다시 벤다. 대시 중에도 사용.']},
  bloom: {name: '백화난무', icon: 'bloom', cls: 1, cd: 420, desc: ['제자리에서 사방으로 검광을 흩뿌리는 난무.', '키를 누르고 있으면 더 길게, 마지막은 올려베기.']},
  swallow: {name: '비연삼단', icon: 'swallow', cls: 1, cd: 480, desc: ['적을 X자로 가르고 한 번 더 꿰뚫은 뒤', '하늘 높이서 내리찍는다. (무적)']},
  // Blade Lord: the swords commanded
  reign: {name: '천검군림', icon: 'reign', cls: 2, cd: 900, desc: ['등 뒤에 검 18자루의 날개를 펼친다. 6초 동안', '평타가 적중할 때마다 검이 날아가 추가타.']},
  prison: {name: '검옥', icon: 'prison', cls: 2, cd: 600, desc: ['적을 검의 원으로 가두어 잠시 묶고,', '모든 검이 한꺼번에 찔러 들어간다.']},
  march: {name: '천붕검', icon: 'march', cls: 2, cd: 780, desc: ['하늘에 균열을 열고 거대한 대검들을 비스듬히', '연달아 내리꽂는다. 마지막 한 자루는 두 배로 크다.']},
  // Blade God: the hero become the sword
  formless: {name: '무형검', icon: 'formless', cls: 3, cd: 900, desc: ['팔 자체가 검이 된다. 5초 동안 평타가', '거리와 상관없이 화면의 모든 적에게 닿는다.']},
  domain: {name: '검역', icon: 'domain', cls: 3, cd: 840, desc: ['주변 공간 자체가 검이 된다. 4초 동안 영역 안의', '적은 계속 베이고 날아드는 탄환은 베어져 사라진다.']},
  resonance: {name: '천지검명', icon: 'reso', cls: 3, cd: 720, desc: ['적 주위에 검 8자루를 꽂고, 화면에 있는 내 검이', '모두 공명해 차례로 폭발한다. 검이 많을수록 강하다.']},
};
const SKILL_ORDER = ['blade', 'fury', 'peak', 'flash', 'bloom', 'swallow', 'rain', 'reign', 'prison', 'march', 'formless', 'domain', 'resonance'];
const TECHS = [
  {name: '5연타 · 그랜드 슬램', icon: 'slash', key: 'J 연타', cls: 0, desc: ['베기, 되베기, 올려베기, 회전 베기를 몰아친 뒤', '공중제비 내려찍기로 마무리한다. 마지막 일격은 충격파.']},
  {name: '저스트 회피', icon: 'dash', key: '공격 직전 K', cls: 0, desc: ['공격이 닿기 직전에 대시하면 시간이 느려지고', '다음 일격이 반드시 치명타 반격이 된다.']},
  {name: '팬텀 피어스', icon: 'dash', key: '대시 중 J', cls: 0, desc: ['대시에서 곧장 관통 찌르기로 이어진다.', '적을 꿰뚫고 방패도 무시한다.']},
  {name: '메테오 플런지', icon: 'peak', key: '공중 S+J', cls: 0, desc: ['공중에서 검을 아래로 꽂으며 떨어져', '착지한 자리 양옆으로 검산을 일으킨다.']},
  {name: '승룡검', icon: 'rising', key: '땅에서 S+J', cls: 1, desc: ['솟구치며 올려 베는 대공기.', '공중에 뜬 적을 벨 때 쓴다.']},
];
const ULTS = {
  storm: {name: '천지 가르기', icon: 'special', cls: 0, desc: ['온 화면을 수십 번 베어 가르고', '마지막 일격으로 세상을 둘로 가른다.']},
  god: {name: '일검무귀', icon: 'god', cls: 3, desc: ['SP 전부와 HP 20%를 바쳐 모든 기운을 대검에 모으고,', '단 한 번 횡으로 벤다. 베인 것은 모두 한쪽으로 날아간다.']},
};
const skillUnlocked = id => SKILLS[id] && SKILLS[id].cls <= (save.cls | 0);
const useGodUlt = () => isGod() && save.ult !== 'storm';
/* drop anything locked or duplicated; with fill (a promotion, or a save from before loadouts) also put unlocked
   skills not yet equipped into the empty slots */
function fixLoadout(fill) {
  const n = slotCount(), seen = new Set(), out = [];
  for (let i = 0; i < 5; i++) { const id = (save.loadout || [])[i]; out.push(i < n && id && skillUnlocked(id) && !seen.has(id) ? (seen.add(id), id) : null); }
  if (fill) for (const id of SKILL_ORDER) { if (seen.has(id) || !skillUnlocked(id)) continue; const k = out.findIndex((v, i) => !v && i < n); if (k < 0) break; out[k] = id; seen.add(id); }
  save.loadout = out;
}
// older saves: each cleared chapter is worth its level jump and the class that comes with it; any promotion
// scene not yet seen plays on the way to the world map
{
  const want = STAGES.reduce((m, s) => save.clear[s.id] ? Math.max(m, s.lvTo) : m, 200);
  if (save.lv < want) { save.lv = want; save.exp = 0; }
  save.cls = Math.max(save.cls | 0, classForLv(save.lv));
  if (save.clear[1]) save.tut = true;
  fixLoadout(save.fillLoadout); delete save.fillLoadout;
}
