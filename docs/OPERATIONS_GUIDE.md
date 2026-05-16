# OPERATIONS_GUIDE

## 日常運用の全体像

このMVPは、手動インポートまたはThreads API読み取りで集めた占い投稿データをもとに、投稿案生成、予約、投稿、インサイト回収、レポート生成を行います。大量連投ではなく、編集長として安全性と投稿バランスを確認しながら運用します。

## 1. 起動

```bash
npm run dev
```

ビルド確認:

```bash
npm run build
```

設定状態は `/api/health` と `/settings` で確認します。どちらもsecret値は表示しません。

## 1.5 MVP簡易ログイン

Vercelに公開する前に、単一ユーザー向けの簡易ログインを必ず有効にします。

```text
ADMIN_PASSWORD=管理画面に入るための強いパスワード
ADMIN_SESSION_SECRET=Cookie署名用の長いランダム文字列
```

`ADMIN_PASSWORD` と `ADMIN_SESSION_SECRET` はVercelのEnvironment Variablesに登録し、クライアント側には公開しません。

確認手順:

1. 未ログインで `/dashboard` を開くと `/login` に移動する。
2. `ADMIN_PASSWORD` でログインすると `/dashboard` が開く。
3. ヘッダーの「ログアウト」でCookieが削除される。
4. ログアウト後に管理画面へ戻れないことを確認する。

この保護はMVP公開前の簡易ロックです。Phase 7ではSupabase Auth、ユーザーごとのデータ分離、権限管理に置き換えます。

## 2. Supabase確認

SQL Editorで `001` から `008` までのマイグレーションと `seed.sql` が適用済みか確認します。

特にPhase 6では以下が必要です。

- `insights` のPhase 6追加カラム
- `reports` の `chatgpt_prompt`
- `experiments` の結果・学び管理カラム
- `post_reservations` の投稿実行用カラム

## 3. バズ投稿の登録

`/import` を開きます。

- 1件だけ登録する場合: 単発入力フォーム
- 複数登録する場合: CSV貼り付けフォーム

保存後、`/buzz` で以下が自動補完されているか確認します。

- バズスコア
- ジャンル
- フック
- 型
- 投稿タイプ
- 画像モチーフ
- data_confidence
- missing_fields

## 4. 投稿案生成

`/ideas` を開きます。

1. 日常素材を入力します。
2. 投稿案を30本生成します。
3. 人間味スコア、テンプレ危険度、CTAリスク、鮮度、競合類似度を確認します。
4. 投稿する候補だけを「採用」または「修正」にします。

OpenAI APIが未設定でも、デモ生成とChatGPT貼り付け用プロンプトで確認できます。

## 5. 投稿予約

`/reservations` を開きます。

1. 採用済み投稿案を選びます。
2. 本文、投稿タイプ、予約日時、画像/動画URLを確認します。
3. 投稿前チェックを確認します。
4. 人間承認チェックを入れます。
5. 予約します。

人間承認がない予約は `scheduled` にできません。

## 6. dry-run

投稿前に必ずdry-runを実行します。

dry-runでは以下を確認します。

- 投稿対象かどうか
- 投稿不可理由
- 最終投稿前チェック
- 二重投稿防止
- 未来予約の除外
- 未承認予約の除外

dry-runではThreadsへ投稿しません。

## 7. Threads投稿実行

Threads API設定済みの場合のみ実行します。

- TEXT投稿: 本文のみで投稿
- IMAGE投稿: 外部公開された `image_url` が必要
- VIDEO投稿: 外部公開された `video_url` が必要
- THREAD投稿: `thread_group_id` と `thread_order` で順序管理

投稿成功後は以下を確認します。

- `post_reservations.status = posted`
- `threads_post_id` が保存
- `posted_at` が保存
- `post_logs` が保存

## 8. インサイト回収

`/insights` を開きます。

対象は `status=posted`、`threads_post_id` あり、`approved_by_human=true` の投稿です。

APIで取得できない場合は手動補正フォームで保存します。

## 9. レポート生成

`/reports` を開きます。

- 日次レポート
- 週間レポート
- ChatGPT貼り付け用改善プロンプト

Phase 6ではDB保存と画面表示までです。PDF、CSV、Google Sheets、メール、Slack通知はPhase 7以降です。

## 10. 本番前チェック

本番運用前に人間が確認してください。

- Threads APIの権限とApp Review状態
- 投稿対象アカウントが正しいこと
- `.env.local` とVercel環境変数に本番値が入っていること
- `ADMIN_PASSWORD` と `ADMIN_SESSION_SECRET` が設定され、未ログインでは管理画面/APIに入れないこと
- `CRON_SECRET` が十分に長く推測困難なこと
- Supabase SQLが本番DBに適用済みであること
- seedを本番DBに不用意に再実行しないこと
- 投稿前にdry-run結果を必ず確認する運用になっていること
