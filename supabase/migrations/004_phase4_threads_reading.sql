alter table public.buzz_posts
  add column if not exists keyword text;

alter table public.error_logs
  add column if not exists error_type text;

create index if not exists buzz_posts_threads_post_id_idx on public.buzz_posts(threads_post_id);
create index if not exists buzz_posts_keyword_idx on public.buzz_posts(keyword);
create index if not exists error_logs_error_type_idx on public.error_logs(error_type);
