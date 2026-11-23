"""Wiktionary（kaikki.org 抽出, CC BY-SA）の上古音・中古音を廣韻の小韻に対応づける。

入力:  data/raw/wiktionary_zh_oc_mc.jsonl, data/build/qieyun_*.json
出力:  data/build/chars.json   字ごとの讀音（中古地位＋BS＋鄭張＋韻部）
       data/build/align_report.json
"""
import json, re, collections, unicodedata

RAW = 'data/raw/wiktionary_zh_oc_mc.jsonl'
xy = json.load(open('data/build/qieyun_xiaoyun.json', encoding='utf8'))
ent = json.load(open('data/build/qieyun_entries.json', encoding='utf8'))
XY = {o['no']: o for o in xy}

# 字 -> 小韻號, Baxter -> 小韻號
char_xy = collections.defaultdict(list)
for c, no, _ in ent:
    if no not in char_xy[c]:
        char_xy[c].append(no)
bx_xy = collections.defaultdict(list)
for o in xy:
    if o.get('baxter'):
        bx_xy[o['baxter']].append(o['no'])

TONE_MC = {'平': 0, '上': 1, '去': 2, '入': 3}


def lev(a, b):
    p = list(range(len(b) + 1))
    for i, x in enumerate(a, 1):
        q = [i]
        for j, y in enumerate(b, 1):
            q.append(min(p[j] + 1, q[j - 1] + 1, p[j - 1] + (x != y)))
        p = q
    return p[-1]


def mc_to_xy(ch, bx):
    """Wiktionary の Baxter 中古音を小韻に。(小韻號, 方法)"""
    cands = char_xy.get(ch, [])
    for no in cands:
        if XY[no].get('baxter') == bx:
            return no, 'exact'
    if len(bx_xy.get(bx, [])) >= 1:
        # 字頭が廣韻にない（異體）場合：同一 Baxter 形の小韻
        nos = bx_xy[bx]
        return nos[0], 'baxter-only' if len(nos) == 1 else 'baxter-ambiguous'
    # 重紐表記差など：同字の讀音で編集距離最小（同聲調に限る）
    def tone(b):
        return 'X' if b.endswith('X') else 'H' if b.endswith('H') else 'E' if b[-1:] in 'ptk' else 'P'
    best = None
    for no in cands:
        b2 = XY[no].get('baxter') or ''
        if tone(b2) != tone(bx):
            continue
        d = lev(b2, bx)
        if best is None or d < best[0]:
            best = (d, no)
    if best and best[0] <= 2:
        return best[1], 'fuzzy'
    return None, 'unmatched'


# ---------- 上古音の解析 ----------
VOW_BS = 'ieaouə'
VOW_ZS = 'ieaouɯ'


def clean(f):
    f = unicodedata.normalize('NFC', f.strip().strip('/').lstrip('*'))
    f = f.replace('ә', 'ə').replace('ˁ', 'ˤ').replace('̊', '̥').replace('·', '.')
    return f


def parse_oc(form, system):
    """主元音・韻尾・聲調・A/B 型・r 介音を取り出す。"""
    f = clean(form)
    core = re.sub(r'[\[\]\(\)<>{}]', '', f)
    core = core.replace('ˀ', 'ʔ')
    # 聲調
    tone = 0
    body = core
    if re.search(r'-?s$', body):
        tone = 2
        body = re.sub(r'-?s$', '', body)
    elif re.search(r'-?ʔ$', body):
        tone = 1
        body = re.sub(r'-?ʔ$', '', body)
    body = body.rstrip('-')
    if tone == 2:
        body = body.rstrip('ʔ').rstrip('-')
    vows = VOW_BS if system == 'bs' else VOW_ZS
    # 最後の主音節：'.' 以降（前置音節を除く）
    syl = body.split('.')[-1]
    # 接頭辭 N- m- s- t- k- など
    prefix = ''
    while True:
        pre = re.match(r'^([A-Za-zŋɢɡʔə]{1,2})-(?=.)', syl)
        if not pre:
            break
        prefix = pre.group(1)
        syl = syl[pre.end():]
    unsure_A = 'A' in syl
    syl = syl.replace('A', 'a')
    m = None
    for i in range(len(syl) - 1, -1, -1):
        if syl[i] in vows:
            m = i
            break
    if m is None:
        return None
    # 長母音・連續母音の頭へ戻る（ZS の ː、BS の複合は無し）
    v = syl[m]
    coda = syl[m + 1:].replace('ː', '')
    onset = syl[:m]
    coda = coda.replace('̥', '')
    stops = {'k', 't', 'p', 'ɡ', 'd', 'b', 'ɢ', 'wk', 'wɢ', 'g'}
    if tone == 0 and coda in stops:
        tone = 3
    long_ = 'ː' in syl[m:m + 2]
    a_type = ('ˤ' in onset) if system == 'bs' else long_
    r_med = bool(re.search(r'r', onset.replace('ʳ', 'r'))) and not onset.startswith('r') or bool(re.search(r'.r', onset))
    return {'v': v, 'coda': coda, 'tone': tone, 'A': None if (unsure_A and system == 'bs') else a_type,
            'r': r_med, 'onset': onset, 'ini': onset_class(onset, prefix)}


def onset_class(o, prefix):
    if prefix == 'N':
        return 'voiced'
    o = o.replace('ˤ', '').replace('ʷ', '').replace('ː', '')
    if not o:
        return None
    c0 = o[0]
    if c0 in 'bdɡɢgɦ':
        return 'voiced'
    if 'ʰ' in o:
        return 'asp'
    if c0 in 'mnŋlrjw':
        return 'vlson' if o[1:2] == '̥' else 'son'
    if c0 == 'h' and o[1:2] in tuple('mnŋlrjw'):
        return 'vlson'
    if c0 == 'C':
        return None
    return 'vl'


RHYME_TRAD = {
    # (母音, 韻尾類) -> 王力 30 部
}
_open = {'ə': '之', 'ɯ': '之', 'u': '幽', 'a': '魚', 'e': '支', 'o': '侯', 'i': '脂'}
_k = {'ə': '職', 'ɯ': '職', 'u': '覺', 'a': '鐸', 'e': '錫', 'o': '屋', 'i': '質'}
_ng = {'ə': '蒸', 'ɯ': '蒸', 'u': '冬', 'a': '陽', 'e': '耕', 'o': '東', 'i': '真'}
_j = {'ə': '微', 'ɯ': '微', 'u': '微', 'a': '歌', 'e': '歌', 'o': '歌', 'i': '脂'}
_t = {'ə': '物', 'ɯ': '物', 'u': '物', 'a': '月', 'e': '月', 'o': '月', 'i': '質'}
_n = {'ə': '文', 'ɯ': '文', 'u': '文', 'a': '元', 'e': '元', 'o': '元', 'i': '真'}
_p = {'ə': '緝', 'ɯ': '緝', 'u': '緝', 'a': '葉', 'e': '葉', 'o': '葉', 'i': '緝'}
_m = {'ə': '侵', 'ɯ': '侵', 'u': '侵', 'a': '談', 'e': '談', 'o': '談', 'i': '侵'}
_w = {'ə': '幽', 'ɯ': '幽', 'u': '幽', 'i': '幽', 'a': '宵', 'e': '宵', 'o': '宵'}
_wk = {'ə': '覺', 'ɯ': '覺', 'u': '覺', 'i': '覺', 'a': '藥', 'e': '藥', 'o': '藥'}
CODA_CLASS = {
    '': _open, 'k': _k, 'ɡ': _k, 'g': _k, 'ŋ': _ng, 'j': _j, 'l': _j, 't': _t, 'd': _t,
    'n': _n, 'r': _n, 'p': _p, 'b': _p, 'm': _m, 'w': _w, 'wk': _wk, 'wɢ': _wk, 'ɢ': _wk,
}
CODA_NORM = {'ɡ': 'k', 'g': 'k', 'd': 't', 'b': 'p', 'l': 'j', 'ɢ': 'wk', 'wɢ': 'wk'}
RHYME_TYPE = {'': '陰', 'j': '陰', 'w': '陰', 'r': '陽', 'n': '陽', 'ŋ': '陽', 'm': '陽',
              'k': '入', 't': '入', 'p': '入', 'wk': '入'}


def bu(p):
    if not p:
        return None
    t = CODA_CLASS.get(p['coda'])
    return t.get(p['v']) if t else None


def rhyme_key(p, system):
    """六元音式の韻類（BS 表記に正規化）"""
    v = {'ɯ': 'ə'}.get(p['v'], p['v'])
    c = CODA_NORM.get(p['coda'], p['coda'])
    if system == 'zs' and p['v'] == 'u' and p['coda'] == 'ɢ':
        c = 'k'
    return '*-' + v + c


MC_TYPE = {'陰': '陰', '陽': '陽', '入': '入'}


def score(p, o):
    """上古形 p と中古小韻 o の整合度"""
    if not p or not o.get('聲'):
        return -9
    s = 0
    mt = TONE_MC[o['聲']]
    s += 3 if p['tone'] == mt else -3
    deng = o['等']
    if p['A'] is None:
        pass
    elif p['A']:
        s += 2 if deng in '一二四' else -2
        if deng == '二':
            s += 1 if p['r'] else -1
    else:
        s += 2 if deng == '三' else -2
    qz = o.get('清濁'); ini = p.get('ini')
    if ini == 'voiced':
        s += 1.5 if qz == '全濁' else -1
    elif ini == 'asp':
        s += 1 if qz == '次清' else 0
    elif ini == 'son':
        s += 1 if qz == '次濁' else 0
    elif ini == 'vlson':
        s += 1 if qz in ('全清', '次清') else -0.5
    elif ini == 'vl':
        s += 1 if qz == '全清' else (-1 if qz == '全濁' else 0)
    c = CODA_NORM.get(p['coda'], p['coda'])
    oc_type = RHYME_TYPE.get(c)
    mc_type = o.get('韻別')
    if oc_type and mc_type:
        exp = oc_type
        if oc_type == '入' and p['tone'] == 2:
            exp = '陰'  # *-ts *-ks > 去聲陰聲韻
        s += 2 if exp == mc_type else -2
    return s


def strip_form(f):
    return clean(f)


import os, sys
sys.path.insert(0, 'scripts')
from bs11 import load2, key as bskey
BSL = load2() if os.path.exists('_private/bs11.txt') else {}
BS_BY_KEY = collections.defaultdict(list)  # 異體字形で載っている項目のため：(上古形, 中古音) -> 一覧の字
for _c, _es in BSL.items():
    for _MC, _k, _d in _es:
        BS_BY_KEY[(_k, _MC)].append((_c, _d))
if not BSL:
    print('警告: _private/bs11.txt が無いため白—沙の對應を確定できません')
records = {}
report = collections.Counter()
dropped = []
for line in open(RAW, encoding='utf8'):
    d = json.loads(line)
    ch = d['w']
    r = records.setdefault(ch, {'mc': [], 'bs': [], 'zs': [], 'py': [], 'gloss': []})
    for s in d['s']:
        t = s['tags']; v = s.get('zh_pron')
        if not v:
            continue
        key = 'mc' if 'Middle-Chinese' in t else 'bs' if 'Baxter-Sagart' in t else 'zs' if 'Zhengzhang' in t else 'py' if 'Pinyin' in t else None
        if key and v not in r[key]:
            r[key].append(v)
    for g in d.get('g') or []:
        if g not in r['gloss'] and len(r['gloss']) < 4:
            r['gloss'].append(g)

out = {}
for ch, r in records.items():
    mcs = []
    for b in r['mc']:
        no, how = mc_to_xy(ch, b)
        report['mc:' + how] += 1
        mcs.append({'bx': b, 'xy': no, 'how': how})
    readings = [dict(m, bs=[], zs=[]) for m in mcs]
    nW = len(readings)
    # ---- 白—沙：手元の BS 1.1 一覧で中古音との對を確定する（一覧に無い形は公開しない） ----
    keyed = collections.defaultdict(list)
    for MC, k, dsp in BSL.get(ch, []):
        keyed[k].append((MC, dsp))
    for f in r['bs']:
        k = bskey(f)
        if not BSL:
            break
        if k not in keyed:
            # 一覧が異體字形（説/說，兑/兌 など）で載せている場合：同じ上古形・同じ中古音の項目を探す
            alt = [(MC, d) for m in readings if m['bx'] for MC in [m['bx']] for (_c, d) in BS_BY_KEY.get((k, MC), [])]
            if alt:
                keyed[k] = list(dict.fromkeys(alt))
                report['bs:via-variant'] += 1
            else:
                report['bs:not-in-list'] += 1
                dropped.append((ch, 'bs', f))
                continue
        for MC, dsp in keyed[k]:
            j = next((i for i, m in enumerate(readings) if m['bx'] == MC), None)
            if j is None:
                no, how = mc_to_xy(ch, MC)
                if no is None:
                    report['bs:list-mc-unmatched'] += 1
                    continue
                readings.append({'bx': MC, 'xy': no, 'how': 'bs-list' if how == 'exact' else how, 'bs': [], 'zs': []})
                j = len(readings) - 1
            if any(it['f'] == dsp for it in readings[j]['bs']):
                continue
            p = parse_oc(dsp, 'bs')
            item = {'f': dsp, 'bu': bu(p), 'rk': rhyme_key(p, 'bs') if p and p['coda'] in CODA_CLASS else None, 'q': 'ok'}
            if p:
                item.update({'A': p['A'], 'r': p['r'], 't': p['tone'], 'ini': p['ini']})
            readings[j]['bs'].append(item)
            readings[j]['v'] = True
            report['bs:verified'] += 1
    # ---- 鄭張：照合できる資料が無いので，對應が一つに決まるものだけ公開する ----
    forms = r['zs']
    wk = [j for j in range(nW) if readings[j]['xy']]
    for i, f in enumerate(forms):
        p = parse_oc(f, 'zs')
        if p is None:
            report['zs:parse-fail'] += 1
            continue
        sc = sorted(((score(p, XY[readings[j]['xy']]), j) for j in wk), reverse=True)
        j = None
        if len(forms) == nW and len(wk) == nW and nW > 0:
            own = score(p, XY[readings[i]['xy']])
            if own >= 5 and own == sc[0][0] and sum(1 for x, _ in sc if x == own) == 1:
                j = i
        elif sc and sc[0][0] >= 5 and (len(sc) == 1 or sc[0][0] - sc[1][0] >= 2):
            j = sc[0][1]
        if j is None:
            report['zs:dropped'] += 1
            dropped.append((ch, 'zs', f))
            continue
        item = {'f': strip_form(f), 'bu': bu(p), 'rk': rhyme_key(p, 'zs') if p['coda'] in CODA_CLASS else None, 'q': 'ok',
                'A': p['A'], 'r': p['r'], 't': p['tone'], 'ini': p['ini']}
        readings[j]['zs'].append(item)
        report['zs:ok'] += 1
    # 公開する讀音：廣韻と完全一致したもの，または BS 一覧で確かめられたもの
    keep = [m for m in readings if m['xy'] and (m['how'] in ('exact', 'bs-list') or m.get('v'))]
    report['mc:dropped'] += len([m for m in readings if m not in keep])
    out[ch] = {'py': r['py'][:4], 'gloss': r['gloss'], 'r': keep, 'nmc': nW}

json.dump(out, open('data/build/chars.json', 'w', encoding='utf8'), ensure_ascii=False)
json.dump({'counts': report, 'dropped_sample': dropped[:400], 'dropped_total': len(dropped)},
          open('data/build/align_report.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(len(out), dict(report))
