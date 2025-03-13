/**
 * QUARTERアンケート - スクロール位置監視機能
 */
(function() {
  // ページ読み込み完了時に初期化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollMonitor);
  } else {
    // すでに読み込まれている場合は直接実行
    initScrollMonitor();
  }
  
  /**
   * スクロール位置監視機能の初期化
   */
  function initScrollMonitor() {
    console.log('スクロール位置監視機能の初期化');
    
    // 監視対象のセクションを特定
    const sections = {
      store: document.querySelectorAll('[data-section="store"]'),
      rating: document.querySelectorAll('[data-section="rating"]'),
      info: document.querySelectorAll('[data-section="info"]'),
      service: document.querySelectorAll('[data-section="service"]'),
      feedback: document.querySelectorAll('[data-section="feedback"]')
    };
    
    // スクロールイベントのスロットリング（パフォーマンス対策）
    let isScrolling = false;
    
    window.addEventListener('scroll', function() {
      if (!isScrolling) {
        isScrolling = true;
        
        // 少し遅らせて処理（パフォーマンス向上）
        setTimeout(function() {
          updateActiveNavItem();
          isScrolling = false;
        }, 100);
      }
    });
    
    // 初期状態の更新（ページ読み込み時）
    setTimeout(updateActiveNavItem, 500);
    
    /**
     * スクロール位置に基づいてアクティブなナビゲーション項目を更新
     */
    function updateActiveNavItem() {
      const viewportHeight = window.innerHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      let mostVisibleSection = '';
      let maxVisibility = 0;
      
      // 各セクションの可視性をチェック
      for (const section in sections) {
        const elements = sections[section];
        if (elements.length === 0) continue;
        
        let sectionVisibility = 0;
        
        // セクション内の各要素の可視性を計算
        elements.forEach(element => {
          const rect = element.getBoundingClientRect();
          
          // 画面内に表示されている要素のみを考慮
          if (rect.top < viewportHeight && rect.bottom > 0) {
            // 要素の可視部分の高さを計算
            const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
            // 要素の可視率を計算（0〜1）
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
      
      console.log('現在のセクション:', mostVisibleSection, '(可視性:', maxVisibility.toFixed(2), ')');
      
      // 対応するナビゲーション項目をアクティブ化
      if (mostVisibleSection) {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
          const itemSection = item.getAttribute('data-section');
          if (itemSection === mostVisibleSection) {
            if (!item.classList.contains('active')) {
              console.log('ナビアイテム切り替え:', itemSection);
            }
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    }
  }
})();
