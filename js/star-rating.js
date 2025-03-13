/**
 * 星評価UI管理
 * 星による評価システムの動作を制御します
 */

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', function() {
  initStarRating();
});

/**
 * 星評価機能の初期化
 */
function initStarRating() {
  // DOM要素の取得
  const stars = document.querySelectorAll('.star');
  const ratingScore = document.getElementById('ratingScore');
  const scoreValue = document.getElementById('scoreValue');
  const lowRatingWarning = document.getElementById('lowRatingWarning');
  const question2 = document.getElementById('question2');
  const ratingValidation = document.getElementById('rating-validation');
  const globalValidation = document.getElementById('global-validation');
  
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
      highlightStars(value);
    });
  });
  
  // マウスアウト時に選択中の評価に戻す
  const starsContainer = document.getElementById('starsContainer');
  if (starsContainer) {
    starsContainer.addEventListener('mouseout', () => {
      highlightStars(selectedRating);
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
   * @param {number} count - ハイライトする星の数
   */
  function highlightStars(count) {
    stars.forEach(star => {
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
   */
  function showLowRatingWarning() {
    if (!lowRatingWarning) return;
    
    lowRatingWarning.classList.add('visible');
    setTimeout(() => {
      lowRatingWarning.classList.remove('visible');
    }, 3000);
  }
  
  /**
   * 評価を選択・設定
   * @param {number} value - 選択された評価値（1-5）
   */
  function selectRating(value) {
    selectedRating = value;
    highlightStars(value);
    
    // 対応するラジオボタンをチェック
    const radioBtn = document.getElementById('star' + value);
    if (radioBtn) radioBtn.checked = true;
    
    // UI更新
    if (scoreValue) scoreValue.textContent = value;
    if (ratingScore) ratingScore.classList.add('visible');
    if (lowRatingWarning) lowRatingWarning.classList.remove('visible');
    if (question2) question2.classList.add('completed');
    
    // エラー状態の解除
    if (question2) question2.classList.remove('error');
    if (ratingValidation) ratingValidation.classList.remove('visible');
    if (globalValidation) globalValidation.classList.remove('visible');
  }
}

// グローバルスコープに公開
window.initStarRating = initStarRating;
