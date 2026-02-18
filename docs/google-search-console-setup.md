# Google Search Console API 設定ガイド

このガイドでは、サイトマップの自動送信機能を有効にするための設定手順を説明します。

## 前提条件

- Google Search Consoleでサイトの所有権が確認済みであること
- Google Cloud Platformのアカウントがあること

## 設定手順

### 1. Google Cloud Consoleでプロジェクトを作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成（例: `totono-lp-sitemap`）

### 2. Search Console APIを有効化

1. Google Cloud Consoleで「APIとサービス」→「ライブラリ」を開く
2. 「Google Search Console API」を検索
3. 「有効にする」をクリック

### 3. サービスアカウントを作成

1. 「APIとサービス」→「認証情報」を開く
2. 「認証情報を作成」→「サービスアカウント」を選択
3. サービスアカウント名を入力（例: `sitemap-submitter`）
4. 作成したサービスアカウントをクリック
5. 「キー」タブで「鍵を追加」→「新しい鍵を作成」→「JSON」を選択
6. JSONファイルがダウンロードされます

### 4. Search Consoleでサービスアカウントを追加

1. [Google Search Console](https://search.google.com/search-console) にアクセス
2. プロパティ「https://totono-lp.vercel.app」を選択
3. 「設定」→「ユーザーと権限」を開く
4. 「ユーザーを追加」をクリック
5. サービスアカウントのメールアドレス（`xxx@xxx.iam.gserviceaccount.com`）を入力
6. 権限を「オーナー」に設定して追加

### 5. 環境変数を設定

ダウンロードしたJSONファイルから以下の値を取得し、環境変数として設定します：

```bash
# サービスアカウントのメールアドレス
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# 秘密鍵（JSONファイルの "private_key" の値）
# 改行は \n で表現されています
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvg...\n-----END PRIVATE KEY-----\n"
```

### 6. サイトマップを送信

環境変数を設定後、以下のコマンドでサイトマップを送信できます：

```bash
pnpm submit-sitemap
```

## Vercelでの環境変数設定

1. Vercelのプロジェクト設定を開く
2. 「Settings」→「Environment Variables」を開く
3. 以下の環境変数を追加：
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`

## トラブルシューティング

### 403 Forbidden エラー

サービスアカウントにSearch Consoleへのアクセス権限がありません。
Search Consoleの「ユーザーと権限」でサービスアカウントが「オーナー」として追加されているか確認してください。

### 404 Not Found エラー

指定されたサイトがSearch Consoleに登録されていないか、所有権の確認が完了していません。
Search Consoleでサイトが正しく登録されているか確認してください。

## 関連リンク

- [Google Search Console](https://search.google.com/search-console)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Search Console API ドキュメント](https://developers.google.com/webmaster-tools)
