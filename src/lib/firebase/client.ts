import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;

function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (_auth) return _auth;
  _auth = getAuth(getFirebaseApp());
  // In dev, disable app verification so Firebase test phone numbers work without reCAPTCHA
  if (process.env.NODE_ENV === 'development') {
    // @ts-ignore — Firebase internal setting for test phone numbers
    _auth.settings.appVerificationDisabledForTesting = true;
  }
  return _auth;
}

// Backward compat — lazy getter
export const auth = new Proxy({} as Auth, {
  get(_, prop) {
    return (getFirebaseAuth() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export async function signInWithGoogle(): Promise<string> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user.getIdToken();
}
