-- RouteWise MVP schema (Supabase / PostgreSQL)

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  created_at timestamptz not null default now()
);

create table if not exists airports (
  code text primary key,
  city_id text not null,
  name text not null
);

create table if not exists stations (
  code text primary key,
  city_id text not null,
  name text not null
);

create table if not exists operators (
  id text primary key,
  name text not null,
  transport_type text not null check (transport_type in ('flight', 'train')),
  reliability numeric not null default 0.8
);

create table if not exists travel_segments (
  id text primary key,
  transport_type text not null check (transport_type in ('flight', 'train')),
  operator_id text not null references operators (id),
  origin_code text not null,
  destination_code text not null,
  departure timestamptz not null,
  arrival timestamptz not null,
  duration_minutes integer not null,
  price numeric not null
);

create table if not exists searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users (id),
  origin text not null,
  destination text not null,
  travel_date date not null,
  arrive_by timestamptz not null,
  budget numeric not null,
  optimization text not null,
  route_count integer,
  created_at timestamptz not null default now()
);

create table if not exists saved_routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users (id),
  search_id uuid references searches (id),
  route_payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists searches_origin_dest_date_idx
  on searches (origin, destination, travel_date);

create index if not exists travel_segments_od_depart_idx
  on travel_segments (origin_code, destination_code, departure);

create index if not exists saved_routes_user_idx
  on saved_routes (user_id);
