-- ============================================
-- SKEMA DATABASE: Task Management App
-- Jalankan ini di Supabase SQL Editor
-- ============================================

-- Tipe enum untuk role, status, dan prioritas
create type user_role as enum ('admin', 'manager', 'member');
create type task_status as enum ('todo', 'in_progress', 'review', 'done');
create type task_priority as enum ('low', 'medium', 'high', 'urgent');

-- Tabel profiles: data tambahan user di luar auth.users
-- Dibuat otomatis oleh trigger saat Admin invite user baru
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role user_role not null default 'member',
  created_at timestamptz not null default now()
);

-- Tabel tasks: inti aplikasi
create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status task_status not null default 'todo',
  priority task_priority not null default 'medium',
  due_date date,
  assigned_to uuid references profiles(id) on delete set null,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger: update kolom updated_at otomatis
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on tasks
  for each row execute function update_updated_at();

-- Trigger: buat baris profiles otomatis saat user baru dibuat (via invite Admin)
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'member')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table profiles enable row level security;
alter table tasks enable row level security;

-- Semua user login bisa lihat semua profile (untuk assign task, tampilkan nama)
create policy "Semua user login bisa lihat profiles"
  on profiles for select
  to authenticated
  using (true);

-- Hanya Admin bisa update role user lain
create policy "Admin bisa update profiles"
  on profiles for update
  to authenticated
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Semua user login bisa lihat semua task (1 project besar, tim kecil)
create policy "Semua user login bisa lihat tasks"
  on tasks for select
  to authenticated
  using (true);

-- Semua user login bisa buat task
create policy "Semua user login bisa buat tasks"
  on tasks for insert
  to authenticated
  with check (auth.uid() = created_by);

-- Admin & Manager bisa update semua task; Anggota hanya task miliknya
create policy "Update tasks sesuai role"
  on tasks for update
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and (role in ('admin', 'manager') or id = tasks.assigned_to)
    )
  );

-- Hanya Admin & Manager bisa hapus task
create policy "Admin dan Manager bisa hapus tasks"
  on tasks for delete
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'manager')
    )
  );
