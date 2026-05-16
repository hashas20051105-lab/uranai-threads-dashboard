-- 占いThreadsバズ司令塔 demo seed
-- Run after supabase/migrations/001_initial_schema.sql.

insert into public.accounts (
  id,
  user_id,
  account_name,
  threads_user_id,
  handle,
  follower_count,
  status,
  memo
) values (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  '占い編集部デモ',
  'demo_threads_user',
  'demo_fortune_editor',
  0,
  'active',
  'Phase 1-6 single-user demo account'
) on conflict (id) do update set
  account_name = excluded.account_name,
  threads_user_id = excluded.threads_user_id,
  handle = excluded.handle,
  follower_count = excluded.follower_count,
  status = excluded.status,
  memo = excluded.memo;

insert into public.api_credentials (
  id,
  user_id,
  account_id,
  provider,
  credential_type,
  env_key_name,
  status,
  memo
) values
  (
    '12111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'threads',
    'access_token',
    'THREADS_ACCESS_TOKEN',
    'not_configured',
    'Metadata only. Do not store token value here.'
  ),
  (
    '12111111-1111-1111-1111-111111111112',
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'openai',
    'api_key',
    'OPENAI_API_KEY',
    'not_configured',
    'Metadata only. Do not store API key value here.'
  )
on conflict (id) do nothing;

insert into public.genres (id, user_id, name, parent_genre, related_keywords, is_active) values
  ('21111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', '今日の運勢', '総合占い', '["占い","今日の運勢","運勢","運気"]', true),
  ('21111111-1111-1111-1111-111111111112', '00000000-0000-0000-0000-000000000000', '恋愛占い', '恋愛占い', '["恋愛運","片思い","好きな人","あの人の気持ち"]', true),
  ('21111111-1111-1111-1111-111111111113', '00000000-0000-0000-0000-000000000000', '仕事運', '金運・仕事運', '["仕事運","転職運","副業運"]', true),
  ('21111111-1111-1111-1111-111111111114', '00000000-0000-0000-0000-000000000000', '金運', '金運・仕事運', '["金運","臨時収入","財布","お金の流れ"]', true),
  ('21111111-1111-1111-1111-111111111115', '00000000-0000-0000-0000-000000000000', 'タロット', '占術', '["タロット","カード","占術"]', true),
  ('21111111-1111-1111-1111-111111111116', '00000000-0000-0000-0000-000000000000', '満月', '季節・天体・開運日', '["満月","月","手放し"]', true)
on conflict (id) do update set
  name = excluded.name,
  parent_genre = excluded.parent_genre,
  related_keywords = excluded.related_keywords,
  is_active = excluded.is_active;

insert into public.keywords (id, user_id, account_id, keyword, category, priority, is_active, source) values
  ('22111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', '占い', '総合占い', 100, true, 'default'),
  ('22111111-1111-1111-1111-111111111112', '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', '今日の運勢', '総合占い', 95, true, 'default'),
  ('22111111-1111-1111-1111-111111111113', '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', '恋愛運', '恋愛占い', 90, true, 'default'),
  ('22111111-1111-1111-1111-111111111114', '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', '仕事運', '金運・仕事運', 80, true, 'default'),
  ('22111111-1111-1111-1111-111111111115', '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'タロット', '占術', 80, true, 'default'),
  ('22111111-1111-1111-1111-111111111116', '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', '満月', '季節・天体・開運日', 70, true, 'default')
on conflict (id) do update set
  keyword = excluded.keyword,
  category = excluded.category,
  priority = excluded.priority,
  is_active = excluded.is_active,
  source = excluded.source;

insert into public.keyword_packs (id, user_id, account_id, pack_name, pack_type, keywords, is_enabled, memo) values
  ('23111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', '恋愛特化パック', 'love', '["恋愛運","片思い","復縁","相性占い","好きな人"]', false, 'Optional brand pack'),
  ('23111111-1111-1111-1111-111111111112', '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', '神社・開運日パック', 'lucky_day', '["神社","一粒万倍日","天赦日","お守り","パワースポット"]', false, 'Optional brand pack'),
  ('23111111-1111-1111-1111-111111111113', '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', '金運特化パック', 'money', '["金運","財布","臨時収入","収入アップ"]', false, 'Optional brand pack')
on conflict (id) do update set
  keywords = excluded.keywords,
  is_enabled = excluded.is_enabled,
  memo = excluded.memo;

insert into public.brand_personas (
  id,
  user_id,
  account_id,
  brand_name,
  persona_name,
  tone,
  worldview,
  target_reader,
  common_phrases,
  banned_phrases,
  writing_rules,
  cta_style,
  example_posts,
  memo
) values (
  '31111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  '占い編集部デモ',
  '静かな編集長',
  '親しみやすく、断定しすぎず、読者の選択を尊重する',
  '占いを日常の整理道具として扱う。煽りよりも余白を大切にする。',
  '恋愛、仕事、人間関係の迷いを軽く整理したい読者',
  '["少しだけ振り返る","今の自分に戻る","焦らず整える"]',
  '["絶対に叶う","100%当たる","今すぐ受け取って"]',
  '["過度な断定を避ける","同じCTAを連続させない","日常素材を混ぜる"]',
  '保存やコメント相談を控えめに促す',
  '["今日は予定変更が起きても、焦って結論を出さなくて大丈夫。小さく整える日です。"]',
  'Phase 2 generation should read this persona.'
) on conflict (id) do update set
  brand_name = excluded.brand_name,
  persona_name = excluded.persona_name,
  tone = excluded.tone,
  worldview = excluded.worldview,
  target_reader = excluded.target_reader,
  common_phrases = excluded.common_phrases,
  banned_phrases = excluded.banned_phrases,
  writing_rules = excluded.writing_rules,
  cta_style = excluded.cta_style,
  example_posts = excluded.example_posts,
  memo = excluded.memo;

insert into public.post_type_db (id, user_id, post_type, category, target_ratio, usage_count, average_score) values
  ('32111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', '占い結果型', '占い・運勢系', 25, 12, 780),
  ('32111111-1111-1111-1111-111111111112', '00000000-0000-0000-0000-000000000000', '今日の運勢型', '占い・運勢系', 25, 15, 820),
  ('32111111-1111-1111-1111-111111111113', '00000000-0000-0000-0000-000000000000', '恋愛共感型', '日常・共感系', 20, 9, 760),
  ('32111111-1111-1111-1111-111111111114', '00000000-0000-0000-0000-000000000000', '占術解説型', '占術解説系', 15, 7, 690),
  ('32111111-1111-1111-1111-111111111115', '00000000-0000-0000-0000-000000000000', '裏側・制作過程型', '体験談・裏側系', 10, 4, 640),
  ('32111111-1111-1111-1111-111111111116', '00000000-0000-0000-0000-000000000000', '告知・誘導型', '告知・誘導系', 5, 2, 520)
on conflict (id) do update set
  target_ratio = excluded.target_ratio,
  usage_count = excluded.usage_count,
  average_score = excluded.average_score;

insert into public.buzz_posts (
  id,
  user_id,
  account_id,
  source,
  author_handle,
  body,
  genre,
  pattern_name,
  post_type,
  hook_text,
  visual_motifs,
  like_count,
  reply_count,
  repost_count,
  quote_count,
  view_count,
  buzz_score,
  recency_bonus,
  data_confidence,
  posted_at
) values
  ('41111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'demo', '@daily_oracle_note', '朝の違和感を見逃さないための小さな観察。今日は結論よりも、心が止まった瞬間をメモしてみる日。', '今日の運勢', '前兆サイン型', '日常つぶやき型', '朝の違和感を見逃さない', '["朝の窓辺","手帳","淡い光"]', 3842, 412, 268, 58, 48200, 1284, 45, 0.86, now() - interval '1 day'),
  ('41111111-1111-1111-1111-111111111112', '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'demo', '@quiet_love_tarot', '片思い中に心が疲れた日は、相手の反応よりも自分の呼吸を先に整える。待つ時間にも境界線はあっていい。', '片思い', '恋愛共感型', '恋愛共感型', '心が疲れた日に読む', '["カード","机","小さな花"]', 3518, 389, 241, 42, 42100, 1211, 38, 0.82, now() - interval '1 day'),
  ('41111111-1111-1111-1111-111111111113', '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'demo', '@work_fortune_lab', '仕事運が整う前は、予定変更や小さな連絡の遅れが出ることがあります。焦らず優先順位をひとつ戻して。', '仕事運', '占術解説型', '前兆サイン型', '仕事運が整う前に起きやすい', '["ノート","ペン","デスク"]', 3260, 302, 226, 39, 38900, 1138, 34, 0.81, now() - interval '1 day'),
  ('41111111-1111-1111-1111-111111111114', '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'demo', '@moon_cycle_words', '満月前は、無理に前向きになるよりも、もう背負わなくていいことを一つ減らすほうが合う日です。', '満月', '日常つぶやき型', '日常つぶやき型', '満月前に手放したい考え方', '["月","夜空","白い紙"]', 2988, 255, 218, 31, 36200, 1064, 30, 0.78, now() - interval '1 day'),
  ('41111111-1111-1111-1111-111111111115', '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'demo', '@money_flow_note', '金運を整える日は、大きな行動よりも財布まわりと小さな支払いの見直しから。雑に扱っていたものを丁寧に。', '金運', '開運アドバイス型', '占術解説型', '金運を下げない財布まわり', '["財布","手元","木目"]', 2401, 210, 201, 22, 29500, 943, 24, 0.74, now() - interval '1 day')
on conflict (id) do update set
  body = excluded.body,
  genre = excluded.genre,
  pattern_name = excluded.pattern_name,
  post_type = excluded.post_type,
  hook_text = excluded.hook_text,
  visual_motifs = excluded.visual_motifs,
  like_count = excluded.like_count,
  reply_count = excluded.reply_count,
  repost_count = excluded.repost_count,
  quote_count = excluded.quote_count,
  view_count = excluded.view_count,
  buzz_score = excluded.buzz_score,
  recency_bonus = excluded.recency_bonus,
  data_confidence = excluded.data_confidence,
  posted_at = excluded.posted_at;

insert into public.post_ideas (
  id,
  user_id,
  account_id,
  brand_id,
  title,
  body,
  genre,
  post_type,
  hook_text,
  cta_text,
  source_buzz_ids,
  referenced_trend,
  human_score,
  template_risk_score,
  competitor_similarity_score,
  freshness_score,
  cta_risk_score,
  brand_match_score,
  ai_score,
  decision,
  improvement_suggestions,
  status
) values
  ('51111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', '31111111-1111-1111-1111-111111111111', '今日の違和感を整える3行メモ', '朝、少しだけ心が止まった出来事があるなら、今日はそれを急いで答えにしなくて大丈夫。3行だけ書くと、運の流れより先に自分の本音が見えてきます。', '今日の運勢', '日常つぶやき型', '今日の違和感を整える', 'あとで見返せるように保存しておいてください。', '["41111111-1111-1111-1111-111111111111"]', '{"trend":"朝の違和感フック"}', 86, 22, 18, 91, 28, 88, 84, '投稿推奨', '日常素材を1つ足すとさらに自然です。', 'candidate'),
  ('51111111-1111-1111-1111-111111111112', '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', '31111111-1111-1111-1111-111111111111', '連絡を待つ夜に自分へ戻る問い', '連絡を待つ時間が長く感じる夜は、相手の気持ちを探し続けるより「今の私は何を安心材料にしたいのか」を一度だけ聞いてみて。', '片思い', '恋愛共感型', '連絡を待つ夜に', '同じ気持ちの日のためにメモしておいてください。', '["41111111-1111-1111-1111-111111111112"]', '{"trend":"待つ時間の共感"}', 82, 38, 24, 84, 34, 86, 81, '修正後投稿推奨', 'CTAを軽くすると自然です。', 'needs_edit')
on conflict (id) do update set
  title = excluded.title,
  body = excluded.body,
  decision = excluded.decision,
  status = excluded.status,
  human_score = excluded.human_score,
  template_risk_score = excluded.template_risk_score;

insert into public.fortune_calendar (id, user_id, date, event_name, event_type, related_genre, importance_score, suggested_angle, ng_angle, memo) values
  ('61111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', current_date, '一粒万倍日デモ', 'lucky_day', '開運', 80, '小さく始める行動の整理', '必ず増えるなどの断定', 'Demo calendar event'),
  ('61111111-1111-1111-1111-111111111112', '00000000-0000-0000-0000-000000000000', current_date + 2, '下弦の月デモ', 'moon', '満月', 72, '手放すテーマを日常へ落とす', '不安を煽る表現', 'Demo calendar event'),
  ('61111111-1111-1111-1111-111111111113', '00000000-0000-0000-0000-000000000000', current_date + 5, '新月前デモ', 'moon', '新月', 75, '決めすぎない準備期間', '即効性を強調する表現', 'Demo calendar event')
on conflict (id) do update set
  date = excluded.date,
  event_name = excluded.event_name,
  suggested_angle = excluded.suggested_angle,
  ng_angle = excluded.ng_angle;

insert into public.hook_db (id, user_id, hook_text, hook_type, average_score, usage_count, last_used_at) values
  ('71111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', '朝の違和感を見逃さない', '前兆サイン', 914, 18, now() - interval '1 day'),
  ('71111111-1111-1111-1111-111111111112', '00000000-0000-0000-0000-000000000000', '心が疲れた日に読む', '共感', 882, 16, now() - interval '2 days'),
  ('71111111-1111-1111-1111-111111111113', '00000000-0000-0000-0000-000000000000', '動く前に起きやすい', '前兆サイン', 851, 14, now() - interval '3 days')
on conflict (id) do update set
  average_score = excluded.average_score,
  usage_count = excluded.usage_count,
  last_used_at = excluded.last_used_at;

insert into public.image_motifs (id, user_id, motif_name, motif_type, usage_count, average_score, last_used_at) values
  ('72111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', '月と手元', 'photo', 4, 710, now() - interval '2 days'),
  ('72111111-1111-1111-1111-111111111112', '00000000-0000-0000-0000-000000000000', 'カードの俯瞰', 'photo', 3, 760, now() - interval '1 day'),
  ('72111111-1111-1111-1111-111111111113', '00000000-0000-0000-0000-000000000000', '淡い星空', 'illustration', 5, 680, now())
on conflict (id) do update set
  usage_count = excluded.usage_count,
  average_score = excluded.average_score,
  last_used_at = excluded.last_used_at;

insert into public.cta_db (id, user_id, cta_text, cta_type, risk_level, usage_count, average_score, last_used_at) values
  ('73111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'あとで見返せるように保存しておいてください。', 'save', 'low', 8, 760, now() - interval '1 day'),
  ('73111111-1111-1111-1111-111111111112', '00000000-0000-0000-0000-000000000000', '同じ気持ちの日のためにメモしておいてください。', 'memo', 'low', 5, 720, now() - interval '2 days'),
  ('73111111-1111-1111-1111-111111111113', '00000000-0000-0000-0000-000000000000', '気になるテーマをコメントで教えてください。', 'comment', 'medium', 3, 690, now() - interval '3 days')
on conflict (id) do update set
  usage_count = excluded.usage_count,
  average_score = excluded.average_score,
  last_used_at = excluded.last_used_at;

insert into public.safety_checks (id, user_id, account_id, target_type, target_id, check_type, status, score, details) values
  ('81111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'account', '11111111-1111-1111-1111-111111111111', 'daily_safety', 'ok', 96.8, '{"post_limit":"2/5","ng_words":0,"cta_repeat":false}')
on conflict (id) do update set
  status = excluded.status,
  score = excluded.score,
  details = excluded.details;

insert into public.reports (id, user_id, account_id, report_type, target_date, summary, top_genres, top_hooks, top_patterns, top_post_types, top_motifs, next_recommendations) values
  ('91111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'daily', current_date, 'Phase 6 report demo. DB保存と画面表示を想定したサンプルです。', '["今日の運勢","片思い","仕事運"]', '["朝の違和感を見逃さない","心が疲れた日に読む"]', '["前兆サイン型","恋愛共感型"]', '["日常つぶやき型","今日の運勢型"]', '["月と手元","カードの俯瞰"]', '["日常素材を1件追加","CTAの連続使用を避ける"]')
on conflict (id) do update set
  summary = excluded.summary,
  top_genres = excluded.top_genres,
  next_recommendations = excluded.next_recommendations;
