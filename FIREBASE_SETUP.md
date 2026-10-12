# PackPal Firebase setup

PackPal uses Firebase JavaScript SDK 12 with Expo and React Native AsyncStorage persistence for Firebase Authentication.

## Firebase Console setup

1. Create or open the Firebase project `packpal-44785`.
2. Register a **Web app** in that project (the `</>` button). This provides the JavaScript SDK config used by the Expo mobile app; it does not turn PackPal into a web-only app.
3. In **Build → Authentication → Get started → Sign-in method**, enable **Email/Password** and save.
4. In **Build → Firestore Database**, create the default database. Then open **Rules**, paste the contents of `firestore.rules`, and publish.
5. The Firebase config for this project is already set in `src/config/firebase.js`. Keep the Firebase project's service-account JSON out of the mobile project.

The Firestore rules allow each authenticated user to read and write only `users/{theirUid}` and `users/{theirUid}/trips/{tripId}`. Do not replace them with open test rules.

## Run

Install dependencies with `npm install` and start Expo with `npx expo start -c`.

## Data layout

- `users/{uid}` stores a user's profile, light/dark mode, color theme, and language preferences.
- `users/{uid}/trips/{tripId}` stores each trip and its packing items.
- The app listens to the signed-in user's trip subcollection and writes changes there. Signing out clears the in-memory trip list.
