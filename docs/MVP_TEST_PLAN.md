# MVP_TEST_PLAN

## 目的

Phase 0〜6で実装したMVP機能が、安全に一通り動くことを確認するためのテスト計画です。Phase 6.5では新機能を大きく増やさず、表示、ビルド、API、secret漏洩、投稿安全装置、主要フローを確認します。

## 前提

- 対象プロジェクト: 占いThreadsバズ司令塔
- タイムゾーン: Asia/Tokyo
- Phase 1〜6のユーザーID: `00000000-0000-0000-0000-000000000000`
- Threads API未設定でも、手動インポート、デモ生成、予約、dry-run、手動インサイト補正は確認できます。
- 実投稿、APIインサイト取得、Threads検索はThreads APIの有効な認証情報が必要です。

## 事前チェック

```bash
npm install
npm run build
```

Supabase SQL Editorで以下を順番に適用します。

```text
001_initial_schema.sql
002_phase2_idea_generation.sql
003_phase3_buzz_import.sql
004_phase4_threads_reading.sql
005_phase5_reservations.sql
006_phase5_publish_execution.sql
007_phase6_insights_reports.sql
008_phase67_dashboard_summary.sql
seed.sql
```

## ページ表示チェック

| ページ | 確認内容 |
| --- | --- |
| `/` | トップからダッシュボードへ誘導できる |
| `/dashboard` | KPI、ランキング、投稿案、スケジュールが表示される |
| `/buzz` | バズ投稿一覧、フィルター、Threads収集パネルが表示される |
| `/import` | 手動入力とCSV貼り付けが表示される |
| `/ideas` | 日常素材入力、投稿案生成、スコア表示が表示される |
| `/reservations` | 予約作成、予約一覧、dry-run/投稿ボタンが表示される |
| `/schedule` | 予約スケジュールが表示される |
| `/settings` | Threads API設定状態がマスク表示される |
| `/insights` | インサイト取得、集計、手動補正が表示される |
| `/reports` | 日次/週間レポート生成と一覧が表示される |
| `/experiments` | 実験管理が表示される |

## APIチェック

| API | 方法 | 期待結果 |
| --- | --- | --- |
| `/api/health` | GET | secret値を含まず、設定済みフラグだけ返す |
| `/api/threads/test` | POST | 未設定時は `not_configured`、設定済みなら接続結果 |
| `/api/buzz/import` | POST | 手動/CSVデータを `buzz_posts` に保存 |
| `/api/buzz/collect` | POST | API未設定でもフォールバック案内つきで失敗する |
| `/api/ideas/generate` | POST | OpenAIなしでもデモ投稿案を生成 |
| `/api/ideas/check` | POST | テンプレ危険度、人間味、投稿判断を返す |
| `/api/reservations/create` | POST | 承認済みで条件OKなら予約保存 |
| `/api/reservations/publish-due` | POST dry-run | 投稿せず対象判定だけ返す |
| `/api/reservations/publish-one` | POST dry-run | 投稿せず指定予約の判定だけ返す |
| `/api/insights/collect` | POST | 対象がなければ0件で正常終了 |
| `/api/reports/daily` | POST | 指定日のレポートを保存 |
| `/api/reports/weekly` | POST | 指定週のレポートを保存 |

## E2E確認フロー

| 手順 | 確認内容 | API未設定時 |
| --- | --- | --- |
| 1 | `/import` でバズ投稿を登録 | 可能 |
| 2 | `buzz_posts` に保存 | 可能 |
| 3 | `/dashboard` に反映 | 可能 |
| 4 | `/ideas` で投稿案30本生成 | 可能 |
| 5 | 画像プロンプト生成 | 可能 |
| 6 | 投稿案を採用 | 可能 |
| 7 | `/reservations` で予約作成 | 可能 |
| 8 | 投稿前チェック | 可能 |
| 9 | 人間承認 | 可能 |
| 10 | dry-run実行 | 可能 |
| 11 | TEXT投稿を1件実行 | Threads API必須 |
| 12 | `threads_post_id` 保存 | Threads API必須 |
| 13 | `post_logs` 保存 | Threads API必須 |
| 14 | インサイト取得 | Threads APIまたは手動補正 |
| 15 | `insights` 保存 | 手動補正なら可能 |
| 16 | 日次レポート生成 | insightsデータが必要 |
| 17 | `reports` 保存 | insightsデータが必要 |
| 18 | ChatGPT貼り付け用プロンプト生成 | 可能 |

## 安全チェック

- ブラウザ、レスポンス、ログに `THREADS_ACCESS_TOKEN` を表示しない。
- `SUPABASE_SERVICE_ROLE_KEY` と `OPENAI_API_KEY` をクライアントへ渡さない。
- error_logsにsecret値を保存しない。
- dry-runではThreads APIの投稿エンドポイントを呼ばない。
- `approved_by_human=false` は投稿不可。
- `scheduled_at` が未来の予約は投稿不可。
- `threads_post_id` がある予約は再投稿不可。
- `retry_count` が上限以上の予約は投稿不可。
- `template_risk=blocked` は投稿不可。

## 合格条件

- `npm run build` が通る。
- 主要ページが表示される。
- 主要APIが安全に応答する。
- secret/token漏洩がない。
- dry-runと二重投稿防止が機能する。
- READMEと運用ドキュメントが更新されている。
