create schema if not exists mosaic_beats;

create or replace function mosaic_beats.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists mosaic_beats.client_profiles (
  client_id text primary key,
  state_version integer not null default 1,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_profiles_updated_at_idx
  on mosaic_beats.client_profiles (updated_at desc);

drop trigger if exists set_client_profiles_updated_at
  on mosaic_beats.client_profiles;

create trigger set_client_profiles_updated_at
before update on mosaic_beats.client_profiles
for each row
execute function mosaic_beats.set_updated_at();
