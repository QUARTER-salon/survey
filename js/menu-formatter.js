/**
 * QUARTERアンケート - メニュー表示改善スクリプト
 * メニュー項目のテキストを解析し、タイトルと説明を構造化します。
 */

// DOM読み込み完了後に実行
document.addEventListener('DOMContentLoaded', function() {
    // i18nextの読み込みを確認
    if (window.i18next) {
      // 初期化後とページ言語変更時に実行
      i18next.on('initialized', initMenuFormatter);
      i18next.on('languageChanged', initMenuFormatter);
    } else {
      // i18nextがない場合は直接実行
      setTimeout(initMenuFormatter, 500);
    }
  });
  
  /**
   * メニューフォーマッターの初期化
   */
  function initMenuFormatter() {
    // 選択肢ラベルの整形を実行
    formatLabels();
    
    // DOM変更を監視して動的な変更に対応
    setupMutationObserver();
  }
  
  /**
   * 全てのメニューラベルを整形する
   */
  function formatLabels() {
    // 対象のセレクター - アンケート内の全ラベル
    const selectors = [
      '#question14 .options label',  // 追加サービス
      '.collapsible-group .options label',  // アコーディオン内ラベル
      '.options label'  // その他一般的なラベル
    ];
    
    // 各セレクターに対して処理を実行
    selectors.forEach(selector => {
      const labels = document.querySelectorAll(selector);
      
      labels.forEach(label => {
        formatSingleLabel(label);
      });
    });
  }
  
  /**
   * 単一のラベルを整形する
   * @param {HTMLElement} label - 整形対象のラベル要素
   */
  function formatSingleLabel(label) {
    // 既に処理済みかチェック
    if (label.querySelector('.menu-title') || label.querySelector('.menu-description')) {
      return; // 処理済みならスキップ
    }
    
    // ラベルのテキストを取得
    const text = label.textContent.trim();
    
    // 各種分離パターン - 日本語に適した正規表現
    const patterns = [
      { regex: /(.*?)\s*\((.+?)\)/, titleIndex: 1, descIndex: 2 },  // 半角括弧パターン（英語）
      { regex: /(.*?)（(.+?)）/, titleIndex: 1, descIndex: 2 },  // 括弧パターン（日本語）
      { regex: /(.*?)【(.+?)】/, titleIndex: 1, descIndex: 2 },  // 角括弧パターン
      { regex: /(.*?)\s*[:：]\s*(.+)/, titleIndex: 1, descIndex: 2 },  // コロンパターン
      { regex: /(.*?)・(.+)/, titleIndex: 1, descIndex: 2 },  // 中黒パターン
      { regex: /(.*?)\s+-\s+(.+)/, titleIndex: 1, descIndex: 2 }  // ハイフンパターン
    ];
    
    // テキスト分割用の変数
    let titleText = text;
    let descText = '';
    
    // パターンマッチング
    for (const pattern of patterns) {
      if (pattern.regex.test(text)) {
        const match = text.match(pattern.regex);
        titleText = match[pattern.titleIndex].trim();
        descText = match[pattern.descIndex].trim();
        break; // 最初にマッチしたパターンで処理
      }
    }
    
    // スペースでの分割（テキストが長い場合のみ）
    if (descText === '' && text.length > 15) {
      const spacePattern = /(.*?) (.+)/;
      if (spacePattern.test(text)) {
        const match = text.match(spacePattern);
        // 説明部分が十分に長い場合のみ適用
        if (match[2].length > 10) {
          titleText = match[1].trim();
          descText = match[2].trim();
        }
      }
    }
    
    // 元のテキストを保存
    const originalText = label.textContent;
    
    // 既存のHTML内容をクリア
    label.innerHTML = '';
    
    // タイトル要素を追加
    const titleSpan = document.createElement('span');
    titleSpan.className = 'menu-title';
    titleSpan.textContent = titleText;
    label.appendChild(titleSpan);
    
    // 説明テキストがある場合は説明要素も追加
    if (descText) {
      const descSpan = document.createElement('span');
      descSpan.className = 'menu-description';
      descSpan.textContent = descText;
      label.appendChild(descSpan);
    }
    
    // アクセシビリティのために元のテキストを維持
    label.setAttribute('aria-label', originalText);
  }
  
  /**
   * DOM変更監視の設定
   * 動的なコンテンツ変更に対応するためのMutationObserver
   */
  function setupMutationObserver() {
    // 監視対象のコンテナ
    const containers = [
      document.getElementById('question14'),
      document.querySelector('.collapsible-group'),
      document.querySelector('form')
    ];
    
    // コンテナごとに監視を設定
    containers.forEach(container => {
      if (!container) return;
      
      // オブザーバー設定
      const config = { 
        childList: true,  // 子要素の変更を監視
        subtree: true,    // すべての子孫要素も監視
        characterData: true // テキスト変更も監視
      };
      
      // 監視コールバック
      const callback = function(mutationsList, observer) {
        let needsUpdate = false;
        
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            needsUpdate = true;
            break;
          }
        }
        
        if (needsUpdate) {
          // DOM更新後の処理に少し遅延を入れる
          setTimeout(formatLabels, 100);
        }
      };
      
      // オブザーバーを作成して監視開始
      const observer = new MutationObserver(callback);
      observer.observe(container, config);
    });
  }
  
  /**
   * メニュー表示の手動更新関数
   * 外部から呼び出せるようにグローバルに公開
   */
  window.updateMenuFormatting = function() {
    formatLabels();
  };