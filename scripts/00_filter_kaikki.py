"""標準入力の kaikki.org JSONL から、上古音・中古音を持つ單字條目を抽出する。"""
import json, sys
for line in sys.stdin:
    try:
        d = json.loads(line)
    except ValueError:
        continue
    w = d.get('word', '')
    if len(w) != 1:
        continue
    s = d.get('sounds', [])
    if not any({'Middle-Chinese', 'Old-Chinese'} & set(x.get('tags', [])) for x in s):
        continue
    keep = [x for x in s if {'Middle-Chinese', 'Old-Chinese'} & set(x.get('tags', []))
            or ('Pinyin' in x.get('tags', []) and 'Standard-Chinese' in x.get('tags', []))]
    print(json.dumps({'w': w, 'pos': d.get('pos'), 'ety': d.get('etymology_number'), 's': keep,
                      'g': [g for se in d.get('senses', [])[:3] for g in se.get('glosses', [])[:1]]}, ensure_ascii=False))
