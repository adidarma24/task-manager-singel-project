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

Karena sistem ini **invite-only**, user PERTAMA harus dibuat manual dari dashboard Supabase (belum ada Admin yang bisa mengundang lewat aplikasi).

1. Buka **Authentication → Users** di dashboard Supabase
2. Klik **Add user** → **Create new user**
3. Isi email & password
4. Setelah user dibuat, buka **Table Editor → profiles**, cari baris user tersebut, lalu ubah kolom `role` menjadi `admin` dan `full_name` sesuai nama.

Untuk anggota tim berikutnya, gunakan halaman **Kelola Tim** di dalam aplikasi (lihat bagian di bawah) — tidak perlu lagi buka dashboard Supabase.

## 4. Fitur Kelola Tim (invite user dari UI)

Setelah punya 1 Admin, Admin bisa mengundang anggota baru langsung dari aplikasi:

1. Login sebagai Admin → menu **Kelola Tim** akan muncul di sidebar
2. Klik **Undang Anggota** → isi nama, email, dan role
3. Sistem mengirim email undangan (lewat fitur bawaan Supabase Auth) berisi link untuk mengatur password
4. Setelah anggota mengklik link dan mengatur password, mereka bisa login normal di `/login`

**Setup tambahan yang WAJIB untuk fitur ini:**

- Tambahkan environment variable `SUPABASE_SERVICE_ROLE_KEY` (ambil dari **Project Settings → API → Secret keys**) — baik di `.env.local` maupun di Vercel. **Jangan** pakai prefix `NEXT_PUBLIC_` supaya key ini tidak pernah terkirim ke browser.
- Buka **Authentication → URL Configuration** di dashboard Supabase, isi **Site URL** dengan domain aplikasi kamu (misal `https://task-manager-singel-project.vercel.app`) supaya link di email undangan mengarah ke tempat yang benar.
- Supabase gratis mengirim email lewat sistem bawaan dengan batas tertentu per jam — cukup untuk tim kecil. Kalau butuh volume lebih besar nanti, bisa hubungkan SMTP sendiri di **Authentication → Emails**.


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

## Fitur yang sudah tersedia

- Login (invite-only, tanpa self sign-up)
- Lihat task dalam tampilan **Kanban** (drag & drop antar status) dan **List/Table**
- Tambah, edit, dan hapus task lewat modal form (assign, status, prioritas, tenggat)
- Role: Admin, Manager, Anggota (aturan akses diatur lewat Row Level Security di database)
- **Kelola Tim**: Admin bisa mengundang anggota baru lewat email dan mengubah role anggota — langsung dari aplikasi

## Belum tersedia — rencana berikutnya

- Komentar & lampiran file per task
- Notifikasi
- Dashboard laporan/analitik

## Mengembangkan lebih lanjut

Supaya efisien mengerjakan fitur berikutnya bersama Claude, kerjakan **satu fitur kecil per sesi** (misal: "tambahkan form buat task baru" dulu, baru "tambahkan komentar") daripada minta semua sekaligus.
