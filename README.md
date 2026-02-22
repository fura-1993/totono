# トトノ LP (Next.js)

Vite + Express 構成から **Next.js App Router** へ移行済みです。

## 実装済み

- SEO基盤
1. `app/layout.tsx` で `title/description/OGP/Twitter` メタデータ管理
2. `app/robots.ts` / `app/sitemap.ts` で検索エンジン向けファイル自動生成

- 問い合わせフォーム本格実装
1. `POST /api/inquiries` (multipart対応)
2. MySQL保存（Drizzle / 問い合わせ詳細を構造化して保存）
3. 画像アップロード（任意、ストレージ設定時）
4. 管理者通知メール + 自動返信メール

- 管理画面
1. `/admin/login` 管理者ログイン
2. `/admin` 問い合わせ一覧・ステータス更新
3. `/admin` 施工実績の投稿/編集/公開切替/削除

- 実績のサイト反映
1. 公開実績をトップページへ表示
2. 管理画面で更新した内容がサイトへ反映

## ディレクトリ要点

- `app/` Next.jsルート
- `app/api/` Route Handlers（問い合わせ・管理・実績）
- `lib/` DB/メール/認証/ストレージ
- `shared/schema.ts` Drizzleスキーマ
- `client/src/` 既存UI資産（Next.jsから再利用）

## ローカル起動

1. 依存インストール
```bash
pnpm install
```

2. 環境変数設定
```bash
cp .env.example .env.local
```

3. DB反映（実績テーブル含む）
```bash
pnpm run db:push
```

4. 開発起動
```bash
pnpm run dev
```

- サイト: `http://localhost:3000`
- 管理ログイン: `http://localhost:3000/admin/login`

## 本番ビルド

```bash
pnpm run check
pnpm run build
pnpm run start
```

## Railway デプロイ手順

1. Railway に GitHub リポジトリ連携
2. Build/Deploy
- `railway.json` で Nixpacks + `pnpm run start` を指定済み
- Start は `PORT` を Railway が自動注入

3. Environment Variables を登録
- `NEXT_PUBLIC_SITE_URL`
- `DATABASE_URL`
- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SECRET`
- （画像アップロードを使う場合）
  - `BUILT_IN_FORGE_API_URL`
  - `BUILT_IN_FORGE_API_KEY`

4. 既存DBをアップデート（初回のみ）
- 既存環境は問い合わせ詳細カラム追加のため `db:push` を1回実行
```bash
pnpm run db:push
```
- Railway CLIを使う場合:
```bash
railway run pnpm run db:push
```

5. デプロイ後確認
- `/` 表示
- `/thanks` 表示
- `/admin/login` ログイン
- 問い合わせ送信
- 実績投稿と公開反映
- `/admin` で問い合わせ詳細（依頼内容・詳細・希望連絡方法・送信履歴）が見えること

## 注意点

- `DATABASE_URL` 未設定でもビルドは可能ですが、問い合わせ・管理機能は動きません。
- 画像アップロード環境変数未設定時は、画像保存をスキップして本文のみ保存します。
- DB未更新時でもフォーム送信は後方互換で継続しますが、管理画面の詳細項目表示は `db:push` 後が前提です。
