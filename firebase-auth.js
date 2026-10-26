
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import { auth, db } from "./firebase-config.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const ROLE_DIIZINKAN = [
  "pelanggan",
  "pemilik-warung",
  "mitra"
];

// Mendaftarkan akun baru.
// Akun belum dapat memakai fitur khusus sampai disetujui.
export async function daftarAkun(email, password, nama, jenisAkun) {
  const namaBersih = String(nama || "").trim();
  const emailBersih = String(email || "").trim();

  if (!namaBersih) {
    throw new Error("Nama wajib diisi.");
  }

  if (!ROLE_DIIZINKAN.includes(jenisAkun)) {
    throw new Error("Jenis akun tidak valid.");
  }

  const kredensial = await createUserWithEmailAndPassword(
    auth,
    emailBersih,
    password
  );

  try {
    await setDoc(doc(db, "users", kredensial.user.uid), {
      nama: namaBersih,
      email: kredensial.user.email,
      role: jenisAkun,
      status: "menunggu-persetujuan",
      dibuatPada: serverTimestamp()
    });
  } catch (error) {
    // Jika profil gagal disimpan, akun Auth sudah terbuat.
    // Jangan menghapus akun secara otomatis.
    throw new Error(
      "Akun berhasil dibuat, tetapi profil gagal disimpan. " +
      "Periksa Firestore Rules sebelum mencoba kembali."
    );
  }

  return kredensial.user;
}

// Login email dan password.
export async function loginAkun(email, password) {
  const kredensial = await signInWithEmailAndPassword(
    auth,
    String(email || "").trim(),
    password
  );

  return kredensial.user;
}

// Membaca profil dan status akun setelah login.
export async function ambilStatusAkun() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Silakan login terlebih dahulu.");
  }

  const snapshot = await getDoc(doc(db, "users", user.uid));

  if (!snapshot.exists()) {
    return {
      uid: user.uid,
      email: user.email,
      status: "profil-belum-tersedia"
    };
  }

  const profil = snapshot.data();

  return {
    uid: user.uid,
    email: user.email,
    nama: profil.nama || "",
    role: profil.role || "",
    status: profil.status || "menunggu-persetujuan"
  };
}

// Logout.
export async function logoutAkun() {
  await signOut(auth);
}

// Pantau login dan logout.
export function pantauLogin(callback) {
  return onAuthStateChanged(auth, callback);
}
