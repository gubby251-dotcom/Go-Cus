# GO-CUS — Tampilan publik tanpa demo

Perubahan:
- Tombol navigasi Driver/Admin tidak ditampilkan pada halaman publik.
- Panel Driver/Admin disembunyikan dari tampilan publik.
- Form pemesanan tidak lagi membuat pesanan simulasi atau menyimpannya di localStorage.
- Riwayat pesanan lokal demo dan tombol hapusnya disembunyikan.
- Teks yang menyebut prototipe/demo pada bagian publik dibersihkan.

Batasan:
- Ini belum mengaktifkan pesanan nyata, login Firebase, driver, pembayaran, atau wallet.
- CSS menyembunyikan panel internal, tetapi bukan pengganti otorisasi backend. Jangan gunakan panel tersembunyi sebagai sistem Admin/Driver produksi.
- Firestore Rules jangan dipublikasikan sampai diuji dan diintegrasikan dengan alur aplikasi.
- Desain inti pelanggan dipertahankan sejauh memungkinkan.
