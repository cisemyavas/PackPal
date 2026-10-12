import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";

// Firebase Console > Project settings > Your apps > SDK setup and configuration.
// Replace these values with the Firebase web app config for PackPal.
const firebaseConfig = {
  apiKey: "AIzaSyCDOKV3sZpZvloiwPEpq0xKiHYeRzsmc94",
  authDomain: "packpal-44785.firebaseapp.com",
  projectId: "packpal-44785",
  storageBucket: "packpal-44785.firebasestorage.app",
  messagingSenderId: "683111864559",
  appId: "1:683111864559:web:bf922a561c4febffd3231a",
};

export const isFirebaseConfigured =
  !Object.values(firebaseConfig).some((value) => value.includes("REPLACE_WITH"));

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // Fast refresh can initialize Auth more than once.
    auth = getAuth(app);
  }

  db = getFirestore(app);
}

export { auth, db };
