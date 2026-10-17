-- Optional future persistence schema (not used by the prototype's Broadcast-only sync yet).
-- Do not enable broad public write access for a real game without validating membership/turn ownership.
create table if not exists public.monopoly_rooms (
  room_code text primary key,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.monopoly_rooms enable row level security;

-- Intentionally no public policies are created here.
-- Add authenticated membership and server-side validation before using persistent room state.
