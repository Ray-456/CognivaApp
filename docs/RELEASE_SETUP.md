# Release Setup

## Google Sign-In

Create one OAuth 2.0 Client ID for each platform in Google Cloud Console:

- Web application
- Android application
- iOS application

Enable the Google provider in Firebase Console under Authentication > Sign-in method.
For Android, register the package name from `app.json` and the SHA-1 fingerprint for the signing keystore. For iOS, register the bundle identifier from `app.json`.

Add the resulting IDs to the local `.env` file:

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
```

Restart Expo after changing `.env`. The Google buttons remain unavailable until all three IDs are present.

## Verification Email

Firebase manages the verification email outside the mobile app. Configure it in Firebase Console:

1. Open Authentication > Templates.
2. Select Email address verification.
3. Set the sender name to `Cogniva++`.
4. Add the Cogniva++ logo or brand mark where supported.
5. Use a concise subject such as `Verify your Cogniva++ email`.
6. Keep the action link prominent and make the support or reply-to address a monitored address.
7. Save and send a test email.

The app-side verification flow is in `src/screens/VerifyEmailScreen.tsx`: users can resend the email and refresh their verification status without restarting the app.

## Firebase Deployment

Deploy rules from the project directory after authenticating with the Firebase CLI:

```bash
firebase login
firebase use cogniva-001
firebase deploy --only firestore:rules,storage
```

Do not commit `.env`; commit only `.env.example` with placeholder values.
