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

create table if not exists mosaic_beats.youtube_connections (
  account_id text primary key references mosaic_beats.accounts (id) on delete cascade,
  encrypted_refresh_token text not null,
  granted_scopes text,
  channel_id text,
  channel_title text,
  channel_thumbnail_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists youtube_connections_channel_id_idx
  on mosaic_beats.youtube_connections (channel_id);

create index if not exists youtube_connections_updated_at_idx
  on mosaic_beats.youtube_connections (updated_at desc);

drop trigger if exists set_youtube_connections_updated_at
  on mosaic_beats.youtube_connections;

create trigger set_youtube_connections_updated_at
before update on mosaic_beats.youtube_connections
for each row
execute function mosaic_beats.set_updated_at();
