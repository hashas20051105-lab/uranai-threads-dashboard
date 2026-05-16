# 占いThreadsバズ司令塔 DEVELOPMENT RULES

## 1. 実装ルール

- `docs/MASTER_SPEC.md` と `docs/PHASE_PLAN.md` を基準に、Phase順で実装する。
- 一気に全機能を実装しない。
- 各Phaseごとに動く状態で止める。
- 未実装機能は無理に作らず、プレースホルダーまたはモックとして扱う。
- 既存ファイルを変更する前に、現在の実装意図を確認する。
- 実装は Next.js、TypeScript、React、Tailwind CSS、shadcn/ui、lucide-react、Recharts、Supabase を基本とする。
- DBマイグレーションは、該当Phaseで必要になったテーブルから順番に作る。

## 2. 禁止事項

以下は実装しない。

- Threads / Meta のID・パスワード保存
- 自動ログイン
- ブラウザスクレイピング
- 画面操作の自動化
- 自動いいね
- 自動フォロー
- 自動リプ連打
- 凍結回避目的の不自然な挙動偽装
- 他社ツールのコードや購入者限定コンテンツのコピー
- 占いテンプレを無制限に大量生成して連投する仕組み

本プロダクトは公式API前提の安全な運用補助ツールであり、規約回避や不自然な自動化を目的にしない。

## 3. セキュリティ方針

- 秘密情報はクライアントへ返さない。
- API Route では入力バリデーション、認証チェック、エラーハンドリング、エラーログ保存を行う。
- `user_id` によるデータ分離を前提にする。
- Phase 0 から Phase 6 は単一ユーザー運用として `DEFAULT_USER_ID` を使う。
- Phase 7 で Supabase Auth を導入した後は `auth.users.id` を使う。
- Secretの平文DB保存は禁止する。
- 本番ログにAPIキー、トークン、Secret、個人情報を出力しない。

## 4. 環境変数の扱い

使用予定の環境変数:

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

`NEXT_PUBLIC_` で始まる値のみクライアント利用を許可する。ただし公開してよい値かを毎回確認する。

以下はサーバー側専用とする。

- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `THREADS_APP_SECRET`
- `THREADS_ACCESS_TOKEN`
- `CRON_SECRET`

## 5. APIキーをクライアントに出さないルール

- OpenAI API、Threads API、Supabase Service Role Key は必ずサーバー側で使用する。
- Client Component から直接 Secret を参照しない。
- API Route のレスポンスに Secret、Token、Key、Secretを含むエラー詳細を返さない。
- 設定画面で接続状態を表示する場合も、値そのものではなく `configured`、`missing`、`expired` などの状態だけを返す。

## 6. Supabase Service Role Keyの扱い

- `SUPABASE_SERVICE_ROLE_KEY` はサーバー側の管理処理に限定して使う。
- ブラウザへ送信しない。
- Client Component で import される可能性のあるファイルに書かない。
- RLSを迂回できる強い権限であるため、使用箇所を最小化する。
- 可能な処理は anon key + RLS で行い、Service Role はCronや管理処理などに限定する。

## 7. Threads API利用時の注意

- 公式APIを前提にする。
- Threads / Meta のID・パスワードは保存しない。
- 自動ログインやブラウザ操作は行わない。
- Access TokenやSecretはサーバー側で扱い、クライアントに返さない。
- `keyword_search` が利用できる場合は使用する。
- 権限不足、仕様変更、APIエラー、取得件数不足の場合は以下へフォールバックする。

1. 手動インポート
2. CSVインポート
3. 自アカウント投稿取得
4. 競合投稿URLの手動登録
5. デモデータ

## 8. OpenAI API利用時の注意

- OpenAI APIキーはサーバー側のみで扱う。
- APIキーが存在する場合は投稿案や改善提案の生成に使う。
- APIキーが存在しない場合は、ChatGPTへ貼り付けるためのプロンプトを生成する。
- 出力はそのまま投稿せず、編集長チェック、テンプレ危険度、人間承認を通す。
- 占いテンプレの無制限大量生成や連投を目的にしない。

## 9. 自動ログイン・スクレイピング禁止

- ブラウザスクレイピングは行わない。
- Puppeteer、Playwright、ブラウザ拡張、画面操作自動化などでThreads画面を操作しない。
- 公式APIで取得できない情報は、手動インポート、CSVインポート、URL手動登録、デモデータで補う。

## 10. 投稿前人間承認必須

投稿実行は、人間が承認した投稿だけを対象にする。

予約可能条件:

- 人間が採用済み
- 投稿判断が「投稿推奨」または「修正後投稿推奨」
- テンプレ危険度が高すぎない
- 競合類似度が高すぎない
- NGワードがない
- 同じCTAが連続していない
- 最低投稿間隔を守っている
- 本日の投稿上限を超えていない

エラー時は停止し、無限リトライしない。

## 11. AI量産・テンプレ乱発を避ける方針

本プロダクトは「占いテンプレ量産ツール」ではなく「占いアカウント編集長ツール」として設計する。

必須の対策:

- 投稿タイプ分散
- 人間味スコア
- テンプレ危険度
- 日常素材入力
- 投稿ローテーション制御
- 競合コピー防止
- 投稿しない判断
- 投稿前チェックリスト
- CTA管理
- 画像使い回しチェック

テンプレ危険度の主な観点:

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

## 12. 参考UI画像の扱い

参考UI画像は、デザイン、レイアウト、画面構成、雰囲気のみを参照する。

参考にする:

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

参考にしない:

- UI画像内の投稿文
- UI画像内のジャンル名
- UI画像内の数値
- UI画像内のランキング
- UI画像内のサンプルデータ
- UI画像内の特定ブランド名

OCR的に読み取って中身を実装しない。

## 13. エラーログ方針

- API Route、Cron、外部API連携、投稿実行、インサイト取得で発生したエラーは `error_logs` に保存する。
- 保存する情報は、source、route、severity、message、details、created_at を基本とする。
- Secret、Token、APIキーはログに保存しない。
- ユーザーに返すエラーは短く安全なメッセージにする。
- 詳細はサーバーログまたはDBの安全な詳細欄で確認する。

## 14. 未実装機能はプレースホルダーにする方針

- 将来実装予定の画面やカードは、該当Phaseまでプレースホルダーでよい。
- プレースホルダーには「未接続」「Phase Xで実装予定」などを表示する。
- 見た目だけで実際に動くように見せかけない。
- API未接続の段階ではデモデータであることを区別できるようにする。

## 15. lib/ と services/ の責務分担

`lib/` はDBに直接依存しない処理を置く。

- 外部APIクライアント
- Supabaseクライアント
- 純粋関数
- スコア計算
- 文字列正規化
- バリデーション
- ユーティリティ
- DBに直接依存しない処理

`services/` はDBアクセスを含む業務ロジックを置く。

- 複数テーブルをまたぐ処理
- 投稿案生成フロー
- バズ収集フロー
- 予約投稿フロー
- インサイト保存フロー
- レポート生成フロー

Client Component から `services/` を直接呼ばない。画面からは Server Component、Server Action、または API Route を通して呼び出す。

## 16. DEFAULT_USER_ID の扱い

Phase 0 から Phase 6 では、Supabase Auth本格導入前の単一ユーザー運用として以下を使う。

```ts
export const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000";
```

- DB保存時には必ず `user_id` を付ける。
- API Routeでも `user_id` を意識した設計にする。
- Phase 7 で Supabase Auth を導入したら、`auth.users.id` に置き換える。
- 移行しやすいように、コード内へ文字列を直書きせず `lib/constants.ts` から参照する。

## 17. JSONB の使用方針

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

Phase 1 から Phase 6 では JSONB を優先して実装をシンプルにする。検索や集計が重くなった場合は、将来のPhaseで中間テーブルへ正規化する。

## 18. Secret平文保存禁止

- DBにAPIキー、Access Token、Refresh Token、Secretを平文保存しない。
- Phase 0 から Phase 6 では、重要なAPIキーやトークンは Vercel 環境変数で管理する。
- `api_credentials` は将来的な複数ユーザー対応のメタデータ保存先とする。
- `api_credentials` に保存してよい情報は、provider、credential_type、env_key_name、status、expires_at、last_checked_at などのメタデータに限定する。

## 19. Cron初期設定

タイムゾーンは `Asia/Tokyo`、JST基準とする。

初期スケジュール:

- バズ投稿収集: 毎朝 07:00 JST
- 日次レポート生成: 毎晩 23:00 JST
- 予約投稿チェック: 5分ごと
- インサイト取得: 投稿後 1時間 / 3時間 / 6時間 / 24時間 / 48時間
- トークン期限チェック: 毎日 08:00 JST
- 安全チェック更新: 毎日 08:10 JST

Cron API Route は `CRON_SECRET` で保護する。設定画面から時刻や頻度を変更可能にする。

Vercel Hobby環境ではCron頻度に制限がある可能性があるため、本格運用では Vercel Pro、Supabase scheduled functions、または外部Cronへの移行も想定する。

## 20. API Route共通ルール

すべてのAPI Routeで以下を守る。

- 入力バリデーションを行う。
- 認証チェックを行う。
- `user_id` によるデータ分離を行う。
- エラーハンドリングを行う。
- 秘密情報をクライアントへ返さない。
- エラーログを保存する。
- 外部APIの失敗時には安全なフォールバックを用意する。

Cron用API Routeでは `CRON_SECRET` を検証する。
