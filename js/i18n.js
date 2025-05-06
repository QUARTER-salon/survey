(function () {
    // 1. i18next 初期化
    i18next
      .use(i18nextBrowserLanguageDetector)
      .init({
        fallbackLng: 'ja',
        debug: false,
        detection: {               // ←?lang=en でも拾えるよう追加
                  lookupQuerystring: 'lng',
                  // 既定の 'lng' も並行して効く
                },
        resources: {} // 後でロード
      })
      .then(loadResourcesAndRender);
  
    // 2. 翻訳 JSON をフェッチ
    async function loadResourcesAndRender() {
      const lngs = ['ja', 'en', 'zh'];
      await Promise.all(
        lngs.map(async lng => {
          const res = await fetch(`locales/${lng}/translation.json`);
          const json = await res.json();
          i18next.addResources(lng, 'translation', json);
        })
      );
      renderContent();
    }
  
    // 3. DOM 反映（修正版）
    function renderContent() {
      // 通常要素の翻訳
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const opts = el.dataset.i18nOptions ? JSON.parse(el.dataset.i18nOptions) : {};
        
        // summary要素には特別な処理を適用
        if (el.tagName.toLowerCase() === 'summary') {
          el.textContent = i18next.t(key, opts);
        } else {
          el.innerHTML = i18next.t(key, opts);
        }
      });
      
      // input要素のplaceholder属性などにも対応
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.setAttribute('placeholder', i18next.t(key));
      });
      
      // バリデーションメッセージなど JS 生成文字列も更新
      if (window.updateValidationMessages) window.updateValidationMessages();
      
      // メニュー整形も翻訳後に実行
      if (window.updateMenuFormatting) window.updateMenuFormatting();
    }
  
    // 言語リンクの状態を更新する関数
    function updateLanguageLinks(selectedLang) {
      document.querySelectorAll('.lang-link').forEach(link => {
        if (link.getAttribute('data-lang') === selectedLang) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  
    // 4. 言語変更ハンドラ（セレクタ用）
    window.changeLang = function (lng) {
      i18next.changeLanguage(lng).then(() => {
        renderContent();
        updateLanguageLinks(lng);
      });
      localStorage.setItem('lang', lng);
    };
    
    // 5. ページ読み込み時に言語セレクタの値を設定
    document.addEventListener('DOMContentLoaded', () => {
      // 言語セレクタがあれば現在の言語を設定
      const sel = document.getElementById('langSelector');
      if (sel) {
        const cur = i18next.language || 'ja';
        sel.value = cur;
      }
      
      // 言語リンクがあれば現在の言語に合わせてハイライト
      const currentLang = i18next.language || 'ja';
      updateLanguageLinks(currentLang);
    });
})();