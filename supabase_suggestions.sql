-- Y QUÉ PASÓ — buzón de sugerencias
-- Ejecuta esto en Supabase: Dashboard → SQL Editor → New query → pega y "Run".

create extension if not exists pgcrypto;

create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  name text,
  message text not null check (char_length(message) between 1 and 2000),
  created_at timestamptz not null default now()
);

alter table public.suggestions enable row level security;

-- Cualquier visitante puede enviar una sugerencia, sin necesidad de login.
create policy "Anyone can submit a suggestion" on public.suggestions
  for insert with check (true);

-- Solo tu cuenta de Admin (autenticada) puede leerlas...
create policy "Only admins can read suggestions" on public.suggestions
  for select using (auth.role() = 'authenticated');

-- ...y borrarlas.
create policy "Only admins can delete suggestions" on public.suggestions
  for delete using (auth.role() = 'authenticated');
