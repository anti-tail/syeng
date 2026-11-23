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
const MU_GROUP = [['脣', 4], ['舌頭', 4], ['半舌', 1], ['舌上', 4], ['齒頭', 5], ['正齒二', 5], ['正齒三', 5], ['半齒', 1], ['牙', 4], ['喉', 5]];
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
  return `<button class="star ${BM.has(item.id) ? 'on' : ''}" title="${esc(T('bmTitle'))}" data-bm='${esc(JSON.stringify(item))}'>${BM.has(item.id) ? '★' : '☆'}</button>`;
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
  return list.map(([f, bu, rk, q]) => `<span class="ipa">*${esc(f)}</span>${bu ? ` <span class="han">${bu}部</span>` : ''}${rk ? ` <span class="mut small ipa">${esc(rk)}</span>` : ''}${q === 'tie' ? `<span class="tag warn" title="${esc(T('tieTip'))}">${T('tie')}</span>` : ''}${q === 'none' ? `<span class="tag warn" title="${esc(T('noneTip'))}">${T('none')}</span>` : ''}`).join('<br>');
}
const HOW = h => h && h !== 'exact' ? T('how.' + h) : '';

/* ---------- 頁面 ---------- */
const PAGES = {};

PAGES[''] = async () => {
  return `<h1>${T('homeH')}</h1>
  <p>${T('homeP')}</p>
  <div class="card"><form onsubmit="location.hash='#/查字?q='+encodeURIComponent(this.q.value);return false">
  <input class="big han" name="q" type="search" placeholder="${esc(T('searchPh'))}" autofocus> <button class="pri">${T('lookup')}</button></form></div>
  <div class="row">
  ${['韻表', '音節表', '聲母', '韻部', '詩經', '音變', '術語', '測驗', '書籤'].map(p => `<a class="card" style="flex:1 1 12rem" href="#/${p}"><b>${T('nav.' + p)}</b><br><span class="mut small">${T('card.' + p)}</span></a>`).join('')}
  </div>`;
};

PAGES['查字'] = async (qs) => {
  await need('xiaoyun', 'yun206', 'chars', 'wangbu', 'starostin');
  const q = (qs.get('q') || '').trim();
  let h = `<h1>${T('lookupH')}</h1><form class="row" onsubmit="location.hash='#/查字?q='+encodeURIComponent(this.q.value);return false">
    <input class="big han" name="q" type="search" value="${esc(q)}" placeholder="${esc(T('lookupPh'))}"> <button class="pri">${T('lookupBtn')}</button></form>`;
  const cs = [...q].filter(c => /\p{Script=Han}/u.test(c));
  if (!cs.length) return h + `<p class="mut">${T('lookupHint')}</p>`;
  for (const c of [...new Set(cs)]) h += charCard(c);
  return h;
};
function charCard(c) {
  const v = D.chars[c];
  if (!v) return `<div class="card"><span class="zi">${esc(c)}</span><span class="mut">${T('noData')}</span></div>`;
  let rows = '';
  for (const r of v.r) {
    const o = r.x ? D.XY.get(r.x) : null;
    const item = { id: 'c:' + c + '|' + (r.x || r.bx || ''), type: 'char', c, x: r.x };
    rows += `<tr><td>${starBtn(item)}</td>
      <td>${o ? `<span class="han">${esc(o.代表字)}</span> <span class="mut small">${esc(o.反切 || '')}切</span>` : '—'}${HOW(r.h) ? `<span class="tag">${HOW(r.h)}</span>` : ''}</td>
      <td class="han">${o ? `${esc(diwei(o))}<br><span class="mut small">${esc(xiName(o))}${T('xiSuffix')} · ${esc(o.攝)}${T('sheSuffix')} · ${esc(o.清濁)}</span>` : ''}</td>
      <td class="rom">${esc(r.bx || (o && o.baxter) || '')}${o ? `<br><span class="mut small">${esc(o.tupa)}</span>` : ''}</td>
      <td>${ocCell(r.b)}</td><td>${ocCell(r.z)}</td><td>${(D.starostin[c] || []).filter(([no]) => no === r.x).map(([, f]) => `<span class="ipa">*${esc(f)}</span>`).join('<br>') || '<span class="mut">—</span>'}</td>
      <td class="small mut">${esc(r.g || '')}</td></tr>`;
  }
  const wb = D.wangbu.chars[c];
  const wline = wb ? `<p class="small">${T('wangLine')}${Object.entries(wb.bu).map(([b, n]) => `<b class="han">${b}部</b>×${n}`).join('、')}　<span class="ipa mut">${esc(wb.rc.map(x => '*' + x).join(' '))}</span>　${wb.refs.map(([n, st]) => `<a href="#/詩經?p=${n}">${st}</a>`).join(' ')}</p>` : '';
  return `<div class="card"><div class="row"><span class="zi">${esc(c)}</span>
    <span class="rom">${esc(v.p.join(', '))}</span><span class="mut small">${esc(v.g.join('; '))}</span></div>${wline}
    <div class="scroll"><table><tr><th></th><th>${T('th_xy')}</th><th>${T('th_dw')}</th><th>${T('th_bx')}</th><th>${T('th_bs')}</th><th>${T('th_zs')}</th><th>Starostin 1989</th><th>${T('th_gl')}</th></tr>${rows}</table></div></div>`;
}

PAGES['韻表'] = async () => {
  await need('xiaoyun', 'yun206', 'pinyin');
  let h = `<h1>${T('yunH')} <span class="mut small">${T('yunSub')}</span></h1>
  <p class="small mut">${T('yunP')}</p>
  <div class="scroll"><table class="yt"><tr><th>${T('th_no')}</th><th>${T('th_she')}</th><th>平</th><th>上</th><th>去</th><th>入</th><th>${T('th_deng')}</th><th>${T('th_kh')}</th><th>${T('th_note')}</th><th></th></tr>`;
  for (const y of D.yun206) {
    const dengs = new Set(), hus = new Set();
    for (const t of TONES) if (y.stat[t]) { Object.keys(y.stat[t].等).forEach(d => dengs.add(d)); Object.keys(y.stat[t].呼).forEach(d => hus.add(d)); }
    const cell = t => y[t] ? `<a class="ym" href="#/音節表?xi=${y.no}">${y[t]}<span class="py">${esc(y.stat[t]?.py || '')}</span></a><span class="mut small">${y.stat[t]?.n ?? ''}</span>` : '';
    h += `<tr><td>${y.no}</td><td class="han">${y.攝}<span class="py rom small mut"> ${esc(D.pinyin.py[y.攝] || '')}</span></td>${TONES.map(t => `<td>${cell(t)}</td>`).join('')}
      <td class="han">${DENG.filter(d => dengs.has(d)).join('')}</td><td class="han">${[...hus].filter(x => x !== '中').join('')}</td><td class="small mut" style="text-align:left">${esc(NOTE_I18N[LANG]?.[y.note] ?? y.note)}</td>
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
  const sel = `<select onchange="location.hash='#/音節表?xi='+this.value">${D.yun206.map(z => `<option value="${z.no}" ${z.no === xi ? 'selected' : ''}>${z.no}. ${z.攝}${T('sheSuffix')} ${[z.平, z.上, z.去, z.入].filter(Boolean).join('')}</option>`).join('')}</select>`;
  let h = `<h1>${T('sylH')} <span class="han">${esc(y.name)}${T('xiSuffix')}</span></h1><div class="row">${sel}
   <a href="#/音節表?xi=${Math.max(1, xi - 1)}">${T('prevXi')}</a><a href="#/音節表?xi=${Math.min(61, xi + 1)}">${T('nextXi')}</a></div>
   <p class="small mut">${T('sylP')}</p>`;
  for (const hu of hus) {
    const sub = list.filter(o => (o.呼 || '') === hu);
    h += `<h2 class="han">${hu ? T('huKou', hu) : T('huNeutral')}</h2><div class="scroll"><table class="grid"><tr><th></th><th></th>${MU_GROUP.map(([g, n]) => `<th colspan="${n}">${T('grp.' + g)}</th>`).join('')}</tr>
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
  let h = `<h1>${T('muH')} <span class="mut small">${T('muSub')}</span></h1>
  <p class="small mut">${T('muP')}</p>
  <div class="scroll"><table><tr><th></th><th>${T('th_mu')}</th><th>${T('th_py')}</th><th>${T('th_zu')}</th><th>${T('th_yin')}</th><th>${T('th_qz')}</th><th>${T('th_36')}</th><th>${T('th_nxy')}</th><th>${T('th_ocsrc')}</th></tr>`;
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
  let h = `<h1>${T('buH')} <span class="mut small">${T('buSub')}</span></h1>
  <div class="row">${T('sysLabel')}${[['bs', T('th_bs')], ['zs', T('th_zs')]].map(([k, n]) => `<a class="pill ${k === sys ? 'on' : ''}" href="#/韻部?s=${k}&b=${encodeURIComponent(bu)}">${n}</a>`).join('')}</div>
  <div class="row" style="margin:.5rem 0">${D.corr.bu30.map(b => `<a class="pill ${b === bu ? 'on' : ''}" href="#/韻部?s=${sys}&b=${encodeURIComponent(b)}">${b}</a>`).join('')}</div>
  <p class="small mut">${T('buP', sys === 'bs' ? T('aBS') : T('aZS'))}</p>`;
  const d = C[bu];
  if (!d) return h + `<p>${T('noData')}</p>`;
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
  let h = `<h2>${T('exH')} <span class="mut small">${bu}部</span></h2><div class="scroll"><table><tr><th>${T('th_rk')}</th><th>${T('th_mc')}</th><th>${T('th_n')}</th><th>${T('th_ex')}</th></tr>`;
  for (const [k, v] of Object.entries(d)) for (const [t, x] of Object.entries(v).sort((a, b) => b[1].n - a[1].n))
    h += `<tr><td class="ipa">${esc(k.replace('|', ' · '))}</td><td class="han">${esc(t)}</td><td>${x.n}</td><td>${x.ex.map(e => `<a class="han" href="#/查字?q=${encodeURIComponent(e[0])}">${esc(e[0])}</a> <span class="ipa small">*${esc(e[1])} > ${esc(e[2])}</span>`).join('；')}</td></tr>`;
  return h + '</table></div>';
}

PAGES['詩經'] = async (qs) => {
  await need('shijing', 'wangbu', 'chars', 'xiaoyun', 'yun206');
  const P = D.shijing.poems;
  const n = qs.get('p');
  const mode = qs.get('m') === 'bx' ? 'bx' : 'wang';
  const sel = `<select onchange="location.hash='#/詩經?p='+this.value+'&m=${mode}'"><option value="">${T('sjSel')}</option>${P.map(p => `<option value="${p.n}" ${p.n === n ? 'selected' : ''}>${p.n}. ${esc(p.b)}·${esc(p.c)}·${esc(p.t)}</option>`).join('')}</select>`;
  let h = `<h1>${T('sjH')}</h1><div class="row">${sel}
    ${[['wang', '王力 1980'], ['bx', 'Baxter 1992']].map(([k, t]) => `<a class="pill ${k === mode ? 'on' : ''}" href="#/詩經?p=${n || ''}&m=${k}">${t}</a>`).join('')}
    ${n ? `<a href="#/詩經?p=${Math.max(1, +n - 1)}&m=${mode}">${T('prevP')}</a><a href="#/詩經?p=${Math.min(305, +n + 1)}&m=${mode}">${T('nextP')}</a>` : ''}</div>`;
  if (!n) return h + shijingStats();
  const p = P.find(p => p.n === n);
  h += `<h2 class="han">${esc(p.t)} <span class="mut small">${esc(p.b)}·${esc(p.c)}·${T('poemNo', p.n)}</span></h2>
   <p class="small mut">${mode === 'wang' ? T('sjPw') : T('sjPb')}${T('sjHover')}</p>`;
  for (const st of p.s) {
    const letters = [...new Set(st.l.map(l => mode === 'wang' ? l[2] : l[4]?.[1]).filter(Boolean))];
    const cls = L => 'g' + (letters.indexOf(L) % 8);
    const lines = st.l.map(([t, rw, L, rc, bx]) => {
      const key = mode === 'wang' ? (rw ? L : '') : (bx ? bx[1] : '');
      const ch = mode === 'wang' ? rw : bx?.[0];
      if (!key || !ch) return `<span class="ln">${esc(t)}</span>`;
      const k = t.lastIndexOf(ch);
      const sup = mode === 'wang' ? `${key} ${rc}` : `${key}${bx[2] ? ' *' + bx[2] : ''}`;
      const word = `<span class="rw ${cls(key)}" title="${esc(rwTitle(ch))}" onclick="location.hash='#/查字?q=${encodeURIComponent(ch)}'">${esc(ch)}<sup class="ipa">${esc(sup)}</sup></span>`;
      return `<span class="ln">${k >= 0 ? esc(t.slice(0, k)) + word + esc(t.slice(k + 1)) : esc(t) + ' ' + word}</span>`;
    }).join('');
    const lab = mode === 'wang' ? Object.entries(st.g).map(([L, g]) => `<span class="rw ${cls(L)}">${L}</span> ${esc(g)}`).join('<br>') : '';
    h += `<div class="stz"><div class="poem">${lines}</div><div class="lab"><b>${esc(st.id)}</b><br>${lab}</div></div>`;
  }
  return h;
};
function rwTitle(ch) {
  const v = D.chars[ch]; if (!v) return ch;
  return v.r.filter(r => r.x).slice(0, 3).map(r => { const o = D.XY.get(r.x); return `${ch} ${o ? diwei(o) + ' ' + o.baxter : ''}  ${T('bsShort')} ${r.b.map(b => '*' + b[0]).join(' ') || '—'}  ${T('zsShort')} ${r.z.map(z => '*' + z[0]).join(' ') || '—'}`; }).join('\n');
}
function shijingStats() {
  const S = D.wangbu.stats;
  const pct = a => `${a['一致'] || 0} / ${(a['一致'] || 0) + (a['不一致'] || 0)}（${(100 * (a['一致'] || 0) / ((a['一致'] || 0) + (a['不一致'] || 0))).toFixed(1)}%）`;
  const confT = list => `<table class="small">${list.slice(0, 15).map(([w, b, n, ex]) => `<tr><td>${T('wangX', w)}</td><td>${T('siteX', b)}</td><td>${n}</td><td class="han">${[...ex].map(c => `<a href="#/查字?q=${encodeURIComponent(c)}">${c}</a>`).join('')}</td></tr>`).join('')}</table>`;
  return `<div class="card small"><p>${T('sjStat1', S)}</p><p class="mut">${T('sjStat2')}</p></div>
  <h2>${T('cmpH')}</h2><p class="small mut">${T('cmpP')}</p>
  <div class="row"><div class="card" style="flex:1 1 20rem"><b>${T('th_bs')}</b>：${T('agree')} ${pct(S.agree.bs)}${confT(S.conf.bs)}</div>
  <div class="card" style="flex:1 1 20rem"><b>${T('th_zs')}</b>：${T('agree')} ${pct(S.agree.zs)}${confT(S.conf.zs)}</div></div>
  <h2>${T('mixH')}</h2><div class="scroll"><table class="small"><tr><th>${T('th_bu')}</th><th>${T('th_type')}</th><th>${T('th_groups')}</th></tr>${S.mix.map(([a, b, t, n]) => `<tr><td class="han">${a}·${b}</td><td>${T('mixType', t)}</td><td>${n}</td></tr>`).join('')}</table></div>`;
}

PAGES['音變統計'] = PAGES['音變'] = async () => {
  await need('xiaoyun', 'chars');
  const M = (rows, cols) => { const m = {}; rows.forEach(r => m[r] = Object.fromEntries(cols.map(c => [c, 0]))); return m; };
  const TL = [T('rowOpen'), '*-ʔ', '*-s', T('rowStop')];
  const tone = { bs: M(TL, TONES), zs: M(TL, TONES) };
  const typ = { bs: M(['A', 'Ar', 'B', 'Br'], DENG), zs: M(['A', 'Ar', 'B', 'Br'], DENG) };
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
  return `<h1>${T('chgH')}</h1><p class="small mut">${T('chgP', nChars)}</p>
  <h2>${T('chgTone')}</h2><div class="row">${heat(tone.bs, TONES, T('th_bs'))}${heat(tone.zs, TONES, T('th_zs'))}</div>
  <h2>${T('chgDeng')}</h2><div class="row">${heat(typ.bs, DENG, T('hBS_A'))}${heat(typ.zs, DENG, T('hZS_A'))}</div>
  <h2>${T('ruleH')}</h2><div class="card small">${T('rules')}</div>`;
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
  let h = `<h1>${T('termH')} <span class="mut small">${T('termSub')}</span></h1><div class="row">${['', ...cats].map(c => `<a class="pill ${c === cat ? 'on' : ''}" href="#/術語?c=${encodeURIComponent(c)}">${c ? T('cat.' + c) : T('all')}</a>`).join('')}</div>
  <div class="scroll"><table><tr><th></th><th>${T('th_term')}</th><th>${T('th_py')}</th><th>${T('th_cat')}</th><th>${T('th_def')}</th></tr>`;
  for (const t of D.terms.filter(t => !cat || t.cat === cat))
    h += `<tr><td>${starBtn({ id: 't:' + t.t, type: 'term', t: t.t })}</td><td class="han" style="font-size:1.15rem">${esc(t.t)}</td><td class="rom">${esc(t.py)}</td><td class="small">${esc(T('cat.' + t.cat))}</td><td class="small">${esc(tdef(t))}</td></tr>`;
  return h + '</table></div>';
};

const tdef = t => t['def_' + LANG] || t.def;
/* ---------- 書籤 ---------- */
PAGES['書籤'] = async () => {
  await need('xiaoyun', 'yun206', 'chars', 'terms', 'mu');
  const a = BM.all();
  let h = `<h1>${T('bmH')}</h1><p class="small mut">${T('bmP')}</p>
   <div class="row"><button class="pri" id="tsv">${T('bmTsv')}</button><button id="json">${T('bmJson')}</button><label class="small">${T('bmImp')} <input type="file" id="imp" accept=".json"></label><button id="clr">${T('bmClr')}</button>
   <a href="#/測驗?k=字的音韻地位&bm=1">${T('bmQuiz')}</a></div>`;
  if (!a.length) return h + `<p class="mut">${T('bmEmpty')}</p>`;
  h += `<div class="scroll"><table><tr><th></th><th>${T('th_kind')}</th><th>${T('th_front')}</th><th>${T('th_back')}</th></tr>` + a.map(b => { const [f, bk] = cardOf(b); return `<tr><td>${starBtn(b)}</td><td class="small">${T('bt.' + b.type)}</td><td class="han">${esc(f)}</td><td class="small">${esc(bk)}</td></tr>`; }).join('') + '</table></div>';
  setTimeout(() => {
    const dl = (name, text, type) => { const u = URL.createObjectURL(new Blob([text], { type })); const l = document.createElement('a'); l.href = u; l.download = name; l.click(); setTimeout(() => URL.revokeObjectURL(u), 1000); };
    $('#tsv').onclick = () => dl('syeng-bookmarks.tsv', BM.all().map(b => cardOf(b).map(x => x.replace(/[\t\n]/g, ' ')).join('\t')).join('\n'), 'text/tab-separated-values');
    $('#json').onclick = () => dl('syeng-bookmarks.json', JSON.stringify(BM.all()), 'application/json');
    $('#clr').onclick = () => { if (confirm(T('bmConfirm'))) { BM.mem = []; BM.save(); route(); } };
    $('#imp').onchange = async e => { try { const arr = JSON.parse(await e.target.files[0].text()); arr.forEach(b => BM.add(b)); route(); } catch { alert(T('bmReadErr')); } };
  }, 0);
  return h;
};
function cardOf(b) {
  if (b.type === 'char') {
    const r = D.chars[b.c]?.r.find(r => r.x === b.x) || D.chars[b.c]?.r[0]; const o = r?.x ? D.XY.get(r.x) : null;
    return [b.c, `${o ? diwei(o) + ' ' + o.反切 + '切 ' + o.baxter : ''} | ${T('bsShort')} ${r?.b.map(x => '*' + x[0] + (x[1] ? ' ' + x[1] + '部' : '')).join(', ') || '—'} | ${T('zsShort')} ${r?.z.map(x => '*' + x[0]).join(', ') || '—'}`];
  }
  if (b.type === 'yun') { const y = D.XI[b.no]; return [y.name + T('xiSuffix'), `${TONES.map(t => y[t] ? y[t] + '(' + y.stat[t].py + ')' : '—').join(' ')} | ${y.攝}${T('sheSuffix')}`]; }
  if (b.type === 'term') { const t = D.terms.find(t => t.t === b.t); return [b.t, t ? `${t.py} — ${tdef(t)}` : '']; }
  if (b.type === 'mu') { const m = D.mu.find(m => m.母 === b.m); return [b.m + '母', m ? `${m.py} | ${T('nQz', m)}` : '']; }
  return [b.id, ''];
}

PAGES['說明'] = async () => {
  const base = location.href.split('#')[0];
  const bml = `javascript:(()=>{const s=String(getSelection()).trim()||prompt(${JSON.stringify(T('bmlPrompt'))});if(s)window.open('${base}#/查字?q='+encodeURIComponent(s),'syeng','width=980,height=720')})()`;
  const dir = LANG === 'zh' ? '' : LANG + '/';
  const decks = ['all', '韻目', '聲母', '術語', '字·上古中古', '小韻·音韻地位', '詩經韻腳·王力韻部'];
  return `<h1>${T('aboutH')}</h1>
  <h2>${T('bmlH')}</h2><p>${T('bmlP')}</p>
  <p><a class="bmlet" href="${esc(bml)}">${T('bmlName')}</a></p>
  <h2>${T('ankiH')}</h2><p>${T('ankiP')}</p><ul>
  ${decks.map(k => `<li><a href="anki/${dir}syeng-${k}.apkg" download>syeng-${k}.apkg</a>${k !== 'all' ? ` · <a href="anki/${dir}syeng-${k}.tsv" download>TSV</a>` : ''}　<span class="mut small">${T('anki.' + k)}</span></li>`).join('')}</ul>
  <h2>${T('srcH')}</h2><ul>${T('src')}</ul>
  <h2>${T('derH')}</h2><ul>${T('der')}</ul>
  <p class="small mut">${T('notIncl')}</p>`;
};

/* ---------- 路由 ---------- */
async function route() {
  const [p, q] = decodeURIComponent(location.hash.replace(/^#\/?/, '')).split('?');
  const qs = new URLSearchParams(location.hash.split('?')[1] || '');
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', decodeURIComponent(a.getAttribute('href')).slice(2) === p));
  const f = PAGES[p] || PAGES[''];
  $('#main').innerHTML = `<p class="loading">${T('loading')}</p>`;
  try { $('#main').innerHTML = await f(qs); } catch (e) { $('#main').innerHTML = `<p>${T('error')}${esc(e.message)}</p>`; console.error(e); }
  window.scrollTo(0, 0);
}
const NAV = ['查字', '韻表', '音節表', '聲母', '韻部', '詩經', '音變', '術語', '測驗', '書籤', '說明'];
function applyChrome() {
  document.documentElement.lang = { zh: 'zh-Hant', ja: 'ja', en: 'en' }[LANG];
  document.title = T('title');
  $('.brand small').textContent = T('brandSub');
  $('#nav').innerHTML = NAV.map(p => `<a href="#/${p}">${T('nav.' + p)}${p === '書籤' ? ' <span id="bmcount"></span>' : ''}</a>`).join('');
  $('#lang').innerHTML = LANGS.map(([k, n]) => `<option value="${k}" ${k === LANG ? 'selected' : ''}>${n}</option>`).join('');
  $('footer').innerHTML = T('footer');
  BM.badge();
}
window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', () => { applyChrome(); route(); });
