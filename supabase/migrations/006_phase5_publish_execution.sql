-- Phase 5後半: Threads投稿実行用の安全管理カラムと投稿ログ拡張。
-- 実投稿は approved_by_human=true / status=scheduled / scheduled_at<=now の予約だけを対象にする。

alter table if exists public.post_reservations add column if not exists retry_count integer not null default 0;
alter table if exists public.post_reservations add column if not exists last_attempted_at timestamptz;
alter table if exists public.post_reservations add column if not exists last_error_type text;

alter table if exists public.post_logs add column if not exists idea_id uuid references public.post_ideas(id) on delete set null;
alter table if exists public.post_logs add column if not exists action text;
alter table if exists public.post_logs add column if not exists request_summary jsonb not null default '{}'::jsonb;
alter table if exists public.post_logs add column if not exists response_summary jsonb not null default '{}'::jsonb;
alter table if exists public.post_logs add column if not exists retry_count integer not null default 0;

create index if not exists post_reservations_publish_due_idx
  on public.post_reservations(status, scheduled_at)
  where status = 'scheduled';

create index if not exists post_reservations_threads_post_id_idx
  on public.post_reservations(threads_post_id);

create index if not exists post_logs_reservation_id_idx
  on public.post_logs(reservation_id);

