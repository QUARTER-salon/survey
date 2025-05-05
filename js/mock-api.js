// js/mock-api.js
if (window.CONFIG && window.CONFIG.IS_DEV) {
    // 元の関数を保存
    window.originalSubmitFormData = window.submitFormData;
    
    // モック関数で置き換え
    window.submitFormData = function(dataObj) {
      console.log('開発モード - 送信データ:', dataObj);
      
      // モックレスポンスを返す
      setTimeout(() => {
        // 成功レスポンスをシミュレート
        const mockResponse = {success: true};
        console.log('開発モード - 応答:', mockResponse);
        
        // フォーム送信後の処理を呼び出し
        const rating = parseInt(dataObj.rating) || 3;
        if (typeof window.handleFormAfterSubmission === 'function') {
          window.handleFormAfterSubmission(rating, dataObj);
        }
      }, 500); // リアルな遅延をシミュレート
      
      return false; // 実際の送信を防止
    };
  }