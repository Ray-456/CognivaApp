import { useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID } from './googleAuthConfig';
import { useAuth } from './AuthContext';

WebBrowser.maybeCompleteAuthSession();

/**
 * Shared Google sign-in hook. Returns `promptGoogleSignIn` — call it from a
 * button's onPress. Handles the OAuth round-trip and hands the resulting
 * ID token to AuthContext, which signs the user into Firebase with it.
 */
export function useGoogleSignIn() {
  const { signInWithGoogleIdToken } = useAuth();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params.id_token ?? response.authentication?.idToken;
      if (idToken) signInWithGoogleIdToken(idToken);
    }
  }, [response]);

  const promptGoogleSignIn = () => promptAsync();

  return { promptGoogleSignIn, requestReady: !!request };
}
