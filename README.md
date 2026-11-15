# Antigravity Tracker (Vite + React + Supabase Auth)
Pelacak manual limit dan reset kuota. Tidak mengakses akun Google Antigravity.

## Setup Supabase
1. Buat project di supabase.com (New project). Simpan kata sandi database.
2. SQL Editor > New query > tempel isi `supabase/schema.sql` > Run.
3. Authentication > Sign In / Providers: pastikan Email aktif dan matikan "Allow new users to sign up".
4. Authentication > Users > Add user > Create new user: isi email dan kata sandi, centang Auto Confirm User.
5. Project Settings > API: salin Project URL dan anon/publishable key.

## Jalankan lokal
cp .env.example .env.local   # isi dua nilai dari langkah 5
npm i && npm run dev
Tanpa .env.local, aplikasi berjalan tanpa login dengan data di browser saja.

## Deploy ke Vercel
Push ke GitHub, Import di Vercel, tambahkan Environment Variables `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`, lalu Deploy.
Terakhir, Supabase > Authentication > URL Configuration: isi Site URL dengan URL Vercel.

Anon key aman berada di browser karena akses data dibatasi RLS (setiap pengguna hanya bisa membaca dan mengubah barisnya sendiri). Jangan pernah memakai service_role key di frontend.
