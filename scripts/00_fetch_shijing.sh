#!/usr/bin/env bash
# digling/ard-data（GPL-3.0）から王力 1980・Baxter 1992 の詩經押韻データを取得する。
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p data/raw/digling
R=https://raw.githubusercontent.com/digling/ard-data/master
for f in datasets/Wang1980/rhymes.tsv datasets/Baxter1992/rhymes.tsv datasets/Wang1980/README.md datasets/Baxter1992/README.md LICENSE; do
  curl -sfL "$R/$f" -o "data/raw/digling/ard-data__$(echo "$f" | tr / _)"
done
ls -la data/raw/digling
