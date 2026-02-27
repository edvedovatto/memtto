-- Memtto MVP Database Schema
-- Run this in Supabase SQL Editor

-- Entries table
create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  context text not null,
  type text not null default 'note',
  title text not null,
  content_text text not null default '',
  tags text[] not null default '{}',
  image_url text,
  created_at timestamp with time zone default now()
);

-- Indexes
create index if not exists idx_entries_user_id on entries(user_id);
create index if not exists idx_entries_context on entries(context);
create index if not exists idx_entries_created_at on entries(created_at desc);

-- Row Level Security
alter table entries enable row level security;

-- Users can only see their own entries
create policy "Users can view own entries"
  on entries for select
  using (auth.uid() = user_id);

-- Users can only insert their own entries
create policy "Users can insert own entries"
  on entries for insert
  with check (auth.uid() = user_id);

-- Storage bucket for images
insert into storage.buckets (id, name, public)
values ('entry-images', 'entry-images', true)
on conflict do nothing;

-- Storage policy: users can upload to their own folder
create policy "Users can upload own images"
  on storage.objects for insert
  with check (
    bucket_id = 'entry-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policy: public read access
create policy "Public image access"
  on storage.objects for select
  using (bucket_id = 'entry-images');
