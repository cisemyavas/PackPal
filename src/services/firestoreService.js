import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../config/firebase";

function userTripsCollection(uid) {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase ayarları yapılmamış.");
  if (!uid) throw new Error("Oturum açan kullanıcı bulunamadı.");
  return collection(db, "users", uid, "trips");
}

export function subscribeToTrips(uid, onTrips, onError) {
  return onSnapshot(userTripsCollection(uid), (snapshot) => {
    onTrips(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })));
  }, onError);
}

export async function replaceUserTrips(uid, trips) {
  const ref = userTripsCollection(uid);
  const snapshot = await getDocs(ref);
  const existingIds = new Set(snapshot.docs.map((entry) => entry.id));
  const nextIds = new Set(trips.map((trip) => String(trip.id)));
  const batch = writeBatch(db);

  snapshot.docs.forEach((entry) => {
    if (!nextIds.has(entry.id)) batch.delete(entry.ref);
  });
  trips.forEach((trip) => {
    const tripRef = doc(ref, String(trip.id));
    batch.set(tripRef, { ...trip, id: String(trip.id) });
  });

  if (existingIds.size || trips.length) await batch.commit();
}

export async function removeUserTrip(uid, tripId) {
  await deleteDoc(doc(userTripsCollection(uid), String(tripId)));
}

export async function getUserProfile(uid) {
  if (!db || !uid) return null;
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function updateUserProfile(uid, updates) {
  if (!db || !uid) throw new Error("Oturum açan kullanıcı bulunamadı.");
  await setDoc(doc(db, "users", uid), { ...updates, updatedAt: serverTimestamp() }, { merge: true });
}
