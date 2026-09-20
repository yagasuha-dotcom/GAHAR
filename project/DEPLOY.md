# ClintStore — Panduan Deploy dari HP (Termux)

## 1. Bikin Database (Neon Postgres — gratis)

1. Buka https://neon.tech dari Chrome, daftar/login pakai GitHub.
2. Buat project baru → beri nama bebas (misal `clintstore`).
3. Di dashboard project, salin **Connection String** (mulai dengan `postgresql://...`).

## 2. Setup Project di Termux

```bash
cd ~
# kalau belum ada foldernya, clone dulu dari GitHub
git clone https://github.com/yagasuha-dotcom/NAMA-REPO.git
cd NAMA-REPO

# buat file .env
cp .env.example .env
```

Edit `.env` (pakai `nano .env` atau editor teks Termux favoritmu), isi:
```
DATABASE_URL=postgresql://... (paste dari Neon)
AUTH_SECRET=isi_string_acak_panjang_bebas
```

## 3. Push Struktur Database

Ini WAJIB dijalankan sekali di awal (dan setiap kali skema tabel berubah):

```bash
npm install
npm run db:push
```

Kalau muncul pertanyaan konfirmasi di terminal, pilih `Yes, I want to execute all statements`.

## 4. Isi Data Contoh (opsional tapi disarankan)

Setelah deploy (langkah 6), buka di browser:
```
https://domain-vercel-kamu.vercel.app/api/seed
```
Ini otomatis membuat produk, banner, testimoni contoh + 2 akun:
- **Admin**: `admin@clintstore.id` / `admin123`
- **Customer**: `customer@clintstore.id` / `customer123`

⚠️ Setelah itu, segera ganti password admin lewat halaman login → jangan pakai password contoh di production.

## 5. Push ke GitHub

```bash
git add -A
git commit -m "Lengkapi fitur admin: coupon, banner, testimoni, artikel, settings, upload gambar, review"
git push origin main
```

## 6. Deploy ke Vercel

1. Buka https://vercel.com dari Chrome, login pakai GitHub (`yagasuha-dotcom`).
2. Import repo project ini.
3. Di bagian **Environment Variables**, tambahkan:
   - `DATABASE_URL` → isi sama seperti di `.env`
   - `AUTH_SECRET` → isi sama seperti di `.env`
4. Klik **Deploy**. Tunggu build selesai (±2 menit).
5. Web-mu langsung online di `nama-project.vercel.app`.

Setiap kali kamu `git push`, Vercel otomatis build ulang & update web-nya.

## Yang Sudah Dilengkapi

- ✅ Halaman admin: Voucher, Banner, Artikel, Testimoni, Promo, Pengaturan Toko (sebelumnya cuma link kosong)
- ✅ Upload gambar produk/banner/testimoni langsung dari HP (tanpa perlu isi URL manual) — file disimpan langsung sebagai gambar terenkode, tidak butuh setup storage bucket tambahan
- ✅ Edit produk beneran (sebelumnya tombol pensil cuma toggle featured)
- ✅ Form ulasan pembeli di halaman produk (hanya bisa ulas produk yang sudah dibeli & lunas)
- ✅ `drizzle.config.ts` + script `npm run db:push` supaya tabel database bisa dibuat

## Yang Masih Perlu Kamu Putuskan (Fase Berikutnya)

- **Pembayaran** masih simulasi manual (tombol "anggap sudah bayar" oleh admin di panel Order). Kalau mau otomatis (scan QRIS → auto lunas), perlu integrasi Midtrans/Tripay — kabari kalau mau lanjut ke sini.
- Gambar yang di-upload disimpan langsung di database (data URL base64). Ini praktis dan gratis, tapi untuk jangka panjang dengan banyak produk, pertimbangkan pindah ke storage seperti Cloudinary/Supabase Storage biar database tidak membengkak.
