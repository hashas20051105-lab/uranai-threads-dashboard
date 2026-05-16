alter table public.buzz_posts
  add column if not exists data_source text not null default 'demo',
  add column if not exists collected_date date not null default (now() at time zone 'Asia/Tokyo')::date,
  add column if not exists detected_genre text,
  add column if not exists media_type text not null default 'text',
  add column if not exists elapsed_hours numeric not null default 0,
  add column if not exists engagement_total integer not null default 0,
  add column if not exists pattern_type text,
  add column if not exists ai_summary text,
  add column if not exists ai_reason text,
  add column if not exists data_confidence_level text not null default 'medium',
  add column if not exists missing_fields jsonb not null default '[]'::jsonb,
  add column if not exists memo text;

update public.buzz_posts
set
  data_source = coalesce(nullif(data_source, ''), source, 'demo'),
  collected_date = coalesce(collected_date, (collected_at at time zone 'Asia/Tokyo')::date),
  detected_genre = coalesce(detected_genre, genre),
  pattern_type = coalesce(pattern_type, pattern_name),
  engagement_total = coalesce(engagement_total, like_count + reply_count + repost_count + quote_count),
  data_confidence_level = case
    when data_confidence >= 0.8 then 'high'
    when data_confidence >= 0.45 then 'medium'
    else 'low'
  end
where data_source is null
   or detected_genre is null
   or pattern_type is null
   or engagement_total = 0;

create index if not exists buzz_posts_data_source_idx on public.buzz_posts(data_source);
create index if not exists buzz_posts_confidence_level_idx on public.buzz_posts(data_confidence_level);
create index if not exists buzz_posts_detected_genre_idx on public.buzz_posts(detected_genre);
create index if not exists buzz_posts_post_type_idx on public.buzz_posts(post_type);
create index if not exists buzz_posts_posted_at_idx on public.buzz_posts(posted_at desc);
