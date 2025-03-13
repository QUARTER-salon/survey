/**
 * フォームバリデーションと送信処理
 * フォームの入力検証と送信ロジックを管理
 */

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', function() {
  initFormValidation();
});

/**
 * フォームのバリデーション機能を初期化
 */
function initFormValidation() {
  // 送信ボタンのイベント処理を設定
  const submitButton = document.querySelector('.submit-button');
  if (submitButton) {
    submitButton.addEventListener('click', validateAndSubmit);
    submitButton.addEventListener('touchend', function(e) {
      e.preventDefault();
      validateAndSubmit(e);
    });
  }
  
  // 入力フィールドの変更時にバリデーション状態を更新
  initFormFields();
}

/**
 * フォームフィールドの初期化とイベントリスナー追加
 */
function initFormFields() {
  const questions = document.querySelectorAll('.question');
  
  questions.forEach(question => {
    // ラジオボタンとチェックボックスの変更イベント
    const inputs = question.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    inputs.forEach(input => {
      input.addEventListener('change', function() {
        markCompleted(question);
      });
    });
    
    // テキストエリアの入力イベント
    const textareas = question.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      textarea.addEventListener('input', function() {
        if (this.value.trim().length > 0) {
          markCompleted(question);
        } else {
          question.classList.remove('completed');
        }
      });
    });
  });
}

/**
 * 質問を完了状態としてマーク、エラー状態をクリア
 * @param {HTMLElement} question - 質問要素
 */
function markCompleted(question) {
  question.classList.add('completed');
  question.classList.remove('error');
  
  // 関連するバリデーションメッセージを非表示
  const validationMsg = question.querySelector('.validation-message');
  if (validationMsg) {
    validationMsg.classList.remove('visible');
  }
  
  // グローバルエラーメッセージも非表示
  const globalValidation = document.getElementById('global-validation');
  if (globalValidation) {
    globalValidation.classList.remove('visible');
  }
}

/**
 * フォームのバリデーションと送信処理
 * @param {Event} e - イベントオブジェクト
 * @returns {boolean} - バリデーション結果
 */
function validateAndSubmit(e) {
  if (e) e.preventDefault();
  
  const form = document.getElementById('surveyForm');
  if (!form) return false;
  
  const formData = new FormData(form);
  
  // バリデーション状態のリセット
  resetValidationState();
  
  // 必須項目のチェック
  const storeSelected = document.querySelector('input[name="store"]:checked');
  const ratingSelected = document.querySelector('input[name="rating"]:checked');
  
  let hasErrors = false;
  
  // 店舗選択のバリデーション
  if (!storeSelected) {
    markError('question1', 'store-validation');
    hasErrors = true;
  }
  
  // 評価選択のバリデーション
  if (!ratingSelected) {
    markError('question2', 'rating-validation');
    hasErrors = true;
  }
  
  // エラーがある場合の処理
  if (hasErrors) {
    showGlobalError();
    scrollToFirstError();
    return false;
  }
  
  // 送信データの準備
  const dataObj = formDataToObject(formData);
  
  // 評価と店舗の情報を取得
  const rating = parseInt(dataObj.rating);
  const selectedStore = dataObj.store || 'QUARTER';
  
  // 口コミ用コメント設定
  prepareReviewComment(dataObj);
  
  // フォーム非表示
  hideFormElements();
  
  // 結果表示
  showResult(rating);
  
  // データ送信
  submitFormData(dataObj);
  
  return true;
}

/**
 * バリデーション状態をリセット
 */
function resetValidationState() {
  document.querySelectorAll('.validation-message').forEach(msg => {
    msg.classList.remove('visible');
  });
  
  document.querySelectorAll('.question.error').forEach(q => {
    q.classList.remove('error');
  });
}

/**
 * エラー表示を設定
 * @param {string} questionId - 質問要素のID
 * @param {string} validationId - バリデーションメッセージのID
 */
function markError(questionId, validationId) {
  const question = document.getElementById(questionId);
  const validation = document.getElementById(validationId);
  
  if (question) question.classList.add('error');
  if (validation) validation.classList.add('visible');
}

/**
 * グローバルエラーメッセージを表示
 */
function showGlobalError() {
  const globalValidation = document.getElementById('global-validation');
  if (globalValidation) {
    globalValidation.classList.add('visible');
  }
}

/**
 * 最初のエラー要素までスクロール
 */
function scrollToFirstError() {
  const firstError = document.querySelector('.question.error');
  if (!firstError) return;
  
  firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  firstError.classList.add('highlight');
  
  setTimeout(() => {
    firstError.classList.remove('highlight');
  }, 1500);
}

/**
 * FormDataオブジェクトを通常のオブジェクトに変換
 * @param {FormData} formData - フォームデータ
 * @returns {Object} - 変換後のオブジェクト
 */
function formDataToObject(formData) {
  const dataObj = {};
  
  formData.forEach((val, key) => {
    if (dataObj[key]) {
      if (!Array.isArray(dataObj[key])) {
        dataObj[key] = [dataObj[key]];
      }
      dataObj[key].push(val);
    } else {
      dataObj[key] = val;
    }
  });
  
  return dataObj;
}

/**
 * 口コミ用コメントを準備
 * @param {Object} dataObj - フォームデータオブジェクト
 */
function prepareReviewComment(dataObj) {
  let userComments = '';
  
  if (dataObj.improvement) userComments += dataObj.improvement + ' ';
  if (dataObj.otherComments) userComments += dataObj.otherComments;
  
  const commentElement = document.getElementById('comment-to-copy');
  if (commentElement) {
    commentElement.value = userComments.trim();
  }
}

/**
 * フォーム要素を非表示
 */
function hideFormElements() {
  const form = document.getElementById('surveyForm');
  const navContainer = document.querySelector('.nav-container');
  
  if (form) form.style.display = 'none';
  if (navContainer) navContainer.style.display = 'none';
}

/**
 * 評価に応じた結果画面を表示
 * @param {number} rating - 評価値（1-5）
 */
function showResult(rating) {
  if (rating >= 4) {
    const headingElement = document.querySelector('#review-redirect h2');
    if (headingElement) {
      headingElement.textContent = rating === 5 ? 
        '星5ありがとうございます！' : 
        '星4ありがとうございます！';
    }
    
    const reviewRedirect = document.getElementById('review-redirect');
    if (reviewRedirect) {
      reviewRedirect.style.display = 'block';
    }
  } else {
    const thankyou = document.getElementById('thankyou');
    if (thankyou) {
      thankyou.style.display = 'block';
    }
  }
}

/**
 * フォームデータをサーバーに送信
 * @param {Object} dataObj - 送信するデータオブジェクト
 */
function submitFormData(dataObj) {
  try {
    const apiUrl = typeof CONFIG !== 'undefined' ? CONFIG.APPS_SCRIPT_WEBAPP_URL : '';
    if (!apiUrl) return;
    
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(dataObj)
    })
    .then(res => res.json())
    .then(result => {
      console.log('送信成功:', result);
      if (!result.success) {
        alert('エラーが発生しました: ' + result.error);
      }
    })
    .catch(err => {
      console.error('送信エラー:', err);
      alert('送信中に問題が発生しました。もう一度お試しください。');
    });
  } catch (e) {
    console.error('データ送信エラー:', e);
  }
}

// グローバルスコープに公開
window.validateAndSubmit = validateAndSubmit;
