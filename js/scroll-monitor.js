/**
 * QUARTERアンケート - スクロール位置監視機能
 * 
 * このファイルはユーザーのスクロール位置を監視し、現在表示されているセクションに
 * 基づいてナビゲーションメニューの表示を自動的に更新する機能を提供します。
 * これにより、ユーザーがスクロールしているときに、どのセクションを見ているのかが
 * ナビゲーションメニューに反映され、使いやすさが向上します。
 */

// 即時実行関数式（IIFE）- このファイルのコードをカプセル化し、グローバルスコープを汚染しないようにします
(function() {
  // ページ読み込み完了時に初期化
  // document.readyStateで現在のDOMの読み込み状態を確認します
  if (document.readyState === 'loading') {
    // まだDOM読み込み中の場合は、読み込み完了イベントを待ちます
    document.addEventListener('DOMContentLoaded', initScrollMonitor);
  } else {
    // すでに読み込まれている場合は直接実行
    // （遅いタイミングでこのスクリプトが実行された場合の対応）
    initScrollMonitor();
  }
  
  /**
   * スクロール位置監視機能の初期化
   * ページ内のセクションを特定し、スクロールイベントのリスナーを設定します
   */
  function initScrollMonitor() {
    console.log('スクロール位置監視機能の初期化');
    
    // 監視対象のセクションを特定
    // data-section属性を使って、各種類のセクションに属する要素をすべて収集します
    const sections = {
      store: document.querySelectorAll('[data-section="store"]'),    // 店舗選択セクション
      rating: document.querySelectorAll('[data-section="rating"]'),  // 評価セクション
      info: document.querySelectorAll('[data-section="info"]'),      // 情報入力セクション
      service: document.querySelectorAll('[data-section="service"]'), // サービス評価セクション
      feedback: document.querySelectorAll('[data-section="feedback"]') // 感想セクション
    };
    
    // スクロールイベントのスロットリング（パフォーマンス対策）
    // スクロールイベントは非常に頻繁に発生するため、処理を間引く必要があります
    let isScrolling = false; // 現在処理中かどうかを示すフラグ
    
    // windowのスクロールイベントにリスナーを設定
    window.addEventListener('scroll', function() {
      // 処理中でなければ実行
      if (!isScrolling) {
        isScrolling = true; // 処理中フラグをオン
        
        // 少し遅らせて処理（パフォーマンス向上）
        // setTimeoutを使うことで、連続したスクロールイベントをまとめて1回の処理にします
        setTimeout(function() {
          updateActiveNavItem(); // ナビゲーションアイテムの更新処理を実行
          isScrolling = false;   // 処理中フラグをオフに戻す
        }, 100); // 100ミリ秒（0.1秒）の遅延
      }
    });
    
    // 初期状態の更新（ページ読み込み時）
    // ページ読み込み直後にもナビゲーションの状態を更新するために遅延実行
    setTimeout(updateActiveNavItem, 500); // 500ミリ秒（0.5秒）後に実行
    
    /**
     * スクロール位置に基づいてアクティブなナビゲーション項目を更新
     * 現在最も画面に表示されているセクションを計算し、対応するナビアイテムをハイライトします
     */
    function updateActiveNavItem() {
      // ビューポート（画面表示領域）の高さを取得
      const viewportHeight = window.innerHeight;
      // 現在のスクロール位置を取得（ブラウザ互換性のため複数の方法を試みる）
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      // 最も表示されているセクションを追跡する変数
      let mostVisibleSection = ''; // 最も可視性の高いセクション名
      let maxVisibility = 0;      // 最大の可視性値（0〜1の範囲）
      
      // 各セクションの可視性をチェック
      for (const section in sections) {
        const elements = sections[section]; // セクションに属する要素のリスト
        if (elements.length === 0) continue; // 要素がない場合はスキップ
        
        let sectionVisibility = 0; // このセクションの合計可視性
        
        // セクション内の各要素の可視性を計算
        elements.forEach(element => {
          // 要素の位置と大きさの情報を取得
          const rect = element.getBoundingClientRect();
          
          // 画面内に表示されている要素のみを考慮
          // rect.topが画面高さ未満かつrect.bottomが0より大きい場合、要素の一部が画面内に表示されています
          if (rect.top < viewportHeight && rect.bottom > 0) {
            // 要素の可視部分の高さを計算
            // 画面内に表示されている部分だけを考慮します
            const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
            // 要素の可視率を計算（0〜1）
            // 要素全体に対して、どれだけの割合が表示されているかを計算
            const elementVisibility = visibleHeight / rect.height;
            // セクション全体の可視性に加算
            sectionVisibility += elementVisibility;
          }
        });
        
        // 最も可視性の高いセクションを特定
        if (sectionVisibility > maxVisibility) {
          maxVisibility = sectionVisibility;
          mostVisibleSection = section;
        }
      }
      
      // デバッグ用ログ出力
      console.log('現在のセクション:', mostVisibleSection, '(可視性:', maxVisibility.toFixed(2), ')');
      
      // 対応するナビゲーション項目をアクティブ化
      if (mostVisibleSection) { // 可視セクションが見つかった場合
        // すべてのナビゲーションアイテムを取得
        const navItems = document.querySelectorAll('.nav-item');
        
        // 各ナビアイテムに対して処理
        navItems.forEach(item => {
          // ナビアイテムのdata-section属性を取得
          const itemSection = item.getAttribute('data-section');
          // 最も可視性の高いセクションと一致するかどうかチェック
          if (itemSection === mostVisibleSection) {
            // すでにactiveクラスが付いていない場合のみログを出力（状態変化の追跡）
            if (!item.classList.contains('active')) {
              console.log('ナビアイテム切り替え:', itemSection);
            }
            // アクティブクラスを追加
            item.classList.add('active');
          } else {
            // 一致しない場合はactiveクラスを削除
            item.classList.remove('active');
          }
        });
      }
    }
  }
})(); // 即時実行関数の終了と実行
