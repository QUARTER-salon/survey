/**
 * QUARTERアンケート - デスクトップ対応ナビゲーション機能
 * 
 * このファイルはアンケートフォーム内の異なるセクション間を移動するための
 * ナビゲーション機能を提供します。デスクトップとモバイルデバイスの両方に対応するよう設計されています。
 */

// 即時実行関数式（IIFE）- 外部スコープを汚染せずに変数や関数をカプセル化します
// この関数はコードが読み込まれるとすぐに自動的に実行されます
(function() {
  // イベントリスナー設定（モバイルとデスクトップ両方に対応）
  // document.readyStateが'loading'の場合はまだDOMの読み込みが完了していないので
  // DOMContentLoadedイベントを待ってから初期化関数を実行します
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCrossPlatformNavigation);
  } else {
    // すでにDOMの読み込みが完了している場合は直ちに初期化関数を実行します
    initCrossPlatformNavigation();
  }
  
  /**
   * クロスプラットフォームナビゲーションを初期化する関数
   * デスクトップとモバイル両方に対応したナビゲーション機能をセットアップします
   */
  function initCrossPlatformNavigation() {
    console.log('クロスプラットフォームナビゲーション初期化');
    
    // 通常のクリックイベントとタッチイベントの両方を設定
    // querySelectorAllでクラス名'nav-item'を持つすべての要素を取得し、それぞれに対して処理を実行
    document.querySelectorAll('.nav-item').forEach(navItem => {
      // デスクトップ用（クリック）- マウスでのクリックイベントに対応
      navItem.addEventListener('click', handleNavigation);
      
      // モバイル用（タッチ）- スマートフォンやタブレットのタッチイベントに対応
      // touchendはタッチが終了した時点（指が画面から離れた時）に発火します
      navItem.addEventListener('touchend', handleNavigation);
    });
    
    /**
     * ナビゲーションイベントを処理する関数
     * ナビゲーションアイテムがクリックまたはタップされた時に呼び出されます
     * 
     * @param {Event} e - イベントオブジェクト（クリックまたはタッチイベント）
     */
    function handleNavigation(e) {
      // イベントの標準動作を防止（リンクのクリックなど）
      e.preventDefault();
      // イベントの親要素への伝播（バブリング）を停止
      if (e.stopPropagation) e.stopPropagation();
      
      // thisはイベントが発生した要素（navItem）を参照します
      const navItem = this;
      // data-section属性から対象のセクション名を取得
      const section = navItem.getAttribute('data-section');
      console.log('ナビゲーションイベント:', e.type, section);
      
      // デスクトップに特化したターゲット要素の検索
      // スクロール先になる対象要素を探します
      let targetElement = null;
      
      // 方法1: data-section属性で検索
      // 例：<div class="question" data-section="store">...</div>
      targetElement = document.querySelector(`.question[data-section="${section}"]`);
      
      // 方法2: セクションの名前に基づいた検索（フォールバック）
      // 方法1で見つからなかった場合、IDで検索します
      // 例：<div id="question-store">...</div>
      if (!targetElement) {
        targetElement = document.querySelector(`#question-${section}`);
      }
      
      // 方法3: クラス名でのフォールバック
      // 方法1と2で見つからなかった場合、クラス名で検索します
      // 例：<div class="store-section">...</div>
      if (!targetElement) {
        targetElement = document.querySelector(`.${section}-section`);
      }
      
      // 対象要素が見つかった場合の処理
      if (targetElement) {
        // アクティブ状態の更新
        // すべてのナビアイテムからactiveクラスを削除
        document.querySelectorAll('.nav-item').forEach(item => {
          item.classList.remove('active');
        });
        // クリックされたナビアイテムにactiveクラスを追加
        navItem.classList.add('active');
        
        // デスクトップ用の強化されたスクロール処理
        // 対象要素の上端から画面上端までの距離（ビューポート内での位置）を取得
        const targetPosition = targetElement.getBoundingClientRect().top;
        // 現在のスクロール位置を考慮して、絶対的な位置を計算
        // 80pxは上部のナビゲーションバーなどの高さを考慮したオフセット
        const offsetPosition = targetPosition + window.pageYOffset - 80;
        
        // 複数のスクロール方法を試行
        // 異なるブラウザの互換性に対応するため複数の方法を実装
        try {
          // 1. スムーズスクロール API（最新ブラウザ）
          // 最新のブラウザはこの方法でスムーズにスクロールできます
          window.scrollTo({
            top: offsetPosition,    // スクロール先の縦位置
            behavior: 'smooth'      // スムーズにアニメーションさせる
          });
          
          // 2. jQuery風のアニメーション（互換性のため）
          // スムーズスクロールAPIに対応していない古いブラウザ向けの代替手段
          setTimeout(function() {
            // 現在のスクロール位置を取得
            const startPosition = window.pageYOffset;
            // 移動する距離を計算
            const distance = offsetPosition - startPosition;
            // アニメーション時間（ミリ秒）
            const duration = 500;
            // アニメーション開始時間（初期値はnull）
            let start = null;
            
            /**
             * アニメーションの各フレームを処理する関数
             * requestAnimationFrameによって呼び出されます
             * 
             * @param {DOMHighResTimeStamp} timestamp - 現在のフレームのタイムスタンプ
             */
            function step(timestamp) {
              // 最初のフレームでアニメーション開始時間を記録
              if (!start) start = timestamp;
              // アニメーション開始からの経過時間を計算
              const progress = timestamp - start;
              // 進捗率を0～1の範囲で計算（1を超えないようにする）
              const percent = Math.min(progress / duration, 1);
              // イージング関数：始まりと終わりがゆっくりで、途中が速い動き
              // これによりより自然なアニメーションになります
              const easing = percent < 0.5 ? 2 * percent * percent : -1 + (4 - 2 * percent) * percent;
              
              // 計算した位置にスクロール
              window.scrollTo(0, startPosition + distance * easing);
              
              // アニメーション時間内なら次のフレームをリクエスト
              if (progress < duration) {
                window.requestAnimationFrame(step);
              }
            }
            
            // アニメーションの最初のフレームをリクエスト
            window.requestAnimationFrame(step);
          }, 10); // 10ミリ秒後に実行（少しの遅延を入れて前のスクロール処理と競合を避ける）
          
          // 3. フォールバック：即時スクロール
          // 上記の方法が両方とも失敗した場合、または思った通りに動かない場合のための措置
          setTimeout(function() {
            // 現在位置と目標位置の差が100px以上ある場合のみ実行
            // （これによりアニメーションが正常に動作している場合は邪魔をしない）
            if (Math.abs(window.pageYOffset - offsetPosition) > 100) {
              // 即座に目標位置にジャンプ
              window.scrollTo(0, offsetPosition);
            }
          }, 600); // 600ミリ秒後に実行（アニメーションが完了したはずの時間）
        } catch (error) {
          // どのスクロール方法も失敗した場合のエラーハンドリング
          console.error('スクロールエラー:', error);
          // 最終手段：直接スクロール（アニメーションなし）
          window.scrollTo(0, offsetPosition);
        }
        
        console.log('スクロール実行:', offsetPosition);
      } else {
        // 対象セクションが見つからなかった場合のエラーメッセージ
        console.error('対象セクションが見つかりません:', section);
        // デバッグ情報：現在ページ上に存在するすべてのdata-section属性値を表示
        console.log('利用可能なセクション:',
          Array.from(document.querySelectorAll('[data-section]'))
            .map(el => el.getAttribute('data-section'))
        );
      }
      
      return false; // イベント伝播を停止（さらなる安全対策）
    }
  }
  
  // グローバルスコープに公開
  // 他のJavaScriptファイルからもこの関数を呼び出せるようにするため
  // window（グローバルオブジェクト）のプロパティとして関数を追加
  window.initCrossPlatformNavigation = initCrossPlatformNavigation;
})(); // 即時実行関数の終了と実行
