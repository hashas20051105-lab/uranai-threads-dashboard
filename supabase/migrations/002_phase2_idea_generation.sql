-- Phase 2: idea generation fields.
-- Additive migration only; does not alter or drop existing data.

alter table if exists public.post_ideas add column if not exists pattern_type text;
alter table if exists public.post_ideas add column if not exists hook text;
alter table if exists public.post_ideas add column if not exists cta text;
alter table if exists public.post_ideas add column if not exists full_text text;
alter table if exists public.post_ideas add column if not exists ai_reason text;
alter table if exists public.post_ideas add column if not exists human_reason text;
alter table if exists public.post_ideas add column if not exists template_risk text;
alter table if exists public.post_ideas add column if not exists template_risk_reason text;
alter table if exists public.post_ideas add column if not exists daily_material_used text;
alter table if exists public.post_ideas add column if not exists freshness_reason text;
alter table if exists public.post_ideas add column if not exists competitor_similarity_reason text;
alter table if exists public.post_ideas add column if not exists publish_decision text;
alter table if exists public.post_ideas add column if not exists publish_decision_reason text;
alter table if exists public.post_ideas add column if not exists checklist_status jsonb not null default '{}'::jsonb;
alter table if exists public.post_ideas add column if not exists image_prompt_id uuid;
alter table if exists public.post_ideas add column if not exists human_memo text;

alter table if exists public.image_prompts add column if not exists genre text;
alter table if exists public.image_prompts add column if not exists emotion_tone text;
alter table if exists public.image_prompts add column if not exists prompt_japanese text;
alter table if exists public.image_prompts add column if not exists prompt_english text;
alter table if exists public.image_prompts add column if not exists aspect_ratio text not null default '1:1';
alter table if exists public.image_prompts add column if not exists style text;
alter table if exists public.image_prompts add column if not exists reason text;

alter table if exists public.daily_materials add column if not exists weather text;
alter table if exists public.daily_materials add column if not exists recent_feeling text;
alter table if exists public.daily_materials add column if not exists message_to_reader text;
alter table if exists public.daily_materials add column if not exists operator_note text;
alter table if exists public.daily_materials add column if not exists atmosphere text;
alter table if exists public.daily_materials add column if not exists small_realization text;
alter table if exists public.daily_materials add column if not exists personal_experience text;

create index if not exists post_ideas_publish_decision_idx on public.post_ideas(publish_decision);
create index if not exists post_ideas_template_risk_idx on public.post_ideas(template_risk);
