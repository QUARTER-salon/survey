
/**
 * 動的サービスメニュー制御
 * 選択された店舗に基づいて施術メニューを切り替えます
 * 
 * このファイルは店舗選択ラジオボタンの変更を監視し、
 * iL店舗が選択された場合にのみ特別なメニュー選択肢を表示し、
 * Q14（追加希望サービス）を非表示にします。
 */

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', function() {
  initDynamicServices();
});

/**
 * 動的サービスメニュー切り替え機能の初期化
 */
function initDynamicServices() {
  console.log('動的サービスメニュー機能を初期化');
  
  // 店舗選択ラジオボタンに変更イベントリスナーを設定
  const storeRadios = document.querySelectorAll('input[name="store"]');
  
  storeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      console.log('店舗選択変更: ' + this.value);
      updateServiceOptions();
    });
  });
  
  // 初期状態のチェック（ページ読み込み時や戻る操作など、既に選択がある場合に対応）
  updateServiceOptions();
}

/**
 * 選択された店舗に応じてサービスメニューおよびQ14の表示を更新
 */
function updateServiceOptions() {
  // 選択されている店舗を取得
  const selectedStore = document.querySelector('input[name="store"]:checked');
  
  // サービスメニューのコンテナ
  const standardServices = document.getElementById('standard-services');
  const ilServices = document.getElementById('il-services');
  
  // Q14（追加希望サービス）のコンテナ
  const question14 = document.getElementById('question14');

  if (!standardServices || !ilServices) {
    console.warn('サービスメニューコンテナが見つかりません');
    // Q14のチェックは必須ではないため、見つからなくても処理は継続
  }
  if (!question14) {
    console.warn('Q14（追加希望サービス）のコンテナが見つかりません');
  }
  
  // 選択に応じて表示を切り替え
  if (selectedStore && selectedStore.value === 'iL') {
    // iLが選択された場合
    console.log('iL用メニューを表示');
    if (standardServices) standardServices.style.display = 'none';
    if (ilServices) ilServices.style.display = 'block';
    
    // 標準メニューのチェックを解除
    if (standardServices) uncheckAll(standardServices);

    // Q14を非表示にし、チェックを解除
    if (question14) {
      console.log('Q14を非表示');
      question14.style.display = 'none';
      uncheckAll(question14); // Q14内のチェックボックスも解除
    }

  } else {
    // iL以外が選択された場合または未選択の場合
    console.log('標準メニューを表示');
    if (standardServices) standardServices.style.display = 'block';
    if (ilServices) ilServices.style.display = 'none';
    
    // iLメニューのチェックを解除
    if (ilServices) uncheckAll(ilServices);

    // Q14を表示
    if (question14) {
      console.log('Q14を表示');
      question14.style.display = 'block'; // もしくは元のdisplayスタイル（通常は'block'）
    }
  }
}

/**
 * 指定されたコンテナ内のすべてのチェックボックスのチェックを解除
 * メニュー切替時に選択状態をクリアするため
 * 
 * @param {HTMLElement} container - チェックボックスを含むコンテナ要素
 */
function uncheckAll(container) {
  if (!container) return;
  
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
  });
}

// グローバルスコープに公開
window.initDynamicServices = initDynamicServices;
