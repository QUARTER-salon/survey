/**
 * フォームバリデーションと送信処理
 * フォームの入力検証と送信ロジックを管理
 * 
 * このファイルは、アンケートフォームの入力内容を検証し、
 * エラー表示、送信処理、結果表示などを管理します。
 * ユーザー入力の正当性を確保し、適切なフィードバックを提供するための
 * 一連の機能を実装しています。
 */

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
  if (submitButton) {
    // デスクトップ用のクリックイベント
    submitButton.addEventListener('click', validateAndSubmit);
    // モバイル用のタッチイベント
    submitButton.addEventListener('touchend', function(e) {
      e.preventDefault(); // デフォルトのタッチ動作を防止
      validateAndSubmit(e); // 検証と送信処理を実行
    });
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
  const dataObj = formDataToObject(formData);
  
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
  
  // main.jsの関数が存在する場合はそちらを優先、なければshowResult()を使用
if (typeof window.handleFormAfterSubmission === 'function') {
  window.handleFormAfterSubmission(rating);
} else {
  // フォールバックとして旧関数を使用
  showResult(rating);
}
  
  // データ送信
  // サーバーにデータを送信（API呼び出し）
  submitFormData(dataObj);

  // 送信後の画面表示処理を呼び出す（追加）
  if (typeof window.handleFormAfterSubmission === 'function') {
    window.handleFormAfterSubmission(rating);
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
  
  // FormDataの各エントリーに対して処理
  formData.forEach((val, key) => {
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
  
  return dataObj;
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
  
  // 口コミリダイレクト画面を表示（クラスベースで制御）
  const reviewRedirect = document.getElementById('review-redirect');
  if (reviewRedirect) {
    reviewRedirect.classList.remove('hidden');
  }
} else {
  // 低・中評価（3以下）の場合は通常のサンクスページ（クラスベースで制御）
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
function submitFormData(dataObj) {
  try {
    // 設定ファイルからAPIのURLを取得
    const apiUrl = typeof CONFIG !== 'undefined' ? CONFIG.APPS_SCRIPT_WEBAPP_URL : '';
    if (!apiUrl) return; // URLがなければ処理中断
    
    // fetch APIを使ってPOSTリクエストを送信
    fetch(apiUrl, {
      method: 'POST', // HTTPメソッド
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded' // コンテンツタイプ
      },
      // URLSearchParamsを使ってデータをURLエンコード形式に変換
      body: new URLSearchParams(dataObj)
    })
    .then(res => res.json()) // レスポンスをJSONとして解析
    .then(result => {
      console.log('送信成功:', result);
      // サーバーからのレスポンスにエラーが含まれていた場合
      if (!result.success) {
        alert('エラーが発生しました: ' + result.error);
      }
    })
    .catch(err => {
      // ネットワークエラーやその他の例外が発生した場合
      console.error('送信エラー:', err);
      alert('送信中に問題が発生しました。もう一度お試しください。');
    });
  } catch (e) {
    // 予期せぬエラーの場合
    console.error('データ送信エラー:', e);
  }
}

// グローバルスコープに公開
// HTMLのonclick属性や他のJSファイルからこの関数を呼び出せるようにする
window.validateAndSubmit = validateAndSubmit;
