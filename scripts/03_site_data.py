"""サイト・Anki 用データを生成する。出力: site/data/*.json"""
import json, collections, os

B = 'data/build/'
OUT = 'docs/data/'
os.makedirs(OUT, exist_ok=True)
xy = json.load(open(B + 'qieyun_xiaoyun.json', encoding='utf8'))
ent = json.load(open(B + 'qieyun_entries.json', encoding='utf8'))
chars = json.load(open(B + 'chars.json', encoding='utf8'))
MU_ALIAS = {'襇': '襉', '号': '號'}  # nk2028 の字形 -> 本表の字形
for o in xy:
    o['韻目'] = MU_ALIAS.get(o['韻目'], o['韻目'])
XY = {o['no']: o for o in xy}


def tsv(path):
    for l in open(path, encoding='utf8'):
        if l.startswith('#') or not l.strip():
            continue
        yield l.rstrip('\n').split('\t')


PY = {}
PYNOTE = {}
for row in tsv('data/manual/pinyin.tsv'):
    PY[row[0]] = row[1]
    if len(row) > 2 and row[2]:
        PYNOTE[row[0]] = row[2]

# ---- 206 韻 ----
yun206 = []
mu2xi = {}  # 韻目 -> 韻系序
for row in tsv('data/manual/yunmu206.tsv'):
    row += [''] * (7 - len(row))
    no, she, p, s, q, r, note = row
    yun206.append({'no': int(no), '攝': she, '平': p, '上': s, '去': q, '入': r, 'note': note})
    for t in (p, s, q, r):
        if t:
            mu2xi[t] = int(no)
XI = {y['no']: y for y in yun206}
# 韻系名（平聲韻目，獨立去聲韻は去聲韻目）
for y in yun206:
    y['name'] = y['平'] or y['去']


def xi_of(o):
    return mu2xi.get(o['韻目'])


# 各韻目の小韻數・等・呼・Baxter 韻母例
stat = collections.defaultdict(lambda: {'n': 0, '等': collections.Counter(), '呼': collections.Counter(), 'ex': []})
for o in xy:
    st = stat[o['韻目']]
    st['n'] += 1
    if o.get('等'):
        st['等'][o['等']] += 1
        st['呼'][o.get('呼') or '中'] += 1
    if len(st['ex']) < 6:
        st['ex'].append([o['代表字'], o.get('描述'), o.get('baxter')])
for y in yun206:
    y['stat'] = {}
    for t in '平上去入':
        m = y[t]
        if m:
            s = stat.get(m)
            y['stat'][t] = {'n': s['n'] if s else 0, '等': dict(s['等']) if s else {}, '呼': dict(s['呼']) if s else {},
                            'ex': s['ex'] if s else [], 'py': PY.get(m), 'pynote': PYNOTE.get(m)}

# ---- 小韻（compact） ----
FIELDS = ['no', '韻目', '反切', '代表字', '描述', '母', '呼', '等', '類', '韻', '聲', '攝', '清濁', '組', '音', '韻別',
          '字母', '韻圖等', 'baxter', 'tupa', 'unt', 'wangli', 'panwuyun', 'karlgren', 'putonghua']
xy_c = []
for o in xy:
    xy_c.append([o.get(k) if k != '字' else None for k in FIELDS] + [''.join(o['字'])])
gloss = {}
for c, no, g in ent:
    gloss.setdefault(c + '|' + no, g)

# ---- 字（compact） ----
chars_c = {}
for ch, v in chars.items():
    rs = []
    for r in v['r']:
        rs.append({
            'x': r['xy'], 'bx': r['bx'], 'h': r['how'],
            'b': [[i['f'], i.get('bu'), i.get('rk'), i.get('q'), i.get('t'), i.get('A'), i.get('r')] for i in r['bs']],
            'z': [[i['f'], i.get('bu'), i.get('rk'), i.get('q'), i.get('t'), i.get('A'), i.get('r')] for i in r['zs']],
        })
    chars_c[ch] = {'p': v['py'], 'g': v['gloss'][:2], 'r': rs}
    if v.get('nmc') == 1 and v['r'][0]['how'] == 'exact':
        chars_c[ch]['u'] = 1  # 中古音が一つだけ：對應づけの判斷を經ない
# 廣韻にのみある字（上古音なし）
for c, no, g in ent:
    if c not in chars_c:
        chars_c[c] = {'p': [], 'g': [], 'r': []}
    if not any(r['x'] == no for r in chars_c[c]['r']):
        chars_c[c]['r'].append({'x': no, 'bx': XY[no].get('baxter'), 'h': 'guangyun-only', 'b': [], 'z': []})
for c in chars_c:
    for r in chars_c[c]['r']:
        if r['x']:
            r['g'] = gloss.get(c + '|' + r['x'], '')

# ---- 韻部對應（上古→中古） ----
COND = lambda i: ('?' if i.get('A') is None else ('A' if i['A'] else 'B')) + ('r' if i.get('r') else '')
corr = {}
for sysname, key in (('bs', 'bs'), ('zs', 'zs')):
    agg = collections.defaultdict(lambda: collections.defaultdict(lambda: collections.defaultdict(lambda: {'n': 0, 'ex': []})))
    for ch, v in chars.items():
        for r in v['r']:
            o = XY.get(r['xy']) if r['xy'] else None
            if not o or not o.get('韻'):
                continue
            xi = xi_of(o)
            xin = XI[xi]['name'] if xi else o['韻目']
            lei = o.get('類') if o.get('類') in ('A', 'B') else ''
            dst = f"{xin}{o.get('呼') or ''}{o['等']}{lei}"
            for i in r[key]:
                if i.get('q') == 'none' or not i.get('bu'):
                    continue
                cell = agg[i['bu']][i['rk'] + '|' + COND(i)][dst]
                cell['n'] += 1
                if len(cell['ex']) < 8:
                    cell['ex'].append([ch, i['f'], r['bx']])
    corr[sysname] = {bu: {k: dict(v) for k, v in d.items()} for bu, d in agg.items()}

BU30 = ['之', '職', '蒸', '幽', '覺', '冬', '宵', '藥', '侯', '屋', '東', '魚', '鐸', '陽', '支', '錫', '耕',
        '脂', '質', '真', '微', '物', '文', '歌', '月', '元', '緝', '侵', '葉', '談']

# ---- 聲母：中古母 ← 上古聲母（BS 頭子音）の分布 ----
import re
ini_corr = collections.defaultdict(lambda: collections.defaultdict(lambda: {'n': 0, 'ex': []}))


def bs_initial(f):
    s = re.sub(r'[\[\]\(\)<>]', '', f)
    s = re.sub(r'-?s$', '', s).rstrip('ʔ-')
    syl = s.split('.')[-1]
    while True:
        m = re.match(r'^([A-Za-zŋɢɡʔə]{1,2})-(?=.)', syl)
        if not m:
            break
        syl = syl[m.end():]
    m = re.match(r'^[^ieaouəA]*', syl)
    ini = m.group(0) if m else ''
    ini = ini.replace('ˤ', '')
    ini = re.sub(r'r$', '', ini) if len(ini) > 1 else ini
    return ini or 'ø'


for ch, v in chars.items():
    for r in v['r']:
        o = XY.get(r['xy']) if r['xy'] else None
        if not o or not o.get('母'):
            continue
        for i in r['bs']:
            if i.get('q') == 'none':
                continue
            k = bs_initial(i['f'])
            cell = ini_corr[o['母']][k]
            cell['n'] += 1
            if len(cell['ex']) < 6:
                cell['ex'].append([ch, i['f'], r['bx']])

MU = ['幫', '滂', '並', '明', '端', '透', '定', '泥', '來', '知', '徹', '澄', '孃', '精', '清', '從', '心', '邪',
      '莊', '初', '崇', '生', '俟', '章', '昌', '船', '書', '常', '日', '見', '溪', '羣', '疑', '影', '曉', '匣', '云', '以']
mu_info = []
for m in MU:
    os_ = [o for o in xy if o.get('母') == m]
    o0 = os_[0] if os_ else {}
    mu_info.append({'母': m, 'py': PY.get(m), '組': o0.get('組'), '音': o0.get('音'), '清濁': o0.get('清濁'),
                    '字母': '/'.join(k for k, _ in collections.Counter(o.get('字母') for o in os_ if o.get('字母')).most_common()), 'n': len(os_),
                    'oc': sorted(([k, v['n'], v['ex']] for k, v in ini_corr[m].items()), key=lambda x: -x[1])[:10]})

TI = {r[0]: r for r in tsv('data/manual/terms_i18n.tsv')}
terms = [dict(zip(['t', 'py', 'cat', 'def'], r)) for r in tsv('data/manual/terms.tsv')]
for t in terms:
    t['def_ja'], t['def_en'] = TI[t['t']][1], TI[t['t']][2]

dump = lambda n, o: json.dump(o, open(OUT + n, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
dump('xiaoyun.json', {'fields': FIELDS + ['字'], 'rows': xy_c})
dump('chars.json', chars_c)
dump('yun206.json', yun206)
dump('corr.json', {'bu30': BU30, 'bs': corr['bs'], 'zs': corr['zs']})
dump('mu.json', mu_info)
dump('terms.json', terms)
dump('pinyin.json', {'py': PY, 'note': PYNOTE})
print({f: os.path.getsize(OUT + f) for f in os.listdir(OUT)})
