#!/usr/bin/env node
/**
 * Google Search Console サイトマップ自動送信スクリプト
 * 
 * 使用方法:
 * 1. Google Cloud Consoleでプロジェクトを作成
 * 2. Search Console APIを有効化
 * 3. サービスアカウントを作成し、JSONキーをダウンロード
 * 4. Search Consoleでサービスアカウントのメールアドレスをユーザーとして追加
 * 5. 環境変数を設定:
 *    - GOOGLE_SERVICE_ACCOUNT_EMAIL: サービスアカウントのメールアドレス
 *    - GOOGLE_PRIVATE_KEY: サービスアカウントの秘密鍵（改行は\nで表現）
 *    - SITE_URL: サイトのURL（例: https://totono-lp.vercel.app）
 */

import { google } from 'googleapis';

// 環境変数から設定を読み込み
const SITE_URL = process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://totono-lp.vercel.app';
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

async function submitSitemap() {
  console.log('🗺️  サイトマップ送信スクリプト');
  console.log('================================');
  console.log(`📍 サイトURL: ${SITE_URL}`);
  console.log(`📄 サイトマップURL: ${SITE_URL}/sitemap.xml`);
  console.log('');

  // 認証情報のチェック
  if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
    console.log('⚠️  Google API認証情報が設定されていません。');
    console.log('');
    console.log('サイトマップの自動送信をスキップします。');
    console.log('手動でGoogle Search Consoleからサイトマップを送信してください:');
    console.log(`  1. https://search.google.com/search-console にアクセス`);
    console.log(`  2. プロパティ「${SITE_URL}」を選択`);
    console.log(`  3. 「サイトマップ」メニューを開く`);
    console.log(`  4. 「sitemap.xml」を入力して送信`);
    console.log('');
    console.log('自動送信を有効にするには、以下の環境変数を設定してください:');
    console.log('  - GOOGLE_SERVICE_ACCOUNT_EMAIL');
    console.log('  - GOOGLE_PRIVATE_KEY');
    return;
  }

  try {
    // JWT認証クライアントを作成
    const auth = new google.auth.JWT({
      email: SERVICE_ACCOUNT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/webmasters'],
    });

    // Search Console APIクライアントを作成
    const webmasters = google.webmasters({ version: 'v3', auth });

    // サイトマップを送信
    console.log('📤 サイトマップを送信中...');
    
    await webmasters.sitemaps.submit({
      siteUrl: SITE_URL,
      feedpath: `${SITE_URL}/sitemap.xml`,
    });

    console.log('✅ サイトマップの送信が完了しました！');
    console.log('');
    console.log('Google Search Consoleで送信状況を確認できます:');
    console.log(`  https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(SITE_URL)}`);

  } catch (error) {
    console.error('❌ サイトマップの送信に失敗しました:');
    console.error(error.message);
    
    if (error.code === 403) {
      console.log('');
      console.log('💡 アクセス権限エラーの解決方法:');
      console.log('  1. Google Search Consoleにアクセス');
      console.log('  2. 「設定」→「ユーザーと権限」を開く');
      console.log(`  3. サービスアカウント「${SERVICE_ACCOUNT_EMAIL}」を「オーナー」として追加`);
    }
    
    if (error.code === 404) {
      console.log('');
      console.log('💡 サイトが見つからないエラーの解決方法:');
      console.log('  1. Google Search Consoleにアクセス');
      console.log(`  2. プロパティ「${SITE_URL}」が登録されているか確認`);
      console.log('  3. 所有権の確認が完了しているか確認');
    }
    
    process.exit(1);
  }
}

// サイトマップ送信を実行
submitSitemap();
