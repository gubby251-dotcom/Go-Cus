
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
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Daftar akun baru.
// Role tidak boleh ditentukan bebas oleh pengguna.
export async function daftarAkun(email, password, nama, jenisAkun) {
  const roleDiizinkan = ["pelanggan", "pemilik-warung", "mitra"];

  if (!roleDiizinkan.includes(jenisAkun)) {
    throw new Error("Jenis akun tidak valid.");
  }

  const kredensial = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );

  await setDoc(doc(db, "users", kredensial.user.uid), {
    nama: nama.trim(),
    email: kredensial.user.email,
    role: jenisAkun,
    status: "menunggu-persetujuan",
    dibuatPada: serverTimestamp()
  });

  return kredensial.user;
}

// Login menggunakan email dan password.
export async function loginAkun(email, password) {
  const kredensial = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );

  return kredensial.user;
}

// Logout akun aktif.
export async function logoutAkun() {
  await signOut(auth);
}

// Memantau perubahan status login.
export function pantauLogin(callback) {
  return onAuthStateChanged(auth, callback);
}
