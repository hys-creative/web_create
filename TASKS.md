# TASKS.md — 実装タスクリスト

## Phase 0: 環境準備（ユーザー作業）

### 0-1. Python 環境確認
- [ ] Python 3.10 以上がインストールされている
- [ ] `python --version` でバージョン確認
- [ ] `pip --version` で pip が使える状態か確認

### 0-2. GitHub CLI（gh）のセットアップ
- [ ] GitHub CLI をインストール（https://cli.github.com/）
- [ ] `gh --version` で確認
- [ ] `gh auth login` で認証（ブラウザ認証推奨）
- [ ] `gh auth status` で認証成功を確認

### 0-3. GitHub リポジトリ作成
- [ ] GitHub上で `web_create` という名前のpublicリポジトリを作成
- [ ] ローカルの `web_create` フォルダで `git init`
- [ ] `git remote add origin https://github.com/{username}/web_create.git`
- [ ] `git branch -M main`
- [ ] 空コミットを作って `git push -u origin main`

### 0-4. GitHub Pages 設定
- [ ] GitHub のリポジトリ → Settings → Pages
- [ ] Source: Deploy from a branch
- [ ] Branch: `main` / root を選択
- [ ] 公開URL（`https://{username}.github.io/web_create/`）が表示されることを確認

---

## Phase 1: scraper プロジェクト実装

### 1-1. 依存ライブラリのインストール
- [ ] `cd C:\Users\user\Desktop\AI\claude\scraper`
- [ ] `pip install -r requirements.txt` で requests と beautifulsoup4 をインストール

### 1-2. scrape.py の実装
- [ ] CLI 引数 `--url`、`--out` を argparse でパース
- [ ] `requests.get(url)` で HTML を取得
- [ ] `BeautifulSoup` で会社名・住所・電話・メール・サービス内容を抽出
  - [ ] 会社名: `<title>` および `<h1>` から推定
  - [ ] 住所: `<address>` または住所パターン正規表現
  - [ ] 電話: `tel:` リンクおよび電話番号正規表現
  - [ ] メール: `mailto:` リンクおよびメールアドレス正規表現
  - [ ] サービス内容: 主要なセクションテキストを抽出
- [ ] 取得できなかった項目は `null` を入れて `missing_fields` リストに追加
- [ ] 結果を `--out` 指定の絶対パスに JSON で保存

### 1-3. scraper の動作確認
- [ ] 実在のWIXサイトURLで `python scrape.py --url <URL> --out output\test.json` を実行
- [ ] 出力JSONが SPEC.md の構造に沿っているか確認
- [ ] 取得率が低すぎる場合は Phase 3（Playwright導入）を前倒し検討

---

## Phase 2: references / templates の初期コンテンツ作成

### 2-1. 介護業界デザインルール作成
- [ ] `references/rules/kaigo.md` を編集
  - [ ] 配色（メイン・アクセント・背景の hex コード）
  - [ ] フォント（見出し・本文）
  - [ ] トーン（伝えるべき情緒）
  - [ ] 必須セクション（ヒーロー / サービス / アクセス・CTA）
  - [ ] 禁止事項

### 2-2. 良デザイン参考URLの収集
- [ ] `references/urls.md` に介護業の優れたWebサイトを5〜10件リストアップ
- [ ] 各URLに業種タグ（`#介護`）と簡単なメモ（「アニメーションが上手」「配色が温かい」等）を付ける

### 2-3. Webサイト構成ガイド作成
- [ ] `templates/website.md` を編集
  - [ ] 標準セクション順
  - [ ] 各セクションの目的と要素
  - [ ] アニメーション仕様（スクロールフェードイン等）

### 2-4. LP構成ガイド作成
- [ ] `templates/lp.md` を編集
  - [ ] 標準セクション順（Webサイトより訴求型）
  - [ ] CTAの配置ルール
  - [ ] 1スクロール完結の構成案

---

## Phase 3: 1件目のテスト生成

### 3-1. ターゲット選定
- [ ] 実在の介護施設のWIXサイトURLを1件選ぶ
- [ ] そのURLをClaude Codeに渡す

### 3-2. End-to-End フロー実行
- [ ] Claude が `scrape.py` を実行 → JSON生成を確認
- [ ] スクレイピング結果に欠損があればユーザーが手動補完
- [ ] Claude が HTML 生成 → `clients/[slug]/` に保存
- [ ] ローカルでブラウザで開いて表示確認
  - [ ] レイアウトに崩れがないか
  - [ ] フッターに「Sample redesign — not an official site」が表示されているか
  - [ ] 画像プレースホルダの位置が適切か
  - [ ] アニメーションが動作するか

### 3-3. 画像の手動追加
- [ ] HTMLの `data-prompt` を ChatGPT/Gemini に渡して画像生成
- [ ] 生成画像を `clients/[slug]/images/` に配置
- [ ] ブラウザで再表示して画像が反映されるか確認

---

## Phase 4: 自動 push フローの確立

### 4-1. git の初回コミット
- [ ] `.gitignore` の動作確認（`scraper/output/` 等が除外されている）
- [ ] `git status` で意図しないファイルがステージされていないか確認
- [ ] `git add clients/`
- [ ] `git commit -m "Add: [slug] sample redesign"`
- [ ] `git push`

### 4-2. GitHub Pages 公開確認
- [ ] `https://{username}.github.io/web_create/clients/[slug]/` をブラウザで開く
- [ ] 公開後すぐは404の場合があるので1〜2分待機

### 4-3. 自動pushフローの定着
- [ ] Claude Code に「OKです」と返したら自動で git add → commit → push まで実行する手順を確立
- [ ] CLAUDE.md の「Step 7: git push」が問題なく動くか確認

---

## Phase 5: 日次運用開始

### 5-1. 初回1週間の検証
- [ ] 1日1件ペースで5件作成
- [ ] スクレイピング成功率を記録
- [ ] HTML品質を毎回確認
- [ ] AIっぽい表現が含まれていないかチェック

### 5-2. ペース引き上げ
- [ ] 問題なければ1日3件、5件と段階的に増やす
- [ ] 問題があれば Phase 2 のルールやテンプレートを修正

### 5-3. メール営業との連携
- [ ] 公開URLをメールに貼り付けるテンプレートを別途用意（このプロジェクトの範囲外）
- [ ] レスポンス率を記録（このプロジェクトの範囲外）

---

## 将来：Phase 6 以降（Phase 2・3 の拡張機能）

- [ ] AI表現リント機能の追加
- [ ] tokens.json でデザイントークン管理
- [ ] レイアウトパターンのストック化
- [ ] 画像生成API（Gemini API / DALL-E 3）連携
- [ ] WIX以外（STUDIO・WordPress等）への対応
- [ ] Playwright導入（requestsで取れないサイトが増えた場合）
- [ ] `recruit_create` プロジェクト立ち上げ（採用サイト・採用LP）
