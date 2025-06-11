/**
 * フォームバリデーションと送信処理
 * フォームの入力検証と送信ロジックを管理
 * 
 * このファイルは、アンケートフォームの入力内容を検証し、
 * エラー表示、送信処理、結果表示などを管理します。
 * ユーザー入力の正当性を確保し、適切なフィードバックを提供するための
 * 一連の機能を実装しています。
 */

/**
 * 入力値をサニタイズする関数
 * XSSやインジェクション攻撃を防ぐために特殊文字を除去
 * @param {string} input - サニタイズする入力値
 * @param {string} fieldName - フィールド名（ログ用）
 * @returns {string} サニタイズされた文字列
 */
function sanitizeInput(input, fieldName = 'unknown') {
  if (!input) return '';
  
  // 文字列に変換してトリム
  const originalInput = String(input).trim();
  let sanitized = originalInput;
  
  // セキュリティチェック（SecurityLoggerが存在する場合）
  if (window.SecurityLogger) {
    // XSS試行を検出
    if (window.SecurityLogger.detectXSSAttempt(originalInput, fieldName)) {
      window.SecurityLogger.log(
        window.SecurityLogger.EVENTS.SUSPICIOUS_INPUT,
        window.SecurityLogger.LEVELS.WARNING,
        { field: fieldName, action: 'sanitized' }
      );
    }
    
    // SQLインジェクション試行を検出
    if (window.SecurityLogger.detectInjectionAttempt(originalInput, fieldName)) {
      window.SecurityLogger.log(
        window.SecurityLogger.EVENTS.SUSPICIOUS_INPUT,
        window.SecurityLogger.LEVELS.WARNING,
        { field: fieldName, action: 'sanitized' }
      );
    }
  }
  
  // スクリプトタグを完全に除去
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // HTMLタグを除去
  sanitized = sanitized.replace(/<[^>]+>/g, '');
  
  // 危険な文字をエスケープ
  sanitized = sanitized
    .replace(/[<>]/g, '') // HTMLタグ文字を除去
    .replace(/javascript:/gi, '') // JavaScriptプロトコルを除去
    .replace(/on\w+\s*=/gi, ''); // イベントハンドラを除去
  
  return sanitized;
}

/**
 * HTMLエスケープ関数
 * HTMLに埋め込む際の特殊文字をエスケープ
 * @param {string} unsafe - エスケープする文字列
 * @returns {string} エスケープされた文字列
 */
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * フォームデータ全体をサニタイズする関数
 * @param {Object} formData - サニタイズするフォームデータ
 * @returns {Object} サニタイズされたフォームデータ
 */
function sanitizeFormData(formData) {
  const sanitizedData = {};
  
  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      sanitizedData[key] = sanitizeInput(value, key);
    } else if (Array.isArray(value)) {
      // 配列の場合は各要素をサニタイズ
      sanitizedData[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item, key) : item
      );
    } else {
      // その他の型はそのまま
      sanitizedData[key] = value;
    }
  }
  
  return sanitizedData;
}

/**
 * 入力フィールドの文字数制限
 * UXを考慮し、一般的な使用に十分な長さを設定
 */
const INPUT_LIMITS = {
  name: { min: 1, max: 100 },          // 名前: 1-100文字
  email: { min: 5, max: 254 },         // メール: 5-254文字（RFC準拠）
  phone: { min: 10, max: 20 },         // 電話番号: 10-20文字
  feedback: { min: 0, max: 1000 },     // フィードバック: 0-1000文字
  improvement: { min: 0, max: 1000 },  // 改善点: 0-1000文字
  otherComments: { min: 0, max: 1000 } // その他コメント: 0-1000文字
};

/**
 * 入力文字数を検証する関数
 * @param {string} input - 検証する入力値
 * @param {string} field - フィールド名
 * @returns {Object} 検証結果 {valid: boolean, message?: string}
 */
function validateInputLength(input, field) {
  const limits = INPUT_LIMITS[field];
  if (!limits) return { valid: true }; // 制限が設定されていないフィールドは許可
  
  const length = input.length;
  
  // 最小文字数チェック（0でない場合のみ）
  if (limits.min > 0 && length < limits.min) {
    return { 
      valid: false, 
      message: i18next.t('validation.tooShort', { 
        field: i18next.t(`fields.${field}`), 
        min: limits.min 
      }) || `${field}は${limits.min}文字以上で入力してください`
    };
  }
  
  // 最大文字数チェック
  if (length > limits.max) {
    return { 
      valid: false, 
      message: i18next.t('validation.tooLong', { 
        field: i18next.t(`fields.${field}`), 
        max: limits.max 
      }) || `${field}は${limits.max}文字以内で入力してください`
    };
  }
  
  return { valid: true };
}

/**
 * 特殊文字パターンの定義
 * 各フィールドに応じた適切なパターンを設定
 */
const VALIDATION_PATTERNS = {
  // 名前: 日本語、英字、スペースを許可
  name: /^[a-zA-Z\s\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2b820-\u2ceaf\uff66-\uff9f\u3000-\u303f]+$/,
  // メール: 標準的なメールアドレス形式
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  // 電話番号: 数字、ハイフン、括弧、プラス記号を許可
  phone: /^[\d\s\-\+\(\)]+$/
};

/**
 * 特殊文字を検証する関数
 * @param {string} input - 検証する入力値
 * @param {string} field - フィールド名
 * @returns {Object} 検証結果 {valid: boolean, message?: string}
 */
function validateSpecialCharacters(input, field) {
  const pattern = VALIDATION_PATTERNS[field];
  if (!pattern) return { valid: true }; // パターンが設定されていないフィールドは許可
  
  // 空文字列は許可（必須チェックは別途行う）
  if (!input || input.length === 0) return { valid: true };
  
  if (!pattern.test(input)) {
    // フィールド別のエラーメッセージ
    let message = '';
    switch(field) {
      case 'name':
        message = i18next.t('validation.invalidName') || '名前には文字のみを使用してください';
        break;
      case 'email':
        message = i18next.t('validation.invalidEmail') || '有効なメールアドレスを入力してください';
        break;
      case 'phone':
        message = i18next.t('validation.invalidPhone') || '有効な電話番号を入力してください';
        break;
      default:
        message = i18next.t('validation.invalidCharacters', { field: field }) || `${field}に無効な文字が含まれています`;
    }
    
    return { valid: false, message };
  }
  
  return { valid: true };
}

/**
 * 総合的な入力検証関数
 * サニタイズ、文字数チェック、特殊文字チェックを統合
 * @param {string} input - 検証する入力値
 * @param {string} field - フィールド名
 * @returns {Object} 検証結果 {valid: boolean, value: string, errors: string[]}
 */
function validateInput(input, field) {
  const errors = [];
  
  // 1. サニタイズ
  const sanitized = sanitizeInput(input, field);
  
  // 2. 文字数検証
  const lengthResult = validateInputLength(sanitized, field);
  if (!lengthResult.valid) {
    errors.push(lengthResult.message);
  }
  
  // 3. 特殊文字検証
  const charResult = validateSpecialCharacters(sanitized, field);
  if (!charResult.valid) {
    errors.push(charResult.message);
  }
  
  return {
    valid: errors.length === 0,
    value: sanitized,
    errors: errors
  };
}

// DOM読み込み完了後に初期化
// HTMLが解析された後、画像などのリソース読み込み前に実行
document.addEventListener('DOMContentLoaded', function() {
  initFormValidation();
});

/**
 * フォームのバリデーション機能を初期化
 * 送信ボタンのイベントリスナー設定と、入力フィールドの監視を開始します
 */
function initFormValidation() {
  // 送信ボタンのイベント処理を設定
// クリックとタッチの両方に対応（デスクトップとモバイル用）
const submitButton = document.querySelector('.submit-button');
if (submitButton && !submitButton.hasAttribute('data-listener-added')) {
  // デスクトップ用のクリックイベント
  submitButton.addEventListener('click', validateAndSubmit);
  // モバイル用のタッチイベント
  submitButton.addEventListener('touchend', function(e) {
    e.preventDefault(); // デフォルトのタッチ動作を防止
    validateAndSubmit(e); // 検証と送信処理を実行
  });
  // イベントリスナーが追加されたことを示す属性を設定
  submitButton.setAttribute('data-listener-added', 'true');
}
  
  // 入力フィールドの変更時にバリデーション状態を更新
  // ユーザーが入力するたびにリアルタイムでフィードバックを提供
  initFormFields();
}

/**
 * フォームフィールドの初期化とイベントリスナー追加
 * 各入力フィールドの変更を監視し、入力状態に応じて表示を更新します
 */
function initFormFields() {
  // すべての質問要素を取得
  const questions = document.querySelectorAll('.question');
  
  // 各質問に対して処理
  questions.forEach(question => {
    // ラジオボタンとチェックボックスの変更イベント
    // これらは選択肢から選ぶタイプの入力
    const inputs = question.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    inputs.forEach(input => {
      // 値が変更されたときのイベント
      input.addEventListener('change', function() {
        // 何かが選択されたら、その質問は「完了」状態にマーク
        markCompleted(question);
      });
    });
    
    // テキストエリアの入力イベント
    // 自由記述欄の入力状態を監視
    const textareas = question.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      // 入力内容が変更されるたびに実行
      textarea.addEventListener('input', function() {
        // テキストが入力されている場合（空白だけではない）
        if (this.value.trim().length > 0) {
          // 完了状態にマーク
          markCompleted(question);
        } else {
          // 空の場合は完了状態を解除
          question.classList.remove('completed');
        }
      });
    });
  });
}

/**
 * 質問を完了状態としてマーク、エラー状態をクリア
 * 入力が完了した質問の視覚的表示を更新します
 * 
 * @param {HTMLElement} question - 質問要素（DOMノード）
 */
function markCompleted(question) {
  // 完了状態のクラスを追加
  question.classList.add('completed');
  // エラー状態のクラスを削除（もし存在すれば）
  question.classList.remove('error');
  
  // 関連するバリデーションメッセージを非表示
  const validationMsg = question.querySelector('.validation-message');
  if (validationMsg) {
    validationMsg.classList.remove('visible');
  }
  
  // グローバルエラーメッセージも非表示
  // 必須項目が入力されると、全体のエラーメッセージも消す
  const globalValidation = document.getElementById('global-validation');
  if (globalValidation) {
    globalValidation.classList.remove('visible');
  }
}

/**
 * フォームのバリデーションと送信処理
 * フォーム全体の検証を行い、問題がなければデータを送信します
 * 
 * @param {Event} e - イベントオブジェクト
 * @returns {boolean} - バリデーション結果（成功時true、失敗時false）
 */
function validateAndSubmit(e) {
  // イベントのデフォルト動作を防止（フォームの自動送信など）
  if (e) e.preventDefault();
  
  // フォーム要素を取得
  const form = document.getElementById('surveyForm');
  if (!form) return false; // フォームが見つからない場合は処理中断
  
  // フォームデータをFormDataオブジェクトとして取得
  // FormDataはHTMLフォームの全データを簡単に収集できるAPIです
  const formData = new FormData(form);
  
  // バリデーション状態のリセット
  // 前回のエラー表示をクリアして新しい検証を開始
  resetValidationState();
  
  // 必須項目のチェック
  // 「店舗選択」と「評価」は必須なので、これらが選択されているか確認
  const storeSelected = document.querySelector('input[name="store"]:checked');
  const ratingSelected = document.querySelector('input[name="rating"]:checked');
  
  let hasErrors = false; // エラーフラグ
  
  // 店舗選択のバリデーション
  // 店舗が選択されていなければエラー
  if (!storeSelected) {
    markError('question1', 'store-validation');
    hasErrors = true;
  }
  
  // 評価選択のバリデーション
  // 評価が選択されていなければエラー
  if (!ratingSelected) {
    markError('question2', 'rating-validation');
    hasErrors = true;
  }
  
  // エラーがある場合の処理
  if (hasErrors) {
    showGlobalError(); // 全体のエラーメッセージを表示
    scrollToFirstError(); // 最初のエラー項目までスクロール
    return false; // 送信処理を中断
  }
  
  // 送信データの準備
  // FormDataオブジェクトを通常のJavaScriptオブジェクトに変換
  let dataObj;
  try {
    dataObj = formDataToObject(formData);
  } catch (error) {
    // 検証エラーがある場合
    if (error.validationErrors) {
      scrollToFirstError();
      return false;
    }
    throw error;
  }
  
  // セッション管理による重複送信チェック
  if (typeof sessionManager !== 'undefined') {
    const canSubmitResult = sessionManager.canSubmit();
    if (!canSubmitResult.allowed) {
      if (canSubmitResult.reason === 'duplicate_submission') {
        alert(i18next.t('validation.duplicateSubmission', { 
          seconds: canSubmitResult.waitTime 
        }) || `まだ送信できません。${canSubmitResult.waitTime}秒後に再度お試しください。`);
      } else if (canSubmitResult.reason === 'rate_limit') {
        alert(i18next.t('validation.rateLimit', { 
          seconds: canSubmitResult.waitTime 
        }) || `送信回数の上限に達しました。${canSubmitResult.waitTime}秒後に再度お試しください。`);
      }
      return false;
    }
  }
  
  // CSRFトークンを追加
  dataObj.csrfToken = getCSRFToken();
  
  // 評価と店舗の情報を取得
  // 後の処理で利用するために個別に変数に保存
  const rating = parseInt(dataObj.rating);
  const selectedStore = dataObj.store || 'QUARTER'; // デフォルト値も設定
  
  // 口コミ用コメント設定
  // 高評価の場合に口コミを促すためのコメントを準備
  prepareReviewComment(dataObj);
  
  // フォーム非表示
  // 送信後はフォームを隠し、結果画面を表示
  hideFormElements();
  
  // セッションに送信を記録
  if (typeof sessionManager !== 'undefined') {
    sessionManager.recordSubmission();
  }
  
// データ送信
// サーバーにデータを送信（API呼び出し）
submitFormData(dataObj);

// 送信後の画面表示処理を呼び出す
if (typeof window.handleFormAfterSubmission === 'function') {
  window.handleFormAfterSubmission(rating, dataObj); // dataObjを追加して渡す
} else {
  // フォールバックとして旧関数を使用
  showResult(rating);
}
  
  return true; // 処理成功
}

/**
 * バリデーション状態をリセット
 * 以前のエラー表示をすべてクリアします
 */
function resetValidationState() {
  // すべてのバリデーションメッセージを非表示に
  document.querySelectorAll('.validation-message').forEach(msg => {
    msg.classList.remove('visible');
  });
  
  // すべての質問からエラー状態を解除
  document.querySelectorAll('.question.error').forEach(q => {
    q.classList.remove('error');
  });
}

/**
 * エラー表示を設定
 * 指定された質問とそれに対応するバリデーションメッセージにエラー表示を設定します
 * 
 * @param {string} questionId - 質問要素のID
 * @param {string} validationId - バリデーションメッセージのID
 */
function markError(questionId, validationId) {
  // 質問要素を取得
  const question = document.getElementById(questionId);
  // 対応するバリデーションメッセージを取得
  const validation = document.getElementById(validationId);
  
  // エラー状態のクラスを追加
  if (question) question.classList.add('error');
  // バリデーションメッセージを表示
  if (validation) validation.classList.add('visible');
}

/**
 * グローバルエラーメッセージを表示
 * 「必須項目をご入力ください」などのフォーム全体のエラーメッセージを表示します
 */
function showGlobalError() {
  const globalValidation = document.getElementById('global-validation');
  if (globalValidation) {
    globalValidation.classList.add('visible');
  }
}

/**
 * 最初のエラー要素までスクロール
 * エラーがある場合、そのエラー項目が画面内に見えるようにスクロールします
 */
function scrollToFirstError() {
  // 最初のエラー項目を取得
  const firstError = document.querySelector('.question.error');
  if (!firstError) return; // エラー項目がなければ何もしない
  
  // エラー項目まで滑らかにスクロール
  firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  // 注目を集めるためにハイライト効果を追加
  firstError.classList.add('highlight');
  
  // 1.5秒後にハイライトを解除
  setTimeout(() => {
    firstError.classList.remove('highlight');
  }, 1500);
}

/**
 * FormDataオブジェクトを通常のオブジェクトに変換
 * FormDataはイテレータなので、通常のJSオブジェクトに変換すると扱いやすくなります
 * 
 * @param {FormData} formData - フォームデータ
 * @returns {Object} - 変換後のオブジェクト
 */
function formDataToObject(formData) {
  const dataObj = {};
  const validationErrors = {};
  
  // FormDataの各エントリーに対して処理
  formData.forEach((val, key) => {
    // 文字列フィールドの検証
    if (typeof val === 'string' && val.trim()) {
      const validationResult = validateInput(val, key);
      
      if (!validationResult.valid) {
        // エラーがある場合は記録
        validationErrors[key] = validationResult.errors;
        // エラーメッセージを表示（最初のエラーのみ）
        showFieldError(key, validationResult.errors[0]);
      }
      
      // 検証済みの値を使用
      val = validationResult.value;
    }
    
    // すでにそのキーが存在する場合（複数選択のチェックボックスなど）
    if (dataObj[key]) {
      // まだ配列になっていない場合は配列に変換
      if (!Array.isArray(dataObj[key])) {
        dataObj[key] = [dataObj[key]];
      }
      // 新しい値を配列に追加
      dataObj[key].push(val);
    } else {
      // 新しいキーの場合は通常の値として格納
      dataObj[key] = val;
    }
  });
  
  // エラーがある場合は例外を投げる
  if (Object.keys(validationErrors).length > 0) {
    const error = new Error('Validation failed');
    error.validationErrors = validationErrors;
    throw error;
  }
  
  // フォームデータ全体をサニタイズして返す
  return sanitizeFormData(dataObj);
}

/**
 * フィールド固有のエラーを表示する関数
 * @param {string} fieldName - フィールド名
 * @param {string} errorMessage - エラーメッセージ
 */
function showFieldError(fieldName, errorMessage) {
  // フィールドに対応する要素を探す
  const field = document.querySelector(`[name="${fieldName}"]`);
  if (!field) return;
  
  // 親要素（通常は.questionクラス）を取得
  const questionElement = field.closest('.question');
  if (!questionElement) return;
  
  // エラー状態を追加
  questionElement.classList.add('error');
  
  // 既存のエラーメッセージ要素を探すか、新規作成
  let errorElement = questionElement.querySelector('.field-error-message');
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.className = 'field-error-message validation-message';
    questionElement.appendChild(errorElement);
  }
  
  // エラーメッセージを設定して表示
  errorElement.textContent = errorMessage;
  errorElement.classList.add('visible');
}

/**
 * 口コミ用コメントを準備
 * 高評価の場合に表示される口コミリダイレクト画面用のコメントを設定します
 * 
 * @param {Object} dataObj - フォームデータオブジェクト
 */
function prepareReviewComment(dataObj) {
  let userComments = '';
  
  // 改善点・要望があれば追加
  if (dataObj.improvement) userComments += dataObj.improvement + ' ';
  // その他コメントがあれば追加
  if (dataObj.otherComments) userComments += dataObj.otherComments;
  
  // コメントをコピー用テキストエリアに設定
  const commentElement = document.getElementById('comment-to-copy');
  if (commentElement) {
    // 前後の空白を除去してセット
    commentElement.value = userComments.trim();
  }
}

/**
 * フォーム要素を非表示
 * 送信完了後、フォームとナビゲーションを非表示にします
 */
function hideFormElements() {
  const form = document.getElementById('surveyForm');
  const navContainer = document.querySelector('.nav-container');
  
  // フォームを非表示
  if (form) form.style.display = 'none';
  // ナビゲーションも非表示
  if (navContainer) navContainer.style.display = 'none';
}

/**
 * 評価に応じた結果画面を表示
 * 評価値に基づいて、適切な完了画面（サンクスページ）を表示します
 * 
 * @param {number} rating - 評価値（1-5）
 */
function showResult(rating) {
  // 高評価（4以上）の場合
  if (rating >= 4) {
    // 見出しテキストを評価に合わせてカスタマイズ
    const headingElement = document.querySelector('#review-redirect h2');
    if (headingElement) {
      headingElement.textContent = `星${rating}評価ありがとうございます！`;
    }
    
    // 口コミリダイレクト画面を表示
    const reviewRedirect = document.getElementById('review-redirect');
    if (reviewRedirect) {
      reviewRedirect.classList.remove('hidden');
      
    }
  } else {
    // 低・中評価（3以下）の場合は通常のサンクスページ
    const thankyou = document.getElementById('thankyou');
    if (thankyou) {
      thankyou.classList.remove('hidden');
     
    }
  }
}

/**
 * フォームデータをサーバーに送信
 * 収集したデータをGoogle Apps Scriptウェブアプリに送信します
 * 
 * @param {Object} dataObj - 送信するデータオブジェクト
 */
async function submitFormData(dataObj) {
  try {
    // 設定ファイルからAPIのURLを取得
    const apiUrl = typeof CONFIG !== 'undefined' ? CONFIG.APPS_SCRIPT_WEBAPP_URL : '';
    if (!apiUrl) {
      throw new Error('API URLが設定されていません');
    }
    
    // レート制限チェック付きで実行
    await window.utils.executeWithRateLimit(async () => {
      // fetch APIを使ってPOSTリクエストを送信
      // 注意: Google Apps ScriptはCORSプリフライトをサポートしないため、
      // Content-Typeを指定せずにtext/plainとして送信する必要があります
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify(dataObj)
      });
      
      // 開発環境ではAPIレスポンスを詳細にログ
      if (window.utils) {
        await window.utils.logApiResponse(response, 'submitFormData');
      }
      
      // レスポンスのステータスをチェック
      if (!response.ok) {
        throw new Error(`サーバーエラー: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // サーバーからのレスポンスにエラーが含まれていた場合
      if (!result.success) {
        throw new Error(result.error || '送信に失敗しました');
      }
      
      // 成功ログ（開発環境のみ）
      if (window.utils && window.utils.isDevelopment()) {
        console.log('送信成功:', result);
      }
    }, 'form_submission', 3, 60000); // 1分間に3回まで
    
  } catch (error) {
    // エラーハンドリング
    if (window.utils) {
      window.utils.handleError(error, 'submitFormData', {
        apiUrl: apiUrl,
        dataSize: JSON.stringify(dataObj).length
      });
    } else {
      // utilsが読み込まれていない場合のフォールバック
      console.error('データ送信エラー:', error);
      const errorMessage = window.i18next ? 
        window.i18next.t('errors.network') : 
        '送信中に問題が発生しました。もう一度お試しください。';
      alert(errorMessage);
    }
  }
}

window.updateValidationMessages = function () {
  const set = (sel, key) => {
    const el = document.querySelector(sel);
    if (el) el.textContent = i18next.t(key);
  };
  set('#store-validation span', 'validation.store');
  set('#rating-validation span', 'validation.rating');
  set('#global-validation span', 'validation.global');
};

/**
 * CSRFトークンを生成する関数
 * ランダムな文字列を生成してセッションストレージに保存
 * @returns {string} 生成されたCSRFトークン
 */
function generateCSRFToken() {
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem('csrfToken', token);
  return token;
}

/**
 * CSRFトークンを検証する関数
 * 送信されたトークンとセッションストレージのトークンを比較
 * @param {string} token - 検証するトークン
 * @returns {boolean} トークンが有効な場合true
 */
function validateCSRFToken(token) {
  const storedToken = sessionStorage.getItem('csrfToken');
  return token === storedToken;
}

/**
 * 現在のCSRFトークンを取得する関数
 * トークンが存在しない場合は新規生成
 * @returns {string} CSRFトークン
 */
function getCSRFToken() {
  let token = sessionStorage.getItem('csrfToken');
  if (!token) {
    token = generateCSRFToken();
  }
  return token;
}

// グローバルスコープに公開
// HTMLのonclick属性や他のJSファイルからこの関数を呼び出せるようにする
window.validateAndSubmit = validateAndSubmit;
window.generateCSRFToken = generateCSRFToken;
window.validateCSRFToken = validateCSRFToken;
window.getCSRFToken = getCSRFToken;
