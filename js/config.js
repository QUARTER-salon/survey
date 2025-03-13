/**
 * QUARTERアンケート - 設定ファイル
 * アプリケーション全体で使用される定数と設定
 */

// グローバル変数としてCONFIGを定義
window.CONFIG = {
  // Apps Script WebアプリのURL
  APPS_SCRIPT_WEBAPP_URL: 'https://script.google.com/macros/s/AKfycbxA-xuRc_F0Ih1KE9r9YXfOJ5WJqF0vUZvm3Eb_aQ9coqBjJzoA3nNoRuxNmajK06Xceg/exec',
  
  // 各店舗のGoogleマップレビューURL
  STORE_REVIEW_URLS: {
    'QUARTER': 'https://g.page/r/CfiWzYV0WLCdEBE/review',
    'QUARTER RESORT': 'https://g.page/r/CUpu9_cAhdaGEBE/review',
    'QUARTER SEASONS': 'https://g.page/r/CWAu_dLl0DJmEBE/review',
    'LINK': 'https://g.page/r/CYLblbqgWXsREBE/review',
    'iL': 'https://g.page/r/CemPjkInZSpLEBE/review'
  }
};

// エクスポート（必要に応じて）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
