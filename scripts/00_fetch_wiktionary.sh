#!/usr/bin/env bash
# kaikki.org の Wiktionary 漢語抽出（約 1.2 GB）をストリームで讀み、
# 上古音・中古音を持つ單字條目だけを data/raw/wiktionary_zh_oc_mc.jsonl に書き出す。
# ディスクに全體を保存しない。
set -euo pipefail
cd "$(dirname "$0")/.."
URL=https://kaikki.org/dictionary/Chinese/kaikki.org-dictionary-Chinese.jsonl
mkdir -p data/raw
curl -sL "$URL" | python3 scripts/00_filter_kaikki.py > data/raw/wiktionary_zh_oc_mc.jsonl
wc -l data/raw/wiktionary_zh_oc_mc.jsonl
