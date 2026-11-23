/* Syeng 測驗：選擇式／入力式，難易度，音韻地位による絞り込み，白氏拼音での解答 */
'use strict';
const QL = {
  zh: {
    mode: '作答方式', choice: '選擇', input: '輸入', level: '難度', easy: '易', normal: '中', hard: '難',
    disp: '音韻地位的作答形式', dispDw: '音韻地位', dispBx: '白氏拼音（Baxter）',
    filter: '出題範圍', all: '全部', she: '攝', yun: '韻', deng: '等', hu: '開合', zu: '組', sheng: '聲調',
    submit: '作答', showAns: '看答案', ansIs: '答案：', placeholder: '輸入答案', noPool: '此範圍內沒有可出的題目。',
    levelNote: '易：隨機選項，拼音不計聲調；中：選項較接近；難：選項只差一個特徵（如同韻不同等、同聲母不同韻）。',
    inputNote: '輸入式：拼音可用聲調符號或數字（如 shang4）；音韻地位可按任意順序輸入（如 見合三陽平），也可輸入白氏拼音或切韻拼音；上古擬音可用下方按鈕輸入特殊符號。',
    'k.韻目拼音': '韻目拼音', 'k.四聲相承': '四聲相承', 'k.韻目歸攝': '韻目歸攝', 'k.聲母清濁': '聲母清濁',
    'k.字的聲母': '字的聲母', 'k.字的等': '字的等', 'k.字的開合': '字的開合', 'k.字的韻': '字的韻', 'k.字的聲調': '字的聲調', 'k.字的攝': '字的攝',
    'k.字的音韻地位': '字的音韻地位', 'k.字的中古音': '字的白氏拼音', 'k.上古到中古': '上古到中古', 'k.中古到上古': '中古到上古',
    'k.字的上古韻部': '字的上古韻部', 'k.詩經韻腳歸部': '詩經韻腳歸部', 'k.術語拼音': '術語拼音', 'k.Starostin': 'Starostin 到中古',
    qMu: '的聲母？', qDeng: '屬幾等？', qHu: '開口還是合口？', qYun: '屬哪個韻（舉平以賅上去入）？', qSheng: '的聲調？', qSheC: '屬哪一攝？',
    qDw: '的音韻地位？', qBx: '的白氏拼音（Baxter 中古音）？', qOcMc: '的中古音（白氏拼音）？', qMcOc: '的白—沙上古擬音？', qSt: '（Starostin 1989）的中古音？',
  },
  ja: {
    mode: '答え方', choice: '選択式', input: '入力式', level: '難易度', easy: 'やさしい', normal: 'ふつう', hard: 'むずかしい',
    disp: '音韻地位の答え方', dispDw: '音韻地位', dispBx: '白氏拼音（Baxter）',
    filter: '出題範囲', all: 'すべて', she: '摂', yun: '韻', deng: '等', hu: '開合', zu: '組', sheng: '声調',
    submit: '答える', showAns: '答えを見る', ansIs: '答え：', placeholder: '答えを入力', noPool: 'この範囲では出題できる問題がありません。',
    levelNote: 'やさしい：選択肢は無作為で，拼音の声調は問いません。ふつう：似た選択肢が混ざります。むずかしい：一つの特徴だけが違う選択肢が出ます。同じ韻で等だけ違う，同じ声母で韻だけ違う，などです。',
    inputNote: '入力式では，拼音は声調記号でも数字でも入力できます（shang4 など）。音韻地位は順不同で入力でき（見合三陽平 など），白氏拼音や切韻拼音でも答えられます。上古の再建音は下のボタンで特殊記号を入力できます。',
    'k.韻目拼音': '韻目の拼音', 'k.四聲相承': '四声相承', 'k.韻目歸攝': '韻目の摂', 'k.聲母清濁': '声母の清濁',
    'k.字的聲母': '字の声母', 'k.字的等': '字の等', 'k.字的開合': '字の開合', 'k.字的韻': '字の韻', 'k.字的聲調': '字の声調', 'k.字的攝': '字の摂',
    'k.字的音韻地位': '字の音韻地位', 'k.字的中古音': '字の白氏拼音', 'k.上古到中古': '上古音から中古音へ', 'k.中古到上古': '中古音から上古音へ',
    'k.字的上古韻部': '字の上古韻部', 'k.詩經韻腳歸部': '詩経の韻脚の韻部', 'k.術語拼音': '用語の拼音', 'k.Starostin': 'Starostin から中古音へ',
    qMu: 'の声母は？', qDeng: 'は何等？', qHu: 'は開口か合口か？', qYun: 'の韻は？　平声で代表させて答える', qSheng: 'の声調は？', qSheC: 'はどの摂？',
    qDw: 'の音韻地位は？', qBx: 'の白氏拼音（Baxter の中古音）は？', qOcMc: 'の中古音を白氏拼音で', qMcOc: 'の白一平・沙加爾の上古再建音は？', qSt: '（Starostin 1989）の中古音は？',
  },
  en: {
    mode: 'Answer by', choice: 'Choice', input: 'Typing', level: 'Difficulty', easy: 'Easy', normal: 'Normal', hard: 'Hard',
    disp: 'Answer positions as', dispDw: 'Phonological position', dispBx: "Baxter's transcription",
    filter: 'Limit to', all: 'All', she: 'Shè', yun: 'Rhyme', deng: 'Division', hu: 'Open/round', zu: 'Initial group', sheng: 'Tone',
    submit: 'Answer', showAns: 'Show answer', ansIs: 'Answer: ', placeholder: 'Type your answer', noPool: 'No questions are available in this range.',
    levelNote: 'Easy: random options, and pinyin tones are not checked. Normal: options tend to be similar. Hard: options differ in a single feature, such as the same rhyme in another division or the same initial with another rhyme.',
    inputNote: 'When typing, pinyin may use tone marks or numbers (e.g. shang4). Phonological positions can be typed in any order (e.g. 見合三陽平), or as Baxter or Tshet-uinh spellings. Use the buttons below to type special symbols in Old Chinese forms.',
    'k.韻目拼音': 'Heading pinyin', 'k.四聲相承': 'Four-tone sets', 'k.韻目歸攝': 'Heading → shè', 'k.聲母清濁': 'Initial voicing',
    'k.字的聲母': 'Initial of a char', 'k.字的等': 'Division of a char', 'k.字的開合': 'Open/round of a char', 'k.字的韻': 'Rhyme of a char', 'k.字的聲調': 'Tone of a char', 'k.字的攝': 'Shè of a char',
    'k.字的音韻地位': 'Position of a char', 'k.字的中古音': 'Baxter MC of a char', 'k.上古到中古': 'Old → Middle', 'k.中古到上古': 'Middle → Old',
    'k.字的上古韻部': 'OC rhyme group', 'k.詩經韻腳歸部': 'Shijing rhyme group', 'k.術語拼音': 'Term pinyin', 'k.Starostin': 'Starostin → Middle',
    qMu: ' — initial?', qDeng: ' — which division?', qHu: ' — open or rounded?', qYun: ' — which rhyme (named by its level-tone heading)?', qSheng: ' — tone?', qSheC: ' — which shè?',
    qDw: ' — phonological position?', qBx: " — Baxter's Middle Chinese?", qOcMc: ' — Middle Chinese in Baxter\'s transcription?', qMcOc: ' — Baxter–Sagart Old Chinese?', qSt: ' (Starostin 1989) — Middle Chinese?',
  },
};
const QT = k => QL[LANG]?.[k] ?? QL.zh[k] ?? k;

let QSET = { mode: 'choice', level: 'normal', disp: 'dw', she: '', yun: '', deng: '', hu: '', zu: '', sheng: '', only: false };
try { Object.assign(QSET, JSON.parse(localStorage.getItem('syeng.quiz') || '{}')); } catch { }
const saveQSET = () => { try { localStorage.setItem('syeng.quiz', JSON.stringify(QSET)); } catch { } };
const QS = { right: 0, total: 0, get only() { return QSET.only; } };

/* ---------- 比較・正規化 ---------- */
function lev(a, b) {
  a = [...a]; b = [...b];
  let p = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const q = [i];
    for (let j = 1; j <= b.length; j++) q[j] = Math.min(p[j] + 1, q[j - 1] + 1, p[j - 1] + (a[i - 1] !== b[j - 1]));
    p = q;
  }
  return p[b.length];
}
const TONEMARK = { '̄': '1', '́': '2', '̌': '3', '̀': '4' };
function pyParts(s) {
  // 聲調記號・數字のどちらでも：文字列（聲調なし）と聲調の列を返す
  s = (s || '').toLowerCase().normalize('NFD').replace(/ü|ü/g, 'v').replace(/[\s'’\-·]/g, '');
  let letters = '', tones = '';
  for (const ch of s) {
    if (TONEMARK[ch]) tones += TONEMARK[ch];
    else if (/[1-4]/.test(ch)) tones += ch;
    else if (/[05]/.test(ch)) { }
    else if (/\p{M}/u.test(ch)) { }
    else letters += ch;
  }
  return [letters.replace(/v/g, 'u'), tones];
}
function pyEq(a, b) {
  const [la, ta] = pyParts(a), [lb, tb] = pyParts(b);
  return la === lb && (QSET.level === 'easy' || ta === tb);
}
const ocNorm = (s, loose) => {
  s = (s || '').normalize('NFC').replace(/^\s*\*|\s+/g, '').replace(/g/g, 'ɡ').replace(/ˁ/g, 'ˤ').replace(/[ʼ’]/g, 'ʔ').replace(/[:：]/g, 'ː');
  return loose ? s.replace(/[\[\]\(\)<>]/g, '').replace(/-/g, '.') : s;
};
const bxNorm = s => (s || '').trim().replace(/[’‘`]/g, "'");
function dwParts(o) {
  return { 母: o.母, 呼: o.呼 || '', 等: o.等, 類: o.類 && 'AB'.includes(o.類) ? o.類 : '', 韻: o.韻, 聲: o.聲 };
}
function dwMatch(input, o) {
  const s = (input || '').replace(/\s/g, '');
  if (!s) return false;
  if (bxNorm(s) === o.baxter || s === o.tupa) return true;
  const p = dwParts(o);
  const need = [p.母, p.呼, p.等, p.類, p.韻, p.聲].filter(Boolean);
  const nums = { 1: '一', 2: '二', 3: '三', 4: '四' };
  const t = s.replace(/[1-4]/g, d => nums[d]).replace(/[口等聲母韻]/g, '');
  // 順不同：必要な要素の文字の多重集合が一致すれば正解（母と韻が同じ字でも數で区別される）
  const bag = str => [...str].sort().join('');
  return bag(t) === bag(need.join(''));
}

/* ---------- 似た選擇肢を選ぶ ---------- */
function distract(ans, pool, sim, n = 3, bad = []) {
  const uniq = [...new Set(pool)].filter(x => x !== ans && !bad.includes(x));
  if (QSET.level === 'easy' || !sim) return sample(uniq, n);
  const sc = uniq.map(x => [sim(ans, x), Math.random(), x]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  const top = QSET.level === 'hard' ? sc.slice(0, Math.max(n, 5)) : sc.slice(0, Math.max(n * 2, Math.ceil(sc.length * 0.35)));
  return sample(top.map(x => x[2]), n);
}
const simLev = (a, b) => -lev(a, b);
const simPy = (a, b) => { const [la, ta] = pyParts(a), [lb, tb] = pyParts(b); return -(lev(la, lb) * 2 + (ta === tb ? 0 : 1)); };
const BU_F = { 之: 'ə0', 職: 'ə1', 蒸: 'ə2', 幽: 'u0', 覺: 'u1', 冬: 'u2', 宵: 'W0', 藥: 'W1', 侯: 'o0', 屋: 'o1', 東: 'o2', 魚: 'a0', 鐸: 'a1', 陽: 'a2', 支: 'e0', 錫: 'e1', 耕: 'e2',
  脂: 'i0', 質: 'i1', 真: 'i2', 微: 'əj', 物: 'ət', 文: 'ən', 歌: 'aj', 月: 'at', 元: 'an', 緝: 'əp', 侵: 'əm', 葉: 'ap', 盍: 'ap', 談: 'am' };
const simBu = (a, b) => { const x = BU_F[a.replace('部', '')] || '', y = BU_F[b.replace('部', '')] || ''; return (x[0] === y[0] ? 2 : 0) + (x[1] === y[1] ? 1.5 : 0); };
const SHE_G = { 通: 'ŋ', 江: 'ŋ', 宕: 'ŋ', 梗: 'ŋ', 曾: 'ŋ', 臻: 'n', 山: 'n', 深: 'm', 咸: 'm', 止: 'j', 蟹: 'j', 遇: 'o', 果: 'o', 假: 'o', 效: 'w', 流: 'w' };
const simShe = (a, b) => (SHE_G[a] === SHE_G[b] ? 2 : 0);
function simDw(a, b) { // a,b は小韻オブジェクト
  const pa = dwParts(a), pb = dwParts(b); let s = 0;
  for (const k in pa) s += pa[k] === pb[k] ? 1 : 0;
  return s + (a.組 === b.組 ? 0.5 : 0);
}
function simMu(a, b) { const A = D.mu.find(m => m.母 === a), B = D.mu.find(m => m.母 === b); return A && B ? (A.組 === B.組 ? 2 : 0) + (A.清濁 === B.清濁 ? 1 : 0) + (A.音 === B.音 ? 1 : 0) : 0; }

/* ---------- 出題用の讀音（絞り込み付き） ---------- */
let RP = null;
function readings() {
  if (!RP) {
    RP = [];
    for (const [c, v] of Object.entries(D.chars)) for (const r of v.r) if (r.x) { const o = D.XY.get(r.x); if (o && o.聲) RP.push({ c, r, o, multi: v.r.length > 1 }); }
  }
  return RP;
}
function filtered(need) {
  let a = readings().filter(x => (!QSET.she || x.o.攝 === QSET.she) && (!QSET.yun || x.o.韻 === QSET.yun) && (!QSET.deng || x.o.等 === QSET.deng)
    && (!QSET.hu || (x.o.呼 || '中') === QSET.hu) && (!QSET.zu || x.o.組 === QSET.zu || (!x.o.組 && QSET.zu === x.o.母)) && (!QSET.sheng || x.o.聲 === QSET.sheng));
  if (need) a = a.filter(need);
  const single = a.filter(x => !x.multi);  // 讀音が一つの字を優先（答えが一つに決まる）
  if (single.length >= 5) a = single;
  if (QSET.only) { const bm = new Set(BM.all().filter(b => b.type === 'char').map(b => b.c)); const b = a.filter(x => bm.has(x.c)); if (b.length) a = b; }
  return a;
}
const charQ = x => `<span class="han">${esc(x.c)}</span> <span class="small mut">${esc((x.r.g || D.chars[x.c].g[0] || '').slice(0, 24))}</span>`;
const others = x => D.chars[x.c].r.filter(r => r.x && r.x !== x.r.x).map(r => D.XY.get(r.x)).filter(Boolean);
const bmOf = x => ({ id: 'c:' + x.c + '|' + x.r.x, type: 'char', c: x.c, x: x.r.x });
const ALL_XY = () => [...D.XY.values()].filter(o => o.聲);

/* ---------- 問題 ---------- */
const TONES4 = ['平', '上', '去', '入'];
const QK = {
  韻目拼音: { need: ['yun206'], gen() {
    const all = D.yun206.flatMap(y => TONES4.filter(t => y[t]).map(t => ({ m: y[t], py: y.stat[t].py, y, t })));
    const a = pick(all.filter(z => !QSET.she || z.y.攝 === QSET.she));
    return { q: `<span class="han">${a.m}</span> <span class="small mut">${T('qYunPy', a.t)}</span>`, ans: a.py, pool: all.map(z => z.py), sim: simPy, type: 'py', bm: { id: 'y:' + a.y.no, type: 'yun', no: a.y.no }, note: `${a.m}：${a.py}` };
  } },
  四聲相承: { need: ['yun206'], gen() {
    const ys = D.yun206.filter(y => y.平 && (y.上 || y.去 || y.入) && (!QSET.she || y.攝 === QSET.she));
    const a = pick(ys); const t = pick(TONES4.filter(t => t !== '平' && a[t]));
    const pool = D.yun206.map(y => y[t]).filter(Boolean);
    const sim = (x, z) => { const X = D.yun206.find(y => y[t] === z); return X ? (X.攝 === a.攝 ? 2 : 0) + (SHE_G[X.攝] === SHE_G[a.攝] ? 1 : 0) : 0; };
    return { q: T('qSisheng', `<span class="han">${a.平}</span>`, t), ans: a[t], pool, sim, type: 'han', bm: { id: 'y:' + a.no, type: 'yun', no: a.no }, note: `${a.平}${a.上 || '—'}${a.去 || '—'}${a.入 || '—'}` };
  } },
  韻目歸攝: { need: ['yun206'], gen() {
    const a = pick(D.yun206); const m = a[pick(TONES4.filter(t => a[t]))];
    return { q: T('qShe', `<span class="han">${m}</span>`), ans: a.攝, pool: [...new Set(D.yun206.map(y => y.攝))], sim: simShe, type: 'han', bm: { id: 'y:' + a.no, type: 'yun', no: a.no }, note: `${m} → ${a.攝}` };
  } },
  聲母清濁: { need: ['mu'], gen() {
    const a = pick(D.mu.filter(m => !QSET.zu || m.組 === QSET.zu || m.母 === QSET.zu));
    return { q: T('qQz', `<span class="han">${a.母}</span>`, a.py), ans: a.清濁, opts: ['全清', '次清', '全濁', '次濁'], type: 'han', bm: { id: 'm:' + a.母, type: 'mu', m: a.母 }, note: T('nQz', a) };
  } },
  字的聲母: { need: ['xiaoyun', 'yun206', 'chars', 'mu'], gen() {
    const x = pick(filtered()); const bad = others(x).map(o => o.母);
    return { q: charQ(x) + QT('qMu'), ans: x.o.母, bad, pool: D.mu.map(m => m.母), sim: simMu, type: 'han', bm: bmOf(x), note: `${x.c}：${diwei(x.o)}，${x.o.反切}${T('qie')}` };
  } },
  字的等: { need: ['xiaoyun', 'yun206', 'chars'], gen() {
    const x = pick(filtered());
    return { q: charQ(x) + QT('qDeng'), ans: x.o.等, opts: ['一', '二', '三', '四'], bad: others(x).map(o => o.等), alt: { 一: '1', 二: '2', 三: '3', 四: '4' }, type: 'han', bm: bmOf(x), note: `${x.c}：${diwei(x.o)}` };
  } },
  字的開合: { need: ['xiaoyun', 'yun206', 'chars'], gen() {
    const x = pick(filtered(x => x.o.呼));
    return { q: charQ(x) + QT('qHu'), ans: x.o.呼, opts: ['開', '合'], bad: others(x).map(o => o.呼), type: 'han', bm: bmOf(x), note: `${x.c}：${diwei(x.o)}` };
  } },
  字的韻: { need: ['xiaoyun', 'yun206', 'chars'], gen() {
    const x = pick(filtered()); const pool = [...new Set(ALL_XY().map(o => o.韻))];
    const sim = (a, b) => { const A = ALL_XY().find(o => o.韻 === a), B = ALL_XY().find(o => o.韻 === b); return A && B ? (A.攝 === B.攝 ? 2 : 0) + (SHE_G[A.攝] === SHE_G[B.攝] ? 1 : 0) : 0; };
    return { q: charQ(x) + QT('qYun'), ans: x.o.韻, pool, sim, bad: others(x).map(o => o.韻), type: 'han', bm: bmOf(x), note: `${x.c}：${diwei(x.o)}，${xiName(x.o)}` };
  } },
  字的聲調: { need: ['xiaoyun', 'yun206', 'chars'], gen() {
    const x = pick(filtered());
    return { q: charQ(x) + QT('qSheng'), ans: x.o.聲, opts: TONES4, bad: others(x).map(o => o.聲), type: 'han', bm: bmOf(x), note: `${x.c}：${diwei(x.o)}` };
  } },
  字的攝: { need: ['xiaoyun', 'yun206', 'chars'], gen() {
    const x = pick(filtered());
    return { q: charQ(x) + QT('qSheC'), ans: x.o.攝, pool: Object.keys(SHE_G), sim: simShe, bad: others(x).map(o => o.攝), type: 'han', bm: bmOf(x), note: `${x.c}：${diwei(x.o)}` };
  } },
  字的音韻地位: { need: ['xiaoyun', 'yun206', 'chars'], gen() {
    const x = pick(filtered()); const bx = QSET.disp === 'bx';
    const cand = ALL_XY().filter(o => o.no !== x.o.no);
    const near = QSET.level === 'easy' ? sample(cand, 3) : cand.map(o => [simDw(x.o, o) + Math.random() * 0.5, o]).sort((a, b) => b[0] - a[0]).slice(0, QSET.level === 'hard' ? 6 : 40).map(z => z[1]);
    const val = o => bx ? o.baxter : diwei(o);
    const bad = others(x).map(val);
    return { q: charQ(x) + QT('qDw'), ans: val(x.o), pool: near.map(val), sim: null, bad, type: 'dw', o: x.o, oth: others(x), bm: bmOf(x), note: `${x.c}：${diwei(x.o)}，${x.o.反切}${T('qie')}，${x.o.baxter}` };
  } },
  字的中古音: { need: ['xiaoyun', 'yun206', 'chars'], gen() {
    const x = pick(filtered());
    const pool = ALL_XY().filter(o => o.韻 === x.o.韻 || o.母 === x.o.母).map(o => o.baxter);
    return { q: charQ(x) + QT('qBx'), ans: x.o.baxter, pool, sim: simLev, bad: others(x).map(o => o.baxter), type: 'rom', bm: bmOf(x), note: `${x.c}：${x.o.baxter}（${diwei(x.o)}）` };
  } },
  上古到中古: { need: ['xiaoyun', 'yun206', 'chars'], gen() {
    const x = pick(filtered(x => x.r.b.length)); const f = x.r.b[0][0];
    const pool = ALL_XY().filter(o => o.韻 === x.o.韻 || o.母 === x.o.母).map(o => o.baxter);
    return { q: `<span class="ipa">*${esc(f)}</span>${QT('qOcMc')}`, ans: x.o.baxter, pool, sim: simLev, type: 'rom', bm: bmOf(x), note: `${x.c} *${f} > ${x.o.baxter}（${diwei(x.o)}）` };
  } },
  中古到上古: { need: ['xiaoyun', 'yun206', 'chars'], gen() {
    const x = pick(filtered(x => x.r.b.length === 1)); const f = x.r.b[0][0];
    const pool = readings().filter(y => y.r.b.length && (y.o.韻 === x.o.韻 || y.r.b[0][1] === x.r.b[0][1])).map(y => y.r.b[0][0]);
    return { q: `<span class="han">${esc(x.c)}</span> <span class="rom">${esc(x.o.baxter)}</span>${QT('qMcOc')}`, ans: f, pool, sim: simLev, type: 'oc', bm: bmOf(x), note: `${x.c} ${x.o.baxter} < *${f}` };
  } },
  Starostin: { need: ['xiaoyun', 'yun206', 'chars', 'starostin'], gen() {
    const ok = new Set(filtered().map(x => x.c + '|' + x.r.x));
    const all = Object.entries(D.starostin).flatMap(([c, ps]) => ps.map(([no, f]) => ({ c, no, f }))).filter(z => ok.has(z.c + '|' + z.no));
    const z = pick(all); const o = D.XY.get(z.no);
    const pool = ALL_XY().filter(p => p.韻 === o.韻 || p.母 === o.母).map(p => p.baxter);
    return { q: `<span class="ipa">*${esc(z.f)}</span>${QT('qSt')}`, ans: o.baxter, pool, sim: simLev, type: 'rom', bm: { id: 'c:' + z.c + '|' + z.no, type: 'char', c: z.c, x: z.no }, note: `${z.c} *${z.f} > ${o.baxter}（${diwei(o)}）` };
  } },
  字的上古韻部: { need: ['xiaoyun', 'yun206', 'chars', 'corr'], gen() {
    const x = pick(filtered(x => x.r.b.length && x.r.b[0][1])); const bu = x.r.b[0][1] + '部';
    return { q: `<span class="han">${esc(x.c)}</span> <span class="small mut rom">${esc(x.o.baxter)}</span> ${T('qBu')}`, ans: bu, pool: D.corr.bu30.map(b => b + '部'), sim: simBu, type: 'han', strip: '部', bm: bmOf(x), note: `${x.c} *${x.r.b[0][0]} → ${bu}` };
  } },
  詩經韻腳歸部: { need: ['shijing', 'wangbu', 'chars'], gen() {
    const pool = [];
    for (const p of D.shijing.poems) for (const st of p.s) for (const [L, g] of Object.entries(st.g)) if (/^.部$/.test(g) && st.l.filter(l => l[2] === L && l[1]).length >= 2) pool.push([p, st, L, g]);
    const [p, st, L, g] = pick(pool);
    const lines = st.l.map(([t, rw, l2]) => { if (l2 !== L || !rw) return esc(t); const k = t.lastIndexOf(rw); return k >= 0 ? esc(t.slice(0, k)) + `<b style="color:var(--acc)">${esc(rw)}</b>` + esc(t.slice(k + 1)) : esc(t); }).join('<br>');
    const ch = st.l.find(l => l[2] === L && l[1])[1];
    return { q: `<div style="font-size:1.15rem;line-height:1.9">${lines}</div><div class="small mut">${esc(T('qSj', p.t, st.id))}</div>`, ans: g, pool: Object.keys(BU_F).filter(b => b !== '葉' && b !== '冬').map(b => b + '部'), sim: simBu, type: 'han', strip: '部', bm: { id: 'c:' + ch + '|', type: 'char', c: ch, x: D.chars[ch]?.r[0]?.x || null }, note: `${p.t} ${st.id}：${g} — ${T('nWang')}` };
  } },
  術語拼音: { need: ['terms'], gen() {
    const a = pick(D.terms);
    return { q: `<span class="han">${a.t}</span>`, ans: a.py, pool: D.terms.map(t => t.py), sim: simPy, type: 'py', bm: { id: 't:' + a.t, type: 'term', t: a.t }, note: `${a.t} ${a.py}：${tdef(a)}` };
  } },
};
const NEEDS_CHAR = new Set(['字的聲母', '字的等', '字的開合', '字的韻', '字的聲調', '字的攝', '字的音韻地位', '字的中古音', '上古到中古', '中古到上古', 'Starostin', '字的上古韻部']);

function check(item, input) {
  const s = (input || '').trim();
  if (!s) return false;
  const strip = v => item.strip ? v.replace(item.strip, '') : v;
  switch (item.type) {
    case 'py': return pyEq(s, item.ans);
    case 'rom': return bxNorm(s) === item.ans || (item.o && s === item.o.tupa);
    case 'oc': return ocNorm(s) === ocNorm(item.ans) || (QSET.level === 'easy' && ocNorm(s, true) === ocNorm(item.ans, true));
    case 'dw': return dwMatch(s, item.o) || bxNorm(s) === item.ans;
    default: return strip(s) === strip(item.ans) || (item.alt && item.alt[item.ans] === s);
  }
}

/* ---------- 畫面 ---------- */
PAGES['測驗'] = async (qs) => {
  await need('xiaoyun', 'yun206');
  let kind = qs.get('k') || '韻目拼音';
  if (!QK[kind]) kind = '韻目拼音';
  if (qs.get('bm') === '1') QSET.only = true;
  const xs = [...D.XY.values()].filter(o => o.聲);
  const uniq = k => [...new Set(xs.map(o => k === 'hu' ? (o.呼 || '中') : k === 'zu' ? (o.組 || o.母) : o[{ she: '攝', yun: '韻', deng: '等', sheng: '聲' }[k]]))].filter(Boolean);
  const ORD = { deng: ['一', '二', '三', '四'], sheng: TONES4, hu: ['開', '合', '中'] };
  const sel = (k) => { const vals = ORD[k] || uniq(k); return `<label class="small">${QT(k)} <select data-f="${k}"><option value="">${QT('all')}</option>${vals.map(v => `<option ${QSET[k] === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label>`; };
  const radio = (key, vals) => vals.map(v => `<a class="pill ${QSET[key] === v ? 'on' : ''}" data-set="${key}=${v}">${QT(v === 'dw' ? 'dispDw' : v === 'bx' ? 'dispBx' : v)}</a>`).join('');
  const h = `<h1>${T('quizH')}</h1>
   <div class="row">${Object.keys(QK).map(k => `<a class="pill ${k === kind ? 'on' : ''}" href="#/測驗?k=${encodeURIComponent(k)}">${QT('k.' + k)}</a>`).join('')}</div>
   <div class="card small">
    <div class="row"><b>${QT('mode')}</b>${radio('mode', ['choice', 'input'])}　<b>${QT('level')}</b>${radio('level', ['easy', 'normal', 'hard'])}</div>
    ${kind === '字的音韻地位' ? `<div class="row"><b>${QT('disp')}</b>${radio('disp', ['dw', 'bx'])}</div>` : ''}
    ${NEEDS_CHAR.has(kind) ? `<div class="row"><b>${QT('filter')}</b>${['she', 'yun', 'deng', 'hu', 'zu', 'sheng'].map(sel).join(' ')}</div>` : ''}
    <div class="row"><label><input type="checkbox" id="onlybm" ${QSET.only ? 'checked' : ''}> ${T('onlyBm')}</label></div>
    <p class="mut">${QSET.level ? QT('levelNote') : ''}${QSET.mode === 'input' ? '<br>' + QT('inputNote') : ''}</p>
    <p class="mut">${T('quizHint')}</p>
   </div>
   <div class="card quiz" id="quiz"></div>`;
  setTimeout(() => {
    document.querySelectorAll('[data-set]').forEach(a => a.onclick = () => { const [k, v] = a.dataset.set.split('='); QSET[k] = v; saveQSET(); route(); });
    document.querySelectorAll('[data-f]').forEach(s => s.onchange = () => { QSET[s.dataset.f] = s.value; saveQSET(); route(); });
    $('#onlybm').onchange = e => { QSET.only = e.target.checked; saveQSET(); route(); };
    runQuiz(kind);
  }, 0);
  return h;
};

const PALETTE = ['ˤ', 'ʔ', 'ʰ', 'ʷ', 'ə', 'ɯ', 'ŋ', 'ɡ', 'ɢ', 'ɦ', '̥', 'ː', '[', ']', '(', ')', '<', '>', '.', '-'];
async function runQuiz(kind) {
  const Q = QK[kind]; await need(...Q.need, 'chars', 'mu');
  const box = $('#quiz'); if (!box) return;
  let item = null;
  for (let i = 0; i < 30; i++) {
    try {
      const it = Q.gen();
      if (!it) continue;
      if (it.opts) { item = it; break; }
      const d = distract(it.ans, it.pool, it.sim, 3, it.bad || []);
      if (d.length >= 3) { it.opts = [it.ans, ...d]; item = it; break; }
    } catch (e) { console.warn(e); }
  }
  if (!item) { box.innerHTML = `<p class="mut">${QT('noPool')}</p>`; return; }
  window.__qi = item;
  const inputMode = QSET.mode === 'input';
  const opts = item.opts.length <= 4 && kind !== '聲母清濁' && !['字的等', '字的聲調', '字的開合'].includes(kind) ? sample(item.opts, item.opts.length) : item.opts;
  const romCls = ['py', 'rom', 'oc'].includes(item.type) || (item.type === 'dw' && QSET.disp === 'bx') ? 'rom' : 'han';
  box.innerHTML = `<div class="q">${item.q}</div>` + (inputMode
    ? `<form id="inf" class="row"><input id="inp" class="big ${romCls === 'rom' ? 'ipa' : 'han'}" autocomplete="off" placeholder="${esc(QT('placeholder'))}"> <button class="pri">${QT('submit')}</button> <button type="button" id="give">${QT('showAns')}</button></form>
       ${item.type === 'oc' ? `<div class="row" style="margin-top:.4rem">${PALETTE.map(c => `<button type="button" class="ipa pal">${c === '̥' ? '◌̥' : c}</button>`).join('')}</div>` : ''}`
    : `<div class="ch">${opts.map((o, i) => `<button data-i="${i}" class="${romCls}">${i + 1}. ${esc(o)}</button>`).join('')}</div>`)
    + `<div class="fb"></div><div class="row"><span class="mut small" id="sc">${QS.right} / ${QS.total}</span><button id="next">${T('next')}</button>${starBtn(item.bm)}</div>`;
  let done = false;
  const finish = (ok, given) => {
    if (done) return; done = true; QS.total++;
    if (ok) QS.right++; else BM.add(item.bm);
    box.querySelector('.fb').innerHTML = `${ok ? T('right') : T('wrong')}　${ok ? '' : `<b>${QT('ansIs')}</b><span class="${romCls}">${esc(item.ans)}</span>　`}<span class="small">${esc(item.note)}</span>`;
    $('#sc').textContent = `${QS.right} / ${QS.total}`;
  };
  if (inputMode) {
    const inp = $('#inp'); inp.focus();
    $('#inf').onsubmit = e => { e.preventDefault(); if (done) return runQuiz(kind); finish(check(item, inp.value), inp.value); };
    $('#give').onclick = () => finish(false, '');
    box.querySelectorAll('.pal').forEach(b => b.onclick = () => { const c = b.textContent.replace('◌', ''); const s = inp.selectionStart ?? inp.value.length; inp.value = inp.value.slice(0, s) + c + inp.value.slice(inp.selectionEnd ?? s); inp.focus(); inp.selectionStart = inp.selectionEnd = s + c.length; });
  } else {
    const answer = i => {
      if (done) return;
      const ok = check(item, opts[i]) || opts[i] === item.ans;
      box.querySelectorAll('.ch button').forEach((b, j) => { if (opts[j] === item.ans) b.classList.add('ok'); else if (j === i) b.classList.add('ng'); });
      finish(ok);
    };
    box.querySelectorAll('.ch button').forEach(b => b.onclick = () => answer(+b.dataset.i));
    document.onkeydown = e => { if (!$('#quiz') || e.target.tagName === 'INPUT') return; if (/^[1-9]$/.test(e.key) && +e.key <= opts.length) answer(+e.key - 1); if (e.key === 'Enter' && done) runQuiz(kind); };
  }
  $('#next').onclick = () => runQuiz(kind);
}
