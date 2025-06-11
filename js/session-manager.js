class SessionManager {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.submissions = this.loadSubmissions();
    this.maxSubmissionsPerHour = 3;
    this.blockDurationMs = 60 * 60 * 1000; // 1時間
  }

  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  loadSubmissions() {
    try {
      const stored = localStorage.getItem('survey_submissions');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load submission history:', e);
      return [];
    }
  }

  saveSubmissions() {
    try {
      localStorage.setItem('survey_submissions', JSON.stringify(this.submissions));
    } catch (e) {
      console.error('Failed to save submission history:', e);
    }
  }

  cleanOldSubmissions() {
    const now = Date.now();
    this.submissions = this.submissions.filter(timestamp => 
      now - timestamp < this.blockDurationMs
    );
    this.saveSubmissions();
  }

  canSubmit() {
    this.cleanOldSubmissions();
    const now = Date.now();
    
    // 直近1分以内の送信をチェック（重複送信防止）
    const recentSubmission = this.submissions.find(timestamp => 
      now - timestamp < 60000
    );
    
    if (recentSubmission) {
      return {
        allowed: false,
        reason: 'duplicate_submission',
        waitTime: Math.ceil((60000 - (now - recentSubmission)) / 1000)
      };
    }
    
    // 1時間以内の送信回数をチェック（レート制限）
    const hourlySubmissions = this.submissions.filter(timestamp => 
      now - timestamp < this.blockDurationMs
    );
    
    if (hourlySubmissions.length >= this.maxSubmissionsPerHour) {
      const oldestSubmission = Math.min(...hourlySubmissions);
      return {
        allowed: false,
        reason: 'rate_limit',
        waitTime: Math.ceil((this.blockDurationMs - (now - oldestSubmission)) / 1000)
      };
    }
    
    return { allowed: true };
  }

  recordSubmission() {
    const now = Date.now();
    this.submissions.push(now);
    this.saveSubmissions();
  }

  getSessionInfo() {
    this.cleanOldSubmissions();
    return {
      sessionId: this.sessionId,
      submissionCount: this.submissions.length,
      lastSubmission: this.submissions.length > 0 ? 
        new Date(Math.max(...this.submissions)) : null
    };
  }

  reset() {
    this.submissions = [];
    this.saveSubmissions();
    this.sessionId = this.generateSessionId();
  }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SessionManager;
}