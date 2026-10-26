
import { auth, db } from "./firebase-config.js";

import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

function penggunaAktif() {
  if (!auth.currentUser) {
    throw new Error("Silakan login terlebih dahulu.");
  }

  return auth.currentUser;
}

export async function ambilProfilSaya() {
  const user = penggunaAktif();
  const snapshot = await getDoc(doc(db, "users", user.uid));

  if (!snapshot.exists()) {
    throw new Error("Profil akun belum tersedia.");
  }

  return {
    uid: user.uid,
    ...snapshot.data()
  };
}

async function pastikanPeranDisetujui(peran) {
  const profil = await ambilProfilSaya();

  if (profil.role !== peran || profil.status !== "disetujui") {
    throw new Error("Akun belum disetujui untuk fitur ini.");
  }

  return profil;
}

export async function simpanProfilWarung(data) {
  const user = penggunaAktif();

  await pastikanPeranDisetujui("pemilik-warung");

  const namaWarung = String(data?.namaWarung || "").trim();
  const deskripsi = String(data?.deskripsi || "").trim();

  if (!namaWarung) {
    throw new Error("Nama warung wajib diisi.");
  }

  const shopRef = doc(db, "shops", user.uid);
  const snapshot = await getDoc(shopRef);

  if (!snapshot.exists()) {
    await setDoc(shopRef, {
      ownerUid: user.uid,
      namaWarung,
      deskripsi,
      verified: false,
      dibuatPada: serverTimestamp(),
      diperbaruiPada: serverTimestamp()
    });

    return;
  }

  await setDoc(shopRef, {
    namaWarung,
    deskripsi,
    diperbaruiPada: serverTimestamp()
  }, { merge: true });
}

export async function tambahMenu(data) {
  const user = penggunaAktif();

  await pastikanPeranDisetujui("pemilik-warung");

  const nama = String(data?.nama || "").trim();
  const deskripsi = String(data?.deskripsi || "").trim();
  const harga = Number(data?.harga);

  if (!nama) {
    throw new Error("Nama menu wajib diisi.");
  }

  if (!Number.isFinite(harga) || harga <= 0) {
    throw new Error("Harga harus lebih dari nol.");
  }

  const shopSnapshot = await getDoc(doc(db, "shops", user.uid));

  if (!shopSnapshot.exists()) {
    throw new Error("Buat profil warung terlebih dahulu.");
  }

  if (shopSnapshot.data().verified !== true) {
    throw new Error("Warung belum diverifikasi Admin.");
  }

  return addDoc(collection(db, "shops", user.uid, "menus"), {
    ownerUid: user.uid,
    nama,
    deskripsi,
    harga,
    tersedia: true,
    statusPersetujuan: "menunggu",
    dibuatPada: serverTimestamp(),
    diperbaruiPada: serverTimestamp()
  });
}

export async function ambilMenuWarungSaya() {
  const user = penggunaAktif();

  await pastikanPeranDisetujui("pemilik-warung");

  const snapshot = await getDocs(
    collection(db, "shops", user.uid, "menus")
  );

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data()
  }));
}

/*
 * Fungsi ini belum menjadi sistem checkout produksi.
 * Validasi harga, stok, ongkir, saldo, dan total wajib dilakukan
 * kembali di backend sebelum transaksi nyata diaktifkan.
 */
export async function buatPesanan(data) {
  const user = penggunaAktif();

  await pastikanPeranDisetujui("pelanggan");

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Data pesanan tidak valid.");
  }

  throw new Error(
    "Checkout belum diaktifkan. Hubungkan ke backend pesanan " +
    "setelah validasi harga dan pembayaran tersedia."
  );
}
