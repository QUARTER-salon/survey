/**
 * HTTPS強制リダイレクト
 * HTTPアクセスを自動的にHTTPSにリダイレクトします
 * ローカル開発環境（localhost, 127.0.0.1）では動作しません
 */
(function() {
  'use strict';
  
  if (location.protocol !== 'https:' && 
      location.hostname !== 'localhost' && 
      location.hostname !== '127.0.0.1') {
    location.replace('https:' + window.location.href.substring(window.location.protocol.length));
  }
})();