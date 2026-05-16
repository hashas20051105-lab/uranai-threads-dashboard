# 占いThreadsバズ司令塔

占いジャンル特化型のバズ分析・投稿改善・自然運用ダッシュボードです。

このプロジェクトは、占いテンプレを大量生成して連投するためのツールではありません。Threads上の占いジャンルを分析し、人間味・投稿バランス・安全性を確認しながら、投稿案生成、手動インポート、投稿予約、投稿実行、インサイト回収、レポート作成までをMVPとして扱います。

## ローカル起動方法

```bash
npm install
npm run dev
```

標準では `http://localhost:3000` で起動します。ポートが埋まっている場合は Next.js が `3001` など別ポートを案内します。

ビルド確認:

```bash
npm run build
```

## 必要な環境変数

`.env.example` をコピーして `.env.local` を作成します。

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
THREADS_APP_ID=
THREADS_APP_SECRET=
THREADS_ACCESS_TOKEN=
THREADS_USER_ID=
CRON_SECRET=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
```

クライアント側で使ってよい値は `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` のみです。`SUPABASE_SERVICE_ROLE_KEY`、`OPENAI_API_KEY`、`THREADS_APP_SECRET`、`THREADS_ACCESS_TOKEN`、`CRON_SECRET`、`ADMIN_PASSWORD`、`ADMIN_SESSION_SECRET` は必ずサーバー側だけで扱います。

## MVP簡易ログイン

VercelでMVPを公開する前に、必ず以下を設定してください。

```text
ADMIN_PASSWORD=管理画面に入るための強いパスワード
ADMIN_SESSION_SECRET=Cookie署名用の長いランダム文字列
```

`ADMIN_PASSWORD` はログイン画面で入力する単一ユーザー向けパスワードです。`ADMIN_SESSION_SECRET` はHttpOnly Cookieの署名に使います。どちらもブラウザへ返しません。

保護対象:

- `/dashboard`、`/buzz`、`/import`、`/ideas`、`/reservations`、`/schedule`、`/insights`、`/reports`、`/experiments`、`/settings`
- `/api/ideas/*`、`/api/buzz/*`、`/api/threads/*`、`/api/reservations/*`、`/api/insights/*`、`/api/reports/*`、`/api/settings/*`

Phase 7では、この簡易ログインをSupabase Authに置き換える予定です。

## Supabaseセットアップ

SupabaseのSQL Editorで、以下を順番に実行してください。

```text
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_phase2_idea_generation.sql
supabase/migrations/003_phase3_buzz_import.sql
supabase/migrations/004_phase4_threads_reading.sql
supabase/migrations/005_phase5_reservations.sql
supabase/migrations/006_phase5_publish_execution.sql
supabase/migrations/007_phase6_insights_reports.sql
supabase/migrations/008_phase67_dashboard_summary.sql
supabase/seed.sql
```

Phase 1〜6では `DEFAULT_USER_ID = 00000000-0000-0000-0000-000000000000` を使います。Phase 7でSupabase Authを本格導入した後に `auth.users.id` へ置き換える前提です。

## seed.sqlの使い方

初期デモデータが必要な場合は、マイグレーション適用後に `supabase/seed.sql` をSQL Editorで実行します。既存データがある本番環境では、重複や上書きの影響を確認してから実行してください。

## Vercelデプロイ方法

1. GitHubリポジトリをVercelに接続します。
2. VercelのEnvironment Variablesに `.env.example` と同じキーを登録します。
3. `SUPABASE_SERVICE_ROLE_KEY`、`THREADS_ACCESS_TOKEN`、`THREADS_APP_SECRET`、`CRON_SECRET`、`ADMIN_PASSWORD`、`ADMIN_SESSION_SECRET` はProduction/Previewともに公開されない設定で登録します。
4. デプロイ後に `/api/health` で設定済みフラグだけを確認します。secret値そのものは返しません。

## Threads API設定方法

`THREADS_ACCESS_TOKEN` と `THREADS_USER_ID` を `.env.local` またはVercel環境変数に設定すると、`/settings` で接続状態を確認できます。

未設定でもMVPのデモ生成、手動インポート、予約のdry-run確認は可能です。Threads API未設定時は、API接続テストや投稿実行が `not_configured` になります。

## OpenAI APIあり/なしの使い方

- `OPENAI_API_KEY` あり: 投稿案生成でOpenAI APIをサーバー側から呼び出します。
- `OPENAI_API_KEY` なし: ChatGPT貼り付け用プロンプトとデモ生成で動作確認できます。

どちらの場合もAPIキーをブラウザへ返さない設計です。

## MVPの毎日運用手順

1. `/import` から手動またはCSVでバズ投稿を取り込みます。
2. `/buzz` でスコア、ジャンル、型、投稿タイプ、データ信頼度を確認します。
3. `/ideas` で投稿案30本を生成し、採用・修正・ボツを選びます。
4. `/reservations` で採用済み投稿案から予約を作成し、投稿前チェックと人間承認を通します。
5. 投稿前に必ずdry-runを実行します。
6. Threads API設定済みの場合だけ、確認ダイアログを通して投稿実行します。
7. `/insights` で投稿済み投稿のインサイトを回収または手動補正します。
8. `/reports` で日次・週間レポートを生成します。

## dry-runの使い方

`/reservations` のdry-runボタン、またはAPIで投稿対象だけを確認できます。

```bash
curl -X POST http://localhost:3000/api/reservations/publish-due \
  -H "Content-Type: application/json" \
  -d "{\"dry_run\":true}"
```

dry-runではThreadsへ投稿せず、`post_reservations`、`threads_post_id`、`post_logs` も変更しません。

## 投稿前の安全確認

投稿実行前に以下を確認してください。

- `approved_by_human=true`
- `status=scheduled`
- `scheduled_at` が現在時刻以前
- `threads_post_id` が未設定
- `template_risk` が `blocked` ではない
- NGワードがない
- IMAGE/VIDEOの場合、URLが外部公開されている
- dry-run結果がOKまたは注意の範囲

## インサイト取得方法

`/insights` から一括取得または個別取得を実行します。Threads APIで取得できない項目は `missing_fields` に保存されます。API未設定時や権限不足時は、手動補正フォームで `data_source=manual` として保存できます。

## レポート生成方法

`/reports` から日次レポートまたは週間レポートを生成します。Phase 6ではDB保存と画面表示のみ対応しています。PDF、CSV、Google Sheets、メール、Slack通知はPhase 7以降の拡張です。

## ヘルスチェック

`/api/health` は設定済みフラグだけを返します。secretやtokenの値は返しません。

```bash
curl http://localhost:3000/api/health
```

## トラブルシューティング

詳しくは `docs/TROUBLESHOOTING.md` を参照してください。よくある原因は、Supabaseマイグレーション未適用、`.env.local`不足、Threads API権限不足、Next.jsの古い `.next` キャッシュです。

## 開発ルール

詳細は以下を参照してください。

- `docs/MASTER_SPEC.md`
- `docs/PHASE_PLAN.md`
- `docs/DEVELOPMENT_RULES.md`
- `docs/MVP_TEST_PLAN.md`
- `docs/OPERATIONS_GUIDE.md`
- `docs/TROUBLESHOOTING.md`
