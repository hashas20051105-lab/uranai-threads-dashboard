-- Phase 6: insights, reports, experiments extension.
-- Reports stay DB + screen display only. PDF/CSV/Sheets/email/Slack are Phase 7+.

alter table if exists public.insights add column if not exists reservation_id uuid references public.post_reservations(id) on delete set null;
alter table if exists public.insights add column if not exists idea_id uuid references public.post_ideas(id) on delete set null;
alter table if exists public.insights add column if not exists collected_at timestamptz not null default now();
alter table if exists public.insights add column if not exists hours_after_post integer;
alter table if exists public.insights add column if not exists repost_count integer not null default 0;
alter table if exists public.insights add column if not exists quote_count integer not null default 0;
alter table if exists public.insights add column if not exists engagement_total integer not null default 0;
alter table if exists public.insights add column if not exists buzz_score numeric not null default 0;
alter table if exists public.insights add column if not exists genre text;
alter table if exists public.insights add column if not exists pattern_type text;
alter table if exists public.insights add column if not exists post_type text;
alter table if exists public.insights add column if not exists hook text;
alter table if exists public.insights add column if not exists cta text;
alter table if exists public.insights add column if not exists visual_motifs jsonb not null default '[]'::jsonb;
alter table if exists public.insights add column if not exists human_score numeric;
alter table if exists public.insights add column if not exists template_risk text;
alter table if exists public.insights add column if not exists data_source text not null default 'api';
alter table if exists public.insights add column if not exists data_confidence text not null default 'low';
alter table if exists public.insights add column if not exists missing_fields jsonb not null default '[]'::jsonb;
alter table if exists public.insights add column if not exists memo text;

-- Keep earlier names usable while Phase 6 code uses the clearer collected_at field.
update public.insights set collected_at = captured_at where collected_at is null and captured_at is not null;
update public.insights set hours_after_post = elapsed_hours where hours_after_post is null and elapsed_hours is not null;

alter table if exists public.reports add column if not exists report_date date;
alter table if exists public.reports add column if not exists template_risk_summary jsonb not null default '{}'::jsonb;
alter table if exists public.reports add column if not exists competitor_ranking jsonb not null default '[]'::jsonb;
alter table if exists public.reports add column if not exists chatgpt_prompt text;

update public.reports set report_date = target_date where report_date is null and target_date is not null;

alter table if exists public.experiments add column if not exists related_reservation_ids jsonb not null default '[]'::jsonb;
alter table if exists public.experiments add column if not exists related_insight_ids jsonb not null default '[]'::jsonb;

create index if not exists insights_reservation_hours_idx on public.insights(reservation_id, hours_after_post);
create index if not exists insights_threads_post_id_idx on public.insights(threads_post_id);
create index if not exists insights_collected_at_idx on public.insights(collected_at);
create index if not exists insights_genre_idx on public.insights(genre);
create index if not exists reports_type_date_idx on public.reports(report_type, report_date);

