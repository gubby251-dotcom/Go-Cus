
# GO CUS — Panduan Integrasi Firebase

## Status
Tahap review. Belum siap produksi dan belum dipublikasikan.

## File integrasi
- `firebase-config.js` — koneksi Firebase Web.
- `firebase-auth.js` — pendaftaran, login, logout.
- `firebase-data.js` — profil, warung, menu, pesanan.
- `firestore.rules` — rancangan aturan keamanan.
- `index.html` — website utama GO CUS.

## Jenis akun
- `pelanggan`
- `pemilik-warung`
- `mitra`
- `admin` — hanya ditetapkan melalui mekanisme tepercaya.

## Persiapan Firebase
1. Aktifkan Email/Password di Firebase Authentication.
2. Pastikan aplikasi Web GO CUS terdaftar.
3. Pastikan Firestore Database sudah dibuat.
4. Jangan membuka database untuk akses publik.
5. Jangan menyimpan password atau private key di kode.
6. Jangan memberikan peran Admin dari formulir pendaftaran publik.

## Pengujian wajib sebelum produksi
- Pendaftaran dan login dengan akun uji.
- Logout dan login ulang.
- Pengguna hanya dapat membaca profilnya sendiri.
- Pemilik warung tidak dapat mengubah data warung lain.
- Menu baru menunggu persetujuan Admin.
- Pelanggan tidak dapat mengubah status pesanan secara sepihak.
- Mitra hanya dapat mengakses tugas yang ditugaskan kepadanya.
- Admin hanya memiliki hak istimewa melalui mekanisme tepercaya.

## Penyimpanan foto
Firebase Storage pada proyek ini meminta upgrade paket.
Jangan mengaktifkan layanan berbayar tanpa persetujuan.
Foto belum tersimpan online sampai solusi penyimpanan
yang aman dan sesuai biaya disiapkan.

## Peringatan
Kode integrasi dan Rules saat ini masih berupa draf.
Jangan publikasikan atau gunakan untuk data pelanggan
sebelum kode diselaraskan dan seluruh pengujian lulus.
