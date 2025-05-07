/**
 * 星評価UI管理
 * 星による評価システムの動作を制御します
 * 
 * このファイルは星評価のインタラクティブな機能を実装し、
 * ユーザーが視覚的に星をクリック・タップして評価を選択できるようにします。
 * マウスオーバー効果や選択状態の視覚化、エラー表示なども管理します。
 */

// DOM読み込み完了後に初期化
// HTML要素が完全に読み込まれた後に星評価の機能を初期化します
document.addEventListener('DOMContentLoaded', function() {
  initStarRating();
});

/**
 * 星評価機能の初期化
 * すべての星評価関連の要素を設定し、イベントリスナーを追加します
 */
function initStarRating() {
  // DOM要素の取得
  // 必要なすべての要素を一度に取得して後で使えるようにします
  const stars = document.querySelectorAll('.star');               // すべての星要素
  const ratingScore = document.getElementById('ratingScore');      // 評価スコア表示用コンテナ
  const scoreValue = document.getElementById('scoreValue');        // 数値としての評価値表示
  const lowRatingWarning = document.getElementById('lowRatingWarning'); // 低評価警告メッセージ
  const question2 = document.getElementById('question2');          // 評価質問のコンテナ
  const ratingValidation = document.getElementById('rating-validation'); // 評価のバリデーションメッセージ
  const globalValidation = document.getElementById('global-validation'); // グローバルバリデーションメッセージ
  
  // 状態変数
  // 現在選択されている評価値（1-5、初期値は0で未選択）
  let selectedRating = 0;
  
  // 初期設定
  // 低評価警告は初期状態では非表示
  if (lowRatingWarning) {
    lowRatingWarning.style.display = 'none';
  }
  
  // 星にマウスオーバーイベントを設定
  // マウスが星の上に乗ったときのプレビュー効果
  stars.forEach(star => {
    star.addEventListener('mouseover', () => {
      // data-value属性から星の値（1-5）を取得
      const value = parseInt(star.getAttribute('data-value'));
      // その値までの星をハイライト表示
      highlightStars(value);
    });
  });
  
  // マウスアウト時に選択中の評価に戻す
  // マウスが星の領域から離れたとき、選択中の評価に表示を戻します
  const starsContainer = document.getElementById('starsContainer');
  if (starsContainer) {
    starsContainer.addEventListener('mouseout', () => {
      // 現在選択されている評価値に戻す
      highlightStars(selectedRating);
    });
  }
  
  // 星のクリックイベント
  // ユーザーが星をクリックして評価を選択したときの処理
  stars.forEach(star => {
    star.addEventListener('click', () => {
      // クリックされた星の値を取得
      const value = parseInt(star.getAttribute('data-value'));
      // その値で評価を設定
      selectRating(value);
      
      // アニメーション効果
      // クリック時に星を一瞬大きくする「パルス」アニメーション
      star.classList.add('pulse');
      // 300ミリ秒後にアニメーションクラスを削除（アニメーション完了後）
      setTimeout(() => {
        star.classList.remove('pulse');
      }, 300);
    });
    
    // タッチデバイス対応
    // スマートフォンやタブレットなどのタッチデバイス向けの処理
    star.addEventListener('touchend', e => {
      // タッチイベントのデフォルト動作（タップ後のクリックイベント等）を防止
      e.preventDefault();
      // タップされた星の値を取得
      const value = parseInt(star.getAttribute('data-value'));
      // その値で評価を設定
      selectRating(value);
    });
  });
  
  /**
   * 指定された数まで星をハイライト表示
   * 星の見た目を更新する内部ヘルパー関数
   * 
   * @param {number} count - ハイライトする星の数（1-5）
   */
  function highlightStars(count) {
    // すべての星に対して処理
    stars.forEach(star => {
      // 各星の値を取得
      const starValue = parseInt(star.getAttribute('data-value'));
      // 指定された数以下の値を持つ星には「active」クラスを追加
      if (starValue <= count) {
        star.classList.add('active');
      } else {
        // それ以外の星からは「active」クラスを削除
        star.classList.remove('active');
      }
    });
  }
  
  /**
   * 低評価警告の表示
   * 低い評価（1-2）が選択された際に注意を促す警告を表示します
   */
  function showLowRatingWarning() {
    // 警告要素が存在しない場合は処理を中断
    if (!lowRatingWarning) return;
    
    // 警告を表示するためのクラスを追加
    lowRatingWarning.classList.add('visible');
    // 3秒（3000ミリ秒）後に警告を非表示にする
    setTimeout(() => {
      lowRatingWarning.classList.remove('visible');
    }, 3000);
  }
  
  /**
   * 評価を選択・設定
   * ユーザーが選択した評価値を保存し、UI全体を更新します
   * 
   * @param {number} value - 選択された評価値（1-5）
   */
  function selectRating(value) {
    // 選択された評価値を状態変数に保存
    selectedRating = value;
    // 星の表示を更新
    highlightStars(value);
    
    // 対応するラジオボタンをチェック
    // 見えない（隠れた）ラジオボタンをフォーム送信用に設定
    const radioBtn = document.getElementById('star' + value);
    if (radioBtn) radioBtn.checked = true;
    
    // UI更新
    // 数値表示を更新
    if (scoreValue) scoreValue.textContent = value;
    // 評価スコア表示を可視化
    if (ratingScore) ratingScore.classList.add('visible');
    // 低評価警告を非表示に
    if (lowRatingWarning) lowRatingWarning.classList.remove('visible');
    // 質問を完了状態に
    if (question2) question2.classList.add('completed');
    
    // エラー状態の解除
    // 評価が選択されたのでエラー表示をクリア
    if (question2) question2.classList.remove('error');
    if (ratingValidation) ratingValidation.classList.remove('visible');
    if (globalValidation) globalValidation.classList.remove('visible');
  }
}

// グローバルスコープに公開
// 他のJSファイルからもこの関数を呼び出せるようにする
window.initStarRating = initStarRating;
