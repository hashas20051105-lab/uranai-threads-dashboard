# 占いThreadsバズ司令塔 PHASE PLAN

## 基本方針

このプロジェクトは一気に全機能を実装しない。Phase 0 から Phase 7 まで順番に少しずつ実装し、各Phaseごとに動く状態で止める。

各Phaseでは、未実装機能を無理に作り込まず、必要に応じてモックまたはプレースホルダーで表示する。次Phaseに進む前に、そのPhaseの完了条件を満たしていることを確認する。

## Phase 0: プロジェクト基盤

### 目的

Next.js + Supabase + Vercel で開発できる基盤を作る。

### 実装内容

- Next.jsプロジェクト作成または既存構成確認
- TypeScript設定
- Tailwind CSS設定
- shadcn/ui導入
- lucide-react導入
- Recharts導入
- Supabaseクライアント設定
- 環境変数設定
- GitHub連携前提の構成確認
- README作成または更新
- `middleware.ts` のスケルトン配置
- `lib/constants.ts` の作成
- `DEFAULT_USER_ID` の定義

### 作成予定ファイル

- `app/layout.tsx`
- `app/page.tsx`
- `lib/constants.ts`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `middleware.ts`
- `.env.example`
- `README.md`
- 必要に応じて設定ファイル

### 完了条件

- ローカルでNext.jsが起動する。
- TypeScriptの型チェックが通る。
- Tailwind CSSが有効になっている。
- shadcn/ui、lucide-react、Recharts が利用可能になっている。
- Supabase接続用の環境変数名が整理されている。
- Secret系環境変数がクライアントに露出しない設計になっている。
- `DEFAULT_USER_ID` が共通定数として参照できる。

### 次Phaseへの引き継ぎ

Phase 1 では、この基盤上にUI、デモデータ、Supabase基本DB設計を載せる。

### このPhaseでは実装しないもの

- 本格的なダッシュボードUI
- Supabase本番テーブルの全実装
- Threads API接続
- OpenAI API接続
- 投稿案生成
- 投稿予約
- Cron処理

## Phase 1: UI + デモデータ + Supabase基本DB

### 目的

API未接続でも、完成イメージのダッシュボードを確認できる状態を作る。

### 実装内容

- 左サイドバー
- 上部ヘッダー
- ダッシュボード画面
- KPIカード
- 編集長チェックカード
- テンプレ乱発チェックカード
- ブランド人格カード
- 安全チェックカード
- 昨日のバズ投稿TOP20テーブル
- 今日の狙い目ジャンルカード
- 本日のおすすめ投稿案カード
- 投稿タイプ別バランスチャート
- 伸びたフックTOP10
- 占いカレンダー
- 画像モチーフ使い回しチェック
- 投稿スケジュール
- デモデータ投入

### 作成予定ファイル

- `app/dashboard/page.tsx`
- `components/layout/sidebar.tsx`
- `components/layout/header.tsx`
- `components/dashboard/*`
- `components/cards/*`
- `components/charts/*`
- `components/tables/*`
- `services/dashboard-service.ts`
- `supabase/seed.sql`
- 必要な型定義

### 完了条件

- API未接続でもダッシュボードが表示できる。
- Supabaseのデモデータ、またはローカルのデモデータ生成ロジックから表示される。
- 参考UI画像の雰囲気を踏まえつつ、画像内の文言、数値、ランキング、ブランド名をコピーしていない。
- 画面上に未実装機能はプレースホルダーとして明示されている。

### 次Phaseへの引き継ぎ

Phase 2 では、表示している投稿案やチェックカードに生成・評価ロジックを接続する。

### このPhaseでは実装しないもの

- Threads API接続
- OpenAI API接続
- 実際の投稿生成
- 投稿実行
- 予約投稿のCron実行

## Phase 2: 投稿案生成・編集長チェック・テンプレ危険度

### 目的

占い投稿案を生成し、AI量産っぽさを避ける編集機能を作る。

### 実装内容

- 投稿案30本生成
- 投稿タイプ分散
- 人間味スコア
- テンプレ危険度
- 投稿判断
- 競合類似度
- 鮮度スコア
- CTAリスク
- ブランド口調一致
- 改善提案
- 日常素材入力
- 投稿前チェックリスト
- 画像生成プロンプト生成
- OpenAI APIキーがある場合はAI生成
- OpenAI APIキーがない場合はChatGPT貼り付け用プロンプト生成

### 作成予定ファイル

- `app/ideas/page.tsx`
- `app/api/ideas/generate/route.ts`
- `app/api/ideas/check/route.ts`
- `services/idea-service.ts`
- `services/safety-service.ts`
- `lib/openai/*`
- `lib/scoring/*`
- `lib/safety/*`
- `components/forms/daily-material-form.tsx`
- `components/cards/idea-card.tsx`

### 完了条件

- 30本の投稿案を生成またはプロンプト出力できる。
- ブランド人格DB、占いカレンダー、日常素材を参照する設計になっている。
- 投稿案ごとに人間味スコア、テンプレ危険度、投稿判断が表示される。
- 採用、修正、ボツの状態管理ができる。
- テンプレ乱発を防ぐチェックが動作する。

### 次Phaseへの引き継ぎ

Phase 3 では、投稿案の元になるバズ投稿データを手動インポートで蓄積する。

### このPhaseでは実装しないもの

- Threads APIによる投稿収集
- Threadsへの投稿実行
- インサイト回収
- 複数ユーザー対応

## Phase 3: バズ調査・分析DB・手動インポート

### 目的

Threads API未接続でも、手動インポートでバズ分析できる状態を作る。

### 実装内容

- 手動インポート画面
- CSVインポート
- 投稿URL入力
- 投稿本文入力
- 反応数入力
- バズスコア計算
- ジャンル分類
- フック抽出
- 型分析
- 投稿タイプ分類
- 画像モチーフ抽出
- `data_confidence` 表示

### 作成予定ファイル

- `app/buzz/page.tsx`
- `app/import/page.tsx`
- `app/api/buzz/import/route.ts`
- `services/buzz-service.ts`
- `lib/scoring/buzz-score.ts`
- `lib/validation/import-schema.ts`
- `components/tables/buzz-posts-table.tsx`
- `components/forms/manual-import-form.tsx`

### 完了条件

- 手動入力またはCSV貼り付けでバズ投稿を保存できる。
- 初期式で `buzz_score` を算出できる。
- バズ投稿一覧でスコア順ソートとフィルターが使える。
- データ信頼度を表示できる。
- 投稿案生成が手動インポートデータを参照できる。

### 次Phaseへの引き継ぎ

Phase 4 では、手動インポートで作ったDB構造にThreads APIの読み取り結果を保存する。

### このPhaseでは実装しないもの

- Threads API接続
- 自動収集Cron
- 投稿実行
- インサイト取得

## Phase 4: Threads API連携 読み取り系

### 目的

Threads APIを使って、占い系投稿を収集できるようにする。

### 実装内容

- Threads API設定画面
- Access Token保存方針の実装
- User ID保存方針の実装
- API接続テスト
- キーワード検索
- 前日投稿収集
- 重複排除
- バズ投稿DB保存
- エラーログ保存
- 権限不足や仕様変更時のフォールバック

### 作成予定ファイル

- `app/settings/page.tsx`
- `app/api/threads/test/route.ts`
- `app/api/buzz/collect/route.ts`
- `app/api/cron/collect-buzz/route.ts`
- `services/threads-service.ts`
- `lib/threads/client.ts`
- `lib/threads/types.ts`
- `lib/validation/threads-schema.ts`

### 完了条件

- サーバー側からThreads API接続テストができる。
- 秘密情報がクライアントに返らない。
- 取得した投稿を重複排除して `buzz_posts` に保存できる。
- APIエラー時に `error_logs` へ保存される。
- APIが使えない場合、手動インポートやデモデータへフォールバックできる。

### 次Phaseへの引き継ぎ

Phase 5 では、人間が承認した投稿案を予約し、Threadsへ投稿できるようにする。

### このPhaseでは実装しないもの

- 投稿実行
- インサイト取得
- 課金
- 複数ユーザー向けトークン管理

## Phase 5: 投稿予約・投稿実行

### 目的

人間が承認した投稿だけ、Threadsに予約投稿できるようにする。

### 実装内容

- 投稿予約画面
- 投稿案から予約作成
- 予約日時設定
- 投稿前チェック
- 人間承認
- 予約済み一覧
- 投稿実行API
- 投稿ログ保存
- エラー時停止
- 無限リトライ防止
- TEXT、IMAGE、VIDEO、THREAD投稿対応

### 作成予定ファイル

- `app/reservations/page.tsx`
- `app/schedule/page.tsx`
- `app/api/reservations/create/route.ts`
- `app/api/reservations/publish-due/route.ts`
- `app/api/cron/publish-due/route.ts`
- `services/reservation-service.ts`
- `lib/validation/reservation-schema.ts`
- `components/forms/reservation-form.tsx`
- `components/tables/reservations-table.tsx`

### 完了条件

- 採用済み投稿案から予約を作成できる。
- 予約可能条件を満たさない投稿は予約できない。
- 人間承認済みの投稿だけ投稿実行対象になる。
- 投稿ログとエラー情報が保存される。
- 無限リトライしない。

### 次Phaseへの引き継ぎ

Phase 6 では、投稿後の成果を回収し、次回提案やレポートに反映する。

### このPhaseでは実装しないもの

- 高度なA/Bテスト自動化
- PDF出力
- Google Sheetsエクスポート
- 複数ユーザー対応

## Phase 6: インサイト回収・学習・レポート

### 目的

投稿後の成果を回収し、次回提案に反映する。

### 実装内容

- インサイト取得
- 投稿別成果表示
- ジャンル別成果
- 型別成果
- 投稿タイプ別成果
- フック別成果
- CTA別成果
- 画像モチーフ別成果
- 日次レポート
- 週間レポート
- 次回提案
- 実験管理
- 投稿後 1時間 / 3時間 / 6時間 / 24時間 / 48時間 の取得

### 作成予定ファイル

- `app/insights/page.tsx`
- `app/reports/page.tsx`
- `app/experiments/page.tsx`
- `app/api/insights/collect/route.ts`
- `app/api/reports/daily/route.ts`
- `app/api/cron/collect-insights/route.ts`
- `app/api/cron/daily-report/route.ts`
- `services/insight-service.ts`
- `services/report-service.ts`
- `components/charts/*`
- `components/tables/insights-table.tsx`

### 完了条件

- 投稿別インサイトを取得してDB保存できる。
- ジャンル、型、投稿タイプ、フック、CTA、画像モチーフ別に成果を表示できる。
- 日次レポートと週間レポートをDB保存し、画面表示できる。
- 次回提案に学習結果を反映できる。

### 次Phaseへの引き継ぎ

Phase 7 では、複数ユーザー、課金、販売向け機能を追加する。

### このPhaseでは実装しないもの

- PDF出力
- CSVエクスポート
- Google Sheetsエクスポート
- メール送信
- Slack通知
- Stripe課金

## Phase 7: 複数ユーザー・課金・販売向け拡張

### 目的

将来的に人に使わせられるSaaSにする。

### 実装内容

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

### 作成予定ファイル

- `app/auth/*`
- `app/admin/*`
- `app/billing/*`
- `services/auth-service.ts`
- `services/billing-service.ts`
- `services/export-service.ts`
- `middleware.ts` の認証強化
- 必要なDBマイグレーション

### 完了条件

- Supabase Auth のユーザーIDでデータを分離できる。
- 複数アカウントやワークスペースの基本管理ができる。
- プラン別制限や利用量制限の基盤がある。
- 販売・運用に必要な監査ログと管理画面の基盤がある。

### 次Phaseへの引き継ぎ

Phase 7 完了後は、販売導線、オンボーディング、運用監視、サポート機能などを拡張フェーズとして検討する。

### このPhaseでは実装しないもの

- 他社ツールのコードや購入者限定コンテンツのコピー
- 規約違反を目的とした自動化
- 無制限の占いテンプレ大量生成と連投
