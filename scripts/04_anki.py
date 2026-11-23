"""Anki デッキ（.apkg）と TSV を中文・日本語・英語の3版で生成する。
出力: docs/anki/（中文）, docs/anki/ja/, docs/anki/en/
學習對象（韻目・聲母名・術語・音韻地位など）は各版とも中文のまま。說明の文言だけが異なる。"""
import json, os, csv, html, zlib
import genanki

D = 'docs/data/'
xy = json.load(open(D + 'xiaoyun.json', encoding='utf8'))
F = xy['fields']
XY = {r[0]: dict(zip(F, r)) for r in xy['rows']}
chars = json.load(open(D + 'chars.json', encoding='utf8'))
yun = json.load(open(D + 'yun206.json', encoding='utf8'))
mu = json.load(open(D + 'mu.json', encoding='utf8'))
terms = json.load(open(D + 'terms.json', encoding='utf8'))
wangbu = json.load(open(D + 'wangbu.json', encoding='utf8'))['chars']
e = html.escape

CSS = """.card{font-family:"Noto Serif TC","Source Han Serif TC","PMingLiU",serif;font-size:20px;text-align:center;color:#1f1d1a;background:#fbfaf7}
.big{font-size:56px}.rom{font-family:"Charis SIL","Gentium Plus","DejaVu Sans",sans-serif}.mut{color:#777;font-size:15px}
table{margin:0 auto;border-collapse:collapse;font-size:17px}td,th{padding:3px 8px;border-bottom:1px solid #ddd}.nightMode .card{background:#18171a;color:#e9e5dd}"""

NOTES = {
    'ja': {'冬韻上聲字（湩等）附於腫韻': '冬韻の上声字，湩などは腫韻に含まれる', '獨立去聲韻': '去声だけの韻', '臻韻上去聲字附於隱、焮韻': '臻韻の上声・去声の字は隱韻・焮韻に含まれる',
           '元韻韻圖歸山攝，《廣韻》排在魂痕之前': '元韻は韻図では山摂に入るが，広韻では魂・痕の前に置かれる', '痕韻入聲字附於沒韻': '痕韻の入声字は沒韻に含まれる'},
    'en': {'冬韻上聲字（湩等）附於腫韻': 'Rising-tone words of 冬 (such as 湩) are filed under 腫', '獨立去聲韻': 'Departing tone only', '臻韻上去聲字附於隱、焮韻': 'Rising and departing words of 臻 are filed under 隱 and 焮',
           '元韻韻圖歸山攝，《廣韻》排在魂痕之前': 'The rhyme tables put 元 in 山 shè, but the Guangyun places it before 魂 and 痕', '痕韻入聲字附於沒韻': 'Entering-tone words of 痕 are filed under 沒'},
}
CATS = {
    'ja': {'總論': '総論', '文獻': '文献', '聲母': '声母', '韻母': '韻母', '聲調': '声調', '韻圖': '韻図', '注音': '注音', '方法': '方法', '學說': '学説', '學者': '学者'},
    'en': {'總論': 'General', '文獻': 'Sources', '聲母': 'Initials', '韻母': 'Finals', '聲調': 'Tones', '韻圖': 'Rhyme tables', '注音': 'Notation', '方法': 'Methods', '學說': 'Theses', '學者': 'Scholars'},
}
L = {
    'zh': dict(
        yunFront=lambda t: f'{t}聲韻目', yunInfo=lambda she, deng, n: f'{she}攝 · {deng}等 · 小韻 {n}', eg='例：',
        muFront='母', muInfo=lambda m: f"{m['音']}音 · {m['清濁']} · 三十六字母「{m['字母']}」", muOc='上古來源（白—沙）：',
        bs='白—沙 2014', zs='鄭張尚芳', qie='切',
        xyInfo=lambda o: f"{o['攝']}攝 · {o['韻目']}韻 · 同音：{o['字'][:12]}",
        sjFront='詩經韻腳 · 王力韻部？', sjSrc='王力《詩經韻讀》'),
    'ja': dict(
        yunFront=lambda t: f'{t}声の韻目', yunInfo=lambda she, deng, n: f'{she}摂 · {deng}等 · 小韻 {n}', eg='例：',
        muFront='声母', muInfo=lambda m: f"{m['音']}音 · {m['清濁']} · 三十六字母では {m['字母']}", muOc='上古での由来（白一平・沙加爾）：',
        bs='白一平・沙加爾 2014', zs='鄭張尚芳', qie='切',
        xyInfo=lambda o: f"{o['攝']}摂 · {o['韻目']}韻 · 同音字：{o['字'][:12]}",
        sjFront='詩経の韻脚　王力の韻部は？', sjSrc='王力『詩経韻読』'),
    'en': dict(
        yunFront=lambda t: f'{t}-tone rhyme heading', yunInfo=lambda she, deng, n: f'{she} shè · Div. {deng} · {n} homophone groups', eg='e.g. ',
        muFront='initial', muInfo=lambda m: f"{m['音']} · {m['清濁']} · 36 initials: {m['字母']}", muOc='Old Chinese sources (Baxter–Sagart): ',
        bs='Baxter–Sagart 2014', zs='Zhengzhang', qie='切',
        xyInfo=lambda o: f"{o['攝']} shè · rhyme {o['韻目']} · homophones: {o['字'][:12]}",
        sjFront="Shijing rhyme word — Wang Li's group?", sjSrc='Wang Li, Shijing yundu'),
}
GPL_DECKS = {'詩經韻腳·王力韻部'}


def diwei(o):
    lei = o['類'] if o.get('類') in ('A', 'B') else ''
    return f"{o['母']}{o['呼'] or ''}{o['等']}{lei}{o['韻']}{o['聲']}"


def build(lang):
    S = L[lang]
    out = 'docs/anki/' + ('' if lang == 'zh' else lang + '/')
    os.makedirs(out, exist_ok=True)
    pre = '' if lang == 'zh' else lang + ':'  # zh は既存の ID を保つ
    root = 'Syeng' if lang == 'zh' else f'Syeng ({lang})'
    model = genanki.Model(1795440001 if lang == 'zh' else 1795440001 + zlib.crc32(lang.encode()) % 100000, f'{root} 基本',
                          fields=[{'name': f} for f in ['正面', '背面', 'ID']], css=CSS,
                          templates=[{'name': '正→背', 'qfmt': '{{正面}}', 'afmt': '{{FrontSide}}<hr id=answer>{{背面}}'}])

    class Note(genanki.Note):
        @property
        def guid(self):
            return genanki.guid_for(self.fields[2])

    decks, tsv = {}, {}

    def add(deck, front, back, nid):
        decks.setdefault(deck, genanki.Deck(zlib.crc32((pre + 'syeng:' + deck).encode()) % (1 << 30) + 1000, f'{root}::{deck}'))
        decks[deck].add_note(Note(model=model, fields=[front, back, pre + nid]))
        tsv.setdefault(deck, []).append((front, back))

    # 1. 韻目
    for y in yun:
        note = NOTES.get(lang, {}).get(y['note'], y['note'])
        for t in '平上去入':
            m = y[t]
            if not m:
                continue
            st = y['stat'][t]
            four = ''.join(f"<td>{e(y[x]) or '—'}<br><span class=rom>{e(y['stat'][x]['py']) if y[x] else ''}</span></td>" for x in '平上去入')
            ex = '、'.join(f"{e(a)}<span class='rom mut'> {e(c or '')}</span>" for a, b, c in st['ex'][:4])
            back = (f"<div class=rom>{e(st['py'])}</div>" + (f"<div class=mut>{e(st['pynote'])}</div>" if st['pynote'] and lang == 'zh' else '')
                    + f"<table><tr><th>平</th><th>上</th><th>去</th><th>入</th></tr><tr>{four}</tr></table>"
                    f"<div>{e(S['yunInfo'](y['攝'], ''.join(sorted(st['等'])), st['n']))}</div><div class=mut>{S['eg']}{ex}</div>"
                    + (f"<div class=mut>{e(note)}</div>" if note else ''))
            add('韻目', f"<div class=big>{e(m)}</div><div class=mut>{e(S['yunFront'](t))}</div>", back, f'yun:{m}')

    # 2. 聲母
    for m in mu:
        oc = ' '.join(f"*{e(k)}<sub>{n}</sub>" for k, n, _ in m['oc'][:5])
        add('聲母', f"<div class=big>{e(m['母'])}</div><div class=mut>{e(S['muFront'])}</div>",
            f"<div class=rom>{e(m['py'])}</div><div>{e(S['muInfo'](m))}</div>"
            f"<div class='rom mut'>{e(S['muOc'])}{oc}</div>", f"mu:{m['母']}")

    # 3. 術語
    for t in terms:
        cat = CATS.get(lang, {}).get(t['cat'], t['cat'])
        d = t.get('def_' + lang) or t['def']
        add('術語', f"<div class=big style='font-size:40px'>{e(t['t'])}</div><div class=mut>{e(cat)}</div>",
            f"<div class=rom>{e(t['py'])}</div><div>{e(d)}</div>", f"term:{t['t']}")

    # 4. 字（白—沙が確定對應のもの）
    for c, v in chars.items():
        for r in v['r']:
            if not r['x'] or not r['b'] or any(b[3] != 'ok' for b in r['b']) or r['h'] not in ('exact', 'baxter-only'):
                continue
            o = XY[r['x']]
            bs = '<br>'.join(f"*{e(b[0])}" + (f" {b[1]}部" if b[1] else '') for b in r['b'])
            zs = '<br>'.join(f"*{e(z[0])}" + (f" {z[1]}部" if z[1] else '') for z in r['z']) or '—'
            back = (f"<div>{e(diwei(o))} · {e(o['反切'] or '')}{S['qie']}</div><div class=rom>{e(o['baxter'])}</div>"
                    f"<table><tr><th>{e(S['bs'])}</th><th>{e(S['zs'])}</th></tr><tr><td class=rom>{bs}</td><td class=rom>{zs}</td></tr></table>"
                    f"<div class=mut>{e(r.get('g') or '')}</div>")
            multi = sum(1 for x in v['r'] if x['x']) > 1
            hint = e((r.get('g') or '')[:14] + '…') if multi else e('; '.join(v['g'][:1]))
            add('字·上古中古', f"<div class=big>{e(c)}</div><div class=mut>{hint}</div>", back, f"char:{c}|{r['x']}")

    # 5. 小韻
    for no, o in XY.items():
        if not o.get('聲'):
            continue
        add('小韻·音韻地位', f"<div class=big>{e(o['代表字'])}</div><div class=mut>{e(o['反切'] or '')}{S['qie']}</div>",
            f"<div>{e(diwei(o))}</div><div class=rom>{e(o['baxter'])} · {e(o['tupa'])}</div>"
            f"<div class=mut>{e(S['xyInfo'](o))}</div>", f'xy:{no}')

    # 6. 詩經韻腳·王力韻部（GPL-3.0。syeng-all には含めない）
    for c, w in sorted(wangbu.items(), key=lambda x: -sum(x[1]['bu'].values())):
        bus = '、'.join(f"{b}部" + (f"×{n}" if len(w['bu']) > 1 else '') for b, n in sorted(w['bu'].items(), key=lambda x: -x[1]))
        refs = ' '.join(st for _, st in w['refs'][:6])
        add('詩經韻腳·王力韻部', f"<div class=big>{e(c)}</div><div class=mut>{e(S['sjFront'])}</div>",
            f"<div style='font-size:28px'>{e(bus)}</div><div class=rom>{e(' '.join('*' + x for x in w['rc']))}</div>"
            f"<div class=mut>{e(S['sjSrc'])} · {e(refs)}</div>", f'wang:{c}')

    genanki.Package([d for k, d in decks.items() if k not in GPL_DECKS]).write_to_file(out + 'syeng-all.apkg')
    for name, d in decks.items():
        genanki.Package([d]).write_to_file(out + f'syeng-{name}.apkg')
        with open(out + f'syeng-{name}.tsv', 'w', encoding='utf8', newline='') as f:
            wr = csv.writer(f, delimiter='\t', quoting=csv.QUOTE_MINIMAL)
            wr.writerow(['#separator:tab'])
            wr.writerow(['#html:true'])
            for a, b in tsv[name]:
                wr.writerow([a, b])
    print(lang, {k: len(v.notes) for k, v in decks.items()})


for lang in ('zh', 'ja', 'en'):
    build(lang)
