-- CoralGuard Cebu: Supabase setup (run in SQL editor)

create extension if not exists pgcrypto;

create table if not exists public.reef_reports (
  id uuid primary key default gen_random_uuid(),
  location text not null,
  health_score integer not null check (health_score between 0 and 100),
  status text not null check (status in ('Healthy', 'At Risk', 'Critical')),
  bleaching_percent integer not null check (bleaching_percent between 0 and 100),
  coral_coverage integer not null check (coral_coverage between 0 and 100),
  water_clarity text not null,
  main_threat text,
  species text,
  recommendation text,
  urgency text,
  image_url text,
  reported_at timestamptz not null default now()
);

create index if not exists reef_reports_reported_at_idx
  on public.reef_reports (reported_at desc);

alter table public.reef_reports enable row level security;

-- Demo/public app policies (anonymous read/write)
drop policy if exists "Public can read reef reports" on public.reef_reports;
create policy "Public can read reef reports"
  on public.reef_reports
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can insert reef reports" on public.reef_reports;
create policy "Public can insert reef reports"
  on public.reef_reports
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Public can delete reef reports" on public.reef_reports;
create policy "Public can delete reef reports"
  on public.reef_reports
  for delete
  to anon, authenticated
  using (true);

-- Storage bucket for uploaded reef photos
insert into storage.buckets (id, name, public)
values ('reef-photos', 'reef-photos', true)
on conflict (id) do update set public = true;

-- Storage policies
drop policy if exists "Public can view reef photos" on storage.objects;
create policy "Public can view reef photos"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'reef-photos');

drop policy if exists "Public can upload reef photos" on storage.objects;
create policy "Public can upload reef photos"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'reef-photos');

drop policy if exists "Public can delete reef photos" on storage.objects;
create policy "Public can delete reef photos"
  on storage.objects
  for delete
  to anon, authenticated
  using (bucket_id = 'reef-photos');
