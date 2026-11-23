"""Starostin 1989 の上古音再建（digling/vowel-purity-paper, GPL-3.0）を，
中古の讀音と一對一に決まるものだけ字に付ける。出力: docs/data/starostin.json（GPL-3.0）"""
import csv, json, re, html, collections

R = list(csv.DictReader(open('data/raw/digling/vowel-purity-paper__reconstructions.tsv', encoding='utf8'), delimiter='\t'))
chars = json.load(open('docs/data/chars.json', encoding='utf8'))
xy = json.load(open('docs/data/xiaoyun.json', encoding='utf8'))
F = xy['fields']
XY = {r[0]: dict(zip(F, r)) for r in xy['rows']}
TONE = {'平': 0, '上': 1, '去': 2, '入': 3}


def forms(cell):
    s = html.unescape(cell.split(' / ', 1)[-1])
    s = re.sub(r'\(.*?\)', '', s)  # (~ -im) (< *-ps) などの注記
    return [f for f in s.split() if f not in ('?', '~')]


def tone(f):
    if f.endswith('s'):
        return 2
    if f.endswith('ʔ'):
        return 1
    if re.search(r'[ptk]$', f):
        return 3
    return 0


out, stat = {}, collections.Counter()
for r in R:
    ch = r['HANZI']
    fs = forms(r['Starostin1989'])
    v = chars.get(ch)
    if not fs or not v:
        stat['no-data'] += 1
        continue
    rd = [x for x in v['r'] if x.get('x')]
    pairs = []
    if len(rd) == 1 and len(fs) == 1:
        pairs = [(rd[0]['x'], fs[0])]
    else:
        # 聲調で一對一に決まる場合だけ
        by_t = collections.defaultdict(list)
        for x in rd:
            by_t[TONE[XY[x['x']]['聲']]].append(x['x'])
        ft = collections.Counter(tone(f) for f in fs)
        if all(ft[tone(f)] == 1 and len(by_t[tone(f)]) == 1 for f in fs):
            pairs = [(by_t[tone(f)][0], f) for f in fs]
    if not pairs:
        stat['ambiguous'] += 1
        continue
    # 聲調が食い違う一對一（單讀・單形）は除く
    if len(pairs) == 1 and tone(pairs[0][1]) != TONE[XY[pairs[0][0]]['聲']]:
        stat['tone-mismatch'] += 1
        continue
    out[ch] = pairs
    stat['ok'] += 1
json.dump(out, open('docs/data/starostin.json', 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
print(dict(stat), sum(len(v) for v in out.values()))
