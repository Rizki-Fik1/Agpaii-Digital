// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAsHbcf6tPycRNNITwrRL7ZX8PcPrsCkzc",
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "agpaii-digital.firebaseapp.com",
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "agpaii-digital",
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "agpaii-digital.firebasestorage.app",
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "879665611170",
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:879665611170:web:cd16ec97d93234632432fb",
	measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-6MTB31ZE0G",
};

// Initialize Firebase
// Initialize Firebase if it hasn't been initialized yet
export const app = initializeApp(firebaseConfig);

// Export Firestore instance
export const db = getFirestore(app);
