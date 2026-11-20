-- ─────────────────────────────────────────────────────────────────────────────
--  Emily & Joe — wedding RSVP schema
--
--  Security model
--  • Row-level security is ENABLED on every table.
--  • The anon role has NO policies → the public Supabase key can read nothing.
--  • Guests never talk to Supabase directly. Every guest request goes through
--    Next.js server code that validates the invitation token / code and then
--    uses the service-role key (server-only env var) to read just that household.
--  • Signed-in admins (listed in public.admin_users) get read access via RLS as
--    defence in depth; all writes still go through validated server actions.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  invite_code text not null unique,
  token text not null unique check (char_length(token) >= 24),
  plus_one_allowed boolean not null default false,
  email text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  first_name text not null check (char_length(first_name) between 1 and 100),
  last_name text not null default '' check (char_length(last_name) <= 100),
  is_plus_one boolean not null default false,
  attending boolean,
  meal text,
  dietary text check (dietary is null or char_length(dietary) <= 500),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists guests_household_idx on public.guests(household_id);
create index if not exists guests_name_idx on public.guests(lower(first_name), lower(last_name));
-- at most one plus-one per household
create unique index if not exists guests_one_plus_one on public.guests(household_id) where is_plus_one;

create table if not exists public.rsvps (
  household_id uuid primary key references public.households(id) on delete cascade, -- one reply per household: no duplicates
  status text not null check (status in ('attending', 'declined', 'partial')),
  song_request text check (song_request is null or char_length(song_request) <= 300),
  message text check (message is null or char_length(message) <= 2000),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict do nothing;

-- ── Row-level security ───────────────────────────────────────────────────────
alter table public.admin_users  enable row level security;
alter table public.households   enable row level security;
alter table public.guests       enable row level security;
alter table public.rsvps        enable row level security;
alter table public.site_settings enable row level security;

create or replace function public.is_wedding_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_users a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.is_wedding_admin() from public, anon;

drop policy if exists "admins read households" on public.households;
create policy "admins read households" on public.households for select to authenticated using (public.is_wedding_admin());
drop policy if exists "admins read guests" on public.guests;
create policy "admins read guests" on public.guests for select to authenticated using (public.is_wedding_admin());
drop policy if exists "admins read rsvps" on public.rsvps;
create policy "admins read rsvps" on public.rsvps for select to authenticated using (public.is_wedding_admin());
drop policy if exists "admins read settings" on public.site_settings;
create policy "admins read settings" on public.site_settings for select to authenticated using (public.is_wedding_admin());
drop policy if exists "admins read self" on public.admin_users;
create policy "admins read self" on public.admin_users for select to authenticated using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

revoke all on public.households, public.guests, public.rsvps, public.site_settings, public.admin_users from anon;

-- ── Atomic RSVP submission (service role only) ───────────────────────────────
create or replace function public.submit_rsvp(payload jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare
  hid uuid := (payload ->> 'householdId')::uuid;
  g jsonb;
  allowed boolean;
  yes_count int;
  invited_count int;
  st text;
begin
  select plus_one_allowed into allowed from households where id = hid for update;
  if not found then raise exception 'household not found'; end if;

  for g in select * from jsonb_array_elements(payload -> 'guests') loop
    update guests set
      attending = (g ->> 'attending')::boolean,
      meal = case when (g ->> 'attending')::boolean then nullif(g ->> 'meal', '') end,
      dietary = case when (g ->> 'attending')::boolean then nullif(g ->> 'dietary', '') end
    where id = (g ->> 'id')::uuid and household_id = hid and not is_plus_one;
  end loop;

  delete from guests where household_id = hid and is_plus_one;
  if allowed and jsonb_typeof(payload -> 'plusOne') = 'object' then
    insert into guests (household_id, first_name, last_name, is_plus_one, attending, meal, dietary, sort_order)
    values (hid, payload -> 'plusOne' ->> 'firstName', coalesce(payload -> 'plusOne' ->> 'lastName', ''), true, true,
            nullif(payload -> 'plusOne' ->> 'meal', ''), nullif(payload -> 'plusOne' ->> 'dietary', ''), 999);
  end if;

  select count(*) filter (where attending), count(*) into yes_count, invited_count
    from guests where household_id = hid and not is_plus_one;
  st := case when yes_count = 0 then 'declined' when yes_count = invited_count then 'attending' else 'partial' end;

  insert into rsvps (household_id, status, song_request, message)
  values (hid, st, nullif(payload ->> 'songRequest', ''), nullif(payload ->> 'message', ''))
  on conflict (household_id) do update set
    status = excluded.status, song_request = excluded.song_request,
    message = excluded.message, updated_at = now();
end;
$$;
revoke all on function public.submit_rsvp(jsonb) from public, anon, authenticated;
grant execute on function public.submit_rsvp(jsonb) to service_role;
