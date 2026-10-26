
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import { auth, db } from "./firebase-config.js";

import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const ROLE_PUBLIK = [
  "pelanggan",
  "pemilik-warung",
  "mitra"
];

const STATUS_MENUNGGU = "menunggu-persetujuan";

// Pertahankan sesi login di browser/perangkat ini setelah halaman ditutup.
// Pengguna tetap harus login kembali jika memilih Keluar atau sesi dihapus.
async function pastikanSesiTersimpan() {
  await setPersistence(auth, browserLocalPersistence);
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

  if (jenisAkun === "mitra") {
    const nomorPlat = String(dataMitra?.nomorPlat || "").trim().toUpperCase();
    const fotoProfil = String(dataMitra?.fotoProfil || "");
    if (nomorPlat.replace(/\\s/g, "").length < 4 || nomorPlat.length > 12) {
      throw new Error("Nomor plat kendaraan mitra wajib diisi dengan benar.");
    }
    if (!fotoProfil.startsWith("data:image/jpeg;base64,") || fotoProfil.length > 400000) {
      throw new Error("Foto profil mitra wajib berupa gambar terkompresi.");
    }
  }

  await pastikanSesiTersimpan();

  const kredensial = await createUserWithEmailAndPassword(
    auth,
    emailBersih,
    password
  );

  try {
    const profilBaru = {
      nama: namaBersih,
      email: kredensial.user.email,
      role: jenisAkun,
      status: STATUS_MENUNGGU,
      dibuatPada: serverTimestamp()
    };

    if (jenisAkun === "mitra") {
      profilBaru.nomorPlat = String(dataMitra.nomorPlat).trim().toUpperCase();
      profilBaru.fotoProfil = dataMitra.fotoProfil;
    }

    await setDoc(doc(db, "users", kredensial.user.uid), profilBaru);

    await sendEmailVerification(kredensial.user);
  } catch (error) {
    console.error("Pendaftaran/profil:", error);

    throw new Error(
      "Akun Auth telah dibuat, tetapi profil atau verifikasi email " +
      "belum selesai. Jangan mendaftar ulang dengan email yang sama. " +
      "Periksa Firestore Rules dan status akun."
    );
  }

  return kredensial.user;
}

export async function loginAkun(email, password) {
  await pastikanSesiTersimpan();

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


// Memantau perubahan persetujuan secara realtime tanpa meminta login ulang.
export function pantauStatusAkun(callback, onError = () => {}) {
  const user = auth.currentUser;
  if (!user) {
    onError(new Error("Sesi login tidak tersedia."));
    return () => {};
  }
  return onSnapshot(
    doc(db, "users", user.uid),
    snapshot => {
      if (!snapshot.exists()) {
        callback({ uid: user.uid, role: null, status: "profil-belum-tersedia", emailTerverifikasi: user.emailVerified });
        return;
      }
      const profil = snapshot.data();
      callback({
        uid: user.uid,
        email: user.email,
        nama: profil.nama || "",
        role: profil.role || null,
        status: profil.status || STATUS_MENUNGGU,
        emailTerverifikasi: user.emailVerified
      });
    },
    onError
  );
}
