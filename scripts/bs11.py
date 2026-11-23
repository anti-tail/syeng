"""手元の BS 1.1 一覧（_private/bs11.txt，非公開）を照合用に讀む。"""
import re, unicodedata, collections
PAT = re.compile(r'^\s*(\d+)\s+(\d+)\s+(\S+)\s+(?:(\S+)\s+)?(\S+)\s+\(([^)]*)\)\s+(\*.*?)\s{2,}(.*?)\s{2,}(\S+)\s+(\S+)\s+U\+([0-9A-F]+)\s*$')


def norm_oc(f):
    f = unicodedata.normalize('NFC', f or '')
    f = f.replace('əә', 'ə').replace('ә', 'ə').replace('ˁ', 'ˤ').replace('g', 'ɡ').replace('̊', '̥')
    f = f.strip().strip('/').lstrip('*')
    f = re.sub(r'\s+', '', f)
    # 注記の括弧（(Edialect…) (<*…) (~…) など）は以降を削る。(r) (ʔ) のような短い要素は殘す
    f = re.sub(r'\((?![a-zʔˤʰʷəɡŋ̥\[\]]{1,4}\)).*$', '', f)
    f = f.replace('<', '').replace('>', '').replace('-', '.')
    return f


def load(path='_private/bs11.txt'):
    out = collections.defaultdict(list)  # 字 -> [(MC, OC_norm, gloss)]
    for l in open(path, encoding='utf8'):
        if 'U+' not in l:
            continue
        m = PAT.match(l)
        if not m:
            continue
        ch = chr(int(m.group(11), 16))
        out[ch].append((m.group(5), norm_oc(m.group(7)), m.group(8).strip()))
    return out


def disp(f):
    """公開用の表記：注記を除き，挿入辭 <r> は殘す"""
    f = unicodedata.normalize('NFC', f or '')
    f = f.replace('əә', 'ə').replace('ә', 'ə').replace('ˁ', 'ˤ').replace('g', 'ɡ').replace('̊', '̥')
    f = re.sub(r'\s+', '', f.strip().strip('/').lstrip('*'))
    return re.sub(r'\((?![a-zʔˤʰʷəɡŋ̥\[\]]{1,4}\)).*$', '', f)


def key(f):
    """照合用：Wiktionary 抽出では <r> が落ちているので，挿入辭 r を除いて比べる"""
    return norm_oc(re.sub(r'<r>', '', f or ''))


def load2(path='_private/bs11.txt'):
    out = collections.defaultdict(list)  # 字 -> [(MC, key, disp)]
    for l in open(path, encoding='utf8'):
        if 'U+' not in l:
            continue
        m = PAT.match(l)
        if m:
            out[chr(int(m.group(11), 16))].append((m.group(5), key(m.group(7)), disp(m.group(7))))
    return out
