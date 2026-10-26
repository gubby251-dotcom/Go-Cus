
import { db, auth } from "./firebase-config.js";

import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Pastikan pengguna sudah login.
function penggunaAktif() {
  if (!auth.currentUser) {
    throw new Error("Silakan login terlebih dahulu.");
  }
  return auth.currentUser;
}

// Membaca profil akun sendiri.
export async function ambilProfilSaya() {
  const user = penggunaAktif();
  const snapshot = await getDoc(doc(db, "users", user.uid));

  if (!snapshot.exists()) {
    throw new Error("Profil belum tersedia.");
  }

  return { uid: user.uid, ...snapshot.data() };
}

// Membuat atau memperbarui profil warung sendiri.
export async function simpanProfilWarung(data) {
  const user = penggunaAktif();
  const profilRef = doc(db, "users", user.uid);
  const profilSnap = await getDoc(profilRef);

  if (!profilSnap.exists() ||
      profilSnap.data().role !== "pemilik-warung" ||
      profilSnap.data().status !== "disetujui") {
    throw new Error("Akun warung belum disetujui.");
  }

  const shopRef = doc(db, "shops", user.uid);
  const shopSnap = await getDoc(shopRef);

  const profil = {
    ownerUid: user.uid,
    namaWarung: String(data.namaWarung || "").trim(),
    deskripsi: String(data.deskripsi || "").trim(),
    diperbaruiPada: serverTimestamp()
  };

  if (!shopSnap.exists()) {
    profil.dibuatPada = serverTimestamp();
  }

  await setDoc(shopRef, profil, { merge: true });
}

// Tambah menu untuk warung sendiri.
export async function tambahMenu(data) {
  const user = penggunaAktif();
  const profilSnap = await getDoc(doc(db, "users", user.uid));

  if (!profilSnap.exists() ||
      profilSnap.data().role !== "pemilik-warung" ||
      profilSnap.data().status !== "disetujui") {
    throw new Error("Akun warung belum disetujui.");
  }

  const nama = String(data.nama || "").trim();
  const harga = Number(data.harga);

  if (!nama || !Number.isFinite(harga) || harga < 0) {
    throw new Error("Nama menu dan harga harus valid.");
  }

  return await addDoc(
    collection(db, "shops", user.uid, "menus"),
    {
      ownerUid: user.uid,
      nama,
      harga,
      deskripsi: String(data.deskripsi || "").trim(),
      tersedia: true,
      statusPersetujuan: "menunggu",
      dibuatPada: serverTimestamp(),
      diperbaruiPada: serverTimestamp()
    }
  );
}

// Membaca menu milik warung yang sedang login.
export async function ambilMenuWarungSaya() {
  const user = penggunaAktif();
  const menuRef = collection(db, "shops", user.uid, "menus");
  const snapshot = await getDocs(menuRef);

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data()
  }));
}

// Membuat pesanan baru.
export async function buatPesanan(data) {
  const user = penggunaAktif();

  return await addDoc(collection(db, "orders"), {
    customerUid: user.uid,
    detail: data,
    status: "menunggu",
    dibuatPada: serverTimestamp()
  });
}
