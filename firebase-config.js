
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBLPVIyRzlQQsfDeU3VM17C75CW96GwUzc",
  authDomain: "go-cus.firebaseapp.com",
  projectId: "go-cus",
  appId: "1:838754374714:web:5b0ebaecbb8d817de75103"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
