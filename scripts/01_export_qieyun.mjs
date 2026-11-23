// 廣韻（nk2028/tshet-uinh, MIT）を書き出し、各種推導を付す
import * as T from 'tshet-uinh'; import * as X from 'tshet-uinh-examples'; import fs from 'fs';
const schemes = ['baxter','tupa','unt','wangli','panwuyun','karlgren','putonghua'];
const der = Object.fromEntries(schemes.map(k=>[k, X[k]()]));
const xy = new Map(); // 小韻號 -> obj
const entries = [];
for (const e of T.資料.廣韻.iter條目()) {
  const no = e.來源.小韻號;
  if (!xy.has(no)) {
    const d = e.音韻地位;
    const o = { no, 韻目: e.來源.韻目, 反切: e.反切, 代表字: e.字頭, 字: [] };
    if (d) Object.assign(o, {
      描述: d.描述, 母: d.母, 呼: d.呼, 等: d.等, 類: d.類, 韻: d.韻, 聲: d.聲,
      攝: d.攝, 清濁: d.清濁, 組: d.組, 音: d.音, 韻別: d.韻別, 字母: d.字母, 韻圖等: d.韻圖等,
      ...Object.fromEntries(schemes.map(k=>{ try { return [k, der[k](d, e.字頭)]; } catch { return [k,null]; } })),
    });
    xy.set(no, o);
  }
  xy.get(no).字.push(e.字頭);
  entries.push([e.字頭, no, (e.釋義||'').slice(0,40)]);
}
const out = [...xy.values()];
fs.writeFileSync('data/build/qieyun_xiaoyun.json', JSON.stringify(out));
fs.writeFileSync('data/build/qieyun_entries.json', JSON.stringify(entries));
// 韻 一覽（四聲相承用）
const 韻s = {}; for (const o of out) if (o.韻) { const k=o.韻; 韻s[k] ??= {韻:k, 攝:o.攝, 韻別:o.韻別, 聲:{}, 等:new Set(), 呼:new Set()}; 韻s[k].聲[o.聲]=(韻s[k].聲[o.聲]||new Set()).add(o.韻目); 韻s[k].等.add(o.等); 韻s[k].呼.add(o.呼??'中'); }
for (const v of Object.values(韻s)) { v.等=[...v.等]; v.呼=[...v.呼]; for (const s in v.聲) v.聲[s]=[...v.聲[s]]; }
fs.writeFileSync('data/build/qieyun_yun.json', JSON.stringify(Object.values(韻s)));
console.log('小韻', out.length, '條目', entries.length, '韻', Object.keys(韻s).length);
