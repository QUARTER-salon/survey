/**
 * セキュリティイベントログシステム
 * 不審なアクティビティやセキュリティ関連のイベントを記録
 */

const SecurityLogger = {
  // ログレベル
  LEVELS: {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'critical'
  },

  // イベントタイプ
  EVENTS: {
    XSS_ATTEMPT: 'xss_attempt',
    INJECTION_ATTEMPT: 'injection_attempt',
    VALIDATION_FAILURE: 'validation_failure',
    EXCESSIVE_REQUESTS: 'excessive_requests',
    SUSPICIOUS_INPUT: 'suspicious_input',
    API_ERROR: 'api_error'
  },

  // ローカルストレージのキー
  STORAGE_KEY: 'security_events',
  MAX_EVENTS: 100,

  /**
   * セキュリティイベントをログに記録
   * @param {string} eventType - イベントタイプ
   * @param {string} level - ログレベル
   * @param {object} details - イベントの詳細
   */
  log(eventType, level, details) {
    const event = {
      timestamp: new Date().toISOString(),
      eventType,
      level,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href,
      language: navigator.language
    };

    // ローカルストレージに保存
    this.saveToLocalStorage(event);

    // 開発環境ではコンソールに出力
    if (this.isDevelopment()) {
      console.log('[Security Event]', event);
    }

    // 重要なイベントはサーバーに送信（プロキシ実装後に有効化）
    if (level === this.LEVELS.CRITICAL || level === this.LEVELS.ERROR) {
      this.sendToServer(event);
    }
  },

  /**
   * XSS試行を検出してログに記録
   * @param {string} input - 検証対象の入力
   * @param {string} fieldName - フィールド名
   */
  detectXSSAttempt(input, fieldName) {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<img[^>]+src[\\s]*=[\\s]*["\']javascript:/gi
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        this.log(this.EVENTS.XSS_ATTEMPT, this.LEVELS.WARNING, {
          field: fieldName,
          pattern: pattern.toString(),
          input: input.substring(0, 100) // 最初の100文字のみ記録
        });
        return true;
      }
    }
    return false;
  },

  /**
   * SQLインジェクション試行を検出
   * @param {string} input - 検証対象の入力
   * @param {string} fieldName - フィールド名
   */
  detectInjectionAttempt(input, fieldName) {
    const injectionPatterns = [
      /(\b(union|select|insert|update|delete|drop|create)\b)/gi,
      /(['";])\s*(or|and)\s*\1?\s*=/gi,
      /--\s*$/gm,
      /\/\*[\s\S]*?\*\//g
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(input)) {
        this.log(this.EVENTS.INJECTION_ATTEMPT, this.LEVELS.WARNING, {
          field: fieldName,
          pattern: pattern.toString(),
          input: input.substring(0, 100)
        });
        return true;
      }
    }
    return false;
  },

  /**
   * レート制限のチェック
   * @param {string} action - アクション名
   * @param {number} maxAttempts - 最大試行回数
   * @param {number} windowMs - 時間枠（ミリ秒）
   */
  checkRateLimit(action, maxAttempts = 5, windowMs = 60000) {
    const key = `rate_limit_${action}`;
    const now = Date.now();
    const attempts = JSON.parse(localStorage.getItem(key) || '[]');
    
    // 時間枠外の試行を削除
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      this.log(this.EVENTS.EXCESSIVE_REQUESTS, this.LEVELS.WARNING, {
        action,
        attempts: validAttempts.length,
        windowMs
      });
      return false;
    }
    
    validAttempts.push(now);
    localStorage.setItem(key, JSON.stringify(validAttempts));
    return true;
  },

  /**
   * ローカルストレージに保存
   * @param {object} event - イベントオブジェクト
   */
  saveToLocalStorage(event) {
    try {
      const events = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      events.push(event);
      
      // 最大数を超えたら古いものから削除
      if (events.length > this.MAX_EVENTS) {
        events.splice(0, events.length - this.MAX_EVENTS);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.error('Failed to save security event:', e);
    }
  },

  /**
   * サーバーに送信（プロキシ実装後に有効化）
   * @param {object} event - イベントオブジェクト
   */
  async sendToServer(event) {
    // TODO: プロキシサーバー実装後に有効化
    if (window.API_CONFIG && window.API_CONFIG.SECURITY_LOG_URL) {
      try {
        await fetch(window.API_CONFIG.SECURITY_LOG_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        });
      } catch (error) {
        console.error('Failed to send security event to server:', error);
      }
    }
  },

  /**
   * 開発環境かどうかを判定
   */
  isDevelopment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.port === '8000';
  },

  /**
   * 保存されたイベントを取得
   * @param {string} eventType - フィルタするイベントタイプ（オプション）
   */
  getEvents(eventType = null) {
    const events = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    if (eventType) {
      return events.filter(e => e.eventType === eventType);
    }
    return events;
  },

  /**
   * イベントログをクリア
   */
  clearEvents() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
};

// グローバルに公開
window.SecurityLogger = SecurityLogger;