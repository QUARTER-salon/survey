/**
 * QUARTERアンケート - デスクトップ対応ナビゲーション機能
 */
(function() {
  // イベントリスナー設定（モバイルとデスクトップ両方に対応）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCrossPlatformNavigation);
  } else {
    initCrossPlatformNavigation();
  }
  
  function initCrossPlatformNavigation() {
    console.log('クロスプラットフォームナビゲーション初期化');
    
    // 通常のクリックイベントとタッチイベントの両方を設定
    document.querySelectorAll('.nav-item').forEach(navItem => {
      // デスクトップ用（クリック）
      navItem.addEventListener('click', handleNavigation);
      
      // モバイル用（タッチ）
      navItem.addEventListener('touchend', handleNavigation);
    });
    
    function handleNavigation(e) {
      // イベントの標準動作を防止
      e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
      
      const navItem = this;
      const section = navItem.getAttribute('data-section');
      console.log('ナビゲーションイベント:', e.type, section);
      
      // デスクトップに特化したターゲット要素の検索
      let targetElement = null;
      
      // 方法1: data-section属性で検索
      targetElement = document.querySelector(`.question[data-section="${section}"]`);
      
      // 方法2: セクションの名前に基づいた検索（フォールバック）
      if (!targetElement) {
        targetElement = document.querySelector(`#question-${section}`);
      }
      
      // 方法3: クラス名でのフォールバック
      if (!targetElement) {
        targetElement = document.querySelector(`.${section}-section`);
      }
      
      if (targetElement) {
        // アクティブ状態の更新
        document.querySelectorAll('.nav-item').forEach(item => {
          item.classList.remove('active');
        });
        navItem.classList.add('active');
        
        // デスクトップ用の強化されたスクロール処理
        const targetPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = targetPosition + window.pageYOffset - 80;
        
        // 複数のスクロール方法を試行
        try {
          // 1. スムーズスクロール API（最新ブラウザ）
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          // 2. jQuery風のアニメーション（互換性のため）
          setTimeout(function() {
            const startPosition = window.pageYOffset;
            const distance = offsetPosition - startPosition;
            const duration = 500;
            let start = null;
            
            function step(timestamp) {
              if (!start) start = timestamp;
              const progress = timestamp - start;
              const percent = Math.min(progress / duration, 1);
              const easing = percent < 0.5 ? 2 * percent * percent : -1 + (4 - 2 * percent) * percent;
              
              window.scrollTo(0, startPosition + distance * easing);
              
              if (progress < duration) {
                window.requestAnimationFrame(step);
              }
            }
            
            window.requestAnimationFrame(step);
          }, 10);
          
          // 3. フォールバック：即時スクロール
          setTimeout(function() {
            if (Math.abs(window.pageYOffset - offsetPosition) > 100) {
              window.scrollTo(0, offsetPosition);
            }
          }, 600);
        } catch (error) {
          console.error('スクロールエラー:', error);
          // 最終手段：直接スクロール
          window.scrollTo(0, offsetPosition);
        }
        
        console.log('スクロール実行:', offsetPosition);
      } else {
        console.error('対象セクションが見つかりません:', section);
        // デバッグ情報
        console.log('利用可能なセクション:',
          Array.from(document.querySelectorAll('[data-section]'))
            .map(el => el.getAttribute('data-section'))
        );
      }
      
      return false; // イベント伝播を停止
    }
  }
  
  // グローバルスコープに公開
  window.initCrossPlatformNavigation = initCrossPlatformNavigation;
})();
