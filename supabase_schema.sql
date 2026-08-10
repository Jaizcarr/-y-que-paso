-- Y QUÉ PASÓ — esquema de base de datos
-- Ejecuta esto en Supabase: Dashboard → SQL Editor → New query → pega y "Run".

create table if not exists public.series (
  id text primary key,
  title text not null,
  original_title text,
  poster text,
  backdrop text,
  genre text,
  seasons integer,
  episodes integer,
  network text,
  tagline text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.characters (
  id text primary key,
  series_id text not null references public.series(id) on delete cascade,
  name text not null,
  aliases text[] not null default '{}',
  zona text,
  edad text,
  actor text,
  house text,
  role text,
  status text,
  avatar text,
  quote text,
  summary text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists characters_series_id_idx on public.characters(series_id);

create table if not exists public.events (
  id text primary key,
  character_id text not null references public.characters(id) on delete cascade,
  season integer,
  episode text,
  title text,
  image text,
  summary text,
  details text,
  impact text,
  is_final_fate boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists events_character_id_idx on public.events(character_id);

-- Row Level Security: cualquiera puede LEER (para que la web pública funcione),
-- pero solo un usuario autenticado (tu cuenta de Admin) puede ESCRIBIR.
alter table public.series enable row level security;
alter table public.characters enable row level security;
alter table public.events enable row level security;

create policy "Public read series" on public.series for select using (true);
create policy "Public read characters" on public.characters for select using (true);
create policy "Public read events" on public.events for select using (true);

create policy "Authenticated write series" on public.series for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated write characters" on public.characters for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated write events" on public.events for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
