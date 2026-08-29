# Task Manager

Aplikasi task management tim — Next.js + Supabase. Versi v1: manajemen task dasar dengan tampilan Kanban & List, 3 role akses (Admin, Manager, Anggota), invite-only.

## 1. Setup Supabase (gratis)

1. Buat akun & project baru di https://supabase.com
2. Buka **SQL Editor** di dashboard Supabase, copy-paste seluruh isi file `supabase/schema.sql`, lalu jalankan (Run).
3. Buka **Project Settings → API**, salin:
   - `Project URL` → jadi `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → jadi `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Setup project lokal

```bash
npm install
cp .env.example .env.local
# isi .env.local dengan URL & key dari Supabase
npm run dev
```

Buka http://localhost:3000

## 3. Membuat user pertama (Admin)

Karena sistem ini **invite-only** (bukan self sign-up), user pertama dibuat manual dari dashboard Supabase:

1. Buka **Authentication → Users** di dashboard Supabase
2. Klik **Add user** → **Create new user**
3. Isi email & password, lalu di bagian **User Metadata** tambahkan:
   ```json
   { "full_name": "Nama Admin", "role": "admin" }
   ```
4. User ini otomatis mendapat baris di tabel `profiles` (lewat trigger) dengan role `admin`.
5. Login pakai email & password tersebut di halaman `/login`.

Untuk anggota tim berikutnya, Admin mengulangi langkah yang sama (ganti `role` jadi `"manager"` atau `"member"`).

> Catatan: mengelola user lewat dashboard Supabase manual dulu untuk v1. Halaman "Kelola Tim" di dalam aplikasi (agar Admin bisa invite tanpa buka Supabase) bisa ditambahkan di iterasi berikutnya.

## 4. Deploy ke Vercel (gratis)

1. Push project ini ke GitHub
2. Buka https://vercel.com → **Add New Project** → import repo GitHub tadi
3. Di bagian **Environment Variables**, isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` (sama seperti `.env.local`)
4. Deploy — aplikasi akan online di `nama-project.vercel.app`

## Struktur folder

```
src/
  app/
    login/          # Halaman login
    dashboard/       # Layout + halaman utama task (setelah login)
  components/
    layout/          # Sidebar
    tasks/           # Kanban board, list, kartu task, badge
  lib/supabase/       # Koneksi Supabase (client & server)
  types/              # Tipe TypeScript
  middleware.ts       # Proteksi route (redirect ke /login jika belum auth)
supabase/
  schema.sql          # Skema database + Row Level Security
```

## Fitur v1 (sudah tersedia)

- Login (invite-only, tanpa self sign-up)
- Lihat task dalam tampilan **Kanban** (drag & drop antar status) dan **List/Table**
- Role: Admin, Manager, Anggota (aturan akses sudah diatur lewat Row Level Security di database)

## Belum tersedia — rencana v2+

- Form tambah/edit task lewat UI (saat ini task perlu ditambahkan manual lewat Supabase Table Editor atau SQL)
- Komentar & lampiran file per task
- Notifikasi
- Dashboard laporan/analitik
- Halaman "Kelola Tim" agar Admin bisa invite user langsung dari aplikasi

## Mengembangkan lebih lanjut

Supaya efisien mengerjakan fitur berikutnya bersama Claude, kerjakan **satu fitur kecil per sesi** (misal: "tambahkan form buat task baru" dulu, baru "tambahkan komentar") daripada minta semua sekaligus.
