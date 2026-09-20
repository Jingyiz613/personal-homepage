-- Personal Homepage V3: moderated public guestbook and private feedback intake.
-- Run this entire file once in the Supabase SQL Editor.

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  name text check (
    name is null or char_length(btrim(name)) between 1 and 30
  ),
  relation text not null check (
    relation in ('同学', '老师', '家人', '朋友', '同行', '其他', '不便透露')
  ),
  device text not null check (
    device in ('电脑', '手机', '平板', '其他')
  ),
  message text not null check (
    char_length(btrim(message)) between 2 and 1000
  ),
  version text not null default 'V3' check (version = 'V3'),
  is_public boolean not null default false,
  is_approved boolean not null default false,
  reply text,
  reply_at timestamptz,
  created_at timestamptz not null default now()
);

-- Upgrade an existing V3 table without exposing old private submissions.
alter table public.feedback add column if not exists is_public boolean not null default false;
alter table public.feedback add column if not exists is_approved boolean not null default false;
alter table public.feedback add column if not exists reply text;
alter table public.feedback add column if not exists reply_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'feedback_reply_length'
  ) then
    alter table public.feedback
      add constraint feedback_reply_length
      check (reply is null or char_length(btrim(reply)) between 1 and 1000);
  end if;
end $$;

alter table public.feedback enable row level security;

revoke all on table public.feedback from anon, authenticated;

-- Visitors may submit only the form fields. Moderation and replies remain owner-only.
grant insert (name, relation, device, message, version, is_public)
on table public.feedback to anon;

-- Public reads are limited to display-safe columns; relation and device stay private.
grant select (id, name, message, created_at, reply, reply_at)
on table public.feedback to anon;

drop policy if exists "visitors can submit feedback" on public.feedback;
create policy "visitors can submit feedback"
on public.feedback
for insert
to anon
with check (
  version = 'V3'
  and char_length(btrim(message)) between 2 and 1000
  and is_approved = false
  and reply is null
  and reply_at is null
);

drop policy if exists "visitors can read approved public feedback" on public.feedback;
create policy "visitors can read approved public feedback"
on public.feedback
for select
to anon
using (is_public = true and is_approved = true);

-- Intentionally no UPDATE or DELETE policy for anonymous visitors.
-- Owner workflow in Table Editor:
-- 1. Review the row and tick is_approved only when it is suitable for publication.
-- 2. Optionally fill reply and reply_at (for example: now()).
-- Existing rows remain private because their visitors did not consent to publication.
