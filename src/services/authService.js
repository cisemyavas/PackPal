import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "../config/firebase";

function requireFirebase() {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new Error("Firebase ayarları yapılmamış. Önce src/config/firebase.js dosyasına proje bilgilerini ekle.");
  }
}

export async function registerWithEmail({ name, email, password }) {
  requireFirebase();
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(credential.user, { displayName: name.trim() });
  await setDoc(doc(db, "users", credential.user.uid), {
    uid: credential.user.uid,
    name: name.trim(),
    email: credential.user.email,
    theme: "light",
    colorTheme: "forest",
    language: "en",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return credential.user;
}

export async function loginWithEmail(email, password) {
  requireFirebase();
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
}

export async function logout() {
  requireFirebase();
  await signOut(auth);
}

export async function updateAccountName(user, name) {
  requireFirebase();
  await updateProfile(user, { displayName: name.trim() });
  await setDoc(doc(db, "users", user.uid), {
    name: name.trim(),
    email: user.email,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
