
## Google Search Console連携
- [x] sitemap.xmlの自動生成機能の実装
- [x] robots.txtの追加・更新
- [x] サイトマップURLの確認

## サイトマップ自動送信機能
- [x] Google Search Console API認証の設定ドキュメント作成
- [x] サイトマップ自動送信スクリプトの実装
- [x] pnpm submit-sitemap コマンドの追加

## サービス画像の更新
- [x] 剪定の画像を更新（service-sentei.png）
- [x] 伐採の画像を更新（service-batsuboku.png）
- [x] 草刈りの画像を更新（service-kusakari.png）

## ヒーロー画像の変更
- [x] ヒーローセクションの背景画像をスタッフ作業写真に変更（伐採作業中の写真）

## LINE公式アカウントURL設定
- [x] サイト全体のLINEリンクを公式URL（https://lin.ee/UNR8hec）に変更

## Google Analytics連携
- [x] GA4トラッキングコード（G-09467W0FTS）をindex.htmlに追加

## コンバージョン設定
- [x] 電話ボタンクリックのイベントトラッキング
- [x] LINEボタンクリックのイベントトラッキング
- [x] フォーム送信のイベントトラッキング

## 施工事例の追加
- [x] Before/After写真セクションの拡充（4件に増加）
- [x] 施工事例データの追加（伐採・松の剪定）

## Google広告連携
- [ ] リマーケティングタグの追加（後日対応）


## サービス画像の追加（2回目）
- [x] 防草シート施工の画像を追加
- [x] 空き家の定期管理の画像を追加

## フォームデータのSupabase保存
- [x] contact_submissionsテーブルを作成
- [x] フォーム送信時にSupabaseに保存する機能を実装

## メール通知機能
- [x] フォーム送信時にextend.engineer007@gmail.comにメール通知を送信（Formspree経由）

## Formspree削除・Supabaseのみに変更
- [x] ContactFormからFormspree連携を削除
- [x] Supabaseのみでフォームデータを保存
- [x] メール通知の代替手段（管理画面での確認）

## Supabase→MySQL移行
- [x] Supabase連携コードを削除
- [x] MySQL用のinquiriesテーブルスキーマを作成（既存）
- [x] サーバーサイドAPIエンドポイントを実装
- [x] ContactFormをMySQL APIに接続


## メール通知機能の実装
- [x] 管理者宛てメール通知（extend.engineer007@gmail.com）
- [x] お客様宛て自動返信メール

## 送信成功ポップアップ
- [x] フォーム送信成功時にポップアップメッセージを表示

## 写真添付メール送信
- [x] フォームに添付した写真をCDNにアップロード
- [x] 写真URLを管理者宛てメールに含める
- [x] 写真URLをお客様宛て自動返信メールに含める


## 集客強化施策

### お客様の声セクション
- [x] レビューカードコンポーネントの作成
- [x] お客様の声セクションをHomeページに追加
- [x] サンプルデータで4件のレビューを表示

### 構造化データ（Schema.org）
- [x] LocalBusinessスキーマの追加（実装済み）
- [x] FAQスキーマの追加（実装済み）
- [x] Serviceスキーマの追加（実装済み）

### 料金シミュレーター
- [x] シミュレーターUIコンポーネントの作成
- [x] 料金計算ロジックの実装
- [x] シミュレーター結果からCTAへの誘導


## バグ修正: 写真添付メール
- [x] 問い合わせフォームの写真が管理者・お客様両方に届かない問題を修正（Manus Forge S3ストレージ使用）
