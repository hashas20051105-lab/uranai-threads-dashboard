-- 占いThreadsバズ司令塔 initial schema
-- Phase 1-6 use DEFAULT_USER_ID = 00000000-0000-0000-0000-000000000000.
-- Secrets and tokens are not stored in plaintext. api_credentials stores metadata only.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  account_name text not null,
  threads_user_id text,
  handle text,
  status text not null default 'active',
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.api_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  account_id uuid references public.accounts(id) on delete cascade,
  provider text not null,
  credential_type text not null,
  env_key_name text,
  status text not null default 'not_configured',
  expires_at timestamptz,
  last_checked_at timestamptz,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint api_credentials_no_plain_secret check (
    provider is not null
    and credential_type is not null
  )
);

create table if not exists public.keywords (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  account_id uuid references public.accounts(id) on delete cascade,
  keyword text not null,
  category text,
  priority integer not null default 50,
  is_active boolean not null default true,
  source text not null default 'default',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.keyword_packs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  account_id uuid references public.accounts(id) on delete cascade,
  pack_name text not null,
  pack_type text not null,
  keywords jsonb not null default '[]'::jsonb,
  is_enabled boolean not null default false,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.genres (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  name text not null,
  parent_genre text,
  related_keywords jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.buzz_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  account_id uuid references public.accounts(id) on delete set null,
  source text not null default 'demo',
  threads_post_id text,
  post_url text,
  author_handle text,
  body text not null,
  genre text,
  pattern_name text,
  post_type text,
  hook_text text,
  visual_motifs jsonb not null default '[]'::jsonb,
  like_count integer not null default 0,
  reply_count integer not null default 0,
  repost_count integer not null default 0,
  quote_count integer not null default 0,
  view_count integer not null default 0,
  buzz_score numeric not null default 0,
  recency_bonus numeric not null default 0,
  data_confidence numeric not null default 0,
  posted_at timestamptz,
  collected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brand_personas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  account_id uuid references public.accounts(id) on delete cascade,
  brand_name text not null,
  persona_name text,
  tone text,
  worldview text,
  target_reader text,
  common_phrases jsonb not null default '[]'::jsonb,
  banned_phrases jsonb not null default '[]'::jsonb,
  writing_rules jsonb not null default '[]'::jsonb,
  cta_style text,
  example_posts jsonb not null default '[]'::jsonb,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  account_id uuid references public.accounts(id) on delete set null,
  brand_id uuid references public.brand_personas(id) on delete set null,
  title text not null,
  body text not null,
  genre text,
  post_type text,
  hook_text text,
  cta_text text,
  source_buzz_ids jsonb not null default '[]'::jsonb,
  referenced_trend jsonb not null default '{}'::jsonb,
  human_score numeric,
  template_risk_score numeric,
  competitor_similarity_score numeric,
  freshness_score numeric,
  cta_risk_score numeric,
  brand_match_score numeric,
  ai_score numeric,
  decision text not null default 'pending',
  improvement_suggestions text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  account_id uuid references public.accounts(id) on delete set null,
  idea_id uuid references public.post_ideas(id) on delete set null,
  post_format text not null default 'TEXT',
  body text not null,
  media_urls jsonb not null default '[]'::jsonb,
  scheduled_at timestamptz not null,
  status text not null default 'pending_approval',
  approved_by_user boolean not null default false,
  precheck_result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  account_id uuid references public.accounts(id) on delete set null,
  reservation_id uuid references public.post_reservations(id) on delete set null,
  threads_post_id text,
  status text not null default 'pending',
  published_at timestamptz,
  error_message text,
  retry_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  account_id uuid references public.accounts(id) on delete set null,
  post_log_id uuid references public.post_logs(id) on delete set null,
  threads_post_id text,
  captured_at timestamptz not null default now(),
  elapsed_hours integer,
  like_count integer not null default 0,
  reply_count integer not null default 0,
  repost_count integer not null default 0,
  quote_count integer not null default 0,
  view_count integer not null default 0,
  engagement_rate numeric,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pattern_db (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  pattern_name text not null,
  description text,
  average_score numeric not null default 0,
  usage_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hook_db (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  hook_text text not null,
  hook_type text,
  average_score numeric not null default 0,
  usage_count integer not null default 0,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.image_motifs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  motif_name text not null,
  motif_type text,
  usage_count integer not null default 0,
  average_score numeric not null default 0,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.image_prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  idea_id uuid references public.post_ideas(id) on delete set null,
  prompt text not null,
  visual_motifs jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.image_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  image_prompt_id uuid references public.image_prompts(id) on delete set null,
  storage_path text,
  provider text,
  status text not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_type_db (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  post_type text not null,
  category text,
  target_ratio numeric,
  usage_count integer not null default 0,
  average_score numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  account_id uuid references public.accounts(id) on delete cascade,
  date date not null,
  material_text text not null,
  mood text,
  event_context text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.template_risk_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  idea_id uuid references public.post_ideas(id) on delete cascade,
  risk_score numeric not null default 0,
  risk_items jsonb not null default '[]'::jsonb,
  decision text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fortune_calendar (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  date date not null,
  event_name text not null,
  event_type text,
  related_genre text,
  importance_score numeric not null default 0,
  suggested_angle text,
  ng_angle text,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cta_db (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  cta_text text not null,
  cta_type text,
  risk_level text not null default 'low',
  usage_count integer not null default 0,
  average_score numeric not null default 0,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experiments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  account_id uuid references public.accounts(id) on delete cascade,
  hypothesis text not null,
  start_date date,
  end_date date,
  success_metric text,
  result text,
  learning text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.manual_imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  account_id uuid references public.accounts(id) on delete cascade,
  import_type text not null,
  raw_input text,
  parsed_rows jsonb not null default '[]'::jsonb,
  status text not null default 'pending',
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.account_phases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  account_id uuid references public.accounts(id) on delete cascade,
  current_phase text not null default 'phase_1',
  phase_status text not null default 'active',
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.safety_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  account_id uuid references public.accounts(id) on delete cascade,
  target_type text,
  target_id uuid,
  check_type text not null,
  status text not null default 'pending',
  score numeric,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Existing projects may already have public.error_logs/public.settings.
-- Add the columns required by this product without dropping existing columns.
create table if not exists public.error_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  account_id uuid references public.accounts(id) on delete set null,
  source text not null,
  route text,
  severity text not null default 'error',
  message text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.error_logs add column if not exists user_id uuid not null default '00000000-0000-0000-0000-000000000000';
alter table if exists public.error_logs add column if not exists account_id uuid references public.accounts(id) on delete set null;
alter table if exists public.error_logs add column if not exists route text;
alter table if exists public.error_logs add column if not exists severity text not null default 'error';
alter table if exists public.error_logs add column if not exists message text;
alter table if exists public.error_logs add column if not exists details jsonb not null default '{}'::jsonb;
alter table if exists public.error_logs add column if not exists updated_at timestamptz not null default now();

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  account_id uuid references public.accounts(id) on delete cascade,
  report_type text not null,
  target_date date not null,
  summary text,
  top_genres jsonb not null default '[]'::jsonb,
  top_hooks jsonb not null default '[]'::jsonb,
  top_patterns jsonb not null default '[]'::jsonb,
  top_post_types jsonb not null default '[]'::jsonb,
  top_motifs jsonb not null default '[]'::jsonb,
  next_recommendations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000000',
  account_id uuid references public.accounts(id) on delete cascade,
  setting_key text,
  setting_value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.settings add column if not exists user_id uuid not null default '00000000-0000-0000-0000-000000000000';
alter table if exists public.settings add column if not exists account_id uuid references public.accounts(id) on delete cascade;
alter table if exists public.settings add column if not exists setting_key text;
alter table if exists public.settings add column if not exists setting_value jsonb not null default '{}'::jsonb;

create index if not exists accounts_user_id_idx on public.accounts(user_id);
create index if not exists api_credentials_user_id_idx on public.api_credentials(user_id);
create index if not exists api_credentials_account_id_idx on public.api_credentials(account_id);
create index if not exists keywords_user_id_idx on public.keywords(user_id);
create index if not exists keywords_account_id_idx on public.keywords(account_id);
create index if not exists keyword_packs_user_id_idx on public.keyword_packs(user_id);
create index if not exists genres_user_id_idx on public.genres(user_id);
create index if not exists buzz_posts_user_id_idx on public.buzz_posts(user_id);
create index if not exists buzz_posts_buzz_score_idx on public.buzz_posts(buzz_score desc);
create index if not exists buzz_posts_genre_idx on public.buzz_posts(genre);
create index if not exists post_ideas_user_id_idx on public.post_ideas(user_id);
create index if not exists post_ideas_status_idx on public.post_ideas(status);
create index if not exists post_reservations_user_id_idx on public.post_reservations(user_id);
create index if not exists post_reservations_scheduled_at_idx on public.post_reservations(scheduled_at);
create index if not exists post_logs_user_id_idx on public.post_logs(user_id);
create index if not exists insights_user_id_idx on public.insights(user_id);
create index if not exists pattern_db_user_id_idx on public.pattern_db(user_id);
create index if not exists hook_db_user_id_idx on public.hook_db(user_id);
create index if not exists image_motifs_user_id_idx on public.image_motifs(user_id);
create index if not exists image_prompts_user_id_idx on public.image_prompts(user_id);
create index if not exists image_results_user_id_idx on public.image_results(user_id);
create index if not exists post_type_db_user_id_idx on public.post_type_db(user_id);
create index if not exists daily_materials_user_id_idx on public.daily_materials(user_id);
create index if not exists template_risk_logs_user_id_idx on public.template_risk_logs(user_id);
create index if not exists brand_personas_user_id_idx on public.brand_personas(user_id);
create index if not exists fortune_calendar_user_id_date_idx on public.fortune_calendar(user_id, date);
create index if not exists cta_db_user_id_idx on public.cta_db(user_id);
create index if not exists experiments_user_id_idx on public.experiments(user_id);
create index if not exists manual_imports_user_id_idx on public.manual_imports(user_id);
create index if not exists account_phases_user_id_idx on public.account_phases(user_id);
create index if not exists safety_checks_user_id_idx on public.safety_checks(user_id);
create index if not exists error_logs_user_id_idx on public.error_logs(user_id);
create index if not exists reports_user_id_idx on public.reports(user_id);
create index if not exists settings_user_id_idx on public.settings(user_id);

drop trigger if exists set_accounts_updated_at on public.accounts;
create trigger set_accounts_updated_at before update on public.accounts for each row execute function public.set_updated_at();
drop trigger if exists set_api_credentials_updated_at on public.api_credentials;
create trigger set_api_credentials_updated_at before update on public.api_credentials for each row execute function public.set_updated_at();
drop trigger if exists set_keywords_updated_at on public.keywords;
create trigger set_keywords_updated_at before update on public.keywords for each row execute function public.set_updated_at();
drop trigger if exists set_keyword_packs_updated_at on public.keyword_packs;
create trigger set_keyword_packs_updated_at before update on public.keyword_packs for each row execute function public.set_updated_at();
drop trigger if exists set_genres_updated_at on public.genres;
create trigger set_genres_updated_at before update on public.genres for each row execute function public.set_updated_at();
drop trigger if exists set_buzz_posts_updated_at on public.buzz_posts;
create trigger set_buzz_posts_updated_at before update on public.buzz_posts for each row execute function public.set_updated_at();
drop trigger if exists set_post_ideas_updated_at on public.post_ideas;
create trigger set_post_ideas_updated_at before update on public.post_ideas for each row execute function public.set_updated_at();
drop trigger if exists set_post_reservations_updated_at on public.post_reservations;
create trigger set_post_reservations_updated_at before update on public.post_reservations for each row execute function public.set_updated_at();
drop trigger if exists set_post_logs_updated_at on public.post_logs;
create trigger set_post_logs_updated_at before update on public.post_logs for each row execute function public.set_updated_at();
drop trigger if exists set_insights_updated_at on public.insights;
create trigger set_insights_updated_at before update on public.insights for each row execute function public.set_updated_at();
drop trigger if exists set_pattern_db_updated_at on public.pattern_db;
create trigger set_pattern_db_updated_at before update on public.pattern_db for each row execute function public.set_updated_at();
drop trigger if exists set_hook_db_updated_at on public.hook_db;
create trigger set_hook_db_updated_at before update on public.hook_db for each row execute function public.set_updated_at();
drop trigger if exists set_image_motifs_updated_at on public.image_motifs;
create trigger set_image_motifs_updated_at before update on public.image_motifs for each row execute function public.set_updated_at();
drop trigger if exists set_image_prompts_updated_at on public.image_prompts;
create trigger set_image_prompts_updated_at before update on public.image_prompts for each row execute function public.set_updated_at();
drop trigger if exists set_image_results_updated_at on public.image_results;
create trigger set_image_results_updated_at before update on public.image_results for each row execute function public.set_updated_at();
drop trigger if exists set_post_type_db_updated_at on public.post_type_db;
create trigger set_post_type_db_updated_at before update on public.post_type_db for each row execute function public.set_updated_at();
drop trigger if exists set_daily_materials_updated_at on public.daily_materials;
create trigger set_daily_materials_updated_at before update on public.daily_materials for each row execute function public.set_updated_at();
drop trigger if exists set_template_risk_logs_updated_at on public.template_risk_logs;
create trigger set_template_risk_logs_updated_at before update on public.template_risk_logs for each row execute function public.set_updated_at();
drop trigger if exists set_brand_personas_updated_at on public.brand_personas;
create trigger set_brand_personas_updated_at before update on public.brand_personas for each row execute function public.set_updated_at();
drop trigger if exists set_fortune_calendar_updated_at on public.fortune_calendar;
create trigger set_fortune_calendar_updated_at before update on public.fortune_calendar for each row execute function public.set_updated_at();
drop trigger if exists set_cta_db_updated_at on public.cta_db;
create trigger set_cta_db_updated_at before update on public.cta_db for each row execute function public.set_updated_at();
drop trigger if exists set_experiments_updated_at on public.experiments;
create trigger set_experiments_updated_at before update on public.experiments for each row execute function public.set_updated_at();
drop trigger if exists set_manual_imports_updated_at on public.manual_imports;
create trigger set_manual_imports_updated_at before update on public.manual_imports for each row execute function public.set_updated_at();
drop trigger if exists set_account_phases_updated_at on public.account_phases;
create trigger set_account_phases_updated_at before update on public.account_phases for each row execute function public.set_updated_at();
drop trigger if exists set_safety_checks_updated_at on public.safety_checks;
create trigger set_safety_checks_updated_at before update on public.safety_checks for each row execute function public.set_updated_at();
drop trigger if exists set_error_logs_updated_at on public.error_logs;
create trigger set_error_logs_updated_at before update on public.error_logs for each row execute function public.set_updated_at();
drop trigger if exists set_reports_updated_at on public.reports;
create trigger set_reports_updated_at before update on public.reports for each row execute function public.set_updated_at();
drop trigger if exists set_settings_updated_at on public.settings;
create trigger set_settings_updated_at before update on public.settings for each row execute function public.set_updated_at();

comment on table public.api_credentials is 'Stores credential metadata only. Do not store plaintext secrets or tokens.';
comment on column public.api_credentials.env_key_name is 'Name of the server-side environment variable that holds the secret.';
comment on table public.keyword_packs is 'Optional keyword packs that can be toggled on/off per account or brand.';
comment on table public.reports is 'Phase 6 report records. Phase 6 scope is DB storage and screen display only.';
