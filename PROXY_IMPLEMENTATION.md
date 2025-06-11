# プロキシサーバー実装ガイド

## 概要
現在、GitHub Pagesで静的サイトとしてホスティングされているアプリケーションに、Google Apps Script URLを隠蔽するためのプロキシサーバーを導入する方法を説明します。

## 実装オプション

### オプション1: Vercelを使用した実装（推奨）
GitHub Pagesとの併用が可能で、無料枠で十分運用可能です。

```
survey/
├── public/           # 既存の静的ファイル（GitHub Pagesで配信）
│   ├── index.html
│   ├── css/
│   └── js/
├── api/              # Vercel Functions（新規追加）
│   └── submit-survey.js
├── vercel.json       # Vercel設定（新規追加）
└── package.json      # 既存のpackage.json
```

### オプション2: Netlify Functionsを使用
同様にサーバーレス関数として実装可能です。

### オプション3: 独立したNode.jsサーバー
Heroku、Railway、Renderなどのサービスを使用。

## Vercelでの実装手順

### 1. Vercel Functionsの作成

```javascript
// api/submit-survey.js
export default async function handler(req, res) {
  // CORSヘッダーの設定
  res.setHeader('Access-Control-Allow-Origin', 'https://yourdomain.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // OPTIONSリクエストの処理
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // POSTリクエストのみ許可
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // リクエストの検証
    const data = req.body;
    const errors = validateSurveyData(data);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    // Google Apps Scriptへの転送
    const gasUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    const response = await fetch(gasUrl, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'text/plain' // Google Apps Scriptの制限
      }
    });
    
    const result = await response.text();
    return res.status(200).json({ success: true, result });
    
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// 検証関数
function validateSurveyData(data) {
  const errors = [];
  
  // 必須フィールドの検証
  if (!data.store || !['ilhair', 'ilmake', 'quarter', 'lim', 'ivil'].includes(data.store)) {
    errors.push('Invalid store');
  }
  
  // メールアドレスの検証
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email');
  }
  
  // 評価値の検証
  if (data.overallRating && (data.overallRating < 1 || data.overallRating > 5)) {
    errors.push('Invalid rating');
  }
  
  return errors;
}
```

### 2. Vercel設定

```json
// vercel.json
{
  "functions": {
    "api/submit-survey.js": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### 3. 環境変数の設定
Vercelダッシュボードで以下の環境変数を設定：
- `GOOGLE_APPS_SCRIPT_URL`: 実際のGoogle Apps ScriptのURL

### 4. フロントエンドの修正

```javascript
// js/config.js
const API_CONFIG = {
  // Vercel Functionsのエンドポイントを使用
  WEBHOOK_URL: 'https://your-vercel-app.vercel.app/api/submit-survey',
  // その他の設定...
};
```

### 5. デプロイ手順

```bash
# Vercel CLIのインストール
npm i -g vercel

# プロジェクトのデプロイ
vercel

# 環境変数の設定
vercel env add GOOGLE_APPS_SCRIPT_URL
```

## セキュリティ上の利点

1. **URL隠蔽**: Google Apps ScriptのURLがクライアントから見えなくなる
2. **検証強化**: サーバーサイドでの入力検証が可能
3. **レート制限**: Vercelの機能でレート制限を実装可能
4. **ログ記録**: サーバーサイドでセキュリティイベントを記録可能
5. **HTTPヘッダー**: 適切なセキュリティヘッダーを設定可能

## 移行計画

1. **フェーズ1**: Vercel Functionsの実装とテスト
2. **フェーズ2**: 開発環境での動作確認
3. **フェーズ3**: 本番環境への段階的移行
4. **フェーズ4**: 旧エンドポイントの廃止

## 注意事項

- Vercelの無料枠は月100GB、商用利用可能
- GitHub Pagesの静的ファイルはそのまま使用可能
- ドメイン設定によりシームレスな統合が可能