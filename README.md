# **QUARTER アンケート要件定義書（実装反映版 2025‑05‑07）**

> 本ドキュメントは **実装済みコード** と **運用フロー** を 1 つに集約した“仕様書兼 README”です。リポジトリを初めてクローンした開発者も、この README だけで **セットアップ → 開発 → デプロイ → 運用** まで到達できるよう、**詳細情報を一切省略せず** 記載しています。

---

## **1. プロジェクト概要**

| 項目              | 内容                                                 |
| :-------------- | :------------------------------------------------- |
| プロジェクト名         | **QUARTER アンケート Web アプリ構築**                        |
| 目的              | *施術後 2 分* で来店客からフィードバックを取得し、サービス改善 & Google 口コミを増強 |
| KPI             | ★ 回答率 70 % 以上 / ★4+ 口コミ月間 30 件 / 平均星評価 4.7 以上      |
| UI キーワード        | **白基調・上質・ミニマル・ゴールドアクセント**                          |
| ターゲット OS / ブラウザ | iOS 15+ / Android 11+ / Chrome・Safari 最新           |
| デプロイ先           | **GitHub Pages** (`main` ブランチ)                     |
| バックエンド          | **Google Apps Script** + Google スプレッドシート           |

---

## **2. サロンブランド & コンセプト**

*運営* : **Studio25 グループ**（1948 年創業／文京区を中心に 5 店舗）

|  #  | 店舗              
| :-: | :-------------- |
|  1  | QUARTER         |
|  2  | QUARTER RESORT  | 
|  3  | QUARTER SEASONS | 
|  4  | LINK            |
|  5  | iL              | 

**経営理念** : *「技術を磨き続けることで地域のお客様の美に貢献し、豊かで誇りある人生を歩む」*

---

## **3. UI / UX デザイン仕様（実装済み）**

### 3.1 カラー & タイポグラフィ

| 変数                   | 色         | 用途              |
| :------------------- | :-------- | :-------------- |
| `--primary-color`    | `#C39000` | アクセント (ゴールド)    |
| `--secondary-color`  | `#9F8C55` | セカンダリ (マットゴールド) |
| `--background-color` | `#F9F6F0` | ページ全体背景         |
| `--text-color`       | `#333333` | 本文カラー           |
| `--border-color`     | `#E6D8B3` | ライン・枠線          |

* 見出し : **Playfair Display** / 本文 : **Noto Sans JP** (Google Fonts)
* `styles.css` に CSS 変数で集中管理

### 3.2 ナビゲーション

* `progress-nav` (5 タブ) を **`position:sticky`** で上部固定
* `navigation.js` — タブクリック→スムーズスクロール
* `scroll-monitor.js` — スクロール位置を監視しアクティブタブを自動切替

### 3.3 フォーム要素デザイン

* **質問カード** : 白背景 + 左ボーダー。未回答=グレー，回答済=マットゴールド，現在=リッチゴールド
* **星評価** : `star-rating.js` でパルスアニメ & ★1‑2 で警告表示
* **サービス選択 (Q14)** : `accordion-style.css` によるカテゴリー別アコーディオン
* **メニュー整形** : `menu-formatter.js` が「タイトル｜説明」を自動分離し、スマホでの“つながり表示”を解消

### 3.4 多言語対応

| 言語       | コード  | 初期化              | 資源ファイル                        |
| :------- | :--- | :--------------- | :---------------------------- |
| 日本語      | `ja` | ブラウザ or fallback | `locales/ja/translation.json` |
| 英語       | `en` | `?lng=en` でも切替可  | `locales/en/translation.json` |
| 中国語 (簡体) | `zh` | `?lng=zh`        | `locales/zh/translation.json` |

* `i18n.js` で `i18next` + `BrowserLanguageDetector` を初期化
* 右上 `lang-link` クリックで `changeLang()` 実行 → 翻訳 + `localStorage` 保存

### 3.5 レスポンシブ & レイアウト

* モバイル幅 360 px を基準に `responsive.css` で段階式メディアクエリ
* `layout-fix.css` & `menu-styles.css` で PC/スマホの文字詰まりを解消

---

## **4. アンケート項目（実装済みフォーム）**

### 4.1 必須

|  #  | 質問              | type                | options       |
| :-: | :-------------- | :------------------ | :------------ |
|  Q1 | **ご来店店舗**       | radio               | 5 店舗 (表 2 参照) |
|  Q2 | **総合評価 (★1‑5)** | star + hidden radio | ★5〜★1         |

### 4.2 任意

|  #  | 質問                            | type     | 主な options                                              |
| :-: | :---------------------------- | :------- | :------------------------------------------------------ |
|  Q3 | お名前 (ニックネーム可)                 | text     | placeholder 指定                                          |
|  Q4 | 新規 or 常連                      | radio    | 初めて / 2 回目以降                                            |
|  Q5 | 性別                            | radio    | 男性 / 女性 / その他                                           |
|  Q6 | 年齢                            | radio    | 10 代 / 20 代 … 60 代+                                     |
|  Q7 | ご利用サービス (複数選択)                | checkbox | カット / カラー / …                                           |
|  Q8 | 技術・仕上がり満足度                    | radio    | 5 段階                                                    |
|  Q9 | スタッフ対応                        | radio    | 5 段階                                                    |
| Q10 | 待ち時間                          | radio    | 5 段階                                                    |
| Q11 | 店内清潔感                         | radio    | 5 段階                                                    |
| Q12 | 追加してほしいサービス・改善点               | textarea |                                                         |
| Q13 | その他ご感想                        | textarea |                                                         |
| Q14 | **追加サービス希望 (複数選択 + アコーディオン)** | checkbox | *Hair Care / Trend Technique / Beauty / Men / …* 30+ 項目 |

※ 各ラベルキーは `translation.json` で i18n 化済み

---

## **5. バリデーション & 入力支援**

* `validation.js` で **フロントエンド必須チェック**
* 未入力時
   ↳ 左ボーダーをアクセントカラー → 質問下に `validation-message` 表示
   ↳ 最初の未入力へスムーズスクロール
* 入力完了で `question.completed` クラス付与 → 色変更＋チェックマーク

---

## **6. 送信後フロー**

|  評価  | 画面                 | メインメッセージ                      |
| :--: | :----------------- | :---------------------------- |
| ★1‑3 | `#thankyou`        | 「貴重なご意見を参考に〜」                 |
| ★4‑5 | `#review-redirect` | 口コミ促進 + コメントコピー + 店舗別 URL ボタン |

コピー文は自由記述 (Q12/Q13) を自動結合し Language 切替後も保持。

---

## **7. Google マップ 口コミ URL (`CONFIG.STORE_REVIEW_URLS`)**

| 店舗              | URL                                                                                 |
| :-------------- | :---------------------------------------------------------------------------------- |
| QUARTER         | [https://g.page/r/CfiWzYV0WLCdEBE/review](https://g.page/r/CfiWzYV0WLCdEBE/review)  |
| QUARTER RESORT  | [https://g.page/r/CUpu9\_cAhdaGEBE/review](https://g.page/r/CUpu9_cAhdaGEBE/review) |
| QUARTER SEASONS | [https://g.page/r/CWAu\_dLl0DJmEBE/review](https://g.page/r/CWAu_dLl0DJmEBE/review) |
| LINK            | [https://g.page/r/CYLblbqgWXsREBE/review](https://g.page/r/CYLblbqgWXsREBE/review)  |
| iL              | [https://g.page/r/CemPjkInZSpLEBE/review](https://g.page/r/CemPjkInZSpLEBE/review)  |

---

## **8. 技術実装詳細**

### 8.1 フロントエンド構成

* HTML + CSS + **Vanilla JS**
* i18next 21.x (CDN) / BrowserLanguageDetector 8.x
* CSS Variables + `:root` で一元管理

### 8.2 バックエンド

* Google Apps Script (`doPost`) に JSON 送信
* Google スプレッドシートに追記

### 8.3 主な JS モジュール

| ファイル                  | 役割                             | 備考              |
| :-------------------- | :----------------------------- | :-------------- |
| `config.js`           | GAS URL & 店舗 URL 管理            | `window.CONFIG` |
| `i18n.js`             | 多言語初期化 & DOM 反映                | defer 読込必須      |
| `navigation.js`       | progress‑nav click / スムーズスクロール |                 |
| `scroll-monitor.js`   | ビューポート可視率判定でタブ切替               |                 |
| `star-rating.js`      | 星 UI & バリデーション更新               |                 |
| `dynamic-services.js` | 店舗 `iL` 選択時に専用サービス表示           |                 |
| `menu-formatter.js`   | ラベル分割 (タイトル/説明) 自動整形           |                 |
| `validation.js`       | 必須チェック & エラーハンドリング & 入力サニタイズ   |                 |
| `main.js`             | 初期化 & GAS submit & 依存チェック      |                 |
| `security-logger.js`  | セキュリティイベントログ & 脅威検出            | 2025年1月追加     |
| `utils.js`            | 開発/本番環境判定 & エラーハンドリング          | 2025年1月追加     |

### 8.4 フォルダツリー

```text
├── index.html
├── README.md
├── css/
│   ├── styles.css
│   ├── responsive.css
│   ├── layout-fix.css
│   ├── menu-styles.css
│   └── accordion-style.css
├── js/
│   ├── config.js
│   ├── i18n.js
│   ├── navigation.js
│   ├── scroll-monitor.js
│   ├── menu-formatter.js
│   ├── dynamic-services.js
│   ├── star-rating.js
│   ├── validation.js
│   └── main.js
├── locales/
│   ├── ja/translation.json
│   ├── en/translation.json
│   └── zh/translation.json
└── images/
    └── quarter-logo.png
```

### 8.5 国際化拡張手順

1. `locales/<lang>/translation.json` を追加
2. `i18n.js` 内 `lngs` 配列へ言語コードを追加
3. `index.html` Language Selector にリンクを追加

### 8.6 開発モード (`config-dev.js` + `mock-api.js`)

* GAS へ通信せず **console.log** でレスポンスを模倣
* `.gitignore` に登録し本番へ push しない

---

## **9. 運用ルール & フロー**

1. 施術終了後 **QRコード or タブレット** でアンケート案内
2. ★4+ の場合、その場で口コミ投稿まで同席 (または LINE で URL 送付)
3. 月次ミーティングでスプレッドシートを確認
      ↳ ★3 以下コメントは即改善策を立案 / アサイン

---

## **10. 開発環境セットアップ & ガイドライン**

### 10.1 ブランチ戦略

* `main` : 本番 / GitHub Pages デプロイ
* `dev` : 結合テスト用
* `feature/<topic>` : 機能追加

### 10.2 ローカル起動

```bash
# 初回のみ
npm install -g http-server

# ルートで実行
http-server -p 8000
# ↳ http://localhost:8000
```

*VS Code* 利用者は **Live Server** 拡張でも可。

### 10.3 開発用モック API

1. `js/config-dev.js` — `IS_DEV: true` を設定
2. `js/mock-api.js` — `submitFormData()` をオーバーロード
3. `index.html` で **開発用スクリプト** を本番より前に読み込む

### 10.4 デプロイ手順

```bash
# 開発ブランチでコミット完了後
npm run lint   # (必要なら)
git checkout main
git merge dev
# 検証 OK → push
```

GitHub Pages が自動ビルド。完了通知 → 本番確認。

---

## **11. FAQ / トラブルシューティング**

| 症状                       | 原因                      | 対処                                                         |
| :----------------------- | :---------------------- | :--------------------------------------------------------- |
| `i18next is not defined` | CDN 読込順序誤り              | `<script defer src="js/i18n.js">` は **i18next CDN の後** に配置 |
| スマホ表示でメニューが繋がる           | `menu-formatter.js` 未適用 | `DOMContentLoaded` 二重登録を確認                                 |
| 本番 CSS 崩れ                | キャッシュ / ビルド競合           | DevTools → Hard Reload / `layout-fix.css` のセレクタ競合を解消       |
| 回答送信で CORS               | GAS デプロイ URL 差替忘れ       | `config.js` の `APPS_SCRIPT_WEBAPP_URL` を最新へ                |

---

## **12. セキュリティ対策 (2025年1月実装)**

### 12.1 実装済みセキュリティ機能

| 対策項目 | 実装内容 | 関連ファイル |
| :------ | :------ | :---------- |
| **XSS防止** | innerHTML → textContent 変換、入力サニタイズ | `validation.js`, `i18n.js` |
| **CSP設定** | Content Security Policy メタタグ | `index.html` |
| **脅威検出** | XSS/SQLインジェクションパターン自動検出 | `security-logger.js` |
| **レート制限** | フォーム送信を1分間3回まで制限 | `security-logger.js` |
| **環境別処理** | 開発環境でのみ詳細エラー表示 | `utils.js` |

### 12.2 セキュリティ関連ドキュメント

| ドキュメント | 内容 |
| :---------- | :--- |
| `SECURITY_FIXES.md` | セキュリティ実装ガイドと現在の状況 |
| `PROXY_IMPLEMENTATION.md` | Vercel Functionsを使用したプロキシ実装ガイド |
| `SECURITY_TEST_GUIDE.md` | セキュリティテストの手順書 |
| `CLAUDE.md` | AI開発アシスタント向けプロジェクトガイド |

### 12.3 今後の推奨事項

1. **プロキシサーバーの実装**
   - Google Apps Script URLを隠蔽
   - PROXY_IMPLEMENTATION.mdの手順に従って実装

2. **HTTPセキュリティヘッダー**
   - GitHub Pages制限のため、プロキシ経由で設定

3. **自動化テスト**
   - SECURITY_TEST_GUIDE.mdに基づくE2Eテスト実装

---

## **13. まとめ**

* **UI/UX・多言語・GAS 連携** 全て実装済み
* **セキュリティ強化** により安全性が大幅に向上 (2025年1月)
* 開発～運用までの **ベストプラクティス** を README に集約
* 本 README を起点に、誰でも即座に開発・改善サイクルへ参加可能

---

© 2025 Studio25 Group / QUARTER アンケート開発チーム
