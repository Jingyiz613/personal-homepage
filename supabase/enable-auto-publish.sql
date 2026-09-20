-- Enable immediate publication for feedback whose visitor selected is_public.
-- Run this file once in the Supabase SQL Editor.

begin;

alter table public.feedback
  alter column is_approved set default true;

-- Publish already-submitted messages only when the visitor opted in to public display.
update public.feedback
set is_approved = true
where is_public = true
  and is_approved = false;

drop policy if exists "visitors can submit feedback" on public.feedback;
create policy "visitors can submit feedback"
on public.feedback
for insert
to anon
with check (
  version = 'V3'
  and char_length(btrim(message)) between 2 and 1000
  and is_approved = true
  and reply is null
  and reply_at is null
);

commit;

