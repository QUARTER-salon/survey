/**
 * QUARTERアンケート - メインJavaScript
 * アプリケーション全体の初期化とグローバル機能
 * 
 * このファイルはアプリケーション全体を統括する役割を持ち、
 * ページの読み込み時に最初に実行される初期化処理や、
 * 複数の場所から呼び出される共通機能を定義しています。
 */

// DOM読み込み完了時の処理
// DOMContentLoadedイベントは、HTMLの解析が完了した時点で発火します（画像などのリソース読み込み完了前）
// これにより、ユーザーが画面を見られるようになった早い段階で初期化処理を開始できます
document.addEventListener('DOMContentLoaded', function() {
  // 開発・デバッグ用のログ出力
  console.log('アプリケーション初期化開始');
  
  // 各モジュールが正しく読み込まれたか確認
  // 依存ファイル（config.jsなど）が正しく読み込まれているか確認する安全対策
  checkDependencies();
  
  // 警告メッセージの非表示処理
  // Google Apps Scriptの埋め込み時に表示される不要な警告を隠す処理をセットアップ
  setupWarningHider();
});

/**
 * 依存関係をチェック
 * 必要なモジュール（設定ファイルなど）が正しく読み込まれているか確認します
 * エラーが発生した場合でもサイトが完全に機能停止しないよう、try-catchで例外を捕捉しています
 */
function checkDependencies() {
  // CONFIGの存在確認
  // try-catchブロックで囲むことで、エラーが発生しても処理が止まらないようにします
  try {
    if (typeof CONFIG !== 'undefined') {
      // 正常に読み込まれている場合
      console.log('CONFIG読み込み成功');
    } else {
      // 変数は存在するが初期化されていない場合
      console.warn('CONFIG変数が見つかりません');
      // warnレベルでログ出力（errorより軽度だが、通常のlogより目立つ）
    }
  } catch (e) {
    // 変数が存在しない場合などのエラー
    console.error('CONFIG読み込みエラー:', e);
    // エラー情報を詳細に出力（デバッグ用）
  }
}

/**
 * ページが完全に読み込まれた後に実行される警告非表示
 * window.loadイベントは、ページ上のすべてのリソース（画像、CSS、iframeなど）の
 * 読み込みが完了した時点で発火します
 */
function setupWarningHider() {
  // loadイベントリスナーを設定
  window.addEventListener('load', function() {
    // 少し遅延させて実行（100ミリ秒 = 0.1秒）
    // これにより、警告メッセージが表示された後に非表示にする時間差を作ります
    setTimeout(function() {
      hideAppsScriptWarnings();
    }, 100);
  });
}

/**
 * Apps Script関連の警告を非表示
 * Google Apps Scriptをウェブアプリとして埋め込む際に表示される
 * 不要な警告メッセージや認証UIを非表示にします
 */
function hideAppsScriptWarnings() {
  // 非表示にする要素のセレクタ
  // querySelectorAllで複数の要素を一度に取得
  const warnings = document.querySelectorAll(
    '.apps-script-warning, div[role="alert"], .script-application-auth-container, .script-application-auth'
  );
  
  // 取得した各要素に対して処理
  warnings.forEach(function(el) {
    // 要素が存在する場合のみ非表示に設定
    if (el) el.style.display = 'none';
  });
}

/**
 * コメントをクリップボードにコピー
 * ユーザーがコピーボタンをクリックした時に実行される関数
 * 
 * windowオブジェクトのプロパティとして定義することで、HTML内のonclick属性から
 * 直接呼び出せるグローバル関数になります
 */
window.copyComment = function() {
  // コピー対象のテキストエリア要素を取得
  const commentElement = document.getElementById('comment-to-copy');
  if (!commentElement) return; // 要素が存在しない場合は何もせずに終了
  
  // テキストを選択状態にする（視覚的フィードバック用）
  commentElement.select();
  
  try {
    // モダンブラウザ向け: Clipboard API（新しいクリップボードAPI）
    if (navigator.clipboard) {
      // 非同期でクリップボードにテキストを書き込み
      navigator.clipboard.writeText(commentElement.value)
        .then(function() {
          // 成功時の処理
          updateCopyButtonState(true);
        })
        .catch(function(err) {
          // Clipboard APIが失敗した場合（権限がない場合など）
          console.error('コピーエラー:', err);
          // 従来の方法にフォールバック
          fallbackCopy();
        });
    } else {
      // Clipboard APIが使えないブラウザ向け
      fallbackCopy();
    }
  } catch (e) {
    // 予期せぬエラーの場合
    console.error('クリップボードエラー:', e);
    fallbackCopy();
  }
};

/**
 * 古いブラウザ用のコピー機能フォールバック
 * Clipboard APIに対応していない古いブラウザ向けの代替手段
 * document.execCommand('copy')は非推奨ですが、互換性のために残されています
 */
function fallbackCopy() {
  try {
    // 古い方法でコピー実行（選択済みのテキストをコピー）
    document.execCommand('copy');
    // 成功した場合
    updateCopyButtonState(true);
  } catch (fallbackErr) {
    // 古い方法も失敗した場合
    alert('コピーできませんでした。お手数ですが手動でコピーしてください。');
    console.error('フォールバックコピーエラー:', fallbackErr);
  }
}

/**
 * コピーボタンの状態を更新
 * コピー操作の結果に応じてボタンの見た目を変更し、ユーザーにフィードバックを提供します
 * 
 * @param {boolean} success - コピー成功したかどうか（true: 成功、false: 失敗）
 */
function updateCopyButtonState(success) {
  // コピーボタン要素を取得
  const copyButton = document.getElementById('copy-button');
  if (!copyButton) return; // ボタンが存在しない場合は何もせずに終了
  
  // 元のテキストを保存（後で戻すため）
  const originalText = copyButton.textContent;
  
  // 結果に応じてボタンのテキストを変更
  copyButton.textContent = success ? 'コピーしました！' : 'コピーできませんでした';
  // 結果に応じてボタンの背景色を変更（CSS変数を使用）
  copyButton.style.backgroundColor = success ? 'var(--secondary-color)' : 'var(--danger-color)';
  // テキスト色を白に設定
  copyButton.style.color = 'white';
  
  // 2秒後（2000ミリ秒）に元の状態に戻す
  setTimeout(function() {
    // ボタンのテキストを元に戻す
    copyButton.textContent = originalText;
    // ボタンの背景色を元（白）に戻す
    copyButton.style.backgroundColor = 'white';
    // テキスト色をCSSの設定に戻す（''を設定することでスタイル属性を削除）
    copyButton.style.color = '';
  }, 2000);
}

/**
 * Googleマップへリダイレクト
 * レビューリダイレクトボタンがクリックされた時に実行される関数
 * 選択された店舗に対応するGoogleマップのレビューページを新しいタブで開きます
 * 
 * windowオブジェクトのプロパティとして定義することで、HTML内のonclick属性から
 * 直接呼び出せるグローバル関数になります
 */
window.redirectToGoogleMaps = function() {
  try {
    // 選択された店舗のラジオボタンを取得
    const selectedStore = document.querySelector('input[name="store"]:checked');
    // 店舗名を取得（選択されていない場合はデフォルトで'QUARTER'を使用）
    const storeName = selectedStore ? selectedStore.value : 'QUARTER';
    
    // 設定からURLを取得して新しいタブで開く
    if (typeof CONFIG !== 'undefined' && CONFIG.STORE_REVIEW_URLS) {
      // 選択された店舗のURL、またはデフォルトURLを取得
      const url = CONFIG.STORE_REVIEW_URLS[storeName] || CONFIG.STORE_REVIEW_URLS['QUARTER'];
      // 新しいタブでURLを開く
      window.open(url, '_blank');
    } else {
      // 設定が正しく読み込まれていない場合のエラー
      console.error('STORE_REVIEW_URLS が定義されていません');
    }
  } catch (e) {
    // 予期せぬエラーの場合
    console.error('リダイレクトエラー:', e);
  }
};
