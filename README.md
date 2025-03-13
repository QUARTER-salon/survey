# **QUARTER アンケート要件定義書（実装反映版）**

## **1. プロジェクト概要**

**プロジェクト名**: 「QUARTERアンケートWebアプリ構築」  
**実施目的**:
* 来店客に短時間で回答してもらい、施術やサービスへのフィードバックを集める
* 星4以上（高評価）の場合はGoogleマップの口コミ投稿を促し、オンライン評価を向上させる
* スタッフがシンプルに案内できる運用フローを構築し、回答数を増やす
* QUARTER様の「落ち着いた高級感・白を基調とした世界観」を損なわない、おしゃれなフォームデザインを実現する

## **2. サロンのブランド・コンセプト**

**運営：Studio25グループ（1948年創業）、文京区を中心に5店舗展開**

1. QUARTER  
2. QUARTER RESORT  
3. QUARTER SEASONS  
4. LINK  
5. iL

**経営理念**:
「技術を磨き続けることで、地域のお客様の美に貢献し、豊かで誇りある人生を歩む。」

**コンセプト**:
* 落ち着いた雰囲気の高級志向サロン
* 店内は洗練されたデザインでリラックスできる空間
* 幅広い年齢層（20代～70代）のお客様が来店
* ヘアだけでなくネイルや着付けなどトータルビューティーも提供

## **3. 実装済みUI/UXの特徴**

### **3.1 デザイン・カラースキーム**

* **基本カラー**:
  * プライマリカラー: `#C39000`（リッチゴールド）
  * セカンダリカラー: `#9F8C55`（マットゴールド）
  * アクセントカラー: `#D0A900`（ゴールド）
  * 背景色: `#F9F6F0`（淡いベージュ）
  * テキスト色: `#333333`
  * ボーダー色: `#E6D8B3`（シャンパンベージュ）

* **フォント**:
  * 見出し: 'Playfair Display', serif
  * 本文: 'Noto Sans JP', sans-serif

* **全体的なデザイン**:
  * 白を基調としたミニマルで上品なデザイン
  * 角を四角に統一（border-radius: 0px）
  * 要素間の余白を一貫して調整
  * ゴールドのアクセントで高級感を表現

### **3.2 ナビゲーション**

* 画面上部に固定されたタブ形式のナビゲーション
* 5つのセクションに分類:
  1. 店舗
  2. 評価
  3. 情報
  4. サービス
  5. 感想
* アクティブなセクションはゴールドの下線でハイライト
* スクロールに応じて自動的にアクティブタブが切り替わる
* タブをタップするとそのセクションへスムーズにスクロール

### **3.3 フォーム要素のデザイン**

* **質問カード**:
  * 白背景で影付き
  * 現在の質問は左側にゴールドのボーダー
  * 回答済み質問は左側にマットゴールドのボーダー

* **選択肢のインタラクション**:
  * ホバー/タップ時に背景色変化
  * 選択時に左側ボーダーがゴールドに変化
  * 選択時にチェックマーク（✓）表示

* **星評価**:
  * 大きく見やすい星マークUI
  * 選択した評価に応じた星の色づけ
  * 評価選択時のアニメーション効果
  * 低評価（1-2星）時の確認メッセージ

* **送信ボタン**:
  * ゴールドのグラデーション背景
  * ホバー時の拡大と影の強調
  * クリック時のフィードバック

## **4. アンケート項目と構成**

### **4.1 必須項目**

1. **ご来店店舗** (Q1)
   * QUARTER
   * QUARTER RESORT
   * QUARTER SEASONS
   * LINK
   * iL

2. **総合評価（星1～5）** (Q2)
   * ★★★★★ (5)
   * ★★★★☆ (4)
   * ★★★☆☆ (3)
   * ★★☆☆☆ (2)
   * ★☆☆☆☆ (1)

### **4.2 任意項目**

3. **お名前（ニックネーム可）** (Q3)
   * テキスト入力

4. **新規 or 常連** (Q4)
   * 初めて（新規）
   * 2回目以降（常連）

5. **性別** (Q5)
   * 男性
   * 女性
   * その他

6. **年齢** (Q6)
   * 10代
   * 20代
   * 30代
   * 40代
   * 50代
   * 60代以上

7. **ご利用いただいたサービス（複数選択可）** (Q7)
   * カット
   * カラー
   * パーマ
   * トリートメント
   * スタイリング
   * その他（ネイル・着付け 等）

8. **技術や仕上がりに対する満足度** (Q8)
   * 非常に満足
   * 満足
   * 普通
   * 不満
   * 非常に不満

9. **スタッフの対応** (Q9)
   * 非常に良い
   * 良い
   * 普通
   * 悪い
   * 非常に悪い

10. **待ち時間** (Q10)
    * 非常に満足
    * 満足
    * 普通
    * 不満
    * 非常に不満

11. **店内の清潔感** (Q11)
    * 非常に清潔
    * 清潔
    * 普通
    * 不清潔
    * 非常に不清潔

12. **追加してほしいサービスや改善点など** (Q12)
    * テキストエリア入力

13. **その他ご感想** (Q13)
    * テキストエリア入力

## **5. バリデーションと入力支援**

### **5.1 必須項目のバリデーション**

* 店舗選択と星評価が必須
* 送信時に必須項目が未入力の場合:
  * 該当質問の左ボーダーをアクセントカラーに変更
  * 質問の下に専用のエラーメッセージを表示
  * 最初のエラー項目へ自動スクロール
  * 該当項目を一時的にハイライト表示

### **5.2 質問への回答時のフィードバック**

* 選択肢選択時またはテキスト入力時に質問カードに「回答済み」マークを表示
* 星評価選択時に数値表示とアニメーションでフィードバック
* エラー状態は回答入力で自動解除

## **6. 送信後のフロー**

### **6.1 低評価（星3以下）の場合**

* シンプルなお礼メッセージを表示:
  > ご回答ありがとうございました。
  > 貴重なご意見を参考に、より良いサービスを目指します。

### **6.2 高評価（星4以上）の場合**

* 口コミ促進画面を表示
* 星評価に応じたメッセージ表示:
  * 星5: 「星5ありがとうございます！」
  * 星4: 「星4ありがとうございます！」
* 自由記述欄（Q12・Q13）の内容を口コミ用にコピーできる機能
* ワンクリックでGoogleマップ口コミページへ誘導

### **6.3 口コミ促進の文言**

```
星[4/5]ありがとうございます！
いつも当店をご利用いただき、誠にありがとうございます。
もしよろしければ、以下のコメントをコピーして「Googleマップ」にご投稿いただけますと大変励みになります。

- ボタンを押すと簡単にコピーできます
- 投稿ページが開いたらペーストしていただくだけでOKです

今後とも皆様に喜んでいただけるよう、スタッフ一同さらに技術を磨いてまいります。
どうぞよろしくお願いいたします。
```

## **7. Googleマップの口コミURL**

店舗に応じて以下のURLへ誘導:

* **QUARTER**:  
  `https://g.page/r/CfiWzYV0WLCdEBE/review`
* **QUARTER RESORT**:  
  `https://g.page/r/CUpu9_cAhdaGEBE/review`
* **QUARTER SEASONS**:  
  `https://g.page/r/CWAu_dLl0DJmEBE/review`
* **LINK**:  
  `https://g.page/r/CYLblbqgWXsREBE/review`
* **iL**:  
  `https://g.page/r/CemPjkInZSpLEBE/review`

## **8. 技術的な実装詳細**

### **8.1 構成**

* **フロントエンド**: HTML, CSS, JavaScript
* **バックエンド**: Google Apps Script (GAS)
* **データ保存**: Google スプレッドシート

### **8.2 機能実装**

* クライアントサイドのフォームバリデーション
* セクション間のスムーズなナビゲーション
* レスポンシブデザイン（モバイルファースト）
* クリップボード操作（コメントコピー機能）
* 動的なUIフィードバック（アニメーション、状態変化）
* GASと連携したデータ送信

### **8.3 設定**

* グローバル変数として`CONFIG`オブジェクトを定義
* GoogleマップURLと必要な設定を一元管理
* Apps ScriptのWebアプリURLを設定

```javascript
window.CONFIG = {
  APPS_SCRIPT_WEBAPP_URL: 'https://script.google.com/macros/s/AKfycbxA-xuRc_F0Ih1KE9r9YXfOJ5WJqF0vUZvm3Eb_aQ9coqBjJzoA3nNoRuxNmajK06Xceg/exec',
  STORE_REVIEW_URLS: {
    'QUARTER': 'https://g.page/r/CfiWzYV0WLCdEBE/review',
    'QUARTER RESORT': 'https://g.page/r/CUpu9_cAhdaGEBE/review',
    'QUARTER SEASONS': 'https://g.page/r/CWAu_dLl0DJmEBE/review',
    'LINK': 'https://g.page/r/CYLblbqgWXsREBE/review',
    'iL': 'https://g.page/r/CemPjkInZSpLEBE/review'
  }
};
```

### **8.4 プロジェクトフォルダ構造**

```
│
├── index.html                     // HTMLメインファイル
├── README.md                      // プロジェクト説明書
├── css/
│   ├── styles.css                 // メインスタイル
│   └── responsive.css             // レスポンシブデザイン用
├── js/
│   ├── config.js                  // 設定ファイル
│   ├── main.js                    // メインのJavaScript
│   ├── navigation.js              // ナビゲーション機能
│   ├── validation.js              // フォームのバリデーション
│   ├── star-rating.js             // 星評価機能
│   └── scroll-monitor.js          // スクロール監視機能
└── images/
    └── quarter-logo.png           // ロゴ画像
```

## **9. 運用ルール・フロー**

1. **スタッフによる案内**  
   * カウンターにPOPを設置、またはセット面にQRシールを貼る  
   * 施術後に「もしお時間ございましたら、こちらから簡単なアンケートにご協力いただけると嬉しいです」とご案内  
   * 必要に応じてスタッフ用タブレットを手渡し、入力をサポート  

2. **回答後のトラブル対応**  
   * 口コミ投稿画面で迷った際などはスタッフがフォロー  
   * 必要に応じて「LINEでURLをお送りしますので後ほど…」と案内  

3. **定期的な改善サイクル**  
   * 月次ミーティングで「回答一覧」シートを確認し、星3以下の要望やコメントを共有 → サービス改善策を検討  
   * 口コミ投稿数や平均星評価もGoogleマップ上で定期チェック

## **10. まとめ**

* シンプルで上品なUI/UXを実現し、QUARTERブランドイメージに沿ったデザイン
* 必須項目は「店舗選択」「星評価」のみに絞り、短時間で回答可能
* 星4以上の高評価の場合は口コミ投稿を促進する仕組み
* 各店舗ごとに最適なGoogleマップリンクへ誘導
* スプレッドシートとの連携によるデータ収集と分析
* モバイルファーストのレスポンシブデザインで幅広い端末に対応
