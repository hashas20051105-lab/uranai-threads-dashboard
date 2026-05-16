# 占いThreadsバズ司令塔 MASTER SPEC

## 1. プロダクト概要

プロダクト名: 占いThreadsバズ司令塔

サブタイトル: 占いジャンル特化型 バズ分析・投稿改善・自然運用ダッシュボード

本プロダクトは、占いテンプレートを大量生成して連投するためのツールではない。Threads上の占いジャンル全般を分析し、自然に運用されている占いアカウントのように、投稿内容の多様性、人間味、日常性、独自視点、投稿バランスを保ちながら、バズ分析、投稿改善、投稿予約、インサイト管理を行う。

コンセプトは「占いテンプレ量産ツール」ではなく「占いアカウント編集長ツール」である。

## 2. 基本方針

- 一気に全機能を実装しない。
- Phase 0 から Phase 7 まで段階的に実装する。
- 各Phaseは、動作確認できる状態で完了する。
- 未実装機能はモックまたはプレースホルダーで表示してよい。
- Threads / Meta のID・パスワード保存、自動ログイン、ブラウザスクレイピング、画面操作の自動化は行わない。
- 自動いいね、自動フォロー、自動リプ連打、凍結回避目的の不自然な挙動偽装は行わない。
- 公式API前提の安全な運用補助ツールとして設計する。
- 投稿実行は、人間が承認した投稿だけを対象にする。

## 3. 技術スタック

- Next.js
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- lucide-react
- Recharts
- Supabase
- Supabase Auth
- Supabase PostgreSQL
- Vercel
- GitHub
- OpenAI API 任意
- Threads API
- Google Sheets Export は後半フェーズで任意実装

## 4. 参考UIの扱い

参考UI画像は、デザイン、レイアウト、画面構成、雰囲気のみを参照する。

参照する要素:

- 白背景
- 紫アクセント
- カード型SaaSデザイン
- 左サイドバー
- 上部ヘッダー
- KPIカード
- 編集長チェックカード
- テンプレ乱発チェックカード
- ブランド人格カード
- 安全チェックカード
- ランキングテーブル
- 投稿案カード
- 投稿スケジュール
- グラフやチャートの雰囲気

参照しない要素:

- UI画像内の投稿文
- UI画像内のジャンル名
- UI画像内の数値
- UI画像内のランキング
- UI画像内のサンプルデータ
- UI画像内の特定ブランド名

UI画像をOCR的に読み取り、内容やデータを実装してはならない。表示データは Supabase のDB、API取得データ、またはデモデータ生成ロジックから表示する。

## 5. 環境変数

Phase 0 で以下の環境変数を定義する。

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
THREADS_APP_ID
THREADS_APP_SECRET
THREADS_ACCESS_TOKEN
THREADS_USER_ID
CRON_SECRET
```

`SUPABASE_SERVICE_ROLE_KEY`、`OPENAI_API_KEY`、`THREADS_ACCESS_TOKEN`、`THREADS_APP_SECRET` はサーバー側でのみ使用し、クライアント側へ絶対に露出しない。

Phase 0 から Phase 6 では、Supabase Auth 本格導入前の単一ユーザー運用として以下の固定IDを使う。

```ts
export const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000";
```

Phase 7 で Supabase Auth を導入した後は、`auth.users.id` に置き換える。

## 6. 推奨フォルダ構成

```text
app/
  layout.tsx
  page.tsx
  dashboard/
  buzz/
  keywords/
  ideas/
  reservations/
  schedule/
  insights/
  reports/
  settings/
  brand/
  calendar/
  cta/
  experiments/
  import/

components/
  layout/
  dashboard/
  cards/
  charts/
  tables/
  forms/
  ui/

lib/
  supabase/
  threads/
  openai/
  scoring/
  safety/
  validation/
  utils/
  constants.ts

services/
  buzz-service.ts
  idea-service.ts
  safety-service.ts
  threads-service.ts
  insight-service.ts
  report-service.ts
  reservation-service.ts

types/
  database.ts
  domain.ts

supabase/
  migrations/
  seed.sql

docs/
  MASTER_SPEC.md
  PHASE_PLAN.md
  DEVELOPMENT_RULES.md

middleware.ts
```

## 7. lib/ と services/ の責務

`lib/` はDBに直接依存しない処理を置く。

- 外部APIクライアント
- Supabaseクライアント
- 純粋関数
- スコア計算
- 文字列正規化
- バリデーション
- ユーティリティ

`services/` はDBアクセスを含む業務ロジックを置く。

- 複数テーブルをまたぐ処理
- 投稿案生成フロー
- バズ収集フロー
- 予約投稿フロー
- インサイト保存フロー
- レポート生成フロー

## 8. 対象ジャンル

占い全般を対象とする。

初期ジャンル候補:

- 総合占い
- 今日の運勢
- 恋愛占い
- 復縁
- 片思い
- 相性占い
- 結婚運
- 金運
- 仕事運
- 転職運
- 対人運
- タロット
- オラクルカード
- 星座占い
- 数秘術
- 手相
- 人相
- 四柱推命
- 九星気学
- 霊視
- チャネリング
- スピリチュアル
- 開運
- 前兆サイン
- 引き寄せ
- 波動
- 満月
- 新月
- 一粒万倍日
- 天赦日
- 水星逆行
- 神社
- パワースポット
- お守り

ダッシュボードに表示するジャンルは固定しない。収集データをもとに、今日伸びそうなジャンル上位5から10件を自動表示する。

## 9. 初期キーワード

白蛇、龍神、宇宙銀行など、特定ブランド色が強いキーワードは初期キーワードに入れない。

初期キーワード:

- 総合占い: 占い、今日の運勢、運勢、運気、開運、幸運、前兆、サイン、スピリチュアル
- 恋愛占い: 恋愛運、恋愛占い、片思い、復縁、相性占い、好きな人、あの人の気持ち、連絡が来る、既読、未読、ツインレイ、ソウルメイト
- 金運・仕事運: 金運、臨時収入、仕事運、転職運、副業運、収入アップ、お金の流れ、財布、宝くじ
- 占術: タロット、オラクルカード、星座占い、数秘術、手相、人相、四柱推命、九星気学、霊視、チャネリング
- 季節・天体・開運日: 満月、新月、水星逆行、一粒万倍日、天赦日、ライオンズゲート、節分、彼岸、神社、パワースポット、お守り

ブランド別キーワードパックとして任意でON/OFFできるもの:

- 金運特化パック
- 恋愛特化パック
- 復縁特化パック
- スピリチュアル特化パック
- 神社・開運日パック
- 白蛇系パック
- 龍神系パック
- 宇宙銀行系パック

## 10. 投稿タイプ

投稿タイプ:

- 占い結果型
- 今日の運勢型
- 前兆サイン型
- 恋愛共感型
- 金運共感型
- 日常つぶやき型
- 占術解説型
- 裏側・制作過程型
- 失敗談・気づき型
- 質問・交流型
- 告知・誘導型

初期投稿比率:

- 占い・運勢系: 50%
- 日常・共感系: 20%
- 占術解説系: 15%
- 体験談・裏側系: 10%
- 告知・誘導系: 5%

同じ投稿タイプが連続しすぎないよう、投稿ローテーション制御を行う。

## 11. AI量産・テンプレ乱発対策

必須設計:

1. 投稿タイプ分散
2. 人間味スコア
3. テンプレ危険度
4. 日常素材入力
5. 投稿ローテーション制御
6. 競合コピー防止
7. 投稿しない判断
8. 投稿前チェックリスト
9. CTA管理
10. 画像使い回しチェック

テンプレ危険度チェック項目:

- 同じフックの使い回し
- 同じCTAの連続使用
- 同じジャンルの連投
- 同じ型の連投
- 同じ投稿タイプの連投
- 「絶対」「必ず」「100%」などの過度な断定
- 「これを見た人」「3日以内」などの多用
- 「受け取ります」系CTAの多用
- 過去投稿との類似度
- 競合投稿との類似度
- AIっぽい定型文の連続
- 同じ絵文字や記号の多用
- 同じ文末表現の連続

投稿判断は、投稿推奨、修正後投稿推奨、保留、投稿非推奨のような状態で管理する。

## 12. ブランド人格DB

アカウントごとに、口調、世界観、NG表現、読者像、CTAスタイルを保存する。投稿案生成時は必ずブランド人格DBを参照する。

主要項目:

- brand_id
- account_id
- brand_name
- persona_name
- tone
- worldview
- target_reader
- common_phrases
- banned_phrases
- writing_rules
- cta_style
- example_posts
- memo
- created_at
- updated_at

## 13. 占いカレンダーDB

新月、満月、一粒万倍日、天赦日、水星逆行、季節イベントなどを登録できる。

主要項目:

- calendar_id
- date
- event_name
- event_type
- related_genre
- importance_score
- suggested_angle
- ng_angle
- memo
- created_at
- updated_at

投稿案生成時は、当日、翌日、直近7日間のイベントを参照する。

## 14. 主要Supabaseテーブル

今回はSQLマイグレーションを作成しない。以下は将来実装するDB設計である。

### users_profile

- user_id uuid primary key
- display_name text
- email text
- timezone text default 'Asia/Tokyo'
- plan text
- created_at timestamptz
- updated_at timestamptz

### accounts

- account_id uuid primary key
- user_id uuid
- account_name text
- threads_user_id text
- handle text
- status text
- memo text
- created_at timestamptz
- updated_at timestamptz

### api_credentials

- credential_id uuid primary key
- user_id uuid
- account_id uuid
- provider text
- credential_type text
- env_key_name text
- status text
- expires_at timestamptz
- last_checked_at timestamptz
- memo text
- created_at timestamptz
- updated_at timestamptz

`api_credentials` には secret の平文を保存しない。Phase 0 から Phase 6 では重要なAPIキーやトークンは Vercel 環境変数で管理する。このテーブルは将来的な複数ユーザー対応のメタデータ保存先として設計する。

### keywords

- keyword_id uuid primary key
- user_id uuid
- account_id uuid
- keyword text
- category text
- priority int
- is_active boolean
- source text
- created_at timestamptz
- updated_at timestamptz

### keyword_packs

- pack_id uuid primary key
- user_id uuid
- account_id uuid
- pack_name text
- pack_type text
- keywords jsonb
- is_enabled boolean
- memo text
- created_at timestamptz
- updated_at timestamptz

ブランド別キーワードパックのON/OFFに使う。

### genres

- genre_id uuid primary key
- user_id uuid
- name text
- parent_genre text
- related_keywords jsonb
- is_active boolean
- created_at timestamptz
- updated_at timestamptz

### buzz_posts

- buzz_post_id uuid primary key
- user_id uuid
- account_id uuid
- source text
- threads_post_id text
- post_url text
- author_handle text
- body text
- genre text
- pattern_name text
- post_type text
- hook_text text
- visual_motifs jsonb
- like_count int
- reply_count int
- repost_count int
- quote_count int
- view_count int
- buzz_score numeric
- recency_bonus numeric
- data_confidence numeric
- posted_at timestamptz
- collected_at timestamptz
- created_at timestamptz
- updated_at timestamptz

### post_ideas

- idea_id uuid primary key
- user_id uuid
- account_id uuid
- brand_id uuid
- title text
- body text
- genre text
- post_type text
- hook_text text
- cta_text text
- source_buzz_ids jsonb
- referenced_trend jsonb
- human_score numeric
- template_risk_score numeric
- competitor_similarity_score numeric
- freshness_score numeric
- cta_risk_score numeric
- brand_match_score numeric
- ai_score numeric
- decision text
- improvement_suggestions text
- status text
- created_at timestamptz
- updated_at timestamptz

### post_reservations

- reservation_id uuid primary key
- user_id uuid
- account_id uuid
- idea_id uuid
- post_format text
- body text
- media_urls jsonb
- scheduled_at timestamptz
- status text
- approved_by_user boolean
- precheck_result jsonb
- created_at timestamptz
- updated_at timestamptz

### post_logs

- post_log_id uuid primary key
- user_id uuid
- account_id uuid
- reservation_id uuid
- threads_post_id text
- status text
- published_at timestamptz
- error_message text
- retry_count int
- created_at timestamptz
- updated_at timestamptz

### insights

- insight_id uuid primary key
- user_id uuid
- account_id uuid
- post_log_id uuid
- threads_post_id text
- captured_at timestamptz
- elapsed_hours int
- like_count int
- reply_count int
- repost_count int
- quote_count int
- view_count int
- engagement_rate numeric
- raw_payload jsonb
- created_at timestamptz

### pattern_db

- pattern_id uuid primary key
- user_id uuid
- pattern_name text
- description text
- average_score numeric
- usage_count int
- created_at timestamptz
- updated_at timestamptz

### hook_db

- hook_id uuid primary key
- user_id uuid
- hook_text text
- hook_type text
- average_score numeric
- usage_count int
- last_used_at timestamptz
- created_at timestamptz
- updated_at timestamptz

### image_motifs

- motif_id uuid primary key
- user_id uuid
- motif_name text
- motif_type text
- usage_count int
- average_score numeric
- last_used_at timestamptz
- created_at timestamptz
- updated_at timestamptz

### image_prompts

- image_prompt_id uuid primary key
- user_id uuid
- idea_id uuid
- prompt text
- visual_motifs jsonb
- status text
- created_at timestamptz
- updated_at timestamptz

### image_results

- image_result_id uuid primary key
- user_id uuid
- image_prompt_id uuid
- storage_path text
- provider text
- status text
- metadata jsonb
- created_at timestamptz
- updated_at timestamptz

### post_type_db

- post_type_id uuid primary key
- user_id uuid
- post_type text
- category text
- target_ratio numeric
- usage_count int
- average_score numeric
- created_at timestamptz
- updated_at timestamptz

### daily_materials

- material_id uuid primary key
- user_id uuid
- account_id uuid
- date date
- material_text text
- mood text
- event_context text
- created_at timestamptz
- updated_at timestamptz

### template_risk_logs

- risk_log_id uuid primary key
- user_id uuid
- idea_id uuid
- risk_score numeric
- risk_items jsonb
- decision text
- created_at timestamptz

### brand_personas

- brand_id uuid primary key
- user_id uuid
- account_id uuid
- brand_name text
- persona_name text
- tone text
- worldview text
- target_reader text
- common_phrases jsonb
- banned_phrases jsonb
- writing_rules jsonb
- cta_style text
- example_posts jsonb
- memo text
- created_at timestamptz
- updated_at timestamptz

### fortune_calendar

- calendar_id uuid primary key
- user_id uuid
- date date
- event_name text
- event_type text
- related_genre text
- importance_score numeric
- suggested_angle text
- ng_angle text
- memo text
- created_at timestamptz
- updated_at timestamptz

### cta_db

- cta_id uuid primary key
- user_id uuid
- cta_text text
- cta_type text
- risk_level text
- usage_count int
- average_score numeric
- last_used_at timestamptz
- created_at timestamptz
- updated_at timestamptz

### experiments

- experiment_id uuid primary key
- user_id uuid
- account_id uuid
- hypothesis text
- start_date date
- end_date date
- success_metric text
- result text
- learning text
- status text
- created_at timestamptz
- updated_at timestamptz

### manual_imports

- import_id uuid primary key
- user_id uuid
- account_id uuid
- import_type text
- raw_input text
- parsed_rows jsonb
- status text
- error_message text
- created_at timestamptz
- updated_at timestamptz

### account_phases

- account_phase_id uuid primary key
- user_id uuid
- account_id uuid
- current_phase text
- phase_status text
- memo text
- created_at timestamptz
- updated_at timestamptz

### safety_checks

- safety_check_id uuid primary key
- user_id uuid
- account_id uuid
- target_type text
- target_id uuid
- check_type text
- status text
- score numeric
- details jsonb
- created_at timestamptz

### error_logs

- error_log_id uuid primary key
- user_id uuid
- account_id uuid
- source text
- route text
- severity text
- message text
- details jsonb
- created_at timestamptz

### reports

- report_id uuid primary key
- user_id uuid
- account_id uuid
- report_type text
- target_date date
- summary text
- top_genres jsonb
- top_hooks jsonb
- top_patterns jsonb
- top_post_types jsonb
- top_motifs jsonb
- next_recommendations jsonb
- created_at timestamptz
- updated_at timestamptz

### settings

- setting_id uuid primary key
- user_id uuid
- account_id uuid
- setting_key text
- setting_value jsonb
- created_at timestamptz
- updated_at timestamptz

## 15. JSONB方針

初期実装では柔軟性を優先して JSONB を使用する。

JSONBで保存するカラム例:

- `post_ideas.source_buzz_ids`
- `post_ideas.referenced_trend`
- `buzz_posts.visual_motifs`
- `image_prompts.visual_motifs`
- `brand_personas.common_phrases`
- `brand_personas.banned_phrases`
- `brand_personas.writing_rules`
- `brand_personas.example_posts`
- `genres.related_keywords`
- `keyword_packs.keywords`
- `safety_checks.details`
- `reports.top_genres`
- `reports.top_hooks`
- `reports.top_patterns`
- `reports.top_post_types`
- `reports.top_motifs`
- `reports.next_recommendations`

将来的に検索や集計が重くなった場合は、中間テーブルへ正規化する。Phase 1 から Phase 6 では JSONB を優先し、実装をシンプルに保つ。

## 16. バズスコア

Phase 3 の初期式:

```text
buzz_score =
like_count * 1
+ reply_count * 3
+ repost_count * 4
+ quote_count * 4
+ view_count * 0.02
+ recency_bonus
```

スコア係数は設定画面から変更可能にする。

## 17. Cron初期設定

タイムゾーンは `Asia/Tokyo`、JST基準とする。

初期スケジュール:

- バズ投稿収集: 毎朝 07:00 JST
- 日次レポート生成: 毎晩 23:00 JST
- 予約投稿チェック: 5分ごと
- インサイト取得: 投稿後 1時間 / 3時間 / 6時間 / 24時間 / 48時間
- トークン期限チェック: 毎日 08:00 JST
- 安全チェック更新: 毎日 08:10 JST

設定画面から変更可能にする。Cron API Route は `CRON_SECRET` で保護する。

Vercel Hobby環境ではCron頻度に制限がある可能性があるため、本格運用では Vercel Pro、Supabase scheduled functions、または外部Cronへの移行も想定する。

## 18. API Routes設計

すべてのAPI Routeで以下を守る。

- 入力バリデーション
- エラーハンドリング
- 認証チェック
- `user_id` によるデータ分離
- 秘密情報をクライアントへ返さない
- エラーログ保存

Routes:

- `app/api/dashboard/summary/route.ts`: KPI、チェック結果、ランキング、予定などダッシュボード概要を返す。
- `app/api/buzz/collect/route.ts`: 手動実行のバズ収集。Phase 4以降でThreads API読み取りを行う。
- `app/api/buzz/import/route.ts`: CSV、URL、本文、反応数の手動インポートを受け付ける。
- `app/api/ideas/generate/route.ts`: 投稿案30本生成。OpenAI APIキーがない場合は貼り付け用プロンプトを生成する。
- `app/api/ideas/check/route.ts`: 人間味、テンプレ危険度、競合類似度、CTAリスク、ブランド一致を評価する。
- `app/api/reservations/create/route.ts`: 採用済み投稿案から予約を作成する。
- `app/api/reservations/publish-due/route.ts`: 期限到来かつ承認済みの予約投稿を実行する。
- `app/api/insights/collect/route.ts`: 投稿後インサイトを取得して保存する。
- `app/api/reports/daily/route.ts`: 日次レポートを生成してDB保存する。
- `app/api/threads/test/route.ts`: Threads API接続テストを行う。
- `app/api/settings/update/route.ts`: 設定変更を保存する。
- `app/api/cron/collect-buzz/route.ts`: Cron用バズ投稿収集。`CRON_SECRET` 必須。
- `app/api/cron/publish-due/route.ts`: Cron用予約投稿チェック。`CRON_SECRET` 必須。
- `app/api/cron/collect-insights/route.ts`: Cron用インサイト取得。`CRON_SECRET` 必須。
- `app/api/cron/daily-report/route.ts`: Cron用日次レポート生成。`CRON_SECRET` 必須。

## 19. UIページ設計

### ダッシュボード

- KPI
- 編集長チェック
- テンプレ乱発チェック
- ブランド人格
- 安全チェック
- 昨日のバズ投稿TOP20
- 今日の狙い目ジャンル
- 本日のおすすめ投稿案
- 投稿スケジュール
- 伸びたフックTOP10
- 投稿タイプ別バランス
- 占いカレンダー
- 画像モチーフ使い回しチェック

### バズ調査

- バズ投稿一覧
- キーワードフィルター
- ジャンルフィルター
- 型フィルター
- 投稿タイプフィルター
- スコア順ソート
- データ信頼度
- 手動インポート導線

### キーワード管理

- キーワード追加
- 編集
- 削除
- 有効/無効
- 優先度設定
- ブランド別パックON/OFF

### 投稿案生成

- 30本生成
- AIスコア
- 人間味スコア
- テンプレ危険度
- 投稿判断
- 競合類似度
- 鮮度スコア
- CTAリスク
- ブランド口調一致
- 採用
- 修正
- ボツ
- 予約へ

### 投稿予約

- 予約一覧
- 承認待ち
- 予約済み
- 投稿済み
- エラー
- 投稿内容編集
- 予約日時変更
- キャンセル

### インサイト

- 投稿別成果
- ジャンル別成果
- 型別成果
- 投稿タイプ別成果
- CTA別成果
- 画像モチーフ別成果

### ブランド設定

- 口調
- 世界観
- 読者像
- NG表現
- よく使う表現
- CTAスタイル
- 参考投稿

### 占いカレンダー

- 新月
- 満月
- 一粒万倍日
- 天赦日
- 水星逆行
- 季節イベント
- おすすめ投稿角度
- 避ける表現

### CTA管理

- CTA一覧
- 使用回数
- 平均スコア
- リスクレベル
- 前回使用日

### 実験管理

- 仮説登録
- テスト期間
- 成功指標
- 結果入力
- 学び保存

### 手動インポート

- CSV貼り付け
- 投稿URL入力
- 投稿本文入力
- 反応数入力
- インポート実行

### 設定

- Threads API設定
- OpenAI API設定
- 投稿上限
- 最低投稿間隔
- NGワード
- スコア係数
- 投稿タイプ比率
- テンプレ危険度基準
- レポート時刻

## 20. Threads API連携方針

Phase 4 以降で読み取り系を実装する。Access Token や Secret は Supabase 側または Vercel 環境変数で安全に保存し、クライアントへ露出しない。

Threads API の `keyword_search` が利用可能な場合は使用する。権限不足、仕様変更、APIエラー、取得件数不足の場合は以下へフォールバックする。

1. 手動インポート
2. CSVインポート
3. 自アカウント投稿取得
4. 競合投稿URLの手動登録
5. デモデータ

## 21. 投稿予約・投稿実行方針

対応投稿:

- TEXT
- IMAGE
- VIDEO
- THREAD

予約可能条件:

- 人間が採用済み
- 投稿判断が「投稿推奨」または「修正後投稿推奨」
- テンプレ危険度が高すぎない
- 競合類似度が高すぎない
- NGワードがない
- 同じCTAが連続していない
- 最低投稿間隔を守っている
- 本日の投稿上限を超えていない

投稿実行時は投稿ログを保存し、エラー時は停止する。無限リトライは禁止する。

## 22. Phase 7 拡張方針

Phase 7 で将来的にSaaS化する。初期から実装しないが、DB設計とコード構造は拡張しやすく保つ。

候補:

- Supabase Auth
- ユーザーごとのデータ分離
- organization / workspace
- 複数Threadsアカウント管理
- 権限管理
- Stripe課金
- プラン別制限
- 利用量制限
- 管理者画面
- Google Sheetsエクスポート
- CSVエクスポート
- PDFレポート
- 監査ログ
