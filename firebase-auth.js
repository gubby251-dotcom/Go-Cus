
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import { auth, db } from "./firebase-config.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const ROLE_PUBLIK = [
  "pelanggan",
  "pemilik-warung",
  "mitra"
];

const STATUS_MENUNGGU = "menunggu-persetujuan";

function validasiDataMitra(dataMitra) {
  const nomorPlat = String(dataMitra?.nomorPlat || "").trim().toUpperCase();
  const fotoProfil = String(dataMitra?.fotoProfil || "");
  if (nomorPlat.replace(/\s/g, "").length < 4 || nomorPlat.length > 12) {
    throw new Error("Nomor plat kendaraan mitra wajib diisi dengan benar.");
  }
  if (!fotoProfil.startsWith("data:image/jpeg;base64,") || fotoProfil.length > 400000) {
    throw new Error("Foto profil mitra wajib berupa gambar JPEG terkompresi.");
  }
  return { nomorPlat, fotoProfil };
}

function buatProfil(nama, email, jenisAkun, dataMitra = null) {
  const profil = {
    nama: String(nama || "").trim(),
    email,
    role: jenisAkun,
    status: STATUS_MENUNGGU,
    dibuatPada: serverTimestamp()
  };
  if (jenisAkun === "mitra") {
    const mitra = validasiDataMitra(dataMitra);
    profil.nomorPlat = mitra.nomorPlat;
    profil.fotoProfil = mitra.fotoProfil;
  }
  return profil;
}

async function simpanProfilBaru(user, nama, jenisAkun, dataMitra = null) {
  const profil = buatProfil(nama, user.email, jenisAkun, dataMitra);
  await setDoc(doc(db, "users", user.uid), profil);
  return profil;
}

export async function daftarAkun(email, password, nama, jenisAkun, dataMitra = null) {
  const emailBersih = String(email || "").trim();
  const namaBersih = String(nama || "").trim();

  if (!emailBersih || !emailBersih.includes("@")) {
    throw new Error("Alamat email tidak valid.");
  }
  if (String(password || "").length < 6) {
    throw new Error("Kata sandi minimal 6 karakter.");
  }
  if (!namaBersih) {
    throw new Error("Nama wajib diisi.");
  }
  if (!ROLE_PUBLIK.includes(jenisAkun)) {
    throw new Error("Jenis akun tidak diizinkan.");
  }
  if (jenisAkun === "mitra") validasiDataMitra(dataMitra);

  const kredensial = await createUserWithEmailAndPassword(auth, emailBersih, password);
  // Simpan profil dan kirim verifikasi secara terpisah agar kegagalan email
  // tidak membuat pengguna mengira profil belum tersimpan.
  try {
    await simpanProfilBaru(kredensial.user, namaBersih, jenisAkun, dataMitra);
  } catch (error) {
    console.error("GO CUS gagal menyimpan profil:", error);
    throw new Error(
      "Akun Auth sudah dibuat, tetapi profil belum tersimpan. " +
      "Jangan daftar ulang. Masuk dengan akun ini, isi kembali nama dan data Mitra bila diminta, lalu coba pemulihan profil. " +
      (error?.code === "permission-denied"
        ? "Firestore menolak penulisan profil; periksa Rules yang sesuai."
        : (error?.message || "Periksa koneksi dan Firestore."))
    );
  }

  try {
    await sendEmailVerification(kredensial.user);
  } catch (error) {
    console.error("GO CUS gagal mengirim email verifikasi:", error);
    throw new Error(
      "Profil akun sudah tersimpan, tetapi email verifikasi gagal dikirim. " +
      "Masuk kembali lalu gunakan kirim ulang verifikasi. " +
      (error?.code || error?.message || "")
    );
  }

  return kredensial.user;
}

/**
 * Memulihkan akun Auth yang sudah ada tetapi dokumen users/{uid} belum ada.
 * Tidak mengubah profil yang sudah ada atau status persetujuan.
 */
export async function pulihkanProfilAkun(nama, jenisAkun, dataMitra = null) {
  const user = auth.currentUser;
  if (!user) throw new Error("Silakan masuk terlebih dahulu.");
  if (!ROLE_PUBLIK.includes(jenisAkun)) {
    throw new Error("Jenis akun tidak diizinkan.");
  }

  const ref = doc(db, "users", user.uid);
  const existing = await getDoc(ref);

  if (!existing.exists()) {
    const namaBersih = String(nama || "").trim();
    if (!namaBersih) throw new Error("Isi nama lengkap untuk memulihkan profil.");
    if (jenisAkun === "mitra") validasiDataMitra(dataMitra);
    await simpanProfilBaru(user, namaBersih, jenisAkun, dataMitra);
  }

  await user.reload();
  if (!user.emailVerified) {
    await sendEmailVerification(user);
    return { emailTerverifikasi: false, emailDikirim: true };
  }
  return { emailTerverifikasi: true, emailDikirim: false };
}

export async function kirimUlangVerifikasi() {
  const user = auth.currentUser;
  if (!user) throw new Error("Silakan masuk terlebih dahulu.");
  await user.reload();
  if (user.emailVerified) return { emailTerverifikasi: true };
  await sendEmailVerification(user);
  return { emailTerverifikasi: false, emailDikirim: true };
}

export async function loginAkun(email, password) {
  const kredensial = await signInWithEmailAndPassword(
    auth,
    String(email || "").trim(),
    password
  );

  return kredensial.user;
}

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
      role: null,
      status: "profil-belum-tersedia",
      emailTerverifikasi: user.emailVerified
    };
  }

  const profil = snapshot.data();

  return {
    uid: user.uid,
    email: user.email,
    nama: profil.nama || "",
    role: profil.role || null,
    status: profil.status || STATUS_MENUNGGU,
    emailTerverifikasi: user.emailVerified
  };
}

export async function logoutAkun() {
  await signOut(auth);
}

export function pantauLogin(callback) {
  return onAuthStateChanged(auth, callback);
}
