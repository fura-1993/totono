#!/usr/bin/env node
/**
 * サイトマップ自動生成スクリプト
 * ビルド時に実行され、sitemap.xmlを自動生成します
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// サイトの設定
const SITE_URL = process.env.VITE_SITE_URL || 'https://totono-lp.vercel.app';

// ページ定義
const pages = [
  {
    path: '/',
    changefreq: 'weekly',
    priority: 1.0,
  },
  {
    path: '/thanks',
    changefreq: 'monthly',
    priority: 0.3,
  },
];

// 現在の日付をISO形式で取得
const today = new Date().toISOString().split('T')[0];

// XMLを生成
function generateSitemap() {
  const urls = pages
    .map(
      (page) => `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

// robots.txtを生成
function generateRobotsTxt() {
  return `# robots.txt for トトノ LP
# ${SITE_URL}/

User-agent: *
Allow: /

# サンクスページはインデックス不要
Disallow: /thanks

# サイトマップの場所
Sitemap: ${SITE_URL}/sitemap.xml
`;
}

// ファイルを書き込み
const publicDir = path.join(__dirname, '..', 'client', 'public');

// sitemap.xml
const sitemapPath = path.join(publicDir, 'sitemap.xml');
fs.writeFileSync(sitemapPath, generateSitemap());
console.log(`✅ Generated: ${sitemapPath}`);

// robots.txt
const robotsPath = path.join(publicDir, 'robots.txt');
fs.writeFileSync(robotsPath, generateRobotsTxt());
console.log(`✅ Generated: ${robotsPath}`);

console.log(`\n📍 Site URL: ${SITE_URL}`);
console.log(`📅 Last modified: ${today}`);
console.log(`📄 Pages included: ${pages.length}`);
