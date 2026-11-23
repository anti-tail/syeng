"""Anki デッキ（.apkg）と TSV を生成する。出力: docs/anki/"""
import json, os, csv, html, zlib
import genanki

D = 'docs/data/'
OUT = 'docs/anki/'
os.makedirs(OUT, exist_ok=True)
xy = json.load(open(D + 'xiaoyun.json', encoding='utf8'))
F = xy['fields']
XY = {r[0]: dict(zip(F, r)) for r in xy['rows']}
chars = json.load(open(D + 'chars.json', encoding='utf8'))
yun = json.load(open(D + 'yun206.json', encoding='utf8'))
mu = json.load(open(D + 'mu.json', encoding='utf8'))
terms = json.load(open(D + 'terms.json', encoding='utf8'))
e = html.escape

CSS = """.card{font-family:"Noto Serif TC","Source Han Serif TC","PMingLiU",serif;font-size:20px;text-align:center;color:#1f1d1a;background:#fbfaf7}
.big{font-size:56px}.rom{font-family:"Charis SIL","Gentium Plus","DejaVu Sans",sans-serif}.mut{color:#777;font-size:15px}
table{margin:0 auto;border-collapse:collapse;font-size:17px}td,th{padding:3px 8px;border-bottom:1px solid #ddd}.nightMode .card{background:#18171a;color:#e9e5dd}"""


def model(mid, name, fields):
    return genanki.Model(mid, name, fields=[{'name': f} for f in fields], css=CSS,
                         templates=[{'name': '正→背', 'qfmt': '{{正面}}', 'afmt': '{{FrontSide}}<hr id=answer>{{背面}}'}])


M = model(1795440001, 'Syeng 基本', ['正面', '背面', 'ID'])


class Note(genanki.Note):
    @property
    def guid(self):
        return genanki.guid_for(self.fields[2])


def diwei(o):
    lei = o['類'] if o.get('類') in ('A', 'B') else ''
    return f"{o['母']}{o['呼'] or ''}{o['等']}{lei}{o['韻']}{o['聲']}"


decks, tsv = {}, {}


def add(deck, front, back, nid):
    decks.setdefault(deck, genanki.Deck(zlib.crc32(('syeng:' + deck).encode()) % (1 << 30) + 1000, 'Syeng::' + deck))
    decks[deck].add_note(Note(model=M, fields=[front, back, nid]))
    tsv.setdefault(deck, []).append((front, back))


# 1. 韻目
for y in yun:
    for t in '平上去入':
        m = y[t]
        if not m:
            continue
        st = y['stat'][t]
        four = ''.join(f"<td>{e(y[x]) or '—'}<br><span class=rom>{e(y['stat'][x]['py']) if y[x] else ''}</span></td>" for x in '平上去入')
        ex = '、'.join(f"{e(a)}<span class='rom mut'> {e(c or '')}</span>" for a, b, c in st['ex'][:4])
        back = (f"<div class=rom>{e(st['py'])}</div><div class=mut>{e(st['pynote'] or '')}</div>"
                f"<table><tr><th>平</th><th>上</th><th>去</th><th>入</th></tr><tr>{four}</tr></table>"
                f"<div>{e(y['攝'])}攝 · {''.join(sorted(st['等']))}等 · 小韻 {st['n']}</div><div class=mut>例：{ex}</div>"
                + (f"<div class=mut>{e(y['note'])}</div>" if y['note'] else ''))
        add('韻目', f"<div class=big>{e(m)}</div><div class=mut>{t}聲韻目</div>", back, f'yun:{m}')

# 2. 聲母
for m in mu:
    oc = ' '.join(f"*{e(k)}<sub>{n}</sub>" for k, n, _ in m['oc'][:5])
    add('聲母', f"<div class=big>{e(m['母'])}</div><div class=mut>母</div>",
        f"<div class=rom>{e(m['py'])}</div><div>{e(m['音'])}音 · {e(m['清濁'])} · 三十六字母「{e(m['字母'])}」</div>"
        f"<div class='rom mut'>上古來源（白—沙）：{oc}</div>", f"mu:{m['母']}")

# 3. 術語
for t in terms:
    add('術語', f"<div class=big style='font-size:40px'>{e(t['t'])}</div><div class=mut>{e(t['cat'])}</div>",
        f"<div class=rom>{e(t['py'])}</div><div>{e(t['def'])}</div>", f"term:{t['t']}")

# 4. 字（上古—中古，白—沙が確定對應のもの）
for c, v in chars.items():
    for r in v['r']:
        if not r['x'] or not r['b'] or any(b[3] != 'ok' for b in r['b']) or r['h'] not in ('exact', 'baxter-only'):
            continue
        o = XY[r['x']]
        bs = '<br>'.join(f"*{e(b[0])}" + (f" {b[1]}部" if b[1] else '') for b in r['b'])
        zs = '<br>'.join(f"*{e(z[0])}" + (f" {z[1]}部" if z[1] else '') for z in r['z']) or '—'
        back = (f"<div>{e(diwei(o))} · {e(o['反切'] or '')}切</div><div class=rom>{e(o['baxter'])}</div>"
                f"<table><tr><th>白—沙 2014</th><th>鄭張尚芳</th></tr><tr><td class=rom>{bs}</td><td class=rom>{zs}</td></tr></table>"
                f"<div class=mut>{e(r.get('g') or '')}</div>")
        multi = sum(1 for x in v['r'] if x['x']) > 1
        hint = e((r.get('g') or '')[:14] + '…') if multi else e('; '.join(v['g'][:1]))
        add('字·上古中古', f"<div class=big>{e(c)}</div><div class=mut>{hint}</div>", back, f"char:{c}|{r['x']}")

# 5. 小韻（切韻音系）
for no, o in XY.items():
    if not o.get('聲'):
        continue
    add('小韻·音韻地位', f"<div class=big>{e(o['代表字'])}</div><div class=mut>{e(o['反切'] or '')}切</div>",
        f"<div>{e(diwei(o))}</div><div class=rom>{e(o['baxter'])} · {e(o['tupa'])}</div>"
        f"<div class=mut>{e(o['攝'])}攝 · {e(o['韻目'])}韻 · 同音：{e(o['字'][:12])}</div>", f'xy:{no}')

genanki.Package(list(decks.values())).write_to_file(OUT + 'syeng-all.apkg')
for name, d in decks.items():
    genanki.Package([d]).write_to_file(OUT + f'syeng-{name}.apkg')
    with open(OUT + f'syeng-{name}.tsv', 'w', encoding='utf8', newline='') as f:
        w = csv.writer(f, delimiter='\t', quoting=csv.QUOTE_MINIMAL)
        w.writerow(['#separator:tab'])
        w.writerow(['#html:true'])
        for a, b in tsv[name]:
            w.writerow([a, b])
print({k: len(v.notes) for k, v in decks.items()}, {f: os.path.getsize(OUT + f) for f in os.listdir(OUT)})
