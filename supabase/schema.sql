-- Tabel penyimpan state tracker per user (JSONB)
create table if not exists public.tracker_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Aktifkan Row Level Security (RLS)
alter table public.tracker_state enable row level security;

-- Hapus policy lama jika ada untuk menghindari duplikasi
drop policy if exists "baca data sendiri" on public.tracker_state;
drop policy if exists "tambah data sendiri" on public.tracker_state;
drop policy if exists "ubah data sendiri" on public.tracker_state;
drop policy if exists "kelola data sendiri" on public.tracker_state;

-- Policy terpadu (SELECT, INSERT, UPDATE, DELETE) untuk operasi upsert yang aman
create policy "kelola data sendiri"
  on public.tracker_state
  for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
