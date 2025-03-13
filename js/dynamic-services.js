/**
 * 動的サービスメニュー制御
 * 選択された店舗に基づいて施術メニューを切り替えます
 * 
 * このファイルは店舗選択ラジオボタンの変更を監視し、
 * iL店舗が選択された場合にのみ特別なメニュー選択肢を表示します。
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
 * 選択された店舗に応じてサービスメニューを更新
 */
function updateServiceOptions() {
  // 選択されている店舗を取得
  const selectedStore = document.querySelector('input[name="store"]:checked');
  
  // サービスメニューのコンテナ
  const standardServices = document.getElementById('standard-services');
  const ilServices = document.getElementById('il-services');
  
  if (!standardServices || !ilServices) {
    console.warn('サービスメニューコンテナが見つかりません');
    return;
  }
  
  // 選択に応じて表示を切り替え
  if (selectedStore && selectedStore.value === 'iL') {
    // iLが選択された場合
    console.log('iL用メニューを表示');
    standardServices.style.display = 'none';
    ilServices.style.display = 'block';
    
    // 標準メニューのチェックを解除
    uncheckAll(standardServices);
  } else {
    // iL以外が選択された場合または未選択の場合
    console.log('標準メニューを表示');
    standardServices.style.display = 'block';
    ilServices.style.display = 'none';
    
    // iLメニューのチェックを解除
    uncheckAll(ilServices);
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
