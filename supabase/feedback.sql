-- Personal Homepage V3: private visitor feedback intake.
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
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

revoke all on table public.feedback from anon;
grant insert on table public.feedback to anon;

drop policy if exists "visitors can submit feedback" on public.feedback;
create policy "visitors can submit feedback"
on public.feedback
for insert
to anon
with check (
  version = 'V3'
  and char_length(btrim(message)) between 2 and 1000
);

-- Intentionally no SELECT, UPDATE, or DELETE policy for anonymous visitors.
-- The site owner reviews submissions in Supabase Table Editor.
