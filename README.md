# Syeng · 上古—中古漢語音韻學習

以《廣韻》音韻地位爲中心，對照**白一平—沙加爾（2014）**與**鄭張尚芳**的上古擬音，學習上古韻部與中古韻的對應、音變規律、音韻學術語的拼音。

網站：<https://anti-tail.github.io/syeng/>（GitHub Pages，`docs/`）

## 內容

| 頁面 | 內容 |
|---|---|
| 查字 | 字 → 小韻、反切、音韻地位、Baxter／切韻拼音、白—沙、鄭張、韻部、廣韻釋義 |
| 二百六韻 | 四聲相承表、韻目拼音、攝、等、開合、小韻數 |
| 音節表 | 每個韻系的韻圖式小韻表（聲母 × 聲調 × 韻圖等） |
| 聲母 | 三十八母、拼音、清濁、三十六字母、上古來源分布 |
| 韻部對應 | 王力三十部 → 六元音韻類 × 音節類型 → 中古韻系的流向圖與例字 |
| 音變統計 | 韻尾·後綴 → 聲調、音節類型 → 等 的交叉表 |
| 術語 | 133 條音韻學術語的拼音與說明 |
| 測驗 | 8 種選擇題；答錯自動加入書籤 |
| 書籤 | 收藏、以書籤出題、匯出 Anki TSV |
| 說明 | 書籤小工具（bookmarklet）、Anki 牌組下載、資料說明 |

Anki 牌組（`docs/anki/`）：韻目 206、聲母 38、術語 133、字·上古中古 3,913、小韻·音韻地位 3,878。

## 資料與推得部分

- 《廣韻》：nk2028 [tshet-uinh](https://github.com/nk2028/tshet-uinh-js) 0.15.4（MIT）
- 上古擬音、Baxter 中古音：Wiktionary，經 [kaikki.org](https://kaikki.org/) 抽取（CC BY-SA 4.0）
- **本專案推得**：多音字的上古—中古讀音配對（按聲調、音節類型、韻尾類型、聲母清濁評分）；擬音的王力三十部歸屬；韻目讀音。網站上以「對應未定」「未對應」標出不確定處。

原書（Baxter & Sagart 2014、鄭張尚芳《上古音系》等）的內容與 PDF 不收錄（`.gitignore` 排除 `*.pdf`）。

## 重建

```sh
npm install                      # tshet-uinh
pip install -r requirements.txt  # genanki
npm run fetch   # 可選：重新下載 Wiktionary 抽取資料（約 1.2 GB，串流處理）
npm run build   # data/build → docs/data, docs/anki
npm run serve   # http://localhost:8000
```

## 授權

程式碼 MIT；資料 CC BY-SA 4.0。詳見 [LICENSE](LICENSE)。

---

日本語：上古漢語〜中古漢語の学習ツールです。表示は中文（繁體）です。データの出典と、本プロジェクトで推定した部分（多音字の上古・中古対応、韻部の帰属）は上記のとおりです。
