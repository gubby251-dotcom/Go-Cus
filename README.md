# Go Cus — Prototipe

Prototipe website responsif untuk konsep layanan ojek penumpang dan antar barang lokal Pamekasan, Madura.

## Fitur demo
- Tab Pelanggan, Driver, dan Admin.
- Formulir pesanan ojek / antar barang.
- Estimasi tarif demo yang dapat diatur dari tab Admin.
- Simulasi driver online, menerima order, perjalanan, dan menyelesaikan order.
- Ringkasan dan ekspor CSV untuk pesanan demo.
- Riwayat disimpan di localStorage browser pada perangkat yang sama.

## Cara pasang ke GitHub Pages dari HP
1. Buat repository baru di GitHub, misalnya `go-cus`.
2. Upload `index.html` ke root repository.
3. Buka Settings → Pages.
4. Pada Build and deployment, pilih Deploy from a branch.
5. Pilih branch `main` dan folder `/(root)`, lalu Save.
6. Tunggu proses deployment. URL biasanya berbentuk `https://USERNAME.github.io/go-cus/`.

## Batasan penting
Ini hanya prototipe frontend. Pesanan tidak dikirim ke driver sungguhan dan tidak tersinkron antarperangkat. Data disimpan lokal di browser; jangan gunakan untuk data pelanggan nyata. Login aman, backend, database bersama, notifikasi, peta/GPS, pembayaran, verifikasi mitra, dan pengamanan admin belum tersedia. Sebelum operasi nyata, perlu implementasi backend dan uji keamanan serta kepatuhan hukum.
