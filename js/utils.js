/**
 * ユーティリティ関数
 * 共通で使用される便利な関数を定義
 */

/**
 * 開発環境かどうかを判定
 * @returns {boolean} 開発環境の場合true
 */
function isDevelopment() {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.port === '8000' ||
         window.location.protocol === 'file:';
}

/**
 * エラーハンドリングのラッパー関数
 * 開発環境では詳細なエラー情報を表示、本番環境では汎用的なメッセージ
 * @param {Error} error - エラーオブジェクト
 * @param {string} context - エラーが発生したコンテキスト
 * @param {Object} additionalInfo - 追加情報（オプション）
 */
function handleError(error, context, additionalInfo = {}) {
  // セキュリティログに記録
  if (window.SecurityLogger) {
    window.SecurityLogger.log(
      window.SecurityLogger.EVENTS.API_ERROR,
      window.SecurityLogger.LEVELS.ERROR,
      {
        context,
        message: error.message,
        stack: isDevelopment() ? error.stack : undefined,
        ...additionalInfo
      }
    );
  }

  // 開発環境では詳細なエラー情報を表示
  if (isDevelopment()) {
    console.error(`[${context}] エラー発生:`, {
      message: error.message,
      stack: error.stack,
      additionalInfo
    });
    
    // 開発環境ではより詳細なアラート
    if (error.message.includes('CORS') || error.message.includes('fetch')) {
      alert(`ネットワークエラー: ${error.message}\n\n開発環境でのヒント:\n- CORSエラーの場合、プロキシサーバーの設定を確認してください\n- APIエンドポイントが正しいか確認してください`);
    } else {
      alert(`エラーが発生しました (${context}):\n${error.message}`);
    }
  } else {
    // 本番環境では汎用的なメッセージ
    console.error(`エラーが発生しました: ${context}`);
    
    // ユーザーへの汎用的なメッセージ（多言語対応）
    const errorMessage = window.i18next ? 
      window.i18next.t('errors.generic') : 
      'エラーが発生しました。しばらくしてからもう一度お試しください。';
    
    alert(errorMessage);
  }
}

/**
 * APIレスポンスのデバッグ情報を記録
 * 開発環境でのみ動作
 * @param {Response} response - Fetchレスポンス
 * @param {string} context - APIコールのコンテキスト
 */
async function logApiResponse(response, context) {
  if (!isDevelopment()) return;
  
  console.log(`[API Debug - ${context}]`, {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    url: response.url
  });
  
  // レスポンスボディのプレビュー（クローンして読み取り）
  try {
    const clonedResponse = response.clone();
    const text = await clonedResponse.text();
    console.log(`[API Response Body - ${context}]`, text.substring(0, 500));
  } catch (e) {
    console.log(`[API Response Body Error - ${context}]`, e.message);
  }
}

/**
 * レート制限チェック付きの関数実行
 * @param {Function} fn - 実行する関数
 * @param {string} actionName - アクション名
 * @param {number} maxAttempts - 最大試行回数
 * @param {number} windowMs - 時間枠（ミリ秒）
 * @returns {*} 関数の実行結果
 */
async function executeWithRateLimit(fn, actionName, maxAttempts = 5, windowMs = 60000) {
  if (window.SecurityLogger) {
    if (!window.SecurityLogger.checkRateLimit(actionName, maxAttempts, windowMs)) {
      const errorMessage = window.i18next ? 
        window.i18next.t('errors.tooManyRequests') : 
        'リクエストが多すぎます。しばらくしてからもう一度お試しください。';
      
      throw new Error(errorMessage);
    }
  }
  
  return await fn();
}

// グローバルに公開
window.utils = {
  isDevelopment,
  handleError,
  logApiResponse,
  executeWithRateLimit
};