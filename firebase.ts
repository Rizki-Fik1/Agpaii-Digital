// Import the functions you need from the SDKs you need
import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// NOTE: All values must be set in .env file or Vercel environment variables
const firebaseEnv = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
	measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = [
	firebaseEnv.apiKey,
	firebaseEnv.authDomain,
	firebaseEnv.projectId,
	firebaseEnv.storageBucket,
	firebaseEnv.messagingSenderId,
	firebaseEnv.appId,
].every(Boolean);

const firebaseConfig = isFirebaseConfigured
	? {
			apiKey: firebaseEnv.apiKey as string,
			authDomain: firebaseEnv.authDomain as string,
			projectId: firebaseEnv.projectId as string,
			storageBucket: firebaseEnv.storageBucket as string,
			messagingSenderId: firebaseEnv.messagingSenderId as string,
			appId: firebaseEnv.appId as string,
			measurementId: firebaseEnv.measurementId,
		}
	: null;

// Initialize Firebase only when env config is complete.
export const app: FirebaseApp | null = firebaseConfig
	? (getApps()[0] ?? initializeApp(firebaseConfig))
	: null;

// Export Firestore instance when Firebase is available.
export const db: Firestore | null = app ? getFirestore(app) : null;
