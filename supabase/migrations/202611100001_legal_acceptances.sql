begin;

create table if not exists public.legal_acceptances (
  user_id uuid not null references auth.users(id) on delete cascade,
  terms_version text not null,
  accepted_at timestamptz not null default now(),
  primary key (user_id, terms_version)
);
alter table public.legal_acceptances enable row level security;
revoke all on public.legal_acceptances from anon, authenticated;
grant select on public.legal_acceptances to authenticated;
drop policy if exists "Read own legal acceptances" on public.legal_acceptances;
create policy "Read own legal acceptances" on public.legal_acceptances
  for select to authenticated using (user_id = (select auth.uid()));

-- Keep aligned with lib/legal.ts. Change through a new migration for new terms.
create or replace function public.current_terms_version()
returns text language sql immutable set search_path = ''
as $$ select '2026-11-10'::text $$;

create or replace function public.accept_current_terms(requested_version text)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if requested_version is distinct from public.current_terms_version() then
    raise exception 'Current terms must be accepted' using errcode = '22023';
  end if;
  insert into public.legal_acceptances (user_id, terms_version)
    values (auth.uid(), public.current_terms_version())
    on conflict (user_id, terms_version) do nothing;
end;
$$;
revoke all on function public.accept_current_terms(text) from public, anon;
grant execute on function public.accept_current_terms(text) to authenticated;

-- Record email registration acceptance once, with a database-generated time.
-- Later edits to user_metadata never create or change acceptance records.
create or replace function public.record_signup_terms()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if new.raw_app_meta_data ->> 'provider' = 'email'
    and new.raw_user_meta_data ->> 'accepted_terms_version' = public.current_terms_version() then
    insert into public.legal_acceptances (user_id, terms_version)
      values (new.id, public.current_terms_version())
      on conflict (user_id, terms_version) do nothing;
  end if;
  return new;
end;
$$;
revoke all on function public.record_signup_terms() from public, anon, authenticated;
drop trigger if exists record_signup_terms on auth.users;
create trigger record_signup_terms after insert on auth.users
  for each row execute function public.record_signup_terms();

-- Restrictive policies combine with existing ownership policies, never replace
-- them. Direct Supabase API access must not bypass the onboarding screen.
alter table public.tracked_accounts enable row level security;
drop policy if exists "Require current terms" on public.tracked_accounts;
create policy "Require current terms" on public.tracked_accounts
  as restrictive for all to authenticated
  using (
    user_id = (select auth.uid()) and exists (
      select 1 from public.legal_acceptances a
      where a.user_id = (select auth.uid())
        and a.terms_version = public.current_terms_version()
    )
  )
  with check (
    user_id = (select auth.uid()) and exists (
      select 1 from public.legal_acceptances a
      where a.user_id = (select auth.uid())
        and a.terms_version = public.current_terms_version()
    )
  );

commit;
