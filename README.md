# Cogniva — Mobile App (React Native / Expo)

## What's here
**v2** — redesigned around Community as the core MVP feature, with a
sleeker, more restrained visual style (one confident indigo accent instead
of five competing colors; teal/coral now only used sparingly for badges).

Bottom tabs, in order: **Community** (first/default tab), **Home**, **Learn**
(Knowledge Hub), **Toolkit**, **Journal**. **AI Assistant** and **Settings**
moved off the tab bar — they're reached as modal screens from Home (the
"Ask the AI Assistant" card, and tapping the avatar), since they're
supporting features rather than primary navigation now.

- **Community** — a Facebook-style feed for parents, therapists, and
  psychologists to post and reply, with role badges and filter chips
- **Home** — dashboard (appointments, routine progress) + quick links
- **Learn** (Knowledge Hub) — search, category filters, a featured guide,
  and an article list with category tags — redesigned to read as an
  actual resource library rather than plain colored boxes
- **Toolkit** — routines & strategies
- **Journal** — logs, stats, PDF report export (placeholder)
- **AI Assistant** — chat UI (non-diagnostic disclaimer built in)
- **Settings** — profile, premium upgrade, child profiles, wellbeing

`src/theme/colors.ts` is the one file to touch for global color changes —
every screen reads from it, nothing hardcodes a hex value on its own.

## Getting started
```bash
npm install
npx expo start
```
Scan the QR code with Expo Go (iOS/Android) or press `i` / `a` for a simulator.

## Google Sign-In setup
Google requires three separate OAuth client IDs — web, iOS, and Android each need their own, and using the wrong one for a platform just fails silently.

1. In the **Firebase console**: Build → Authentication → Sign-in method → click **Google** → Enable → Save. This automatically creates a **Web client ID** for you.
2. Go to **Google Cloud Console** (console.cloud.google.com) → make sure you're in the same project as your Firebase project (top dropdown) → **APIs & Services → Credentials**.
3. You'll already see the Web client ID Firebase created. Copy it into `src/firebase/googleAuthConfig.ts` as `GOOGLE_WEB_CLIENT_ID`.
4. Click **+ Create Credentials → OAuth client ID → iOS**. For "Bundle ID," use the value in `app.json` under `ios.bundleIdentifier` (currently `com.cogniva.app`). Copy the resulting client ID into `GOOGLE_IOS_CLIENT_ID`.
5. Click **+ Create Credentials → OAuth client ID → Android**. You'll need your app's SHA-1 fingerprint — for a dev/Expo Go build, run `eas credentials` (if using EAS) or check Expo's docs for `expo fetch:android:hashes`. Package name should match `android.package` in `app.json`. Copy the client ID into `GOOGLE_ANDROID_CLIENT_ID`.
6. Save `src/firebase/googleAuthConfig.ts`, then `npm install` to pull in the new packages (`expo-auth-session`, `expo-web-browser`, `expo-crypto`).

**Heads up:** this is the single fiddliest part of the whole backend. If Google Sign-In fails with a redirect/mismatch error, it's almost always because a client ID is either the wrong platform or the bundle ID/package name/SHA-1 doesn't match exactly what's registered. Test on web first (`expo start --web`) since that's the client ID least likely to need extra fingerprint setup.


- **Firebase**: `firebase` is in `package.json` but not initialized. Add your
  config and set up Auth + Firestore before screens can persist real data.
- **AI Assistant**: the chat UI is static. Route messages through a Firebase
  Cloud Function that calls the OpenAI API server-side — never call OpenAI
  directly from the client, or your API key ships inside the app.
- **Navigation icons**: using emoji as placeholders. Swap in a proper icon
  set (e.g. `lucide-react-native`) once the visual style is finalized.
- **Fonts**: the website uses Fraunces + Inter. Load them with `expo-font`
  if you want the app typography to match exactly.
