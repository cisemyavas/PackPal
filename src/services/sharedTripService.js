// Separate from individual trips. Firebase web SDK only; Expo Go compatible.
import {
  collection, doc, getDoc, onSnapshot, serverTimestamp,
  updateDoc, deleteDoc, writeBatch, addDoc, runTransaction,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

function requireUser() {
  const user = auth?.currentUser;
  if (!db || !user) throw new Error('Bu işlem için PackPal hesabına giriş yapmalısın.');
  return user;
}

function publicName(user) {
  const name = (user.displayName || '').trim();
  return (name || `Gezgin-${user.uid.slice(0, 6)}`).slice(0, 80);
}

// Firestore generates 20-character, case-sensitive random auto IDs.
// Treat these IDs as private bearer invitations, not human-guessable short PINs.
export async function createSharedTrip({ title, destination, startDate = '', endDate = '' }) {
  const user = requireUser();
  const name = String(title || '').trim();
  const city = String(destination || '').trim();
  if (!name || name.length > 100 || !city || city.length > 100) {
    throw new Error('Seyahat adı ve varış yeri 1-100 karakter olmalı.');
  }
  if ((startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) ||
      (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) ||
      (startDate && endDate && endDate < startDate)) {
    throw new Error('Tarihleri YYYY-AA-GG biçiminde ve doğru sırada gir.');
  }
  const tripRef = doc(collection(db, 'sharedTrips'));
  const inviteRef = doc(collection(db, 'sharedTripInvites'));
  const memberRef = doc(db, 'sharedTrips', tripRef.id, 'members', user.uid);
  const linkRef = doc(db, 'users', user.uid, 'sharedTripLinks', tripRef.id);
  const batch = writeBatch(db);
  batch.set(tripRef, {
    ownerUid: user.uid, title: name, destination: city,
    startDate, endDate, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  batch.set(memberRef, { uid: user.uid, displayName: publicName(user), joinedAt: serverTimestamp() });
  batch.set(linkRef, { tripId: tripRef.id, createdAt: serverTimestamp() });
  batch.set(inviteRef, {
    tripId: tripRef.id, createdBy: user.uid, isActive: true,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
  return { tripId: tripRef.id, inviteCode: inviteRef.id };
}

export async function joinSharedTrip(rawCode) {
  const user = requireUser();
  // Keep exact case: Firebase document IDs are case-sensitive.
  const code = String(rawCode || '').trim();
  if (!/^[A-Za-z0-9]{20}$/.test(code)) {
    throw new Error('20 karakterlik davet kodunu eksiksiz gir.');
  }
  const inviteSnap = await getDoc(doc(db, 'sharedTripInvites', code));
  if (!inviteSnap.exists() || !inviteSnap.data().isActive) {
    throw new Error('Davet kodu bulunamadı veya iptal edilmiş.');
  }
  const tripId = inviteSnap.data().tripId;
  const linkRef = doc(db, 'users', user.uid, 'sharedTripLinks', tripId);
  const existingLink = await getDoc(linkRef);
  if (existingLink.exists()) return tripId;

  // Atomic proof + membership + personal index. Proof contains the secret and
  // is readable only by the joining user; other members never see it.
  const proofRef = doc(db, 'sharedTrips', tripId, 'membershipProofs', user.uid);
  const proofSnap = await getDoc(proofRef);
  const memberRef = doc(db, 'sharedTrips', tripId, 'members', user.uid);
  const memberSnap = await getDoc(memberRef);
  const batch = writeBatch(db);
  if (!proofSnap.exists()) {
    batch.set(proofRef, { tripId, code, createdAt: serverTimestamp() });
  }
  if (!memberSnap.exists()) {
    batch.set(memberRef, { uid: user.uid, displayName: publicName(user), joinedAt: serverTimestamp() });
  }
  batch.set(linkRef, { tripId, createdAt: serverTimestamp() });
  try {
    await batch.commit();
  } catch (error) {
    if (error?.code === 'permission-denied') {
      throw new Error('Katılım reddedildi. Davet kodu yenilenmiş veya erişim iznin kaldırılmış olabilir.');
    }
    throw error;
  }
  return tripId;
}

export function subscribeToMySharedTrips(uid, onChange, onError) {
  if (!db || !uid) { onChange([]); return () => {}; }
  let disposed = false;
  let childUnsubs = [];
  let cache = {};
  const unsubscribe = onSnapshot(
    collection(db, 'users', uid, 'sharedTripLinks'),
    (snapshot) => {
      childUnsubs.forEach((fn) => fn());
      childUnsubs = [];
      cache = {};
      if (snapshot.empty) { onChange([]); return; }
      const ids = snapshot.docs.map((snap) => snap.id);
      const emit = () => {
        if (!disposed) onChange(ids.filter((id) => cache[id]).map((id) => cache[id]));
      };
      ids.forEach((tripId) => {
        const stop = onSnapshot(doc(db, 'sharedTrips', tripId), (trip) => {
          if (trip.exists()) cache[tripId] = { id: trip.id, ...trip.data() };
          else delete cache[tripId];
          emit();
        }, onError);
        childUnsubs.push(stop);
      });
    }, onError,
  );
  return () => { disposed = true; unsubscribe(); childUnsubs.forEach((fn) => fn()); };
}

export function subscribeToSharedTrip(tripId, onChange, onError) {
  return onSnapshot(doc(db, 'sharedTrips', tripId),
    (snap) => onChange(snap.exists() ? { id: snap.id, ...snap.data() } : null), onError);
}

export function subscribeToSharedItems(tripId, onChange, onError) {
  return onSnapshot(collection(db, 'sharedTrips', tripId, 'items'), (snap) => {
    const items = snap.docs.map((item) => ({ id: item.id, ...item.data() }));
    items.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
    onChange(items);
  }, onError);
}

export function subscribeToSharedMembers(tripId, onChange, onError) {
  return onSnapshot(collection(db, 'sharedTrips', tripId, 'members'),
    (snap) => onChange(snap.docs.map((member) => ({ id: member.id, ...member.data() }))), onError);
}

export async function addSharedItem(tripId, { name, quantity = 1, assignedTo = null }) {
  const user = requireUser();
  const safeName = String(name || '').trim();
  const count = Number(quantity);
  if (!safeName || safeName.length > 100 || !Number.isInteger(count) || count < 1 || count > 99) {
    throw new Error('Eşya adı (1-100 karakter) ve adet (1-99) gerekli.');
  }
  return addDoc(collection(db, 'sharedTrips', tripId, 'items'), {
    name: safeName, quantity: count, isPacked: false,
    assignedTo: assignedTo || null, createdBy: user.uid,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
}

export async function changeSharedItem(tripId, itemId, changes) {
  requireUser();
  const fields = {};
  if ('isPacked' in changes) fields.isPacked = Boolean(changes.isPacked);
  if ('assignedTo' in changes) fields.assignedTo = changes.assignedTo || null;
  if (!Object.keys(fields).length) return;
  await updateDoc(doc(db, 'sharedTrips', tripId, 'items', itemId), {
    ...fields, updatedAt: serverTimestamp(),
  });
}

export async function removeSharedItem(tripId, itemId) {
  requireUser();
  return deleteDoc(doc(db, 'sharedTrips', tripId, 'items', itemId));
}

// Rotate the invitation generation atomically. Older invitation documents are
// retained for audit/history, but their codes cease to authorize joins.
export async function createAnotherInviteCode(tripId) {
  const user = requireUser();
  const tripRef = doc(db, 'sharedTrips', tripId);
  return runTransaction(db, async (tx) => {
    const trip = await tx.get(tripRef);
    if (!trip.exists() || trip.data().ownerUid !== user.uid) {
      throw new Error('Yalnızca seyahat sahibi davet kodunu yenileyebilir.');
    }
    const version = (trip.data().inviteVersion ?? 0) + 1;
    const newInvite = doc(collection(db, 'sharedTripInvites'));
    tx.update(tripRef, { inviteVersion: version, updatedAt: serverTimestamp() });
    tx.set(newInvite, {
      tripId, createdBy: user.uid, isActive: true,
      inviteVersion: version, createdAt: serverTimestamp(),
    });
    return newInvite.id;
  });
}

// Remove a member and rotate invitations in one atomic transaction. The
// removed account loses its membership and personal index on the same commit.
// Rotating the version also invalidates every invitation previously shared.
export async function removeSharedParticipant(tripId, participantUid) {
  const user = requireUser();
  if (!participantUid || participantUid === user.uid) {
    throw new Error('Seyahat sahibi kendisini çıkaramaz.');
  }
  const tripRef = doc(db, 'sharedTrips', tripId);
  const memberRef = doc(db, 'sharedTrips', tripId, 'members', participantUid);
  const proofRef = doc(db, 'sharedTrips', tripId, 'membershipProofs', participantUid);
  const linkRef = doc(db, 'users', participantUid, 'sharedTripLinks', tripId);
  return runTransaction(db, async (tx) => {
    // All reads precede all writes, as required by Firestore transactions.
    const trip = await tx.get(tripRef);
    const member = await tx.get(memberRef);
    if (!trip.exists() || trip.data().ownerUid !== user.uid) {
      throw new Error('Katılımcı çıkarmak için seyahat sahibi olmalısın.');
    }
    if (!member.exists()) {
      throw new Error('Bu kullanıcı artık katılımcı değil.');
    }
    const version = (trip.data().inviteVersion ?? 0) + 1;
    const newInvite = doc(collection(db, 'sharedTripInvites'));
    tx.update(tripRef, { inviteVersion: version, updatedAt: serverTimestamp() });
    tx.delete(memberRef);
    tx.delete(proofRef);
    tx.delete(linkRef);
    tx.set(newInvite, {
      tripId, createdBy: user.uid, isActive: true,
      inviteVersion: version, createdAt: serverTimestamp(),
    });
    return newInvite.id;
  });
}

// Only ordinary participants can leave; the owner must retain ownership.
// Preserve shared items and other people's memberships.
export async function leaveSharedTrip(tripId) {
  const user = requireUser();
  const tripRef = doc(db, 'sharedTrips', tripId);
  const trip = await getDoc(tripRef);
  if (!trip.exists()) throw new Error('Ortak seyahat bulunamadı.');
  if (trip.data().ownerUid === user.uid) {
    throw new Error('Seyahat sahibi ayrılamaz. Önce sahiplik devri özelliği gerekir.');
  }
  const memberRef = doc(db, 'sharedTrips', tripId, 'members', user.uid);
  const proofRef = doc(db, 'sharedTrips', tripId, 'membershipProofs', user.uid);
  const linkRef = doc(db, 'users', user.uid, 'sharedTripLinks', tripId);
  const batch = writeBatch(db);
  batch.delete(memberRef);
  batch.delete(proofRef);
  batch.delete(linkRef);
  await batch.commit();
}
