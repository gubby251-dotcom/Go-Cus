# Perubahan pendaftaran Mitra GO-CUS

## Perubahan
- Mitra wajib mengisi nomor plat kendaraan secara manual.
- Mitra wajib memilih foto profil asli.
- Foto dikompresi di browser menjadi JPEG dengan sisi maksimum 600 px dan dibatasi sekitar 400 KB.
- Data mitra disimpan di dokumen `users/{uid}` dengan status `menunggu-persetujuan`.
- Tidak meminta foto plat atau KTP.
- Pelanggan dan pemilik warung tidak diminta mengisi data Mitra.

## Catatan penyimpanan dan privasi
Untuk mempertahankan prioritas gratis, foto JPEG terkompresi disimpan sebagai data URL pada dokumen Firestore `users/{uid}`. Ini bukan pola ideal untuk sistem skala besar dan tetap memakai kuota Firestore; file dibatasi agar tidak mendekati batas ukuran dokumen 1 MiB. Akses foto mengikuti aturan `users`: hanya pemilik akun dan Admin dengan custom claim tepercaya dapat membaca profil. Pastikan aturan berikut sudah benar-benar diterapkan sebelum menerima data mitra nyata.

## Belum diverifikasi
- Rules belum diuji menggunakan Firebase Emulator.
- Belum dilakukan pendaftaran end-to-end ke Firebase proyek pengguna.
- Email verification dan penulisan profil bergantung pada konfigurasi Firebase dan Rules yang aktif.
- Jika Firestore Rules yang aktif berbeda, pendaftaran dapat gagal. Jangan melonggarkan aturan secara umum.
