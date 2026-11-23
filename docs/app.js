/* Syeng — 上古—中古漢語音韻學習（靜態網站） */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const D = {};
const cache = {};
async function load(name) {
  if (!cache[name]) cache[name] = fetch('data/' + name + '.json').then(r => r.json());
  return cache[name];
}
async function need(...names) {
  for (const n of names) if (!D[n]) D[n] = await load(n);
  if (D.xiaoyun && !D.XY) {
    D.XY = new Map();
    const f = D.xiaoyun.fields;
    for (const row of D.xiaoyun.rows) { const o = {}; f.forEach((k, i) => o[k] = row[i]); D.XY.set(o.no, o); }
  }
  if (D.yun206 && !D.MU2XI) {
    D.MU2XI = {}; D.XI = {};
    for (const y of D.yun206) { D.XI[y.no] = y; for (const t of '平上去入') if (y[t]) D.MU2XI[y[t]] = y.no; }
  }
}
const ALIAS = { '襇': '襉', '号': '號' };
const xiOf = o => D.MU2XI[ALIAS[o.韻目] || o.韻目];
const MU = ['幫', '滂', '並', '明', '端', '透', '定', '泥', '來', '知', '徹', '澄', '孃', '精', '清', '從', '心', '邪', '莊', '初', '崇', '生', '俟', '章', '昌', '船', '書', '常', '日', '見', '溪', '羣', '疑', '影', '曉', '匣', '云', '以'];
const MU_GROUP = [['脣', 4], ['舌頭', 4], ['半舌', 1], ['舌上', 4], ['齒頭', 5], ['正齒二（莊）', 5], ['正齒三（章）', 5], ['半齒', 1], ['牙', 4], ['喉', 5]];
const DENG = ['一', '二', '三', '四'];
const TONES = ['平', '上', '去', '入'];
const sample = (a, n) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };
const pick = a => a[Math.floor(Math.random() * a.length)];

/* ---------- 書籤（localStorage，失敗時はメモリのみ） ---------- */
const BM = {
  mem: null,
  all() {
    if (this.mem) return this.mem;
    try { this.mem = JSON.parse(localStorage.getItem('syeng.bm') || '[]'); } catch { this.mem = []; }
    return this.mem;
  },
  save() { try { localStorage.setItem('syeng.bm', JSON.stringify(this.mem)); } catch { } BM.badge(); },
  has(id) { return this.all().some(b => b.id === id); },
  toggle(item) {
    const a = this.all(); const i = a.findIndex(b => b.id === item.id);
    if (i >= 0) a.splice(i, 1); else a.push({ ...item, ts: Date.now() });
    this.save(); return i < 0;
  },
  add(item) { if (!this.has(item.id)) { this.all().push({ ...item, ts: Date.now() }); this.save(); } },
  badge() { const n = this.all().length; $('#bmcount').textContent = n ? `(${n})` : ''; },
};
function starBtn(item) {
  return `<button class="star ${BM.has(item.id) ? 'on' : ''}" title="加入／移除書籤" data-bm='${esc(JSON.stringify(item))}'>${BM.has(item.id) ? '★' : '☆'}</button>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-bm]');
  if (!b) return;
  const on = BM.toggle(JSON.parse(b.dataset.bm));
  b.classList.toggle('on', on); b.textContent = on ? '★' : '☆';
});

/* ---------- 共通の表示 ---------- */
function diwei(o) { return o ? `${o.母}${o.呼 || ''}${o.等}${o.類 && 'AB'.includes(o.類) ? o.類 : ''}${o.韻}${o.聲}` : ''; }
function xiName(o) { const x = xiOf(o); return x ? D.XI[x].name : o.韻目; }
function ocCell(list) {
  if (!list || !list.length) return '<span class="mut">—</span>';
  return list.map(([f, bu, rk, q]) => `<span class="ipa">*${esc(f)}</span>${bu ? ` <span class="han">${bu}部</span>` : ''}${rk ? ` <span class="mut small ipa">${esc(rk)}</span>` : ''}${q === 'tie' ? '<span class="tag warn" title="多個中古讀音得分相同，對應未定">對應未定</span>' : ''}${q === 'none' ? '<span class="tag warn" title="未能對應到中古讀音">未對應</span>' : ''}`).join('<br>');
}
const HOW = { exact: '', 'baxter-only': '異體', 'baxter-ambiguous': '異體', fuzzy: '近似', guangyun: '廣韻補', 'guangyun-only': '僅廣韻', 'oc-only': '無中古', unmatched: '未對應' };

/* ---------- 頁面 ---------- */
const PAGES = {};

PAGES[''] = async () => {
  return `<h1>上古—中古漢語音韻學習</h1>
  <p>以《廣韻》音韻地位爲中心，對照白一平—沙加爾（2014）、鄭張尚芳兩家上古擬音，學習韻部對應、音變規律與音韻學術語。</p>
  <div class="card"><form onsubmit="location.hash='#/查字?q='+encodeURIComponent(this.q.value);return false">
  <input class="big han" name="q" type="search" placeholder="輸入漢字，如：行樂見之" autofocus> <button class="pri">查字</button></form></div>
  <div class="row">
  ${[['二百六韻', '韻目、四聲相承、拼音'], ['音節表', '韻圖式的小韻總表'], ['聲母', '三十八母與上古來源'], ['韻部對應', '上古韻部 → 中古韻'], ['音變統計', '聲調、等的來源'], ['術語', '音韻學術語拼音'], ['測驗', '選擇題'], ['書籤', '收藏與匯出 Anki']].map(([p, d]) => `<a class="card" style="flex:1 1 12rem" href="#/${p}"><b class="han">${p}</b><br><span class="mut small">${d}</span></a>`).join('')}
  </div>`;
};

PAGES['查字'] = async (qs) => {
  await need('xiaoyun', 'yun206', 'chars');
  const q = (qs.get('q') || '').trim();
  let h = `<h1>查字</h1><form class="row" onsubmit="location.hash='#/查字?q='+encodeURIComponent(this.q.value);return false">
    <input class="big han" name="q" type="search" value="${esc(q)}" placeholder="輸入漢字（可多字）"> <button class="pri">查</button></form>`;
  const cs = [...q].filter(c => /\p{Script=Han}/u.test(c));
  if (!cs.length) return h + '<p class="mut">輸入漢字以查詢其中古音韻地位與上古擬音。</p>';
  for (const c of [...new Set(cs)]) h += charCard(c);
  return h;
};
function charCard(c) {
  const v = D.chars[c];
  if (!v) return `<div class="card"><span class="zi">${esc(c)}</span><span class="mut">無資料</span></div>`;
  let rows = '';
  for (const r of v.r) {
    const o = r.x ? D.XY.get(r.x) : null;
    const item = { id: 'c:' + c + '|' + (r.x || r.bx || ''), type: 'char', c, x: r.x };
    rows += `<tr><td>${starBtn(item)}</td>
      <td>${o ? `<span class="han">${esc(o.代表字)}</span> <span class="mut small">${esc(o.反切 || '')}切</span>` : '—'}${HOW[r.h] ? `<span class="tag">${HOW[r.h]}</span>` : ''}</td>
      <td class="han">${o ? `${esc(diwei(o))}<br><span class="mut small">${esc(xiName(o))}韻系·${esc(o.攝)}攝·${esc(o.清濁)}</span>` : ''}</td>
      <td class="rom">${esc(r.bx || (o && o.baxter) || '')}${o ? `<br><span class="mut small">${esc(o.tupa)}</span>` : ''}</td>
      <td>${ocCell(r.b)}</td><td>${ocCell(r.z)}</td>
      <td class="small mut">${esc(r.g || '')}</td></tr>`;
  }
  return `<div class="card"><div class="row"><span class="zi">${esc(c)}</span>
    <span class="rom">${esc(v.p.join(', '))}</span><span class="mut small">${esc(v.g.join('; '))}</span></div>
    <div class="scroll"><table><tr><th></th><th>小韻</th><th>音韻地位</th><th>Baxter / 切韻拼音</th><th>白—沙 2014</th><th>鄭張尚芳</th><th>廣韻釋義</th></tr>${rows}</table></div></div>`;
}

PAGES['韻表'] = async () => {
  await need('xiaoyun', 'yun206', 'pinyin');
  let h = `<h1>二百六韻 <span class="mut small">四聲相承表</span></h1>
  <p class="small mut">按《廣韻》韻序。每個韻目下爲音韻學慣用讀音（拼音），數字爲小韻數。點韻目查看該韻系的音節表。</p>
  <div class="scroll"><table class="yt"><tr><th>序</th><th>攝</th><th>平</th><th>上</th><th>去</th><th>入</th><th>等</th><th>開合</th><th>備考</th><th></th></tr>`;
  for (const y of D.yun206) {
    const dengs = new Set(), hus = new Set();
    for (const t of TONES) if (y.stat[t]) { Object.keys(y.stat[t].等).forEach(d => dengs.add(d)); Object.keys(y.stat[t].呼).forEach(d => hus.add(d)); }
    const cell = t => y[t] ? `<a class="ym" href="#/音節表?xi=${y.no}">${y[t]}<span class="py">${esc(y.stat[t]?.py || '')}</span></a><span class="mut small">${y.stat[t]?.n ?? ''}</span>` : '';
    h += `<tr><td>${y.no}</td><td class="han">${y.攝}<span class="py rom small mut"> ${esc(D.pinyin.py[y.攝] || '')}</span></td>${TONES.map(t => `<td>${cell(t)}</td>`).join('')}
      <td class="han">${DENG.filter(d => dengs.has(d)).join('')}</td><td class="han">${[...hus].filter(x => x !== '中').join('')}</td><td class="small mut" style="text-align:left">${esc(y.note)}</td>
      <td>${starBtn({ id: 'y:' + y.no, type: 'yun', no: y.no })}</td></tr>`;
  }
  return h + '</table></div>';
};

PAGES['音節表'] = async (qs) => {
  await need('xiaoyun', 'yun206');
  const xi = +(qs.get('xi') || 1);
  const y = D.XI[xi];
  const list = [...D.XY.values()].filter(o => o.聲 && xiOf(o) === xi);
  const hus = [...new Set(list.map(o => o.呼 || ''))];
  const sel = `<select onchange="location.hash='#/音節表?xi='+this.value">${D.yun206.map(z => `<option value="${z.no}" ${z.no === xi ? 'selected' : ''}>${z.no}. ${z.攝}攝 ${[z.平, z.上, z.去, z.入].filter(Boolean).join('')}</option>`).join('')}</select>`;
  let h = `<h1>音節表 <span class="han">${esc(y.name)}韻系</span></h1><div class="row">${sel}
   <a href="#/音節表?xi=${Math.max(1, xi - 1)}">← 上一韻系</a><a href="#/音節表?xi=${Math.min(61, xi + 1)}">下一韻系 →</a></div>
   <p class="small mut">橫列爲聲母，縱行爲聲調 × 韻圖等（依 nk2028 的「韻圖等」，莊組假二等、精組以母假四等、重紐 A 類列四等）。格中爲小韻代表字，點擊可查字。</p>`;
  for (const hu of hus) {
    const sub = list.filter(o => (o.呼 || '') === hu);
    h += `<h2 class="han">${hu ? hu + '口' : '開合中立（脣音等）'}</h2><div class="scroll"><table class="grid"><tr><th></th><th></th>${MU_GROUP.map(([g, n]) => `<th colspan="${n}">${g}</th>`).join('')}</tr>
      <tr><th></th><th></th>${MU.map(m => `<th>${m}</th>`).join('')}</tr>`;
    for (const t of TONES) {
      if (!y[t] && !sub.some(o => o.聲 === t)) continue;
      DENG.forEach((d, i) => {
        h += `<tr>${i === 0 ? `<th rowspan="4" class="v">${t}·${y[t] || ''}</th>` : ''}<th>${d}</th>`;
        for (const m of MU) {
          const os = sub.filter(o => o.聲 === t && o.母 === m && o.韻圖等 === d);
          h += os.length ? `<td class="z" title="${esc(os.map(o => diwei(o) + ' ' + o.反切 + '切 ' + o.baxter).join('\n'))}" onclick="location.hash='#/查字?q=${encodeURIComponent(os.map(o => o.代表字).join(''))}'">${os.map(o => esc(o.代表字)).join('')}</td>` : '<td></td>';
        }
        h += '</tr>';
      });
    }
    h += '</table></div>';
  }
  return h;
};

PAGES['聲母'] = async () => {
  await need('mu');
  let h = `<h1>聲母 <span class="mut small">《切韻》三十八母（nk2028 體系）</span></h1>
  <p class="small mut">「上古來源」統計白—沙 2014 擬音中主音節聲母（不計前置成分、咽化與 *-r-）在各中古聲母中的分布，滑鼠移到數字上可看例字。</p>
  <div class="scroll"><table><tr><th></th><th>母</th><th>拼音</th><th>組</th><th>音</th><th>清濁</th><th>三十六字母</th><th>小韻數</th><th>上古來源（白—沙）</th></tr>`;
  for (const m of D.mu) {
    h += `<tr><td>${starBtn({ id: 'm:' + m.母, type: 'mu', m: m.母 })}</td><td class="han" style="font-size:1.3rem">${m.母}</td><td class="rom">${esc(m.py)}</td><td class="han">${esc(m.組 || '')}</td><td class="han">${esc(m.音)}</td><td class="han">${esc(m.清濁)}</td><td class="han">${esc(m.字母)}</td><td>${m.n}</td>
     <td>${m.oc.map(([k, n, ex]) => `<span class="ipa" title="${esc(ex.map(e => `${e[0]} *${e[1]} > ${e[2]}`).join('\n'))}">*${esc(k)}<sub>${n}</sub></span>`).join(' ')}</td></tr>`;
  }
  return h + '</table></div>';
};

PAGES['韻部'] = async (qs) => {
  await need('corr');
  const sys = qs.get('s') === 'zs' ? 'zs' : 'bs';
  const bu = qs.get('b') || '魚';
  const C = D.corr[sys];
  let h = `<h1>韻部對應 <span class="mut small">上古韻部 → 中古韻系</span></h1>
  <div class="row">體系：${[['bs', '白—沙 2014'], ['zs', '鄭張尚芳']].map(([k, n]) => `<a class="pill ${k === sys ? 'on' : ''}" href="#/韻部?s=${k}&b=${encodeURIComponent(bu)}">${n}</a>`).join('')}</div>
  <div class="row" style="margin:.5rem 0">${D.corr.bu30.map(b => `<a class="pill ${b === bu ? 'on' : ''}" href="#/韻部?s=${sys}&b=${encodeURIComponent(b)}">${b}</a>`).join('')}</div>
  <p class="small mut">韻部名稱用王力三十部，按擬音的主元音與韻尾歸部（本站推得，非原書標註）。中段爲六元音式韻類 × 音節類型：A＝${sys === 'bs' ? '咽化 *Cˤ' : '長元音 *Vː'}，B＝非 A，r＝帶 *-r- 介音，?＝不確定。線寬與字數成正比。</p>`;
  const d = C[bu];
  if (!d) return h + '<p>無資料</p>';
  h += flowSVG(d) + flowTable(d, bu);
  return h;
};
function flowSVG(d) {
  const mid = Object.entries(d).map(([k, v]) => [k, Object.values(v).reduce((s, x) => s + x.n, 0)]).sort((a, b) => b[1] - a[1]);
  const dstT = {};
  for (const [k] of mid) for (const [dst, v] of Object.entries(d[k])) dstT[dst] = (dstT[dst] || 0) + v.n;
  const dst = Object.entries(dstT).sort((a, b) => b[1] - a[1]).filter(x => x[1] >= 1);
  const total = mid.reduce((s, x) => s + x[1], 0);
  const H = Math.max(260, Math.max(mid.length, dst.length) * 30 + 60), W = 820, gap = 6;
  const scale = (H - 40 - gap * Math.max(mid.length, dst.length)) / total;
  let y = 20; const mp = {}; for (const [k, n] of mid) { mp[k] = { y, h: Math.max(2, n * scale), o: 0 }; y += Math.max(mp[k].h, 15) + gap; }
  y = 20; const dp = {}; for (const [k, n] of dst) { dp[k] = { y, h: Math.max(2, n * scale), o: 0 }; y += Math.max(dp[k].h, 15) + gap; }
  let s = `<div class="scroll"><svg viewBox="0 0 ${W} ${H}" width="100%" style="min-width:640px;max-height:${H}px">`;
  for (const [k] of mid) for (const [t, v] of Object.entries(d[k]).sort((a, b) => b[1].n - a[1].n)) {
    const a = mp[k], b = dp[t]; const w = Math.max(1, v.n * scale);
    const y1 = a.y + a.o + w / 2, y2 = b.y + b.o + w / 2; a.o += w; b.o += w;
    s += `<path class="flowlink" d="M300,${y1} C450,${y1} 450,${y2} 600,${y2}" stroke-width="${w}"><title>${esc(k.replace('|', ' ') + ' → ' + t + '：' + v.n + '\n' + v.ex.map(e => e[0] + ' *' + e[1] + ' > ' + e[2]).join('\n'))}</title></path>`;
  }
  for (const [k, n] of mid) { const a = mp[k]; const [rk, c] = k.split('|'); s += `<rect x="292" y="${a.y}" width="8" height="${a.h}" fill="var(--acc)"/><text class="lbl" x="286" y="${a.y + a.h / 2 + 4}" text-anchor="end"><tspan font-family="var(--mono)">${esc(rk)}</tspan> ${esc(c)} <tspan class="num">${n}</tspan></text>`; }
  for (const [k, n] of dst) { const b = dp[k]; s += `<rect x="600" y="${b.y}" width="8" height="${b.h}" fill="var(--acc2)"/><text class="lbl" x="614" y="${b.y + b.h / 2 + 4}">${esc(k)} <tspan class="num">${n}</tspan></text>`; }
  return s + '</svg></div>';
}
function flowTable(d, bu) {
  let h = `<h2>例字 <span class="mut small">${bu}部</span></h2><div class="scroll"><table><tr><th>韻類·類型</th><th>中古</th><th>字數</th><th>例字（上古 > 中古）</th></tr>`;
  for (const [k, v] of Object.entries(d)) for (const [t, x] of Object.entries(v).sort((a, b) => b[1].n - a[1].n))
    h += `<tr><td class="ipa">${esc(k.replace('|', ' · '))}</td><td class="han">${esc(t)}</td><td>${x.n}</td><td>${x.ex.map(e => `<a class="han" href="#/查字?q=${encodeURIComponent(e[0])}">${esc(e[0])}</a> <span class="ipa small">*${esc(e[1])} > ${esc(e[2])}</span>`).join('；')}</td></tr>`;
  return h + '</table></div>';
}

PAGES['音變統計'] = PAGES['音變'] = async () => {
  await need('xiaoyun', 'chars');
  const T = (rows, cols) => { const m = {}; rows.forEach(r => m[r] = Object.fromEntries(cols.map(c => [c, 0]))); return m; };
  const tone = { bs: T(['*-∅/響音尾', '*-ʔ', '*-s', '塞音尾'], TONES), zs: T(['*-∅/響音尾', '*-ʔ', '*-s', '塞音尾'], TONES) };
  const typ = { bs: T(['A', 'Ar', 'B', 'Br'], DENG), zs: T(['A', 'Ar', 'B', 'Br'], DENG) };
  const TL = ['*-∅/響音尾', '*-ʔ', '*-s', '塞音尾'];
  // 中古音が一つだけの字（u=1）に限る：その字の上古形はすべてその一讀に對應するので、對應づけの判斷が統計に入らない
  let nChars = 0;
  for (const v of Object.values(D.chars)) {
    if (!v.u) continue;
    const r0 = v.r[0]; const o = r0.x ? D.XY.get(r0.x) : null; if (!o || !o.聲) continue;
    nChars++;
    for (const sys of ['bs', 'zs']) for (const r of v.r) for (const it of r[sys === 'bs' ? 'b' : 'z']) {
      const [f, , , , t, A, rr] = it;
      if (t == null) continue;
      tone[sys][TL[t]][o.聲]++;
      if (A != null) typ[sys][(A ? 'A' : 'B') + (rr ? 'r' : '')][o.等]++;
    }
  }
  const heat = (m, cols, title) => {
    const max = Math.max(...Object.values(m).flatMap(r => Object.values(r)));
    return `<div class="card" style="flex:1 1 22rem"><h3>${title}</h3><table class="heat"><tr><th></th>${cols.map(c => `<th>${c}</th>`).join('')}</tr>${Object.entries(m).map(([r, row]) => `<tr><th class="ipa">${r}</th>${cols.map(c => `<td style="background:color-mix(in srgb, var(--acc2) ${Math.round(row[c] / max * 70)}%, transparent)">${row[c] || ''}</td>`).join('')}</tr>`).join('')}</table></div>`;
  };
  return `<h1>音變統計</h1><p class="small mut">樣本只取維基詞典中只有一個中古讀音的字（${nChars} 字），把該字的全部上古擬音都算作這一讀音的來源，因此不受本站配對規則的影響；表中偏離對角的格子即兩家擬音與《廣韻》不一致之處（多爲又音、後起讀音或特殊演變）。這些表格可用來驗證：上聲源於 *-ʔ、去聲源於 *-s（奧德里古爾學說）；A 型（咽化／長元音）變一二四等、B 型變三等；*-r- 與二等、重紐三等的關係。</p>
  <h2>韻尾·後綴 → 中古聲調</h2><div class="row">${heat(tone.bs, TONES, '白—沙 2014')}${heat(tone.zs, TONES, '鄭張尚芳')}</div>
  <h2>音節類型 → 中古等</h2><div class="row">${heat(typ.bs, DENG, '白—沙 2014（A＝咽化）')}${heat(typ.zs, DENG, '鄭張尚芳（A＝長元音）')}</div>
  <h2>規則摘要</h2><div class="card small">
  <p><b>聲調</b>：*-ʔ > 上聲；*-s > 去聲（*-ps、*-ts、*-ks 失塞音尾成去聲陰聲韻，如 祭泰夬廢）；塞音尾 *-p *-t *-k > 入聲；其餘 > 平聲。</p>
  <p><b>等</b>：白—沙 A 型（咽化 *Cˤ）> 一、二、四等，B 型 > 三等；鄭張—潘以長元音對應一二四等、短元音對應三等。A 型帶 *-r- > 二等；B 型帶 *-r- > 重紐三等（B 類）、知組、莊組。</p>
  <p><b>聲母</b>：*Cˤ- 與 *C-r- 的舌音 > 知組；*sr-、*tsr- 等 > 莊組；*t-、*k- 等在 B 型前顎化 > 章組；*l- > 以母，*lˤ- > 定母；清響音 *m̥ *n̥ *ŋ̊ *l̥ > 曉、透、書、心等。詳見「聲母」頁的分布。</p></div>`;
};
function ocTone(f, sys) {
  const s = f.replace(/[\[\]\(\)<>]/g, '');
  if (/-?s$/.test(s)) return 2;
  if (/-?ʔ$/.test(s)) return 1;
  if (sys === 'bs' ? /[ptk]$/.test(s) : /[ɡdbɢkpt]$/.test(s)) return 3;
  return 0;
}

PAGES['術語'] = async (qs) => {
  await need('terms', 'pinyin');
  const cat = qs.get('c') || '';
  const cats = [...new Set(D.terms.map(t => t.cat))];
  let h = `<h1>術語 <span class="mut small">音韻學術語與拼音</span></h1><div class="row">${['', ...cats].map(c => `<a class="pill ${c === cat ? 'on' : ''}" href="#/術語?c=${encodeURIComponent(c)}">${c || '全部'}</a>`).join('')}</div>
  <div class="scroll"><table><tr><th></th><th>術語</th><th>拼音</th><th>類</th><th>說明</th></tr>`;
  for (const t of D.terms.filter(t => !cat || t.cat === cat))
    h += `<tr><td>${starBtn({ id: 't:' + t.t, type: 'term', t: t.t })}</td><td class="han" style="font-size:1.15rem">${esc(t.t)}</td><td class="rom">${esc(t.py)}</td><td class="han small">${esc(t.cat)}</td><td class="small">${esc(t.def)}</td></tr>`;
  return h + '</table></div>';
};

/* ---------- 測驗 ---------- */
const QUIZ = {
  韻目拼音: { need: ['yun206'], gen() {
    const all = D.yun206.flatMap(y => TONES.filter(t => y[t]).map(t => ({ m: y[t], py: y.stat[t].py, y, t })));
    const a = pick(all); const opts = sample([...new Set(all.map(x => x.py).filter(p => p !== a.py))], 3);
    return { q: `<span class="han">${a.m}</span> <span class="small mut">（${a.t}聲韻目）</span>`, ans: a.py, opts: [a.py, ...opts], bm: { id: 'y:' + a.y.no, type: 'yun', no: a.y.no }, note: `${a.m}：${a.py}${a.y.stat[a.t].pynote ? '（' + a.y.stat[a.t].pynote + '）' : ''}` };
  } },
  四聲相承: { need: ['yun206'], gen() {
    const ys = D.yun206.filter(y => y.平 && (y.上 || y.去 || y.入));
    const a = pick(ys); const t = pick(TONES.filter(t => t !== '平' && a[t]));
    const opts = sample(D.yun206.map(y => y[t]).filter(x => x && x !== a[t]), 3);
    return { q: `<span class="han">${a.平}</span> 的${t}聲韻是？`, ans: a[t], opts: [a[t], ...opts], bm: { id: 'y:' + a.no, type: 'yun', no: a.no }, note: `${a.平}${a.上 || '—'}${a.去 || '—'}${a.入 || '—'}` };
  } },
  韻目歸攝: { need: ['yun206'], gen() {
    const a = pick(D.yun206); const m = a[pick(TONES.filter(t => a[t]))];
    const opts = sample([...new Set(D.yun206.map(y => y.攝))].filter(s => s !== a.攝), 3);
    return { q: `<span class="han">${m}</span>韻屬哪一攝？`, ans: a.攝, opts: [a.攝, ...opts], bm: { id: 'y:' + a.no, type: 'yun', no: a.no }, note: `${m} → ${a.攝}攝` };
  } },
  聲母清濁: { need: ['mu'], gen() {
    const a = pick(D.mu); const opts = ['全清', '次清', '全濁', '次濁'];
    return { q: `<span class="han">${a.母}</span>母（${a.py}）的清濁？`, ans: a.清濁, opts, fixed: true, bm: { id: 'm:' + a.母, type: 'mu', m: a.母 }, note: `${a.母}母：${a.音}音 ${a.清濁}；三十六字母作「${a.字母}」` };
  } },
  字的音韻地位: { need: ['xiaoyun', 'yun206', 'chars'], gen() {
    const r = randReading(true); const o = D.XY.get(r.x);
    const others = sample([...D.XY.values()].filter(x => x.聲 && x.韻 === o.韻 && x.no !== o.no), 6).map(diwei).filter(x => x !== diwei(o));
    const more = sample([...D.XY.values()].filter(x => x.聲 && x.母 === o.母 && x.no !== o.no), 4).map(diwei);
    const opts = [...new Set([...others, ...more])].filter(x => x !== diwei(o)).slice(0, 3);
    return { q: `<span class="han">${r.c}</span> <span class="small mut">${esc(r.g)}</span>`, ans: diwei(o), opts: [diwei(o), ...opts], bm: { id: 'c:' + r.c + '|' + r.x, type: 'char', c: r.c, x: r.x }, note: `${r.c}：${diwei(o)}，${o.反切}切，${o.baxter}` };
  } },
  字的上古韻部: { need: ['xiaoyun', 'yun206', 'chars', 'corr'], gen() {
    const r = randReading(true, 'b'); const bu = r.b[0][1]; const o = D.XY.get(r.x);
    const near = D.corr.bu30.filter(b => b !== bu);
    return { q: `<span class="han">${r.c}</span> <span class="small mut rom">${esc(o.baxter)}</span> 屬上古哪一部？`, ans: bu + '部', opts: [bu + '部', ...sample(near, 3).map(b => b + '部')], bm: { id: 'c:' + r.c + '|' + r.x, type: 'char', c: r.c, x: r.x }, note: `${r.c} *${r.b[0][0]}（白—沙）→ ${bu}部；鄭張 ${r.z.map(z => '*' + z[0]).join(' ') || '—'}` };
  } },
  上古到中古: { need: ['xiaoyun', 'yun206', 'chars'], gen() {
    const r = randReading(true, 'b'); const o = D.XY.get(r.x);
    const pool = [...D.XY.values()].filter(x => x.baxter && x.baxter !== o.baxter && (x.韻 === o.韻 || x.母 === o.母));
    return { q: `<span class="ipa">*${esc(r.b[0][0])}</span> <span class="small mut">（白—沙）</span> 的中古音？`, ans: o.baxter, opts: [o.baxter, ...sample([...new Set(pool.map(x => x.baxter))], 3)], rom: true, bm: { id: 'c:' + r.c + '|' + r.x, type: 'char', c: r.c, x: r.x }, note: `${r.c} *${r.b[0][0]} > ${o.baxter}（${diwei(o)}）` };
  } },
  術語拼音: { need: ['terms'], gen() {
    const a = pick(D.terms); const opts = sample(D.terms.filter(t => t.py !== a.py && t.cat === a.cat), 3).map(t => t.py);
    if (opts.length < 3) opts.push(...sample(D.terms.filter(t => t.py !== a.py && !opts.includes(t.py)), 3 - opts.length).map(t => t.py));
    return { q: `<span class="han">${a.t}</span>`, ans: a.py, opts: [a.py, ...opts], rom: true, bm: { id: 't:' + a.t, type: 'term', t: a.t }, note: `${a.t}（${a.py}）：${a.def}` };
  } },
};
let readingPool = null;
function randReading(ok, need) {
  if (!readingPool) {
    readingPool = [];
    for (const [c, v] of Object.entries(D.chars)) for (const r of v.r) if (r.x && r.b.length && r.b.every(b => b[3] === 'ok') && r.h === 'exact') readingPool.push({ c, ...r });
  }
  const bms = QS.only ? BM.all().filter(b => b.type === 'char') : null;
  if (bms && bms.length) { const b = pick(bms); const r = D.chars[b.c]?.r.find(r => r.x === b.x); if (r && (!need || r[need].length)) return { c: b.c, ...r }; }
  return pick(readingPool);
}
const QS = { only: false, right: 0, total: 0 };
PAGES['測驗'] = async (qs) => {
  const kind = qs.get('k') || '韻目拼音';
  QS.only = qs.get('bm') === '1';
  const h = `<h1>測驗</h1><div class="row">${Object.keys(QUIZ).map(k => `<a class="pill ${k === kind ? 'on' : ''}" href="#/測驗?k=${encodeURIComponent(k)}${QS.only ? '&bm=1' : ''}">${k}</a>`).join('')}</div>
   <p class="small"><label><input type="checkbox" ${QS.only ? 'checked' : ''} onchange="location.hash='#/測驗?k=${encodeURIComponent(kind)}'+(this.checked?'&bm=1':'')"> 只出書籤中的字</label>　答錯的題目自動加入書籤。按 <kbd>1</kbd>–<kbd>4</kbd> 作答，<kbd>Enter</kbd> 下一題。</p>
   <div class="card quiz" id="quiz"></div>`;
  setTimeout(() => runQuiz(kind), 0);
  return h;
};
async function runQuiz(kind) {
  const Q = QUIZ[kind]; await need(...Q.need);
  const box = $('#quiz'); if (!box) return;
  let item; for (let i = 0; i < 20; i++) { try { item = Q.gen(); if (item && new Set(item.opts).size >= 4) break; } catch (e) { item = null; } }
  const opts = item.fixed ? item.opts : sample([...new Set(item.opts)].slice(0, 4), 4);
  box.innerHTML = `<div class="q">${item.q}</div><div class="ch">${opts.map((o, i) => `<button data-i="${i}" class="${item.rom ? 'rom' : 'han'}">${i + 1}. ${esc(o)}</button>`).join('')}</div>
    <div class="fb"></div><div class="row"><span class="mut small">${QS.right} / ${QS.total}</span><button id="next">下一題</button>${starBtn(item.bm)}</div>`;
  let done = false;
  const answer = i => {
    if (done) return; done = true; QS.total++;
    const ok = opts[i] === item.ans; if (ok) QS.right++; else BM.add(item.bm);
    box.querySelectorAll('.ch button').forEach((b, j) => { if (opts[j] === item.ans) b.classList.add('ok'); else if (j === i) b.classList.add('ng'); });
    box.querySelector('.fb').innerHTML = `${ok ? '✓ 正確' : '✗ 錯誤（已加入書籤）'}　<span class="small">${esc(item.note)}</span>`;
    box.querySelector('.row .mut').textContent = `${QS.right} / ${QS.total}`;
  };
  box.querySelectorAll('.ch button').forEach(b => b.onclick = () => answer(+b.dataset.i));
  $('#next').onclick = () => runQuiz(kind);
  document.onkeydown = e => { if (!$('#quiz')) return; if (/^[1-4]$/.test(e.key)) answer(+e.key - 1); if (e.key === 'Enter' && done) runQuiz(kind); };
}

/* ---------- 書籤 ---------- */
PAGES['書籤'] = async () => {
  await need('xiaoyun', 'yun206', 'chars', 'terms', 'mu');
  const a = BM.all();
  let h = `<h1>書籤</h1><p class="small mut">書籤保存在本瀏覽器中。可匯出爲 Anki 可匯入的 TSV（正面 / 背面兩欄，欄位以 Tab 分隔）。</p>
   <div class="row"><button class="pri" id="tsv">匯出 Anki TSV</button><button id="json">匯出 JSON</button><label class="small">匯入 JSON <input type="file" id="imp" accept=".json"></label><button id="clr">全部清除</button>
   <a href="#/測驗?k=字的音韻地位&bm=1">用書籤測驗 →</a></div>`;
  if (!a.length) return h + '<p class="mut">尚無書籤。在各頁按 ☆ 收藏，或在測驗中答錯時自動加入。</p>';
  h += '<div class="scroll"><table><tr><th></th><th>類</th><th>正面</th><th>背面</th></tr>' + a.map(b => { const [f, bk] = cardOf(b); return `<tr><td>${starBtn(b)}</td><td class="small">${{ char: '字', yun: '韻', term: '術語', mu: '聲母' }[b.type]}</td><td class="han">${esc(f)}</td><td class="small">${esc(bk)}</td></tr>`; }).join('') + '</table></div>';
  setTimeout(() => {
    const dl = (name, text, type) => { const u = URL.createObjectURL(new Blob([text], { type })); const l = document.createElement('a'); l.href = u; l.download = name; l.click(); setTimeout(() => URL.revokeObjectURL(u), 1000); };
    $('#tsv').onclick = () => dl('syeng-bookmarks.tsv', BM.all().map(b => cardOf(b).map(x => x.replace(/[\t\n]/g, ' ')).join('\t')).join('\n'), 'text/tab-separated-values');
    $('#json').onclick = () => dl('syeng-bookmarks.json', JSON.stringify(BM.all()), 'application/json');
    $('#clr').onclick = () => { if (confirm('確定清除全部書籤？')) { BM.mem = []; BM.save(); route(); } };
    $('#imp').onchange = async e => { try { const arr = JSON.parse(await e.target.files[0].text()); arr.forEach(b => BM.add(b)); route(); } catch { alert('無法讀取'); } };
  }, 0);
  return h;
};
function cardOf(b) {
  if (b.type === 'char') {
    const r = D.chars[b.c]?.r.find(r => r.x === b.x) || D.chars[b.c]?.r[0]; const o = r?.x ? D.XY.get(r.x) : null;
    return [b.c, `${o ? diwei(o) + ' ' + o.反切 + '切 ' + o.baxter : ''} | 白—沙 ${r?.b.map(x => '*' + x[0] + (x[1] ? ' ' + x[1] + '部' : '')).join(', ') || '—'} | 鄭張 ${r?.z.map(x => '*' + x[0]).join(', ') || '—'}`];
  }
  if (b.type === 'yun') { const y = D.XI[b.no]; return [y.name + '韻系', `${TONES.map(t => y[t] ? y[t] + '(' + y.stat[t].py + ')' : '—').join(' ')} | ${y.攝}攝`]; }
  if (b.type === 'term') { const t = D.terms.find(t => t.t === b.t); return [b.t, t ? `${t.py} — ${t.def}` : '']; }
  if (b.type === 'mu') { const m = D.mu.find(m => m.母 === b.m); return [b.m + '母', m ? `${m.py} | ${m.音}音 ${m.清濁} | 三十六字母：${m.字母}` : '']; }
  return [b.id, ''];
}

PAGES['說明'] = async () => {
  const base = location.href.split('#')[0];
  const bml = `javascript:(()=>{const s=String(getSelection()).trim()||prompt('查字（Syeng）');if(s)window.open('${base}#/查字?q='+encodeURIComponent(s),'syeng','width=980,height=720')})()`;
  return `<h1>說明</h1>
  <h2>書籤小工具（Bookmarklet）</h2><p>把下面的按鈕拖到瀏覽器書籤列。在任何網頁選取漢字後點擊，即在小視窗中查 Syeng。</p>
  <p><a class="bmlet" href="${esc(bml)}">Syeng 查字</a></p>
  <h2>Anki 牌組</h2><p>匯入 Anki（檔案 → 匯入）。卡片 ID 固定，日後更新版本可直接覆蓋匯入。</p><ul>
  ${[['all', '全部（五組）'], ['韻目', '二百六韻目：拼音、四聲相承、攝'], ['聲母', '三十八母：拼音、清濁、上古來源'], ['術語', '音韻學術語：拼音、說明'], ['字·上古中古', '常用字：音韻地位、白—沙、鄭張'], ['小韻·音韻地位', '《廣韻》小韻：代表字 → 音韻地位']].map(([k, d]) => `<li><a href="anki/syeng-${k}.apkg" download>syeng-${k}.apkg</a>${k !== 'all' ? `（<a href="anki/syeng-${k}.tsv" download>TSV</a>）` : ''}　<span class="mut small">${d}</span></li>`).join('')}</ul>
  <h2>資料來源</h2><ul>
  <li>《廣韻》小韻、反切、釋義、音韻地位及各家推導（Baxter、切韻拼音、unt、王力、潘悟雲、高本漢、普通話推導）：nk2028 <a href="https://github.com/nk2028/tshet-uinh-js">tshet-uinh</a> 0.15.4 與 <a href="https://github.com/nk2028/tshet-uinh-examples">tshet-uinh-examples</a>（MIT）。</li>
  <li>白一平—沙加爾（2014）上古擬音、鄭張尚芳上古擬音、Baxter 中古音轉寫：英文維基詞典漢字條目，經 kaikki.org（wiktextract）抽取（CC BY-SA 4.0）。</li></ul>
  <h2>本站的推得部分</h2><ul>
  <li><b>上古—中古讀音的對應</b>：維基詞典的抽取資料不保留多音字中上古讀音與中古讀音的配對。本站按聲調（*-ʔ／*-s／塞音尾）、音節類型（咽化或長元音 ↔ 一二四等）、韻尾類型（陰／陽／入）與聲母清濁評分配對。得分相同者標「對應未定」，無合適者標「未對應」。</li>
  <li><b>韻部歸屬</b>：按擬音主元音與韻尾歸入王力三十部，非兩家原書的標註。白—沙 *-ik 歸質部、*-iŋ 歸真部、*-iw 歸幽部；鄭張 *-iɡ 歸質部、*-iŋ 歸真部。</li>
  <li><b>韻目拼音</b>：用現代標準讀音，個別依音韻學慣例（如 上 shǎng、覺 jué、薺 jì、曾 zēng）。</li></ul>
  <p class="small mut">原書（白一平—沙加爾 2014、鄭張尚芳《上古音系》等）的內容不收錄於本站。</p>`;
};

/* ---------- 路由 ---------- */
async function route() {
  const [p, q] = decodeURIComponent(location.hash.replace(/^#\/?/, '')).split('?');
  const qs = new URLSearchParams(location.hash.split('?')[1] || '');
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', decodeURIComponent(a.getAttribute('href')).slice(2) === p));
  const f = PAGES[p] || PAGES[''];
  $('#main').innerHTML = '<p class="loading">載入中……</p>';
  try { $('#main').innerHTML = await f(qs); } catch (e) { $('#main').innerHTML = `<p>錯誤：${esc(e.message)}</p>`; console.error(e); }
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
BM.badge(); route();
