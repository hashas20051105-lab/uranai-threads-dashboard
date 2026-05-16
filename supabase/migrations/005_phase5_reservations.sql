-- Phase 5前半: post_reservations を投稿予約UIで扱える形へ拡張する。
-- Threadsへの実投稿・publish-due・Cron本番運用はこのPhaseでは実装しない。

alter table if exists public.post_reservations add column if not exists post_type text not null default 'TEXT';
alter table if exists public.post_reservations add column if not exists text text;
alter table if exists public.post_reservations add column if not exists image_url text;
alter table if exists public.post_reservations add column if not exists video_url text;
alter table if exists public.post_reservations add column if not exists thread_group_id uuid;
alter table if exists public.post_reservations add column if not exists thread_order int;
alter table if exists public.post_reservations add column if not exists approved_by_human boolean not null default false;
alter table if exists public.post_reservations add column if not exists approved_at timestamptz;
alter table if exists public.post_reservations add column if not exists posted_at timestamptz;
alter table if exists public.post_reservations add column if not exists threads_post_id text;
alter table if exists public.post_reservations add column if not exists error_message text;

-- 既存Phase 1カラムとの互換。新UIは text/post_type を主に使い、旧body/post_formatにも同内容を保存する。
alter table if exists public.post_reservations alter column body drop not null;
alter table if exists public.post_reservations alter column post_format drop not null;
alter table if exists public.post_reservations alter column media_urls drop not null;

create index if not exists post_reservations_status_idx on public.post_reservations(status);
create index if not exists post_reservations_post_type_idx on public.post_reservations(post_type);
create index if not exists post_reservations_idea_id_idx on public.post_reservations(idea_id);
create index if not exists post_reservations_thread_group_idx on public.post_reservations(thread_group_id, thread_order);
