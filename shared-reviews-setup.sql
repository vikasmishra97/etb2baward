-- Run in Supabase SQL editor. Authentication users are created separately in Supabase Auth.
create table if not exists public.review_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','juror')),
  juror_id text unique,
  enabled boolean not null default true,
  check ((role='juror' and juror_id is not null) or (role='admin' and juror_id is null))
);
create table if not exists public.jury_review_records (
  juror_id text not null,
  nomination_id text not null,
  level integer not null check (level between 1 and 100),
  status text not null check (status in ('draft','submitted')),
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (juror_id,nomination_id,level)
);
create or replace function public.update_review_timestamp() returns trigger language plpgsql as $$
begin
 if tg_op='UPDATE' and old.status='submitted' then raise exception 'Submitted evaluations cannot be modified'; end if;
 if (new.payload->>'jurorId') is distinct from new.juror_id or (new.payload->>'nominationId') is distinct from new.nomination_id or coalesce((new.payload->>'level')::int,-1)<>new.level or (new.payload->>'status') is distinct from new.status then raise exception 'Review metadata mismatch'; end if;
 new.updated_at=now(); return new;
end $$;
drop trigger if exists validate_review_change on public.jury_review_records;
create trigger validate_review_change before insert or update on public.jury_review_records for each row execute function public.update_review_timestamp();
alter table public.review_accounts enable row level security;
alter table public.jury_review_records enable row level security;
drop policy if exists own_account on public.review_accounts;
create policy own_account on public.review_accounts for select to authenticated using (user_id=auth.uid());
drop policy if exists admin_read_reviews on public.jury_review_records;
create policy admin_read_reviews on public.jury_review_records for select to authenticated using (
 exists (select 1 from public.review_accounts a where a.user_id=auth.uid() and a.enabled and a.role='admin')
 or exists (select 1 from public.review_accounts a where a.user_id=auth.uid() and a.enabled and a.role='juror' and a.juror_id=jury_review_records.juror_id)
);
drop policy if exists juror_insert_review on public.jury_review_records;
create policy juror_insert_review on public.jury_review_records for insert to authenticated with check (
 exists (select 1 from public.review_accounts a where a.user_id=auth.uid() and a.enabled and a.role='juror' and a.juror_id=jury_review_records.juror_id)
);
drop policy if exists juror_update_review on public.jury_review_records;
create policy juror_update_review on public.jury_review_records for update to authenticated using (
 status='draft' and exists (select 1 from public.review_accounts a where a.user_id=auth.uid() and a.enabled and a.role='juror' and a.juror_id=jury_review_records.juror_id)
) with check (exists (select 1 from public.review_accounts a where a.user_id=auth.uid() and a.enabled and a.role='juror' and a.juror_id=jury_review_records.juror_id));
revoke all on public.review_accounts, public.jury_review_records from anon;
grant select on public.review_accounts to authenticated;
grant select,insert,update on public.jury_review_records to authenticated;
-- Link identities using the Auth user UUIDs, NEVER store passwords in repository:
-- insert into public.review_accounts(user_id,role,juror_id) values
-- ('<juror-auth-uuid>','juror','<existing-etb2b-juror-id>'),
-- ('<admin-auth-uuid>','admin',null);
