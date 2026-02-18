# Google Search Console API - サイトマップ送信

## API エンドポイント

```
PUT https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/sitemaps/{feedpath}
```

## パラメータ

| パラメータ | 型 | 説明 |
|-----------|------|------|
| siteUrl | string | Search Consoleで定義されたプロパティURL（例: `http://www.example.com/` または `sc-domain:example.com`）|
| feedpath | string | 追加するサイトマップのURL（例: `http://www.example.com/sitemap.xml`）|

## 認証

必要なスコープ: `https://www.googleapis.com/auth/webmasters`

## 認証方法

1. Google Cloud Consoleでプロジェクトを作成
2. Search Console APIを有効化
3. サービスアカウントを作成し、JSONキーをダウンロード
4. Search Consoleでサービスアカウントのメールアドレスをユーザーとして追加

## Node.js実装

```javascript
const { google } = require('googleapis');

// サービスアカウント認証
const auth = new google.auth.GoogleAuth({
  keyFile: 'path/to/service-account.json',
  scopes: ['https://www.googleapis.com/auth/webmasters'],
});

const webmasters = google.webmasters({ version: 'v3', auth });

// サイトマップ送信
await webmasters.sitemaps.submit({
  siteUrl: 'https://totono-lp.vercel.app/',
  feedpath: 'https://totono-lp.vercel.app/sitemap.xml',
});
```
