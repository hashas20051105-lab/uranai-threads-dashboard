# Supabaseセットアップ

SupabaseのSQL Editorで以下の順番に実行してください。

1. `migrations/001_initial_schema.sql`
2. `migrations/002_phase2_idea_generation.sql`
3. `seed.sql`

`001_initial_schema.sql` は占いThreadsバズ司令塔の主要テーブルを作成します。
`002_phase2_idea_generation.sql` は投稿案生成に必要な追加カラムを作成します。
`seed.sql` は占い全般のデモデータを登録します。

重要なAPIキーやトークンはDBに平文保存しません。`api_credentials` は環境変数名や状態などのメタデータだけを保存します。
