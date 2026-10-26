
import { db, auth } from "./firebase-config.js";

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

async function ambilProfilTerverifikasi(uid) {
  const snapshot = await getDoc(doc(db, "users", uid));

  if (!snapshot.exists()) {
    throw new Error("Profil akun belum tersedia.");
  }

  const profil = snapshot.data();

  if (
    profil.role !== "pemilik-warung" ||
    profil.status !== "disetujui"
  ) {
    throw new Error("Akun pemilik warung belum disetujui.");
  }

  return profil;
}

// Membaca profil pengguna sendiri.
export async function ambilProfilSaya() {
  const user = penggunaAktif();
  const snapshot = await getDoc(doc(db, "users", user.uid));

  if (!snapshot.exists()) {
    throw new Error("Profil belum tersedia.");
  }

  return {
    uid: user.uid,
    ...snapshot.data()
  };
}

// Membuat atau memperbarui profil warung milik sendiri.
export async function simpanProfilWarung(data) {
  const user = penggunaAktif();

  await ambilProfilTerverifikasi(user.uid);

  const namaWarung = String(data.namaWarung || "").trim();
  const deskripsi = String(data.deskripsi || "").trim();

  if (!namaWarung) {
    throw new Error("Nama warung wajib diisi.");
  }

  const shopRef = doc(db, "shops", user.uid);
  const shopSnapshot = await getDoc(shopRef);

  const profilWarung = {
    ownerUid: user.uid,
    namaWarung,
    deskripsi,
    diperbaruiPada: serverTimestamp()
  };

  if (!shopSnapshot.exists()) {
    profilWarung.verified = false;
    profilWarung.dibuatPada = serverTimestamp();
  }

  await setDoc(shopRef, profilWarung, { merge: true });
}

// Menambahkan menu baru. Menu menunggu persetujuan Admin.
export async function tambahMenu(data) {
  const user = penggunaAktif();

  await ambilProfilTerverifikasi(user.uid);

  const nama = String(data.nama || "").trim();
  const harga = Number(data.harga);
  const deskripsi = String(data.deskripsi || "").trim();

  if (!nama) {
    throw new Error("Nama menu wajib diisi.");
  }

  if (!Number.isFinite(harga) || harga <= 0) {
    throw new Error("Harga harus berupa angka lebih dari nol.");
  }

  const shopSnapshot = await getDoc(doc(db, "shops", user.uid));

  if (!shopSnapshot.exists()) {
    throw new Error("Buat profil warung terlebih dahulu.");
  }

  if (shopSnapshot.data().verified !== true) {
    throw new Error("Warung belum diverifikasi Admin.");
  }

  return await addDoc(
    collection(db, "shops", user.uid, "menus"),
    {
      ownerUid: user.uid,
      nama,
      harga,
      deskripsi,
      tersedia: true,
      statusPersetujuan: "menunggu",
      dibuatPada: serverTimestamp(),
      diperbaruiPada: serverTimestamp()
    }
  );
}

// Membaca menu warung sendiri.
export async function ambilMenuWarungSaya() {
  const user = penggunaAktif();

  await ambilProfilTerverifikasi(user.uid);

  const snapshot = await getDocs(
    collection(db, "shops", user.uid, "menus")
  );

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data()
  }));
}

// Membuat pesanan dasar untuk pelanggan yang login.
export async function buatPesanan(data) {
  const user = penggunaAktif();

  const profilSnapshot = await getDoc(doc(db, "users", user.uid));

  if (
    !profilSnapshot.exists() ||
    profilSnapshot.data().role !== "pelanggan" ||
    profilSnapshot.data().status !== "disetujui"
  ) {
    throw new Error("Akun pelanggan belum disetujui.");
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Data pesanan tidak valid.");
  }

  return await addDoc(collection(db, "orders"), {
    customerUid: user.uid,
    detail: data,
    status: "menunggu",
    dibuatPada: serverTimestamp()
  });
}
