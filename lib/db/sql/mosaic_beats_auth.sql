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

create table if not exists mosaic_beats.accounts (
  id text primary key,
  email text not null,
  google_sub text not null,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists accounts_email_unique_idx
  on mosaic_beats.accounts (email);

create unique index if not exists accounts_google_sub_unique_idx
  on mosaic_beats.accounts (google_sub);

create index if not exists accounts_updated_at_idx
  on mosaic_beats.accounts (updated_at desc);

drop trigger if exists set_accounts_updated_at
  on mosaic_beats.accounts;

create trigger set_accounts_updated_at
before update on mosaic_beats.accounts
for each row
execute function mosaic_beats.set_updated_at();

create table if not exists mosaic_beats.account_profiles (
  account_id text primary key references mosaic_beats.accounts (id) on delete cascade,
  state_version integer not null default 1,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists account_profiles_updated_at_idx
  on mosaic_beats.account_profiles (updated_at desc);

drop trigger if exists set_account_profiles_updated_at
  on mosaic_beats.account_profiles;

create trigger set_account_profiles_updated_at
before update on mosaic_beats.account_profiles
for each row
execute function mosaic_beats.set_updated_at();

create table if not exists mosaic_beats.account_sessions (
  id text primary key,
  account_id text not null references mosaic_beats.accounts (id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists account_sessions_token_hash_unique_idx
  on mosaic_beats.account_sessions (token_hash);

create index if not exists account_sessions_account_id_idx
  on mosaic_beats.account_sessions (account_id);

create index if not exists account_sessions_expires_at_idx
  on mosaic_beats.account_sessions (expires_at desc);

drop trigger if exists set_account_sessions_updated_at
  on mosaic_beats.account_sessions;

create trigger set_account_sessions_updated_at
before update on mosaic_beats.account_sessions
for each row
execute function mosaic_beats.set_updated_at();
