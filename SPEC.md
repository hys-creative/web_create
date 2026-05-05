# SPEC.md — web_create 仕様書

## システム構成図

```
【ユーザー】                  【Claude Code（web_create）】           【外部】
   │                                  │                                  │
   │  「このURLでサイト作って」        │                                  │
   │─────────────────────────────────▶│                                  │
   │                                  │                                  │
   │                                  │  python ../scraper/scrape.py     │
   │                                  │─────────────────────────────────▶│ WIX サーバー
   │                                  │  ◀─ HTML レスポンス ─────────────│
   │                                  │                                  │
   │                                  │  → output/[slug].json 保存         │
   │                                  │                                  │
   │                                  │  references/rules/介護.md  Read │
   │                                  │  templates/website.md or lp.md   │
   │                                  │  references/url/urls.md          Read│
   │                                  │                                  │
   │                                  │  HTML / CSS / SCSS / JS 生成       │
   │                                  │  → clients/[slug]/ 保存            │
   │                                  │                                  │
   │  「OKです」                       │                                  │
   │─────────────────────────────────▶│                                  │
   │                                  │  git add → commit → push          │
   │                                  │─────────────────────────────────▶│ GitHub
   │                                  │                                  │
   │                                  │   GitHub Pages URL を返却         │
   │  ◀──────────────────────────────│                                  │
   │                                  │                                  │
   │  Gemini / ChatGPT で画像生成      │                                  │
   │  → images/ に配置 → push          │                                  │
   │                                  │                                  │
   │  メールに URL 貼って営業送信      │                                  │
```

---

## scraper の入出力仕様

### 入力（CLI 引数）

```
python scrape.py --url <WIX_URL> --out <絶対パス>.json
```

| 引数 | 必須 | 説明 |
|------|------|------|
| `--url` | ✓ | スクレイピング対象のWIXサイトURL |
| `--out` | ✓ | 出力先JSONの絶対パス |

### 出力（JSON）

```json
{
  "source_url": "https://example.wixsite.com/xxx",
  "scraped_at": "2026-05-05T12:00:00+09:00",
  "company": {
    "name": "サンシャインケア株式会社",
    "name_kana": "サンシャインケアカブシキガイシャ",
    "tagline": "あなたの暮らしに寄り添う介護",
    "address": "東京都新宿区西新宿1-1-1",
    "phone": "03-1234-5678",
    "email": "info@sunshine-care.example.jp",
    "business_hours": "平日 9:00〜18:00"
  },
  "services": [
    { "name": "訪問介護", "description": "..." },
    { "name": "デイサービス", "description": "..." }
  ],
  "raw_text": "（ページ全体のテキスト。AIが文体把握用に使う）",
  "missing_fields": ["email"]
}
```

`missing_fields` には取得できなかったフィールド名のリストが入る。Claude はこのリストを見てユーザーに手動補完を求める。

---

## HTML ファイル構成

### ディレクトリ構造（クライアント1社あたり）

```
clients/[company-slug]/
├── index.html             ← 単一ページ
├── css/
│   ├── style.css          ← レイアウト・配色・タイポグラフィ
│   └── animate.css        ← スクロールアニメ・ホバー・トランジション
├── js/
│   └── main.js            ← IntersectionObserverでアニメ発火、ハンバーガー等
└── images/                ← 後から手動追加（Gemini/ChatGPT生成）
    ├── hero.jpg
    └── ...
```

### index.html の最小構造

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{会社名} | {キャッチコピー}</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/animate.css">
</head>
<body>
  <header>...</header>
  <main>
    <section id="hero">...</section>
    <section id="services">...</section>
    <section id="access">...</section>
    <section id="cta">...</section>
  </main>
  <footer>
    <p class="disclaimer">Sample redesign — not an official site</p>
  </footer>
  <script src="js/main.js"></script>
</body>
</html>
```

### 画像プレースホルダ仕様

```html
<img src="images/hero.jpg"
     alt="メインビジュアル"
     data-prompt="A warm and welcoming nursing home interior, natural sunlight, soft beige and sage green tones, photography style, no text">
```

- `src` は images/ 配下の相対パス
- `data-prompt` には Gemini/ChatGPT に渡すプロンプトを英語で記述
- 画像未生成時はブラウザで「画像なし」表示になるが、CSSで適切なフォールバックスタイルを当てる

---

## 業種別ルールの読み込み仕様

### ファイル: `references/rules/[業種].md`

| 業種 | ファイル名 |
|------|-----------|
| 介護業 | `kaigo.md` |
| 飲食業 | `restaurant.md` （将来） |
| 整骨院 | `seikotsuin.md` （将来） |

### kaigo.md の章立て（標準）

```markdown
# 介護業界デザインルール

## 配色
- メインカラー: #...
- アクセント: #...
- 背景: #...

## フォント
- 見出し: ...
- 本文: ...

## トーン
- 「安心」「信頼」「家族のように」を伝える
- 機械的・冷たい表現を避ける

## 必須セクション
- ヒーロー（キャッチコピー + 施設写真）
- サービス内容・実績
- アクセス・CTA

## 禁止事項
- 派手な装飾
- 暗色基調
```

Claudeは生成前に必ずこのファイルを Read し、配色・フォント・トーンを反映する。

---

## ファイル命名規則

### company-slug の生成ルール

```
1. 会社名（ローマ字 or 英語）を取得
2. 半角英小文字に変換
3. 単語間はハイフンで連結
4. 最大30字に切り詰め
5. 既存フォルダと重複する場合は -2, -3, ... を末尾に付加
```

例：

| 会社名 | スラッグ |
|--------|---------|
| サンシャインケア株式会社 | `sunshine-care` |
| 株式会社あいうえお介護 | `aiueo-kaigo` |
| ABC Nursing Home | `abc-nursing-home` |

会社名がローマ字化困難な場合は、ヘボン式変換 + 業種suffix（例：`yamada-kaigo`）を使う。

---

## フッター表記の正確な文言

```html
<footer>
  <p class="disclaimer">Sample redesign — not an official site</p>
</footer>
```

- 全角ダッシュではなく半角ハイフン2つでエムダッシュ風に：`Sample redesign — not an official site`
- フッター内に小さく（12px〜14px、淡いグレー）配置
- ページ最下部に固定で表示

---

## GitHub Pages 公開URL構造

```
https://{username}.github.io/web_create/clients/{company-slug}/
```

- リポジトリ名は `web_create`
- GitHub Pages の Source は `main` ブランチのルート
- `clients/[slug]/index.html` がそのままURLの末尾になる

メールに貼り付けるURLは末尾スラッシュ付きが安全：

```
https://yourname.github.io/web_create/clients/sunshine-care/
```

---

## エラー対処一覧

| エラー / 状況 | 原因 | 対処 |
|-------------|------|------|
| `scrape.py` がタイムアウト | WIXがJSレンダリングのみ提供 | 当面は手動でWIXサイトを開いて情報をユーザーが提示。多発するなら Phase 3 で Playwright 導入 |
| `missing_fields` が3件以上 | スクレイピング不発 | ユーザーに手動補完を依頼（チャット内で対話的に取得） |
| `git push` で `permission denied` | gh CLI 未認証 | `gh auth login` を実行（手動） |
| GitHub Pages で 404 | push直後のビルド遅延 | 1〜2分待機。それでもダメなら Settings → Pages を確認 |
| company-slug が既存と重複 | 同名企業に2回目の生成 | 末尾に `-2` を付加して再保存 |
| 画像未追加でレイアウト崩れ | プレースホルダ画像未生成 | CSSで `background-color` フォールバックを設定済み。ユーザーに画像追加を促す |

---

## 既知の制約

- **WIX以外のサイトは未対応**：MVPフェーズではWIXのみ。STUDIOやWordPressは将来対応
- **多言語対応なし**：日本語サイト前提
- **動画なし**：MVPは静止画のみ
- **CMSなし**：1サイト1HTMLで完結。後から内容更新する仕組みはない
