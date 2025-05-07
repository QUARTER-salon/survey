/**
 * QUARTERアンケート - 設定ファイル
 * アプリケーション全体で使用される定数と設定
 * 
 * このファイルは「設定」のみを含み、ロジック（処理）は含みません。
 * 設定を一カ所にまとめることで、後から変更が必要になった場合に修正しやすくなります。
 */

// グローバル変数としてCONFIGを定義
// window.CONFIGとすることで、他のJavaScriptファイルからもアクセスできるようになります
// （windowはブラウザのグローバルオブジェクトで、ブラウザ上で動くすべてのJSから参照できます）
window.CONFIG = {
  // Apps Script WebアプリのURL
  // このURLはGoogleフォームやスプレッドシートと連携するためのエンドポイントです
  // アンケートの回答データはこのURLに送信され、Googleスプレッドシートに保存されます
  // 注意: このURLは定期的に変更される可能性があります（Googleのセキュリティポリシーにより）
  APPS_SCRIPT_WEBAPP_URL: 'https://script.google.com/macros/s/AKfycbylHFJWU4dLiFb0X9v2I8DQsXohqWksufKvM5W3G_pFHejHe5MS9Uymeutb4MDwV2UQrQ/exec',
  
  // 各店舗のGoogleマップレビューURL
  // オブジェクト（連想配列）形式で、店舗名をキーに、そのレビューページURLを値として保存しています
  // 高評価（星4以上）を選択したユーザーを、対応する店舗のGoogleマップレビューページに誘導するために使用します
  STORE_REVIEW_URLS: {
    // QUARTERブランドの店舗
    'QUARTER': 'https://g.page/r/CfiWzYV0WLCdEBE/review',         // QUARTERメイン店
    'QUARTER RESORT': 'https://g.page/r/CUpu9_cAhdaGEBE/review',   // QUARTERリゾート店
    'QUARTER SEASONS': 'https://g.page/r/CWAu_dLl0DJmEBE/review',  // QUARTER SEASONS店
    'LINK': 'https://g.page/r/CYLblbqgWXsREBE/review',            // LINK店
    'iL': 'https://g.page/r/CemPjkInZSpLEBE/review'               // iL店
  }
};

// エクスポート（必要に応じて）
// この部分は、Node.js環境（サーバーサイド）でこのファイルが読み込まれた場合に、
// CONFIGオブジェクトをエクスポートするためのコードです。
// ブラウザ環境では実行されず、Node.js環境でのみ実行されます。
// これにより同じ設定ファイルをフロントエンド（ブラウザ）とバックエンド（サーバー）の両方で使える「ユニバーサル」な設定にしています。
if (typeof module !== 'undefined' && module.exports) {
  // module変数が存在し、exportsプロパティがある場合（=Node.js環境の場合）
  module.exports = CONFIG;  // CONFIGオブジェクトをエクスポート
}
