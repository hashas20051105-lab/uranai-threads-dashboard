-- Phase 6.7: dashboard summary support.
-- Keep this migration small: it only adds metadata needed by the MVP dashboard.

alter table if exists public.accounts
  add column if not exists follower_count integer;

comment on column public.accounts.follower_count is
  'Latest known Threads follower count. Optional in the MVP and may be updated manually or by a future API sync.';
