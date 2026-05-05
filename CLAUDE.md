# CLAUDE.md — プロジェクト指示書

## 作業ルール

- **作業フォルダ**: `web_create/` および `../scraper/` の中だけで作業する
- **新しいファイルを作成する場合**: 必ずユーザーに許可を取ってから作成する
- **プロジェクト外への書き込み禁止**: `~/.claude/` などシステムフォルダへの書き込みは行わない
- **`clients/[slug]/` 以下は自動生成領域**: ユーザーが直接編集していなければ Claude が上書き可

---

## プロジェクト概要

古いWIXサイトを持つ中小企業（最初のターゲットは介護業）に対し、生成AIで作ったリニューアル案サイトを「URL付きメール」で営業送信するためのシステム。

Claude Code が WIX URL の投入を受け取って、スクレイピング・HTML生成・GitHub Pages公開までを完全自動で実行する。1日5件ペースの営業展開を可能にする。

---

## 目的・戦略（ヒアリング確定済み）

| 項目 | 確定内容 |
|------|---------|
| **用途** | 営業デモ。本番運用ではない |
| **ターゲット読者** | 古いWIXサイトを持つ中小企業のオーナー |
| **最初の業種** | 介護業（将来的に飲食・整骨院・小売などへ拡張） |
| **送付方法** | コールドメールに公開URLを貼り付け |
| **ペース** | 1日5件（完全自動化前提） |
| **修正方針** | 基本ノータッチ。レイアウトに重大な不具合があるときだけ手を入れる |
| **画像** | Gemini / ChatGPT で手動生成 → `images/` に配置（将来は自動化） |
| **テキスト** | スクレイピング情報は **必ずAIがリライト**。コピペ厳禁 |
| **フッター表記** | 全ページに `Sample redesign — not an official site` を必ず追加 |
| **デザイン要件** | アニメーション・配色フォント余白・業種別構成すべて重要（AIっぽくない見た目） |
| **ホスティング** | GitHub Pages。URL形式は `username.github.io/web_create/[company-slug]/` |
| **採用サイト・採用LP** | `recruit_create` として将来別プロジェクト化（このプロジェクトでは扱わない） |

---

## アーキテクチャ

```
ユーザー
  │ WIX URL を投入
  ▼
Claude Code（このプロジェクト）
  │
  ├─▶ ../scraper/scrape.py を CLI 実行
  │    └─▶ scraper/output/[slug].json
  │
  ├─▶ JSON + references/rules/[業種].md + templates/website.md or lp.md を読み込み
  │
  ├─▶ HTML生成
  │    clients/[company-slug]/
  │      ├ index.html
  │      ├ css/style.css, animate.css
  │      ├ js/main.js
  │      └ images/  （プロンプト埋め込み用プレースホルダ）
  │
  └─▶ git add → commit → push（gh CLI）
       │
       ▼
GitHub Pages 公開
  username.github.io/web_create/[company-slug]/
       │
       ▼
ユーザーが画像を後から images/ に追加
       │
       ▼
コールドメールに URL を貼り付けて送信
```

---

## Claude Code への実行手順テンプレート

ユーザーが「このWIX URLでサイトを作って： https://example.wixsite.com/xxx 業種：介護」と言った場合、以下を順に実行する：

```
Step 1: 会社名スラッグの決定
  - スクレイピング前に company-slug を決定（半角英小文字・ハイフン・最大30字）
  - 重複時は -2, -3 のサフィックスを付加

Step 2: スクレイピング
  python C:\Users\user\Desktop\AI\claude\scraper\scrape.py \
    --url <WIX_URL> \
    --out C:\Users\user\Desktop\AI\claude\scraper\output\<slug>.json

Step 3: スクレイピング結果の確認
  - 会社名・住所・電話・メール・サービス内容のうち取れていない項目をユーザーに提示
  - 「null」が多い場合はユーザーに手動補完を依頼

Step 4: 業種ルール・テンプレート読込
  - references/rules/<業種>.md を Read
  - templates/website.md または templates/lp.md を Read
  - references/urls.md から該当業種の参考URLを確認（必要に応じて WebFetch）

Step 5: HTML生成
  - clients/<slug>/ 配下に index.html・css/・js/・images/ を作成
  - テキストは元WIXの内容を読み取って自然な日本語にリライト（コピペ禁止）
  - 画像は <img src="images/hero.jpg" data-prompt="..."> のプロンプト埋め込み形式
  - フッター表記 `Sample redesign — not an official site` を必ず追加

Step 6: ローカル確認のためユーザーに通知
  - 生成完了したファイルパスを提示
  - ユーザーがブラウザで開いて確認

Step 7: git push
  - ユーザーから「OK」が出たら：
    git add clients/<slug>/
    git commit -m "Add: <slug> sample redesign"
    git push
  - GitHub Pages の URL を提示
```

---

## 制約事項（絶対ルール）

| 制約 | 内容 |
|------|------|
| **テキストのコピペ禁止** | WIXからスクレイピングしたテキストをHTMLに直接転載しない。AIが情報を読み取って必ず別の文章にリライトする |
| **画像のコピペ禁止** | WIXサイト内の画像URLをそのまま使わない。`images/` プレースホルダ + プロンプトで管理 |
| **ストック画像不採用** | Unsplash など外部ストック画像は使わない。AI生成画像を使う前提 |
| **フッター表記必須** | `Sample redesign — not an official site` を全ページに追加 |
| **AI頻出語句の使用禁止** | 「革新的な」「高品質な」「最先端の」「業界をリードする」「比類なき」「シームレス」など定型AI語句を使わない |
| **絵文字の使用禁止** | コーポレート用デモには絵文字を入れない |
| **単一HTMLページ** | 1クライアント1ページ完結。複数ページ構成にはしない（MVPフェーズ） |

---

## 将来拡張メモ

### Phase 2（品質向上）
- AI表現リント：定型AI語句の自動検知と警告
- デザイントークン化：`tokens.json` で hex / font-family / spacing を管理し CSS 変数に展開
- レイアウトパターンのストック（3〜5種）：業種・写真枚数で最適パターンを自動選択
- ローカルプレビューサーバーの起動（push前確認）

### Phase 3（完全自動化）
- 画像生成API（Gemini API / DALL-E 3 API）連携
- WIXのJSレンダリング対応：requestsで取れない場合 Playwright に切替
- ロゴから配色を kmeans 抽出
- 元サイト文体分析→トーン指示の動的生成
