"""詩經押韻データ（digling/ard-data, GPL-3.0）から
- 詩經各篇の押韻表示用データ（王力 1980 と Baxter 1992 の判定）
- 王力《詩經韻讀》に基づく字ごとの韻部
- 韻部間の合韻・通韻の集計、本站推得韻部との一致率
を作る。出力: docs/data/shijing.json, docs/data/wangbu.json（GPL-3.0）
"""
import csv, json, re, collections

RAW = 'data/raw/digling/'
W = list(csv.DictReader(open(RAW + 'ard-data__datasets_Wang1980_rhymes.tsv', encoding='utf8'), delimiter='\t'))
B = list(csv.DictReader(open(RAW + 'ard-data__datasets_Baxter1992_rhymes.tsv', encoding='utf8'), delimiter='\t'))
chars = json.load(open('docs/data/chars.json', encoding='utf8'))

S2T = str.maketrans('阳鱼职铎东质药觉锡谈缉叶韵', '陽魚職鐸東質藥覺錫談緝葉韻')
WANG_BU = ['之', '職', '蒸', '幽', '覺', '宵', '藥', '侯', '屋', '東', '魚', '鐸', '陽', '支', '錫', '耕',
           '脂', '質', '真', '微', '物', '文', '歌', '月', '元', '緝', '侵', '盍', '談', '冬', '葉']
BU_RE = '|'.join(WANG_BU)


def parse_label(s):
    """'阳部' -> (['陽'], '部'); '脂微合韵' -> (['脂','微'], '合韻')"""
    s = s.translate(S2T).strip()
    m = re.fullmatch(rf'((?:{BU_RE})+)(部|合韻|通韻)', s)
    if not m:
        return None
    return re.findall(BU_RE, m.group(1)), m.group(2)


def final(recon):
    m = re.search(r'[aeiouəyɔɛ].*', recon or '')
    return m.group(0) if m else None


# ---- 王力：押韻グループ ----
meta = {}
for r in B:
    meta.setdefault(r['POEM_NUMBER'], (r['BLOCK'], r['CHAPTER'], r['POEM_TITLE']))

groups = collections.OrderedDict()  # key -> {'m': [(rowidx)], 'label': None}
gkey = {}
for i, r in enumerate(W):
    L = r['RHYME']
    if not L or not r['RHYMEWORD']:
        continue
    k = (r['POEM_NUMBER'], L) if L.isupper() else (r['POEM_NUMBER'], r['STANZA'], L)
    groups.setdefault(k, {'m': [], 'label': None})['m'].append(i)
    gkey[i] = k
for i, r in enumerate(W):
    c = r['COMMENT'].strip()
    if not c:
        continue
    pairs = re.findall(r'([a-hA-H])\s*=\s*([^\s,，;；]+)', c)
    if pairs:
        for L, lab in pairs:
            k = (r['POEM_NUMBER'], L) if L.isupper() else (r['POEM_NUMBER'], r['STANZA'], L)
            if k in groups and parse_label(lab):
                groups[k]['label'] = parse_label(lab)
    elif i in gkey and parse_label(c):
        groups[gkey[i]]['label'] = parse_label(c)

# 純粹な一部のグループから「韻母 -> 部」を學習
fin2bu = collections.defaultdict(collections.Counter)
for g in groups.values():
    if g['label'] and g['label'][1] == '部':
        for i in g['m']:
            f = final(W[i]['RECONSTRUCTION'])
            if f:
                fin2bu[f][g['label'][0][0]] += 1

# 字ごとの王力韻部
wb = collections.defaultdict(lambda: {'bu': collections.Counter(), 'refs': [], 'rc': collections.Counter()})
unresolved = 0
for k, g in groups.items():
    lab = g['label']
    for i in g['m']:
        r = W[i]
        ch = r['RHYMEWORD'][-1:]
        bu = None
        if lab and lab[1] == '部':
            bu = lab[0][0]
        else:
            f = final(r['RECONSTRUCTION'])
            cand = fin2bu.get(f)
            if cand:
                top = cand.most_common(1)[0][0]
                if not lab or top in lab[0]:
                    bu = top
        if bu is None:
            unresolved += 1
            continue
        e = wb[ch]
        e['bu'][bu] += 1
        if r['RECONSTRUCTION']:
            e['rc'][r['RECONSTRUCTION']] += 1
        if len(e['refs']) < 8:
            e['refs'].append([r['POEM_NUMBER'], r['STANZA']])

# 合韻・通韻の集計
mix = collections.Counter()
lab_count = collections.Counter()
for g in groups.values():
    if g['label']:
        lab_count[g['label'][1]] += 1
        if g['label'][1] != '部':
            a = g['label'][0]
            for x in a:
                for y in a:
                    if x < y:
                        mix[(x, y, g['label'][1])] += 1

# 本站推得（白—沙・鄭張から）との一致
agree = {'bs': collections.Counter(), 'zs': collections.Counter()}
conf = {'bs': collections.Counter(), 'zs': collections.Counter()}
conf_ex = collections.defaultdict(list)
for ch, e in wb.items():
    wang = e['bu'].most_common(1)[0][0]
    v = chars.get(ch)
    if not v:
        continue
    for sysk, key in (('bs', 'b'), ('zs', 'z')):
        bus = {it[1] for r in v['r'] for it in r[key] if it[1]}
        if not bus:
            continue
        w2 = {'盍': '葉'}.get(wang, wang)
        ok = w2 in bus or (w2 == '侵' and '冬' in bus)
        agree[sysk]['一致' if ok else '不一致'] += 1
        if not ok:
            key2 = (wang, '/'.join(sorted(bus)))
            conf[sysk][key2] += 1
            if len(conf_ex[(sysk,) + key2]) < 8:
                conf_ex[(sysk,) + key2].append(ch)

# ---- 篇ごとの表示データ ----
bx_by_stanza = collections.defaultdict(list)
for r in B:
    if r['RHYMEID'] not in ('', '0') and r['RHYME_WORD']:
        bx_by_stanza[(r['POEM_NUMBER'], r['STANZA'])].append((r['RHYME_WORD'][-1:], r['RHYME'].split('.')[-1], re.sub(r'\s+', '', r['OCBS'])))

poems = []
cur = None
for i, r in enumerate(W):
    n = r['POEM_NUMBER']
    if cur is None or cur['n'] != n:
        blk, chap, title = meta.get(n, ('', '', r['POEM_TITLE']))
        cur = {'n': n, 't': (title or r['POEM_TITLE']).strip(), 'b': blk.strip(), 'c': chap.strip(), 's': []}
        poems.append(cur)
    if not cur['s'] or cur['s'][-1]['id'] != r['STANZA']:
        cur['s'].append({'id': r['STANZA'], 'l': [], 'g': {}})
    st = cur['s'][-1]
    line = r['LINE'].strip()
    if not line:
        continue
    rw = r['RHYMEWORD'][-1:] if r['RHYME'] else ''
    st['l'].append([line, rw, r['RHYME'], r['RECONSTRUCTION'] if rw else ''])
    if i in gkey and groups[gkey[i]]['label']:
        bus, typ = groups[gkey[i]]['label']
        st['g'][r['RHYME']] = ''.join(bus) + typ
# Baxter 1992 の押韻グループを同じ章の同じ韻腳字へ重ねる
for p in poems:
    for st in p['s']:
        pool = list(bx_by_stanza.get((p['n'], st['id']), []))
        for ln in st['l']:
            ch = ln[1] or (ln[0][-1:] if ln[0] else '')
            hit = None
            for j, (c, gid, oc) in enumerate(pool):
                if c and (c == ln[1] or c == ln[0].rstrip('兮矣之也哉')[-1:] or c == ln[0][-1:]):
                    hit = pool.pop(j)
                    break
            ln.append([hit[0], hit[1], hit[2]] if hit else None)

out_wb = {ch: {'bu': dict(e['bu']), 'refs': e['refs'], 'rc': [x for x, _ in e['rc'].most_common(2)]} for ch, e in wb.items()}
stats = {
    'chars': len(wb), 'groups': len(groups), 'labelled': dict(lab_count), 'unresolved': unresolved,
    'mix': sorted([[a, b, t, n] for (a, b, t), n in mix.items()], key=lambda x: -x[3]),
    'agree': {k: dict(v) for k, v in agree.items()},
    'conf': {k: [[a, b, n, ''.join(conf_ex[(k, a, b)])] for (a, b), n in v.most_common(40)] for k, v in conf.items()},
}
dump = lambda n, o: json.dump(o, open('docs/data/' + n, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
dump('shijing.json', {'poems': poems})
dump('wangbu.json', {'chars': out_wb, 'stats': stats})
print(stats['chars'], stats['groups'], stats['labelled'], 'unresolved', unresolved, stats['agree'])
print(stats['mix'][:15])
print(stats['conf']['bs'][:15])
