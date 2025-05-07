/**
 * 星評価UI管理 (汎用化版)
 * 複数の星による評価システムの動作を制御します
 * 
 * このファイルは星評価のインタラクティブな機能を実装し、
 * ユーザーが視覚的に星をクリック・タップして評価を選択できるようにします。
 * マウスオーバー効果や選択状態の視覚化、エラー表示なども管理します。
 */

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', function() {
  // 星評価を持つすべての質問要素を取得
  const starRatingQuestions = document.querySelectorAll('#question2, #question8, #question9, #question10, #question11');
  
  // 各質問要素に対して星評価機能を初期化
  starRatingQuestions.forEach(question => {
    initStarRatingForElement(question);
  });
});

/**
 * 特定の質問要素に対する星評価機能の初期化
 * @param {HTMLElement} questionElement - 星評価を含む質問要素
 */
function initStarRatingForElement(questionElement) {
  // この質問内の星評価関連要素を取得
  const stars = questionElement.querySelectorAll('.star');
  const starsContainer = questionElement.querySelector('[data-stars-container]');
  const ratingScore = questionElement.querySelector('[data-rating-score]');
  const scoreValue = questionElement.querySelector('[data-score-value]');
  const lowRatingWarning = questionElement.querySelector('[data-low-rating-warning]');
  const ratingValidation = questionElement.querySelector('.validation-message');
  const globalValidation = document.getElementById('global-validation');
  
  // 質問IDと評価のname属性を取得（フォーム送信用）
  const questionId = questionElement.id;
  const ratingName = questionElement.querySelector('.star-rating-hidden input[type="radio"]')?.name;
  
  // 状態変数
  let selectedRating = 0;
  
  // 初期設定
  if (lowRatingWarning) {
    lowRatingWarning.style.display = 'none';
  }
  
  // 星にマウスオーバーイベントを設定
  stars.forEach(star => {
    star.addEventListener('mouseover', () => {
      const value = parseInt(star.getAttribute('data-value'));
      highlightStars(stars, value);
    });
  });
  
  // マウスアウト時に選択中の評価に戻す
  if (starsContainer) {
    starsContainer.addEventListener('mouseout', () => {
      highlightStars(stars, selectedRating);
    });
  }
  
  // 星のクリックイベント
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const value = parseInt(star.getAttribute('data-value'));
      selectRating(value);
      
      // アニメーション効果
      star.classList.add('pulse');
      setTimeout(() => {
        star.classList.remove('pulse');
      }, 300);
    });
    
    // タッチデバイス対応
    star.addEventListener('touchend', e => {
      e.preventDefault();
      const value = parseInt(star.getAttribute('data-value'));
      selectRating(value);
    });
  });
  
  /**
   * 指定された数まで星をハイライト表示
   * @param {NodeList} starsElements - 星要素のコレクション
   * @param {number} count - ハイライトする星の数（1-5）
   */
  function highlightStars(starsElements, count) {
    starsElements.forEach(star => {
      const starValue = parseInt(star.getAttribute('data-value'));
      if (starValue <= count) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
  }
  
  /**
   * 低評価警告の表示
   * 低い評価（1-2）が選択された際に注意を促す警告を表示します
   */
  function showLowRatingWarning() {
    if (!lowRatingWarning) return;
    
    lowRatingWarning.style.display = 'block';
    lowRatingWarning.classList.add('visible');
    
    // 3秒後に警告を非表示にする
    setTimeout(() => {
      lowRatingWarning.classList.remove('visible');
      setTimeout(() => {
        lowRatingWarning.style.display = 'none';
      }, 300); // フェードアウトのアニメーション時間後に非表示に
    }, 3000);
  }
  
  /**
   * 評価を選択・設定
   * @param {number} value - 選択された評価値（1-5）
   */
  function selectRating(value) {
    // 選択された評価値を保存
    selectedRating = value;
    
    // 星の表示を更新
    highlightStars(stars, value);
    
    // 対応するラジオボタンをチェック
    const radioId = questionId === 'question2' ? 'star' + value : `${questionId.replace('question', 'q')}_star${value}`;
    const radioBtn = document.getElementById(radioId);
    if (radioBtn) radioBtn.checked = true;
    
    // UI更新
    if (scoreValue) scoreValue.textContent = value;
    if (ratingScore) ratingScore.classList.add('visible');
    
    // 低評価（1-2）の場合は警告を表示
    if (value <= 2 && lowRatingWarning) {
      showLowRatingWarning();
    } else if (lowRatingWarning) {
      lowRatingWarning.classList.remove('visible');
    }
    
    // 質問を完了状態に
    questionElement.classList.add('completed');
    
    // エラー状態の解除
    questionElement.classList.remove('error');
    if (ratingValidation) ratingValidation.classList.remove('visible');
    if (globalValidation) globalValidation.classList.remove('visible');
  }
}

// グローバルスコープに公開
window.initStarRating = function() {
  const starRatingQuestions = document.querySelectorAll('#question2, #question8, #question9, #question10, #question11');
  starRatingQuestions.forEach(question => {
    initStarRatingForElement(question);
  });
};