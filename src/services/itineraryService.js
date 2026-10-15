// PackPal itinerary MVP: independent of TripContext and shared packing items.
// Firebase web SDK only (compatible with Expo Go; no new native packages).
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const ITINERARY_SCOPE = Object.freeze({
  PERSONAL: 'personal',
  SHARED: 'shared',
});

function signedInUser() {
  const user = auth?.currentUser;
  if (!db || !user) {
    throw new Error('Gezi planı için PackPal hesabına giriş yapmalısın.');
  }
  return user;
}

function validateId(value, label) {
  const id = String(value ?? '').trim();
  if (!id || id.includes('/')) throw new Error(`${label} geçerli değil.`);
  return id;
}

function activityCollection(scope, tripId) {
  const user = signedInUser();
  const id = validateId(tripId, 'Seyahat kimliği');
  if (scope === ITINERARY_SCOPE.PERSONAL) {
    return collection(db, 'users', user.uid, 'trips', id, 'itinerary');
  }
  if (scope === ITINERARY_SCOPE.SHARED) {
    return collection(db, 'sharedTrips', id, 'itinerary');
  }
  throw new Error('Gezi planı türü personal veya shared olmalı.');
}

function validISODate(value) {
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function cleanFields(values, partial = false) {
  const fields = {};
  const required = ['title', 'date', 'startTime', 'placeName', 'notes'];
  for (const key of required) {
    if (partial && !Object.prototype.hasOwnProperty.call(values, key)) continue;
    fields[key] = String(values[key] ?? '').trim();
  }
  if (!partial || 'title' in fields) {
    if (!fields.title || fields.title.length > 100) {
      throw new Error('Etkinlik adı 1-100 karakter olmalı.');
    }
  }
  if (!partial || 'date' in fields) {
    if (!validISODate(fields.date)) {
      throw new Error('Tarih YYYY-AA-GG biçiminde geçerli bir gün olmalı.');
    }
  }
  if ('startTime' in fields && fields.startTime && !/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(fields.startTime)) {
    throw new Error('Saat SS:DD biçiminde olmalı (ör. 10:30).');
  }
  if ('placeName' in fields && fields.placeName.length > 120) {
    throw new Error('Mekân adı en fazla 120 karakter olabilir.');
  }
  if ('notes' in fields && fields.notes.length > 1000) {
    throw new Error('Notlar en fazla 1000 karakter olabilir.');
  }
  return fields;
}

function orderActivities(items) {
  // Sorting on the client avoids a Firestore composite index requirement.
  return items.sort((a, b) => {
    const aKey = `${a.date || ''}|${a.startTime || '99:99'}`;
    const bKey = `${b.date || ''}|${b.startTime || '99:99'}`;
    return aKey.localeCompare(bKey) || a.id.localeCompare(b.id);
  });
}

export function subscribeToItinerary(scope, tripId, onChange, onError) {
  return onSnapshot(activityCollection(scope, tripId),
    (snap) => onChange(orderActivities(snap.docs.map((item) => ({ id: item.id, ...item.data() })))),
    onError,
  );
}

export async function addItineraryActivity(scope, tripId, values) {
  const user = signedInUser();
  const fields = cleanFields(values);
  return addDoc(activityCollection(scope, tripId), {
    ...fields,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateItineraryActivity(scope, tripId, activityId, changes) {
  signedInUser();
  const fields = cleanFields(changes, true);
  if (!Object.keys(fields).length) return;
  return updateDoc(doc(activityCollection(scope, tripId), validateId(activityId, 'Etkinlik kimliği')), {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteItineraryActivity(scope, tripId, activityId) {
  signedInUser();
  return deleteDoc(doc(activityCollection(scope, tripId), validateId(activityId, 'Etkinlik kimliği')));
}
