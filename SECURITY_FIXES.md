# セキュリティ対策実装ガイド

このドキュメントは、現在のセキュリティ脆弱性を修正するためのステップバイステップガイドです。

## 実装状況 (2025年6月11日更新)

✅ **実装済み**:
- XSS脆弱性の修正（innerHTML → textContent）
- 入力サニタイズ機能（sanitizeInput, escapeHtml, sanitizeFormData）
- Content Security Policy（CSP）の設定
- エラーハンドリングの改善（本番環境での情報隠蔽）
- 特定の翻訳キーのみHTML許可（thankyou.high.text3, text4）
- セキュリティログシステム（security-logger.js）
- XSS/SQLインジェクション試行の自動検出
- レート制限機能（クライアント側：1分間で3回まで）
- 開発/本番環境判定と環境別エラー表示（utils.js）
- **Google Apps Script側のセキュリティ強化**（2025年1月11日完了）
  - ドメイン制限（ALLOWED_DOMAINSによるアクセス制御）
  - サーバー側レート制限（1分間に3回まで）
  - リクエストバリデーション（必須フィールドチェック）
  - IPアドレスログ記録
  - 不正アクセスの自動検出とブロック

⚠️ **制限事項**:
- Google Apps ScriptのCORS制限により、Content-Type: text/plainを使用
- GitHub Pagesの制限により、HTTPレスポンスヘッダーは設定不可
- CSPにscript.googleusercontent.comを追加（Google Apps Scriptのリダイレクト対応）

🔧 **今後の推奨事項**:
- サーバーサイドプロキシの実装（Google Apps Script URLの隠蔽）
  - PROXY_IMPLEMENTATION.mdに実装ガイドを作成済み
  - Vercel Functionsを使用した実装を推奨
- 適切なHTTPセキュリティヘッダーの設定（プロキシ経由）
- サーバーサイドでの入力検証の実装

## プロキシ以外の高優先度セキュリティ対策 🚨

### 1. HTTPS強制リダイレクトの実装 ✅ 実装完了 (2025年6月11日)
**リスク**: 中間者攻撃、データ傍受の可能性

**実装済み**:
- index.htmlの<head>タグ内にHTTPS強制リダイレクトスクリプトを追加
- localhostと127.0.0.1を除外して開発環境での動作を保証
- HTTPアクセスは自動的にHTTPSにリダイレクトされる

```javascript
// index.htmlの<head>最上部に実装済み
<script>
  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    location.replace('https:' + window.location.href.substring(window.location.protocol.length));
  }
</script>
```

### 2. CSRF（クロスサイトリクエストフォージェリ）保護 ✅ 実装完了 (2025年6月11日)
**リスク**: 外部サイトからの不正なフォーム送信

**実装済み**:
- validation.jsにCSRFトークン生成・検証・取得関数を追加
- フォーム送信時に自動的にCSRFトークンが付与される
- トークンはセッションストレージに保存され、セッション単位で管理

```javascript
// validation.js に実装済み
function generateCSRFToken() {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem('csrfToken', token);
  return token;
}

function validateCSRFToken(token) {
  const storedToken = sessionStorage.getItem('csrfToken');
  return token === storedToken;
}

function getCSRFToken() {
  let token = sessionStorage.getItem('csrfToken');
  if (!token) {
    token = generateCSRFToken();
  }
  return token;
}

// フォーム送信時に自動的にトークンが追加される
dataObj.csrfToken = getCSRFToken();
```

### 3. 入力検証の強化 🟡
**リスク**: バッファオーバーフロー、データ整合性の問題

**実装方法**:
```javascript
// validation.js に追加
const INPUT_LIMITS = {
  name: { min: 1, max: 100 },
  email: { min: 5, max: 254 },
  feedback: { min: 0, max: 1000 },
  phone: { min: 10, max: 15 }
};

function validateInputLength(input, field) {
  const limits = INPUT_LIMITS[field];
  if (!limits) return true;
  
  const length = input.length;
  if (length < limits.min || length > limits.max) {
    throw new Error(`${field} must be between ${limits.min} and ${limits.max} characters`);
  }
  return true;
}

// 特殊文字の厳密な検証
function validateSpecialCharacters(input, field) {
  const patterns = {
    name: /^[a-zA-Z\s\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf]+$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^[\d\s\-\+\(\)]+$/
  };
  
  if (patterns[field] && !patterns[field].test(input)) {
    throw new Error(`Invalid characters in ${field}`);
  }
  return true;
}
```

### 4. CSP強化（unsafe-inlineの削除） 🟡
**リスク**: インラインスクリプトによるXSS攻撃

**実装方法**:
```html
<!-- index.html - nonceベースのCSPに変更 -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'nonce-{RANDOM_NONCE}' https://cdn.jsdelivr.net; 
               style-src 'self' 'nonce-{RANDOM_NONCE}' https://fonts.googleapis.com;">

<!-- すべてのインラインスクリプトにnonceを追加 -->
<script nonce="{RANDOM_NONCE}">
  // インラインコード
</script>
```

### 5. セッション管理の実装 🟠
**リスク**: 重複送信、データ整合性の問題

**実装方法**:
```javascript
// session-manager.js（新規作成）
class SessionManager {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.submissions = [];
  }
  
  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
  
  canSubmit() {
    const now = Date.now();
    const recentSubmission = this.submissions.find(s => now - s < 60000); // 1分以内
    return !recentSubmission;
  }
  
  recordSubmission() {
    this.submissions.push(Date.now());
    // 古い記録を削除（メモリ管理）
    this.submissions = this.submissions.filter(s => Date.now() - s < 3600000); // 1時間
  }
}
```

### 6. エラーハンドリングの完全性向上 🟠
**リスク**: 技術的詳細の漏洩、攻撃者への情報提供

**実装方法**:
```javascript
// utils.js に追加
function safeErrorHandler(error, context) {
  // 開発環境のみ詳細ログ
  if (isDevelopment()) {
    console.error(`Error in ${context}:`, error);
  } else {
    // 本番環境では汎用エラーのみ
    console.error(`Error in ${context}`);
  }
  
  // ユーザーには常に汎用メッセージ
  return i18next.t('errors.generic');
}

// ネットワークエラーの安全な処理
async function safeFetch(url, options) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response;
  } catch (error) {
    // 技術的詳細を隠す
    throw new Error('Network request failed');
  }
}
```

## 優先度: 高 🔴

### 1. Google Apps Script URLの保護 ✅ 実装完了

**現状**: config.jsにWebアプリURLが露出しているが、Google Apps Script側でセキュリティを強化済み

**実装済み**:
- ✅ .env.exampleファイルを作成
- ✅ .gitignoreに環境変数ファイルを追加
- ✅ PROXY_IMPLEMENTATION.mdに詳細な実装ガイドを作成
- ✅ **Google Apps Script側でのセキュリティ実装**（2025年6月11日）
  - スクリプトプロパティで許可ドメインを設定（ALLOWED_DOMAINS）
  - リファラーチェックによるドメイン制限
  - サーバー側レート制限（IP単位で1分間3回）
  - 不正アクセスの検出とログ記録

**推奨事項**（オプション）:
- Vercel Functionsを使用したプロキシサーバーの実装でURLを完全に隠蔽
- config.jsの更新（プロキシURLへの変更）

```javascript
// Step 2: .envファイルに追加
GOOGLE_APPS_SCRIPT_URL=your_actual_url_here
```

```javascript
// Step 3: サーバーサイドプロキシの実装 (proxy-server.js)
const express = require('express');
const app = express();
require('dotenv').config();

app.post('/api/submit-survey', async (req, res) => {
  // 認証チェック
  // リクエストのバリデーション
  // Google Apps Scriptへの転送
});
```

```javascript
// Step 4: config.jsの修正
const API_CONFIG = {
  WEBHOOK_URL: '/api/submit-survey', // プロキシエンドポイントに変更
  // ...
};
```

### 2. XSS脆弱性の修正 ✅ 実装完了

**現状の問題**: innerHTML使用による脆弱性

**実装済み**:
- ✅ すべてのinnerHTMLをtextContentに置換
- ✅ 特定の安全な翻訳キーのみホワイトリスト化
- ✅ XSS試行の自動検出機能を追加

**対策手順**:

```javascript
// Step 1: main.js (153行目付近) の修正
// 変更前:
document.getElementById(elementId).innerHTML = message;

// 変更後:
document.getElementById(elementId).textContent = message;
```

```javascript
// Step 2: i18n.js (40行目付近) の修正
// 変更前:
element.innerHTML = i18next.t(translationKey);

// 変更後:
element.textContent = i18next.t(translationKey);
```

```javascript
// Step 3: HTMLエスケープ関数の追加 (utils.js)
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
```

### 3. 入力検証の強化 ✅ 実装完了

**実装済み**:
- ✅ sanitizeInput関数に脅威検出機能を統合
- ✅ XSS/SQLインジェクションパターンの自動検出
- ✅ セキュリティイベントのログ記録
- ✅ **Google Apps Script側での検証**（2025年1月11日）
  - 必須フィールドのサーバー側チェック
  - データ型の検証
  - 入力値の範囲チェック（評価値1-5など）

**対策手順**:

```javascript
// Step 1: サニタイズ関数の追加 (validation.js)
function sanitizeInput(input) {
  // 特殊文字の除去
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

// Step 2: 各入力フィールドにサニタイズを適用
function validateAndSanitizeForm(formData) {
  const sanitizedData = {};
  for (const [key, value] of Object.entries(formData)) {
    sanitizedData[key] = sanitizeInput(value);
  }
  return sanitizedData;
}
```

```javascript
// Step 3: サーバー側検証の実装 (proxy-server.js)
function validateServerSide(data) {
  const errors = [];
  
  // 必須フィールドチェック
  if (!data.store || !['ilhair', 'ilmake', 'quarter', 'lim', 'ivil'].includes(data.store)) {
    errors.push('Invalid store');
  }
  
  // メールアドレス検証
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email');
  }
  
  // 評価値検証
  if (data.overallRating && (data.overallRating < 1 || data.overallRating > 5)) {
    errors.push('Invalid rating');
  }
  
  return errors;
}
```

## 優先度: 中 🟡

### 4. セキュリティヘッダーの実装 ✅ 部分的に実装

**対策手順**:

⚠️ **GitHub Pagesの制限**: HTTPレスポンスヘッダーを設定できないため、一部のセキュリティヘッダーは適用できません。

```html
<!-- Step 1: index.htmlのheadセクションに追加（CSPのみ有効） -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
               font-src 'self' https://fonts.gstatic.com;
               img-src 'self' data:;
               connect-src 'self' https://script.google.com;">
```

**サーバー環境で実装可能なヘッダー**:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000

```javascript
// Step 2: サーバー側でのヘッダー設定 (proxy-server.js)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

### 5. CORS設定の適切な実装 ⚠️ 制限事項あり

**現状の問題**: text/plainでCORSを回避

**対策手順**:

⚠️ **重要な制限**: Google Apps ScriptはCORSプリフライトリクエストをサポートしていないため、
Content-Typeをapplication/jsonに設定するとエラーが発生します。

**一時的な対応**:
```javascript
// Google Apps Scriptを使用している間は、Content-Typeを指定しない
fetch(apiUrl, {
  method: 'POST',
  body: JSON.stringify(dataObj) // text/plainとして送信
})
```

**推奨される解決策**:
1. サーバーサイドプロキシを実装してGoogle Apps Script URLを隠蔽
2. プロキシ側で適切なCORS設定を実装

```javascript
// Step 2: サーバー側でのCORS設定 (proxy-server.js)
const cors = require('cors');

app.use(cors({
  origin: ['https://yourdomain.com', 'http://localhost:8000'],
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 優先度: 低 🟢

### 6. エラーハンドリングの改善 ✅ 実装完了

**実装済み**:
- ✅ 環境判定機能（isDevelopment関数）
- ✅ 開発環境でのみ詳細エラー表示
- ✅ APIレスポンスのデバッグ機能
- ✅ セキュリティイベントログとの統合

**対策手順**:

```javascript
// Step 1: 詳細なエラー情報の隠蔽 (main.js)
// 変更前:
console.error('Error details:', error);
alert(`Error: ${error.message}`);

// 変更後:
console.error('Submission failed');
if (process.env.NODE_ENV === 'development') {
  console.error('Error details:', error);
}
alert(i18next.t('errors.generic'));
```

```javascript
// Step 2: エラーログの実装
function logSecurityEvent(eventType, details) {
  // サーバーにセキュリティイベントを送信
  fetch('/api/security-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType, details, timestamp: new Date() })
  });
}
```

## 実装状況サマリー

### ✅ 完了した項目
1. XSS脆弱性の修正（innerHTML → textContent）
2. 入力サニタイズ機能の実装と強化
3. セキュリティログシステムの実装
4. レート制限機能（クライアント側：1分間に3回まで）
5. 環境別エラーハンドリング
6. CSPの設定（メタタグ経由）
7. **Google Apps Script側のセキュリティ強化**（2025年1月11日）
   - ドメイン制限とリファラーチェック
   - サーバー側レート制限（IP単位）
   - リクエストバリデーション
   - 不正アクセスログとブロック機能
8. **HTTPS強制リダイレクト**（2025年1月11日）
   - HTTPアクセスを自動的にHTTPSへリダイレクト
   - 開発環境（localhost）を除外
9. **CSRF保護の実装**（2025年1月11日）
   - セッション単位でのCSRFトークン生成
   - フォーム送信時の自動トークン付与

### ⚠️ 制限事項
1. HTTPセキュリティヘッダー（GitHub Pages制限）
2. CORS設定（Google Apps Script制限）

### 🔧 今後の推奨事項（オプション）
1. **Vercel Functionsプロキシの実装**
   - PROXY_IMPLEMENTATION.mdに従って実装
   - Google Apps Script URLを完全に隠蔽（現在はGAS側で保護済み）
   
2. **自動化テスト**
   - SECURITY_TEST_GUIDE.mdに基づくE2Eテスト
   - CI/CDパイプラインでのセキュリティチェック

3. **追加のセキュリティ層**
   - WAF（Web Application Firewall）の導入
   - DDoS対策の強化

## テスト項目

- [x] XSS攻撃のテスト（`<script>alert('XSS')</script>`を各フィールドに入力）
- [x] SQLインジェクションのテスト（`'; DROP TABLE--`などの入力）
- [x] 不正なAPI直接アクセスのテスト（異なるドメインからのアクセスがブロックされることを確認）
- [x] CSPヘッダーの動作確認
- [x] エラーメッセージの適切性確認
- [x] レート制限の動作確認（クライアント側・サーバー側両方）
- [x] Google Apps Scriptのドメイン制限機能の確認

## 参考資料

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)