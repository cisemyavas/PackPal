# PackPal Firebase setup

PackPal uses the Firebase JavaScript SDK so Firebase Authentication and Cloud Firestore work with Expo Go.

## 1. Create and configure a Firebase project

1. Create a project in the Firebase Console.
2. Add an Android app using the Android package name from `app.json` (`expo.android.package`).
3. In **Authentication → Sign-in method**, enable **Email/Password**.
4. Create a **Cloud Firestore** database.
5. In **Project settings → Your apps**, register a Web app and copy its Firebase config object.
6. Replace the `REPLACE_WITH_...` values in `src/config/firebase.js` with that config.

The Firebase web config is used by the client SDK. Do not place service-account JSON credentials in the mobile app.

## 2. Publish the Firestore rules

Copy `firestore.rules` into **Firestore Database → Rules** in the Firebase Console and publish them. The rules only allow an authenticated user to read or write `/users/{theirUid}` and `/users/{theirUid}/trips/{tripId}`. Do not use open test rules.

## 3. Run PackPal

Install dependencies with `npx expo install firebase@^12.0.0`, then start the project with `npx expo start`.

## Data layout

- `users/{uid}` stores the user's profile, theme, language and account metadata.
- `users/{uid}/trips/{tripId}` stores each trip and its packing items.
- Firebase Authentication keeps the email/password account and restores the signed-in session with AsyncStorage persistence.

The app switches to the sign-in screen when there is no authenticated user. A signed-in user's trip list listens to their Firestore subcollection in real time.
