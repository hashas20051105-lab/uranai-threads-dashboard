# TROUBLESHOOTING

## npm run build が失敗すめE
まず依存関係とNext.jsキャチE��ュを確認します、E
```bash
npm install
npm run build
```

`.next` に古ぁE��惁E��が残ってぁE��場合�E、E��発サーバ�Eを止めて `.next` を削除してから再起動します、E
## Supabaseの列がなぁE��言われめE
�}�C�O���[�V���������K�p�̉\��������܂��BSQL Editor�� 001 ���� 008 �܂ŏ��ԂɎ��s���Ă��������B
SupabaseのREST APIが古ぁE��キーマを見てぁE��場合�E、少し征E��か�Eロジェクトを再読み込みしてから再実行します、E
## /settings でThreads APIが未設定になめE
以下が `.env.local` また�EVercel環墁E��数に入ってぁE��か確認します、E
```text
THREADS_ACCESS_TOKEN
THREADS_USER_ID
THREADS_APP_ID
THREADS_APP_SECRET
```

## Dashboard follower count is not shown

Run migrations through `008_phase67_dashboard_summary.sql`. The dashboard reads `accounts.follower_count` when it exists; if the value is null, it displays `未取得`.

未設定でも手動インポ�Eト、デモ投稿案生成、予紁E��dry-runは利用できます、E
## Threads API収集が失敗すめE
想定される原因:

- Access Token未設宁E- User ID未設宁E- App Review未完亁E- keyword_search権限不足
- API仕様変更
- レート制陁E
こ�E場合�E `/import` の手動インポ�Eトまた�ECSVインポ�Eトで刁E��を継続してください、E
## dry-run の対象ぁE件になめE
以下を確認します、E
- `post_reservations.status = scheduled`
- `approved_by_human = true`
- `scheduled_at <= 現在時刻`
- `threads_post_id` が空
- `retry_count` が上限未満
- `text` が空ではなぁE
予紁E��刻が未来の場合�E正常に除外されます、E
## 実投稿できなぁE
実投稿にはThreads API設定が忁E��です。さらに、IMAGE/VIDEO投稿ではURLが外部からアクセス可能である忁E��があります、E
エラー冁E��は以下を確認します、E
- `post_reservations.error_message`
- `post_reservations.last_error_type`
- `error_logs`
- `post_logs`

secretめEccess tokenはログに保存しなぁE��針です、E
## 同じ投稿が二重投稿されそう

以下�E安�E裁E��があります、E
- `threads_post_id` がある予紁E�E投稿不可
- `status=scheduled` 以外�E投稿不可
- `approved_by_human=false` は投稿不可
- `scheduled_at` が未来なら投稿不可
- `retry_count` 上限で停止

不安な場合�E忁E��dry-runで確認してください、E
## インサイトが取得できなぁE
以下を確認します、E
- 投稿ぁE`status=posted`
- `threads_post_id` があめE- `posted_at` があめE- Threads APIのインサイト権限がある

取得できなぁE��標�E `missing_fields` に保存します。忁E��に応じて `/insights` の手動補正フォームで保存してください、E
## レポ�Eトが空になめE
持E��期間に `insights` がなぁE��能性があります、E
1. `/insights` でインサイト取得また�E手動補正を実行します、E2. `/reports` で日次また�E週間レポ�Eトを生�Eします、E
## secret/token漏洩が忁E�E

確認�EインチE

- 画面に値そ�Eも�Eが表示されてぁE��ぁE��と
- APIレスポンスに値そ�Eも�Eが含まれてぁE��ぁE��と
- `error_logs.details` にtokenやsecretが�EってぁE��ぁE��と
- `.env.local` をGitに含めてぁE��ぁE��と

`/api/health` は設定済みかどぁE��の真偽値だけを返します、E
## Vercel Cronの頻度制陁E
Vercel HobbyではCron頻度に制限がある場合があります。本格運用では以下を検討してください、E
- Vercel Pro
- Supabase scheduled functions
- 外部Cron

Cron API Routeは `CRON_SECRET` で保護してください、E
